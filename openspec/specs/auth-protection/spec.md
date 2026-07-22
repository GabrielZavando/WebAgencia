# Capability: auth-protection

## Purpose

Extensión de la capacidad `client-portal-auth` para incluir protección de rutas administrativas y redirección post-login al dashboard. Define cómo se valida y gestiona la sesión para acceder a `/admin/*`.

## Requirements

### Requirement: Validación de sesión en cliente
The system **SHALL** verificar el estado de autenticación antes de mostrar contenido administrativo.

#### Scenario: Verificación de sesión al cargar dashboard
- **GIVEN** el usuario accede a `/admin/dashboard`
- **WHEN** el componente DashboardLayout se monta
- **THEN** verifica si hay sesión válida vía API endpoint `/api/v1/auth/me`

#### Scenario: Sesión válida
- **GIVEN** el usuario tiene cookie de sesión válida
- **WHEN** se verifica el estado de autenticación
- **THEN** la API responde 200 con datos del usuario y el dashboard se muestra

#### Scenario: Sesión inválida o expirada
- **GIVEN** el usuario no tiene sesión o expiró
- **WHEN** se verifica el estado de autenticación
- **THEN** la API responde 401 y el usuario es redirigido a `/login`

### Requirement: Redirección post-login exitoso
The system **SHALL** redirigir al dashboard después de un login exitoso.

#### Scenario: Redirección desde login
- **GIVEN** el usuario está en `/login`
- **WHEN** envía credenciales válidas y recibe 200 de la API
- **THEN** es redirigido a `/admin/dashboard` (no a `/`)

#### Scenario: Redirección con estado de éxito
- **GIVEN** el usuario fue redirigido desde login
- **WHEN** el dashboard carga
- **THEN** puede mostrar mensaje de bienvenida (opcional)

### Requirement: Protección de rutas /admin/*
The system **SHALL** proteger todas las rutas bajo `/admin/` requiriendo autenticación.

#### Scenario: Acceso a ruta admin protegida
- **GIVEN** el usuario no está autenticado
- **WHEN** accede a cualquier ruta `/admin/*`
- **THEN** es redirigido a `/login`

#### Scenario: Acceso a ruta admin con sesión válida
- **GIVEN** el usuario está autenticado
- **WHEN** accede a `/admin/dashboard`
- **THEN** puede acceder sin redirección

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

### Requirement: Persistencia de tema entre sitio público y admin
The system **SHALL** respetar la preferencia de tema (claro/oscuro) del usuario en el dashboard.

#### Scenario: Lectura de tema desde localStorage
- **GIVEN** el usuario cambió tema en el sitio público
- **WHEN** accede al dashboard
- **THEN** el dashboard lee `localStorage.theme` y aplica el mismo tema

#### Scenario: Cambio de tema en dashboard
- **GIVEN** el usuario está en el dashboard
- **WHEN** cambia el tema
- **THEN** se actualiza `localStorage.theme` y el sitio público refleja el cambio

### Requirement: Manejo de estados de carga
The system **SHALL** mostrar loading states mientras se verifica autenticación.

#### Scenario: Loading durante verificación
- **GIVEN** el usuario accede a `/admin/dashboard`
- **WHEN** se está verificando la sesión
- **THEN** muestra spinner o skeleton loader (no pantalla en blanco)

#### Scenario: Timeout de verificación
- **GIVEN** la API de verificación no responde
- **WHEN** pasa el timeout (15s)
- **THEN** muestra error y redirige a `/login`

### Requirement: Middleware de protección (implementación estática)
The system **SHALL** implementar protección de rutas en el cliente (dado que Astro es estático).

#### Scenario: Protección en componente Astro
- **GIVEN** la página `/admin/dashboard.astro`
- **WHEN** se renderiza
- **THEN** incluye lógica de redirección si no hay sesión (cookie check si es posible)

#### Scenario: Protección en componente React
- **GIVEN** el componente DashboardLayout
- **WHEN** se monta
- **THEN** verifica autenticación y redirige si no es válido

### Requirement: Actualización de spec client-portal-auth
The system **SHALL** modificar la spec existente `client-portal-auth` para incluir redirección al dashboard.

#### Scenario: Actualización de requirement de redirección
- **GIVEN** la spec `client-portal-auth` existe
- **WHEN** se implementa esta feature
- **THEN** se actualiza el scenario "Login con credenciales válidas" para redirigir a `/admin/dashboard` en lugar de `/`