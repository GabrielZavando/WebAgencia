'use client';

/**
 * ArticleForm — Isla React para crear y editar artículos del CMS.
 * Modo creación: `articleId="new"` (POST). Modo edición: id real (PATCH).
 * El extracto se deriva del contenido Tiptap y nunca se envía a la API.
 *
 * La portada se referencia por URL y se guarda temporalmente en
 * `cover_media_id` hasta que exista la biblioteca de medios.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import type { Article, Category, TiptapJSON } from '@webastro/shared-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient, ApiError } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import { buildExcerpt, slugifyTitle } from '@/lib/tiptap';
import { notifyPublicRebuild } from '@/lib/rebuild';
import { Toolbar } from './tiptap/Toolbar';

const EMPTY_DOCUMENT: TiptapJSON = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

type ArticleStatus = 'draft' | 'published';

interface ArticleFormProps {
  articleId: string;
  initialData?: Article;
  onSuccess?: () => void;
}

interface ArticlePayload {
  title: string;
  slug: string;
  content: TiptapJSON;
  cover_media_id: string | null;
  category_id: string;
  tags: string[];
  status: ArticleStatus;
}

function toTiptapJSON(content: JSONContent): TiptapJSON {
  return content as TiptapJSON;
}

export function ArticleForm({
  articleId,
  initialData,
  onSuccess,
}: ArticleFormProps) {
  const isNew = articleId === 'new';
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '');
  const [status, setStatus] = useState<ArticleStatus>(
    initialData?.status ?? 'draft',
  );
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_media_id ?? '');
  const [content, setContent] = useState<TiptapJSON>(
    initialData?.content ?? EMPTY_DOCUMENT,
  );
  const [loadedContent, setLoadedContent] = useState<TiptapJSON | null>(
    initialData?.content ?? null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isMounted = useRef(true);

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension.configure({ allowBase64: false })],
    content: initialData?.content ?? EMPTY_DOCUMENT,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'tiptap-content min-h-[240px] w-full rounded-md border border-border bg-surface p-4 text-text focus:outline-none',
        'aria-label': 'Contenido del artículo',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setContent(toTiptapJSON(currentEditor.getJSON()));
    },
  });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (editor && loadedContent) {
      editor.commands.setContent(loadedContent);
    }
  }, [editor, loadedContent]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const categoriesResponse = await apiClient.get<{ data: Category[] }>(
        '/api/v1/categories',
      );

      if (!isMounted.current) {
        return;
      }

      const loadedCategories = categoriesResponse.data ?? [];
      setCategories(loadedCategories);
      setCategoryId((current) => current || loadedCategories[0]?.id || '');

      if (!isNew && !initialData) {
        const articleResponse = await apiClient.get<{ data: Article }>(
          `/api/v1/articles/${articleId}`,
        );

        if (!isMounted.current) {
          return;
        }

        const article = articleResponse.data;
        setTitle(article.title);
        setSlug(article.slug);
        setSlugTouched(false);
        setCategoryId(article.category_id);
        setStatus(article.status);
        setCoverUrl(article.cover_media_id ?? '');
        setContent(article.content);
        setLoadedContent(article.content);
      }
    } catch (err) {
      if (isMounted.current) {
        setLoadError(
          err instanceof ApiError
            ? err.message
            : 'Error al cargar los datos del artículo',
        );
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [articleId, initialData, isNew]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const excerpt = useMemo(() => buildExcerpt(content), [content]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyTitle(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError(null);

    if (!categoryId) {
      setSaveError('Selecciona una categoría');
      return;
    }

    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      setSaveError(
        'El slug debe ser URL-friendly (solo letras minúsculas, números y guiones)',
      );
      return;
    }

    setSaving(true);

    try {
      const authHeaders = await getAuthHeaders();
      const payload: ArticlePayload = {
        title: title.trim(),
        slug,
        content: editor ? toTiptapJSON(editor.getJSON()) : content,
        cover_media_id: coverUrl.trim() || null,
        category_id: categoryId,
        tags: [],
        status,
      };
      const options = {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      };

      if (isNew) {
        await apiClient.post<{ data: Article }>(
          '/api/v1/articles',
          payload,
          options,
        );
      } else {
        await apiClient.patch<{ data: Article }>(
          `/api/v1/articles/${articleId}`,
          payload,
          options,
        );
      }

      void notifyPublicRebuild();

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/admin/articles';
      }
    } catch (err) {
      setSaveError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Error al guardar el artículo',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-text-muted">Cargando artículo...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">{loadError}</p>
        </div>
        <Button variant="outline" onClick={() => void loadData()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">
          {isNew ? 'Nuevo artículo' : 'Editar artículo'}
        </h1>
        <Button asChild variant="outline">
          <a href="/admin/articles">Volver al listado</a>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Cómo optimizar tu sitio web para SEO"
            disabled={saving}
            required
            minLength={5}
            maxLength={150}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              placeholder="como-optimizar-tu-sitio-web"
              disabled={saving}
              required
              pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
            />
            <p className="text-xs text-text-muted">
              Se genera desde el título; puedes editarlo manualmente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Extracto</Label>
            <textarea
              id="excerpt"
              value={excerpt}
              readOnly
              rows={3}
              className="w-full rounded-md border border-input bg-surface-secondary px-3 py-2 text-sm text-text-secondary"
              aria-describedby="excerpt-help"
            />
            <p id="excerpt-help" className="text-xs text-text-muted">
              Generado automáticamente a partir del contenido.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category_id">Categoría</Label>
            <select
              id="category_id"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={saving}
              required
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-text shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ArticleStatus)
              }
              disabled={saving}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-text shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover_media_id">URL de portada</Label>
          <Input
            id="cover_media_id"
            type="url"
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            placeholder="https://storage.example.com/portada.png"
            disabled={saving}
          />
          <p className="text-xs text-text-muted">
            Temporal: se guarda en `cover_media_id` hasta habilitar la
            biblioteca de medios.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Contenido</Label>
          <div className="rounded-lg border border-border">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        {saveError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
          >
            <p>{saveError}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild disabled={saving}>
            <a href="/admin/articles">Cancelar</a>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? 'Guardando...'
              : isNew
                ? 'Crear artículo'
                : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
