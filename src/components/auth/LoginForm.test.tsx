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
    type: string;
    status?: number;
    constructor(type: string, message: string, status?: number) {
      super(message);
      this.name = 'ApiError';
      this.type = type;
      this.status = status;
    }
  },
}));

const mockGetIdToken = vi.fn().mockResolvedValue('mock-firebase-id-token');
const mockUser = { uid: 'test-uid', getIdToken: mockGetIdToken };
const mockSignInWithEmailAndPassword = vi.fn().mockResolvedValue({ user: mockUser });

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
}));

vi.mock('../../lib/firebase', () => ({
  auth: { name: 'mock-auth' },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    render(<LoginForm />);
    expect(screen.getByRole('textbox', { name: /correo electrónico/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows email error when email is invalid on submit', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
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
      expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  it('handles Firebase invalid credentials error', async () => {
    const error = Object.assign(new Error('Invalid credential'), {
      code: 'auth/invalid-credential',
    });
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

    render(<LoginForm />);

    await fireEvent.change(screen.getByRole('textbox', { name: /correo electrónico/i }), { target: { value: 'admin@example.com' } });
    await fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'password123' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it('handles Firebase too many requests error', async () => {
    const error = Object.assign(new Error('Too many requests'), {
      code: 'auth/too-many-requests',
    });
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

    render(<LoginForm />);

    await fireEvent.change(screen.getByRole('textbox', { name: /correo electrónico/i }), { target: { value: 'admin@example.com' } });
    await fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'password123' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/demasiados intentos/i)).toBeInTheDocument();
    });
  });

  it('handles API error after successful Firebase auth', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValueOnce(new ApiError('HTTP_ERROR', 'Token inválido o expirado', 401));

    render(<LoginForm />);

    await fireEvent.change(screen.getByRole('textbox', { name: /correo electrónico/i }), { target: { value: 'admin@example.com' } });
    await fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'password123' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
      expect(screen.getByText(/token inválido o expirado/i)).toBeInTheDocument();
    });
  });

  it('submits successfully and sends id_token to API', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockResolvedValueOnce({
      data: {
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
      },
      meta: { message: 'Login exitoso' },
    });

    render(<LoginForm />);

    await fireEvent.change(screen.getByRole('textbox', { name: /correo electrónico/i }), { target: { value: 'admin@example.com' } });
    await fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'password123' } });
    await fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        { name: 'mock-auth' },
        'admin@example.com',
        'password123'
      );
      expect(mockGetIdToken).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        id_token: 'mock-firebase-id-token',
      });
    });
  });
});
