import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesRepository } from './articles.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { Article } from './entities/article.entity';
import { ArticleStatus } from './dto/create-article.dto';
import { TiptapJSON } from '../shared/types/tiptap';

const mockContent: TiptapJSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Contenido de prueba' }],
    },
  ],
};

const mockArticle: Article = {
  id: 'article-123',
  title: 'Artículo de prueba',
  slug: 'articulo-de-prueba',
  content: mockContent,
  cover_media_id: null,
  category_id: 'cat-123',
  tags: null,
  status: 'published',
  author_id: 'author-123',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

interface MockCollection {
  where: jest.Mock;
  orderBy: jest.Mock;
  offset: jest.Mock;
  limit: jest.Mock;
  get: jest.Mock;
  count: jest.Mock;
  doc: jest.Mock;
  add: jest.Mock;
}

function createMockCollection(): {
  collection: MockCollection;
  docRef: { get: jest.Mock; update: jest.Mock; delete: jest.Mock };
} {
  const collection = {
    where: jest.fn(),
    orderBy: jest.fn(),
    offset: jest.fn(),
    limit: jest.fn(),
    get: jest.fn(),
    count: jest.fn(),
    doc: jest.fn(),
    add: jest.fn(),
  };

  collection.where.mockReturnValue(collection);
  collection.orderBy.mockReturnValue(collection);
  collection.offset.mockReturnValue(collection);
  collection.limit.mockReturnValue(collection);
  collection.count.mockReturnValue({
    get: jest.fn().mockResolvedValue({ data: () => ({ count: 1 }) }),
  });

  const docRef = {
    get: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  collection.doc.mockReturnValue(docRef);

  return { collection, docRef };
}

describe('ArticlesRepository', () => {
  let repository: ArticlesRepository;
  let collection: MockCollection;
  let docRef: { get: jest.Mock; update: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    const mock = createMockCollection();
    collection = mock.collection;
    docRef = mock.docRef;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesRepository,
        {
          provide: FirebaseService,
          useValue: {
            getFirestore: jest.fn().mockReturnValue({
              collection: jest.fn().mockReturnValue(collection),
            }),
          },
        },
      ],
    }).compile();

    repository = module.get<ArticlesRepository>(ArticlesRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('applies category, status, pagination and returns mapped articles', async () => {
      collection.get.mockResolvedValue({
        docs: [
          {
            id: mockArticle.id,
            data: () => mockArticle,
          },
        ],
        empty: false,
      });

      const result = await repository.findAll(
        { category_id: 'cat-123', status: ArticleStatus.PUBLISHED },
        2,
        10,
      );

      expect(collection.where).toHaveBeenCalledWith(
        'category_id',
        '==',
        'cat-123',
      );
      expect(collection.where).toHaveBeenCalledWith(
        'status',
        '==',
        ArticleStatus.PUBLISHED,
      );
      expect(collection.orderBy).toHaveBeenCalledWith('created_at', 'desc');
      expect(collection.offset).toHaveBeenCalledWith(10);
      expect(collection.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [mockArticle],
        total: 1,
        page: 2,
        limit: 10,
      });
    });

    it('does not filter when optional filters are absent', async () => {
      collection.get.mockResolvedValue({ docs: [], empty: true });

      await repository.findAll({}, 1, 10);

      expect(collection.where).not.toHaveBeenCalled();
      expect(collection.offset).toHaveBeenCalledWith(0);
    });
  });

  describe('findById', () => {
    it('returns an article when it exists', async () => {
      docRef.get.mockResolvedValue({
        exists: true,
        id: mockArticle.id,
        data: () => mockArticle,
      });

      const result = await repository.findById(mockArticle.id);

      expect(result).toEqual(mockArticle);
      expect(collection.doc).toHaveBeenCalledWith(mockArticle.id);
    });

    it('returns null when the article does not exist', async () => {
      docRef.get.mockResolvedValue({ exists: false });

      await expect(repository.findById('missing')).resolves.toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('returns the article matching the slug', async () => {
      collection.get.mockResolvedValue({
        empty: false,
        docs: [{ id: mockArticle.id, data: () => mockArticle }],
      });

      const result = await repository.findBySlug(mockArticle.slug);

      expect(collection.where).toHaveBeenCalledWith(
        'slug',
        '==',
        mockArticle.slug,
      );
      expect(collection.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockArticle);
    });

    it('returns null when the slug does not exist', async () => {
      collection.get.mockResolvedValue({ empty: true, docs: [] });

      await expect(repository.findBySlug('missing')).resolves.toBeNull();
    });
  });

  describe('create', () => {
    it('persists the article and returns it with the generated id', async () => {
      collection.add.mockResolvedValue({ id: 'new-article-id' });

      const result = await repository.create(
        {
          title: mockArticle.title,
          slug: mockArticle.slug,
          content: mockContent,
          category_id: mockArticle.category_id,
          status: ArticleStatus.PUBLISHED,
        },
        mockArticle.author_id,
      );

      expect(collection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockArticle.title,
          slug: mockArticle.slug,
          content: mockContent,
          cover_media_id: null,
          category_id: mockArticle.category_id,
          author_id: mockArticle.author_id,
          status: ArticleStatus.PUBLISHED,
        }),
      );
      expect(result.id).toBe('new-article-id');
    });
  });

  describe('update', () => {
    it('updates only provided fields and returns the updated article', async () => {
      docRef.get.mockResolvedValue({
        id: mockArticle.id,
        data: () => ({ ...mockArticle, title: 'Título actualizado' }),
      });

      const result = await repository.update(mockArticle.id, {
        title: 'Título actualizado',
      });

      expect(collection.doc).toHaveBeenCalledWith(mockArticle.id);
      expect(docRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Título actualizado',
          updated_at: expect.any(String),
        }),
      );
      expect(docRef.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ slug: expect.anything() }),
      );
      expect(result.title).toBe('Título actualizado');
    });
  });

  describe('delete', () => {
    it('deletes the article document', async () => {
      await repository.delete(mockArticle.id);

      expect(collection.doc).toHaveBeenCalledWith(mockArticle.id);
      expect(docRef.delete).toHaveBeenCalled();
    });
  });

  describe('existsBySlug', () => {
    it('normalizes the slug before querying', async () => {
      collection.get.mockResolvedValue({ empty: false, docs: [{}] });

      const result = await repository.existsBySlug('  TEST-Slug  ');

      expect(collection.where).toHaveBeenCalledWith('slug', '==', 'test-slug');
      expect(result).toBe(true);
    });

    it('returns false when the normalized slug is not found', async () => {
      collection.get.mockResolvedValue({ empty: true, docs: [] });

      await expect(repository.existsBySlug('new-slug')).resolves.toBe(false);
    });
  });
});
