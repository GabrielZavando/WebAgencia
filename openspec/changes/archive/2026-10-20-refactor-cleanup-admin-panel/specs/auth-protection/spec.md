# Spec Delta

## REMOVED Requirements

### Requirement: Validación de sesión en cliente
**Reason**: No hay contenido administrativo protegido; `/admin` es un placeholder público.
**Migration**: Recrear la validación de sesión antes de exponer datos administrativos reales.

### Requirement: Redirección post-login exitoso
**Reason**: La redirección post-login queda cubierta por `client-portal-auth`, que ahora apunta a `/admin`.
**Migration**: Usar el requisito de `client-portal-auth` para el flujo de login.

### Requirement: Protección de rutas /admin/*
**Reason**: La única ruta administrativa es un placeholder público sin datos ni acciones.
**Migration**: Reintroducir la protección de `/admin/*` en el cambio que implemente el CRUD.

### Requirement: Invalidación de sesión en logout
**Reason**: El header con logout se elimina junto con el dashboard.
**Migration**: Recrear el logout en la UI administrativa futura; el endpoint backend sigue documentado en `docs/api-spec.yml`.

### Requirement: Persistencia de tema entre sitio público y admin
**Reason**: El theming administrativo vivía en el header eliminado.
**Migration**: Reutilizar el theming global del sitio cuando se recree la UI administrativa.

### Requirement: Manejo de estados de carga
**Reason**: Los loading states pertenecían a la verificación de sesión del dashboard eliminado.
**Migration**: Añadir loading states en las futuras vistas administrativas.

### Requirement: Middleware de protección (implementación estática)
**Reason**: No se requiere protección de rutas para un placeholder público.
**Migration**: Implementar la protección en cliente o en el hosting cuando exista el CRUD.

### Requirement: Actualización de spec client-portal-auth
**Reason**: Era una instrucción de sincronización de un cambio anterior, no un comportamiento del sistema.
**Migration**: La redirección a `/admin` queda definida directamente en `client-portal-auth`.
