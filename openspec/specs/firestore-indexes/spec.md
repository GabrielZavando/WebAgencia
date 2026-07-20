# firestore-indexes Specification

## Purpose
TBD - created by archiving change fix-firestore-articles-index. Update Purpose after archive.
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

