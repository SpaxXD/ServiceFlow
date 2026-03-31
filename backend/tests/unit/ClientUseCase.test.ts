import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientUseCase } from '../../src/application/use-cases/ClientUseCase';
import { ForbiddenError, NotFoundError, ValidationError } from '../../src/shared/errors/AppError';
import { UserEntity, UserRole } from '../../src/domain/entities/User';

describe('ClientUseCase', () => {
  let clientUseCase: ClientUseCase;
  let mockClientRepository: any;
  let mockAuditLogRepository: any;
  let mockUser: UserEntity;

  beforeEach(() => {
    mockClientRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      findByEmail: vi.fn(),
    };

    mockAuditLogRepository = {
      create: vi.fn(),
      list: vi.fn(),
      findByEntityId: vi.fn(),
      findByUserId: vi.fn(),
    };

    clientUseCase = new ClientUseCase(mockClientRepository, mockAuditLogRepository);

    mockUser = new UserEntity({
      id: '1',
      email: 'admin@example.com',
      password: '',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('should create a new client', async () => {
    const newClient = {
      id: '1',
      name: 'Test Client',
      email: 'client@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockClientRepository.create.mockResolvedValue(newClient);
    mockAuditLogRepository.create.mockResolvedValue({});

    const result = await clientUseCase.createClient(
      {
        name: 'Test Client',
        email: 'client@example.com',
      },
      '1',
      mockUser,
    );

    expect(result.name).toBe('Test Client');
    expect(mockClientRepository.create).toHaveBeenCalled();
  });

  it('should throw ForbiddenError if user is not authorized to create', async () => {
    const userUser = new UserEntity({
      id: '2',
      email: 'user@example.com',
      password: '',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      clientUseCase.createClient(
        {
          name: 'Test Client',
          email: 'client@example.com',
        },
        '2',
        userUser,
      ),
    ).rejects.toThrow(ForbiddenError);
  });

  it('should get client by id', async () => {
    const client = {
      id: '1',
      name: 'Test Client',
      email: 'client@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockClientRepository.findById.mockResolvedValue(client);

    const result = await clientUseCase.getClient('1');

    expect(result.id).toBe('1');
    expect(mockClientRepository.findById).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundError if client not found', async () => {
    mockClientRepository.findById.mockResolvedValue(null);

    await expect(clientUseCase.getClient('nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('should list clients with pagination', async () => {
    mockClientRepository.list.mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Client 1',
          email: 'client1@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
    });

    const result = await clientUseCase.listClients(1, 10);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockClientRepository.list).toHaveBeenCalledWith(1, 10, undefined);
  });
});
