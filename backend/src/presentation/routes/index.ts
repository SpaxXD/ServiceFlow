import Fastify from 'fastify';
import { authRoutes } from './authRoutes';
import { clientRoutes } from './clientRoutes';
import { serviceRoutes } from './serviceRoutes';
import { errorHandler } from '../middlewares/auth';

export async function createServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Register error handler
  fastify.setErrorHandler(errorHandler);

  // Register routes
  await fastify.register(authRoutes);
  await fastify.register(clientRoutes);
  await fastify.register(serviceRoutes);

  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });

  return fastify;
}
