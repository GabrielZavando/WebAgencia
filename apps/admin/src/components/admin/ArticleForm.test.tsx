import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  getAuthHeaders: vi.fn(),
  notifyPublicRebuild: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mocks.get(...args),
    post: (...args: unknown[]) => mocks.post(...args),
    patch: (...args: unknown[]) => mocks.patch(...args),
  },
  ApiError: class ApiError extends Error {
    type: string;
    status?: number;

    constructor(type: string, message: string, status?: number) {
      super(message);
      this.name = 'ApiError';
      this.type = type;
      this.status = status;
    }
  },
}));

vi.mock('@/lib/auth-headers', () => ({
  getAuthHeaders: () => mocks.getAuthHeaders(),
}));

vi.mock('../../lib/rebuild', () => ({
  notifyPublicRebuild: mocks.notifyPublicRebuild,
}));

import { ArticleForm } from './ArticleForm';
import { notifyPublicRebuild } from '../../lib/rebuild';

const article = {
  id: 'art1',
  title: 'Artículo existente',
  slug: 'articulo-existente',
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Contenido existente' }],
      },
    ],
  },
  cover_media_id: null,
  category_id: 'cat1',
  tags: [],
  status: 'published',
  author_id: 'user1',
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-01T00:00:00.000Z',
};

const categories = [
  { id: 'cat1', name: 'Tecnología', slug: 'tecnologia' },
  { id: 'cat2', name: 'Diseño', slug: 'diseno' },
];

describe('ArticleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthHeaders.mockResolvedValue({
      Authorization: 'Bearer test-token',
    });
    mocks.post.mockResolvedValue({ data: article });
    mocks.patch.mockResolvedValue({ data: article });
    mocks.notifyPublicRebuild.mockResolvedValue(undefined);
    mocks.get.mockImplementation((url: unknown) => {
      if (url === '/api/v1/categories') {
        return Promise.resolve({ data: categories });
      }
      if (url === '/api/v1/articles/art1') {
        return Promise.resolve({ data: article });
      }
      return Promise.reject(new Error(`Unexpected GET ${String(url)}`));
    });
  });

  it('creates an article in creation mode and sends the Bearer header', async () => {
    const onSuccess = vi.fn();
    render(<ArticleForm articleId="new" onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Tecnología' }),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Mi primer artículo' },
    });
    fireEvent.change(screen.getByLabelText(/categoría/i), {
      target: { value: 'cat1' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear artículo/i }));

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledTimes(1);
    });

    expect(mocks.post).toHaveBeenCalledWith(
      '/api/v1/articles',
      expect.objectContaining({
        title: 'Mi primer artículo',
        slug: 'mi-primer-articulo',
        category_id: 'cat1',
        status: 'draft',
        cover_media_id: null,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      },
    );
    expect(onSuccess).toHaveBeenCalled();
    expect(notifyPublicRebuild).toHaveBeenCalledTimes(1);
  });

  it('loads and updates an existing article in edit mode', async () => {
    const onSuccess = vi.fn();
    render(<ArticleForm articleId="art1" onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toHaveValue(
        'Artículo existente',
      );
    });

    expect(screen.getByLabelText(/slug/i)).toHaveValue('articulo-existente');
    expect(mocks.get).toHaveBeenCalledWith('/api/v1/articles/art1');

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Artículo actualizado' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(mocks.patch).toHaveBeenCalledTimes(1);
    });

    expect(mocks.patch).toHaveBeenCalledWith(
      '/api/v1/articles/art1',
      expect.objectContaining({
        title: 'Artículo actualizado',
        slug: 'articulo-actualizado',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      },
    );
    expect(mocks.post).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(notifyPublicRebuild).toHaveBeenCalledTimes(1);
  });

  it('auto-generates the slug from the title until the user edits it', async () => {
    render(<ArticleForm articleId="new" />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Nuevo artículo' }),
      ).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/título/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(titleInput, { target: { value: 'Cómo hacer SEO' } });
    expect(slugInput).toHaveValue('como-hacer-seo');

    fireEvent.change(slugInput, { target: { value: 'slug-personalizado' } });
    fireEvent.change(titleInput, { target: { value: 'Otro título' } });

    expect(slugInput).toHaveValue('slug-personalizado');
  });

  it('keeps the excerpt read-only because it is derived from the content', async () => {
    render(<ArticleForm articleId="new" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/extracto/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/extracto/i)).toHaveAttribute('readonly');
  });

  it('shows an error when the API rejects the save', async () => {
    mocks.post.mockRejectedValueOnce(new Error('El slug ya está en uso'));
    render(<ArticleForm articleId="new" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Artículo duplicado' },
    });
    fireEvent.click(screen.getByRole('button', { name: /crear artículo/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El slug ya está en uso',
      );
    });
  });

  it('no bloquea el guardado si la notificación de revalidación falla', async () => {
    const onSuccess = vi.fn();
    mocks.notifyPublicRebuild.mockRejectedValueOnce(new Error('rebuild failed'));
    mocks.post.mockResolvedValue({ data: article });
    render(<ArticleForm articleId="new" onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Tecnología' }),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Mi primer artículo' },
    });
    fireEvent.change(screen.getByLabelText(/categoría/i), {
      target: { value: 'cat1' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear artículo/i }));

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledTimes(1);
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(notifyPublicRebuild).toHaveBeenCalledTimes(1);
  });
});
