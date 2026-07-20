import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { initializeApp, cert, deleteApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | null = null;

  onModuleInit() {
    this.initializeFirebase();
  }

  async onModuleDestroy() {
    if (this.app) {
      try {
        await deleteApp(this.app);
        this.logger.log('Firebase app deleted');
      } catch (error) {
        this.logger.error('Failed to delete Firebase app');
      }
    }
  }

  private initializeFirebase(): void {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase configuration is incomplete');
    }

    const privateKeyFormatted = privateKey.replace(/\\n/g, '\n');

    try {
      this.app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKeyFormatted,
        }),
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK');
      throw error;
    }
  }

  getFirestore(): Firestore {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }
    return getFirestore(this.app);
  }

  getAuth(): Auth {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }
    return getAuth(this.app);
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }
    return getAuth(this.app).verifyIdToken(idToken, true);
  }
}
