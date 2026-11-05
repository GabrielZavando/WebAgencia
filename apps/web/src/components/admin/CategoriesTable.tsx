'use client';

/**
 * CategoríasTable — Isla React para el listado de categorías.
 * Consume GET /api/v1/categories (público) y permite editar/eliminar
 * (requiere sesión autenticada vía cookie httpOnly).
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient, ApiError } from '@/lib/api-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoriesTableProps {
  initialCategories?: Category[];
}

export function CategoriesTable({
  initialCategories = [],
}: CategoriesTableProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(!initialCategories?.length);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: Category[] }>(
        '/api/v1/categories',
      );
      setCategories(response.data || []);
    } catch (err: any) {
      setError(
        err instanceof ApiError
          ? err.message || 'Error al cargar categorías'
          : 'Error al cargar categorías',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // Usar fetch directamente para enviar credenciales (cookie de sesión)
      await fetch(`${import.meta.env.PUBLIC_API_URL || ''}/api/v1/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(
        err instanceof ApiError
          ? err.message || 'Error al eliminar categoría'
          : 'Error al eliminar categoría',
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-text-muted">Cargando categorías...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={fetchCategories}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-text-muted">No hay categorías aún.</p>
        <Button asChild>
          <a href="/admin/categories/form?id=new">Crear primera categoría</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">Categorías</h2>
        <Button asChild>
          <a href="/admin/categories/form?id=new">Nueva categoría</a>
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Nombre</TableHead>
              <TableHead className="w-40">Slug</TableHead>
              <TableHead className="w-48">Descripción</TableHead>
              <TableHead className="w-24">Estado</TableHead>
              <TableHead className="w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{category.slug}</span>
                </TableCell>
                <TableCell>
                  {category.description || (
                    <span className="text-text-muted">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Activa</Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    disabled={deletingId === category.id}
                  >
                    <a href={`/admin/categories/form?id=${category.id}`}>Editar</a>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmDeleteId(category.id)}
                    disabled={deletingId === category.id}
                  >
                    {deletingId === category.id ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-card p-6 rounded-xl shadow-xl border border-border max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-text mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              ¿Estás seguro de que deseas eliminar esta categoría?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(confirmDeleteId!)}
                disabled={deletingId === confirmDeleteId}
              >
                {deletingId === confirmDeleteId ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
