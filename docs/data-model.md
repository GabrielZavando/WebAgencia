# Data Model

## Entidades del dominio

### Firebase Firestore

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

---

### Supabase PostgreSQL

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

---

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

## Convenciones de nombres

- Colecciones Firestore: singular, camelCase (`users`, `articles`)
- Tablas PostgreSQL: plural, snake_case (`leads`, `contact_messages`)
- Campos: snake_case en PostgreSQL, camelCase en Firestore
- Timestamps: siempre `created_at` y `updated_at`
- Slugs: lowercase, separados por guiones

## Migraciones Prisma

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy
```