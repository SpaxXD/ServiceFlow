import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/api';
import { Service } from '../types';

export function useServices(
  page: number = 1,
  pageSize: number = 10,
  filters?: { clientId?: string; status?: string; search?: string },
) {
  return useQuery({
    queryKey: ['services', page, pageSize, filters],
    queryFn: () => serviceService.list(page, pageSize, filters).then((res) => res.data),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceService.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { clientId: string; title: string; description: string; value: number }) =>
      serviceService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
      serviceService.update(id, data).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', data.id] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => serviceService.getDashboard().then((res) => res.data),
    refetchInterval: 30000,
  });
}
