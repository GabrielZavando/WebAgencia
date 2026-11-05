import { Injectable, Logger } from '@nestjs/common';

export interface RebuildResult {
  triggered?: boolean;
  skipped?: boolean;
}

/**
 * Servicio que invoca el webhook de despliegue de Coolify para regenerar el
 * sitio público estático. Nunca expone la URL ni el token, y nunca revierte
 * la mutación de contenido si el webhook falla.
 */
@Injectable()
export class RebuildService {
  private readonly logger = new Logger(RebuildService.name);

  async triggerRebuild(): Promise<RebuildResult> {
    const url = process.env.COOLIFY_REBUILD_WEBHOOK_URL;

    if (!url) {
      this.logger.warn(
        'COOLIFY_REBUILD_WEBHOOK_URL no configurado; se omite la revalidación del sitio público',
      );
      return { skipped: true };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        this.logger.error(`El webhook de Coolify respondió ${response.status}`);
        throw new Error(`Coolify webhook responded ${response.status}`);
      }

      this.logger.log('Webhook de Coolify disparado correctamente');
      return { triggered: true };
    } catch (error) {
      this.logger.error(
        `Error al invocar el webhook de Coolify: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
