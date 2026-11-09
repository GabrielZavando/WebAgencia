## ADDED Requirements

### Requirement: Base visual del login con TailAdmin

The system **SHALL** renderizar el formulario de login usando la isla de login de TailAdmin (versión React) como base visual (tarjeta, inputs de email y contraseña, botón submit), manteniendo inalterado el flujo de autenticación (Firebase Auth + `POST /api/v1/auth/login`, redirección a `/admin`, token solo en cookie httpOnly, sin registro, sin recuperación de contraseña).

#### Scenario: Login renderizado con componente de TailAdmin
- **WHEN** el usuario abre `/login`
- **THEN** el formulario es renderizado por la isla de login de TailAdmin hidratada con `client:load`
- **AND** la isla muestra tarjeta de login, campo email, campo contraseña y botón submit
- **AND** el foco va automáticamente al primer campo (email)
- **AND** Tab navega ordenadamente entre campos y botón submit
- **AND** el form se puede enviar presionando Enter

#### Scenario: Envío exitoso redirige a /admin
- **WHEN** el usuario introduce email y password válidos y hace submit
- **AND** la autenticación de Firebase (`signInWithEmailAndPassword`) tiene éxito
- **AND** el backend responde 200 a `POST /api/v1/auth/login` con `{ token, user: { email, role: "admin" }, expiresAt }`
- **THEN** el navegador redirige a `/admin`
- **AND** no se guarda el token en `localStorage` (gestión por cookie httpOnly)

#### Scenario: Credenciales inválidas muestran mensaje genérico
- **WHEN** el usuario introduce email o password incorrectos
- **AND** Firebase responde `auth/invalid-credential` o el backend responde 401
- **THEN** aparece un mensaje genérico "Credenciales inválidas"
- **AND** no se revela si el email existe

#### Scenario: Rate limit deshabilita el botón temporalmente
- **WHEN** el backend responde 429 tras múltiples intentos
- **THEN** aparece "Demasiados intentos, espera unos minutos"
- **AND** el botón submit se deshabilita por 60 segundos

#### Scenario: Error de red muestra mensaje y botón Reintentar
- **WHEN** el backend no responde y el timeout expira
- **THEN** aparece "Error de conexión, intenta más tarde"
- **AND** se muestra un botón "Reintentar"

## REMOVED Requirements

Ninguna. Los requisitos existentes de `client-portal-auth` (ruta única, sin registro, sin recuperación, un solo admin, validación cliente, endpoint consumido, manejo de respuesta, aislamiento en página, arquitectura island, sin persistencia cliente del token, bundle mínimo, tests) se mantienen sin cambios; solo se adiciona la base visual TailAdmin.
