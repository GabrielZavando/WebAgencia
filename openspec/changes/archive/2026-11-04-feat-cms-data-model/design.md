## Context

El proyecto WebAstro es un monorepo con API NestJS (backend) y Astro (frontend). La integración de Firebase (Firestore + Auth + Storage) ya está verificada y configurada en ambos entornos. Los módulos `articles` y `categories` existen con esqueletos funcionales (DTOs, entidades, repositorios, servicios, controllers), pero no hay una especificación formal del modelo de datos ni una colección de `media` para la biblioteca de imágenes. El objetivo de este change es exclusivamente de diseño de datos y capas de tipos/DTOs, sin implementar lógica de negocio.

Estado actual:
- `apps/api/src/articles/` ya tiene `CreateArticleDto`, `UpdateArticleDto`, `QueryArticlesDto`, `Article` entity con `category_id`, `content` (TiptapJSON), `status` (`draft` | `published`), `author_id`, timestamps.
- `apps/api/src/categories/` ya tiene `CreateCategoryDto`, `UpdateCategoryDto`, `Category` entity con `name`, `slug`, `description`, timestamps.
- `openspec/specs/article-tiptap-content/spec.md` define requisitos de artículo con contenido Tiptap JSON.
- `openspec/specs/category-management/spec.md` define requisitos de categoría CRUD.
- `openspec/specs/firebase-storage/spec.md` define disponibilidad del cliente de Storage sin endpoints.

## Goals / Non-Goals

**Goals:**
- Definir formalmente las colecciones Firestore: `categories`, `articles`, `media`.
- Definir campos, tipos y relaciones entre colecciones (articles.category_id → categories.id, articles.content como Tiptap JSON embebido, articles.cover_media_id → media.id).
- Proponer tipos TypeScript y DTOs (Create, Update, Query) para cada entidad en el backend.
- Proponer tipos TypeScript compartidos para el frontend en `packages/shared-types`.
- Proponer reglas de seguridad iniciales de Firestore (lectura pública de publicados, escritura autenticada).
- Crear delta specs para `article-tiptap-content`, `category-management`, `firebase-storage`.

**Non-Goals:**
- Implementar lógica de negocio (services, repositories, controllers) — eso es para el change de apply.
- Crear colecciones en Firestore ni migraciones de base de datos.
- Exponer endpoints de Firebase Storage (subida de archivos) — pertenece a un change futuro.
- Modificar la lógica de negocio existente en `apps/api`.

## Decisions

### 1. Nueva colección `media` para biblioteca de imágenes

**Decisión:** Crear colección `media` separada con campos `id`, `filename`, `url`, `mime_type`, `size`, `uploaded_by`, `created_at`, `updated_at`.

**Razonamiento:** Permite gestionar activos de imagen de forma independiente, reutilizables entre artículos, y prepara el terreno para el cambio futuro de subida de archivos a Firebase Storage.

**Alternativa considerada:** Almacenar solo URLs en `articles.cover_url` sin colección media. Se descarta porque no permite metadatos (mime_type, size, autor) ni reutilización de activos.

### 2. Reemplazo de `cover_url` por `cover_media_id` en artículos

**Decisión:** Reemplazar `cover_url` por `cover_media_id` (referencia opcional a `media.id`) en el modelo de `articles` en este change.

**Razonamiento:** Permite resolver la URL de portada a partir de la colección `media`, reutilizando activos y evitando duplicación de URLs. `cover_url` queda deprecado y ya no forma parte del modelo de datos activo.

**Alternativa considerada:** Mantener `cover_url` y agregar `cover_media_id` en un cambio posterior. Se descarta porque el modelo debe estar definido de forma consistente antes de la implementación.

### 3. Contenido Tiptap JSON embebido en `articles.content`

**Decisión:** Mantener `content` como objeto Tiptap JSON embebido en el documento del artículo (no como referencia externa).

**Razonamiento:** El spec existente `article-tiptap-content` ya define este comportamiento. Es consistente con la especificación actual y evita joins adicionales en Firestore.

### 4. DTOs separados por operación (Create, Update, Query)

**Decisión:** Mantener el patrón existente de DTOs separados: `CreateArticleDto`, `UpdateArticleDto`, `QueryArticlesDto`, y análogos para `categories` y `media`.

**Razonamiento:** Permite validaciones distintas por operación (campos requeridos en create, opcionales en update, paginación en query). Ya está implementado para articles y categories.

### 5. `slug` único e indexado en `categories` y `articles`

**Decisión:** `slug` es campo único, case-insensitive, con patrón URL-friendly (`^[a-z0-9]+(-[a-z0-9]+)*$`).

**Razonamiento:** Es requerido por los specs existentes de category-management y article-tiptap-content. Permite URLs públicas legibles y SEO-friendly.

### 6. Delta specs sobre capabilities existentes (no se crea `article-management`)

**Decisión:** Crear specs delta en `openspec/changes/feat-cms-data-model/specs/<capability>/spec.md` para `article-tiptap-content`, `category-management` y `firebase-storage`. NO se crea la capability `article-management`.

**Razonamiento:** `article-tiptap-content` es la spec canónica de artículos. Los nuevos campos (`cover_media_id`, `tags`) se documentan como un delta directamente sobre ella. El flujo OpenSpec sincroniza los deltas al archive. No se reescriben los specs principales en `openspec/specs/` durante este change.

### 7. Tipos compartidos en `packages/shared-types`

**Decisión:** Crear un paquete `packages/shared-types` dentro del monorepo para alojar los tipos TypeScript compartidos (`Article`, `Category`, `Media`, etc.).

**Razonamiento:** Permite un single source of truth para los tipos entre backend (NestJS) y frontend (Astro/React), evitando duplicación y inconsistencias.

**Alternativa considerada:** Duplicar tipos en frontend y backend. Se descarta porque genera inconsistencias y mantenimiento doble.

## Risks / Trade-offs

- [Riesgo] La colección `media` se define pero no se implementa en este change → [Mitigación] El change de apply solo crea artefactos de planificación; la implementación de media se deferra a un cambio posterior.
- [Riesgo] `cover_url` queda deprecado; cualquier código existente que lo use debe migrarse a `cover_media_id` → [Mitigación] Documentado en este design; la migración se planifica en el apply.
- [Trade-off] No se implementan reglas de seguridad de Firestore en código (solo se documentan en el spec) → [Mitigación] Las reglas se aplicarán en un cambio posterior dedicado a seguridad.

## Migration Plan

No aplica en este change (solo artefactos de planificación). Al aplicar:
1. Revisar y ajustar DTOs existentes en `apps/api/src/articles/dto` y `apps/api/src/categories/dto` según lo documentado (reemplazar `cover_url` por `cover_media_id` en `CreateArticleDto` y `UpdateArticleDto`).
2. Crear DTOs y tipos para `media` si se decide incluir en el alcance de implementación.
3. Crear el paquete `packages/shared-types` con los tipos `Article`, `Category`, `Media`.
4. Sincronizar delta specs al archive con `openspec archive`.
