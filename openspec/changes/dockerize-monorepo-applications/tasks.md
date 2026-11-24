# Tasks

## 1. Contexto de build de workspace

- [x] 1.1 Crear `.dockerignore` en la raíz excluyendo `node_modules`, `.git`, `dist` de apps, `.env*`, `coverage`, artefactos IDE y logs; incluyendo implícitamente `pnpm-workspace.yaml`, `pnpm-lock.yaml` y `packages/`. Verificar: `tar`-like check con `docker build` posterior (etapa de builder resuelve el workspace) y que no existan exclusions de `pnpm-workspace.yaml`/`pnpm-lock.yaml`.
- [x] 1.2 Crear `.env.example` raíz (si no existe) con variables del compose (`PUBLIC_API_URL`, `PUBLIC_SITE_URL`, Firebase, Supabase, CORS, webhook) sin secretos reales. Verificar: revisión de que ningún valor real/creencial está comiteado.

## 2. Dockerfile de apps/web (SSG + Nginx)

- [x] 2.1 Crear `apps/web/Dockerfile` multi-etapa: builder `node:26-alpine` + pnpm (instalado vía npm global anclado a `packageManager`, corepack ya no viene en Node 26), copia ordenada para caché, `pnpm install --frozen-lockfile`, build de `@webastro/shared-types` y `@webastro/web` (`astro build`), runner `nginx:alpine` copiando `apps/web/dist/` con config Nginx mínima (SPA estático, no server-side). Verificar: `docker build -f apps/web/Dockerfile .` completa sin errores y la imagen final no contiene Node ni `node_modules` de la app.
- [x] 2.2 Crear `apps/web/nginx.conf` (o snippet embebido en el Dockerfile) con mimetypes básicos y fallback a `404.html`/`index.html` según convenga al sitio estático. Verificar: al correr el contenedor, `GET /` responde 200 con HTML estático.
- [x] 2.3 Declarar `tw-animate-css` en `apps/web/package.json` (importado por `src/styles/global.css` pero solo presente por hoisting desde admin; el build contenedorizado aislado falla sin él) y actualizar `pnpm-lock.yaml`. Verificar: `docker build -f apps/web/Dockerfile .` supera el paso que antes fallaba con `Can't resolve 'tw-animate-css'`.

## 3. Dockerfile de apps/admin (SSR Node standalone)

- [x] 3.1 Crear `apps/admin/Dockerfile` multi-etapa: builder `node:26-alpine` + pnpm con mismo orden de caché, build de `@webastro/shared-types` y `@webastro/admin` (`astro build` con adaptador node standalone), runner `node:26-alpine` no-root copiando `apps/admin/dist/` completo (`client` + `server`) y `node_modules` necesarios, `ENV PORT=4321 HOST=0.0.0.0`, `CMD ["node", "./dist/server/entry.mjs"]`. Verificar: `docker build -f apps/admin/Dockerfile .` completa y el contenedor arranca escuchando en 4321.
- [x] 3.2 Smoke test del contenedor admin: con `PORT=4321 HOST=0.0.0.0`, `GET /login` y `GET /admin` responden HTML renderizado en servidor (no 404 del static fallback). Verificar: `curl http://localhost:4321/login` dentro del contenedor/servicio compose devuelve 200 con `<html`.

## 4. Dockerfile de apps/api (reemplazo del legacy)

- [x] 4.1 Reemplazar `apps/api/docker/Dockerfile` con imagen multi-etapa raíz (`apps/api/Dockerfile`): builder `node:26-alpine` + pnpm, `pnpm install --frozen-lockfile`, `pnpm --filter @webastro/api build` (`nest build`), etapa `deps-prod` con `pnpm install --frozen-lockfile --prod`, runner `node:26-alpine` no-root copiando `dist/`, `package.json` y `node_modules` de producción, `CMD ["node", "dist/main.js"]`, `EXPOSE 3000`. **Sin Prisma ni `prisma/` en ninguna etapa.** Verificar: `docker build -f apps/api/Dockerfile .` completa y grep del Dockerfile no contiene `prisma`.
- [x] 4.2 Eliminar artefactos legacy `apps/api/docker/` (Dockerfile, docker-compose.yml, .dockerignore). Verificar: el directorio no existe y ninguna referencia en `docs/` apunta a él (actualizar en tarea 6).
- [x] 4.3 Smoke test del contenedor API: arranca sin migraciones, `GET /health` responde 200 con JSON de estado. Verificar: `curl http://localhost:3000/health` devuelve `{"status":"ok",...}` (firebase puede reportar disconnected si faltan credenciales, sin romper el 200).

## 5. Orquestación con docker-compose

- [x] 5.1 Crear `docker-compose.yml` en la raíz con 3 servicios: `web` (build `apps/web`, `4321:80`, build args `PUBLIC_*`), `admin` (build `apps/admin`, `4322:4321`, env runtime `PORT=4321 HOST=0.0.0.0` + `PUBLIC_*` build args), `api` (build `apps/api`, `3000:3000`, env runtime desde `.env`); sin servicios de base de datos; `env_file: .env` donde aplique. Verificar: `docker compose config` valida sintaxis y `docker compose up` levanta los 3 servicios.
- [x] 5.2 Prueba de integración local: `docker compose up` + `curl http://localhost:3000/health` (200), `curl http://localhost:4321/` (HTML estático), `curl http://localhost:4322/login` (SSR). Verificar: los tres curl devuelven 200 y no hay colisión de puertos.

## 6. Documentación

- [x] 6.1 Actualizar `docs/deployment.md`: comandos de build/run por app (`docker build -f apps/<app>/Dockerfile .`), compose raíz, mapeo de puertos (host 4321→web, 4322→admin, 3000→api), variables por app y notas Coolify (recurso por app, comando de inicio, build args para `PUBLIC_*`). Verificar: los comandos documentados se ejecutan tal cual y coinciden 1:1 con los Dockerfiles/compose.
- [x] 6.2 Referenciar el nuevo flujo contenedorizado desde `docs/deploy-standards.md` (reemplazando referencias a `apps/api/docker/` si quedan). Verificar: `grep -r "apps/api/docker" docs/` no devuelve resultados.
