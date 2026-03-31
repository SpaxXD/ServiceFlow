import { FastifyInstance } from 'fastify';
import { ServiceController } from '../controllers/ServiceController';
import { ServiceUseCase } from '../../application/use-cases/ServiceUseCase';
import { ServiceRepository } from '../../infra/repositories/ServiceRepository';
import { ClientRepository } from '../../infra/repositories/ClientRepository';
import { AuditLogRepository } from '../../infra/repositories/AuditLogRepository';
import { authMiddleware } from '../middlewares/auth';

export async function serviceRoutes(fastify: FastifyInstance) {
  const serviceRepository = new ServiceRepository();
  const clientRepository = new ClientRepository();
  const auditLogRepository = new AuditLogRepository();
  const serviceUseCase = new ServiceUseCase(serviceRepository, clientRepository, auditLogRepository);
  const serviceController = new ServiceController(serviceUseCase);

  // Protected routes
  fastify.post(
    '/services',
    { onRequest: authMiddleware },
    (request, reply) => serviceController.create(request, reply),
  );

  fastify.get(
    '/services',
    { onRequest: authMiddleware },
    (request, reply) => serviceController.list(request, reply),
  );

  fastify.get(
    '/services/dashboard/metrics',
    { onRequest: authMiddleware },
    (request, reply) => serviceController.getDashboard(request, reply),
  );

  fastify.get(
    '/services/:id',
    { onRequest: authMiddleware },
    (request, reply) => serviceController.getById(request, reply),
  );

  fastify.put(
    '/services/:id',
    { onRequest: authMiddleware },
    (request, reply) => serviceController.update(request, reply),
  );

  fastify.delete(
    '/services/:id',
    { onRequest: authMiddleware },
    (request, reply) => serviceController.delete(request, reply),
  );
}
