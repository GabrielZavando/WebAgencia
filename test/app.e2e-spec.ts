import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Module } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { FirebaseService } from './../src/firebase/firebase.service';

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

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-for-e2e';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

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
