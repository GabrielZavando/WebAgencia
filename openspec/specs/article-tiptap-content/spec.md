## ADDED Requirements

### Requirement: Article content is stored as Tiptap JSON
The system SHALL store the `content` field of an article as a Tiptap JSON document (object with `type: 'doc'` and `content: array`) in Firestore, and SHALL return the exact same object on reads.

### Requirement: Create article with Tiptap content
The system SHALL allow authenticated admin/editor users to create articles where the `content` field is a valid Tiptap JSON document.

#### Scenario: Create article with valid Tiptap JSON
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with a body containing `title`, `slug`, `content` (valid Tiptap JSON), `cover_url`, `category_id`, `status`, and optionally `tags`
- **THEN** the API returns `201 Created` with the created article object
- **AND** the `content` field in Firestore is stored as an object (not a string)

#### Scenario: Create article fails with invalid Tiptap JSON
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with `content` that is not a valid Tiptap document (missing `type: 'doc'`, `content` not an array, or not an object)
- **THEN** the API returns `400 Bad Request` with error message `"El contenido debe ser un documento Tiptap válido"`

#### Scenario: Create article fails when content exceeds 5MB
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with `content` whose serialized size exceeds 5 MB
- **THEN** the API returns `400 Bad Request` with error message `"El contenido no puede superar los 5 MB"`

#### Scenario: Create article fails with missing required fields
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with a missing or empty required field (`title`, `slug`, `cover_url`, `category_id`, `status`, or `content`)
- **THEN** the API returns `400 Bad Request` with field-specific error messages

### Requirement: Retrieve article with Tiptap content
The system SHALL return the `content` field as a Tiptap JSON object when retrieving an article by ID or slug.

#### Scenario: Get article by ID returns Tiptap JSON content
- **WHEN** a client GETs `/api/v1/articles/:id`
- **THEN** the response `200 OK` includes the article with `content` as a Tiptap JSON object

#### Scenario: Get article by slug returns Tiptap JSON content
- **WHEN** a client GETs `/api/v1/articles/:slug`
- **THEN** the response `200 OK` includes the article with `content` as a Tiptap JSON object

#### Scenario: Get non-existent article returns 404
- **WHEN** a client GETs `/api/v1/articles/non-existent-id`
- **THEN** the API returns `404 Not Found` with error message in Spanish

### Requirement: Update article with Tiptap content
The system SHALL allow authenticated admin/editor users to update the `content` field of an existing article with a new valid Tiptap JSON document.

#### Scenario: Update article content with valid Tiptap JSON
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with a new `content` field (valid Tiptap JSON)
- **THEN** the API returns `200 OK` with the updated article
- **AND** the `content` field in Firestore reflects the new Tiptap JSON object

#### Scenario: Update article content with invalid Tiptap JSON fails
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with `content` that is not a valid Tiptap document
- **THEN** the API returns `400 Bad Request` with error message `"El contenido debe ser un documento Tiptap válido"`

#### Scenario: Partial update does not modify unchanged fields
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with only `title`
- **THEN** the article's `content`, `cover_url`, `category_id`, `tags`, `status`, and `author_id` remain unchanged

### Requirement: Publish and unpublish articles
The system SHALL allow authenticated admin/editor users to change the `status` of an article between `draft` and `published`.

#### Scenario: Publish a draft article
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with `status: "published"`
- **THEN** the API returns `200 OK` with `status: "published"`
- **AND** the `content` field remains unchanged (still a Tiptap JSON object)

#### Scenario: Unpublish a published article
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with `status: "draft"`
- **THEN** the API returns `200 OK` with `status: "draft"`

### Requirement: Delete article
The system SHALL allow authenticated admin users to delete articles.

#### Scenario: Admin deletes an article
- **WHEN** an authenticated admin DELETE to `/api/v1/articles/:id`
- **THEN** the API returns `200 OK` with success message
- **AND** the article document is removed from Firestore

#### Scenario: Non-admin cannot delete an article
- **WHEN** an authenticated editor DELETE to `/api/v1/articles/:id`
- **THEN** the API returns `403 Forbidden` with error message `"No tienes permisos para realizar esta acción"`

### Requirement: Author ID remains immutable
The system SHALL NOT allow modification of the `author_id` field after an article is created.

#### Scenario: author_id is not exposed in UpdateArticleDto
- **WHEN** an authenticated admin/editor PATCHes `/api/v1/articles/:id` with `author_id` in the body
- **THEN** the API ignores the `author_id` field and does not update it in Firestore

### Requirement: Duplicate slug is rejected
The system SHALL reject creation or update of an article if the `slug` is already in use (case-insensitive).

#### Scenario: Create article with duplicate slug fails
- **WHEN** an authenticated admin/editor POSTs to `/api/v1/articles` with a `slug` already used by another article
- **THEN** the API returns `409 Conflict` with error message `"El slug ya está en uso"`

### Requirement: Article listing returns Tiptap JSON content
The system SHALL return `content` as a Tiptap JSON object in article listings (GET `/api/v1/articles`).

#### Scenario: List articles returns Tiptap JSON content in each item
- **WHEN** a client GETs `/api/v1/articles` with pagination
- **THEN** each article item in the response has `content` as a Tiptap JSON object

### Requirement: Unauthenticated requests are rejected
The system SHALL return `401 Unauthorized` for create, update, and delete operations without a valid Firebase JWT. The `GET /api/v1/articles` endpoint SHALL allow unauthenticated requests but only return published articles.

#### Scenario: Unauthenticated create fails
- **WHEN** an unauthenticated client POSTs to `/api/v1/articles`
- **THEN** the API returns `401 Unauthorized`

#### Scenario: Unauthenticated update fails
- **WHEN** an unauthenticated client PATCHes `/api/v1/articles/:id`
- **THEN** the API returns `401 Unauthorized`

#### Scenario: Unauthenticated delete fails
- **WHEN** an unauthenticated client DELETEs to `/api/v1/articles/:id`
- **THEN** the API returns `401 Unauthorized`

#### Scenario: Unauthenticated list returns only published articles
- **WHEN** an unauthenticated client GETs `/api/v1/articles`
- **THEN** the response contains only articles with `status: "published"`

#### Scenario: Invalid token in list request returns 401
- **WHEN** a client GETs `/api/v1/articles` with an invalid Authorization header
- **THEN** the API returns `401 Unauthorized`