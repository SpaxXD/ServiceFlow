import { prisma } from '../database/connection';
import { IClientRepository } from '../../domain/repositories/IClientRepository';
import { Client } from '../../domain/entities/Client';

export class ClientRepository implements IClientRepository {
  async create(client: Client): Promise<Client> {
    return await prisma.client.create({
      data: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
    });
  }

  async findById(id: string): Promise<Client | null> {
    return await prisma.client.findUnique({
      where: { id },
    });
  }

  async update(id: string, client: Partial<Client>): Promise<Client> {
    return await prisma.client.update({
      where: { id },
      data: client,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.client.delete({
      where: { id },
    });
  }

  async list(page: number, pageSize: number, search?: string): Promise<{ data: Client[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const whereClause = search
      ? {
          OR: [{ name: { contains: search, mode: 'insensitive' as any } }, { email: { contains: search, mode: 'insensitive' as any } }],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({
        where: whereClause,
      }),
    ]);

    return { data, total };
  }

  async findByEmail(email: string): Promise<Client | null> {
    return await prisma.client.findUnique({
      where: { email },
    });
  }
}
