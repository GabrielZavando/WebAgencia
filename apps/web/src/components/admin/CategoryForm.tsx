'use client';

/**
 * CategoryForm — Isla React para el formulario de creación/edición de categoría.
 * Maneja tanto creación (id="new", POST) como edición (id real, PATCH).
 * Requiere autenticación (cookie de sesión enviada con credentials:include).
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryFormProps {
  categoryId: string;
  initialData?: Category;
}

export function CategoryForm({
  categoryId,
  initialData,
}: CategoryFormProps) {
  const isNew = categoryId === 'new';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
  }>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
  });

  const fetchCategory = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_API_URL || ''}/api/v1/categories/${categoryId}`,
        {
          credentials: 'include',
        },
      );
      if (!response.ok) {
        throw new Error('Error al cargar categoría');
      }
      const data = await response.json();
      const cat = data.data;
      if (cat) {
        setFormData({
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar categoría');
    } finally {
      setLoading(false);
    }
  }, [isNew, categoryId]);

  useEffect(() => {
    if (!isNew) {
      fetchCategory();
    }
  }, [isNew, categoryId, fetchCategory]);

  const handleChange = (
    field: 'name' | 'slug' | 'description',
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const clearError = () => setError(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validación básica de slug
      const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (!slugRegex.test(formData.slug)) {
        setError(
          'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
        );
        setSaving(false);
        return;
      }

      if (isNew) {
        await fetch(`${import.meta.env.PUBLIC_API_URL || ''}/api/v1/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(
          `${import.meta.env.PUBLIC_API_URL || ''}/api/v1/categories/${categoryId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData),
          },
        );
      }
      window.location.href = '/admin/categories';
    } catch (err: any) {
      setError(err.message || 'Error al guardar categoría');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-text-muted">Cargando categoría...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
          <p className="font-medium">{error}</p>
          <Button variant="outline" onClick={clearError} size="sm">
            Dismiss
          </Button>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">
          {isNew ? 'Nueva categoría' : 'Editar categoría'}
        </h1>
        <Button asChild variant="outline">
          <a href="/admin/categories">Volver al listado</a>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Tecnología"
            disabled={saving}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="tecnologia"
            disabled={saving}
            required
            pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
          />
          <p className="text-xs text-text-muted">
            Solo letras minúsculas, números y guiones
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Artículos sobre tecnología"
            disabled={saving}
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
            <p>{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            asChild
            disabled={saving}
          >
            <a href="/admin/categories">Cancelar</a>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isNew ? 'Crear categoría' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
