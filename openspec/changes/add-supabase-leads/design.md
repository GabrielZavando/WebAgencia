## Context

El proyecto actualmente usa Prisma como ORM para conectarse a Supabase PostgreSQL. Sin embargo, Prisma es un ORM genérico que no aprovecha las funcionalidades nativas de Supabase (RLS, Realtime, Storage). 

El único módulo que usa Prisma es `LeadsModule`, que persiste leads (suscriptores del formulario de contacto y formulario de suscripción) en PostgreSQL.

**Estado actual:**
- PrismaService conecta a Supabase PostgreSQL via `DATABASE_URL`
- LeadsModule usa Prisma para crear leads y mensajes de contacto
- Firebase Auth + Firestore se usan para autenticación y blog (sin cambios)

## Goals / Non-Goals

**Goals:**
- Instalar `@supabase/supabase-js` como cliente de Supabase
- Crear `SupabaseModule` con `SupabaseService` que expone el cliente configurado
- Actualizar `LeadsRepository` para usar Supabase client en lugar de Prisma
- Mantener la misma funcionalidad (endpoints, DTOs, respuestas)
- Preparar el terreno para futuras funcionalidades de Supabase (RLS, Realtime)

**Non-Goals:**
- Migrar Firebase Auth a Supabase Auth (se mantiene Firebase)
- Migrar Firestore a Supabase (se mantiene Firestore para blog)
- Implementar RLS en este cambio (futuro)
- Implementar Realtime en este cambio (futuro)
- Cambiar la interfaz de la API (mismos endpoints, mismas respuestas)

## Decisions

### Decision 1: Usar `@supabase/supabase-js` en lugar de Prisma

**Alternativa considerada:** Mantener Prisma y agregar Supabase SDK junto.

**Por qué `@supabase/supabase-js`:**
- Más ligero que Prisma (sin codegen, sin schema file)
- Tipado automático del schema de Supabase
- Acceso directo a funcionalidades de Supabase (RLS, Realtime, Storage)
- Elimina dependencias de Prisma (`@prisma/client`, `@prisma/adapter-pg`, `pg`)

**Trade-off:** Se pierde la abstracción de Prisma (si en el futuro se necesita otra DB). Pero el proyecto ya está comprometido a Supabase PostgreSQL para Leads.

### Decision 2: Crear SupabaseModule global

**Alternativa considerada:** Crear SupabaseService solo en LeadsModule.

**Por qué global:**
- Otros módulos podrían necesitar Supabase en el futuro
- Consistencia con FirebaseModule (ya es global)
- Fácil de importar desde cualquier módulo

### Decision 3: Mantener la misma estructura del módulo Leads

**Estructura actual:**
```
LeadsModule
  ├── LeadsController (endpoints)
  ├── LeadsService (lógica de negocio)
  └── LeadsRepository (acceso a datos)
```

**Cambio solo en LeadsRepository:**
- Reemplazar `PrismaService` por `SupabaseService`
- Usar `supabase.from('leads').select/insert` en lugar de `prisma.lead.findUnique/create`
- Mantener la misma interfaz pública (CreateLeadData, CreateContactMessageData)

### Decision 4: Variables de entorno

**Requeridas:**
- `SUPABASE_URL` — URL del proyecto Supabase
- `SUPABASE_PUBLISHABLE_KEY` — Anon key (para operaciones públicas)
- `SUPABASE_SECRET_KEY` — Service role key (para operaciones admin)
- `SUPABASE_JWKS_URL` — Para verificación de tokens (futuro)

**Eliminadas:**
- `DATABASE_URL` — Ya no se usa Prisma

## Risks / Trade-offs

**[Risk] Supabase SDK tiene API diferente a Prisma**
→ Mitigación: La abstracción está en LeadsRepository. Solo se cambia la implementación interna, no la interfaz pública.

**[Risk] Eliminar Prisma puede afectar migraciones futuras**
→ Mitigación: Las migraciones de Supabase se hacen directamente en Supabase Dashboard o via SQL. Prisma no es necesario para migraciones.

**[Risk] Supabase Secret Key en variables de entorno**
→ Mitigación: Secret key nunca se expone al cliente. Solo se usa en el backend. Mantener en `.env` local y variables de entorno en producción.

**[Risk] RLS no está implementado (data access abierto)**
→ Mitigación: El endpoint de leads es público (no requiere auth). RLS se implementará en un futuro cambio cuando se necesite restrictir acceso.

## Migration Plan

1. Instalar `@supabase/supabase-js`
2. Crear `SupabaseModule` y `SupabaseService`
3. Configurar variables de entorno
4. Actualizar `LeadsRepository` para usar Supabase client
5. Eliminar dependencias de Prisma (`@prisma/client`, `@prisma/adapter-pg`, `pg`)
6. Eliminar `PrismaModule` y `PrismaService` (ya no se usan)
7. Eliminar `prisma/` directory
8. Eliminar `DATABASE_URL` de `.env.example`
9. Verificar que `POST /api/v1/leads/contact` sigue funcionando

**Rollback:** Si algo falla, restaurar PrismaModule y LeadsRepository original.

## Open Questions

1. ¿Se debe crear un schema de Supabase (SQL) para las tablas `leads` y `contact_messages`, o se usan las tablas existentes creadas por Prisma?
2. ¿Se debe implementar RLS en este cambio o dejarlo para futuro?
3. ¿Se debe eliminar el directorio `prisma/` completamente o mantenerlo como referencia?
