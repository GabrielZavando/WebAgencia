## Context

La API está construida con NestJS 11 y actualmente tiene documentación OpenAPI en `docs/api-spec.yml`, pero no hay una interfaz Swagger UI interactiva. El proyecto usa `@nestjs/common`, `@nestjs/core`, y `@nestjs/platform-express`. No hay integración con `@nestjs/swagger` actualmente.

## Goals / Non-Goals

**Goals:**
- Integrar Swagger UI para documentación interactiva de la API
- Habilitar endpoint `/api/docs` para Swagger UI en desarrollo
- Mantener `docs/api-spec.yml` como fuente de verdad
- Configurar Swagger para que lea los decorators de los controllers existentes
- Solo disponible en entorno de desarrollo (no en producción)

**Non-Goals:**
- Modificar la estructura de la API existente
- Cambiar la documentación OpenAPI actual en `docs/api-spec.yml`
- Exponer Swagger UI en producción (por seguridad)

## Decisions

1. **Usar `@nestjs/swagger` en lugar de swagger-ui-express manualmente**
   - Razón: Mejor integración con NestJS, decorators automáticos, menos código boilerplate
   - Alternativa: `swagger-ui-express` + cargar YAML manualmente → más configuración manual

2. **Swagger solo en desarrollo**
   - Razón: Seguridad, no exponer detalles de la API en producción
   - Implementación: Condicional basado en `NODE_ENV`

3. **Mantener docs/api-spec.yml como fuente de verdad**
   - Razón: El proyecto ya tiene especificación OpenAPI documentada
   - Swagger se genera automáticamente desde los decorators de los controllers

4. **Prefijo `/api/docs` para Swagger UI**
   - Razón: Convención estándar, claro y fácil de recordar

## Risks / Trade-offs

- **[Riesgo]** Swagger puede no reflejar exactamente la especificación OpenAPI actual → **Mitigación**: Actualizar decorators en los controllers para que coincidan con `docs/api-spec.yml`
- **[Riesgo]** Dependencia adicional aumenta bundle size → **Mitigación**: Solo se usa en desarrollo, no afecta producción
- **[Trade-off]** Requiere actualizar controllers con decorators → **Beneficio**: Documentación siempre sincronizada con el código