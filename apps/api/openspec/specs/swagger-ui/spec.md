# swagger-ui Specification

## Purpose
TBD - created by archiving change add-swagger-docs. Update Purpose after archive.
## Requirements
### Requirement: Swagger UI Documentation Access
The system SHALL provide an interactive Swagger UI interface for API documentation in development environments.

#### Scenario: Access Swagger UI in development
- **WHEN** developer navigates to `/api/docs` in a browser during development
- **THEN** Swagger UI displays all API endpoints with interactive documentation

#### Scenario: Access Swagger JSON spec
- **WHEN** developer or tool requests `/api/docs-json`
- **THEN** system returns OpenAPI specification in JSON format

#### Scenario: Swagger UI not available in production
- **WHEN** application runs with `NODE_ENV=production`
- **THEN** Swagger UI endpoints are not accessible

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

