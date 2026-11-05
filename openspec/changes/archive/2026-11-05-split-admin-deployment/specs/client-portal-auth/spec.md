# Spec Delta

## MODIFIED Requirements

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
