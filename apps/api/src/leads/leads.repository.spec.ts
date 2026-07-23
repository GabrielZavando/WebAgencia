import { Test, TestingModule } from '@nestjs/testing';
import { LeadsRepository } from './leads.repository';
import { SupabaseService } from '../supabase/supabase.service';

const mockSupabaseService = {
  getClient: jest.fn(),
};

describe('LeadsRepository', () => {
  let repository: LeadsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsRepository,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    repository = module.get<LeadsRepository>(LeadsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findLeadByEmail', () => {
    it('should return null when no lead found', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      });
      mockSupabaseService.getClient.mockReturnValue({ from: mockFrom });

      const result = await repository.findLeadByEmail('test@example.com');
      expect(result).toBeNull();
    });

    it('should return lead when found', async () => {
      const mockLead = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
      };
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockLead, error: null }),
          }),
        }),
      });
      mockSupabaseService.getClient.mockReturnValue({ from: mockFrom });

      const result = await repository.findLeadByEmail('test@example.com');
      expect(result).toEqual(mockLead);
    });
  });

  describe('createLead', () => {
    it('should create and return a lead', async () => {
      const mockLead = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        status: 'contact',
      };
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockLead, error: null }),
          }),
        }),
      });
      mockSupabaseService.getClient.mockReturnValue({ from: mockFrom });

      const result = await repository.createLead({
        email: 'test@example.com',
        fullName: 'Test User',
      });
      expect(result).toEqual(mockLead);
    });
  });

  describe('createContactMessage', () => {
    it('should create and return a contact message', async () => {
      const mockMessage = { id: '1', lead_id: '1', message: 'Hello' };
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockMessage, error: null }),
          }),
        }),
      });
      mockSupabaseService.getClient.mockReturnValue({ from: mockFrom });

      const result = await repository.createContactMessage({
        leadId: '1',
        message: 'Hello',
      });
      expect(result).toEqual(mockMessage);
    });
  });
});
