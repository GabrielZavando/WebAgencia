# Spec Delta

## MODIFIED Requirements

### Requirement: Ruta de entrada del panel de administración
The system **SHALL** exponer `/admin` como entrada del panel de administración (shell con sidebar, header y área de contenido), construido con Tailwind utility-first, tokens del design system y shadcn/ui, servido por `apps/admin` en modo servidor, todavía sin datos ni llamadas a la API en el shell.

#### Scenario: /admin renderiza el shell
- **WHEN** un usuario accede a `/admin`
- **THEN** ve el shell administrativo (sidebar + header y área de contenido)
- **AND** no se realizan llamadas a la API desde el shell

#### Scenario: Rutas legacy no disponibles
- **WHEN** un visitante accede a `/admin/dashboard`, `/admin/leads` o `/admin/settings`
- **THEN** el panel no sirve esas páginas

#### Scenario: Sin datos administrativos
- **WHEN** se renderiza `/admin`
- **THEN** no se solicitan estadísticas, leads ni artículos y no se muestran datos de ejemplo

#### Scenario: Login redirige a /admin
- **WHEN** el login es exitoso
- **THEN** `LoginForm.tsx` redirige a `/admin`

#### Scenario: El panel se sirve desde su propia aplicación
- **WHEN** se accede a `/admin` en el dominio del panel
- **THEN** la respuesta proviene de `apps/admin` y no del sitio público estático
- **AND** el sitio público no sirve la ruta `/admin`
