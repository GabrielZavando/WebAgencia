## Why

La API actualmente tiene documentación OpenAPI en `docs/api-spec.yml`, pero no hay una interfaz Swagger UI interactiva para que los desarrolladores puedan explorar y probar los endpoints fácilmente. Esto dificulta la adopción de la API y aumenta la carga de soporte.

## What Changes

- Se agrega Swagger UI como interfaz interactiva para la documentación de la API
- Se habilita un endpoint `/api/docs` para acceder a Swagger UI en desarrollo
- Se mantiene `docs/api-spec.yml` como fuente de verdad de la especificación OpenAPI
- La documentación Swagger estará disponible solo en entornos de desarrollo (no en producción por defecto)

## Capabilities

### New Capabilities

- `swagger-ui`: Interfaz Swagger UI para documentación interactiva de la API

### Modified Capabilities

- Ninguna (no se modifican requisitos existentes, solo se agrega nueva capacidad de visualización)

## Impact

- **Código afectado**: Módulo principal de la API (main.ts o app.module.ts)
- **APIs afectadas**: Se agrega nuevo endpoint `/api/docs` y `/api/docs-json` para el spec JSON
- **Dependencias**: Se agrega `@nestjs/swagger` y `swagger-ui-express` como dependencias de desarrollo
- **Sistemas afectados**: Documentación de la API, experiencia del desarrollador