import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token or invalid format → allow request without user

      (request as any).user = null;
      return true;
    }

    const token = authHeader.substring(7);
    try {
      const decoded = await this.firebaseService.verifyIdToken(token);

      (request as any).user = {
        userId: decoded.uid,
        email: decoded.email,
        role: decoded.role,
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
