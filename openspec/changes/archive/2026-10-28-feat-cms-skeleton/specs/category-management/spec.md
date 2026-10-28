# Spec Delta

## Purpose

Codificar el contrato del CRUD de categorías en `/api/v1/categories` (Firestore), incluyendo reglas de roles, unicidad de slug y protección de borrado con artículos asociados.

## ADDED Requirements

### Requirement: Entidad Category en Firestore
The system **SHALL** persistir categorías en la colección `categories` con campos `id`, `name`, `slug`, `description` (nullable), `created_at` y `updated_at`, con `slug` indexado y único.

#### Scenario: Forma del documento
- **GIVEN** una categoría creada
- **WHEN** se lee su documento en Firestore
- **THEN** contiene `name`, `slug`, `description`, `created_at`, `updated_at` con timestamps del servidor

### Requirement: Listar categorías (público)
The system **SHALL** exponer `GET /api/v1/categories` sin autenticación, retornando `{ data: Category[] }`.

#### Scenario: Listado público
- **WHEN** un cliente sin token hace `GET /api/v1/categories`
- **THEN** recibe `200` con `data` como array de categorías

#### Scenario: Sin categorías
- **GIVEN** la colección vacía
- **WHEN** se lista
- **THEN** recibe `200` con `data: []`

### Requirement: Crear categoría (Admin/Editor)
The system **SHALL** exponer `POST /api/v1/categories` para roles `admin` y `editor`, con `name` y `slug` URL-friendly requeridos y `description` opcional.

#### Scenario: Creación exitosa
- **WHEN** un admin/editor hace `POST` con body válido
- **THEN** recibe `201` con `data` (categoría creada) y `meta.message`

#### Scenario: Slug duplicado
- **GIVEN** una categoría con slug `tecnologia`
- **WHEN** se crea otra con el mismo slug
- **THEN** recibe `400` con mensaje `"El slug ya existe"`

#### Scenario: Slug no URL-friendly
- **WHEN** se envía `slug: "Tecnología Web!!"`
- **THEN** recibe `400` con mensaje de validación de slug

#### Scenario: Sin autenticación
- **WHEN** un cliente sin token hace `POST`
- **THEN** recibe `401 Unauthorized`

### Requirement: Actualizar categoría (Admin/Editor)
The system **SHALL** exponer `PATCH /api/v1/categories/:id` para roles `admin` y `editor` con actualización parcial.

#### Scenario: Actualización parcial
- **WHEN** se envía solo `name`
- **THEN** recibe `200` con `slug` y `description` sin cambios

#### Scenario: Slug duplicado en update
- **GIVEN** otra categoría con el slug destino
- **WHEN** se actualiza hacia ese slug
- **THEN** recibe `400` con mensaje `"El slug ya existe"`

#### Scenario: Categoría inexistente
- **WHEN** se actualiza un id inexistente
- **THEN** recibe `404` con mensaje `"Categoría no encontrada"`

### Requirement: Eliminar categoría (Solo admin)
The system **SHALL** exponer `DELETE /api/v1/categories/:id` solo para rol `admin`, bloqueando el borrado si tiene artículos asociados.

#### Scenario: Eliminación exitosa
- **WHEN** un admin elimina una categoría sin artículos
- **THEN** recibe `200` con `meta.message` y el documento desaparece de Firestore

#### Scenario: Categoría con artículos asociados
- **GIVEN** una categoría con 1+ artículos
- **WHEN** un admin intenta eliminarla
- **THEN** recibe `400` con mensaje `"La categoría tiene artículos asociados"`

#### Scenario: Editor no puede eliminar
- **WHEN** un editor autenticado hace `DELETE`
- **THEN** recibe `403 Forbidden`

#### Scenario: Categoría inexistente
- **WHEN** se elimina un id inexistente
- **THEN** recibe `404`
