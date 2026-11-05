import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: {
    currentUser: null as { getIdToken: () => Promise<string> } | null,
  },
}));

vi.mock('./firebase', () => ({ auth: mockAuth }));

import { getAuthHeaders } from './auth-headers';

describe('getAuthHeaders', () => {
  beforeEach(() => {
    mockAuth.currentUser = null;
  });

  it('returns a Bearer header with the current Firebase ID token', async () => {
    mockAuth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('id-token-123'),
    };

    await expect(getAuthHeaders()).resolves.toEqual({
      Authorization: 'Bearer id-token-123',
    });
  });

  it('returns an empty object when there is no active session', async () => {
    await expect(getAuthHeaders()).resolves.toEqual({});
  });

  it('propagates token refresh failures', async () => {
    const error = new Error('Token refresh failed');
    mockAuth.currentUser = {
      getIdToken: vi.fn().mockRejectedValue(error),
    };

    await expect(getAuthHeaders()).rejects.toThrow('Token refresh failed');
  });
});
