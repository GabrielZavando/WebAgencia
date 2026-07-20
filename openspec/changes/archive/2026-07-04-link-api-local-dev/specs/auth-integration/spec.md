## ADDED Requirements

### Requirement: Login con Firebase ID token
El sistema SHALL autenticar mediante Firebase Auth y enviar el ID token al endpoint `/api/v1/auth/login`.

#### Scenario: Login exitoso
- **WHEN** el usuario ingresa email y password válidos en Firebase Auth
- **THEN** el frontend obtiene el ID token vía Firebase SDK y envía POST con `{ id_token: "..." }`
- **THEN** la API responde con `{ data: { user: {...} }, meta: {...} }` y el frontend redirige a `/admin/dashboard`

#### Scenario: Login fallido - token inválido o expirado
- **WHEN** el Firebase ID token es inválido o está expirado
- **THEN** la API responde con `{ error: "Unauthorized", message: "Token inválido o expirado", statusCode: 401 }`
- **THEN** el frontend muestra "Credenciales invalidas" y permite reintentar

#### Scenario: Login fallido - error de Firebase Auth
- **WHEN** Firebase Auth rechaza las credenciales (email/password incorrectos)
- **THEN** el frontend muestra error de Firebase y no intenta llamar a la API

#### Scenario: Login fallido - error de conexión
- **WHEN** la API no está disponible (localhost apagado)
- **THEN** el frontend muestra "Error de conexión - verifica que la API esté corriendo"

### Requirement: Verificación de sesión activa
El sistema SHALL verificar el estado de autenticación al cargar el dashboard usando cookies httpOnly.

#### Scenario: Sesión válida
- **WHEN** el usuario navega a `/admin/dashboard` con sesión activa
- **THEN** el frontend llama a `/api/v1/auth/me` y muestra el dashboard con datos

#### Scenario: Sesión expirada o inválida
- **WHEN** el usuario navega a `/admin/dashboard` sin sesión válida
- **THEN** el frontend redirige a `/login`

#### Scenario: Sesión - error de red
- **WHEN** la API no responde al verificar sesión
- **THEN** el frontend muestra error de conexión y sugiere verificar la API local

### Requirement: Carga de datos del dashboard desde API
El sistema SHALL cargar estadísticas y leads recientes desde la API local para visualización en el dashboard.

#### Scenario: Carga exitosa de estadísticas
- **WHEN** el dashboard se carga con sesión válida
- **THEN** obtiene datos de `/api/v1/stats/summary` y muestra visitors, leads, projects, revenue

#### Scenario: Carga exitosa de leads recientes
- **WHEN** el dashboard se carga con sesión válida
- **THEN** obtiene datos de `/api/v1/leads/recent` y muestra tabla con últimos leads

#### Scenario: Fallback con datos mock
- **WHEN** la API no responde o devuelve error
- **THEN** el dashboard usa datos mockeados para mostrar UI funcional

### Requirement: Logout con invalidación de sesión
El sistema SHALL permitir cerrar sesión invalidando la cookie httpOnly en el backend.

#### Scenario: Logout exitoso
- **WHEN** el usuario hace clic en "Cerrar sesión"
- **THEN** el frontend llama a POST `/api/v1/auth/logout` y redirige a `/login`

#### Scenario: Logout con error
- **WHEN** la API no responde al hacer logout
- **THEN** el frontend igual redirige a `/login` (logout forzado del lado del cliente)