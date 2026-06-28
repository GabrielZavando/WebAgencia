## ADDED Requirements

### Requirement: List users (admin only)
The system SHALL allow admins to list all users with pagination.

#### Scenario: Admin lists users successfully
- **WHEN** GET /api/v1/users is called by an admin
- **THEN** returns 200 with { data: User[], meta: Pagination }
- **AND** each user has id, email, full_name, role, avatar_url, is_active, created_at, updated_at

#### Scenario: Non-admin cannot list users
- **WHEN** GET /api/v1/users is called by an editor
- **THEN** returns 403 with { error: "Forbidden", message: "Acceso denegado", statusCode: 403 }

#### Scenario: Pagination parameters
- **WHEN** GET /api/v1/users?page=2&limit=20 is called
- **THEN** returns users 21-40
- **AND** meta includes { total, page: 2, limit: 20 }

### Requirement: Create user (admin only)
The system SHALL allow admins to create new users.

#### Scenario: Admin creates user successfully
- **WHEN** POST /api/v1/users is called with email, full_name, role
- **THEN** creates user document in Firestore
- **AND** returns 201 with { data: User, meta: { message: "Usuario creado exitosamente" } }

#### Scenario: Create user with duplicate email
- **WHEN** POST /api/v1/users is called with existing email
- **THEN** returns 400 with { error: "Bad Request", message: "El email ya existe", statusCode: 400 }

#### Scenario: Create user with invalid data
- **WHEN** POST /api/v1/users is called with missing required fields
- **THEN** returns 400 with validation errors

### Requirement: Get user by ID (admin only)
The system SHALL allow admins to get a specific user.

#### Scenario: Admin gets existing user
- **WHEN** GET /api/v1/users/{id} is called by an admin
- **THEN** returns 200 with { data: User }

#### Scenario: Get non-existent user
- **WHEN** GET /api/v1/users/{id} is called with non-existent ID
- **THEN** returns 404 with { error: "Not Found", message: "Usuario no encontrado", statusCode: 404 }

### Requirement: Update user (admin only)
The system SHALL allow admins to update user data.

#### Scenario: Admin updates user successfully
- **WHEN** PATCH /api/v1/users/{id} is called with valid data
- **THEN** updates the user document in Firestore
- **AND** returns 200 with { data: User, meta: { message: "Usuario actualizado exitosamente" } }

#### Scenario: Update non-existent user
- **WHEN** PATCH /api/v1/users/{id} is called with non-existent ID
- **THEN** returns 404 with { error: "Not Found", message: "Usuario no encontrado", statusCode: 404 }

#### Scenario: Update user with invalid role
- **WHEN** PATCH /api/v1/users/{id} is called with role not in [admin, editor]
- **THEN** returns 400 with validation error

### Requirement: User roles
The system SHALL support admin and editor roles.

#### Scenario: Role permissions
- **WHEN** an admin user makes a request
- **THEN** they can manage users, categories, and articles
- **WHEN** an editor user makes a request
- **THEN** they can only manage categories and articles (not users)