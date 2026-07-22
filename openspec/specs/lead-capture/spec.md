# Capability: lead-capture

## Purpose

Capturar leads (contactos calificados) desde el formulario público de la landing y enviarlos al backend NestJS con protecciones anti-spam integradas (honeypot, Turnstile, análisis de contenido, verificación de tiempo de llenado).

## Requirements

### Requirement: Endpoint consumido
The system **SHALL** enviar los datos del formulario a `${PUBLIC_API_URL}/api/v1/leads/contact` vía `apiClient.post()`.

#### Scenario: Envío exitoso de lead
- **Given** un usuario rellena nombre, email y mensaje correctamente
- **And** Turnstile genera token válido
- **When** hace click en "Enviar"
- **Then** la API responde 201
- **And** el form se resetea
- **And** aparece un modal de "¡Gracias por escribir!".

### Requirement: Validación cliente
The system **SHALL** validar cliente antes de enviar:
- `name`: 2-120 caracteres
- `email`: regex email estándar
- `message`: mínimo 10 caracteres
- `subject` y `phone` opcionales

#### Scenario: Email inválido en cliente
- **Given** el usuario escribe "no-es-email"
- **When** desenfoca el campo
- **Then** aparece mensaje "Email inválido" inline y el submit se bloquea.

### Requirement: Honeypot field
The system **SHALL** incluir un campo oculto (CSS `display: none` o `tabindex=-1`) que, si se rellena, descarta el envío silenciosamente (sin feedback al bot).

#### Scenario: Bot evade honeypot
- **Given** un bot rellena automáticamente todos los campos incluyendo el input honeypot `.website`
- **When** el handler valida antes de enviar
- **Then** el envío se descarta y se simula éxito (no se distingue de envío legítimo para no dar feedback al bot).

### Requirement: Turnstile injection
The system **SHALL** inyectar `turnstileToken` automáticamente cuando `PUBLIC_TURNSTILE_SITE_KEY` está configurado, usando `apiClient.post(..., { injectTurnstile: true })`.

#### Scenario: Turnstile token inyectado
- **Given** `PUBLIC_TURNSTILE_SITE_KEY` está definido
- **And** el usuario completa el formulario correctamente
- **When** se envía
- **Then** el payload incluye `turnstileToken` con valor no vacío.

### Requirement: Cooldown localStorage
The system **SHALL** impedir reenvíos durante 2 minutos (cooldown en `localStorage` con clave `lead_form_cooldown`).

#### Scenario: Reenvío en less than 2 minutos
- **Given** el usuario ya envió un lead
- **When** intenta enviar otro en menos de 2 minutos
- **Then** el botón se deshabilita (o aparece banner "Espera un momento antes de enviar otro mensaje").

### Requirement: Análisis de contenido
The system **SHALL** detectar URLs, palabras clave spam típicas ("viagra", "crypto giveaway"), y mayúsculas excesiva; rechazar antes de enviar.

#### Scenario: Contenido spam detectado
- **Given** el usuario escribe un mensaje con "GANA CRIPTO GRATIS"
- **When** intenta enviar
- **Then** el envío se bloquea con mensaje "Revisa tu mensaje e intenta nuevamente".

### Requirement: Verificación de tiempo de llenado
The system **SHALL** medir el tiempo entre el primer foco y el submit; rechazar envíos < 3 segundos (demasiado rápido = bot) > 30 minutos (sesión abandonada).

#### Scenario: Envío demasiado rápido
- **Given** el usuario hace foco y submit en menos de 3 segundos
- **When** intenta enviar
- **Then** el envío se bloquea con mensaje "Espera un momento antes de enviar".

### Requirement: Mensajes de feedback
The system **SHALL** mostrar feedback visual:
- Éxito: mensaje de confirmación + reset del form
- Error validacion: inline por campo
- Cooldown/spam: banner neutro sin explicar la heurística

#### Scenario: Feedback de éxito
- **Given** el usuario envía datos válidos
- **When** la API responde 201
- **Then** aparece mensaje de éxito y el form se limpia.

### Requirement: Manejo de errores API
The system **SHALL** interpretar `ApiError` y mostrar mensajes amigables:
- `NETWORK_ERROR`: "Verifica tu conexión"
- `HTTP_ERROR 400`: detalle del primer campo inválido
- `HTTP_ERROR 429`: "Demasiados intentos, espera unos minutos"

#### Scenario: API responde 400
- **Given** la validación cliente pasó
- **When** el backend rechaza con `400 Bad Request`
- **Then** se muestra el primer mensaje de error del backend cerca del campo correspondiente.

#### Scenario: Backend caído (network error)
- **Given** la API no responde
- **When** se cumple el timeout (15s)
- **Then** aparece "No pudimos enviar tu mensaje. Intenta más tarde o escríbenos directamente a contacto@...".

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
- **THEN** procesa y persiste el lead normalmente.