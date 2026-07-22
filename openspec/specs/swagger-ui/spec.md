# swagger-ui Specification

## Purpose
Provides interactive Swagger UI documentation for the API, versioned under `/api/v1/docs` in development environments.

## Requirements
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

### Requirement: API Endpoint Documentation
The system SHALL document all API endpoints using Swagger decorators that match the existing OpenAPI specification in `docs/api-spec.yml`.

#### Scenario: View authentication endpoints
- **WHEN** developer opens Swagger UI
- **THEN** authentication endpoints (`/auth/login`, `/auth/me`) are visible with correct request/response schemas

#### Scenario: View user management endpoints
- **WHEN** developer opens Swagger UI
- **THEN** user CRUD endpoints are visible with correct request/response schemas and role requirements

#### Scenario: View article and category endpoints
- **WHEN** developer opens Swagger UI
- **THEN** article and category endpoints are visible with Tiptap JSON content schema

#### Scenario: View leads endpoints
- **WHEN** developer opens Swagger UI
- **THEN** leads endpoints (`/leads/subscribe`, `/leads/contact`, `/leads`) are visible with correct schemas

### Requirement: Security Scheme Documentation
The system SHALL document Firebase Auth bearer token security scheme in Swagger UI.

#### Scenario: Authenticate via Swagger UI
- **WHEN** developer clicks "Authorize" button in Swagger UI
- **THEN** Swagger UI provides input field for Firebase ID token (Bearer authentication)

#### Scenario: Protected endpoints show authentication requirement
- **WHEN** viewing protected endpoints in Swagger UI
- **THEN** endpoints display lock icon indicating authentication is required

