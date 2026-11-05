# Proposal

## Why

Hoy `apps/web` mezcla el sitio público (SSG) con el panel de administración y el login, y se despliega como un único artefacto estático. Esa mezcla obliga a que el panel dependa de `output: 'static'` y complica evolucionar el CMS hacia SSR, además de publicar en el bundle público dependencias que solo usa el admin (Firebase, Tiptap, shadcn/ui). Separar el despliegue permite publicar el sitio público como Static Site rápido y cacheable, y el panel como aplicación Node con capacidades de servidor, sin tocar la lógica de negocio de la API.

## What Changes

- **BREAKING (infra):** `apps/web` deja de servir `/admin` y `/login`; pasa a ser exclusivamente el sitio público en `output: 'static'` sin dependencias de admin.
- Crear `apps/admin` como aplicación Astro independiente con `output: 'server'` y adaptador `@astrojs/node` (`standalone`), migrando páginas, componentes, layouts y utilidades del panel (`/admin`, `/login`, `AdminLayout`, `components/admin`, `components/auth`, `components/ui`, `lib/auth-headers`, `lib/tiptap`, `lib/utils`).
- Ajustar dependencias por app: `apps/admin` recibe React, shadcn/ui, Tiptap y Firebase; `apps/web` elimina las que dejan de usarse.
- Agregar en `apps/api` el endpoint protegido `POST /api/v1/webhooks/rebuild-public` que dispara el webhook de rebuild de Coolify ante cambios de artículos y categorías.
- Documentar la topología de despliegue en Coolify (Static Site, Web Application Node, Web Application Nixpacks) y las variables de entorno por app.
- Actualizar guardarraíles de tests estructurales: `apps/web` ya no contiene código de admin, y `apps/admin` pasa a ser el dueño de las rutas del panel.
- **Fuera de alcance:** cambios en la lógica de negocio de artículos/categorías, biblioteca de medios, autenticación nueva, y conversión del blog público a SSR.

## Capabilities

### New Capabilities

- `deployment-topology`: tres aplicaciones desplegables de forma independiente (`web` SSG, `admin` SSR Node, `api` NestJS), sus artefactos de build y su configuración de despliegue en Coolify.
- `public-site-revalidation`: endpoint protegido de la API que notifica a Coolify para regenerar el sitio público cuando cambia contenido publicado.

### Modified Capabilities

- `cms-admin-panel`: el panel de administración vive en `apps/admin` (SSR) en lugar de `apps/web`, conservando los requisitos funcionales del CMS.
- `client-portal-auth`: la ruta `/login` se sirve desde `apps/admin`; deja de existir en el sitio público.
- `landing-public`: el sitio público es SSG puro y no incluye rutas ni código del panel de administración.
- `admin-dashboard`: la entrada `/admin` la sirve la aplicación admin en SSR, no el sitio público estático.

## Impact

- **Nuevo código:** `apps/admin/` (Astro SSR, configuración, páginas, componentes, layouts, utilidades, tests).
- **Código web:** `apps/web/src/pages/admin/`, `apps/web/src/pages/login/`, `apps/web/src/components/admin/`, `apps/web/src/components/auth/`, `apps/web/src/components/ui/`, `apps/web/src/layouts/AdminLayout.astro`, `apps/web/src/lib/auth-headers.ts`, `apps/web/src/lib/tiptap.ts` y `apps/web/src/lib/utils.ts` se eliminan; `apps/web/astro.config.mjs` y `apps/web/package.json` se ajustan.
- **API:** nuevo módulo/controlador de webhook en `apps/api/src/`, sin cambios en artículos ni categorías; `apps/api/.env.example` con variables de Coolify.
- **Contratos:** `docs/api-spec.yml` (nuevo endpoint de webhook) y `docs/deployment.md` (nuevo) o ampliación de `docs/deploy-standards.md`.
- **Tests:** guardarraíles de `apps/web` actualizados; suite de `apps/admin` nueva; e2e de login movidos a `apps/admin`.
- **Dependencias:** `@astrojs/node` solo en `apps/admin`; se retiran de `apps/web` React, Tiptap, shadcn/ui y Firebase si ya no se usan.
- **Fuera de alcance:** `packages/shared-types`, modelo de datos, lógica de API de artículos/categorías, Supabase y biblioteca de medios.
