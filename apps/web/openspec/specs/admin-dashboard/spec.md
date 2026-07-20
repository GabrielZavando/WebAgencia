# Capability: admin-dashboard

## Purpose

Panel de administración custom con componentes propios usando Tailwind utility-first y tokens del sistema de diseño. Accesible solo para usuarios autenticados con rol admin. Proporciona vista general de métricas, leads recientes y navegación a futuras funcionalidades administrativas.

## Requirements

### Requirement: Ruta de dashboard accesible
The system **SHALL** exponer una ruta `/admin/dashboard` que renderiza el panel administrativo.

#### Scenario: Dashboard accesible para usuarios autenticados
- **GIVEN** el usuario tiene una sesión válida (cookie httpOnly)
- **WHEN** accede a `/admin/dashboard`
- **THEN** el dashboard carga y muestra estadísticas y datos

#### Scenario: Dashboard loading state
- **GIVEN** el usuario accede al dashboard
- **WHEN** los datos de la API están cargando
- **THEN** se muestran skeleton loaders en lugar de contenido vacío

### Requirement: Layout administrativo custom
The system **SHALL** implementar layout personalizado con sidebar colapsable y header fijo, usando componentes propios (`DashboardLayout.tsx`, `Sidebar.tsx`, `Header.tsx`) con **Tailwind utility-first** y tokens del sistema de diseño.

#### Scenario: Sidebar visible
- **GIVEN** el dashboard está cargado
- **WHEN** el usuario inspecciona el layout
- **THEN** ve sidebar lateral con menú de navegación

#### Scenario: Sidebar colapsable
- **GIVEN** el sidebar está expandido
- **WHEN** el usuario hace click en el botón de colapsar
- **THEN** el sidebar se contrae mostrando solo íconos

#### Scenario: Header administrativo
- **GIVEN** el dashboard está cargado
- **WHEN** el usuario inspecciona la parte superior
- **THEN** ve header con título de página y perfil de usuario

### Requirement: Paleta del sistema de diseño
The system **SHALL** usar la misma paleta de colores que el sitio público (`--color-primary`, `--color-secondary`, etc.) en todos los componentes admin. **SHALL NOT** usar colores genéricos de Tailwind (`gray-*`) sin mapear a tokens del sistema.

#### Scenario: Colores admin consistentes con sitio público
- **GIVEN** el usuario ve el dashboard
- **WHEN** inspecciona los colores
- **THEN** ve magenta (`--color-primary`), violeta (`--color-secondary`) y accent (`--color-accent`) en acciones y acentos

### Requirement: Navegación en sidebar
The system **SHALL** mostrar menú de navegación en sidebar con enlaces a secciones administrativas.

#### Scenario: Menú de navegación básico
- **GIVEN** el usuario ve el sidebar
- **WHEN** inspecciona los enlaces
- **THEN** ve al menos: Dashboard, Leads, Configuración (placeholder)

#### Scenario: Enlace activo destacado
- **GIVEN** el usuario está en `/admin/dashboard`
- **WHEN** inspecciona el sidebar
- **THEN** el enlace "Dashboard" tiene estilo activo (highlight)

### Requirement: Perfil de usuario en header
The system **SHALL** mostrar información del usuario autenticado en header con opción de logout.

#### Scenario: Email del usuario visible
- **GIVEN** el usuario está autenticado
- **WHEN** ve el header del dashboard
- **THEN** ve su email en el dropdown de perfil

#### Scenario: Logout funcional
- **GIVEN** el usuario abre el dropdown de perfil
- **WHEN** hace click en "Cerrar sesión"
- **THEN** se invalida la sesión y redirige a `/login`

### Requirement: Modo oscuro/claro
The system **SHALL** soportar cambio de tema (claro/oscuro) en el dashboard.

#### Scenario: Toggle de tema
- **GIVEN** el usuario está en el dashboard
- **WHEN** hace click en el toggle de tema
- **THEN** el tema cambia y se persiste en localStorage

#### Scenario: Tema sincronizado con sitio público
- **GIVEN** el usuario cambió tema en el sitio público
- **WHEN** accede al dashboard
- **THEN** el dashboard usa el mismo tema (si está implementado)

### Requirement: Stats cards
The system **SHALL** mostrar tarjetas de estadísticas con métricas clave del sitio.

#### Scenario: Stats cards visibles
- **GIVEN** el dashboard cargó datos
- **WHEN** el usuario ve la sección principal
- **THEN** ve al menos 4 tarjetas: Visitantes, Leads, Proyectos, Ingresos (o placeholders)

#### Scenario: Stats con datos de API
- **GIVEN** la API retorna estadísticas
- **WHEN** el dashboard carga
- **THEN** las tarjetas muestran valores reales (no hardcoded)

#### Scenario: Stats con formato legible
- **GIVEN** las estadísticas tienen valores numéricos
- **WHEN** se muestran en las tarjetas
- **THEN** usan formato legible (separadores de miles, porcentajes)

### Requirement: Tabla de leads recientes
The system **SHALL** mostrar tabla con los últimos leads recibidos.

#### Scenario: Tabla visible
- **GIVEN** el dashboard cargó datos
- **WHEN** el usuario ve la sección de leads
- **THEN** ve tabla con columnas: Nombre, Email, Teléfono, Servicio, Fecha

#### Scenario: Leads de API
- **GIVEN** hay leads en la base de datos
- **WHEN** el dashboard carga
- **THEN** la tabla muestra los 10 leads más recientes

#### Scenario: Tabla con paginación (opcional)
- **GIVEN** hay más de 10 leads
- **WHEN** el usuario ve la tabla
- **THEN** puede navegar a páginas siguientes (si está implementado)

### Requirement: Responsive design
The system **SHALL** ser completamente responsive en dispositivos móviles y tablets.

#### Scenario: Sidebar móvil
- **GIVEN** el usuario está en viewport móvil (< 768px)
- **WHEN** accede al dashboard
- **THEN** el sidebar está oculto por defecto con botón hamburger para mostrar

#### Scenario: Tabla responsive
- **GIVEN** el usuario está en viewport móvil
- **WHEN** ve la tabla de leads
- **THEN** la tabla tiene scroll horizontal o se transforma en cards

### Requirement: Protección de ruta
The system **SHALL** validar autenticación antes de mostrar el dashboard.

#### Scenario: Redirección si no autenticado
- **GIVEN** el usuario no tiene sesión válida
- **WHEN** accede a `/admin/dashboard`
- **THEN** es redirigido a `/login`

#### Scenario: Redirección post-login
- **GIVEN** el usuario se autentica en `/login`
- **WHEN** el login es exitoso
- **THEN** es redirigido a `/admin/dashboard`

### Requirement: Tests requeridos
The system **SHALL** incluir tests de validación y E2E.

#### Scenario: Test de renderizado
- **GIVEN** el dashboard está implementado
- **WHEN** se ejecutan tests Vitest
- **THEN** existe test que valida renderizado de componentes

#### Scenario: Test E2E de flujo completo
- **GIVEN** el dashboard está implementado
- **WHEN** se ejecutan tests Playwright
- **THEN** existe spec que valida flujo: login → dashboard → logout
