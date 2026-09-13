import { buildApp } from './app.js';
import { authenticate } from './auth.js';
import { registerResidentRoutes } from './modules/residents/routes.js';

const app = buildApp();
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

app.addHook('preHandler', async (request, reply) => {
  if (request.url.startsWith('/health') || request.url.startsWith('/docs') || request.url.startsWith('/auth/')) return;
  const user = await authenticate(request.headers.authorization);
  if (!user) return reply.code(401).send({ message: 'Não autenticado' });
  (request as any).user = user;
});

await registerResidentRoutes(app);

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
