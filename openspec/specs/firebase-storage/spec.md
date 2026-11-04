# firebase-storage Specification

## Purpose
Garantizar la disponibilidad del cliente de Firebase Storage en `FirebaseService` como infraestructura para el futuro change de subida de archivos y biblioteca de medios, sin exponer operaciones de Storage en este change.

## Requirements

### Requirement: Cliente de Storage en FirebaseService
The system **SHALL** exponer `FirebaseService.getStorage()` que retorna el cliente `Storage` de `firebase-admin/storage`, inicializado sobre la misma app de Firebase Admin, sin operaciones de lectura/escritura en este change.

#### Scenario: Retorna instancia de Storage
- **GIVEN** Firebase Admin inicializado correctamente
- **WHEN** se invoca `getStorage()`
- **THEN** retorna una instancia de `Storage` lista para usar

#### Scenario: Error sin inicialización
- **GIVEN** la app de Firebase no inicializada
- **WHEN** se invoca `getStorage()`
- **THEN** lanza `Error` con mensaje `"Firebase app not initialized"`

#### Scenario: Bucket opcional por entorno
- **GIVEN** `FIREBASE_STORAGE_BUCKET` definida en el entorno
- **WHEN** la app se inicializa
- **THEN** `initializeApp` recibe `storageBucket` con ese valor

#### Scenario: Bucket por defecto sin env
- **GIVEN** `FIREBASE_STORAGE_BUCKET` ausente
- **WHEN** la app se inicializa
- **THEN** se usa el bucket por defecto del proyecto (sin `storageBucket` en `initializeApp`)

### Requirement: Sin endpoints de Storage en este change
The system **SHALL** NO exponer endpoints HTTP que escriban o lean de Storage; la subida de archivos y la biblioteca de medios pertenecen a un change futuro.

#### Scenario: Sin rutas de media
- **WHEN** se inspeccionan los controllers de la API
- **THEN** ninguno referencia operaciones de Storage

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
