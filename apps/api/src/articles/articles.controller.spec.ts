import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticleStatus } from './dto/create-article.dto';
import { TiptapJSON } from '../shared/types/tiptap';
import { FirebaseService } from '../firebase/firebase.service';

const mockContent: TiptapJSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Contenido de prueba' }],
    },
  ],
};

const mockArticle = {
  id: 'article-123',
  title: 'Artículo de prueba',
  slug: 'articulo-de-prueba',
  content: mockContent,
  cover_media_id: null,
  category_id: 'cat-123',
  tags: null,
  status: 'published' as const,
  author_id: 'author-123',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: {
            findAll: jest.fn(),
            findByIdOrSlug: jest.fn(),
            findPublishedBySlug: jest.fn(),
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

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const paginatedResult = {
      data: [mockArticle],
      total: 1,
      page: 1,
      limit: 10,
    };

    it('forces published status for unauthenticated requests', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(paginatedResult);

      const result = await controller.findAll(
        { status: ArticleStatus.DRAFT, category_id: 'cat-123' },
        null,
      );

      expect(service.findAll).toHaveBeenCalledWith(
        { category_id: 'cat-123', status: ArticleStatus.PUBLISHED },
        1,
        10,
      );
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10 });
    });

    it('allows authenticated users to filter drafts', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(paginatedResult);

      await controller.findAll(
        { status: ArticleStatus.DRAFT, page: 2, limit: 20 },
        { userId: 'user-1', email: 'admin@example.com', role: 'admin' },
      );

      expect(service.findAll).toHaveBeenCalledWith(
        { status: ArticleStatus.DRAFT },
        2,
        20,
      );
    });

    it('uses safe pagination defaults when query values are absent', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(paginatedResult);

      await controller.findAll({}, null);

      expect(service.findAll).toHaveBeenCalledWith(
        { status: ArticleStatus.PUBLISHED },
        1,
        10,
      );
    });
  });

  describe('findOne', () => {
    it('returns an article by id or slug', async () => {
      jest.spyOn(service, 'findByIdOrSlug').mockResolvedValue(mockArticle);

      const result = await controller.findOne('article-123');

      expect(service.findByIdOrSlug).toHaveBeenCalledWith('article-123');
      expect(result).toEqual({ data: mockArticle });
    });
  });

  describe('findBySlug', () => {
    it('returns a published article by slug', async () => {
      jest.spyOn(service, 'findPublishedBySlug').mockResolvedValue(mockArticle);

      const result = await controller.findBySlug('articulo-de-prueba');

      expect(service.findPublishedBySlug).toHaveBeenCalledWith(
        'articulo-de-prueba',
      );
      expect(result).toEqual({ data: mockArticle });
    });

    it('propagates not found for drafts or unknown slugs', async () => {
      jest
        .spyOn(service, 'findPublishedBySlug')
        .mockRejectedValue(new NotFoundException('Artículo no encontrado'));

      await expect(controller.findBySlug('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'Nuevo artículo',
      slug: 'nuevo-articulo',
      content: mockContent,
      category_id: 'cat-123',
      status: ArticleStatus.DRAFT,
    };

    it('creates an article with the authenticated author id', async () => {
      jest.spyOn(service, 'create').mockResolvedValue({
        ...mockArticle,
        ...createDto,
      });

      const result = await controller.create(createDto, {
        userId: 'author-123',
        email: 'editor@example.com',
        role: 'editor',
      });

      expect(service.create).toHaveBeenCalledWith(createDto, 'author-123');
      expect(result.meta.message).toBe('Artículo creado exitosamente');
    });
  });

  describe('update', () => {
    it('updates an article', async () => {
      const updateDto = { title: 'Título actualizado' };
      jest.spyOn(service, 'update').mockResolvedValue({
        ...mockArticle,
        ...updateDto,
      });

      const result = await controller.update('article-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('article-123', updateDto);
      expect(result.meta.message).toBe('Artículo actualizado exitosamente');
    });
  });

  describe('remove', () => {
    it('deletes an article', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const result = await controller.remove('article-123');

      expect(service.delete).toHaveBeenCalledWith('article-123');
      expect(result.meta.message).toBe('Artículo eliminado exitosamente');
    });
  });
});
