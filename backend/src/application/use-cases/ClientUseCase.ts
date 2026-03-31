import { IClientRepository } from '../../domain/repositories/IClientRepository';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';
import { CreateClientDTO, UpdateClientDTO, ClientResponseDTO, ListClientsResponseDTO } from '../dtos/ClientDTO';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { ClientEntity } from '../../domain/entities/Client';
import { AuditLogEntity, AuditAction } from '../../domain/entities/AuditLog';
import { generateUUID } from '../../shared/utils/helpers';
import { UserEntity, UserRole } from '../../domain/entities/User';

export class ClientUseCase {
  constructor(
    private clientRepository: IClientRepository,
    private auditLogRepository: IAuditLogRepository,
  ) {}

  async createClient(dto: CreateClientDTO, userId: string, user: UserEntity): Promise<ClientResponseDTO> {
    if (!user.canEdit()) {
      throw new ForbiddenError('You do not have permission to create clients');
    }

    const client = new ClientEntity({
      id: generateUUID(),
      name: dto.name,
      email: dto.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!client.isValid()) {
      throw new ValidationError('Invalid client data');
    }

    const createdClient = await this.clientRepository.create(client);

    await this.auditLogRepository.create(
      new AuditLogEntity({
        id: generateUUID(),
        userId,
        entityType: 'Client',
        entityId: createdClient.id,
        action: AuditAction.CREATE,
        oldValues: {},
        newValues: { name: createdClient.name, email: createdClient.email },
        createdAt: new Date(),
      }),
    );

    return this.mapToResponseDTO(createdClient);
  }

  async updateClient(id: string, dto: UpdateClientDTO, userId: string, user: UserEntity): Promise<ClientResponseDTO> {
    if (!user.canEdit()) {
      throw new ForbiddenError('You do not have permission to update clients');
    }

    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    const oldValues = { ...client };
    const updatedClient = await this.clientRepository.update(id, dto);

    await this.auditLogRepository.create(
      new AuditLogEntity({
        id: generateUUID(),
        userId,
        entityType: 'Client',
        entityId: id,
        action: AuditAction.UPDATE,
        oldValues,
        newValues: dto,
        createdAt: new Date(),
      }),
    );

    return this.mapToResponseDTO(updatedClient);
  }

  async deleteClient(id: string, userId: string, user: UserEntity): Promise<void> {
    if (!user.canDelete()) {
      throw new ForbiddenError('You do not have permission to delete clients');
    }

    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    await this.clientRepository.delete(id);

    await this.auditLogRepository.create(
      new AuditLogEntity({
        id: generateUUID(),
        userId,
        entityType: 'Client',
        entityId: id,
        action: AuditAction.DELETE,
        oldValues: client,
        newValues: {},
        createdAt: new Date(),
      }),
    );
  }

  async getClient(id: string): Promise<ClientResponseDTO> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }
    return this.mapToResponseDTO(client);
  }

  async listClients(page: number, pageSize: number, search?: string): Promise<ListClientsResponseDTO> {
    const { data, total } = await this.clientRepository.list(page, pageSize, search);
    return {
      data: data.map((client) => this.mapToResponseDTO(client)),
      total,
      page,
      pageSize,
    };
  }

  private mapToResponseDTO(client: any): ClientResponseDTO {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
