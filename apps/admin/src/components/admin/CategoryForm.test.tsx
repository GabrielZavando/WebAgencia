import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  getAuthHeaders: vi.fn(),
  notifyPublicRebuild: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock('@/lib/auth-headers', () => ({
  getAuthHeaders: () => mocks.getAuthHeaders(),
}));

vi.mock('../../lib/rebuild', () => ({
  notifyPublicRebuild: mocks.notifyPublicRebuild,
}));

vi.stubGlobal('fetch', mocks.fetch);

import { CategoryForm } from './CategoryForm';

const existingCategory = {
  id: 'cat1',
  name: 'Tecnología',
  slug: 'tecnologia',
  description: 'Artículos sobre tecnología',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('CategoryForm', () => {
  let mockHref = '';
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHref = '';
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        get href() {
          return mockHref;
        },
        set href(val: string) {
          mockHref = val;
        },
      },
    });
    mocks.getAuthHeaders.mockResolvedValue({
      Authorization: 'Bearer test-token',
    });
    mocks.notifyPublicRebuild.mockResolvedValue(undefined);
    mocks.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({ data: existingCategory }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
  });

  it('renderiza el formulario en modo creación con nombre, slug y descripción', async () => {
    render(<CategoryForm categoryId="new" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /nueva categoría/i })).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /crear categoría/i }),
    ).toBeInTheDocument();
  });

  it('envía Authorization Bearer en POST al crear una categoría', async () => {
    render(<CategoryForm categoryId="new" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Nueva Categoría' },
    });
    fireEvent.change(screen.getByLabelText(/slug/i), {
      target: { value: 'nueva-categoria' },
    });
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Descripción de prueba' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear categoría/i }));

    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/categories'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    expect(mockHref).toBe('/admin/categories');
    expect(mocks.notifyPublicRebuild).toHaveBeenCalledTimes(1);
  });

  it('valida que el slug sea URL-friendly y no envía la petición si es inválido', async () => {
    render(<CategoryForm categoryId="new" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Categoría Inválida' },
    });
    fireEvent.change(screen.getByLabelText(/slug/i), {
      target: { value: 'SLUG CON MAYÚSCULAS!!' },
    });

    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!, {
      submitter: screen.getByRole('button', { name: /crear categoría/i }),
    });

    await waitFor(() => {
      expect(
        screen.getByText(/el slug debe ser url-friendly/i),
      ).toBeInTheDocument();
    });

    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('envía Authorization Bearer en PATCH al editar una categoría existente', async () => {
    render(<CategoryForm categoryId="cat1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toHaveValue('Tecnología');
    });

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Tecnología Actualizada' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/categories/cat1'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    expect(mockHref).toBe('/admin/categories');
  });
});
