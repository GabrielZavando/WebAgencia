# firestore-indexes Specification

## Purpose

Garantizar que las consultas de artículos (filtrado por `status` y orden por `created_at`) cuenten con los índices compuestos de Firestore necesarios, evitando errores `FAILED_PRECONDITION` en producción y asegurando que dichos índices se definan de forma reproducible.

## Requirements
### Requirement: Firestore Composite Index for Articles
The system SHALL have composite indexes on the `articles` collection to support queries that filter by `status` and/or `category_id` and order by `created_at` descending, avoiding `FAILED_PRECONDITION` errors in production and ensuring indexes are defined reproducibly.

#### Scenario: List published articles ordered by created_at desc
- **WHEN** client requests `GET /api/v1/articles?status=published`
- **THEN** system returns articles ordered by `created_at` descending without `FAILED_PRECONDITION` error
- **THEN** `firestore.indexes.json` contains an index with fields `status` ASC, `created_at` DESC, `__name__` ASC on collection `articles`

#### Scenario: List draft articles ordered by created_at desc
- **WHEN** client requests `GET /api/v1/articles?status=draft` (authenticated user)
- **THEN** system returns draft articles ordered by `created_at` descending without error
- **THEN** `firestore.indexes.json` contains an index with fields `status` ASC, `created_at` DESC, `__name__` ASC on collection `articles`

#### Scenario: List articles by category and status ordered by created_at desc
- **WHEN** client requests `GET /api/v1/articles?category_id=<x>&status=published`
- **THEN** system returns articles filtered by category and status, ordered by `created_at` descending without error
- **THEN** `firestore.indexes.json` contains an index with fields `category_id` ASC, `status` ASC, `created_at` DESC, `__name__` ASC on collection `articles`

#### Scenario: Count articles by category and status
- **WHEN** system executes `count()` filtered by `category_id` and `status`
- **THEN** system returns the count without error
- **THEN** `firestore.indexes.json` contains an index with fields `category_id` ASC, `status` ASC on collection `articles`

#### Scenario: Index configuration documented for automated deployment
- **WHEN** developer deploys to a new Firebase project
- **THEN** `firestore.indexes.json` contains all composite index definitions for `articles` with `created_at` in `DESCENDING`
- **THEN** indexes can be deployed via `firebase deploy --only firestore:indexes`

#### Scenario: Existing ascending indexes are replaced by descending equivalents
- **WHEN** no query in `apps/api/src/` uses `orderBy('created_at', 'asc')` or `orderBy('created_at')` without direction
- **THEN** `firestore.indexes.json` does not contain `created_at` with `ASCENDING` order for composite indexes on `articles`
- **THEN** all composite indexes on `articles` declare `created_at` with `DESCENDING` order

#### Scenario: List published articles
- **WHEN** client requests `GET /api/v1/articles?status=published`
- **THEN** system returns articles ordered by `created_at` without `FAILED_PRECONDITION` error

#### Scenario: List draft articles
- **WHEN** client requests `GET /api/v1/articles?status=draft` (authenticated user)
- **THEN** system returns draft articles ordered by `created_at` without error

#### Scenario: Index configuration documented
- **WHEN** developer deploys to a new Firebase project
- **THEN** `firestore.indexes.json` contains the composite index definition for automated deployment

