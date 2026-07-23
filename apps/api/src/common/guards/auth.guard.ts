import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../../firebase/firebase.service';
import { CurrentUserData } from '../decorators/current-user.decorator';

interface AuthRequest extends Request {
  user: CurrentUserData;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
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

      request.user = {
        userId: decoded.uid,
        email: decoded.email ?? '',
        role: (decoded.role as string) ?? 'user',
      };

      return true;
    } catch {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Token inválido',
        statusCode: 401,
      });
    }
  }
}
