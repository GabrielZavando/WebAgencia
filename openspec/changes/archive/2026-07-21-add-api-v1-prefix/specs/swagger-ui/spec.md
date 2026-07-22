## MODIFIED Requirements

### Requirement: Swagger UI Documentation Access
The system SHALL provide an interactive Swagger UI interface for API documentation in development environments at the versioned path `/api/v1/docs`.

#### Scenario: Access Swagger UI in development
- **WHEN** developer navigates to `/api/v1/docs` in a browser during development
- **THEN** Swagger UI displays all API endpoints with versioned paths (`/api/v1/auth`, `/api/v1/users`, etc.)

#### Scenario: Access Swagger JSON spec
- **WHEN** developer or tool requests `/api/v1/docs-json`
- **THEN** system returns OpenAPI specification in JSON format with versioned paths

#### Scenario: Swagger UI not available in production
- **WHEN** application runs with `NODE_ENV=production`
- **THEN** Swagger UI endpoints are not accessible

### Requirement: API Versioning
The system SHALL prefix all API endpoints with `/api/v1/` to enable future versioning without breaking changes.

#### Scenario: Access versioned auth endpoints
- **WHEN** client makes requests to `/api/v1/auth/login` or `/api/v1/auth/me`
- **THEN** system processes authentication requests correctly

#### Scenario: Access versioned user endpoints
- **WHEN** client makes requests to `/api/v1/users` endpoints
- **THEN** system processes user CRUD operations correctly

#### Scenario: Access versioned article endpoints
- **WHEN** client makes requests to `/api/v1/articles` endpoints
- **THEN** system processes article CRUD operations correctly

#### Scenario: Access versioned category endpoints
- **WHEN** client makes requests to `/api/v1/categories` endpoints
- **THEN** system processes category CRUD operations correctly

#### Scenario: Health check without versioning
- **WHEN** client makes request to `/health`
- **THEN** system returns health status (health check is NOT versioned)