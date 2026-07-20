# Capability: newsletter-double-optin

## Purpose

Suscribir usuarios a la newsletter con flujo de doble opt-in (suscripción → email confirmación → activación), cumpliendo buenas prácticas anti-spam y permitiendo unsubscribe con un click.

## Requirements

### Requirement: Endpoint de suscripción
The system **SHALL** enviar el email del suscriptor a `${PUBLIC_API_URL}/api/v1/newsletter/subscribe` con token Turnstile.

#### Scenario: Suscripción exitosa
- **Given** el usuario introduce un email válido y Turnstile pasa
- **When** hace click en "Suscribirme"
- **Then** la API responde 200/201
- **And** aparece "Casi listo, te enviamos un email para confirmar".

### Requirement: Confirmación por email
The system **SHALL** mostrar página `/suscripcion-confirmada` cuando el usuario sigue el link de confirmación desde su email.

#### Scenario: Confirmación clickeada
- **Given** el usuario clickea el link del email
- **When** llega a `/suscripcion-confirmada?token=<t>`
- **Then** se valida el token con backend
- **And** se muestra "¡Listo! Ya recibes nuestras noticias.".

### Requirement: Unsubscribe con un click
The system **SHALL** soportar `/unsubscribe?token=<jwt>` que elimina la suscripción y muestra confirmación.

#### Scenario: Unsubscribe
- **Given** el usuario clickea "darme de baja" en cualquier newsletter
- **When** llega a `/unsubscribe?token=<t>`
- **Then** se elimina la suscripción
- **And** se muestra mensaje "Te has dado de baja correctamente".

### Requirement: Validación cliente
The system **SHALL** validar:
- Email regex estándar
- Honeypot anti-bot
- Turnstile si está configurado

#### Scenario: Email inválido bloquea suscripción
- **Given** el usuario escribe "no-es-email"
- **When** intenta suscribirse
- **Then** aparece error inline y no se envía la petición.

### Requirement: Mensajes claros
The system **SHALL** mostrar feedback diferenciado para:
- "Casi listo — revisa tu email"
- "Email inválido"
- "Hubo un problema, intenta más tarde"

#### Scenario: Mensaje de éxito claro
- **Given** suscripción enviada correctamente
- **When** la API confirma
- **Then** aparece mensaje "Casi listo — revisa tu email".