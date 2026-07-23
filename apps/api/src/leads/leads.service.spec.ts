import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LeadsRepository } from './leads.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ServiceUnavailableException } from '@nestjs/common';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: LeadsRepository;
  let supabase: SupabaseService;

  const mockSupabaseService = {
    isConnected: false,
  };

  const mockLeadsRepository = {
    findLeadByEmail: jest.fn(),
    createLead: jest.fn(),
    createContactMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: LeadsRepository, useValue: mockLeadsRepository },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<LeadsRepository>(LeadsRepository);
    supabase = module.get<SupabaseService>(SupabaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLead', () => {
    const validDto: CreateLeadDto = {
      name: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      message: 'Me interesa saber más sobre sus servicios',
    };

    it('should throw ServiceUnavailableException when database is not connected', async () => {
      (supabase as any).isConnected = false;

      await expect(service.createLead(validDto)).rejects.toThrow(ServiceUnavailableException);
    });

    it('should create a new lead when email does not exist', async () => {
      (supabase as any).isConnected = true;
      mockLeadsRepository.findLeadByEmail.mockResolvedValue(null);
      mockLeadsRepository.createLead.mockResolvedValue({ id: 'uuid-lead-123' });
      mockLeadsRepository.createContactMessage.mockResolvedValue({ id: 'uuid-msg-123' });

      const result = await service.createLead(validDto);

      expect(result).toEqual({
        leadId: 'uuid-lead-123',
        message: 'Contacto registrado exitosamente',
        isNew: true,
      });
      expect(mockLeadsRepository.createLead).toHaveBeenCalledWith({
        email: 'juan@ejemplo.com',
        fullName: 'Juan Pérez',
        status: 'contact',
        metadata: expect.objectContaining({
          form_id: 'formulario_contacto_web',
          version: '1.1',
        }),
        attribution: expect.objectContaining({
          utm_source: 'formulario_contacto',
          utm_medium: 'web',
        }),
        payload: expect.objectContaining({
          identity_critical: {
            email: 'juan@ejemplo.com',
            full_name: 'Juan Pérez',
          },
        }),
      });
      expect(mockLeadsRepository.createContactMessage).toHaveBeenCalledWith({
        leadId: 'uuid-lead-123',
        message: validDto.message,
      });
    });

    it('should add contact message to existing lead (duplicate email)', async () => {
      (supabase as any).isConnected = true;
      mockLeadsRepository.findLeadByEmail.mockResolvedValue({
        id: 'uuid-lead-existente',
        email: 'juan@ejemplo.com',
      });
      mockLeadsRepository.createContactMessage.mockResolvedValue({ id: 'uuid-msg-456' });

      const result = await service.createLead(validDto);

      expect(result).toEqual({
        leadId: 'uuid-lead-existente',
        message: 'Contacto registrado exitosamente',
        isNew: false,
      });
      expect(mockLeadsRepository.createLead).not.toHaveBeenCalled();
      expect(mockLeadsRepository.createContactMessage).toHaveBeenCalledWith({
        leadId: 'uuid-lead-existente',
        message: validDto.message,
      });
    });

    it('should normalize email to lowercase', async () => {
      (supabase as any).isConnected = true;
      mockLeadsRepository.findLeadByEmail.mockResolvedValue(null);
      mockLeadsRepository.createLead.mockResolvedValue({ id: 'uuid-lead-789' });
      mockLeadsRepository.createContactMessage.mockResolvedValue({ id: 'uuid-msg-789' });

      const dtoWithUppercaseEmail: CreateLeadDto = {
        ...validDto,
        email: 'JUAN@EJEMPLO.COM',
      };

      await service.createLead(dtoWithUppercaseEmail);

      expect(mockLeadsRepository.findLeadByEmail).toHaveBeenCalledWith('juan@ejemplo.com');
      expect(mockLeadsRepository.createLead).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'juan@ejemplo.com' }),
      );
    });

    it('should trim whitespace from name', async () => {
      (supabase as any).isConnected = true;
      mockLeadsRepository.findLeadByEmail.mockResolvedValue(null);
      mockLeadsRepository.createLead.mockResolvedValue({ id: 'uuid-lead-trim' });
      mockLeadsRepository.createContactMessage.mockResolvedValue({ id: 'uuid-msg-trim' });

      const dtoWithSpaces: CreateLeadDto = {
        ...validDto,
        name: '  Juan Pérez  ',
      };

      await service.createLead(dtoWithSpaces);

      expect(mockLeadsRepository.createLead).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Juan Pérez' }),
      );
    });

    it('should include optional phone in payload', async () => {
      (supabase as any).isConnected = true;
      mockLeadsRepository.findLeadByEmail.mockResolvedValue(null);
      mockLeadsRepository.createLead.mockResolvedValue({ id: 'uuid-lead-phone' });
      mockLeadsRepository.createContactMessage.mockResolvedValue({ id: 'uuid-msg-phone' });

      const dtoWithPhone: CreateLeadDto = {
        ...validDto,
        phone: '+54 11 1234-5678',
      };

      await service.createLead(dtoWithPhone);

      expect(mockLeadsRepository.createLead).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            profile_optional: { phone: '+54 11 1234-5678' },
          }),
        }),
      );
    });

    it('should set phone to null when not provided', async () => {
      (supabase as any).isConnected = true;
      mockLeadsRepository.findLeadByEmail.mockResolvedValue(null);
      mockLeadsRepository.createLead.mockResolvedValue({ id: 'uuid-lead-nophone' });
      mockLeadsRepository.createContactMessage.mockResolvedValue({ id: 'uuid-msg-nophone' });

      await service.createLead(validDto);

      expect(mockLeadsRepository.createLead).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            profile_optional: { phone: null },
          }),
        }),
      );
    });
  });
});
