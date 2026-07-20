## Why

El proyecto tiene 4 vulnerabilidades de seguridad CRÍTICAS y 5 ALTAS que deben resolverse antes de cualquier otra funcionalidad:

1. **JWT Secret hardcodeado** — El fallback `'default-secret-change-in-production'` en `auth/auth.module.ts` y `jwt.strategy.ts` permite forjar tokens si `JWT_SECRET` no está definido (y actualmente no lo está en `.env`).
2. **Auth falsa en artículos** — `articles.controller.ts` solo verifica que exista un header `Authorization: Bearer <cualquier cosa>`, sin validar el token. Cualquier atacante puede acceder a artículos draft.
3. **Sin CORS explícito** — `main.ts` no configura `app.enableCors()`, dependiendo de defaults inseguros.
4. **Sin headers de seguridad** — No se usa Helmet para headers como `X-Content-Type-Options`, `X-Frame-Options`.
5. **Sin rate limiting** — Endpoints públicos serán vulnerables a abuso cuando se implementen.
6. **Sin verificación de revocación de tokens** — `verifyIdToken()` no chequea tokens revocados en Firebase Auth.
7. **Clave privada Firebase en .env.example** — El archivo contiene el inicio de una clave privada real (truncada).

## What Changes

### Seguridad (Crítico)
- **JWT estricto**: Eliminar el fallback `'default-secret-change-in-production'`. Lanzar error al arrancar si `JWT_SECRET` falta.
- **Auth real en artículos**: Crear `OptionalAuthGuard` que valide JWT si existe, pero no falle si está ausente. Reemplazar la verificación manual falsa en `GET /articles`.
- **CORS explícito**: Configurar `app.enableCors()` con origen configurable vía `CORS_ORIGIN` (default: `http://localhost:4321` para Astro).
- **Helmet**: Instalar y configurar `helmet` para headers de seguridad.
- **Rate limiting**: Instalar `@nestjs/throttler` con throttling por defecto (100 req/min) y límites más bajos para endpoints públicos.
- **Token revocation**: Habilitar `checkRevoked: true` en `verifyIdToken()`.

### Configuración
- **`.env.example`**: Reemplazar clave privada truncada con `REPLACE_ME`. Agregar `JWT_SECRET=` y `CORS_ORIGIN=`.
- **`docker-compose.yml`**: Agregar `JWT_SECRET=${JWT_SECRET}` al servicio API.

### Testing
- Tests unitarios para el `OptionalAuthGuard`.
- Tests E2E para verificar CORS, rate limiting y headers de seguridad.

## Capabilities

### New Capabilities
- `security-hardening`: Seguridad de la API: JWT estricto, CORS, rate limiting, helmet, token revocation.

### Modified Capabilities
- `article-tiptap-content`: Se modifica `articles.controller.ts` para usar `OptionalAuthGuard` en lugar de la verificación manual falsa. Solo cambio de implementación, no de requerimientos de spec.

## Impact

- **Archivos afectados**:
  - `src/auth/auth.module.ts` — JWT secret estricto
  - `src/auth/strategies/jwt.strategy.ts` — JWT secret estricto
  - `src/articles/articles.controller.ts` — OptionalAuthGuard
  - `src/main.ts` — CORS + Helmet + ThrottlerModule
  - `src/firebase/firebase.service.ts` — Token revocation
  - `docker/docker-compose.yml` — JWT_SECRET
  - `.env.example` — Variables faltantes
  - `package.json` — helmet, @nestjs/throttler
- **Dependencias nuevas**: `helmet`, `@nestjs/throttler`
- **Seguridad**: Resolución de todas las vulnerabilidades críticas y altas.
