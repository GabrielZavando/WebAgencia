## MODIFIED Requirements

### Requirement: Entidad Category en Firestore

The system **SHALL** persistir categorías en la colección `categories` con campos `id`, `name`, `slug`, `description` (nullable), `created_at` y `updated_at`, con `slug` indexado y único.

#### Scenario: Forma del documento
- **GIVEN** una categoría creada
- **WHEN** se lee su documento en Firestore
- **THEN** contiene `name`, `slug`, `description`, `created_at`, `updated_at` con timestamps del servidor

## ADDED Requirements

### Requirement: Slug único case-insensitive en categorías

The system **SHALL** rechazar la creación o actualización de una categoría si el `slug` ya está en uso por otra categoría (comparación case-insensitive).

#### Scenario: Creación con slug duplicado falla
- **GIVEN** una categoría con slug `tecnologia`
- **WHEN** se crea otra con el mismo slug
- **THEN** recibe `400` con mensaje `"El slug ya existe"`

#### Scenario: Actualización hacia slug duplicado falla
- **GIVEN** otra categoría con el slug destino
- **WHEN** se actualiza una categoría hacia ese slug
- **THEN** recibe `400` con mensaje `"El slug ya existe"`

### Requirement: Eliminar categoría bloqueada si tiene artículos asociados

The system **SHALL** bloquear el borrado de una categoría si tiene al menos un artículo asociado (referencia por `category_id`).

#### Scenario: Categoría con artículos asociados no se puede eliminar
- **GIVEN** una categoría con 1+ artículos
- **WHEN** un admin intenta eliminarla
- **THEN** recibe `400` con mensaje `"La categoría tiene artículos asociados"`
