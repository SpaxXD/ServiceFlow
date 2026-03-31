import { ServiceStatus } from '../../domain/entities/Service';

export interface CreateServiceDTO {
  clientId: string;
  title: string;
  description: string;
  value: number;
}

export interface UpdateServiceDTO {
  title?: string;
  description?: string;
  value?: number;
  status?: ServiceStatus;
}

export interface ServiceResponseDTO {
  id: string;
  clientId: string;
  title: string;
  description: string;
  value: number;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListServicesResponseDTO {
  data: ServiceResponseDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardMetricsDTO {
  totalClients: number;
  totalServices: number;
  servicesByStatus: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  totalRevenue: number;
}
