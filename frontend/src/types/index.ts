export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  clientId: string;
  title: string;
  description: string;
  value: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalClients: number;
  totalServices: number;
  servicesByStatus: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  totalRevenue: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
