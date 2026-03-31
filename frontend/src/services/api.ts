import axios, { AxiosInstance } from 'axios';
import { LoginResponse, Client, Service, DashboardMetrics, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export const authService = {
  register: (email: string, password: string, role: string) =>
    api.post<LoginResponse>('/auth/register', { email, password, role }),
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
};

export const clientService = {
  create: (data: { name: string; email: string }) =>
    api.post<Client>('/clients', data),
  getById: (id: string) =>
    api.get<Client>(`/clients/${id}`),
  update: (id: string, data: Partial<{ name: string; email: string }>) =>
    api.put<Client>(`/clients/${id}`, data),
  delete: (id: string) =>
    api.delete(`/clients/${id}`),
  list: (page: number = 1, pageSize: number = 10, search?: string) =>
    api.get<PaginatedResponse<Client>>('/clients', {
      params: { page, pageSize, search },
    }),
};

export const serviceService = {
  create: (data: { clientId: string; title: string; description: string; value: number }) =>
    api.post<Service>('/services', data),
  getById: (id: string) =>
    api.get<Service>(`/services/${id}`),
  update: (id: string, data: Partial<{ title: string; description: string; value: number; status: string }>) =>
    api.put<Service>(`/services/${id}`, data),
  delete: (id: string) =>
    api.delete(`/services/${id}`),
  list: (page: number = 1, pageSize: number = 10, filters?: { clientId?: string; status?: string; search?: string }) =>
    api.get<PaginatedResponse<Service>>('/services', {
      params: { page, pageSize, ...filters },
    }),
  getDashboard: () =>
    api.get<DashboardMetrics>('/services/dashboard/metrics'),
};

export default api;
