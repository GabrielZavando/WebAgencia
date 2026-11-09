import { createAdminUser } from './create-admin-user';

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn().mockReturnValue([]),
  cert: jest.fn(),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    createUser: jest.fn().mockResolvedValue({ uid: 'test-admin-uid', email: 'admin@example.com' }),
  }),
}));

describe('createAdminUser', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY =
      '-----BEGIN PRIVATE KEY-----\ntest-private-key\n-----END PRIVATE KEY-----\n';
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('initializes Firebase Admin and calls createUser with email and password', async () => {
    const { initializeApp, cert } = require('firebase-admin/app');
    const { getAuth } = require('firebase-admin/auth');

    await createAdminUser({ email: 'admin@example.com', password: 'SecurePass123' });

    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(cert).toHaveBeenCalledWith({
      projectId: 'test-project',
      clientEmail: 'test@test.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\ntest-private-key\n-----END PRIVATE KEY-----\n',
    });
    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(getAuth().createUser).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'SecurePass123',
    });
  });

  it('returns the created user UID', async () => {
    const uid = await createAdminUser({ email: 'admin@example.com', password: 'SecurePass123' });
    expect(uid).toBe('test-admin-uid');
  });

  it('throws when Firebase configuration is incomplete', async () => {
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;

    await expect(
      createAdminUser({ email: 'admin@example.com', password: 'SecurePass123' }),
    ).rejects.toThrow(/Firebase Admin configuration is incomplete/);
  });
});
