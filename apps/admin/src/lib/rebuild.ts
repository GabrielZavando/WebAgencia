import { getAuthHeaders } from './auth-headers';

/**
 * Notifica al endpoint de revalidación del sitio público que se ha producido
 * un cambio de contenido (crear/actualizar/eliminar artículo o categoría).
 *
 * Es una llamada fire-and-forget: si falla, el guardado del contenido ya se
 * consideró exitoso y no se revierte. Los errores solo se registran en consola.
 */
export async function notifyPublicRebuild(): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_URL || ''}/api/v1/webhooks/rebuild-public`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({}),
      },
    );

    if (!response.ok) {
      console.warn(
        `No se pudo notificar la revalidación del sitio público: ${response.status}`,
      );
    }
  } catch (error) {
    // No bloqueante: el guardado del contenido ya se consideró exitoso
    console.warn(
      'No se pudo notificar la revalidación del sitio público',
      error instanceof Error ? error.message : String(error),
    );
  }
}
