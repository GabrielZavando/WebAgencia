import { RebuildService } from './rebuild.service';

describe('RebuildService', () => {
  let service: RebuildService;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    service = new RebuildService();
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('debe devolver skipped cuando no está configurada la URL de Coolify', async () => {
    delete process.env.COOLIFY_REBUILD_WEBHOOK_URL;
    const result = await service.triggerRebuild();
    expect(result).toEqual({ skipped: true });
  });

  it('debe devolver triggered cuando el webhook responde ok', async () => {
    process.env.COOLIFY_REBUILD_WEBHOOK_URL =
      'https://coolify.example.com/hooks/deploy-web';
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const result = await service.triggerRebuild();

    expect(result).toEqual({ triggered: true });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://coolify.example.com/hooks/deploy-web',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('debe lanzar error cuando Coolify no responde ok', async () => {
    process.env.COOLIFY_REBUILD_WEBHOOK_URL =
      'https://coolify.example.com/hooks/deploy-web';
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(service.triggerRebuild()).rejects.toThrow();
  });

  it('debe lanzar error cuando fetch falla', async () => {
    process.env.COOLIFY_REBUILD_WEBHOOK_URL =
      'https://coolify.example.com/hooks/deploy-web';
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('network'));

    await expect(service.triggerRebuild()).rejects.toThrow();
  });
});
