# Capability: auth-protection (delta)

## MODIFIED Requirements

### Requirement: Invalidación de sesión en logout
The system **SHALL** invalidar la sesión del lado del servidor al cerrar sesión.

#### Scenario: Logout desde header
- **GIVEN** el usuario está autenticado en el dashboard
- **WHEN** hace click en "Cerrar sesión" en el dropdown de perfil
- **THEN** se llama a `POST /api/v1/auth/logout` y se invalida la cookie

#### Scenario: Redirección post-logout
- **GIVEN** el logout fue exitoso
- **WHEN** la API confirma 200
- **THEN** el usuario es redirigido a `/login`

#### Scenario: Manejo de error en logout
- **GIVEN** la API no responde al logout
- **WHEN** hay error de red
- **THEN** se limpia la sesión localmente y redirige a `/login` de todos modos

#### Scenario: Endpoint logout existe en backend
- **GIVEN** el backend NestJS está corriendo
- **WHEN** se envía `POST /api/v1/auth/logout`
- **THEN** el endpoint existe y retorna HTTP 200 con `{ data: null, meta: { message: "Sesión cerrada exitosamente" } }`

#### Scenario: Logout limpia cookie de sesión
- **GIVEN** el usuario tiene una cookie de sesión
- **WHEN** el endpoint logout se ejecuta
- **THEN** la respuesta incluye header `Set-Cookie` con `max-age=0` para expirar la cookie
- **AND** la cookie se marca como `httpOnly` y `sameSite=strict`
