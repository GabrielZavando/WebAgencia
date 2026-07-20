# Capability: dashboard-widgets

## Purpose

Componentes reutilizables del dashboard administrativo basados en TailAdmin. Incluye stats cards, tablas de datos, y elementos UI que pueden extenderse para futuras funcionalidades administrativas.

## Requirements

### Requirement: StatsCard component
The system **SHALL** implementar componente reutilizable para tarjetas de estadísticas.

#### Scenario: StatsCard con valor único
- **GIVEN** el componente StatsCard recibe un valor numérico
- **WHEN** se renderiza
- **THEN** muestra el valor formateado con separadores de miles

#### Scenario: StatsCard con etiqueta
- **GIVEN** el componente StatsCard recibe una etiqueta (label)
- **WHEN** se renderiza
- **THEN** muestra la etiqueta debajo del valor

#### Scenario: StatsCard con indicador de tendencia
- **GIVEN** el componente StatsCard recibe un valor de tendencia (ej. +15%)
- **WHEN** se renderiza
- **THEN** muestra indicador visual (verde para positivo, rojo para negativo)

#### Scenario: StatsCard con ícono
- **GIVEN** el componente StatsCard recibe un ícono
- **WHEN** se renderiza
- **THEN** muestra el ícono en la esquina superior derecha o izquierda

### Requirement: StatsCards container
The system **SHALL** implementar contenedor grid para múltiples StatsCards.

#### Scenario: Grid responsive de stats
- **GIVEN** el contenedor StatsCards se renderiza
- **WHEN** viewport es desktop (>1024px)
- **THEN** muestra 4 columnas con las tarjetas

#### Scenario: Grid tablet
- **GIVEN** el contenedor StatsCards se renderiza
- **WHEN** viewport es tablet (768px-1024px)
- **THEN** muestra 2 columnas con las tarjetas

#### Scenario: Grid móvil
- **GIVEN** el contenedor StatsCards se renderiza
- **WHEN** viewport es móvil (<768px)
- **THEN** muestra 1 columna con las tarjetas

### Requirement: DataTable component
The system **SHALL** implementar componente de tabla para mostrar datos estructurados.

#### Scenario: DataTable con headers
- **GIVEN** el componente DataTable recibe definición de columnas
- **WHEN** se renderiza
- **THEN** muestra headers de columna con nombres proporcionados

#### Scenario: DataTable con filas de datos
- **GIVEN** el componente DataTable recibe array de datos
- **WHEN** se renderiza
- **THEN** muestra una fila por elemento del array

#### Scenario: DataTable con celdas formateadas
- **GIVEN** el componente DataTable recibe datos con fechas
- **WHEN** se renderiza
- **THEN** formatea fechas en formato legible (DD/MM/YYYY)

#### Scenario: DataTable empty state
- **GIVEN** el componente DataTable recibe array vacío
- **WHEN** se renderiza
- **THEN** muestra mensaje "No hay datos disponibles"

### Requirement: RecentLeadsTable component
The system **SHALL** implementar tabla específica para leads recientes.

#### Scenario: Columnas de leads
- **GIVEN** el componente RecentLeadsTable se renderiza
- **WHEN** hay datos de leads
- **THEN** muestra columnas: Nombre, Email, Teléfono, Servicio, Fecha

#### Scenario: Leads ordenados por fecha
- **GIVEN** el componente recibe lista de leads
- **WHEN** se renderiza
- **THEN** muestra leads más recientes primero (orden descendente por fecha)

#### Scenario: Click en fila de lead
- **GIVEN** el usuario ve la tabla de leads
- **WHEN** hace click en una fila
- **THEN** la fila tiene estilo hover y es clickable (futuro: navega a detalle)

### Requirement: LoadingSkeleton component
The system **SHALL** implementar skeleton loaders para estados de carga.

#### Scenario: StatsCards skeleton
- **GIVEN** los datos de estadísticas están cargando
- **WHEN** el dashboard se renderiza
- **THEN** muestra 4 skeletons rectangulares en lugar de stats cards

#### Scenario: DataTable skeleton
- **GIVEN** los datos de la tabla están cargando
- **WHEN** el dashboard se renderiza
- **THEN** muestra skeleton de tabla con 5-10 filas

#### Scenario: Animación de shimmer
- **GIVEN** los skeletons se muestran
- **WHEN** el usuario los ve
- **THEN** tienen animación de shimmer (brillo que se mueve)

### Requirement: ErrorBoundary component
The system **SHALL** implementar manejo de errores para widgets del dashboard.

#### Scenario: Error en carga de estadísticas
- **GIVEN** la API de estadísticas falla
- **WHEN** el dashboard intenta cargar
- **THEN** muestra mensaje de error en la sección de stats (no rompe todo el dashboard)

#### Scenario: Error en carga de leads
- **GIVEN** la API de leads falla
- **WHEN** el dashboard intenta cargar
- **THEN** muestra mensaje de error en la sección de tabla (no rompe todo el dashboard)

#### Scenario: Reintentar carga
- **GIVEN** hubo error en carga de datos
- **WHEN** el usuario hace click en "Reintentar"
- **THEN** intenta cargar los datos nuevamente

### Requirement: Componentes TailAdmin adaptados
The system **SHALL** adaptar componentes de TailAdmin para compatibilidad con Tailwind 4.

#### Scenario: Sidebar component
- **GIVEN** el componente Sidebar de TailAdmin
- **WHEN** se integra al proyecto
- **THEN** funciona sin errores de clases Tailwind incompatibles

#### Scenario: Header component
- **GIVEN** el componente Header de TailAdmin
- **WHEN** se integra al proyecto
- **THEN** funciona sin errores de clases Tailwind incompatibles

#### Scenario: Theme toggle
- **GIVEN** el componente de cambio de tema de TailAdmin
- **WHEN** se usa en el dashboard
- **THEN** cambia entre modo claro y oscuro correctamente

### Requirement: Reutilización de componentes
The system **SHALL** diseñar componentes para ser reutilizables en futuras vistas administrativas.

#### Scenario: StatsCard reusable
- **GIVEN** el componente StatsCard existe
- **WHEN** se crea una nueva vista administrativa
- **THEN** puede importarse y usarse con diferentes datos

#### Scenario: DataTable reusable
- **GIVEN** el componente DataTable existe
- **WHEN** se crea una nueva vista de lista
- **THEN** puede importarse y configurarse con diferentes columnas

### Requirement: Tests de componentes
The system **SHALL** incluir tests unitarios para componentes del dashboard.

#### Scenario: Test de StatsCard
- **GIVEN** el componente StatsCard existe
- **WHEN** se ejecutan tests Vitest
- **THEN** existe test que valida renderizado con diferentes props

#### Scenario: Test de DataTable
- **GIVEN** el componente DataTable existe
- **WHEN** se ejecutan tests Vitest
- **THEN** existe test que valida renderizado de filas y columnas

#### Scenario: Test de LoadingSkeleton
- **GIVEN** el componente LoadingSkeleton existe
- **WHEN** se ejecutan tests Vitest
- **THEN** existe test que valida animación y estructura