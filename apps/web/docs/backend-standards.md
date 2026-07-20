# Backend Standards — WebAgenciaAstro

> Este proyecto **NO es un backend**. Es una landing SSG que **consume** una API externa (NestJS).
> Este archivo documenta el contrato esperado de la API consumida y reglas de integración.

## Alcance

- **Backend propio**: NO. No hay servidor, no hay API routes propias excepto `/sitemap.xml.ts`.
- **Backend consumido**: API NestJS externa. Documentar el **contrato del cliente** aquí.
- **Endpoint dinámico propio**: `src/pages/sitemap.xml.ts` (ejecutado en build time).

## API consumida

- Base URL: `PUBLIC_API_BASE_URL` / `PUBLIC_API_URL` (env)
- Cliente: `src/lib/api-client.ts` (fetch wrapper tipado)
- Version: rutas con `/api/v1/`
- Métodos disponibles: `apiClient.get/post/put/patch/delete`

### Reglas de integración

- Siempre usar `apiClient.*` — NUNCA `fetch()` directo
- Timeouts: 15s default (`timeout`)
- Reintentos: sólo en `NETWORK_ERROR` / `TIMEOUT_ERROR`, no en errores HTTP
- Turnstile: activar `injectTurnstile: true` en endpoints con formularios públicos
- Errores tipados via `ApiError` (`type`, `status`)
- Headers automáticos: `Content-Type: application/json` cuando hay body no-FormData
- Backoff exponencial: `retry.delayMs * (i + 1)`

### Anti-spam en endpoints públicos (contact, lead, newsletter)

El backend debe integrar:
- Honeypot field
- Cloudflare Turnstile (token `turnstile-token`)
- Análisis de contenido
- Verificación de tiempo de llenado

## Respuestas esperadas

- **OK**: JSON con datos o `204` sin contenido
- **Error**: `{ message: string, ... }` con códigos HTTP correctos
- **Errores 4xx esperados**: `400` validación, `401` no auth, `403` sin permisos, `404` no existe, `409` conflicto, `422` unprocessable
- **Errores 5xx**: `500` server error, `502/503` upstream

## Sitemap dinámico (endpoint propio)

`src/pages/sitemap.xml.ts` consulta `${API_BASE_URL}/blog` en build:
- Filtra solo `post.published === true`
- Genera XML estándar `https://www.sitemaps.org/schemas/sitemap/0.9`
- Cache `s-maxage=3600, stale-while-revalidate`
- Fallback silencioso: si API no responde, sólo incluye páginas estáticas

## Stack contrato backend esperado

```
Runtime:    Node.js 20+
Framework:  NestJS (presumido, ver docs/api-spec.yml)
API Style:  REST + JSON
Auth:       Bearer JWT (para endpoints autenticados futuros — login admin)
DB:         No relevante desde el cliente
Cache:      No relevante desde el cliente
```

## Validación

- El contrato se documenta en `docs/api-spec.yml` (OpenAPI 3.0)
- Cualquier cambio en endpoints consumidos → actualizar `docs/api-spec.yml` PRIMERO
- Cliente API generado: `pnpm gen:api` lee `../Api/swagger.json` → escribe `src/api/index.ts`
- Tests mockean `fetch` global con `vi.stubGlobal('fetch', ...)` o `msw`
