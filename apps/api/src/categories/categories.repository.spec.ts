import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesRepository } from './categories.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { Category } from './entities/category.entity';

describe('CategoriesRepository', () => {
  let repository: CategoriesRepository;

  const mockCategory: Category = {
    id: 'cat-123',
    name: 'Technology',
    slug: 'technology',
    description: 'Tech articles',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  const mockFirestore = {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: 'cat-123',
          data: jest.fn().mockReturnValue(mockCategory),
        }),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          {
            id: 'cat-123',
            data: jest.fn().mockReturnValue(mockCategory),
          },
        ],
        empty: false,
      }),
      add: jest.fn().mockResolvedValue({ id: 'mock-new-id' }),
      count: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesRepository,
        {
          provide: FirebaseService,
          useValue: {
            getFirestore: jest.fn().mockReturnValue(mockFirestore),
          },
        },
      ],
    }).compile();

    repository = module.get<CategoriesRepository>(CategoriesRepository);

    // Limpiar mocks acumulados entre tests (mockReturnValue retorna el mismo objeto)
    mockFirestore.collection.mockClear();
    mockFirestore.collection().limit.mockClear();
    mockFirestore.collection().offset.mockClear();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories without pagination', async () => {
      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCategory);
      expect(mockFirestore.collection).toHaveBeenCalledWith('categories');
    });

    it('should apply limit and offset when page and limit are provided', async () => {
      await repository.findAll(2, 10);

      expect(mockFirestore.collection().limit).toHaveBeenCalledWith(10);
      expect(mockFirestore.collection().offset).toHaveBeenCalledWith(10);
    });

    it('should not apply offset when page is 1', async () => {
      await repository.findAll(1, 10);

      expect(mockFirestore.collection().limit).toHaveBeenCalledWith(10);
      expect(mockFirestore.collection().offset).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      const result = await repository.findById('cat-123');

      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      mockFirestore.collection().doc().get.mockResolvedValueOnce({
        exists: false,
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = {
        name: 'New Category',
        slug: 'new-category',
        description: 'New description',
      };

      const result = await repository.create(createDto);

      expect(result.id).toBe('mock-new-id');
      expect(result.name).toBe(createDto.name);
      expect(mockFirestore.collection().add).toHaveBeenCalled();
    });
  });

  describe('existsBySlug', () => {
    it('should return true when slug exists', async () => {
      mockFirestore.collection().where().limit().get.mockResolvedValueOnce({
        empty: false,
        docs: [],
      });

      const result = await repository.existsBySlug('technology');

      expect(result).toBe(true);
    });

    it('should return false when slug does not exist', async () => {
      mockFirestore.collection().where().limit().get.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const result = await repository.existsBySlug('new-slug');

      expect(result).toBe(false);
    });
  });

  describe('countByCategoryId', () => {
    it('should return the count of articles for a category', async () => {
      const result = await repository.countByCategoryId('cat-123');

      expect(result).toBe(0);
    });
  });
});
