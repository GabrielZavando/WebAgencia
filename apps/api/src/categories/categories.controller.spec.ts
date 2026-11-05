import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = {
    id: 'cat-123',
    name: 'Technology',
    slug: 'technology',
    description: 'Tech articles',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: FirebaseService,
          useValue: {
            verifyIdToken: jest.fn(),
            getFirestore: jest.fn(),
            getAuth: jest.fn(),
            getStorage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories without pagination', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockCategory]);

      const result = await controller.findAll(undefined, undefined);

      expect(result).toEqual({ data: [mockCategory] });
      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should return paginated categories', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockCategory]);

      const result = await controller.findAll('1', '10');

      expect(result).toEqual({ data: [mockCategory] });
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockCategory);

      const result = await controller.findOne('cat-123');

      expect(result).toEqual({ data: mockCategory });
      expect(service.findById).toHaveBeenCalledWith('cat-123');
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(service, 'findById').mockRejectedValue(
        new NotFoundException({
          error: 'Not Found',
          message: 'Categoría no encontrada',
          statusCode: 404,
        }),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'New Category',
      slug: 'new-category',
      description: 'New description',
    };

    it('should create a category successfully', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockCategory);

      const result = await controller.create(createDto);

      expect(result).toEqual({
        data: mockCategory,
        meta: { message: 'Categoría creada exitosamente' },
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated Name' };

    it('should update a category successfully', async () => {
      jest
        .spyOn(service, 'update')
        .mockResolvedValue({ ...mockCategory, name: 'Updated Name' });

      const result = await controller.update('cat-123', updateDto);

      expect(result.data.name).toBe('Updated Name');
      expect(service.update).toHaveBeenCalledWith('cat-123', updateDto);
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(
        new NotFoundException({
          error: 'Not Found',
          message: 'Categoría no encontrada',
          statusCode: 404,
        }),
      );

      await expect(
        controller.update('non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a category successfully', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const result = await controller.remove('cat-123');

      expect(result).toEqual({
        meta: { message: 'Categoría eliminada exitosamente' },
      });
      expect(service.delete).toHaveBeenCalledWith('cat-123');
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(
        new NotFoundException({
          error: 'Not Found',
          message: 'Categoría no encontrada',
          statusCode: 404,
        }),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when category has articles', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(
        new BadRequestException({
          error: 'Bad Request',
          message: 'La categoría tiene artículos asociados',
          statusCode: 400,
        }),
      );

      await expect(controller.remove('cat-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
