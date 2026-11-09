## ADDED Requirements

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

## REMOVED Requirements

Ninguna. Los requisitos existentes de `client-portal-auth` se mantienen sin cambios.

## MODIFIED Requirements

Ninguna. Se adiciona el nuevo requisito de redirección sin modificar los existentes.
