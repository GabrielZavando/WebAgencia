import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AuthGuard from './AuthGuard';
import { auth } from '../../lib/firebase';
import { navigate } from '../../lib/navigate';

const mockUnsubscribe = vi.fn();
const mockOnAuthStateChanged = vi.fn().mockImplementation((_auth: any, callback: any) => {
  // Llamar al callback de forma síncrona para simular estado inicial
  callback(null);
  return mockUnsubscribe;
});

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
}));

vi.mock('../../lib/firebase', () => ({
  auth: { currentUser: null },
}));

vi.mock('../../lib/navigate', () => ({
  navigate: vi.fn(),
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe.mockClear();
    auth.currentUser = null;
  });

  afterEach(() => {
    mockUnsubscribe.mockClear();
  });

  it('redirects to /login when no session and redirectToLogin is true', () => {
    render(<AuthGuard redirectToLogin redirectToAdmin={false} />);

    expect(mockOnAuthStateChanged).toHaveBeenCalled();
    expect(mockUnsubscribe).toBeDefined();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('redirects to /admin when session exists and redirectToAdmin is true', () => {
    mockOnAuthStateChanged.mockImplementationOnce((_auth: any, callback: any) => {
      callback({ uid: 'user-1', email: 'admin@example.com' });
      return mockUnsubscribe;
    });

    render(<AuthGuard redirectToLogin={false} redirectToAdmin />);

    expect(navigate).toHaveBeenCalledWith('/admin');
  });

  it('does not redirect when no session and redirectToLogin is false', () => {
    render(<AuthGuard redirectToLogin={false} redirectToAdmin={false} />);

    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not redirect when session exists and redirectToAdmin is false', () => {
    mockOnAuthStateChanged.mockImplementationOnce((_auth: any, callback: any) => {
      callback({ uid: 'user-1', email: 'admin@example.com' });
      return mockUnsubscribe;
    });

    render(<AuthGuard redirectToLogin redirectToAdmin={false} />);

    expect(navigate).not.toHaveBeenCalled();
  });
});
