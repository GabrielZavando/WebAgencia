## Why

La API actualmente no tiene un prefijo de versión en los endpoints, lo cual dificulta el versionado futuro y no sigue las mejores prácticas de APIs RESTful. Añadir `/api/v1/` como prefijo permite una evolución clara de la API sin breaking changes en el futuro.

## What Changes

- Se añade el prefijo `/api/v1/` a todos los endpoints de la API
- Swagger UI se mueve de `/api/docs` a `/api/v1/docs`
- El endpoint de health check permanece en `/health` (sin versionado)
- **BREAKING**: Los clientes deben actualizar sus URLs para incluir `/api/v1/`

## Capabilities

### New Capabilities

- Ninguna (es un cambio de implementación, no una nueva capacidad)

### Modified Capabilities

- `swagger-ui`: Los endpoints de documentación cambian de `/api/docs` a `/api/v1/docs`

## Impact

- **Código afectado**: main.ts (ruta de Swagger), todos los controllers (prefijo global)
- **APIs afectadas**: Todos los endpoints cambian de `/auth`, `/users`, etc. a `/api/v1/auth`, `/api/v1/users`, etc.
- **Documentación**: docs/api-spec.yml debe actualizar los server URLs
- **Clientes**: Deben actualizar las URLs de las peticiones para incluir `/api/v1/`