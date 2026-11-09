# Capability: client-portal-auth

## Purpose

Autenticación cliente para un único usuario admin. Punto de entrada aislado (`/login`) para acceder a un portal futuro. **No hay registro público**, **no hay recuperación de contraseña vía UI**.

## Requirements

### Requirement: Una sola ruta de login
The system **SHALL** exponer una única ruta `/login`, servida por `apps/admin` como aplicación en modo servidor, que renderiza un formulario de autenticación.

#### Scenario: Página de login accesible
- **Given** el usuario accede a `/login`
- **When** la página carga
- **Then** el foco va automáticamente al primer campo (email)
- **And** Tab navega ordenadamente entre campos y botón submit
- **And** el form se puede enviar presionando Enter.

#### Scenario: Login fuera del sitio público
- **Given** el usuario accede a `/login` en el dominio del sitio público
- **When** el sitio público es un artefacto estático
- **Then** esa ruta no existe en `apps/web`
- **And** el login solo está disponible en el dominio del panel admin

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

### Requirement: Redirección automática cuando no hay sesión activa

The system **SHALL** redirigir al usuario a `/login` cuando intente acceder a rutas protegidas (`/`, `/admin/*`) sin tener una sesión activa de Firebase Auth.

#### Scenario: Ruta raíz sin sesión redirige a /login
- **WHEN** el usuario accede a `/` sin sesión activa de Firebase Auth
- **THEN** el navegador redirige a `/login`

#### Scenario: Ruta raíz con sesión redirige a /admin
- **WHEN** el usuario accede a `/` con sesión activa de Firebase Auth
- **THEN** el navegador redirige a `/admin`

#### Scenario: Ruta /admin/* sin sesión redirige a /login
- **WHEN** el usuario accede a cualquier ruta bajo `/admin/` sin sesión activa
- **THEN** el navegador redirige a `/login`

#### Scenario: Ruta /login con sesión activa redirige a /admin
- **WHEN** el usuario accede a `/login` con sesión activa de Firebase Auth
- **THEN** el navegador redirige a `/admin`

#### Scenario: Ruta /login sin sesión muestra el formulario
- **WHEN** el usuario accede a `/login` sin sesión activa
- **THEN** se muestra el formulario de login de TailAdmin

### Requirement: Estilos del login cargados correctamente

The system **SHALL** cargar los estilos de Tailwind y los tokens CSS del proyecto en la página `/login` para que el formulario de login se renderice con el diseño esperado (tarjeta, inputs, botón).

#### Scenario: global.css importado en el layout admin
- **WHEN** se inspecciona `apps/admin/src/layouts/AdminLayout.astro`
- **THEN** contiene un import de `../styles/global.css`
- **AND** los tokens CSS custom properties (`--color-primary`, `--color-surface`, etc.) están disponibles en el DOM

### Requirement: Las utilidades Tailwind prevalecen sobre el CSS legacy

The system **SHALL** declarar el CSS legacy (reset universal y reset de controles de formulario) dentro de una cascade layer para que las utilidades Tailwind, emitidas en `@layer utilities`, siempre prevalezcan. El CSS sin capa tiene mayor prioridad en la cascada y anula las utilidades, dejando el botón de login transparente y sin padding.

#### Scenario: El reset universal está dentro de una cascade layer
- **WHEN** se inspecciona `apps/admin/src/styles/global.css`
- **THEN** la regla `*, *::before, *::after` que declara `margin: 0; padding: 0; border: 0` está contenida en un bloque `@layer`

#### Scenario: El reset de controles de formulario está dentro de una cascade layer
- **WHEN** se inspecciona `apps/admin/src/styles/global.css`
- **THEN** la regla `input, button, textarea, select` que declara `background: transparent` está contenida en un bloque `@layer`

#### Scenario: No existen reglas top-level sin capa que sobrescriban utilidades
- **WHEN** se recorren las reglas de nivel superior de `apps/admin/src/styles/global.css`
- **THEN** ninguna regla sobre `*`, `html`, `body`, `input`, `button`, `textarea` o `select` queda fuera de una cascade layer

#### Scenario: El botón de login renderiza con sus utilidades Tailwind
- **WHEN** se abre `/login` en un navegador
- **THEN** el botón "Iniciar sesión" tiene `padding-block` de 12px, fondo no transparente y una altura de al menos 40px
- **AND** la tarjeta del login tiene padding interior y borde visible de 1px

### Requirement: La página de login ocupa toda la pantalla

The system **SHALL** renderizar la página `/login` a pantalla completa, sin el padding lateral reservado para el sidebar, con la imagen de fondo visible y el logo con opacidad distinta de cero.

#### Scenario: Sin padding de sidebar en la página de login
- **WHEN** se abre `/login` en un viewport de escritorio
- **THEN** el contenedor del layout no aplica `padding-left` para el sidebar

#### Scenario: La imagen de fondo es visible
- **WHEN** se abre `/login` en un navegador
- **THEN** el contenedor de la imagen de fondo tiene un `z-index` igual o mayor que el del fondo de la sección, y menor que el del contenido

#### Scenario: El logo es visible
- **WHEN** se abre `/login` en un navegador
- **THEN** el logo tiene `opacity` distinta de cero

### Requirement: Sin warning de React por evento onsubmit

The system **SHALL** no usar el atributo nativo `onsubmit` en formularios React del login, evitando el warning "Invalid event handler property 'onsubmit'".

#### Scenario: Formulario usa onSubmit de React
- **WHEN** se inspecciona `apps/admin/src/components/auth/TailAdminLogin.tsx`
- **THEN** el elemento `<form>` no contiene el atributo `onsubmit`
- **AND** el elemento `<form>` contiene `onSubmit={handleSubmit}` que llama a `e.preventDefault()`

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
