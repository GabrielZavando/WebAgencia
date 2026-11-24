# Design

## Context

Ver `proposal.md` — Why. Estado actual relevante:

- Monorepo pnpm (`apps/*`, `packages/*`), `engines: node >=26.13.1`, `packageManager: pnpm@10.28.2`, lockfile único en raíz (`pnpm-lock.yaml`).
- `apps/web` es `output: 'static'` sin adaptador; su build necesita acceso a la API en build-time (`getStaticPaths` de `/blog/[...slug]` y `sitemap.xml.ts`), con degradación grácil (rutas vacías) si la API no responde.
- `apps/admin` es `output: 'server'` con `@astrojs/node` standalone; el runtime resuelve `dist/client` como directorio hermano de `dist/server/entry.mjs` (verificado en el código del adaptador), así que la imagen debe copiar todo `dist/`. El adaptador honra `PORT` y `HOST` en runtime; si `HOST` no se define, puede bindear a `localhost` (inaccesible desde fuera del contenedor).
- `apps/api` arranca con `node dist/main.js`, escucha `PORT ?? 3000`, health en `GET /health` (excluido del prefijo `api/v1`).
- `packages/shared-types` se consume como `workspace:*` por web y admin; su build (`tsc`) es dependencia previa de los builds de frontend.
- El Dockerfile legacy de la API (Node 20, npm, Prisma, postgres en compose) no es reparable de forma incremental: se reemplaza.

## Goals / Non-Goals

**Goals:**

- Una imagen Docker por aplicación, multi-etapa, construidas desde la raíz del monorepo (contexto workspace completo).
- `docker compose up` en la raíz levanta los 3 servicios con paridad de puertos host→contenedor.
- Documentación de despliegue coherente con Coolify como target.

**Non-Goals:**

- Despliegue CI/CD automatizado o registry de imágenes (Coolify construye desde el repo).
- HTTPS/TLS por contenedor (Coolify/proxy inverso lo maneja).
- Servicios de base de datos en contenedores (Firebase y Supabase son gestionados externos).
- Cambios de código de aplicación, contratos API o modelo de datos.
- Deprecar `docs/deploy-standards.md` (solo referencia cruzada si aplica).

## Decisions

### D1. Contexto de build: raíz del monorepo (no por app)

Los tres Dockerfiles se construyen con `docker build -f apps/<app>/Dockerfile .` desde la raíz. Alternativa descartada: contexto por app con `pnpm fetch` parcial — rompe la resolución de `workspace:*` y requiere mantener múltiples `.dockerignore`. Con contexto raíz, un único `.dockerignore` en raíz controla qué entra al contexto y cada Dockerfile copia solo lo necesario.

### D2. Base: `node:26-alpine` + `corepack`/pnpm en builder; runners minimalistas

- Builder: `FROM node:26-alpine AS builder` con pnpm habilitado (corepack, anclado a `packageManager`) para respetar `pnpm-lock.yaml` con `pnpm install --frozen-lockfile`.
- Runner API/admin: `node:26-alpine`, usuario no-root (`node` del propio Alpine), copia de artefactos + `node_modules` de producción.
- Runner web: `nginx:alpine` con config mínima, sin runtime Node.
- Alternativas descartadas: `node:26-slim` (mayor tamaño, sin beneficio aquí), imágenes distroless (debugging más difícil en staging), multi-stage con `pnpm deploy --prod` para recortar node_modules (ventaja futura; se usa `--filter` + prune si el tamaño lo exige).

### D3. Estrategia de copiado en builders (workspaces pnpm)

Cada builder copia, en orden para maximizar caché: `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `package.json` raíz, `packages/shared-types/package.json`, `apps/<app>/package.json` → `pnpm install --frozen-lockfile` → resto del código → `pnpm --filter @webastro/shared-types build && pnpm --filter @webastro/<app> build`. Para la API se copia también `apps/api` completo antes de `nest build`.

### D4. Puertos: nativos dentro del contenedor, mapeo en host

- API: interna 3000, host 3000 (`3000:3000`).
- Admin: interna 4321 (`PORT=4321`, `HOST=0.0.0.0`), host 4322 (`4322:4321`) — el host conserva el 4322 documentado para no chocar con el preview de web.
- Web (Nginx): interna 80, host 4321 (`4321:80`).
- Variables como `PUBLIC_API_URL` de web/admin se inyectan en **build time** (Astro); en compose se pasan como `build.args`. Cambiarlas requiere rebuild de frontend: se documenta así en `docs/deployment.md`.

### D5. API en builder separa dependencias prod/dev

La etapa final de la API instala solo dependencias de producción (`pnpm install --frozen-lockfile --prod` en una etapa `deps-prod` propia) para no arrastrar Jest, ESLint, ts-node, etc. al runtime.

### D6. Compose simple, sin healthcheck orchestrado de web-build

El compose usa `build:` con `dockerfile` y `args` por servicio. El build de `apps/web` no depende de `api` en runtime del compose (la API de build-time es la apuntada por `PUBLIC_API_URL`, normalmente la de staging o vacía en local con degradación). Alternativa descartada: esperar a la API con `depends_on: condition: service_healthy` y construir web dentro del compose apuntando a la API local — acopla innecesariamente el build de web al health de la API y complica el primer `up`.

## Risks / Trade-offs

- [Build de web sin API → rutas de blog vacías en el artefacto] → comportamiento ya degradado grácilmente en `getStaticPaths`; en compose se documenta `PUBLIC_API_URL` hacia staging. El contenido se hidrata en runtime vía `blog-fetch.ts`, así que el sitio sigue funcional.
- [`PUBLIC_*` congeladas en build del frontend] → cambiar URL de API exige rebuild; documentado explícitamente.
- [`node:26-alpine` + sharp/protobufjs] → dependencias con binarios nativos ya declaradas en `onlyBuiltDependencies`; Alpine glibc/musl compatible con sharp (precarga binarios musl). Riesgo bajo, verificado con el build real de la imagen.
- [Imagen de admin más grande por node_modules del runner] → runner alpino + `pnpm prune --prod`-equivalente (instalación solo-prod copiada); aceptable para staging.
- [Compose local no valida secretos] → `.env` raíz con `.env.example` actualizado; `.dockerignore` excluye `.env` del contexto.

## Migration Plan

1. Crear Dockerfiles web/admin y reemplazar los de API; crear `.dockerignore` raíz.
2. Crear `docker-compose.yml` raíz y `.env.example` raíz si falta.
3. Eliminar `apps/api/docker/` (Dockerfile, compose, .dockerignore legacy).
4. Actualizar `docs/deployment.md` (y nota en `docs/deploy-standards.md` si referencia rutas legacy).
5. Verificación: `docker build` de las 3 imágenes + `docker compose up` con smoke tests (`/health`, `/login`, `/`).
6. Rollback: los Dockerfiles legacy se eliminan; rollback = revert del commit (no había flujo contenedorizado funcional que conservar).

## Open Questions

- ¿Nombre/dominios finales en Coolify para admin y API? (No bloquea: son valores de variables, no del diseño.)
