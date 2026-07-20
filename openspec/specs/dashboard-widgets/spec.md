# Capability: dashboard-widgets

## Purpose

Componentes reutilizables del dashboard administrativo, implementados con **Tailwind utility-first** y tokens del sistema de diseño. Incluye stats cards, tablas de datos, skeleton loaders y elementos UI que pueden extenderse para futuras funcionalidades administrativas.

## Requirements

### Requirement: StatsCard component
The system **SHALL** implementar componente reutilizable para tarjetas de estadísticas usando **Tailwind utility-first** con tokens del sistema.

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
- **THEN** muestra indicador visual (`text-success` para positivo, `text-error` para negativo)

#### Scenario: StatsCard con ícono
- **GIVEN** el componente StatsCard recibe un ícono Heroicon
- **WHEN** se renderiza
- **THEN** muestra el ícono con `bg-primary/10 text-primary`

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

### Requirement: RecentLeadsTable component
The system **SHALL** implementar tabla específica para leads recientes con **Tailwind utility-first**.

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

### Requirement: Componentes con tokens del sistema
The system **SHALL** usar tokens del sistema de diseño (`--color-primary`, `--color-secondary`, etc.) en todos los componentes admin. **SHALL NOT** usar colores genéricos de Tailwind sin mapear a tokens.

#### Scenario: Uso de tokens en componentes
- **GIVEN** se inspecciona cualquier componente admin
- **WHEN** se revisan las clases CSS
- **THEN** usa tokens como `bg-primary`, `text-primary`, `text-success`, `text-error` (no `bg-pink-500`, `text-green-500`)

### Requirement: Reutilización de componentes
The system **SHALL** diseñar componentes para ser reutilizables en futuras vistas administrativas.

#### Scenario: StatsCard reusable
- **GIVEN** el componente StatsCard existe
- **WHEN** se crea una nueva vista administrativa
- **THEN** puede importarse y usarse con diferentes datos

#### Scenario: RecentLeadsTable extensible
- **GIVEN** el componente RecentLeadsTable existe
- **WHEN** se crea una nueva vista de lista
- **THEN** puede refactorizarse para mostrar diferentes tipos de datos

### Requirement: Tests de componentes
The system **SHALL** incluir tests unitarios para componentes del dashboard.

#### Scenario: Test de StatsCard
- **GIVEN** el componente StatsCard existe
- **WHEN** se ejecutan tests Vitest
- **THEN** existe test que valida renderizado con diferentes props

#### Scenario: Test de RecentLeadsTable
- **GIVEN** el componente RecentLeadsTable existe
- **WHEN** se ejecutan tests Vitest
- **THEN** existe test que valida renderizado de filas y columnas

#### Scenario: Test de LoadingSkeleton
- **GIVEN** el componente LoadingSkeleton existe
- **WHEN** se ejecutan tests Vitest
- **THEN** existe test que valida animación y estructura
