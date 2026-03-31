import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { LoginResponse } from '../types';
import { useCallback } from 'react';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authService.login(credentials.email, credentials.password).then((res) => res.data),
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string; role: string }) =>
      authService.register(credentials.email, credentials.password, credentials.role).then((res) => res.data),
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    },
  });

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    queryClient.removeQueries();
    navigate('/login');
  }, [queryClient, navigate]);

  const user = (() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  })();

  const isAuthenticated = !!localStorage.getItem('accessToken');

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  };
}

export function useCurrentUser() {
  const user = (() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  })();

  return user;
}

export function useCanDelete() {
  const user = useCurrentUser();
  return user?.role === 'admin';
}

export function useCanEdit() {
  const user = useCurrentUser();
  return user?.role === 'admin' || user?.role === 'manager';
}
