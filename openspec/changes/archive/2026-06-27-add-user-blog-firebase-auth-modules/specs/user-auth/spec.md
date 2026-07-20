## ADDED Requirements

### Requirement: Login with Firebase ID token
The system SHALL allow users to authenticate by exchanging a Firebase ID token for a custom JWT.

#### Scenario: Successful login with valid Firebase token
- **WHEN** POST /api/v1/auth/login is called with valid Firebase id_token
- **THEN** the system verifies the token with Firebase Admin SDK
- **AND** finds or creates the user in Firestore `users` collection (upsert by email)
- **AND** generates a custom JWT with payload { userId, email, role }
- **AND** returns 200 with { data: { user, token }, meta: { message: "Inicio de sesión exitoso" } }

#### Scenario: Login with invalid Firebase token
- **WHEN** POST /api/v1/auth/login is called with invalid or expired Firebase id_token
- **THEN** the system returns 401 with { error: "Unauthorized", message: "Token inválido", statusCode: 401 }

#### Scenario: Login with malformed request
- **WHEN** POST /api/v1/auth/login is called without id_token field
- **THEN** the system returns 400 with { error: "Bad Request", message: "El token es requerido", statusCode: 400 }

### Requirement: Get authenticated user profile
The system SHALL return the current authenticated user's profile.

#### Scenario: Get profile with valid JWT
- **WHEN** GET /api/v1/auth/me is called with valid Authorization header (Bearer token)
- **THEN** the system validates the JWT signature and expiration
- **AND** returns 200 with { data: User }
- **AND** the user data includes id, email, full_name, role, avatar_url, is_active, created_at

#### Scenario: Get profile without token
- **WHEN** GET /api/v1/auth/me is called without Authorization header
- **THEN** the system returns 401 with { error: "Unauthorized", message: "No autenticado", statusCode: 401 }

#### Scenario: Get profile with expired JWT
- **WHEN** GET /api/v1/auth/me is called with expired JWT
- **THEN** the system returns 401 with { error: "Unauthorized", message: "Token expirado", statusCode: 401 }

### Requirement: JWT token structure
The system SHALL generate JWTs with specific claims and expiration.

#### Scenario: JWT contains required claims
- **WHEN** a successful login occurs
- **THEN** the generated JWT contains: sub (userId), email, role, iat, exp
- **AND** the token expires in 7 days (604800 seconds)

### Requirement: User upsert on login
The system SHALL create user in Firestore if not exists on first login.

#### Scenario: New user login creates Firestore document
- **WHEN** a user logs in with valid Firebase token but email not in Firestore
- **THEN** the system creates a new document in `users` collection
- **AND** sets email, role as "editor", is_active as true
- **AND** full_name from Firebase token claims or empty string

#### Scenario: Existing user login updates updated_at
- **WHEN** a user logs in and already exists in Firestore
- **THEN** the system updates the `updated_at` field
- **AND** returns existing user data (no role change)