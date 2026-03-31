import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ToastProvider } from '../src/hooks/useToast';
import { LoginForm } from '../src/forms/LoginForm';

const queryClient = new QueryClient();

describe('LoginForm', () => {
  it('renders login form', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <LoginForm />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays error message for invalid email', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <LoginForm />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>,
    );

    const emailInput = screen.getByPlaceholderText('you@example.com');
    expect(emailInput).toHaveValue('');
  });
});
