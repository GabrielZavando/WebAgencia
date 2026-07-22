# Capability: lead-capture (delta)

## ADDED Requirements

### Requirement: Backend endpoint for lead capture
The system **SHALL** exponer un endpoint `POST /api/v1/leads/contact` que recibe el payload del formulario de contacto y lo persiste en PostgreSQL via Prisma.

#### Scenario: Lead creado exitosamente
- **GIVEN** el frontend envía `{ name, email, message }` válidos
- **WHEN** el backend recibe la petición
- **THEN** crea un `Lead` en PostgreSQL con `status = "contact"`
- **AND** crea un `ContactMessage` vinculado al lead
- **AND** retorna HTTP 201 con `{ data: { leadId, message: "Contacto registrado exitosamente" } }`

#### Scenario: Lead duplicado por email
- **GIVEN** ya existe un lead con el email proporcionado
- **WHEN** se envía otro contacto con el mismo email
- **THEN** el backend retorna HTTP 200 (no 201) con el lead existente
- **AND** crea un nuevo `ContactMessage` vinculado al lead existente

#### Scenario: Validación de payload
- **GIVEN** el frontend envía un payload con campos faltantes o inválidos
- **WHEN** el backend valida el DTO
- **THEN** retorna HTTP 400 con errores de validación por campo

### Requirement: Leads module architecture
The system **SHALL** implementar el módulo `LeadsModule` siguiendo el patrón de arquitectura existente (Controller → Service → Repository).

#### Scenario: Estructura del módulo
- **GIVEN** se inspecciona `apps/api/src/leads/`
- **WHEN** se listan los archivos
- **THEN** existen: `leads.module.ts`, `leads.controller.ts`, `leads.service.ts`, `leads.repository.ts`, `dto/create-lead.dto.ts`

### Requirement: Public endpoint (no auth required)
The system **SHALL** exponer `POST /api/v1/leads/contact` sin requerir autenticación.

#### Scenario: Request sin token de autenticación
- **GIVEN** el usuario no está autenticado
- **WHEN** envía `POST /api/v1/leads/contact` con payload válido
- **THEN** el endpoint procesa la petición normalmente (no retorna 401)

### Requirement: Prisma conditional availability
The system **SHALL** funcionar parcialmente cuando `DATABASE_URL` no está configurado.

#### Scenario: Leads endpoint sin Prisma
- **GIVEN** `DATABASE_URL` no está definido
- **WHEN** se envía `POST /api/v1/leads/contact`
- **THEN** retorna HTTP 503 con `{ error: "Service Unavailable", message: "Base de datos no configurada" }`

#### Scenario: Leads endpoint con Prisma
- **GIVEN** `DATABASE_URL` está definido y Prisma está conectado
- **WHEN** se envía `POST /api/v1/leads/contact` con payload válido
- **THEN** procesa y persiste el lead normalmente
