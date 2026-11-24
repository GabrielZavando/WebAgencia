# Proposal

## Why

El único Dockerfile del monorepo (`apps/api/docker/`) está obsoleto y roto: usa Node 20 (los `engines` exigen Node >=26.13.1), `npm`/`package-lock` inexistentes (el proyecto usa pnpm con `pnpm-lock.yaml`) y Prisma, que fue removido del stack. Además, `apps/web` y `apps/admin` no tienen imágenes propias, por lo que no hay paridad entre el entorno local y el despliegue objetivo en Coolify (VPS).

## What Changes

- Reemplazar `apps/api/docker/Dockerfile` (y su compose legacy) con una imagen multi-etapa Node 26 + pnpm, sin Prisma, usuario no-root, arrancando `node dist/main.js`.
- Crear `apps/web/Dockerfile` multi-etapa: builder pnpm + Node 26, runner Nginx sirviendo `apps/web/dist/`.
- Crear `apps/admin/Dockerfile` multi-etapa: builder pnpm + Node 26, runner Node standalone ejecutando `node ./dist/server/entry.mjs`.
- Crear `docker-compose.yml` en la raíz que orqueste los 3 servicios (web, admin, api) con mapeo de puertos host→contenedor y variables de entorno básicas; sin PostgreSQL, sin Prisma, sin servicios de base de datos (Firebase y Supabase son externos).
- Crear `.dockerignore` en la raíz optimizado para workspaces pnpm (excluye `node_modules`, `.git`, `dist`, pero incluye `pnpm-workspace.yaml` y `pnpm-lock.yaml`).
- Actualizar `docs/deployment.md` con build, run local y configuración esperada en Coolify.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `deployment-topology`: agrega los requisitos de contenedorización de las tres aplicaciones (imágenes Docker por app, multi-etapa, puertos internos/mapeos host, compose de orquestación local y `.dockerignore` de workspace), manteniendo la topología ya definida (web estático, admin Node standalone, API Node).

## Impact

- **Archivos nuevos:** `apps/web/Dockerfile`, `apps/admin/Dockerfile`, `docker-compose.yml` (raíz), `.dockerignore` (raíz).
- **Archivos reemplazados/eliminados:** `apps/api/docker/Dockerfile`, `apps/api/docker/docker-compose.yml`, `apps/api/docker/.dockerignore` (legado roto).
- **Docs:** `docs/deployment.md` (y verificación cruzada con `docs/deploy-standards.md`).
- **Sin cambios de código de aplicación ni de contratos API** (`docs/api-spec.yml` y `docs/data-model.md` no se modifican).
- **Riesgo:** el build de `apps/web` consulta la API en build-time (`getStaticPaths` + sitemap); en compose local la API debe estar saludable antes de build de web, o el build degrada grácilmente (rutas vacías).
