## ADDED Requirements

### Requirement: Configuración de entorno para API local
El sistema SHALL permitir configurar URLs de API distintas para desarrollo local sin afectar producción.

#### Scenario: Desarrollo con API local
- **WHEN** el desarrollador crea un archivo `.env.local` con `PUBLIC_API_URL=http://localhost:3000/api/v1`
- **THEN** el frontend se conecta a la API en localhost durante `pnpm dev`

#### Scenario: Producción con API remota
- **WHEN** no existe `.env.local` y se ejecuta `pnpm build`
- **THEN** el frontend usa las URLs de producción del entorno o `.env.example`

#### Scenario: Fallback entre variables
- **WHEN** `PUBLIC_API_URL` no está definida
- **THEN** el sistema usa `PUBLIC_API_BASE_URL` como fallback

### Requirement: Documentación de setup local
El sistema SHALL incluir documentación clara para configurar el entorno de desarrollo local.

#### Scenario: Nuevo desarrollador
- **WHEN** un desarrollador clona el repositorio
- **THEN** puede seguir `.env.example` y crear `.env.local` para desarrollo

#### Scenario: Switch entre entornos
- **WHEN** un desarrollador necesita testear contra producción
- **THEN** puede renombrar temporalmente `.env.local` para usar configuración de producción

### Requirement: Soporte para Turnstile en modo test
El sistema SHALL usar la key de test de Turnstile (`1x00000000000000000000AA`) en desarrollo local.

#### Scenario: Formulario de login sin validación real
- **WHEN** se envía el formulario de login en localhost
- **THEN** Turnstile usa la key de test que siempre pasa

#### Scenario: Formulario de contacto sin validación real
- **WHEN** se envía el formulario de contacto en localhost
- **THEN** Turnstile usa la key de test que siempre pasa