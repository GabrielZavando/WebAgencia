import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

export interface LoginResponseData {
  user: User;
  token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(idToken: string): Promise<LoginResponseData> {
    let decodedToken: { uid: string; email?: string; name?: string };

    try {
      decodedToken = await this.firebaseService.verifyIdToken(idToken);
    } catch (error) {
      this.logger.error('Firebase token verification failed', error);
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Token inválido',
        statusCode: 401,
      });
    }

    const user = await this.findOrCreateUser(decodedToken);
    const token = this.generateJwt(user);

    return { user, token };
  }

  private async findOrCreateUser(firebaseUser: {
    uid: string;
    email?: string;
    name?: string;
  }): Promise<User> {
    const firestore = this.firebaseService.getFirestore();
    const usersRef = firestore.collection('users');

    const existingUserQuery = await usersRef
      .where('email', '==', firebaseUser.email)
      .limit(1)
      .get();

    if (!existingUserQuery.empty) {
      const userDoc = existingUserQuery.docs[0];
      await userDoc.ref.update({
        updated_at: new Date().toISOString(),
      });

      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    }

    const newUserData = {
      email: firebaseUser.email || '',
      full_name: firebaseUser.name || '',
      role: 'editor',
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newUserDoc = await usersRef.add(newUserData);

    return {
      id: newUserDoc.id,
      ...newUserData,
    } as User;
  }

  private generateJwt(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      } as User;
    } catch (error) {
      return null;
    }
  }
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}