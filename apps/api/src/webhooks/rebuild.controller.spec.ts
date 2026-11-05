import { HttpStatus } from '@nestjs/common';
import { RebuildController } from './rebuild.controller';

describe('RebuildController', () => {
  let controller: RebuildController;
  const mockService = { triggerRebuild: jest.fn() };

  beforeEach(() => {
    controller = new RebuildController(mockService as any);
    jest.clearAllMocks();
  });

  it('debe devolver skipped cuando no está configurado el webhook', async () => {
    mockService.triggerRebuild.mockResolvedValue({ skipped: true });

    const result = await controller.rebuildPublic();

    expect(result.data.skipped).toBe(true);
    expect(result.meta.message).toContain('no configurado');
  });

  it('debe devolver triggered cuando se dispara el webhook', async () => {
    mockService.triggerRebuild.mockResolvedValue({ triggered: true });

    const result = await controller.rebuildPublic();

    expect(result.data.triggered).toBe(true);
  });

  it('debe responder 502 cuando Coolify falla', async () => {
    mockService.triggerRebuild.mockRejectedValue(new Error('Coolify falló'));

    await expect(controller.rebuildPublic()).rejects.toMatchObject({
      status: HttpStatus.BAD_GATEWAY,
    });
  });
});
