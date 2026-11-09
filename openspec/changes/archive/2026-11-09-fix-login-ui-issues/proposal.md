## Why

El login de `apps/admin` presenta dos problemas: (1) el CSS no carga correctamente porque `AdminLayout.astro` no importa `global.css`, por lo que los tokens de diseño y utilidades de Tailwind no se aplican en `/login`; (2) un warning de React por el atributo `onsubmit="return false;"` en el `<form>` de `TailAdminLogin.tsx`, que React no reconoce como evento válido (usa camelCase `onSubmit`).

## What Changes

- Agregar `import '../styles/global.css'` en `apps/admin/src/layouts/AdminLayout.astro` para que los estilos de Tailwind y los tokens CSS estén disponibles en todas las páginas del admin, incluido `/login`.
- Eliminar el atributo `onsubmit="return false;"` del `<form>` en `apps/admin/src/components/auth/TailAdminLogin.tsx` (línea 206). El evento `onSubmit={handleSubmit}` ya llama a `e.preventDefault()`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `client-portal-auth`: no hay cambios en requisitos de comportamiento; solo correcciones de implementación (CSS y warning de React).

## Impact

- Código afectado: `apps/admin/src/layouts/AdminLayout.astro`, `apps/admin/src/components/auth/TailAdminLogin.tsx`.
- No se modifica `apps/api` ni `apps/web`.
- No se introducen nuevas dependencias.
