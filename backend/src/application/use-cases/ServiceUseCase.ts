import { IServiceRepository } from '../../domain/repositories/IServiceRepository';
import { IClientRepository } from '../../domain/repositories/IClientRepository';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';
import { CreateServiceDTO, UpdateServiceDTO, ServiceResponseDTO, ListServicesResponseDTO, DashboardMetricsDTO } from '../dtos/ServiceDTO';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { ServiceEntity, ServiceStatus } from '../../domain/entities/Service';
import { AuditLogEntity, AuditAction } from '../../domain/entities/AuditLog';
import { generateUUID } from '../../shared/utils/helpers';
import { UserEntity } from '../../domain/entities/User';

export class ServiceUseCase {
  constructor(
    private serviceRepository: IServiceRepository,
    private clientRepository: IClientRepository,
    private auditLogRepository: IAuditLogRepository,
  ) {}

  async createService(dto: CreateServiceDTO, userId: string, user: UserEntity): Promise<ServiceResponseDTO> {
    if (!user.canEdit()) {
      throw new ForbiddenError('You do not have permission to create services');
    }

    const client = await this.clientRepository.findById(dto.clientId);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    const service = new ServiceEntity({
      id: generateUUID(),
      clientId: dto.clientId,
      title: dto.title,
      description: dto.description,
      value: dto.value,
      status: ServiceStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!service.isValid()) {
      throw new ValidationError('Invalid service data');
    }

    const createdService = await this.serviceRepository.create(service);

    await this.auditLogRepository.create(
      new AuditLogEntity({
        id: generateUUID(),
        userId,
        entityType: 'Service',
        entityId: createdService.id,
        action: AuditAction.CREATE,
        oldValues: {},
        newValues: {
          title: createdService.title,
          value: createdService.value,
          clientId: createdService.clientId,
        },
        createdAt: new Date(),
      }),
    );

    return this.mapToResponseDTO(createdService);
  }

  async updateService(id: string, dto: UpdateServiceDTO, userId: string, user: UserEntity): Promise<ServiceResponseDTO> {
    if (!user.canEdit()) {
      throw new ForbiddenError('You do not have permission to update services');
    }

    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    const oldValues = { ...service };
    const updatedService = await this.serviceRepository.update(id, dto);

    await this.auditLogRepository.create(
      new AuditLogEntity({
        id: generateUUID(),
        userId,
        entityType: 'Service',
        entityId: id,
        action: AuditAction.UPDATE,
        oldValues,
        newValues: dto,
        createdAt: new Date(),
      }),
    );

    return this.mapToResponseDTO(updatedService);
  }

  async deleteService(id: string, userId: string, user: UserEntity): Promise<void> {
    if (!user.canDelete()) {
      throw new ForbiddenError('You do not have permission to delete services');
    }

    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    await this.serviceRepository.delete(id);

    await this.auditLogRepository.create(
      new AuditLogEntity({
        id: generateUUID(),
        userId,
        entityType: 'Service',
        entityId: id,
        action: AuditAction.DELETE,
        oldValues: service,
        newValues: {},
        createdAt: new Date(),
      }),
    );
  }

  async getService(id: string): Promise<ServiceResponseDTO> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    return this.mapToResponseDTO(service);
  }

  async listServices(page: number, pageSize: number, clientId?: string, status?: ServiceStatus, search?: string): Promise<ListServicesResponseDTO> {
    const { data, total } = await this.serviceRepository.list(page, pageSize, {
      clientId,
      status,
      search,
    });

    return {
      data: data.map((service) => this.mapToResponseDTO(service)),
      total,
      page,
      pageSize,
    };
  }

  async getDashboardMetrics(): Promise<DashboardMetricsDTO> {
    const { total: totalClients } = await this.clientRepository.list(1, 1);
    const { total: totalServices } = await this.serviceRepository.list(1, 1);
    
    const pendingCount = await this.serviceRepository.countByStatus(ServiceStatus.PENDING);
    const inProgressCount = await this.serviceRepository.countByStatus(ServiceStatus.IN_PROGRESS);
    const completedCount = await this.serviceRepository.countByStatus(ServiceStatus.COMPLETED);
    
    const totalRevenue = await this.serviceRepository.getTotalRevenue();

    return {
      totalClients,
      totalServices,
      servicesByStatus: {
        pending: pendingCount,
        in_progress: inProgressCount,
        completed: completedCount,
      },
      totalRevenue,
    };
  }

  private mapToResponseDTO(service: any): ServiceResponseDTO {
    return {
      id: service.id,
      clientId: service.clientId,
      title: service.title,
      description: service.description,
      value: service.value,
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
