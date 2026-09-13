import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { cacheDelete } from '../../lib/redis.js';
import { audit } from '../../lib/mongo.js';

export async function registerResidentRoutes(app: FastifyInstance) {
  app.get('/condominiums/:condominiumId/residents', async (request, reply) => {
    const user = (request as any).user;
    const { condominiumId } = request.params as { condominiumId: string };
    if (condominiumId !== user.condominiumId) return reply.code(403).send({ message: 'Sem permissão' });

    const residents = await prisma.resident.findMany({
      where: { unit: { block: { condominiumId } } },
      include: { unit: { include: { block: true } }, user: { select: { id: true, role: true } } },
      orderBy: { name: 'asc' },
    });
    return residents;
  });

  app.post('/units/:unitId/residents', async (request, reply) => {
    const user = (request as any).user;
    if (!['ADMIN', 'MANAGER'].includes(user.role)) return reply.code(403).send({ message: 'Sem permissão' });
    const { unitId } = request.params as { unitId: string };
    const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { block: true } });
    if (!unit || unit.block.condominiumId !== user.condominiumId) return reply.code(404).send({ message: 'Unidade não encontrada' });

    const body = request.body as { name?: string; email?: string; phone?: string; document?: string };
    if (!body.name?.trim()) return reply.code(400).send({ message: 'Nome é obrigatório' });
    const resident = await prisma.resident.create({ data: { name: body.name.trim(), email: body.email?.trim() || null, phone: body.phone?.trim() || null, document: body.document?.trim() || null, unitId } });
    await cacheDelete(`condominium:${user.condominiumId}`);
    await audit({ action: 'RESIDENT_CREATED', entity: 'Resident', entityId: resident.id, userId: user.id, condominiumId: user.condominiumId });
    return reply.code(201).send(resident);
  });

  app.patch('/residents/:id', async (request, reply) => {
    const user = (request as any).user;
    if (!['ADMIN', 'MANAGER'].includes(user.role)) return reply.code(403).send({ message: 'Sem permissão' });
    const { id } = request.params as { id: string };
    const resident = await prisma.resident.findUnique({ where: { id }, include: { unit: { include: { block: true } } } });
    if (!resident || resident.unit.block.condominiumId !== user.condominiumId) return reply.code(404).send({ message: 'Morador não encontrado' });
    const body = request.body as { name?: string; email?: string; phone?: string; document?: string; unitId?: string };
    let unitId = resident.unitId;
    if (body.unitId && body.unitId !== resident.unitId) {
      const unit = await prisma.unit.findUnique({ where: { id: body.unitId }, include: { block: true } });
      if (!unit || unit.block.condominiumId !== user.condominiumId) return reply.code(400).send({ message: 'Unidade inválida' });
      unitId = body.unitId;
    }
    const updated = await prisma.resident.update({ where: { id }, data: { name: body.name?.trim(), email: body.email?.trim() || null, phone: body.phone?.trim() || null, document: body.document?.trim() || null, unitId } });
    await cacheDelete(`condominium:${user.condominiumId}`);
    await audit({ action: 'RESIDENT_UPDATED', entity: 'Resident', entityId: id, userId: user.id, condominiumId: user.condominiumId });
    return updated;
  });

  app.delete('/residents/:id', async (request, reply) => {
    const user = (request as any).user;
    if (!['ADMIN', 'MANAGER'].includes(user.role)) return reply.code(403).send({ message: 'Sem permissão' });
    const { id } = request.params as { id: string };
    const resident = await prisma.resident.findUnique({ where: { id }, include: { unit: { include: { block: true } } } });
    if (!resident || resident.unit.block.condominiumId !== user.condominiumId) return reply.code(404).send({ message: 'Morador não encontrado' });
    await prisma.resident.delete({ where: { id } });
    await cacheDelete(`condominium:${user.condominiumId}`);
    await audit({ action: 'RESIDENT_DELETED', entity: 'Resident', entityId: id, userId: user.id, condominiumId: user.condominiumId });
    return { success: true };
  });
}
