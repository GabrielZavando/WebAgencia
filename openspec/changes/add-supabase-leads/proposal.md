## Why

El proyecto actualmente usa Prisma para conectar a Supabase PostgreSQL, pero no utiliza el SDK de Supabase (`@supabase/supabase-js`). Instalar el SDK de Supabase permite:
1. Acceder a funcionalidades nativas de Supabase (RLS, Realtime, Storage) en el futuro
2. Usar el cliente tipado de Supabase en lugar de Prisma para queries de Leads
3. Mantener la arquitectura limpia: Firebase para Auth + Firestore, Supabase para PostgreSQL (Leads)

## What Changes

- Instalar `@supabase/supabase-js` como dependencia del API
- Crear módulo `SupabaseModule` con `SupabaseService` que expone el cliente configurado
- Configurar variables de entorno: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`
- Actualizar `LeadsModule` para usar el cliente de Supabase en lugar de Prisma para persistir leads
- Mantener Firebase Auth + Firestore intactos (no se modifica autenticación ni blog)

## Capabilities

### New Capabilities

- `supabase-client`: Cliente de Supabase configurado y listo para usar en el backend NestJS

### Modified Capabilities

- `lead-capture`: Cambiar la persistencia de Leads de Prisma a Supabase SDK (mantiene la misma funcionalidad, cambia la implementación)

## Impact

**Código afectado:**
- `apps/api/src/leads/` — Actualizar `leads.repository.ts` para usar Supabase client en lugar de Prisma
- `apps/api/src/prisma/` — Podría eliminarse si Leads es el único consumidor (verificar si hay otros módulos)

**Dependencias:**
- Agregar: `@supabase/supabase-js`
- Eliminar: `@prisma/client`, `@prisma/adapter-pg`, `pg` (si Leads es el único usuario de Prisma)
- Mantener: `firebase-admin` (Auth + Firestore)

**Variables de entorno:**
- Agregar: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`
- Mantener: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Eliminar: `DATABASE_URL` (ya no se usa Prisma)

**API:**
- Sin cambios en endpoints existentes — misma funcionalidad, misma interfaz
- `POST /api/v1/leads/contact` sigue funcionando igual

**Sistemas externos:**
- Supabase: Se usa el SDK en lugar de conexión raw PostgreSQL
- Firebase: Sin cambios
