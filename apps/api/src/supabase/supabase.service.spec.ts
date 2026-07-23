import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseService],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not be connected initially', () => {
    expect(service.isConnected).toBe(false);
  });

  it('should throw error when getting client before initialization', () => {
    expect(() => service.getClient()).toThrow(
      'Supabase client not initialized',
    );
  });
});
