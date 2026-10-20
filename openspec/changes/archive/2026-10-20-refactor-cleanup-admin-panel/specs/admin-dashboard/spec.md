# Spec Delta

## REMOVED Requirements

### Requirement: Ruta de dashboard accesible
**Reason**: El dashboard legacy se elimina porque consumía endpoints inexistentes y mostraba datos de ejemplo.
**Migration**: Usar `/admin` como único punto de entrada placeholder hasta implementar el CRUD real.

### Requirement: Layout administrativo custom
**Reason**: El layout con sidebar y header pertenece al dashboard eliminado.
**Migration**: Recrear el layout cuando exista una nueva vista administrativa con datos reales.

### Requirement: Paleta del sistema de diseño
**Reason**: La paleta se aplicaba a componentes admin que se eliminan en este cambio.
**Migration**: La futura UI administrativa debe usar los tokens del sistema de diseño.

### Requirement: Navegación en sidebar
**Reason**: El sidebar y sus enlaces a `/admin/leads` y `/admin/settings` se eliminan.
**Migration**: Reintroducir navegación cuando existan rutas administrativas reales.

### Requirement: Perfil de usuario en header
**Reason**: El header administrativo con perfil y logout se elimina.
**Migration**: Recrear el perfil y logout en el futuro layout administrativo.

### Requirement: Modo oscuro/claro
**Reason**: El toggle de tema vivía en el header administrativo eliminado.
**Migration**: Reutilizar el theming global del sitio cuando se recree la UI administrativa.

### Requirement: Stats cards
**Reason**: Las métricas se alimentaban de endpoints inexistentes y datos hardcodeados.
**Migration**: Implementar métricas reales en un cambio de CRUD/dashboard futuro.

### Requirement: Tabla de leads recientes
**Reason**: La tabla consumía `/api/v1/leads/recent`, que no existe en la API actual.
**Migration**: Implementar la tabla cuando exista el endpoint y la vista administrativa real.

### Requirement: Responsive design
**Reason**: El comportamiento responsive pertenecía exclusivamente al dashboard eliminado.
**Migration**: Aplicar responsive design en las nuevas vistas administrativas.

### Requirement: Protección de ruta
**Reason**: No habrá rutas administrativas con datos hasta que exista el CRUD real; el placeholder es público.
**Migration**: Recrear la protección de `/admin/*` antes de exponer datos o acciones administrativas.

### Requirement: Tests requeridos
**Reason**: Los tests exigidos correspondían a componentes y flujos del dashboard eliminado.
**Migration**: Añadir tests del nuevo placeholder y, en el futuro, del CRUD administrativo.

## ADDED Requirements

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
