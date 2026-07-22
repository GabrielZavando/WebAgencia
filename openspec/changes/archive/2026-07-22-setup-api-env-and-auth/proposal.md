## Why

La API NestJS (`apps/api/`) **no puede iniciarse** porque falta el archivo `.env` con las credenciales de Firebase Admin SDK. Sin él, `FirebaseService.onModuleInit()` lanza un Error y el contenedor crashea. Además, el endpoint `POST /auth/logout` requerido por la spec `auth-protection` no existe, causando un 404 al intentar cerrar sesión desde el dashboard. Por último, Prisma no tiene `@prisma/client` como dependencia runtime, por lo que la capa PostgreSQL (leads/contact_messages) no puede funcionar.

## What Changes

- **Crear `apps/api/.env`** con las credenciales de Firebase Admin SDK extraídas del service account JSON (`api-web-agencia-firebase.json`) y un placeholder para `DATABASE_URL` pendiente de Supabase.
- **Implementar `POST /api/v1/auth/logout`** en el `AuthController` para invalidar la sesión del lado del servidor (limpiar cookie httpOnly).
- **Agregar `@prisma/client`** a `dependencies` de `apps/api/package.json` y crear un servicio Prisma básico (`PrismaService`) con lifecycle hooks para que el cliente se conecte/desconecte correctamente.
- **Agregar `POST /api/v1/leads/contact`** como endpoint público (sin auth) que recibe el payload del formulario de contacto del frontend y lo persiste en PostgreSQL vía Prisma.

## Capabilities

### New Capabilities
- `api-env-setup`: Configuración de variables de entorno y credenciales para que la API inicie correctamente con Firebase Admin SDK y Supabase/Prisma.

### Modified Capabilities
- `auth-protection`: Agregar el escenario faltante de implementación del endpoint `POST /auth/logout` en el backend (requerimiento ya documentado en la spec pero sin implementar).
- `lead-capture`: El frontend ya consume `POST /leads/contact` pero el backend no tiene el endpoint ni la conexión a Prisma. Se completa el circuito backend.

## Impact

- **Archivos modificados**: `apps/api/.env` (nuevo), `apps/api/package.json`, `apps/api/src/auth/auth.controller.ts`, `apps/api/src/prisma/` (nuevo módulo)
- **Archivos nuevos**: `apps/api/.env`, `apps/api/src/prisma/prisma.service.ts`, `apps/api/src/prisma/prisma.module.ts`, `apps/api/src/leads/` (módulo completo), `apps/api/prisma/migrations/` (si se ejecuta `migrate dev`)
- **API endpoints nuevos**: `POST /api/v1/auth/logout`, `POST /api/v1/leads/contact`
- **Dependencias nuevas**: `@prisma/client` (runtime)
- **No hay breaking changes**: endpoints nuevos, no se modifican existentes
