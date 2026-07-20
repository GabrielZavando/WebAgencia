## ADDED Requirements

### Requirement: JWT secret is mandatory at startup
The system SHALL throw an error at startup if `JWT_SECRET` environment variable is not defined. The system SHALL NOT use a hardcoded fallback secret.

#### Scenario: Application starts with JWT_SECRET defined
- **WHEN** the application starts with `JWT_SECRET` environment variable set
- **THEN** the application initializes successfully

#### Scenario: Application fails to start without JWT_SECRET
- **WHEN** the application starts without `JWT_SECRET` environment variable
- **THEN** the application throws an error and fails to start

### Requirement: CORS is explicitly configured
The system SHALL respond with `Access-Control-Allow-Origin` header matching the configured `CORS_ORIGIN` environment variable. The default value SHALL be `http://localhost:4321`.

#### Scenario: CORS headers present in response
- **WHEN** a client makes a request with `Origin: http://localhost:4321`
- **THEN** the response includes `Access-Control-Allow-Origin: http://localhost:4321`

#### Scenario: Preflight OPTIONS request is handled
- **WHEN** a client sends an OPTIONS request with `Access-Control-Request-Method: POST`
- **THEN** the response includes appropriate CORS headers and status 204

### Requirement: Security headers are present via Helmet
The system SHALL include security headers in all responses via Helmet middleware.

#### Scenario: X-Content-Type-Options header is present
- **WHEN** a client makes any request
- **THEN** the response includes `X-Content-Type-Options: nosniff`

#### Scenario: X-Frame-Options header is present
- **WHEN** a client makes any request
- **THEN** the response includes `X-Frame-Options: SAMEORIGIN`

### Requirement: Rate limiting is enforced
The system SHALL limit requests to 100 per minute by default. The system SHALL return `429 Too Many Requests` when the limit is exceeded.

#### Scenario: Request within rate limit succeeds
- **WHEN** a client makes fewer than 100 requests in one minute
- **THEN** all requests succeed with appropriate status codes

#### Scenario: Request exceeding rate limit is rejected
- **WHEN** a client makes more than 100 requests in one minute
- **THEN** subsequent requests return `429 Too Many Requests` with error message in Spanish

### Requirement: Firebase token revocation is checked
The system SHALL verify token revocation when validating Firebase ID tokens. Revoked tokens SHALL be rejected with `401 Unauthorized`.

#### Scenario: Valid non-revoked token is accepted
- **WHEN** a client sends a valid, non-revoked Firebase ID token
- **THEN** the token is accepted and the user is authenticated

#### Scenario: Revoked token is rejected
- **WHEN** a client sends a revoked Firebase ID token
- **THEN** the API returns `401 Unauthorized` with error message `"Token inválido"`

### Requirement: Optional authentication for article listing
The system SHALL allow unauthenticated requests to `GET /api/v1/articles` but only return published articles. Authenticated requests MAY include draft articles based on query parameters.

#### Scenario: Unauthenticated request returns only published articles
- **WHEN** a client GETs `/api/v1/articles` without an Authorization header
- **THEN** the response contains only articles with `status: "published"`

#### Scenario: Authenticated request can filter by status
- **WHEN** an authenticated client GETs `/api/v1/articles?status=draft`
- **THEN** the response contains articles with `status: "draft"`

#### Scenario: Invalid token in authenticated request returns 401
- **WHEN** a client GETs `/api/v1/articles` with an invalid Authorization header `Bearer invalid-token`
- **THEN** the API returns `401 Unauthorized`
