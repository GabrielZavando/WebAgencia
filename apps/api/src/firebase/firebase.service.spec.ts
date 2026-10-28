import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  cert: jest.fn().mockReturnValue({}),
  deleteApp: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn().mockReturnValue([]),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(),
}));

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    jest.clearAllMocks();

    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL =
      'test@test-project.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY =
      '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----';

    (initializeApp as jest.Mock).mockReturnValue({
      delete: jest.fn().mockResolvedValue(undefined),
    });

    (getFirestore as jest.Mock).mockReturnValue({});
    (getAuth as jest.Mock).mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid' }),
    });
    (getStorage as jest.Mock).mockReturnValue({ bucket: () => jest.fn() });

    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  afterEach(() => {
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_STORAGE_BUCKET;
    jest.resetModules();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize Firebase on module init', () => {
    service.onModuleInit();
    expect(initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        credential: expect.any(Object),
      }),
    );
    expect(cert).toHaveBeenCalledWith({
      projectId: 'test-project',
      clientEmail: 'test@test-project.iam.gserviceaccount.com',
      privateKey: expect.any(String),
    });
  });

  it('should throw error when FIREBASE_PROJECT_ID is missing', () => {
    delete process.env.FIREBASE_PROJECT_ID;
    expect(() => service.onModuleInit()).toThrow(
      'Firebase configuration is incomplete',
    );
  });

  it('should throw error when FIREBASE_CLIENT_EMAIL is missing', () => {
    delete process.env.FIREBASE_CLIENT_EMAIL;
    expect(() => service.onModuleInit()).toThrow(
      'Firebase configuration is incomplete',
    );
  });

  it('should throw error when FIREBASE_PRIVATE_KEY is missing', () => {
    delete process.env.FIREBASE_PRIVATE_KEY;
    expect(() => service.onModuleInit()).toThrow(
      'Firebase configuration is incomplete',
    );
  });

  it('should delete Firebase app on module destroy', async () => {
    service.onModuleInit();
    await service.onModuleDestroy();
    expect(deleteApp).toHaveBeenCalled();
  });

  it('should return Firestore instance', () => {
    service.onModuleInit();
    const firestore = service.getFirestore();
    expect(firestore).toBeDefined();
    expect(getFirestore).toHaveBeenCalled();
  });

  it('should return Auth instance', () => {
    service.onModuleInit();
    const auth = service.getAuth();
    expect(auth).toBeDefined();
    expect(getAuth).toHaveBeenCalled();
  });

  it('should throw error when getting Firestore before initialization', () => {
    expect(() => service.getFirestore()).toThrow(
      'Firebase app not initialized',
    );
  });

  it('should throw error when getting Auth before initialization', () => {
    expect(() => service.getAuth()).toThrow('Firebase app not initialized');
  });

  it('should verify ID token with checkRevoked=true', async () => {
    service.onModuleInit();
    const mockAuth = {
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid' }),
    };
    (getAuth as jest.Mock).mockReturnValue(mockAuth);

    await service.verifyIdToken('test-token');

    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('test-token', true);
  });

  it('should return Storage instance', () => {
    service.onModuleInit();
    const storage = service.getStorage();
    expect(storage).toBeDefined();
    expect(getStorage).toHaveBeenCalledTimes(1);
  });

  it('should throw error when getting Storage before initialization', () => {
    expect(() => service.getStorage()).toThrow('Firebase app not initialized');
  });

  it('should pass storageBucket to initializeApp when FIREBASE_STORAGE_BUCKET is defined', () => {
    process.env.FIREBASE_STORAGE_BUCKET = 'test-bucket.appspot.com';
    service.onModuleInit();
    expect(initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        storageBucket: 'test-bucket.appspot.com',
      }),
    );
  });

  it('should not pass storageBucket when FIREBASE_STORAGE_BUCKET is undefined', () => {
    service.onModuleInit();
    const config = (initializeApp as jest.Mock).mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(config).not.toHaveProperty('storageBucket');
  });
});
