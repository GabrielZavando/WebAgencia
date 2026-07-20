# Data Model — WebAgenciaAstro

> Visión a futuro del dominio. Las entidades se documentan aunque su backend aún no exista —
> el código cliente se apoya en estas definiciones.
> Este proyecto **NO escribe** en estas entidades; sólo las consume vía API.

## Entidades del dominio

### Lead (captura pública de formulario de contacto)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador generado por backend |
| name | string (2-120) | Nombre del contacto |
| email | string (email) | Email de contacto |
| phone | string? | Teléfono (opcional) |
| subject | string? | Asunto (opcional) |
| message | string (10+) | Mensaje |
| turnstileToken | string? | Cloudflare Turnstile token |
| receivedAt | timestamp (server) | Cuándo se recibió |

**Reglas**:
- Anti-spam: honeypot + Turnstile + análisis de contenido (cooldown 2 min cliente)
- Validación cliente: email regex, longitud mínima/máxima

### BlogPost

| Campo | Tipo | Descripción |
|-------|------|-------------|
| slug | string (PK) | URL slug único |
| title | string | Título |
| excerpt | string? | Resumen corto |
| content | string (HTML sanitizado) | Cuerpo del post |
| coverImage | string (URL) | Imagen portada |
| category | string? | Categoría |
| author | string | Autor |
| publishedAt | ISO date? | Fecha publicación |
| published | boolean | Estado publicación |
| createdAt | timestamp | Creación |
| updatedAt | timestamp | Última edición |

**Reglas**:
- El cliente consume sólo `published === true`
- El contenido se sanitiza en cliente antes de inyectar (strip `<script>`, `<style>`, doctype)
- Cache sessionStorage 5 min

### Service / Plan / MenuItem (datos estáticos locales)

Estos viven en `src/data/*.json` como datos estáticos. **No son entidades de dominio**.

| Archivo | Contenido |
|---------|-----------|
| `src/data/services.json` | Lista de servicios offerts (3 packs/paquetes) |
| `src/data/plans.json` | Planes tarifarios |
| `src/data/menu.json` | Items del menú de navegación |

### SystemConfig

| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | string | Nombre del sitio |
| description | string | Descripción SEO |
| websiteUrl | string (URL) | URL canónica |
| logoUrl | string (URL) | Logo |
| address | string | Dirección física |
| phone | string | Teléfono |
| email | string | Email de contacto |
| social | object | Redes sociales |

**Origen**: `src/config/company.config.ts` (estático fallback) + API vía `src/utils/config.ts`.
**Reglas**:
- El fallback estático siempre debe existir (build SSG no requiere API)
- El cliente intenta obtener config dinámica en runtime pero no bloquea si falla

### DiagnosticSubmission (futuro)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador |
| answers | object | Respuestas del wizard |
| contact | object | Datos de contacto |
| submittedAt | timestamp | Cuándo se envió |

**Origen**: Formulario dinámico en `src/scripts/diagnostico-form.ts` (~22K bytes).
**Reglas**: Validación local antes de POST a `/diagnostico` (endpoint aún no documentado).

### ClientUser (futuro, login admin único)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| email | string (PK) | Único email del admin |
| passwordHash | string | Hash bcrypt/argon2 (backend only — NUNCA expuesto) |
| role | "admin" (literal) | Único rol permitido |
| createdAt | timestamp | Creación |

**Reglas**:
- **Solo 1 usuario admin** en el sistema (no es multi-tenant)
- **No hay endpoint de registro** público
- **No hay UI de recuperación de contraseña** (proceso manual fuera de banda)
- La creación del admin ocurre vía seed/script del backend, no desde el cliente

### AuthSession (futuro, login admin)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| token | string (JWT) | Bearer token |
| user.email | string | Email del admin |
| user.role | "admin" | Rol |
| expiresAt | ISO date-time | Expiración |

**Reglas cliente**:
- Token se almacena en cookie `httpOnly` (gestionado por backend; cliente sólo lo lee vía API cuando aplique)
- Frontend NO guarda el token en localStorage para evitar XSS
- Refresh token fuera de alcance (la sesión dura hasta `expiresAt`)

## Reglas de negocio del dominio

- **ClienteLead**: un lead nunca se reenvía automáticamente al cliente. Es para uso interno del dueño del sitio.
- **Blog visibilidad**: sólo `published === true` aparece en listados y sitemap.
- **Login admin**: 1 solo usuario, sin registro público, sin recovery UI.
- **Idioma**: contenido del sitio en **español**; nombres de campos de API/datos en **inglés**.

## Convenciones de nombres

- Tablas backend (NestJS): plural, snake_case, inglés (`leads`, `blog_posts`, `users`)
- Campos FK: `{tabla_referenciada_singular}_id` (`user_id`)
- Timestamps: `created_at` y `updated_at` en backend; serializados a camelCase en JSON (`createdAt`)
- Validación frontend compartida con backend (mismo schema, doble fuente de verdad)

## Anti-patterns prohibidos

- ❌ Exponer `passwordHash` o `password` en respuestas API
- ❌ Guardar JWT en `localStorage` desde el cliente (XSS)
- ❌ Endpoint público de registro
- ❌ Rol distinto a `admin` en JWT del cliente
- ❌ Persistir datos de Lead en `src/data/` (siempre dinámica API)
