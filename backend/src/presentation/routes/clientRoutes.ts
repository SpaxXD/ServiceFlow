import { FastifyInstance } from 'fastify';
import { ClientController } from '../controllers/ClientController';
import { ClientUseCase } from '../../application/use-cases/ClientUseCase';
import { ClientRepository } from '../../infra/repositories/ClientRepository';
import { AuditLogRepository } from '../../infra/repositories/AuditLogRepository';
import { authMiddleware } from '../middlewares/auth';

export async function clientRoutes(fastify: FastifyInstance) {
  const clientRepository = new ClientRepository();
  const auditLogRepository = new AuditLogRepository();
  const clientUseCase = new ClientUseCase(clientRepository, auditLogRepository);
  const clientController = new ClientController(clientUseCase);

  // Protected routes
  fastify.post(
    '/clients',
    { onRequest: authMiddleware },
    (request, reply) => clientController.create(request, reply),
  );

  fastify.get(
    '/clients',
    { onRequest: authMiddleware },
    (request, reply) => clientController.list(request, reply),
  );

  fastify.get(
    '/clients/:id',
    { onRequest: authMiddleware },
    (request, reply) => clientController.getById(request, reply),
  );

  fastify.put(
    '/clients/:id',
    { onRequest: authMiddleware },
    (request, reply) => clientController.update(request, reply),
  );

  fastify.delete(
    '/clients/:id',
    { onRequest: authMiddleware },
    (request, reply) => clientController.delete(request, reply),
  );
}
