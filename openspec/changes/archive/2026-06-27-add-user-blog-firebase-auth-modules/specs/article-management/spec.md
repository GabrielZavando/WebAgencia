## ADDED Requirements

### Requirement: List articles (public with filters)
The system SHALL allow anyone to list published articles with optional filters.

#### Scenario: List published articles
- **WHEN** GET /api/v1/articles is called without authentication
- **THEN** returns only articles with status "published"
- **AND** each article has id, title, slug, content, cover_url, category_id, tags, status, author_id, created_at, updated_at

#### Scenario: Filter by category
- **WHEN** GET /api/v1/articles?category_id={id} is called
- **THEN** returns only articles in that category with status published

#### Scenario: Filter by status (for authenticated users)
- **WHEN** GET /api/v1/articles?status=draft is called by admin/editor
- **THEN** returns articles with draft status
- **WHEN** called without authentication
- **THEN** returns only published articles (ignores status filter)

#### Scenario: Pagination
- **WHEN** GET /api/v1/articles?page=1&limit=10 is called
- **THEN** returns up to 10 articles
- **AND** meta includes { total, page: 1, limit: 10 }

#### Scenario: Max limit enforcement
- **WHEN** GET /api/v1/articles?limit=200 is called
- **THEN** returns maximum 100 articles (limit capped)
- **AND** meta.limit is 100

### Requirement: Get article by ID or slug (public)
The system SHALL allow anyone to get a single article.

#### Scenario: Get published article by ID
- **WHEN** GET /api/v1/articles/{id} is called with valid article ID
- **THEN** returns 200 with { data: Article }

#### Scenario: Get published article by slug
- **WHEN** GET /api/v1/articles/{slug} is called with valid article slug
- **THEN** returns 200 with { data: Article }

#### Scenario: Get non-existent article
- **WHEN** GET /api/v1/articles/{id} is called with non-existent ID
- **THEN** returns 404 with { error: "Not Found", message: "Artículo no encontrado", statusCode: 404 }

### Requirement: Create article (admin/editor)
The system SHALL allow admins and editors to create articles.

#### Scenario: Create article successfully
- **WHEN** POST /api/v1/articles is called with title, slug, content, cover_url, category_id, status
- **THEN** creates article document in Firestore with author_id from JWT
- **AND** returns 201 with { data: Article, meta: { message: "Artículo creado exitosamente" } }

#### Scenario: Create article with duplicate slug
- **WHEN** POST /api/v1/articles is called with existing slug
- **THEN** returns 400 with { error: "Bad Request", message: "El slug ya existe", statusCode: 400 }

#### Scenario: Create article without required fields
- **WHEN** POST /api/v1/articles is called with missing required fields
- **THEN** returns 400 with validation errors

### Requirement: Update article (admin/editor)
The system SHALL allow admins and editors to update articles.

#### Scenario: Update article successfully
- **WHEN** PATCH /api/v1/articles/{id} is called with valid data
- **THEN** updates the article document in Firestore
- **AND** returns 200 with { data: Article, meta: { message: "Artículo actualizado exitosamente" } }

#### Scenario: Update non-existent article
- **WHEN** PATCH /api/v1/articles/{id} is called with non-existent ID
- **THEN** returns 404 with { error: "Not Found", message: "Artículo no encontrado", statusCode: 404 }

### Requirement: Delete article (admin only)
The system SHALL allow only admins to delete articles.

#### Scenario: Admin deletes article
- **WHEN** DELETE /api/v1/articles/{id} is called by an admin
- **THEN** deletes the article document from Firestore
- **AND** returns 200 with { meta: { message: "Artículo eliminado exitosamente" } }

#### Scenario: Editor cannot delete article
- **WHEN** DELETE /api/v1/articles/{id} is called by an editor
- **THEN** returns 403 with { error: "Forbidden", message: "Acceso denegado", statusCode: 403 }

### Requirement: Article status workflow
The system SHALL enforce article status transitions.

#### Scenario: Article status values
- **WHEN** creating or updating an article
- **THEN** status MUST be one of: "draft", "published"

#### Scenario: Article title length validation
- **WHEN** creating an article with title length < 5 or > 150 characters
- **THEN** returns 400 with validation error