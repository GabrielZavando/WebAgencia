# Spec Delta

## MODIFIED Requirements

### Requirement: Endpoint consumido
The system **SHALL** POST a `${PUBLIC_API_URL}/api/v1/auth/login` con `{ email, password, turnstileToken? }`.

#### Scenario: Login con credenciales válidas
- **Given** el usuario introduce email válido y password de 8+ caracteres
- **And** Turnstile genera token
- **When** hace click en "Iniciar sesión"
- **Then** la API responde 200 con `{ token, user: { email, role: "admin" }, expiresAt }`
- **And** el navegador redirige a `/admin`
- **And** no se guarda token en localStorage (gestión por cookie).

### Requirement: Manejo de respuesta
The system **SHALL** procesar la respuesta del backend:
- **200**: token JWT recibido; redirigir a `/admin`
- **401**: mensaje genérico "Credenciales inválidas" (no revela si email existe)
- **429**: "Demasiados intentos, espera unos minutos"
- **5xx / network**: "Error de conexión, intenta más tarde"

#### Scenario: Credenciales inválidas
- **Given** el usuario introduce email o password incorrectos
- **When** envía el form
- **Then** la API responde 401
- **And** aparece mensaje genérico "Credenciales inválidas" (sin distinguir si email existe).

#### Scenario: Rate limit excedido
- **Given** el usuario ha intentado login 5 veces en menos de 1 minuto
- **When** el backend responde 429
- **Then** aparece "Demasiados intentos, espera unos minutos" y se deshabilita el botón por 60s.

#### Scenario: Sin API (network error)
- **Given** el backend no responde
- **When** el timeout (15s) expira
- **Then** aparece "Error de conexión, intenta más tarde" con botón "Reintentar".

## REMOVED Requirements

### Requirement: Validación de sesión para dashboard
**Reason**: El dashboard y su layout se eliminan; `/admin` es un placeholder público sin verificación de sesión.
**Migration**: Recrear la validación de sesión cuando exista una vista administrativa con datos reales.

### Requirement: Logout desde dashboard
**Reason**: El header administrativo que contenía el logout se elimina junto con el dashboard.
**Migration**: Reintroducir el logout en la UI administrativa futura; el endpoint backend permanece documentado en `docs/api-spec.yml`.
