## Context

La API actualmente tiene endpoints sin versionado explícito (`/auth`, `/users`, etc.). Con la implementación de Swagger completada, es el momento ideal para añadir el prefijo de versión antes de que más clientes se acostumbren a las URLs actuales.

## Goals / Non-Goals

**Goals:**
- Añadir prefijo `/api/v1/` a todos los endpoints de la API
- Actualizar Swagger UI para que refleje el nuevo path
- Mantener el health check sin versionado (`/health`)
- Actualizar la documentación OpenAPI

**Non-Goals:**
- Cambiar la lógica de negocio de los endpoints
- Modificar las respuestas de la API
- Cambiar la autenticación o autorización

## Decisions

1. **Usar `setGlobalPrefix()` de NestJS**
   - Razón: Solución nativa, aplica el prefijo a todos los controllers automáticamente
   - Alternativa: Añadir prefijo manualmente en cada `@Controller()` → más código repetitivo

2. **Excluir health check del prefijo**
   - Razón: Health checks son endpoints de infraestructura, no de negocio
   - Implementación: Decorador `@ExcludeFromGlobalPrefix()` o ruta separada

3. **Swagger UI en `/api/v1/docs`**
   - Razón: Coherencia con el versionado de la API
   - El JSON spec también en `/api/v1/docs-json`

## Risks / Trade-offs

- **[Breaking Change]**: URLs cambian para todos los clientes → **Mitigación**: Documentar en changelog, considerar periodo de transición
- **[Riesgo]**: Frontend o tests hardcodean URLs → **Mitigación**: Actualizar variables de entorno y configuraciones
- **[Trade-off]**: URLs más largas → **Beneficio**: Versionado claro y evolución futura sin breaking changes