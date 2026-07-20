import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Module } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { FirebaseService } from './../src/firebase/firebase.service';
import helmet from 'helmet';

// Create a minimal mock module for E2E testing
@Module({
  providers: [
    {
      provide: FirebaseService,
      useValue: {
        getFirestore: jest.fn(),
        getAuth: jest.fn(),
        verifyIdToken: jest.fn(),
      },
    },
  ],
})
class MockFirebaseModule {}

// Create a minimal health controller for testing
import { Controller, Get } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [MockFirebaseModule],
  controllers: [HealthController],
})
class TestAppModule {}

describe('Security Headers (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-for-e2e';
    process.env.CORS_ORIGIN = 'http://localhost:4321';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply Helmet (same as main.ts)
    app.use(helmet());

    // Apply CORS configuration (same as main.ts)
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4321';
    app.enableCors({
      origin: corsOrigin.split(','),
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CORS', () => {
    it('should return Access-Control-Allow-Origin header', () => {
      return request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'http://localhost:4321')
        .expect(200)
        .expect('Access-Control-Allow-Origin', 'http://localhost:4321');
    });

    it('should handle OPTIONS preflight request', () => {
      return request(app.getHttpServer())
        .options('/health')
        .set('Origin', 'http://localhost:4321')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);
    });
  });

  describe('Helmet Security Headers', () => {
    it('should return X-Content-Type-Options header', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect('X-Content-Type-Options', 'nosniff');
    });

    it('should return X-Frame-Options header', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect('X-Frame-Options', 'SAMEORIGIN');
    });

    it('should return Strict-Transport-Security header', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect('Strict-Transport-Security', /max-age=\d+/);
    });
  });

  describe('Health endpoint', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });
});
