import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifyPublicRebuild } from './rebuild';

vi.mock('./auth-headers', () => ({
  getAuthHeaders: vi.fn(),
}));

const getAuthHeadersMock = vi.mocked(
  (await import('./auth-headers')).getAuthHeaders,
);

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = mockFetch;
});

describe('notifyPublicRebuild', () => {
  it('hace POST con header Bearer cuando hay sesión activa', async () => {
    getAuthHeadersMock.mockResolvedValue({
      Authorization: 'Bearer test-token',
    });
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ triggered: true }), { status: 200 }),
    );

    await notifyPublicRebuild();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${import.meta.env.PUBLIC_API_URL || ''}/api/v1/webhooks/rebuild-public`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({}),
      }),
    );
  });

  it('no lanza error si la respuesta de Coolify no es ok (no bloqueante)', async () => {
    getAuthHeadersMock.mockResolvedValue({});
    mockFetch.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(notifyPublicRebuild()).resolves.toBeUndefined();
  });

  it('no lanza error si fetch falla (no bloqueante)', async () => {
    getAuthHeadersMock.mockResolvedValue({});
    mockFetch.mockRejectedValue(new Error('network error'));

    await expect(notifyPublicRebuild()).resolves.toBeUndefined();
  });

  it('no lanza error cuando no hay sesión activa', async () => {
    getAuthHeadersMock.mockResolvedValue({});
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ triggered: true }), { status: 200 }),
    );

    await notifyPublicRebuild();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/webhooks/rebuild-public'),
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });
});
