# Capability: client-portal-auth

## Purpose

Autenticación cliente para un único usuario admin. Punto de entrada aislado (`/login`) para acceder a un portal futuro. **No hay registro público**, **no hay recuperación de contraseña vía UI**.

## Requirements

### Requirement: Una sola ruta de login
The system **SHALL** exponer una única ruta `/login` que renderiza un formulario de autenticación.

#### Scenario: Página de login accesible
- **Given** el usuario accede a `/login`
- **When** la página carga
- **Then** el foco va automáticamente al primer campo (email)
- **And** Tab navega ordenadamente entre campos y botón submit
- **And** el form se puede enviar presionando Enter.

### Requirement: Sin registro
The system **SHALL NOT** ofrecer UI ni endpoint de registro de usuarios desde el cliente. The user creation **MUST** occur exclusively en el backend (seed/script).

#### Scenario: No hay link de registro
- **Given** el usuario está en `/login`
- **When** inspecciona la página
- **Then** no encuentra enlaces ni formularios de "Crear cuenta" o "Registrarse".

### Requirement: Sin recuperación de contraseña
The system **SHALL NOT** ofrecer UI de recuperación de contraseña ("olvidé mi contraseña"). Password reset **MUST** occur fuera de banda (manual).

#### Scenario: No hay link de recuperación
- **Given** el usuario está en `/login`
- **When** inspecciona la página
- **Then** no encuentra enlace "¿Olvidaste tu contraseña?".

### Requirement: Un único usuario admin
The system **SHALL** asumir exactamente **un** usuario con rol `admin` en el sistema. The system **SHALL NOT** soportar multi-tenancy ni múltiples roles desde el cliente.

#### Scenario: Rol único admin
- **Given** el usuario se autentica correctamente
- **When** la API responde con datos del usuario
- **Then** `user.role === "admin"` (único valor posible).

### Requirement: Validación cliente
The system **SHALL** validar el formulario antes de enviar:
- `email`: regex email estándar
- `password`: 8-128 caracteres, no vacío tras trim
- Honeypot anti-bot
- Turnstile si `PUBLIC_TURNSTILE_SITE_KEY` está configurado

#### Scenario: Validación cliente bloquea envío
- **Given** el usuario introduce email malformado "no-es-email"
- **When** desenfoca el campo
- **Then** aparece error inline "Email inválido"
- **And** el botón submit queda deshabilitado.

### Requirement: Endpoint consumido
The system **SHALL** POST a `${PUBLIC_API_URL}/api/v1/auth/login` con `{ email, password, turnstileToken? }`.

#### Scenario: Login con credenciales válidas
- **Given** el usuario introduce email válido y password de 8+ caracteres
- **And** Turnstile genera token
- **When** hace click en "Iniciar sesión"
- **Then** la API responde 200 con `{ token, user: { email, role: "admin" }, expiresAt }`
- **And** el navegador redirige a `/admin/dashboard`
- **And** no se guarda token en localStorage (gestión por cookie).

### Requirement: Manejo de respuesta
The system **SHALL** procesar la respuesta del backend:
- **200**: token JWT recibido; redirigir a `/admin/dashboard`
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

### Requirement: Aislamiento de la auth en página dedicada
The system **SHALL** renderizar `/login` envuelto en `MainLayout` con `hideHeader` y `hideFooter` activos.

#### Scenario: Header y footer ocultos en login
- **Given** el usuario está en `/login`
- **When** inspecciona el layout
- **Then** el header y footer no son visibles.

### Requirement: Island Architecture
The system **SHALL** implementar el formulario como **React Island** (`@astrojs/react`) hidratado con `client:load`. **SHALL NOT** usar `client:idle` (se requiere disponibilidad inmediata).

#### Scenario: Formulario hidratado inmediatamente
- **Given** la página `/login` carga
- **When** se inspecciona el componente `<LoginForm />`
- **Then** tiene directiva `client:load` (no `client:idle`).

### Requirement: Sin persistencia cliente del token
The system **SHALL NOT** almacenar el JWT en `localStorage` desde el cliente. El backend **SHALL** gestionar la sesión vía cookie `httpOnly`.

#### Scenario: Token no en localStorage
- **Given** el usuario se autentica exitosamente
- **When** se inspecciona `localStorage`
- **Then** no existe clave con el token JWT.

### Requirement: Bundle mínimo
The system **SHALL** añadir `@astrojs/react` y mantener dependencias de auth al mínimo (sólo `LoginForm.tsx`). No se introducen otras dependencias de auth (no Firebase, no NextAuth, no Auth.js).

#### Scenario: Dependencias mínimas de auth
- **Given** el build está completo
- **When** se inspecciona `package.json`
- **Then** las únicas deps nuevas son `@astrojs/react`, `react`, `react-dom` y sus tipos.

### Requirement: Tests requeridos
The system **SHALL** incluir:
- Vitest unit: render, validación cliente, manejo de errores
- Playwright E2E: carga, submit exitoso, submit con credenciales inválidas, rate limit

#### Scenario: Tests unitarios cubren validación
- **Given** la feature está implementada
- **When** se ejecuta `pnpm test`
- **Then** existen tests que validan email inválido, password corto, honeypot.

#### Scenario: Tests E2E cubren flujo completo
- **Given** la feature está implementada
- **When** se ejecuta `pnpm test:e2e`
- **Then** existe spec que prueba login exitoso y login fallido.

### Requirement: Validación de sesión para dashboard
The system **SHALL** verificar el estado de autenticación antes de mostrar el dashboard.

#### Scenario: Verificación de sesión al cargar dashboard
- **Given** el usuario accede a `/admin/dashboard`
- **When** el componente DashboardLayout se monta
- **Then** verifica si hay sesión válida vía API endpoint `/api/v1/auth/me`

#### Scenario: Redirección si no autenticado
- **Given** el usuario no tiene sesión válida
- **When** accede a `/admin/dashboard`
- **Then** es redirigido a `/login`

### Requirement: Logout desde dashboard
The system **SHALL** proveer funcionalidad de logout desde el header del dashboard.

#### Scenario: Logout funcional
- **Given** el usuario está autenticado en el dashboard
- **When** hace click en "Cerrar sesión" en el dropdown de perfil
- **Then** se invalida la sesión y redirige a `/login`