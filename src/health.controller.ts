import { Controller, Get } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';

interface HealthResponse {
  status: string;
  timestamp: string;
  firebase: {
    status: 'connected' | 'disconnected';
    error?: string;
  };
}

@Controller()
export class HealthController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get('health')
  async check(): Promise<HealthResponse> {
    let firebaseStatus: 'connected' | 'disconnected' = 'disconnected';
    let firebaseError: string | undefined;

    try {
      const firestore = this.firebaseService.getFirestore();
      await firestore.listCollections();
      firebaseStatus = 'connected';
    } catch (error) {
      firebaseStatus = 'disconnected';
      firebaseError = error instanceof Error ? error.message : 'Unknown error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      firebase: {
        status: firebaseStatus,
        ...(firebaseError && { error: firebaseError }),
      },
    };
  }
}