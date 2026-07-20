import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Module, Controller, Get } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { FirebaseService } from '../src/firebase/firebase.service';
import { ArticlesService } from '../src/articles/articles.service';
import { ArticlesController } from '../src/articles/articles.controller';

// --- Mock FirebaseService ---
const mockVerifyIdToken = jest.fn();

@Module({
  providers: [
    {
      provide: FirebaseService,
      useValue: {
        getFirestore: jest.fn(),
        getAuth: jest.fn(),
        verifyIdToken: mockVerifyIdToken,
      },
    },
  ],
  exports: [FirebaseService],
})
class MockFirebaseModule {}

// --- Mock ArticlesService ---
const mockArticlesService = {
  findAll: jest.fn(),
  findByIdOrSlug: jest.fn(),
};

@Module({
  imports: [MockFirebaseModule],
  controllers: [ArticlesController],
  providers: [
    {
      provide: ArticlesService,
      useValue: mockArticlesService,
    },
  ],
})
class TestAppModule {}

describe('Optional Auth & Token Revocation (e2e)', () => {
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
    if (app) {
      await app.close();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /articles — unauthenticated request returns published only', () => {
    it('should return only published articles when no Authorization header', async () => {
      const publishedArticles = [
        {
          id: 'a1',
          title: 'Published Article',
          status: 'published',
          slug: 'published-article',
        },
      ];

      mockArticlesService.findAll.mockResolvedValue({
        data: publishedArticles,
        total: 1,
        page: 1,
        limit: 10,
      });

      const res = await request(app.getHttpServer())
        .get('/articles')
        .expect(200);

      // Service should be called with status: published (forced by controller for unauthenticated)
      expect(mockArticlesService.findAll).toHaveBeenCalledWith(
        { status: 'published' },
        1,
        10,
      );

      expect(res.body.data).toEqual(publishedArticles);
    });
  });

  describe('GET /articles — invalid token returns 401', () => {
    it('should return 401 when Bearer token is invalid', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /articles — revoked token returns 401', () => {
    it('should return 401 when token has been revoked', async () => {
      mockVerifyIdToken.mockRejectedValue(
        new Error('auth/id-token-revoked'),
      );

      await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', 'Bearer revoked-token')
        .expect(401);
    });
  });

  describe('GET /articles — authenticated request can filter by status', () => {
    it('should allow authenticated user to request draft articles', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
      });

      const draftArticles = [
        {
          id: 'a2',
          title: 'Draft Article',
          status: 'draft',
          slug: 'draft-article',
        },
      ];

      mockArticlesService.findAll.mockResolvedValue({
        data: draftArticles,
        total: 1,
        page: 1,
        limit: 10,
      });

      const res = await request(app.getHttpServer())
        .get('/articles?status=draft')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      // Service should be called with status: draft (user is authenticated)
      expect(mockArticlesService.findAll).toHaveBeenCalledWith(
        { status: 'draft' },
        1,
        10,
      );

      expect(res.body.data).toEqual(draftArticles);
    });
  });
});
