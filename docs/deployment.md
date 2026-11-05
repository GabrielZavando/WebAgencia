# Despliegue en Coolify — WebAstro Monorepo

Este documento describe cómo desplegar las tres aplicaciones de forma
independiente en un VPS gestionado con [Coolify](https://coolify.io/).

## Arquitectura de despliegue

| Aplicación | Recurso Coolify | Modo | Comando de inicio | Directorio de publicación |
|------------|-----------------|------|-------------------|---------------------------|
| `apps/web` | Static Site (Nginx) | SSG | — | `apps/web/dist/` |
| `apps/admin` | Web Application | Node.js (standalone) | `node ./dist/server/entry.mjs` | — |
| `apps/api` | Web Application | Nixpacks | `node dist/main` | — |

## 1. Sitio público — `apps/web` (Static Site)

- **Build:** `pnpm --filter @webastro/web build`
- **Artefacto:** `apps/web/dist/` (HTML estático, sin servidor Node)
- **Recurso Coolify:** Static Site (Nginx)
- **Directorio de publicación:** `apps/web/dist/`
- **Variables de entorno (build):** solo `PUBLIC_*`
  - `PUBLIC_API_URL`
  - `PUBLIC_SITE_URL`
  - `PUBLIC_TURNSTILE_SITE_KEY`
  - `PUBLIC_GTM_ID` (opcional)
  - `PUBLIC_FIREBASE_*` (solo si se usa Firebase en cliente; en este cambio el público ya no usa Firebase)

## 2. Panel de administración — `apps/admin` (Web Application Node)

- **Build:** `pnpm --filter @webastro/admin build`
- **Artefacto:** `apps/admin/dist/server/entry.mjs` (servidor Node standalone)
- **Recurso Coolify:** Web Application (Node.js)
- **Comando de inicio:** `node ./dist/server/entry.mjs`
- **Puerto:** `PORT` (ej. `4322`), `HOST=0.0.0.0`
- **Variables de entorno (build + runtime):**
  - `PUBLIC_API_URL` (URL de la API)
  - `PUBLIC_SITE_URL`
  - `PUBLIC_FIREBASE_*` (config pública de Firebase para login y token Bearer)
  - `PORT`, `HOST`
- **Dominio:** definir un dominio propio para el panel (ej. `admin.tudominio.com`).
- **CORS:** la API debe aceptar el dominio del panel en `CORS_ORIGIN`.

## 3. API — `apps/api` (Web Application Nixpacks)

- **Build:** `pnpm --filter @webastro/api build`
- **Artefacto:** `apps/api/dist/main`
- **Recurso Coolify:** Web Application (Nixpacks)
- **Comando de inicio:** `node dist/main`
- **Variables de entorno (runtime):**
  - `NODE_ENV=production`
  - `PORT=3000`
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_STORAGE_BUCKET` (opcional)
  - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`
  - `CORS_ORIGIN` (dominios del sitio público y del panel, separados por coma)
  - `REVALIDATION_WEBHOOK_TOKEN` (secreto opcional para revalidación sin Firebase)
  - `COOLIFY_REBUILD_WEBHOOK_URL` (URL del webhook de despliegue del sitio público)

## 4. Flujo de revalidación del sitio público

Cuando el panel admin guarda, actualiza o elimina un artículo o categoría:

1. El panel admin llama a `POST /api/v1/webhooks/rebuild-public`.
2. La API valida la autenticación (Bearer admin o `X-Rebuild-Token`).
3. La API invoca server-side el webhook de Coolify configurado en
   `COOLIFY_REBUILD_WEBHOOK_URL`.
4. Coolify reconstruye `apps/web` (Static Site) y republica el HTML estático.

Si `COOLIFY_REBUILD_WEBHOOK_URL` no está definida, el endpoint responde
con `skipped: true` y no falla. Si Coolify responde mal, la API devuelve
`502` pero la mutación de contenido ya guardada se conserva.

## 5. Variables de entorno por aplicación

### `apps/web` (`.env.local` / variables de build de Coolify)
```
PUBLIC_API_URL=https://api.tudominio.com/api/v1
PUBLIC_SITE_URL=https://tudominio.com
```

### `apps/admin` (variables de build y runtime de Coolify)
```
PUBLIC_API_URL=https://api.tudominio.com/api/v1
PUBLIC_SITE_URL=https://tudominio.com
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_STORAGE_BUCKET=...
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
PUBLIC_FIREBASE_APP_ID=...
PUBLIC_FIREBASE_MEASUREMENT_ID=...
PORT=4322
HOST=0.0.0.0
```

### `apps/api` (variables de runtime de Coolify)
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

## 6. Notas

- El blog público permanece en SSG; no se convierte a SSR en este cambio.
- No se implementa la biblioteca de medios ni la subida de imágenes.
- Las credenciales sensibles (Firebase Admin, Supabase, tokens) **no se
  comitean**; se configuran como variables de entorno en Coolify.
