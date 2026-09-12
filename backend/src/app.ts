import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { prisma } from './lib/prisma.js';
import { authenticate, hashPassword, signToken, verifyPassword } from './auth.js';
import { audit } from './lib/mongo.js';
import { cacheDelete, cacheGet, cacheSet } from './lib/redis.js';
import { publishEvent } from './lib/rabbitmq.js';
import { bootstrapSchema, chargeSchema, incidentSchema, loginSchema, noticeSchema, reservationSchema } from './validation.js';

export function buildApp() {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: true });
  app.register(swagger, { openapi: { info: { title: 'Axis Condomínio API', description: 'API de gestão condominial', version: '1.1.0' }, tags: [{ name: 'auth' }, { name: 'condominiums' }, { name: 'reservations' }, { name: 'finance' }] } });
  app.register(swaggerUi, { routePrefix: '/docs' });

  app.get('/health', async () => ({ status: 'ok', service: 'axis-condominio-api' }));
  app.get('/health/db', async () => { await prisma.$queryRaw`SELECT 1`; return { status: 'ok', database: 'postgresql' }; });

  app.post('/auth/bootstrap', async (request, reply) => {
    const parsed = bootstrapSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten() });
    const { condominium: c, admin } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    if (existing) return reply.code(409).send({ message: 'E-mail já cadastrado' });
    const passwordHash = await hashPassword(admin.password);
    const result = await prisma.$transaction(async tx => {
      const condominium = await tx.condominium.create({ data: c });
      const user = await tx.user.create({ data: { name: admin.name, email: admin.email, passwordHash, role: 'ADMIN', condominiumId: condominium.id } });
      return { condominium, user };
    });
    await audit({ action: 'AUTH_BOOTSTRAP', entity: 'User', entityId: result.user.id, userId: result.user.id, condominiumId: result.condominium.id });
    return reply.code(201).send({ user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role }, token: signToken({ id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role, condominiumId: result.condominium.id }) });
  });

  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten() });
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return reply.code(401).send({ message: 'E-mail ou senha inválidos' });
    const authUser = { id: user.id, name: user.name, email: user.email, role: user.role, condominiumId: user.condominiumId } as const;
    return { user: authUser, token: signToken(authUser) };
  });

  app.get('/auth/me', async (request, reply) => {
    const user = await authenticate(request.headers.authorization);
    if (!user) return reply.code(401).send({ message: 'Não autenticado' });
    return user;
  });

  app.register(async api => {
    api.addHook('preHandler', async (request, reply) => {
      const user = await authenticate(request.headers.authorization);
      if (!user) return reply.code(401).send({ message: 'Não autenticado' });
      (request as any).user = user;
    });

    api.get('/dashboard', async request => {
      const user = (request as any).user;
      const cacheKey = `dashboard:${user.condominiumId}`;
      const cached = await cacheGet<unknown>(cacheKey);
      if (cached) return cached;
      const [blocks, units, residents, openIncidents, pendingCharges, upcomingReservations] = await Promise.all([
        prisma.block.count({ where: { condominiumId: user.condominiumId } }),
        prisma.unit.count({ where: { block: { condominiumId: user.condominiumId } } }),
        prisma.resident.count({ where: { unit: { block: { condominiumId: user.condominiumId } } } }),
        prisma.incident.count({ where: { condominiumId: user.condominiumId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        prisma.charge.count({ where: { condominiumId: user.condominiumId, paidAt: null } }),
        prisma.reservation.count({ where: { condominiumId: user.condominiumId, startAt: { gte: new Date() }, status: { not: 'CANCELLED' } } })
      ]);
      const data = { condominiumId: user.condominiumId, blocks, units, residents, openIncidents, pendingCharges, upcomingReservations };
      await cacheSet(cacheKey, data, 30);
      return data;
    });

    api.post('/condominiums', async (request, reply) => {
      if (!['ADMIN', 'MANAGER'].includes((request as any).user.role)) return reply.code(403).send({ message: 'Sem permissão' });
      const body = request.body as { name: string; document?: string; address?: string; email?: string; phone?: string };
      if (!body.name?.trim()) return reply.code(400).send({ message: 'name is required' });
      const condominium = await prisma.condominium.create({ data: body });
      return reply.code(201).send(condominium);
    });

    api.get('/condominiums', async request => {
      const user = (request as any).user;
      return prisma.condominium.findMany({ where: { id: user.condominiumId }, orderBy: { createdAt: 'desc' } });
    });

    api.get('/condominiums/:id', async (request, reply) => {
      const user = (request as any).user; const { id } = request.params as { id: string };
      if (id !== user.condominiumId) return reply.code(403).send({ message: 'Sem permissão' });
      const cached = await cacheGet<unknown>(`condominium:${id}`); if (cached) return cached;
      const condominium = await prisma.condominium.findUnique({ where: { id }, include: { blocks: { include: { units: { include: { residents: true } } } } } });
      if (!condominium) return reply.code(404).send({ message: 'Condominium not found' });
      await cacheSet(`condominium:${id}`, condominium, 60); return condominium;
    });

    api.post('/condominiums/:condominiumId/blocks', async (request, reply) => {
      const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; const { name } = request.body as { name: string };
      if (condominiumId !== user.condominiumId || !['ADMIN', 'MANAGER'].includes(user.role)) return reply.code(403).send({ message: 'Sem permissão' });
      const block = await prisma.block.create({ data: { name, condominiumId } }); await cacheDelete(`condominium:${condominiumId}`); return reply.code(201).send(block);
    });

    api.post('/blocks/:blockId/units', async (request, reply) => {
      const user = (request as any).user; const { blockId } = request.params as { blockId: string }; const block = await prisma.block.findUnique({ where: { id: blockId } });
      if (!block || block.condominiumId !== user.condominiumId || !['ADMIN', 'MANAGER'].includes(user.role)) return reply.code(403).send({ message: 'Sem permissão' });
      const body = request.body as { number: string; floor?: number }; const unit = await prisma.unit.create({ data: { ...body, blockId } }); await cacheDelete(`condominium:${user.condominiumId}`); return reply.code(201).send(unit);
    });

    api.post('/units/:unitId/residents', async (request, reply) => {
      const user = (request as any).user; const { unitId } = request.params as { unitId: string }; const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { block: true } });
      if (!unit || unit.block.condominiumId !== user.condominiumId || !['ADMIN', 'MANAGER'].includes(user.role)) return reply.code(403).send({ message: 'Sem permissão' });
      const body = request.body as { name: string; email?: string; phone?: string; document?: string }; const resident = await prisma.resident.create({ data: { ...body, unitId } }); await cacheDelete(`condominium:${user.condominiumId}`); return reply.code(201).send(resident);
    });

    api.get('/condominiums/:condominiumId/notices', async (request, reply) => { const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; if (condominiumId !== user.condominiumId) return reply.code(403).send({ message: 'Sem permissão' }); return prisma.notice.findMany({ where: { condominiumId }, orderBy: { createdAt: 'desc' } }); });
    api.post('/condominiums/:condominiumId/notices', async (request, reply) => { const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; if (condominiumId !== user.condominiumId || !['ADMIN','MANAGER'].includes(user.role)) return reply.code(403).send({ message: 'Sem permissão' }); const parsed = noticeSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten() }); const notice = await prisma.notice.create({ data: { ...parsed.data, condominiumId } }); await publishEvent('notice.created', { noticeId: notice.id, condominiumId }); await audit({ action: 'NOTICE_CREATED', entity: 'Notice', entityId: notice.id, userId: user.id, condominiumId }); return reply.code(201).send(notice); });

    api.get('/condominiums/:condominiumId/incidents', async (request, reply) => { const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; if (condominiumId !== user.condominiumId) return reply.code(403).send({ message: 'Sem permissão' }); return prisma.incident.findMany({ where: { condominiumId }, orderBy: { createdAt: 'desc' } }); });
    api.post('/condominiums/:condominiumId/incidents', async (request, reply) => { const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; if (condominiumId !== user.condominiumId) return reply.code(403).send({ message: 'Sem permissão' }); const parsed = incidentSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten() }); const incident = await prisma.incident.create({ data: { ...parsed.data, condominiumId } }); await publishEvent('incident.created', { incidentId: incident.id, condominiumId }); await audit({ action: 'INCIDENT_CREATED', entity: 'Incident', entityId: incident.id, userId: user.id, condominiumId }); return reply.code(201).send(incident); });

    api.get('/condominiums/:condominiumId/charges', async (request, reply) => { const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; if (condominiumId !== user.condominiumId) return reply.code(403).send({ message: 'Sem permissão' }); return prisma.charge.findMany({ where: { condominiumId }, include: { unit: true }, orderBy: { dueDate: 'desc' } }); });
    api.post('/condominiums/:condominiumId/charges', async (request, reply) => { const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; if (condominiumId !== user.condominiumId || !['ADMIN','MANAGER'].includes(user.role)) return reply.code(403).send({ message: 'Sem permissão' }); const parsed = chargeSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten() }); const unit = await prisma.unit.findUnique({ where: { id: parsed.data.unitId }, include: { block: true } }); if (!unit || unit.block.condominiumId !== condominiumId) return reply.code(400).send({ message: 'Unidade inválida' }); const charge = await prisma.charge.create({ data: { description: parsed.data.description, amount: parsed.data.amount, dueDate: parsed.data.dueDate, unitId: parsed.data.unitId, condominiumId } }); await publishEvent('charge.created', { chargeId: charge.id, condominiumId }); return reply.code(201).send(charge); });

    api.get('/condominiums/:condominiumId/reservations', async (request, reply) => { const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; if (condominiumId !== user.condominiumId) return reply.code(403).send({ message: 'Sem permissão' }); return prisma.reservation.findMany({ where: { condominiumId }, orderBy: { startAt: 'asc' } }); });
    api.post('/condominiums/:condominiumId/reservations', async (request, reply) => {
      const user = (request as any).user; const { condominiumId } = request.params as { condominiumId: string }; if (condominiumId !== user.condominiumId) return reply.code(403).send({ message: 'Sem permissão' });
      const parsed = reservationSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos', errors: parsed.error.flatten() });
      const conflict = await prisma.reservation.findFirst({ where: { condominiumId, area: parsed.data.area, status: { not: 'CANCELLED' }, startAt: { lt: parsed.data.endAt }, endAt: { gt: parsed.data.startAt } } });
      if (conflict) return reply.code(409).send({ message: 'Já existe uma reserva conflitante para esta área e horário', conflictId: conflict.id });
      const reservation = await prisma.reservation.create({ data: { ...parsed.data, condominiumId, status: user.role === 'RESIDENT' ? 'PENDING' : 'CONFIRMED' } }); await publishEvent('reservation.created', { reservationId: reservation.id, condominiumId }); await audit({ action: 'RESERVATION_CREATED', entity: 'Reservation', entityId: reservation.id, userId: user.id, condominiumId }); return reply.code(201).send(reservation);
    });
    api.patch('/reservations/:id/status', async (request, reply) => { const user = (request as any).user; const { id } = request.params as { id: string }; const { status } = request.body as { status: 'PENDING'|'CONFIRMED'|'CANCELLED' }; const reservation = await prisma.reservation.findUnique({ where: { id } }); if (!reservation || reservation.condominiumId !== user.condominiumId) return reply.code(404).send({ message: 'Reserva não encontrada' }); if (user.role === 'RESIDENT' && status === 'CONFIRMED') return reply.code(403).send({ message: 'Morador não pode confirmar reserva' }); const updated = await prisma.reservation.update({ where: { id }, data: { status } }); await audit({ action: 'RESERVATION_STATUS_CHANGED', entity: 'Reservation', entityId: id, userId: user.id, condominiumId: user.condominiumId, metadata: { status } }); return updated; });
  });
  return app;
}
