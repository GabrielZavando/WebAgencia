# Proposal

## Why

Iniciar el ciclo SDD del CMS de Blog y Categorías. Hoy `/admin` es un placeholder estático sin capacidad de gestión, y el módulo Firebase de la API expone Firestore y Auth pero no Storage. Los módulos `articles` y `categories` ya están implementados y specced (change `crud-articulos-tiptap`, capability `article-tiptap-content`), así que este change no los re-scaffold: los verifica contra sus specs y agrega la única pieza faltante de infraestructura (cliente de Storage). En el frontend se levanta la base del panel (shadcn/ui + layout admin) y el editor Tiptap como isla React, dejando el esqueleto sobre el cual llegarán CRUD UI, subida de archivos y biblioteca de medios en cambios futuros.

## What Changes

- API: agregar `getStorage()` a `FirebaseService` (cliente de Firebase Storage, sin endpoints de subida) y documentar la env opcional `FIREBASE_STORAGE_BUCKET`.
- API: verificación (sin cambios de código) de `articles`/`categories` contra `article-tiptap-content` y la delta de categorías; CORS ya está configurado en `main.ts` y solo se verifica.
- Web: instalar y configurar shadcn/ui sobre Tailwind 4 (`components.json`, `cn()` en `src/lib/utils.ts`, puente de CSS variables hacia los tokens del design system).
- Web: reemplazar el placeholder de `/admin` por el shell del panel (AdminLayout + Sidebar + Header en `.astro` + toggle móvil), sin datos ni llamadas API.
- Web: página de prueba `/admin/blog/editor-test` con isla React de Tiptap (componentes shadcn-tiptap) y extensión de imágenes preparada para URLs de Firebase Storage (sin subida).
- Tests: actualizar guardarraíles `admin-cleanup.test.ts` (acepta el nuevo `src/components/admin/`) y `dependency-audit.test.ts` (allowlist con deps de shadcn/ui y Tiptap).
- Docs: `CHANGELOG.md` y `docs/design/design-components.md` con el nuevo shell admin.
- **Desviación acordada**: NO se crea la capability `article-management` solicitada originalmente (duplicaría `article-tiptap-content`); se crean `category-management` y `firebase-storage`.

## Capabilities

### New Capabilities

- `cms-admin-panel`: shell del panel admin en `/admin`, base shadcn/ui y editor Tiptap de prueba con extensión de imágenes.
- `category-management`: CRUD de categorías en `/api/v1/categories` (codifica el comportamiento ya implementado y verificado).
- `firebase-storage`: disponibilidad del cliente de Storage en `FirebaseService` (infraestructura para el change futuro de medios).

### Modified Capabilities

- `admin-dashboard`: `/admin` deja de ser placeholder estático y pasa a ser la entrada del shell administrativo (aún sin datos).
- `tailwind-bem-migration`: la entrada admin pasa de "placeholder estático" a "shell con Tailwind utility-first, tokens del sistema y shadcn/ui".

## Impact

- Frontend: `apps/web/src/pages/admin/index.astro`, `apps/web/src/layouts/AdminLayout.astro` (nuevo), `apps/web/src/components/admin/*` (nuevo), `apps/web/src/lib/utils.ts`, `apps/web/src/styles/global.css` (solo aditivo), `apps/web/components.json`, `apps/web/package.json`.
- API: `apps/api/src/firebase/firebase.service.ts`, `apps/api/src/firebase/firebase.service.spec.ts`, `apps/api/.env.example`.
- Tests: `apps/web/tests/validation/admin-cleanup.test.ts`, `apps/web/tests/validation/dependency-audit.test.ts`; unit tests nuevos (`cn`, isla editor, `getStorage`).
- Docs: `CHANGELOG.md`, `docs/design/design-components.md`.
- Sin cambios en: `docs/api-spec.yml`, `docs/data-model.md` (no hay cambios de contrato ni de entidades), sitio público, lógica de autenticación, Supabase.
