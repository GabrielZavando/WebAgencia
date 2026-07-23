# Capability: supabase-client

## Purpose

Proporcionar un cliente de Supabase configurado y listo para usar en el backend NestJS, permitiendo acceso a funcionalidades nativas de Supabase (RLS, Realtime, Storage) en futuros cambios.

## Requirements

### Requirement: SupabaseModule configuration
The system **SHALL** implementar un módulo `SupabaseModule` global que exponga `SupabaseService` con el cliente de Supabase configurado.

#### Scenario: SupabaseModule está registrado globalmente
- **GIVEN** se inspecciona `apps/api/src/app.module.ts`
- **WHEN** se revisan los imports
- **THEN** `SupabaseModule` está importado y marcado como `@Global()`

#### Scenario: SupabaseService está disponible globalmente
- **GIVEN** cualquier módulo necesita acceder a Supabase
- **WHEN** inyecta `SupabaseService`
- **THEN** recibe una instancia del cliente de Supabase configurada

### Requirement: SupabaseService initialization
The system **SHALL** inicializar el cliente de Supabase al inicio de la aplicación usando las variables de entorno `SUPABASE_URL` y `SUPABASE_SECRET_KEY`.

#### Scenario: Variables de entorno configuradas
- **GIVEN** `SUPABASE_URL` y `SUPABASE_SECRET_KEY` están definidas en `.env`
- **WHEN** la aplicación inicia
- **THEN** `SupabaseService` crea un cliente de Supabase válido

#### Scenario: Variables de entorno faltantes
- **GIVEN** `SUPABASE_URL` o `SUPABASE_SECRET_KEY` no están definidas
- **WHEN** la aplicación inicia
- **THEN** `SupabaseService` lanza un error descriptivo indicando qué variable falta

### Requirement: Supabase client methods
The system **SHALL** exponer métodos para acceder a las tablas de Supabase mediante el cliente configurado.

#### Scenario: Acceder a una tabla
- **GIVEN** se necesita consultar la tabla `leads`
- **WHEN** se llama a `supabaseService.getClient().from('leads')`
- **THEN** retorna un query builder de Supabase para esa tabla

#### Scenario: Realizar un select
- **GIVEN** se necesita obtener leads con email específico
- **WHEN** se ejecuta `supabaseService.getClient().from('leads').select('*').eq('email', 'test@example.com')`
- **THEN** retorna los registros que coinciden con la condición

### Requirement: Environment variables
The system **SHALL** requerir las siguientes variables de entorno para Supabase:
- `SUPABASE_URL`: URL del proyecto Supabase
- `SUPABASE_PUBLISHABLE_KEY`: Anon key para operaciones públicas
- `SUPABASE_SECRET_KEY`: Service role key para operaciones admin
- `SUPABASE_JWKS_URL`: URL para verificación de tokens (futuro)

#### Scenario: Variables en .env.example
- **GIVEN** se revisa `apps/api/.env.example`
- **WHEN** se buscan las variables de Supabase
- **THEN** están documentadas con descripción y formato correcto

#### Scenario: Secret key no expuesta al cliente
- **GIVEN** `SUPABASE_SECRET_KEY` está configurada
- **WHEN** se revisa el código del frontend
- **THEN** no hay referencias a `SUPABASE_SECRET_KEY`

### Requirement: Supabase module structure
The system **SHALL** implementar `SupabaseModule` siguiendo el patrón de arquitectura del proyecto (módulo + servicio).

#### Scenario: Estructura del módulo
- **GIVEN** se inspecciona `apps/api/src/supabase/`
- **WHEN** se listan los archivos
- **THEN** existen: `supabase.module.ts`, `supabase.service.ts`

#### Scenario: SupabaseService implementa OnModuleInit
- **GIVEN** `SupabaseService` necesita inicializar el cliente
- **WHEN** se revisa la implementación
- **THEN** implementa `OnModuleInit` para crear el cliente al inicio
