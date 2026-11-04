## ADDED Requirements

### Requirement: Campo opcional cover_media_id referenciando colección media

The system SHALL permitir que un artículo referencie un documento de la colección `media` como imagen de portada mediante el campo opcional `cover_media_id`.

#### Scenario: Article with cover_media_id references existing media
- **WHEN** an article is created with `cover_media_id` set to a valid `media.id`
- **THEN** the article is stored with the reference to the media document
- **AND** the referenced media document exists in the `media` collection

#### Scenario: Article can be created without cover_media_id
- **WHEN** an article is created without `cover_media_id`
- **THEN** the article is stored successfully with `cover_media_id` as null or absent

### Requirement: Campo opcional tags en artículos

The system SHALL permitir que un artículo tenga un campo opcional `tags` como array de strings para etiquetado.

#### Scenario: Article with tags
- **WHEN** an article is created with `tags: ["seo", "web"]`
- **THEN** the article is stored with the tags array

#### Scenario: Article without tags
- **WHEN** an article is created without `tags`
- **THEN** the article is stored successfully with `tags` as null or absent

### Requirement: Modelo de datos del artículo con referencia a media

The system SHALL persistir artículos en la colección `articles` con los campos: `id`, `title`, `slug`, `content` (Tiptap JSON objeto), `cover_media_id` (referencia opcional a `media.id`, reemplaza a `cover_url` deprecado), `category_id` (referencia a `categories.id`), `tags` (array opcional), `status` (`draft` | `published`), `author_id`, `created_at`, `updated_at`.

#### Scenario: Article document structure
- **WHEN** an article is created and persisted to Firestore
- **THEN** the document contains `id`, `title`, `slug`, `content`, `cover_media_id`, `category_id`, `tags`, `status`, `author_id`, `created_at`, `updated_at`
- **AND** `content` is a Tiptap JSON object with `type: 'doc'` and `content: array`
- **AND** `category_id` references an existing document in `categories`
- **AND** `cover_media_id`, when present, references an existing document in `media`
- **AND** `status` is either `draft` or `published`

### Requirement: Slug único case-insensitive en artículos

The system SHALL rechazar la creación o actualización de un artículo si el `slug` ya está en uso por otro artículo (comparación case-insensitive).

#### Scenario: Create article with duplicate slug fails
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with a `slug` already used by another article
- **THEN** the API returns `409 Conflict` with error message `"El slug ya está en uso"`

#### Scenario: Update article to duplicate slug fails
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with a `slug` already used by a different article
- **THEN** the API returns `409 Conflict` with error message `"El slug ya está en uso"`

### Requirement: Status solo draft o published

The system SHALL permitir que el campo `status` de un artículo tome únicamente los valores `draft` o `published`.

#### Scenario: Create article with valid status
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with `status: "draft"` or `status: "published"`
- **THEN** the API returns `201 Created` with the article

#### Scenario: Create article with invalid status fails
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with `status: "archived"`
- **THEN** the API returns `400 Bad Request` with error message `"El estado debe ser draft o published"`

## MODIFIED Requirements

### Requirement: Author ID remains immutable

The system SHALL NOT allow modification of the `author_id` field after an article is created.

#### Scenario: author_id is not exposed in UpdateArticleDto
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with `author_id` in the body
- **THEN** the API ignores the `author_id` field and does not update it in Firestore

## REMOVED Requirements

### Requirement: Campo cover_url en artículos

**Reason**: Reemplazado por `cover_media_id` que referencia a la colección `media`, permitiendo reutilización de activos y metadatos asociados.

**Migration**: Cualquier código que utilice `cover_url` debe migrarse a `cover_media_id`. La URL de portada se resuelve consultando el documento de `media` referenciado por `cover_media_id`.
