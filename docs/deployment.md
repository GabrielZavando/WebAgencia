# Despliegue en Coolify — WebAstro Monorepo

Este documento describe la estrategia de contenedorización y despliegue de las
tres aplicaciones del monorepo en un VPS gestionado con [Coolify](https://coolify.io/).

## Arquitectura de despliegue

| Aplicación | Imagen Docker | Runtime | Puerto interno | Mapeo host (compose) |
|------------|--------------|---------|----------------|----------------------|
| `apps/web` | `apps/web/Dockerfile` (builder Node 26 + pnpm → runner **Nginx**) | Nginx (estático) | 80 | `4321:80` |
| `apps/admin` | `apps/admin/Dockerfile` (builder Node 26 + pnpm → runner **Node standalone**) | Node (no-root) | 4321 | `4322:4321` |
| `apps/api` | `apps/api/Dockerfile` (builder Node 26 + pnpm → runner **Node**) | Node (no-root) | 3000 | `3000:3000` |

No hay servicios de base de datos en contenedores: Firebase (Firestore/Auth)
y Supabase PostgreSQL son servicios gestionados externos.

## 1. Run local con docker-compose (raíz)

```bash
cp .env.example .env   # completar credenciales (nunca se comitea)
docker compose up --build
```

Smoke test post-arranque:

```bash
curl http://localhost:4321/            # web estático -> 200
curl http://localhost:4322/login       # admin SSR  -> 200
curl http://localhost:3000/health      # api        -> 200 ({"data":{"status":"ok",...}})
```

> **Colisión de puertos:** si tienes los dev servers nativos levantados
> (`pnpm dev:web` ocupa 4321 y `pnpm dev:api` ocupa 3000), deténlos antes de
> `docker compose up`, o usa un `docker-compose.override.yml` con otros
> puertos de host (el mapeo canónico es `4321`→web, `4322`→admin, `3000`→api).

Comandos de build de imagen individuales (todos desde la **raíz** del
monorepo, porque el contexto debe incluir el workspace pnpm completo):

```bash
docker build -f apps/web/Dockerfile   -t webastro-web   .
docker build -f apps/admin/Dockerfile -t webastro-admin .
docker build -f apps/api/Dockerfile   -t webastro-api   .
```

Los Dockerfiles consumen el `.dockerignore` de la raíz, que excluye
`node_modules`, `.git`, `dist`, `.env*` (con secretos) y documentación, y
mantiene `pnpm-workspace.yaml`, `pnpm-lock.yaml` y `packages/shared-types/`.

## 2. Sitio público — `apps/web` (estático)

- **Build SSG:** `pnpm --filter @webastro/web build` (o la imagen Docker).
- **Artefacto:** `apps/web/dist/` (HTML estático, sin servidor Node).
- **Contenedor:** Nginx sirviendo `dist/`; rutas inexistentes devuelven 404
  (`404.html`). Health interno del contenedor: `GET /healthz`.
- **Variables de entorno (build):** solo `PUBLIC_*`:
  - `PUBLIC_API_URL`
  - `PUBLIC_SITE_URL`
  - `PUBLIC_TURNSTILE_SITE_KEY`
  - `PUBLIC_GTM_ID` (opcional)
- **Nota:** el build SSG consulta la API para descubrir slugs de blog
  (`getStaticPaths`) y armar el sitemap. Si la API no responde, degrada
  grácilmente (rutas vacías) y el contenido se hidrata en runtime vía
  `src/scripts/blog-fetch.ts`.

## 3. Panel de administración — `apps/admin` (SSR Node standalone)

- **Build SSR:** `pnpm --filter @webastro/admin build` (o la imagen Docker).
- **Artefacto:** `apps/admin/dist/server/entry.mjs` + `dist/client`.
- **Contenedor:** `node:26-alpine`, usuario no-root, `CMD ["node", "./dist/server/entry.mjs"]`.
- **Puerto:** interno `PORT=4321`, `HOST=0.0.0.0` (obligatorio en contenedor).
- **Variables de entorno (build + runtime):**
  - `PUBLIC_API_URL`, `PUBLIC_SITE_URL`, `PUBLIC_FIREBASE_*` (build: Astro
    las inyecta en los bundles cliente; cambiarlas exige rebuild).
  - `PORT`, `HOST` (runtime, ya fijadas en la imagen).
- **Dominio:** definir un dominio propio para el panel (ej. `admin.tudominio.com`).
- **CORS:** la API debe aceptar el dominio del panel en `CORS_ORIGIN`.

## 4. API — `apps/api` (NestJS)

- **Build:** `pnpm --filter @webastro/api build` → `dist/` (o la imagen Docker).
- **Contenedor:** `node:26-alpine`, usuario no-root, `CMD ["node", "dist/main.js"]`.
- **Sin migraciones:** no existe Prisma; Firestore y Supabase son gestionados.
- **Health check:** `GET /health` (fuera del prefijo `/api/v1`), usado para
  liveness del contenedor.
- **Variables de entorno (runtime):**
  - `NODE_ENV=production`, `PORT=3000`
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_STORAGE_BUCKET` (opcional)
  - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`
  - `CORS_ORIGIN` (dominios del sitio público y del panel, separados por coma)
  - `REVALIDATION_WEBHOOK_TOKEN` (secreto opcional para revalidación sin Firebase)
  - `COOLIFY_REBUILD_WEBHOOK_URL` (URL del webhook de despliegue del sitio público)

## 5. Integración con Coolify por tipo de aplicación

Coolify puede construir cada imagen Docker directamente desde el repositorio
(por app, con Dockerfile raíz del monorepo):

| Aplicación | Recurso Coolify | Dockerfile | Start command (o CMD de imagen) | Variables |
|------------|----------------|------------|--------------------------------|-----------|
| `web` | Web Application (Dockerfile) | `apps/web/Dockerfile` | CMD de imagen (Nginx) | `PUBLIC_*` como build args |
| `admin` | Web Application (Dockerfile) | `apps/admin/Dockerfile` | CMD de imagen (`node ./dist/server/entry.mjs`) | `PUBLIC_*` build args + `PORT`/`HOST` runtime |
| `api` | Web Application (Dockerfile) | `apps/api/Dockerfile` | CMD de imagen (`node dist/main.js`) | Firebase/Supabase/CORS/webhook runtime |

Configurar el **contexto de build = raíz del repositorio** (no `apps/<app>`),
porque los Dockerfiles resuelven el workspace pnpm completo.

### `apps/web` (variables de build)
```
PUBLIC_API_URL=https://api.tudominio.com
PUBLIC_SITE_URL=https://tudominio.com
```

### `apps/admin` (variables de build + runtime)
```
PUBLIC_API_URL=https://api.tudominio.com
PUBLIC_SITE_URL=https://tudominio.com
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_STORAGE_BUCKET=...
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
PUBLIC_FIREBASE_APP_ID=...
PUBLIC_FIREBASE_MEASUREMENT_ID=...
PORT=4321
HOST=0.0.0.0
```

### `apps/api` (variables de runtime)
```
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
CORS_ORIGIN=https://tudominio.com,https://admin.tudominio.com
REVALIDATION_WEBHOOK_TOKEN=tu_secreto_aqui
COOLIFY_REBUILD_WEBHOOK_URL=https://coolify.tudominio.com/hooks/deploy-web
```

## 6. Flujo de revalidación del sitio público

Cuando el panel admin guarda, actualiza o elimina un artículo o categoría:

1. El panel admin llama a `POST /api/v1/webhooks/rebuild-public`.
2. La API valida la autenticación (Bearer admin o `X-Rebuild-Token`).
3. La API invoca server-side el webhook de Coolify configurado en
   `COOLIFY_REBUILD_WEBHOOK_URL`.
4. Coolify reconstruye `apps/web` y republica el HTML estático.

Si `COOLIFY_REBUILD_WEBHOOK_URL` no está definida, el endpoint responde
con `skipped: true` y no falla. Si Coolify responde mal, la API devuelve
`502` pero la mutación de contenido ya guardada se conserva.

## 7. Notas

- El blog público permanece en SSG; no se convierte a SSR.
- Las credenciales sensibles (Firebase Admin, Supabase, tokens) **no se
  comitean**; se configuran en `.env` (local, gitignored) o en Coolify.
- El Dockerfile legacy de la API (Node 20 + npm + Prisma + postgres) fue
  eliminado; la referencia válida es `apps/api/Dockerfile` desde la raíz.
