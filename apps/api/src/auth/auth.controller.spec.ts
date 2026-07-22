import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockFirebaseService = {
    verifyIdToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logout', () => {
    it('should return success message with data null', () => {
      const mockResponse = {
        setHeader: jest.fn(),
      } as any;

      const result = controller.logout(mockResponse);

      expect(result).toEqual({
        data: null,
        meta: { message: 'Sesión cerrada exitosamente' },
      });
    });

    it('should set Set-Cookie header to clear session cookies', () => {
      const mockResponse = {
        setHeader: jest.fn(),
      } as any;

      controller.logout(mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Set-Cookie', [
        'session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict',
        'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict',
      ]);
    });

    it('should clear both session and token cookies', () => {
      const mockResponse = {
        setHeader: jest.fn(),
      } as any;

      controller.logout(mockResponse);

      const cookieHeader = mockResponse.setHeader.mock.calls[0][1];
      expect(cookieHeader).toHaveLength(2);
      expect(cookieHeader[0]).toContain('session=');
      expect(cookieHeader[1]).toContain('token=');
    });
  });
});
