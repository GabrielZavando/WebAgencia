import { useState, useEffect } from 'react';

interface User {
  email: string;
  role: 'admin';
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/v1/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          // No autenticado - redirigir a login
          window.location.href = '/login';
        } else {
          setError('Error al verificar autenticación');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };
}