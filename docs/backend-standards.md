# Backend Standards

> Personalizar este archivo con el stack backend real del proyecto.

## API Development

- RESTful API con versionado explícito en la URL: `/api/v1/`
- Respuestas consistentes: `{ data, error, meta }`
- HTTP status codes correctos (200, 201, 400, 401, 403, 404, 422, 500)
- Validación de inputs en la capa de presentación (class-validator + class-transformer)
- Nunca exponer stacktraces en producción
- Mensajes de error y éxito en **español latinoamericano neutro**

## Base de datos

### Firebase Firestore (Usuarios, Roles, Blog)
- Colecciones: `users`, `roles`, `articles`, `categories`
- Documentos con IDs auto-generados o UUIDs
- Índices compuestos en campos frecuentemente consultados (slug, status, category_id)
- Timestamps del servidor para created_at y updated_at

### Supabase PostgreSQL (Leads/Prospectos)
- Tablas: `leads`, `contact_messages`
- Campos JSONB para metadata, attribution, payload (estructura semi-flexible)
- **SDK:** `@supabase/supabase-js` (cliente de Supabase)
- Migraciones se gestionan directamente en Supabase Dashboard o vía SQL
- SupabaseModule global para acceso al cliente desde cualquier módulo

## Testing backend

- Unit tests para lógica de dominio y servicios (Jest)
- Integration tests para repositorios y adapters
- E2E tests para flujos críticos de negocio
- Mocks solo para servicios externos (Firebase, Supabase)
- Cobertura mínima: 80%

## Seguridad

- Firebase Auth para autenticación (JWT verification)
- Nunca loguear datos sensibles (passwords, tokens, PII)
- Sanitizar todos los inputs antes de persistir
- Rate limiting en endpoints públicos (opcional, implementar si es necesario)
- CORS configurado explícitamente
- Variables de entorno para credenciales, nunca hardcodeadas
- Firebase service account key NUNCA en el código

## Logging y errores

- Structured logging (JSON) con nivel: debug/info/warn/error
- Errors con contexto: qué ocurrió, dónde, con qué datos
- Health check endpoint: `/api/v1/health`

## Stack específico del proyecto

```
Runtime: Node.js 20 LTS
Framework: NestJS 11
SDK Cliente: firebase-admin (para Firestore y Firebase Auth)
Supabase SDK: @supabase/supabase-js (para PostgreSQL)
Base de datos 1: Firebase Firestore (SDK admin)
Base de datos 2: Supabase PostgreSQL (via Supabase SDK)
Contenedor: Docker + Docker Compose
Tests: Jest
Validation: class-validator + class-transformer
Idiomas:
  - Código: English
  - Mensajes API: Español Latinoamericano neutro
```
