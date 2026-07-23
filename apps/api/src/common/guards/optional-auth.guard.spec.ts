import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OptionalAuthGuard } from './optional-auth.guard';
import { FirebaseService } from '../../firebase/firebase.service';

describe('OptionalAuthGuard', () => {
  let guard: OptionalAuthGuard;

  const mockFirebaseService = {
    verifyIdToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OptionalAuthGuard,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    guard = module.get<OptionalAuthGuard>(OptionalAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request: Record<string, unknown> = {
      headers: authHeader ? { authorization: authHeader } : {},
      user: undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  describe('without token', () => {
    it('should allow request without authorization header', async () => {
      const context = createMockContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow request with empty authorization header', async () => {
      const context = createMockContext('');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow request with non-Bearer authorization', async () => {
      const context = createMockContext('Basic abc123');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should set user to null when no token provided', async () => {
      const context = createMockContext();
      const request = context
        .switchToHttp()
        .getRequest<Record<string, unknown>>();

      await guard.canActivate(context);

      expect(request.user).toBeNull();
    });
  });

  describe('with invalid token', () => {
    it('should throw UnauthorizedException for invalid token', async () => {
      const context = createMockContext('Bearer invalid-token');
      mockFirebaseService.verifyIdToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with correct message', async () => {
      const context = createMockContext('Bearer invalid-token');
      mockFirebaseService.verifyIdToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      try {
        await guard.canActivate(context);
        fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).getResponse()).toEqual({
          error: 'Unauthorized',
          message: 'Token inválido',
          statusCode: 401,
        });
      }
    });
  });

  describe('with valid token', () => {
    it('should allow request with valid token', async () => {
      const context = createMockContext('Bearer valid-token');
      mockFirebaseService.verifyIdToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
        role: 'editor',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach user to request with valid token', async () => {
      const context = createMockContext('Bearer valid-token');
      const request = context
        .switchToHttp()
        .getRequest<Record<string, unknown>>();
      mockFirebaseService.verifyIdToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
        role: 'editor',
      });

      await guard.canActivate(context);

      expect(request.user).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'editor',
      });
    });

    it('should call verifyIdToken with the token', async () => {
      const context = createMockContext('Bearer valid-token');
      mockFirebaseService.verifyIdToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
        role: 'editor',
      });

      await guard.canActivate(context);

      expect(mockFirebaseService.verifyIdToken).toHaveBeenCalledWith(
        'valid-token',
      );
    });
  });
});
