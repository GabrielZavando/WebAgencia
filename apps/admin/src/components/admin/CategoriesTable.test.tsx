import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  getAuthHeaders: vi.fn(),
  notifyPublicRebuild: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mocks.get(...args),
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

vi.stubGlobal('fetch', mocks.fetch);

import { CategoriesTable } from './CategoriesTable';

const categories = [
  {
    id: 'cat1',
    name: 'Tecnología',
    slug: 'tecnologia',
    description: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat2',
    name: 'Diseño',
    slug: 'diseno',
    description: 'Creatividad y arte',
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
];

describe('CategoriesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthHeaders.mockResolvedValue({
      Authorization: 'Bearer test-token',
    });
    mocks.get.mockResolvedValue({ data: categories });
    mocks.notifyPublicRebuild.mockResolvedValue(undefined);
    mocks.fetch.mockResolvedValue(new Response(null, { status: 200 }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza el listado con nombre, slug y acciones de editar/eliminar', async () => {
    render(<CategoriesTable initialCategories={categories} />);

    await waitFor(() => {
      expect(screen.getByText('Tecnología')).toBeInTheDocument();
      expect(screen.getByText('tecnologia')).toBeInTheDocument();
      expect(screen.getByText('Diseño')).toBeInTheDocument();
      expect(screen.getByText('diseno')).toBeInTheDocument();
    });

    expect(
      screen.getAllByRole('link', { name: /editar/i }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole('button', { name: /eliminar/i }),
    ).toHaveLength(2);
  });

  it('envía Authorization Bearer en DELETE al eliminar una categoría', async () => {
    render(<CategoriesTable initialCategories={categories} />);

    await waitFor(() => {
      expect(screen.getByText('Tecnología')).toBeInTheDocument();
    });

    // Abrir el diálogo de confirmación (botón "Eliminar" de la fila)
    fireEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0]);

    await waitFor(() => {
      expect(
        screen.getByText(
          '¿Estás seguro de que deseas eliminar esta categoría?',
        ),
      ).toBeInTheDocument();
    });

    // Confirmar la eliminación en el diálogo
    const dialogCard = screen
      .getByText('¿Estás seguro de que deseas eliminar esta categoría?')
      .closest('div')!;
    fireEvent.click(
      within(dialogCard).getByRole('button', { name: /eliminar/i }),
    );

    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/categories/cat1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    expect(mocks.notifyPublicRebuild).toHaveBeenCalledTimes(1);
  });
});
