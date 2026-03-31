import { FastifyRequest, FastifyReply } from 'fastify';
import { ServiceUseCase } from '../../application/use-cases/ServiceUseCase';
import { CreateServiceDTO, UpdateServiceDTO } from '../../application/dtos/ServiceDTO';
import { z } from 'zod';
import { UserEntity } from '../../domain/entities/User';
import { ServiceStatus } from '../../domain/entities/Service';

const CreateServiceSchema = z.object({
  clientId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  value: z.number().positive(),
});

const UpdateServiceSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  value: z.number().positive().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});

export class ServiceController {
  constructor(private serviceUseCase: ServiceUseCase) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = CreateServiceSchema.parse(request.body);
    const user = new UserEntity({
      id: request.user?.sub || '',
      email: request.user?.email || '',
      password: '',
      role: request.user?.role as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await this.serviceUseCase.createService(body as CreateServiceDTO, request.user?.sub || '', user);
    return reply.status(201).send(result);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = UpdateServiceSchema.parse(request.body);
    const user = new UserEntity({
      id: request.user?.sub || '',
      email: request.user?.email || '',
      password: '',
      role: request.user?.role as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await this.serviceUseCase.updateService(id, body as UpdateServiceDTO, request.user?.sub || '', user);
    return reply.status(200).send(result);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = new UserEntity({
      id: request.user?.sub || '',
      email: request.user?.email || '',
      password: '',
      role: request.user?.role as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.serviceUseCase.deleteService(id, request.user?.sub || '', user);
    return reply.status(204).send();
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.serviceUseCase.getService(id);
    return reply.status(200).send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { page = 1, pageSize = 10, clientId, status, search } = request.query as {
      page?: string;
      pageSize?: string;
      clientId?: string;
      status?: ServiceStatus;
      search?: string;
    };

    const result = await this.serviceUseCase.listServices(
      parseInt(page) || 1,
      parseInt(pageSize) || 10,
      clientId,
      status,
      search,
    );
    return reply.status(200).send(result);
  }

  async getDashboard(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.serviceUseCase.getDashboardMetrics();
    return reply.status(200).send(result);
  }
}
