# Delta Spec: client-portal-auth

## MODIFIED Requirements

### Requirement: Endpoint consumido

**FROM:**
```
### Requirement: Endpoint consumido
The system **SHALL** POST a `${PUBLIC_API_URL}/api/v1/auth/login` con `{ email, password, turnstileToken? }`.

#### Scenario: Login con credenciales válidas
- **Given** el usuario introduce email válido y password de 8+ caracteres
- **And** Turnstile genera token
- **When** hace click en "Iniciar sesión"
- **Then** la API responde 200 con `{ token, user: { email, role: "admin" }, expiresAt }`
- **And** el navegador redirige a `/`
- **And** no se guarda token en localStorage (gestión por cookie).
```

**TO:**
```
### Requirement: Endpoint consumido
The system **SHALL** POST a `${PUBLIC_API_URL}/api/v1/auth/login` con `{ email, password, turnstileToken? }`.

#### Scenario: Login con credenciales válidas
- **Given** el usuario introduce email válido y password de 8+ caracteres
- **And** Turnstile genera token
- **When** hace click en "Iniciar sesión"
- **Then** la API responde 200 con `{ token, user: { email, role: "admin" }, expiresAt }`
- **And** el navegador redirige a `/admin/dashboard`
- **And** no se guarda token en localStorage (gestión por cookie).
```

### Requirement: Manejo de respuesta

**FROM:**
```
### Requirement: Manejo de respuesta
The system **SHALL** procesar la respuesta del backend:
- **200**: token JWT recibido; redirigir a destino post-login (por defecto `/`)
- **401**: mensaje genérico "Credenciales inválidas" (no revela si email existe)
- **429**: "Demasiados intentos, espera unos minutos"
- **5xx / network**: "Error de conexión, intenta más tarde"
```

**TO:**
```
### Requirement: Manejo de respuesta
The system **SHALL** procesar la respuesta del backend:
- **200**: token JWT recibido; redirigir a `/admin/dashboard`
- **401**: mensaje genérico "Credenciales inválidas" (no revela si email existe)
- **429**: "Demasiados intentos, espera unos minutos"
- **5xx / network**: "Error de conexión, intenta más tarde"
```

## ADDED Requirements

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