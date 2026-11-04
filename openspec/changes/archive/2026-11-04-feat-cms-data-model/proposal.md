## Why

El proyecto ya cuenta con la integración de Firebase verificada y los esqueletos de los módulos `articles` y `categories` implementados, pero no existe una especificación formal del modelo de datos para el CMS de blog ni una colección de `media` para la biblioteca de imágenes. Se necesita definir formalmente las colecciones Firestore (`categories`, `articles`, `media`), sus campos, tipos, relaciones y las reglas de seguridad iniciales antes de iniciar la implementación de la lógica de negocio y el CRUD.

## What Changes

- Definir la colección `categories` con campos `id`, `name`, `slug`, `description`, `created_at`, `updated_at` (slug único e indexado).
- Definir la colección `articles` con campos `id`, `title`, `slug`, `content` (Tiptap JSON), `cover_media_id` (referencia opcional a `media.id`, reemplaza a `cover_url` deprecado), `category_id` (referencia a `categories.id`), `tags`, `status` (`draft` | `published`), `author_id`, `created_at`, `updated_at`.
- Definir la colección `media` para la biblioteca de imágenes (campos: `id`, `filename`, `url`, `mime_type`, `size`, `uploaded_by`, `created_at`, `updated_at`).
- Proponer tipos TypeScript y DTOs (Create, Update, Query) para `articles`, `categories` y `media` en el backend.
- Documentar validaciones: `slug` único (case-insensitive), `status` solo `draft` o `published`, `content` como documento Tiptap válido, `cover_media_id` como referencia opcional a `media`.
- Proponer reglas de seguridad de Firestore: lectura pública de artículos publicados y categorías; escritura solo para usuarios autenticados (admin/editor).
- Proponer tipos TypeScript compartidos para el frontend (Astro/React) que reflejen las entidades del backend, alojados en un paquete `packages/shared-types`.
- Crear delta specs para las capabilities `article-tiptap-content`, `category-management` y `firebase-storage`.

## Capabilities

### New Capabilities

- Ninguna. Se mantienen las capabilities existentes sin crear nuevas.

### Modified Capabilities

- `article-tiptap-content`: Se añade el campo opcional `cover_media_id` (referencia a `media.id`) y `tags` (array de strings), y se deprecara `cover_url`. No se crea la capability `article-management`.
- `category-management`: Se confirma la especificación existente; no hay cambios de requisitos a nivel de spec, solo se documenta alineación con el modelo de datos propuesto.
- `firebase-storage`: Se extiende para incluir la colección `media` como destino de archivos subidos a Firebase Storage, sin exponer endpoints de storage en este change.

## Impact

- Backend: `apps/api/src/articles/`, `apps/api/src/categories/`, nuevos DTOs y tipos para `media`.
- Frontend: tipos compartidos TypeScript para entidades `Article`, `Category`, `Media` en `packages/shared-types`.
- Firestore: nuevas colecciones `categories`, `articles`, `media` (no se crean en este change).
- Reglas de seguridad de Firestore: lectura pública condicionada a `status: published`, escritura autenticada.
