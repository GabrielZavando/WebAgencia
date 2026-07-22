import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { Logger } from '@nestjs/common';

// Mock @prisma/client — use function-style constructor to preserve prototype chain
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(function (this: any) {
      this.$connect = jest.fn();
      this.$disconnect = jest.fn();
    }),
  };
});

jest.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: jest.fn().mockImplementation(() => ({})),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
  });

  describe('isConnected', () => {
    it('should return false when not connected', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      service = module.get<PrismaService>(PrismaService);
      expect(service.isConnected).toBe(false);
    });

    it('should return true after successful connection', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      service = module.get<PrismaService>(PrismaService);
      (service as any).$connect = jest.fn().mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(service.isConnected).toBe(true);
    });

    it('should remain false after failed connection', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      service = module.get<PrismaService>(PrismaService);
      (service as any).$connect = jest.fn().mockRejectedValue(new Error('Connection refused'));

      await service.onModuleInit();

      expect(service.isConnected).toBe(false);
    });
  });

  describe('onModuleInit', () => {
    it('should skip connection when DATABASE_URL is not set', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      service = module.get<PrismaService>(PrismaService);
      const connectSpy = jest.spyOn(service, '$connect' as any);

      await service.onModuleInit();

      expect(connectSpy).not.toHaveBeenCalled();
      expect(service.isConnected).toBe(false);
    });

    it('should connect when DATABASE_URL is set', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      service = module.get<PrismaService>(PrismaService);
      (service as any).$connect = jest.fn().mockResolvedValue(undefined);

      await service.onModuleInit();

      expect((service as any).$connect).toHaveBeenCalled();
      expect(service.isConnected).toBe(true);
    });

    it('should not throw when connection fails', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      service = module.get<PrismaService>(PrismaService);
      (service as any).$connect = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.onModuleInit()).resolves.not.toThrow();
      expect(service.isConnected).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect when connected', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      service = module.get<PrismaService>(PrismaService);
      (service as any).$connect = jest.fn().mockResolvedValue(undefined);
      (service as any).$disconnect = jest.fn().mockResolvedValue(undefined);

      await service.onModuleInit();
      await service.onModuleDestroy();

      expect((service as any).$disconnect).toHaveBeenCalled();
    });

    it('should not call $disconnect when not connected', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      service = module.get<PrismaService>(PrismaService);
      (service as any).$disconnect = jest.fn();

      await service.onModuleDestroy();

      expect((service as any).$disconnect).not.toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should warn when DATABASE_URL is not set', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      expect(warnSpy).toHaveBeenCalledWith('DATABASE_URL not configured — Prisma will not connect');
      warnSpy.mockRestore();
    });

    it('should not warn when DATABASE_URL is set', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
