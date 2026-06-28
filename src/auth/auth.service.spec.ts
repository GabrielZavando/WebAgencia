import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let firebaseService: FirebaseService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'editor' as const,
    avatar_url: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  const mockFirestore = {
    collection: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ empty: true }),
        }),
      }),
      add: jest.fn().mockResolvedValue({ id: 'new-user-id' }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: {
            verifyIdToken: jest.fn(),
            getFirestore: jest.fn().mockReturnValue(mockFirestore),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully login with valid Firebase token', async () => {
      jest.spyOn(firebaseService, 'verifyIdToken').mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'test@example.com',
        name: 'Test User',
      } as never);

      const result = await service.login('valid-id-token');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('mock-jwt-token');
      expect(firebaseService.verifyIdToken).toHaveBeenCalledWith('valid-id-token');
    });

    it('should throw UnauthorizedException when Firebase token is invalid', async () => {
      jest.spyOn(firebaseService, 'verifyIdToken').mockRejectedValue(new Error('Invalid token'));

      await expect(service.login('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should create new user when email does not exist', async () => {
      jest.spyOn(firebaseService, 'verifyIdToken').mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'new@example.com',
        name: 'New User',
      } as never);

      const mockQuerySnapshot = {
        empty: true,
        docs: [],
      };

      const mockCollectionRef = {
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockQuerySnapshot),
          }),
        }),
        add: jest.fn().mockResolvedValue({ id: 'new-user-123' }),
      };

      jest.spyOn(firebaseService, 'getFirestore').mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
      } as never);

      const result = await service.login('valid-token');

      expect(result.user.id).toBe('new-user-123');
      expect(result.user.email).toBe('new@example.com');
      expect(result.user.role).toBe('editor');
    });

    it('should update existing user when email already exists', async () => {
      jest.spyOn(firebaseService, 'verifyIdToken').mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'existing@example.com',
        name: 'Existing User',
      } as never);

      const existingUser = {
        id: 'existing-user-id',
        email: 'existing@example.com',
        full_name: 'Existing User',
        role: 'editor' as const,
        avatar_url: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const mockDocRef = {
        update: jest.fn().mockResolvedValue(undefined),
      };

      const mockQuerySnapshot = {
        empty: false,
        docs: [{ id: 'existing-user-id', data: () => existingUser, ref: mockDocRef }],
      };

      const mockCollectionRef = {
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockQuerySnapshot),
          }),
        }),
      };

      jest.spyOn(firebaseService, 'getFirestore').mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
      } as never);

      const result = await service.login('valid-token');

      expect(result.user.id).toBe('existing-user-id');
      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it('should generate JWT with correct payload', async () => {
      jest.spyOn(firebaseService, 'verifyIdToken').mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'test@example.com',
        name: 'Test User',
      } as never);

      await service.login('valid-token');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: expect.any(String),
        email: 'test@example.com',
        role: 'editor',
      });
    });
  });

  describe('getUserFromToken', () => {
    it('should return user from valid token', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'editor',
      } as never);

      const result = await service.getUserFromToken('valid-token');

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'editor',
      });
    });

    it('should return null for invalid token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.getUserFromToken('invalid-token');

      expect(result).toBeNull();
    });
  });
});