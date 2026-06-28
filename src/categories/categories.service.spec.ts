import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: CategoriesRepository;

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
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsBySlug: jest.fn(),
            findBySlug: jest.fn(),
            countByCategoryId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([mockCategory]);

      const result = await service.findAll();

      expect(result).toEqual([mockCategory]);
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no categories', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockCategory);

      const result = await service.findById('cat-123');

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateCategoryDto = {
      name: 'New Category',
      slug: 'new-category',
      description: 'New description',
    };

    it('should create category successfully', async () => {
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(false);
      jest.spyOn(repository, 'create').mockResolvedValue({
        ...mockCategory,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(result.slug).toBe(createDto.slug);
    });

    it('should throw BadRequestException when slug already exists', async () => {
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(true);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockCategory);
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(false);
      jest.spyOn(repository, 'update').mockResolvedValue({
        ...mockCategory,
        name: 'Updated Name',
      });

      const result = await service.update('cat-123', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when new slug already exists', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockCategory);
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(true);

      await expect(
        service.update('cat-123', { slug: 'existing-slug' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow updating with same slug', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockCategory);
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(false);
      jest.spyOn(repository, 'update').mockResolvedValue(mockCategory);

      const result = await service.update('cat-123', { name: 'New Name' });

      expect(repository.existsBySlug).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete category successfully', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockCategory);
      jest.spyOn(repository, 'countByCategoryId').mockResolvedValue(0);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined as never);

      await service.delete('cat-123');

      expect(repository.delete).toHaveBeenCalledWith('cat-123');
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when category has articles', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockCategory);
      jest.spyOn(repository, 'countByCategoryId').mockResolvedValue(5);

      await expect(service.delete('cat-123')).rejects.toThrow(BadRequestException);
    });
  });
});