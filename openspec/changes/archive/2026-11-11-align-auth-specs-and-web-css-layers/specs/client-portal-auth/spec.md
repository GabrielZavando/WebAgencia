## MODIFIED Requirements

### Requirement: Endpoint consumido
The system **SHALL** POST a `${PUBLIC_API_URL}/api/v1/auth/login` con `{ id_token }`, donde `id_token` es el token de ID emitido por Firebase Auth para el usuario autenticado.

#### Scenario: Login con credenciales válidas
- **Given** el usuario introduce email válido y password de 8+ caracteres
- **And** Firebase Auth autentica al usuario con `signInWithEmailAndPassword`
- **When** hace click en "Iniciar sesión"
- **Then** el cliente obtiene el `id_token` de Firebase y lo envía en el body
- **And** la API responde 200 con `{ data: { user }, meta: { message } }`
- **And** el navegador redirige a `/admin`
- **And** no se guarda token en localStorage (gestión por cookie).

### Requirement: Manejo de respuesta
The system **SHALL** procesar la respuesta del backend:
- **200**: recibe `{ data: { user }, meta: { message } }`, donde `user` contiene `id`, `email`, `full_name`, `role`, `avatar_url`, `is_active`, `created_at` y `updated_at`; si `user.role === "admin"` redirige a `/admin`
- **401**: mensaje genérico "Credenciales inválidas" (no revela si email existe)
- **429**: "Demasiados intentos, espera unos minutos"
- **5xx / network**: "Error de conexión, intenta más tarde", mostrado inline en el formulario, sin botón "Reintentar"

#### Scenario: Credenciales inválidas
- **Given** el usuario introduce email o password incorrectos
- **When** envía el form
- **Then** la autenticación de Firebase falla o la API responde 401
- **And** aparece mensaje genérico "Credenciales inválidas" (sin distinguir si email existe).

#### Scenario: Rate limit excedido
- **Given** el usuario ha intentado login 5 veces en menos de 1 minuto
- **When** el backend responde 429
- **Then** aparece "Demasiados intentos, espera unos minutos" y se deshabilita el botón por 60s.

#### Scenario: Sin API (network error)
- **Given** el backend no responde
- **When** el timeout expira
- **Then** aparece "Error de conexión, intenta más tarde" mostrado inline dentro del formulario
- **And** no se muestra botón "Reintentar".

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
- **AND** el backend responde 200 a `POST /api/v1/auth/login` con `{ data: { user }, meta: { message } }`
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

#### Scenario: Error de red muestra mensaje inline
- **WHEN** el backend no responde y el timeout expira
- **THEN** aparece "Error de conexión, intenta más tarde" mostrado inline dentro del formulario
- **AND** no se muestra botón "Reintentar"

### Requirement: Validación cliente
The system **SHALL** validar el formulario antes de enviar:
- `email`: regex email estándar
- `password`: 8-128 caracteres, no vacío tras trim
- Honeypot anti-bot
- Turnstile si `PUBLIC_TURNSTILE_SITE_KEY` está configurado

Los errores de formato se muestran inline en el campo correspondiente, al desenfocar el campo (`onBlur`) o al enviar el formulario. El botón de submit **SHALL NOT** deshabilitarse por validación de formato: solo se deshabilita mientras la petición está en curso o durante el rate limit.

#### Scenario: Validación cliente bloquea envío
- **Given** el usuario introduce email malformado "no-es-email"
- **When** desenfoca el campo
- **Then** aparece error inline "Email inválido"
- **And** el envío no procede cuando se intenta enviar el formulario
- **And** el botón submit permanece habilitado.

### Requirement: Aislamiento de la auth en página dedicada
The system **SHALL** renderizar `/login` envuelto en `AdminLayout` con `hideHeader` y `hideSidebar` activos.

#### Scenario: Header y sidebar ocultos en login
- **Given** el usuario está en `/login`
- **When** inspecciona el layout
- **Then** el header y el sidebar no son visibles.

### Requirement: Bundle mínimo
The system **SHALL** mantener las dependencias de auth al mínimo: `@astrojs/react`, `react`, `react-dom` y `firebase` (Firebase Auth es la fuente de identidad y emite el `id_token` que consume la API). No se introducen frameworks de auth adicionales (no NextAuth, no Auth.js).

#### Scenario: Dependencias mínimas de auth
- **Given** el build está completo
- **When** se inspecciona `package.json`
- **Then** las únicas dependencias de auth son `@astrojs/react`, `react`, `react-dom` y `firebase`.

### Requirement: Island Architecture
The system **SHALL** implementar el formulario como **React Island** (`@astrojs/react`) hidratado con `client:load`. **SHALL NOT** usar `client:idle` (se requiere disponibilidad inmediata).

#### Scenario: Formulario hidratado inmediatamente
- **Given** la página `/login` carga
- **When** se inspecciona el componente `<TailAdminLogin />`
- **Then** tiene directiva `client:load` (no `client:idle`).
