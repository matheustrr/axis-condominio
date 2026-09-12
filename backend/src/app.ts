import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { prisma } from './lib/prisma.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(swagger, {
    openapi: {
      info: {
        title: 'Administração de Condomínio API',
        description: 'API de gestão condominial',
        version: '1.0.0'
      }
    }
  });
  app.register(swaggerUi, { routePrefix: '/docs' });

  app.get('/health', async () => ({ status: 'ok', service: 'axis-condominio-api' }));

  app.get('/health/db', async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'postgresql' };
  });

  app.register(async (api) => {
    api.post('/condominiums', async (request, reply) => {
      const body = request.body as { name: string; document?: string; address?: string; email?: string; phone?: string };
      if (!body.name?.trim()) return reply.code(400).send({ message: 'name is required' });
      const condominium = await prisma.condominium.create({ data: body });
      return reply.code(201).send(condominium);
    });

    api.get('/condominiums', async () => prisma.condominium.findMany({ orderBy: { createdAt: 'desc' } }));

    api.get('/condominiums/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      const condominium = await prisma.condominium.findUnique({
        where: { id },
        include: { blocks: { include: { units: true } } }
      });
      if (!condominium) return reply.code(404).send({ message: 'Condominium not found' });
      return condominium;
    });

    api.patch('/condominiums/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as Partial<{ name: string; document: string; address: string; email: string; phone: string }>;
      try {
        return await prisma.condominium.update({ where: { id }, data: body });
      } catch {
        return reply.code(404).send({ message: 'Condominium not found' });
      }
    });

    api.delete('/condominiums/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        await prisma.condominium.delete({ where: { id } });
        return reply.code(204).send();
      } catch {
        return reply.code(404).send({ message: 'Condominium not found' });
      }
    });

    api.post('/condominiums/:condominiumId/blocks', async (request, reply) => {
      const { condominiumId } = request.params as { condominiumId: string };
      const { name } = request.body as { name: string };
      const block = await prisma.block.create({ data: { name, condominiumId } });
      return reply.code(201).send(block);
    });

    api.post('/blocks/:blockId/units', async (request, reply) => {
      const { blockId } = request.params as { blockId: string };
      const body = request.body as { number: string; floor?: number };
      const unit = await prisma.unit.create({ data: { ...body, blockId } });
      return reply.code(201).send(unit);
    });

    api.post('/units/:unitId/residents', async (request, reply) => {
      const { unitId } = request.params as { unitId: string };
      const body = request.body as { name: string; email?: string; phone?: string; document?: string };
      const resident = await prisma.resident.create({ data: { ...body, unitId } });
      return reply.code(201).send(resident);
    });

    api.get('/condominiums/:condominiumId/notices', async (request) => {
      const { condominiumId } = request.params as { condominiumId: string };
      return prisma.notice.findMany({ where: { condominiumId }, orderBy: { createdAt: 'desc' } });
    });

    api.post('/condominiums/:condominiumId/notices', async (request, reply) => {
      const { condominiumId } = request.params as { condominiumId: string };
      const body = request.body as { title: string; content: string; publishedAt?: string };
      const notice = await prisma.notice.create({ data: { ...body, condominiumId, publishedAt: body.publishedAt ? new Date(body.publishedAt) : null } });
      return reply.code(201).send(notice);
    });

    api.get('/condominiums/:condominiumId/incidents', async (request) => {
      const { condominiumId } = request.params as { condominiumId: string };
      return prisma.incident.findMany({ where: { condominiumId }, orderBy: { createdAt: 'desc' } });
    });

    api.post('/condominiums/:condominiumId/incidents', async (request, reply) => {
      const { condominiumId } = request.params as { condominiumId: string };
      const body = request.body as { title: string; description: string };
      const incident = await prisma.incident.create({ data: { ...body, condominiumId } });
      return reply.code(201).send(incident);
    });

    api.get('/condominiums/:condominiumId/charges', async (request) => {
      const { condominiumId } = request.params as { condominiumId: string };
      return prisma.charge.findMany({ where: { condominiumId }, include: { unit: true }, orderBy: { dueDate: 'desc' } });
    });
  });

  return app;
}
