import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('LeadsController', () => {
  let controller: LeadsController;

  const mockLeadsService = {
    createLead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [{ provide: LeadsService, useValue: mockLeadsService }],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createContact', () => {
    const validDto: CreateLeadDto = {
      name: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      message: 'Me interesa saber más sobre sus servicios',
    };

    it('should return HTTP 201 when lead is newly created', async () => {
      mockLeadsService.createLead.mockResolvedValue({
        leadId: 'uuid-lead-123',
        message: 'Contacto registrado exitosamente',
        isNew: true,
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.createContact(validDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });

    it('should return HTTP 200 when lead already exists (duplicate email)', async () => {
      mockLeadsService.createLead.mockResolvedValue({
        leadId: 'uuid-lead-existente',
        message: 'Contacto registrado exitosamente',
        isNew: false,
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.createContact(validDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return correct response body for new lead', async () => {
      mockLeadsService.createLead.mockResolvedValue({
        leadId: 'uuid-lead-123',
        message: 'Contacto registrado exitosamente',
        isNew: true,
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const result = await controller.createContact(validDto, mockResponse);

      expect(result).toEqual({
        data: {
          leadId: 'uuid-lead-123',
          message: 'Contacto registrado exitosamente',
        },
        meta: { message: 'Contacto registrado exitosamente' },
      });
    });

    it('should return correct response body for existing lead', async () => {
      mockLeadsService.createLead.mockResolvedValue({
        leadId: 'uuid-lead-existente',
        message: 'Contacto registrado exitosamente',
        isNew: false,
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const result = await controller.createContact(validDto, mockResponse);

      expect(result).toEqual({
        data: {
          leadId: 'uuid-lead-existente',
          message: 'Contacto registrado exitosamente',
        },
        meta: { message: 'Contacto registrado exitosamente' },
      });
    });
  });
});
