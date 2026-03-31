import { FastifyRequest, FastifyReply } from 'fastify';
import { ClientUseCase } from '../../application/use-cases/ClientUseCase';
import { CreateClientDTO, UpdateClientDTO } from '../../application/dtos/ClientDTO';
import { z } from 'zod';
import { UserEntity } from '../../domain/entities/User';

const CreateClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const UpdateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export class ClientController {
  constructor(private clientUseCase: ClientUseCase) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = CreateClientSchema.parse(request.body);
    const user = new UserEntity({
      id: request.user?.sub || '',
      email: request.user?.email || '',
      password: '',
      role: request.user?.role as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await this.clientUseCase.createClient(body as CreateClientDTO, request.user?.sub || '', user);
    return reply.status(201).send(result);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = UpdateClientSchema.parse(request.body);
    const user = new UserEntity({
      id: request.user?.sub || '',
      email: request.user?.email || '',
      password: '',
      role: request.user?.role as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await this.clientUseCase.updateClient(id, body as UpdateClientDTO, request.user?.sub || '', user);
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

    await this.clientUseCase.deleteClient(id, request.user?.sub || '', user);
    return reply.status(204).send();
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.clientUseCase.getClient(id);
    return reply.status(200).send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { page = 1, pageSize = 10, search } = request.query as {
      page?: string;
      pageSize?: string;
      search?: string;
    };

    const result = await this.clientUseCase.listClients(parseInt(page) || 1, parseInt(pageSize) || 10, search);
    return reply.status(200).send(result);
  }
}
