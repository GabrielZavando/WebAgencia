# Spec Delta

## REMOVED Requirements

### Requirement: Ruta placeholder de administración
**Reason**: `/admin` ya no es un placeholder estático "en construcción"; pasa a ser la entrada del shell administrativo del CMS.
**Migration**: cubierta por el requirement nuevo "Ruta de entrada del panel de administración".

## ADDED Requirements

### Requirement: Ruta de entrada del panel de administración
The system **SHALL** exponer `/admin` como entrada del panel de administración (shell con sidebar, header y área de contenido), construido con Tailwind utility-first, tokens del design system y shadcn/ui, todavía sin datos ni llamadas a la API.

#### Scenario: /admin renderiza el shell
- **WHEN** un usuario accede a `/admin`
- **THEN** ve el shell administrativo (sidebar + header + área de contenido)

#### Scenario: Rutas legacy no disponibles
- **WHEN** un visitante accede a `/admin/dashboard`, `/admin/leads` o `/admin/settings`
- **THEN** el sitio no sirve esas páginas

#### Scenario: Sin datos administrativos
- **WHEN** se renderiza `/admin`
- **THEN** no se solicitan estadísticas, leads ni artículos y no se muestran datos de ejemplo

#### Scenario: Login redirige a /admin
- **WHEN** el login es exitoso
- **THEN** `LoginForm.tsx` redirige a `/admin` (sin cambios respecto al estado actual)
