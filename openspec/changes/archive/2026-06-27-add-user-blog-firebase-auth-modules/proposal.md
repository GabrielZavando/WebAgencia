## Why

El sitio web de Líder Digital necesita una API completa para gestionar usuarios autenticados, contenido editorial (blog) y captación de leads. Actualmente existe la especificación API (`api-spec.yml`) y el modelo de datos (`data-model.md`) pero no hay implementación. Se requiere implementar los módulos de autenticación Firebase, usuarios, categorías y artículos siguiendo Clean Architecture.

## What Changes

- **Nuevo**: Módulo Firebase configurado con `firebase-admin` para Firestore y Auth
- **Nuevo**: Módulo Auth con login via Firebase ID token y endpoint de perfil
- **Nuevo**: Módulo Users con CRUD completo en Firestore (listar, crear, obtener, actualizar)
- **Nuevo**: Módulo Categories con CRUD completo en Firestore (público para lectura, protegido para escritura)
- **Nuevo**: Módulo Articles con CRUD completo en Firestore (público para lectura, protegido para escritura)
- **Nuevo**: Guards de autenticación JWT y roles (admin/editor)
- **Nuevo**: DTOs con validación via `class-validator`
- **Nuevo**: Responses consistentes `{ data, meta }` y errores `{ error, message, statusCode }`

## Capabilities

### New Capabilities

- `firebase-config`: Configuración centralizada del SDK admin de Firebase para Firestore y Auth
- `user-auth`: Autenticación via Firebase ID token con login y perfil de usuario
- `user-management`: CRUD de usuarios en Firestore con control de acceso por roles
- `category-management`: CRUD de categorías en Firestore (lectura pública, escritura protegida)
- `article-management`: CRUD de artículos en Firestore (lectura pública con filtros, escritura protegida)

### Modified Capabilities

- No aplica — es una implementación nueva

## Impact

- **APIs**: Endpoints definidos en `docs/api-spec.yml` serán implementados
- **Base de datos**: Firebase Firestore (users, roles, categories, articles)
- **Dependencias**: `firebase`, `firebase-admin`, `@nestjs/passport`, `passport-jwt`, `@nestjs/jwt`, `class-validator`, `class-transformer`
- **Arquitectura**: Clean Architecture con Controllers → Services → Repositories → Firestore
- **Testing**: Unit tests para servicios con cobertura mínima 80%