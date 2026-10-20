# Capability: admin-dashboard

## Purpose

Punto de entrada administrativo público. Expone `/admin` como página estática placeholder, sin dashboard, widgets ni llamadas a la API, hasta implementar el CRUD real.

## Requirements

### Requirement: Ruta placeholder de administración
The system **SHALL** exponer `/admin` como una página estática placeholder sin dashboard, sin widgets y sin llamadas a la API.

#### Scenario: Placeholder accesible
- **WHEN** un visitante accede a `/admin`
- **THEN** recibe una página estática con un mensaje de panel en construcción

#### Scenario: Rutas legacy no disponibles
- **WHEN** un visitante accede a `/admin/dashboard`, `/admin/leads` o `/admin/settings`
- **THEN** el sitio no sirve esas páginas

#### Scenario: Sin datos administrativos
- **WHEN** se renderiza `/admin`
- **THEN** no se solicitan estadísticas ni leads y no se muestran datos de ejemplo
