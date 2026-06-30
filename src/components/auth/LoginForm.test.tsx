import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import LoginForm from './LoginForm';
import { apiClient, ApiError } from '../../lib/api-client';

vi.mock('../../lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public type: string, message: string, public status?: number) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows email error when email is invalid on submit', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await fireEvent.change(emailInput, { target: { value: 'no-es-email' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('shows password error when password is less than 8 characters on submit', async () => {
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText(/^contraseña$/i);
    await fireEvent.change(passwordInput, { target: { value: 'short' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/al menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('does not submit if form is invalid', async () => {
    const mockPost = vi.mocked(apiClient.post);
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  it('handles 401 error correctly', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValueOnce(new ApiError('HTTP_ERROR', 'Credenciales inválidas', 401));
    
    render(<LoginForm />);
    
    await fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'admin@example.com' } });
    await fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'password123' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it('handles 429 rate limit error correctly', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValueOnce(new ApiError('HTTP_ERROR', 'Rate limit', 429));
    
    render(<LoginForm />);
    
    await fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'admin@example.com' } });
    await fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'password123' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/demasiados intentos/i)).toBeInTheDocument();
    });
  });

  it('handles network error correctly', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValueOnce(new ApiError('NETWORK_ERROR', 'Error de conexión'));
    
    render(<LoginForm />);
    
    await fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'admin@example.com' } });
    await fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'password123' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
    });
  });

  it('submits successfully with valid credentials', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockResolvedValueOnce({
      token: 'fake-jwt-token',
      user: { email: 'admin@example.com', role: 'admin' as const },
      expiresAt: new Date().toISOString(),
    });
    
    render(<LoginForm />);
    
    await fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'admin@example.com' } });
    await fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'password123' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'admin@example.com',
        password: 'password123',
      }, { injectTurnstile: true });
    });
  });
});