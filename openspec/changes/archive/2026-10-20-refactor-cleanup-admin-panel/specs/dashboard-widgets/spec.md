# Spec Delta

## REMOVED Requirements

### Requirement: StatsCard component
**Reason**: El componente se elimina junto con el dashboard legacy.
**Migration**: Recrear las tarjetas cuando exista un dashboard con métricas reales.

### Requirement: StatsCards container
**Reason**: El contenedor dependía de StatsCard y del dashboard eliminado.
**Migration**: Recrear el grid en la futura vista de métricas.

### Requirement: RecentLeadsTable component
**Reason**: La tabla consumía un endpoint de leads recientes que no existe.
**Migration**: Reimplementarla cuando exista el endpoint y la vista de leads real.

### Requirement: LoadingSkeleton component
**Reason**: Los skeletons solo se usaban en los widgets del dashboard eliminado.
**Migration**: Añadir loading states en las nuevas vistas administrativas.

### Requirement: ErrorBoundary component
**Reason**: El manejo de errores estaba acoplado a los widgets eliminados.
**Migration**: Reintroducir manejo de errores en los futuros widgets.

### Requirement: Componentes con tokens del sistema
**Reason**: La regla se aplicaba a componentes admin que ya no existen.
**Migration**: Mantener el uso de tokens del sistema en cualquier componente administrativo futuro.

### Requirement: Reutilización de componentes
**Reason**: No quedan componentes de dashboard que reutilizar.
**Migration**: Diseñar nuevos componentes reutilizables cuando se implemente el CRUD.

### Requirement: Tests de componentes
**Reason**: Los tests correspondían a componentes eliminados.
**Migration**: Añadir tests junto con los nuevos componentes administrativos.
