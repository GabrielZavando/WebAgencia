# firestore-indexes Specification

## Purpose

Garantizar que las consultas de artículos (filtrado por `status` y orden por `created_at`) cuenten con los índices compuestos de Firestore necesarios, evitando errores `FAILED_PRECONDITION` en producción y asegurando que dichos índices se definan de forma reproducible.

## Requirements
### Requirement: Firestore Composite Index for Articles
The system SHALL have a composite index on the `articles` collection to support queries that filter by `status` and order by `created_at`.

#### Scenario: List published articles
- **WHEN** client requests `GET /api/v1/articles?status=published`
- **THEN** system returns articles ordered by `created_at` without `FAILED_PRECONDITION` error

#### Scenario: List draft articles
- **WHEN** client requests `GET /api/v1/articles?status=draft` (authenticated user)
- **THEN** system returns draft articles ordered by `created_at` without error

#### Scenario: Index configuration documented
- **WHEN** developer deploys to a new Firebase project
- **THEN** `firestore.indexes.json` contains the composite index definition for automated deployment

