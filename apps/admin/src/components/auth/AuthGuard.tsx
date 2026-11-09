'use client';

import * as React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { navigate } from '../../lib/navigate';

interface AuthGuardProps {
  /** Si es true, redirige a /login cuando no hay sesión */
  redirectToLogin?: boolean;
  /** Si es true, redirige a /admin cuando hay sesión */
  redirectToAdmin?: boolean;
  /** Contenido a renderizar cuando no hay redirect */
  children?: React.ReactNode;
}

export default function AuthGuard({
  redirectToLogin = true,
  redirectToAdmin = false,
  children,
}: AuthGuardProps = {}) {
  const [redirectTo, setRedirectTo] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth) {
      // Firebase no configurado: asumir que no hay sesión
      if (redirectToLogin) {
        setRedirectTo('/login');
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (redirectToAdmin) {
          setRedirectTo('/admin');
        }
      } else {
        if (redirectToLogin) {
          setRedirectTo('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [auth, redirectToLogin, redirectToAdmin]);

  React.useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo);
    }
  }, [redirectTo]);

  // Si hay redirect pendiente, no renderizar nada
  if (redirectTo) {
    return null;
  }

  // Renderizar children inmediatamente (el formulario de login siempre es visible)
  return <>{children}</>;
}
