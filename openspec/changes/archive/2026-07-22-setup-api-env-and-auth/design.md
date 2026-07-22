## Context

La API NestJS tiene 7 módulos funcionando (Auth, Users, Categories, Articles, Health) pero no puede iniciarse porque falta `apps/api/.env`. El archivo `.env.example` documenta las variables requeridas pero no hay un `.env` real con credenciales.

El frontend (`apps/web`) ya tiene `.env.local` completo con credenciales de Firebase client SDK que apuntan al proyecto `api-web-agencia`. La integración auth completa requiere que el API también pueda inicializar Firebase Admin SDK.

El service account JSON (`api-web-agencia-firebase.json`) está en la raíz del repo y contiene todas las credenciales necesarias para el Admin SDK.

La capa PostgreSQL (Prisma) tiene schema con `Lead` y `ContactMessage` pero no tiene runtime: `@prisma/client` no está en dependencias, no hay PrismaService, y no hay módulo de leads.

## Goals / Non-Goals

**Goals:**
- La API debe iniciar correctamente con Firebase Admin SDK inicializado
- Completar el circuito de auth: login → sesión → logout → redirect
- Preparar la capa Prisma para que el endpoint `POST /leads/contact` pueda persistir leads
- Todo listo para conectar Supabase cuando la `DATABASE_URL` esté disponible

**Non-Goals:**
- Implementar la migración de Supabase (ya existe `schema.prisma`, se ejecuta `prisma migrate dev` cuando se tenga la URL)
- Crear usuario admin seed (se hace manualmente en Firebase Console)
- Modificar el frontend (ya tiene todo configurado)
- Implementar refresh tokens o sesiones complejas

## Decisions

### 1. Cómo generar `apps/api/.env`

**Decisión**: Crear el archivo `.env` extrayendo `project_id`, `client_email` y `private_key` del service account JSON. `DATABASE_URL` queda como placeholder con comentario indicando que falta Supabase.

**Razón**: El service account JSON es la fuente de verdad para Firebase Admin SDK. Extraer manualmente las 3 variables necesarias es más seguro que copiar el JSON completo al `.env` (el JSON contiene campos adicionales innecesarios como `auth_uri`, `token_uri`, etc.).

**Alternativa considerada**: Usar `GOOGLE_APPLICATION_CREDENTIALS` apuntando al JSON → Rechazada porque el código actual (`firebase.service.ts`) ya lee las 3 variables individuales y no soporta la ruta al archivo.

### 2. Cómo implementar `POST /auth/logout`

**Decisión**: Endpoint que recibe la cookie de sesión, la invalida limpiándola con `Set-Cookie` (max-age=0, httpOnly), y retorna 200.

**Razón**: Firebase Auth no tiene un "logout" server-side significativo (los ID tokens son stateless). El logout real consiste en limpiar la cookie de sesión que el frontend usa para `GET /auth/me`. El frontend (`Dashboard.tsx`) ya llama `POST /auth/logout` con `credentials: 'include'`.

**Alternativa considerada**: No hacer nada server-side y solo limpiar en cliente → Rechazada porque la spec `auth-protection` explícitamente requiere invalidación server-side de la cookie.

**Nota**: Actualmente el login NO establece una cookie (solo retorna el user en JSON). Esto significa que el flujo actual usa Firebase ID token en cada request via `Authorization: Bearer`. El logout simplemente limpiará la cookie si existe, y el frontend redirige a `/login` de todas formas.

### 3. Arquitectura PrismaService

**Decisión**: Crear un `PrismaModule` global con `PrismaService` que extiende `PrismaClient` e implementa `OnModuleInit` y `OnModuleDestroy` para lifecycle hooks de conexión/desconexión.

**Razón**: Patrón estándar de NestJS para Prisma. El `@Global()` decorator evita tener que importar `PrismaModule` en cada módulo que necesite acceso a la DB. Lifecycle hooks aseguran que la conexión se cierre limpiamente al apagar el server.

**Alternativa considerada**: Usar `@nestjs/config` para manage DATABASE_URL → Rechazada porque el proyecto ya usa `dotenv.config()` directo y no hay `ConfigModule` en ningún lado. Agregarlo sería un cambio de arquitectura fuera de scope.

### 4. Arquitectura del módulo Leads

**Decisión**: Crear módulo `LeadsModule` con `LeadsController`, `LeadsService`, y `LeadsRepository` siguiendo el patrón existente ( UsersController/UsersService/UsersRepository). Endpoint `POST /leads/contact` será público (sin auth guard), validado con DTO.

**Razón**: Consistencia con la arquitectura existente del proyecto. El endpoint es público porque el formulario de contacto está en la landing page (no requiere autenticación).

### 5. Manejo de DATABASE_URL pendiente

**Decisión**: La API debe poder iniciar **sin** DATABASE_URL cuando se ejecute solo para Auth/Firestore. El `PrismaModule` se cargará con `isDatabaseUrlDefined` flag y el `LeadsModule` será condicional (no se registra si Prisma no está disponible).

**Razón**: Permite desarrollar y probar auth sin necesitar Supabase. El endpoint `/leads/contact` retornará 503 "Service Unavailable" si Prisma no está conectado.

**Alternativa considerada**: Crashear la app si falta DATABASE_URL → Rechazada porque violaría el principio de fallo parcial y complicaría el desarrollo local de auth.

## Risks / Trade-offs

- **[Risk] Service account JSON comprometido** → Mitigación: El archivo ya existe en la raíz del repo (debería estar en `.gitignore` o en un vault). El `.env` hereda la misma exposición. Acción futura: verificar que `api-web-agencia-firebase.json` esté en `.gitignore`.
- **[Risk] CORS para logout** → Mitigación: El `CORS_ORIGIN` ya incluye `credentials: true` en `main.ts`. El endpoint logout usa el mismo prefijo `/api/v1/` y está cubierto por CORS existente.
- **[Trade-off] Prisma condicional** → La complejidad de un módulo condicional vale la pena para no bloquear el desarrollo de auth por falta de Supabase.
- **[Trade-off] Logout sin cookie activa** → Si el login actual no establece cookie, el logout es básicamente un 200 que el frontend interpreta como "limpiar estado local". Aceptable para el flujo actual.
