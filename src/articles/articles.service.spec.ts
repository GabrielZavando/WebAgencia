import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { ArticlesRepository } from './articles.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateArticleDto, ArticleStatus } from './dto/create-article.dto';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repository: ArticlesRepository;

  const mockArticle = {
    id: 'article-123',
    title: 'Test Article',
    slug: 'test-article',
    content: 'Test content',
    cover_url: 'https://example.com/cover.jpg',
    category_id: 'cat-123',
    tags: ['test', 'article'],
    status: 'published' as const,
    author_id: 'author-123',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: ArticlesRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findBySlug: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get<ArticlesRepository>(ArticlesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated articles', async () => {
      const paginatedResult = {
        data: [mockArticle],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(paginatedResult);

      const result = await service.findAll({ status: ArticleStatus.PUBLISHED }, 1, 10);

      expect(result).toEqual(paginatedResult);
      expect(repository.findAll).toHaveBeenCalledWith({ status: 'published' }, 1, 10);
    });

    it('should cap limit at 100', async () => {
      const paginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 100,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(paginatedResult);

      await service.findAll({ status: ArticleStatus.PUBLISHED }, 1, 200);

      expect(repository.findAll).toHaveBeenCalledWith({ status: 'published' }, 1, 100);
    });
  });

  describe('findByIdOrSlug', () => {
    it('should return article when found by ID', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockArticle);

      const result = await service.findByIdOrSlug('article-123');

      expect(result).toEqual(mockArticle);
    });

    it('should return article when found by slug', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      jest.spyOn(repository, 'findBySlug').mockResolvedValue(mockArticle);

      const result = await service.findByIdOrSlug('test-article');

      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException when not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      jest.spyOn(repository, 'findBySlug').mockResolvedValue(null);

      await expect(service.findByIdOrSlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateArticleDto = {
      title: 'New Article',
      slug: 'new-article',
      content: 'New content',
      cover_url: 'https://example.com/new-cover.jpg',
      category_id: 'cat-123',
      tags: ['new'],
      status: ArticleStatus.PUBLISHED,
    };

    it('should create article successfully', async () => {
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(false);
      jest.spyOn(repository, 'create').mockResolvedValue({
        ...mockArticle,
        ...createDto,
      });

      const result = await service.create(createDto, 'author-123');

      expect(result.title).toBe(createDto.title);
      expect(repository.existsBySlug).toHaveBeenCalledWith(createDto.slug);
    });

    it('should throw BadRequestException when slug already exists', async () => {
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(true);

      await expect(service.create(createDto, 'author-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update article successfully', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockArticle);
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(false);
      jest.spyOn(repository, 'update').mockResolvedValue({
        ...mockArticle,
        title: 'Updated Title',
      });

      const result = await service.update('article-123', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when article not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.update('non-existent', { title: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when new slug already exists', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockArticle);
      jest.spyOn(repository, 'existsBySlug').mockResolvedValue(true);

      await expect(
        service.update('article-123', { slug: 'existing-slug' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete article successfully', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockArticle);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined as never);

      await service.delete('article-123');

      expect(repository.delete).toHaveBeenCalledWith('article-123');
    });

    it('should throw NotFoundException when article not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});