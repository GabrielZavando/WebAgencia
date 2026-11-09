import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AuthGuard from './AuthGuard';
import { auth } from '../../lib/firebase';
import { navigate } from '../../lib/navigate';

const mockUnsubscribe = vi.fn();
const mockOnAuthStateChanged = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
}));

vi.mock('../../lib/firebase', () => ({
  auth: { currentUser: null },
}));

vi.mock('../../lib/navigate', () => ({
  navigate: vi.fn(),
}));

describe('AuthGuard - renderiza children inmediatamente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe.mockClear();
    auth.currentUser = null;
  });

  afterEach(() => {
    mockUnsubscribe.mockClear();
  });

  it('renders children immediately without blocking', () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return mockUnsubscribe;
    });

    const { getByText } = render(
      <AuthGuard redirectToLogin={false} redirectToAdmin={false}>
        <div data-testid="children-content">Formulario de login</div>
      </AuthGuard>,
    );

    // Los children deben estar visibles inmediatamente, sin overlay
    expect(getByText('Formulario de login')).toBeInTheDocument();
  });

  it('redirects to /admin when session exists and redirectToAdmin is true', () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback({ uid: 'user-1', email: 'admin@example.com' });
      return mockUnsubscribe;
    });

    render(<AuthGuard redirectToLogin={false} redirectToAdmin />);

    expect(navigate).toHaveBeenCalledWith('/admin');
  });

  it('redirects to /login when no session and redirectToLogin is true', () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return mockUnsubscribe;
    });

    render(<AuthGuard redirectToLogin redirectToAdmin={false} />);

    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
