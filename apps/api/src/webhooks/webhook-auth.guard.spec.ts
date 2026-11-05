import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { WebhookAuthGuard } from './webhook-auth.guard';

describe('WebhookAuthGuard', () => {
  let guard: WebhookAuthGuard;
  const mockFirebaseService = { verifyIdToken: jest.fn() };

  beforeEach(() => {
    guard = new WebhookAuthGuard(mockFirebaseService as any);
    jest.clearAllMocks();
  });

  const context = (headers: Record<string, string>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    }) as any;

  it('debe rechazar peticiones sin credenciales', async () => {
    await expect(guard.canActivate(context({}))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('debe aceptar token secreto válido', async () => {
    process.env.REVALIDATION_WEBHOOK_TOKEN = 'secret-token';
    const result = await guard.canActivate(
      context({ 'x-rebuild-token': 'secret-token' }),
    );
    expect(result).toBe(true);
    delete process.env.REVALIDATION_WEBHOOK_TOKEN;
  });

  it('debe rechazar token secreto inválido sin bearer', async () => {
    process.env.REVALIDATION_WEBHOOK_TOKEN = 'secret-token';
    await expect(
      guard.canActivate(context({ 'x-rebuild-token': 'wrong' })),
    ).rejects.toThrow(UnauthorizedException);
    delete process.env.REVALIDATION_WEBHOOK_TOKEN;
  });

  it('debe aceptar bearer token de rol admin', async () => {
    mockFirebaseService.verifyIdToken.mockResolvedValue({
      uid: 'u1',
      email: 'admin@example.com',
      role: 'admin',
    });
    const result = await guard.canActivate(
      context({ authorization: 'Bearer admin-token' }),
    );
    expect(result).toBe(true);
  });

  it('debe rechazar bearer token de rol no admin', async () => {
    mockFirebaseService.verifyIdToken.mockResolvedValue({
      uid: 'u2',
      email: 'user@example.com',
      role: 'user',
    });
    await expect(
      guard.canActivate(context({ authorization: 'Bearer user-token' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('debe rechazar bearer token inválido', async () => {
    mockFirebaseService.verifyIdToken.mockRejectedValue(new Error('invalid'));
    await expect(
      guard.canActivate(context({ authorization: 'Bearer bad-token' })),
    ).rejects.toThrow(UnauthorizedException);
  });
});
