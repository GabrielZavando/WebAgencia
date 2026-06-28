## ADDED Requirements

### Requirement: List categories (public)
The system SHALL allow anyone to list all categories.

#### Scenario: List categories without authentication
- **WHEN** GET /api/v1/categories is called without authentication
- **THEN** returns 200 with { data: Category[] }
- **AND** each category has id, name, slug, description, created_at, updated_at

#### Scenario: Empty categories list
- **WHEN** GET /api/v1/categories is called and no categories exist
- **THEN** returns 200 with { data: [] }

### Requirement: Create category (admin/editor)
The system SHALL allow admins and editors to create categories.

#### Scenario: Authenticated user creates category
- **WHEN** POST /api/v1/categories is called with name, slug, description
- **THEN** creates category document in Firestore
- **AND** returns 201 with { data: Category, meta: { message: "Categoría creada exitosamente" } }

#### Scenario: Create category with duplicate slug
- **WHEN** POST /api/v1/categories is called with existing slug
- **THEN** returns 400 with { error: "Bad Request", message: "El slug ya existe", statusCode: 400 }

#### Scenario: Create category without authentication
- **WHEN** POST /api/v1/categories is called without JWT
- **THEN** returns 401 with { error: "Unauthorized", message: "No autenticado", statusCode: 401 }

### Requirement: Update category (admin/editor)
The system SHALL allow admins and editors to update categories.

#### Scenario: Update category successfully
- **WHEN** PATCH /api/v1/categories/{id} is called with valid data
- **THEN** updates the category document in Firestore
- **AND** returns 200 with { data: Category, meta: { message: "Categoría actualizada exitosamente" } }

#### Scenario: Update category with duplicate slug
- **WHEN** PATCH /api/v1/categories/{id} is called with slug belonging to another category
- **THEN** returns 400 with { error: "Bad Request", message: "El slug ya existe", statusCode: 400 }

#### Scenario: Update non-existent category
- **WHEN** PATCH /api/v1/categories/{id} is called with non-existent ID
- **THEN** returns 404 with { error: "Not Found", message: "Categoría no encontrada", statusCode: 404 }

### Requirement: Delete category (admin only)
The system SHALL allow only admins to delete categories.

#### Scenario: Admin deletes category
- **WHEN** DELETE /api/v1/categories/{id} is called by an admin
- **THEN** deletes the category document from Firestore
- **AND** returns 200 with { meta: { message: "Categoría eliminada exitosamente" } }

#### Scenario: Editor cannot delete category
- **WHEN** DELETE /api/v1/categories/{id} is called by an editor
- **THEN** returns 403 with { error: "Forbidden", message: "Acceso denegado", statusCode: 403 }

#### Scenario: Delete category with associated articles
- **WHEN** DELETE /api/v1/categories/{id} is called and category has articles
- **THEN** returns 400 with { error: "Bad Request", message: "La categoría tiene artículos asociados", statusCode: 400 }

### Requirement: Category slug validation
The system SHALL validate slugs are URL-friendly.

#### Scenario: Slug format validation
- **WHEN** POST /api/v1/categories is called with slug not matching pattern `^[a-z0-9]+(-[a-z0-9]+)*$`
- **THEN** returns 400 with validation error