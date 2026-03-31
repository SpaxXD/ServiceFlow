import { Service, ServiceStatus } from '../entities/Service';

export interface IServiceRepository {
  create(service: Service): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  update(id: string, service: Partial<Service>): Promise<Service>;
  delete(id: string): Promise<void>;
  list(page: number, pageSize: number, filters?: {
    clientId?: string;
    status?: ServiceStatus;
    search?: string;
  }): Promise<{ data: Service[]; total: number }>;
  findByClientId(clientId: string): Promise<Service[]>;
  countByStatus(status: ServiceStatus): Promise<number>;
  getTotalRevenue(): Promise<number>;
}
