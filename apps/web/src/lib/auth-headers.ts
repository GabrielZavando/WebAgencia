import { auth } from './firebase';

/**
 * Construye el header de autenticación para las llamadas al panel admin.
 * Devuelve un objeto vacío cuando no hay sesión activa para que el
 * backend responda 401 sin romper el flujo del formulario.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth?.currentUser;

  if (!user) {
    return {};
  }

  const token = await user.getIdToken();

  return { Authorization: `Bearer ${token}` };
}
