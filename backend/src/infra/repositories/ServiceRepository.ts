import { prisma } from '../database/connection';
import { IServiceRepository } from '../../domain/repositories/IServiceRepository';
import { Service, ServiceStatus } from '../../domain/entities/Service';

export class ServiceRepository implements IServiceRepository {
  async create(service: Service): Promise<Service> {
    return await prisma.service.create({
      data: {
        id: service.id,
        clientId: service.clientId,
        title: service.title,
        description: service.description,
        value: service.value,
        status: service.status,
      },
    });
  }

  async findById(id: string): Promise<Service | null> {
    return await prisma.service.findUnique({
      where: { id },
    });
  }

  async update(id: string, service: Partial<Service>): Promise<Service> {
    return await prisma.service.update({
      where: { id },
      data: service,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.service.delete({
      where: { id },
    });
  }

  async list(
    page: number,
    pageSize: number,
    filters?: {
      clientId?: string;
      status?: ServiceStatus;
      search?: string;
    },
  ): Promise<{ data: Service[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const whereClause: any = {};

    if (filters?.clientId) {
      whereClause.clientId = filters.clientId;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.search) {
      whereClause.OR = [{ title: { contains: filters.search, mode: 'insensitive' as any } }, { description: { contains: filters.search, mode: 'insensitive' as any } }];
    }

    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.service.count({
        where: whereClause,
      }),
    ]);

    return { data, total };
  }

  async findByClientId(clientId: string): Promise<Service[]> {
    return await prisma.service.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByStatus(status: ServiceStatus): Promise<number> {
    return await prisma.service.count({
      where: { status },
    });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await prisma.service.aggregate({
      _sum: {
        value: true,
      },
    });

    return result._sum.value || 0;
  }
}
