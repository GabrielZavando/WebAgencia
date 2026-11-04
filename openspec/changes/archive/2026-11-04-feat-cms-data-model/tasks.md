## 1. Revisión de modelo de datos y entidades existentes

- [x] 1.1 Revisar `apps/api/src/articles/entities/article.entity.ts` para confirmar campos: id, title, slug, content (TiptapJSON), cover_media_id, category_id, tags, status, author_id, created_at, updated_at
- [x] 1.2 Revisar `apps/api/src/categories/entities/category.entity.ts` para confirmar campos: id, name, slug, description, created_at, updated_at
- [x] 1.3 Proponer entidad `Media` con campos: id, filename, url, mime_type, size, uploaded_by, created_at, updated_at

## 2. Creación de paquete de tipos compartidos

- [x] 2.1 Crear estructura del paquete `packages/shared-types` (package.json, tsconfig, src/index.ts)
- [x] 2.2 Definir tipo `Article` en `packages/shared-types` (id, title, slug, content, cover_media_id, category_id, tags, status, author_id, created_at, updated_at)
- [x] 2.3 Definir tipo `Category` en `packages/shared-types` (id, name, slug, description, created_at, updated_at)
- [x] 2.4 Definir tipo `Media` en `packages/shared-types` (id, filename, url, mime_type, size, uploaded_by, created_at, updated_at)
- [x] 2.5 Definir tipo `TiptapJSON` en `packages/shared-types` si no existe ya
- [x] 2.6 Exportar todos los tipos desde `packages/shared-types/src/index.ts`

## 3. Ajustes de DTOs y tipos (backend)

- [x] 3.1 Revisar `apps/api/src/articles/dto/create-article.dto.ts` para reemplazar `cover_url` por `cover_media_id` y alinear con el modelo propuesto
- [x] 3.2 Revisar `apps/api/src/articles/dto/update-article.dto.ts` para reemplazar `cover_url` por `cover_media_id` y alinear con el modelo propuesto (campos opcionales, author_id inmutable)
- [x] 3.3 Revisar `apps/api/src/articles/dto/query-articles.dto.ts` para filtros por category_id y status
- [x] 3.4 Revisar `apps/api/src/categories/dto/create-category.dto.ts` y `update-category.dto.ts` para validación de slug único y URL-friendly
- [x] 3.5 Proponer DTOs para entidad `media`: `CreateMediaDto`, `UpdateMediaDto`, `QueryMediaDto` (pendiente de decisión de alcance)
- [x] 3.6 Documentar validaciones: slug único (case-insensitive), status solo draft/published, content como documento Tiptap válido, cover_media_id como referencia opcional a media

## 4. Tipos compartidos (frontend)

- [x] 4.1 Importar tipos desde `packages/shared-types` en el frontend (Astro/React) para entidades `Article`, `Category`, `Media`
- [x] 4.2 Verificar que los tipos del frontend reflejen las entidades del backend (cover_media_id en lugar de cover_url)

## 5. Reglas de seguridad de Firestore

- [x] 5.1 Proponer reglas de lectura pública: artículos con status: published, categorías sin restricción
- [x] 5.2 Proponer reglas de escritura: solo usuarios autenticados (admin/editor roles)
- [x] 5.3 Documentar reglas en el spec delta de firebase-storage y category-management

## 6. Delta specs de OpenSpec

- [x] 6.1 Crear spec delta `specs/article-tiptap-content/spec.md` (cover_media_id, tags, deprecación de cover_url)
- [x] 6.2 Crear spec delta `specs/category-management/spec.md` (slug único, bloqueo de eliminación con artículos asociados)
- [x] 6.3 Crear spec delta `specs/firebase-storage/spec.md` (colección media, relación artículo-media)
