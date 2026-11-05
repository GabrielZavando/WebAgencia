'use client';

/**
 * ArticlesTable — Isla React para el listado de artículos del CMS.
 * Consulta la API con Bearer token para incluir borradores y publicados,
 * y permite editar o eliminar artículos (con confirmación).
 */
import { useCallback, useEffect, useState } from 'react';
import type { Article } from '@webastro/shared-types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';

interface ArticlesTableProps {
  initialArticles?: Article[];
}

interface ArticlesResponse {
  data: Article[];
  meta: { total: number; page: number; limit: number };
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function ArticlesTable({ initialArticles = [] }: ArticlesTableProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const query = '?page=1&limit=100';
      const [published, drafts] = await Promise.all([
        apiClient.get<ArticlesResponse>(
          `/api/v1/articles${query}&status=published`,
          { headers },
        ),
        apiClient.get<ArticlesResponse>(
          `/api/v1/articles${query}&status=draft`,
          { headers },
        ),
      ]);

      const byId = new Map<string, Article>();
      for (const article of [...published.data, ...drafts.data]) {
        byId.set(article.id, article);
      }

      setArticles(
        Array.from(byId.values()).sort((a, b) =>
          b.created_at.localeCompare(a.created_at),
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Error al cargar los artículos',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      await apiClient.delete(`/api/v1/articles/${id}`, { headers });
      setArticles((current) => current.filter((article) => article.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Error al eliminar el artículo',
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-text-muted">Cargando artículos...</p>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => void fetchArticles()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-text">Artículos</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchArticles()}>
            Actualizar
          </Button>
          <Button asChild>
            <a href="/admin/articles/form?id=new">Nuevo artículo</a>
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
        >
          <p>{error}</p>
        </div>
      )}

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-text-muted">No hay artículos aún.</p>
          <Button asChild>
            <a href="/admin/articles/form?id=new">Crear primer artículo</a>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="w-48">Slug</TableHead>
                <TableHead className="w-28">Estado</TableHead>
                <TableHead className="w-32">Fecha</TableHead>
                <TableHead className="w-40">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{article.slug}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        article.status === 'published'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {article.status === 'published'
                        ? 'Publicado'
                        : 'Borrador'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(article.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <a href={`/admin/articles/form?id=${article.id}`}>
                          Editar
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setConfirmDeleteId(article.id)}
                        disabled={deletingId === article.id}
                      >
                        {deletingId === article.id
                          ? 'Eliminando...'
                          : 'Eliminar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="mb-4 font-semibold text-text">
              Confirmar eliminación
            </h3>
            <p className="mb-6 text-sm text-text-secondary">
              ¿Estás seguro de que deseas eliminar este artículo? Esta acción no
              se puede deshacer.
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
                onClick={() => void handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
              >
                {deletingId === confirmDeleteId
                  ? 'Eliminando...'
                  : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
