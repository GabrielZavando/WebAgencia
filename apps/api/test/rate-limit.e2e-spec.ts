import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Module } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseService } from './../src/firebase/firebase.service';

// Create a minimal mock module for testing
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

// Create a minimal controller for testing
import { Controller, Get } from '@nestjs/common';

@Controller('test')
class TestController {
  @Get()
  getTest() {
    return { message: 'ok' };
  }
}

@Module({
  imports: [
    MockFirebaseModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 1000, // 1 second for testing
        limit: 3, // 3 requests per second for testing
      },
    ]),
  ],
  controllers: [TestController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
class TestAppModule {}

describe('Rate Limiting (e2e)', () => {
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

  describe('Rate limiting', () => {
    it('should allow requests within rate limit', async () => {
      // Make 3 requests (within limit)
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer()).get('/test').expect(200);
      }
    });

    it('should return 429 when rate limit exceeded', async () => {
      // Wait for the TTL to reset
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Make 3 requests (within limit)
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer()).get('/test').expect(200);
      }

      // Make 1 more request (should be rate limited)
      await request(app.getHttpServer()).get('/test').expect(429);
    });
  });
});
