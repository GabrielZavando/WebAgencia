## MODIFIED Requirements

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
