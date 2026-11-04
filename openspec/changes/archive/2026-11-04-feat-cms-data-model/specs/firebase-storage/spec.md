## ADDED Requirements

### Requirement: Colección media para biblioteca de imágenes

The system SHALL persistir metadatos de archivos subidos en la colección `media` con los campos: `id`, `filename`, `url`, `mime_type`, `size`, `uploaded_by`, `created_at`, `updated_at`.

#### Scenario: Media document structure
- **WHEN** a file metadata document is created in `media`
- **THEN** the document contains `id`, `filename`, `url`, `mime_type`, `size`, `uploaded_by`, `created_at`, `updated_at`
- **AND** `url` es una URL de Firebase Storage pública
- **AND** `uploaded_by` referencia el UID del usuario autenticado que subió el archivo

### Requirement: Relación artículo-media mediante cover_media_id

The system SHALL permitir que un artículo referencie un documento de `media` como imagen de portada mediante el campo opcional `cover_media_id`.

#### Scenario: Article with cover_media_id references existing media
- **WHEN** an article is created with `cover_media_id` set to a valid `media.id`
- **THEN** the article is stored with the reference to the media document
- **AND** the referenced media document exists in the `media` collection
