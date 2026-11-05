import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

interface WebhookHttpRequest {
  headers: {
    authorization?: string;
    'x-rebuild-token'?: string;
  };
  user?: { userId: string; email: string; role: string };
}

/**
 * Guarda de autenticación para el endpoint de revalidación del sitio público.
 * Acepta cualquiera de las dos opciones:
 * 1) Header `x-rebuild-token` igual a `REVALIDATION_WEBHOOK_TOKEN` (disparos
 *    server-side/CI sin cuenta de Firebase).
 * 2) `Authorization: Bearer <Firebase ID token>` de un usuario con rol `admin`.
 *
 * Reutiliza `FirebaseService.verifyIdToken` (igual que `AuthGuard`) para la
 * opción 2 y añade la comprobación de rol `admin`.
 */
@Injectable()
export class WebhookAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<WebhookHttpRequest>();
    const secret = process.env.REVALIDATION_WEBHOOK_TOKEN;
    const xToken = request.headers['x-rebuild-token'];

    if (secret && xToken === secret) {
      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Token de acceso requerido',
        statusCode: 401,
      });
    }

    const token = authHeader.substring(7);
    if (!token) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Token de acceso requerido',
        statusCode: 401,
      });
    }

    try {
      const decoded = await this.firebaseService.verifyIdToken(token);
      if ((decoded.role as string) !== 'admin') {
        throw new ForbiddenException({
          error: 'Forbidden',
          message: 'Acceso denegado',
          statusCode: 403,
        });
      }
      request.user = {
        userId: decoded.uid,
        email: decoded.email ?? '',
        role: (decoded.role as string) ?? 'user',
      };
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Token inválido',
        statusCode: 401,
      });
    }
  }
}
