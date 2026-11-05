# public-site-revalidation Specification

## Purpose

Permitir que la API notifique a Coolify para regenerar el sitio público estático cuando se publica, actualiza o elimina contenido, manteniendo el blog público en SSG y sin acoplar el panel admin a la lógica de negocio de artículos y categorías.

## Requirements

### Requirement: Endpoint de revalidación del sitio público

The system **SHALL** exponer `POST /api/v1/webhooks/rebuild-public` para disparar la regeneración del sitio público en Coolify.

#### Scenario: Revalidación solicitada
- **WHEN** un cliente autorizado envía `POST /api/v1/webhooks/rebuild-public`
- **THEN** la API responde `200 OK` con `data.triggered` en `true`
- **AND** se invoca el webhook de despliegue de Coolify en el servidor

#### Scenario: Cuerpo opcional
- **WHEN** la petición incluye un campo opcional `reason`
- **THEN** la API lo acepta sin exigirlo
- **AND** la petición sin cuerpo también es válida

### Requirement: Protección del endpoint de revalidación

The system **SHALL** exigir autenticación para invocar el endpoint mediante un Firebase ID token de rol `admin` o un token secreto server-side.

#### Scenario: Token secreto válido
- **WHEN** la petición incluye `X-Rebuild-Token` igual al secreto configurado
- **THEN** el endpoint se ejecuta

#### Scenario: Usuario admin autenticado
- **WHEN** la petición incluye `Authorization: Bearer <Firebase ID token>` de un usuario con rol `admin`
- **THEN** el endpoint se ejecuta

#### Scenario: Sin credenciales
- **WHEN** la petición no incluye token secreto ni Authorization
- **THEN** la API responde `401 Unauthorized`
- **AND** no se invoca el webhook de Coolify

#### Scenario: Usuario sin rol admin
- **WHEN** la petición se autentica con un usuario que no tiene rol `admin`
- **THEN** la API responde `403 Forbidden`
- **AND** no se invoca el webhook de Coolify

### Requirement: Notificación tras mutaciones de contenido

The system **SHALL** solicitar la revalidación del sitio público desde el panel de administración después de crear, actualizar o eliminar un artículo o una categoría de forma exitosa.

#### Scenario: Artículo publicado
- **WHEN** el panel admin guarda un artículo con estado `published`
- **THEN** la mutación se completa primero
- **AND** luego el panel solicita `POST /api/v1/webhooks/rebuild-public`

#### Scenario: Categoría modificada
- **WHEN** el panel admin crea, actualiza o elimina una categoría
- **THEN** la mutación se completa primero
- **AND** luego el panel solicita `POST /api/v1/webhooks/rebuild-public`

#### Scenario: Revalidación no bloqueante
- **WHEN** la solicitud de revalidación falla
- **THEN** el cambio de contenido ya guardado se conserva
- **AND** el panel muestra una advertencia sin revertir la mutación

### Requirement: Configuración del webhook de Coolify

The system **SHALL** leer la URL y el token del webhook de Coolify desde variables de entorno del servidor y **SHALL NOT** exponerlos al navegador.

#### Scenario: Webhook configurado
- **WHEN** `COOLIFY_REBUILD_WEBHOOK_URL` y su token están definidos
- **THEN** la API envía un `POST` server-side a esa URL
- **AND** no devuelve la URL ni el token en la respuesta

#### Scenario: Webhook no configurado
- **WHEN** `COOLIFY_REBUILD_WEBHOOK_URL` no está definido
- **THEN** la API responde `200 OK` con `data.skipped` en `true`
- **AND** registra una advertencia sin fallar la petición

#### Scenario: Coolify no responde correctamente
- **WHEN** el webhook de Coolify devuelve un error o no responde
- **THEN** la API responde `502 Bad Gateway` con un mensaje en español
- **AND** el contenido mutado no se revierte

### Requirement: Rate limiting de revalidación

The system **SHALL** aplicar el rate limit global de la API al endpoint de revalidación para evitar builds excesivos.

#### Scenario: Ráfaga de solicitudes
- **WHEN** un cliente supera el límite global de peticiones por minuto
- **THEN** la API responde `429 Too Many Requests`
- **AND** no se invoca el webhook de Coolify
