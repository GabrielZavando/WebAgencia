# Data Model — WebAstro (unificado)

> **Fuente de verdad del dominio** para el monorepo. Las entidades de backend
> (Firebase Firestore + Supabase PostgreSQL) son canónicas; el Frontend (Astro) las
> **consume** vía API y mantiene vistas cliente documentadas en
> [Vista consumida por el Frontend](#vista-consumida-por-el-frontend-web).
> Las [Entidades planeadas](#entidades-planeadas-futuro) aún no tienen backend.

## Backend — Firebase Firestore

---

### User

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string (Firebase UID) | Identificador único (Firebase Auth UID) |
| email | string | Email del usuario |
| full_name | string | Nombre completo |
| role | string | Rol del usuario: `admin` \| `editor` |
| avatar_url | string (nullable) | URL de avatar (opcional) |
| is_active | boolean | Si el usuario está activo |
| created_at | Timestamp | Fecha de creación |
| updated_at | Timestamp | Última modificación |

**Colección:** `users`

---

### Role

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único |
| name | string | Nombre del rol: `admin` \| `editor` |
| permissions | string[] | Lista de permisos |
| created_at | Timestamp | Fecha de creación |

**Colección:** `roles`

---

### Category

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único (Firestore auto-ID) |
| name | string | Nombre de la categoría |
| slug | string (único, indexado) | Slug URL-amigable |
| description | string (nullable) | Descripción opcional |
| created_at | Timestamp | Fecha de creación |
| updated_at | Timestamp | Última modificación |

**Colección:** `categories`

---

### Article

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único (Firestore auto-ID) |
| title | string | Título (5-150 caracteres) |
| slug | string (único, indexado) | Slug URL-amigable |
| content | Object (Tiptap JSON) | Cuerpo del artículo en formato Tiptap JSON (`{ type: 'doc', content: TiptapNode[] }`) |
| cover_url | string | URL de imagen de portada (Firebase Storage) |
| category_id | string | Referencia a category |
| tags | string[] (nullable) | Tags en minúsculas, sin espacios |
| status | string | Estado: `draft` \| `published` |
| author_id | string | Referencia a user |
| created_at | Timestamp | Fecha de creación |
| updated_at | Timestamp | Última modificación |

**Colección:** `articles`

**Índices:**
- `slug` único
- `status` + `created_at` compuesto
- `category_id`

**Nota:** El campo `content` almacena exactamente el objeto JSON que devuelve el editor Tiptap (versión 3.27.1). No se almacena como string plano. El formato es `{ type: 'doc', content: TiptapNode[] }` donde cada nodo puede tener `type`, `attrs`, `content` (anidado) y `marks`.

**Equivalencia Frontend:** el cliente consume `Article` como `BlogPost` vía `/articles` (también expuesto como `/blog` / `/blog/posts` en el contrato del cliente).

## Backend — Supabase PostgreSQL

---

### Lead

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador único |
| email | VARCHAR(255) UNIQUE | Email normalizado |
| full_name | VARCHAR(255) | Nombre sanitizado |
| status | VARCHAR(50) | Estado: `subscriber` \| `contact` |
| metadata | JSONB | event_id, timestamp, form_id, version |
| attribution | JSONB | utm_source, utm_medium, utm_campaign, etc. |
| payload | JSONB | identity_critical, profile_optional, custom_fields |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Última modificación |

**Tabla:** `leads`

---

### ContactMessage

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador único |
| lead_id | UUID (FK) | Referencia a leads |
| message | TEXT | Mensaje de contacto |
| created_at | TIMESTAMPTZ | Fecha de creación |

**Tabla:** `contact_messages`

---

## Estructura JSONB para Leads

### Metadata
```json
{
  "event_id": "UUID-v4-generado-por-api",
  "timestamp": "ISO-8601-server-time",
  "form_id": "formulario_newsletter_web OR formulario_contacto_web",
  "version": "1.1"
}
```

### Attribution
```json
{
  "utm_source": "formulario_suscripcion OR formulario_contacto",
  "utm_medium": "web",
  "utm_campaign": null,
  "utm_content": null,
  "utm_term": null,
  "landing_url": null
}
```

### Payload
```json
{
  "identity_critical": {
    "email": "string_normalizado",
    "full_name": "string_sanitizado"
  },
  "profile_optional": {
    "job_title": null,
    "company": "string OR null",
    "phone": null,
    "address": null,
    "industry_sector": null
  },
  "custom_fields": {
    "message": "string (solo en consultas de contacto)",
    "status": "subscriber OR contact"
  }
}
```

## Vista consumida por el Frontend (Web)

El Frontend no escribe en estas entidades; las consume vía API. A continuación se
documenta la **forma cliente** de las entidades backend y los datos que viven en el
propio Frontend.

### Lead (vista cliente → `POST /leads/contact`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | string (2-120) | Nombre del contacto |
| email | string (email) | Email de contacto |
| phone | string? | Teléfono (opcional) |
| subject | string? | Asunto (opcional) |
| message | string (10+) | Mensaje |
| turnstileToken | string? | Cloudflare Turnstile token |
| receivedAt | timestamp (server) | Cuándo se recibió |

**Reglas cliente:**
- Anti-spam: honeypot + Turnstile + análisis de contenido (cooldown 2 min en cliente)
- Validación cliente: email regex, longitud mínima/máxima
- El backend normaliza a `Lead` (PostgreSQL) con `status = contact`

### BlogPost (vista cliente → `/articles` ≡ `/blog`)

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

**Reglas cliente:**
- El cliente consume sólo `published === true`
- El contenido se sanitiza en cliente antes de inyectar (strip `<script>`, `<style>`, doctype)
- Cache sessionStorage 5 min

### SystemConfig (configuración del sitio)

No es una entidad de base de datos; es configuración consumida/leída por el Frontend.

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

**Origen:** `src/config/company.config.ts` (fallback estático) + API vía `src/utils/config.ts`.
**Reglas:**
- El fallback estático siempre debe existir (build SSG no requiere API)
- El cliente intenta obtener config dinámica en runtime pero no bloquea si falla

### Datos estáticos locales (NO son entidades de dominio)

Viven en `src/data/*.json` como datos estáticos del sitio.

| Archivo | Contenido |
|---------|-----------|
| `src/data/services.json` | Lista de servicios / packs (3 paquetes) |
| `src/data/plans.json` | Planes tarifarios |
| `src/data/menu.json` | Items del menú de navegación |

## Entidades planeadas (futuro)

Aún no tienen backend; el Frontend las anticipa en su diseño.

### ClientUser (login admin único)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| email | string (PK) | Único email del admin |
| passwordHash | string | Hash bcrypt/argon2 (backend only — NUNCA expuesto) |
| role | "admin" (literal) | Único rol permitido |
| createdAt | timestamp | Creación |

**Reglas:**
- **Solo 1 usuario admin** en el sistema (no es multi-tenant)
- **No hay endpoint de registro** público
- **No hay UI de recuperación de contraseña** (proceso manual fuera de banda)
- La creación del admin ocurre vía seed/script del backend, no desde el cliente

### AuthSession (login admin)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| token | string (JWT) | Bearer token |
| user.email | string | Email del admin |
| user.role | "admin" | Rol |
| expiresAt | ISO date-time | Expiración |

**Reglas cliente:**
- Token se almacena en cookie `httpOnly` (gestionado por backend)
- Frontend NO guarda el token en localStorage para evitar XSS
- Refresh token fuera de alcance (la sesión dura hasta `expiresAt`)

### DiagnosticSubmission (futuro)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador |
| answers | object | Respuestas del wizard |
| contact | object | Datos de contacto |
| submittedAt | timestamp | Cuándo se envió |

**Origen:** Formulario dinámico en `src/scripts/diagnostico-form.ts`.
**Reglas:** Validación local antes de POST a `/diagnostico` (endpoint aún no documentado).

## Reglas de negocio del dominio

- Un usuario puede ser `admin` o `editor`
- Solo `admin` puede gestionar usuarios y roles
- `admin` y `editor` pueden crear/editar artículos y categorías
- Un artículo debe tener estado `draft` o `published`
- Slugs de artículos y categorías deben ser únicos y URL-amigables
- Tags se sanitizan a minúsculas y sin espacios
- Los leads del newsletter tienen status `subscriber`
- Los leads del formulario de contacto tienen status `contact`
- Un lead puede actualizar su status de `subscriber` a `contact`
- Los mensajes de contacto se vinculan a un lead existente
- **ClienteLead**: un lead nunca se reenvía automáticamente al cliente; es para uso interno
- **Blog visibilidad**: sólo `published === true` aparece en listados y sitemap
- **Login admin**: 1 solo usuario, sin registro público, sin recovery UI
- **Idioma**: contenido del sitio en **español**; nombres de campos de API/datos en **inglés**

## Convenciones de nombres

- Colecciones Firestore: singular, camelCase (`users`, `articles`)
- Tablas PostgreSQL: plural, snake_case (`leads`, `contact_messages`)
- Campos: snake_case en PostgreSQL, camelCase en Firestore
- Tablas backend (NestJS): plural, snake_case, inglés (`leads`, `blog_posts`, `users`)
- Campos FK: `{tabla_referenciada_singular}_id` (`user_id`)
- Timestamps: siempre `created_at` y `updated_at` (backend) → serializados a camelCase en JSON (`createdAt`)
- Slugs: lowercase, separados por guiones
- Validación frontend compartida con backend (mismo schema, doble fuente de verdad)

## Anti-patterns prohibidos

- ❌ Exponer `passwordHash` o `password` en respuestas API
- ❌ Guardar JWT en `localStorage` desde el cliente (XSS)
- ❌ Endpoint público de registro
- ❌ Rol distinto a `admin` en JWT del cliente
- ❌ Persistir datos de Lead en `src/data/` (siempre dinámica API)

## Migraciones Prisma

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy
```
