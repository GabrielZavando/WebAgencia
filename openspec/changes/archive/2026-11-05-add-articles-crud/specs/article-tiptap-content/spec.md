## ADDED Requirements

### Requirement: Public article retrieval by slug

The system **SHALL** expose `GET /api/v1/articles/slug/:slug` as the public endpoint for fetching a single article by its slug, returning the `content` field as a Tiptap JSON object.

#### Scenario: Published article is returned by slug
- **WHEN** a client GETs `/api/v1/articles/slug/como-optimizar-tu-sitio-web`
- **THEN** the API returns `200 OK` with the article whose `slug` matches
- **AND** the response includes `content` as a Tiptap JSON object with `type: 'doc'`

#### Scenario: Draft article is not exposed publicly by slug
- **WHEN** a client GETs `/api/v1/articles/slug/:slug` for an article whose `status` is `draft`
- **THEN** the API returns `404 Not Found` with the message `"Artículo no encontrado"`

#### Scenario: Unknown slug returns 404
- **WHEN** a client GETs `/api/v1/articles/slug/no-existe`
- **THEN** the API returns `404 Not Found` with the message `"Artículo no encontrado"`

### Requirement: Article listing filters and pagination

The system **SHALL** support pagination (`page`, `limit`) and optional filters (`status`, `category_id`) on `GET /api/v1/articles`, forcing `status=published` for unauthenticated requests.

#### Scenario: Authenticated request filters by status and category
- **WHEN** an authenticated admin/editor GETs `/api/v1/articles?status=draft&category_id=cat123&page=2&limit=20`
- **THEN** the API returns `200 OK` with drafts belonging to `cat123`
- **AND** `meta` includes `total`, `page: 2` and `limit: 20`

#### Scenario: Unauthenticated request only sees published articles
- **WHEN** an unauthenticated client GETs `/api/v1/articles?status=draft`
- **THEN** the API returns `200 OK`
- **AND** every returned article has `status: "published"`

#### Scenario: Limit is capped to a safe maximum
- **WHEN** a client GETs `/api/v1/articles?limit=500`
- **THEN** the API returns at most 100 articles
- **AND** `meta.limit` is `100`

### Requirement: Duplicate slug rejection uses HTTP 409

The system **SHALL** respond with HTTP status `409 Conflict` when creating or updating an article with a slug already used by another article.

#### Scenario: Create with duplicate slug returns 409
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with a slug already in use
- **THEN** the HTTP status code is `409`
- **AND** the response message is `"El slug ya está en uso"`

#### Scenario: Update to a duplicate slug returns 409
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with a slug used by a different article
- **THEN** the HTTP status code is `409`
- **AND** the response message is `"El slug ya está en uso"`
