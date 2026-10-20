# Proposal

## Why

El panel administrativo actual es una demo desconectada del backend real: consume endpoints inexistentes (`/api/v1/stats/summary` y `/api/v1/leads/recent`), muestra datos de ejemplo y mantiene componentes, rutas y documentación que ya no representan el producto. Antes de construir un CRUD real, conviene eliminar esa superficie muerta para reducir mantenimiento, evitar falsas expectativas y dejar un único punto de entrada `/admin`.

## What Changes

- **BREAKING** Eliminar las rutas legacy `/admin/dashboard`, `/admin/leads` y `/admin/settings`.
- Eliminar todo `apps/web/src/components/admin/` (`Dashboard`, `DashboardLayout`, `Header`, `RecentLeadsTable`, `Sidebar`, `StatsCard` y su test).
- Crear `/admin` como página estática placeholder, sin isla React, sin llamadas a API y sin autenticación.
- Cambiar la redirección post-login de `/admin/dashboard` a `/admin`.
- Retirar las capabilities `dashboard-widgets` y `auth-protection`; se recrearán cuando exista CRUD real y protección de rutas.
- Actualizar `admin-dashboard` para describir solo el placeholder `/admin`.
- Actualizar `client-portal-auth` para redirigir a `/admin` y eliminar requisitos exclusivos del dashboard.
- Actualizar `tailwind-bem-migration` para exigir solo el placeholder `/admin`, no `/admin/leads` ni `/admin/settings`.
- Actualizar documentación de diseño y changelog para reflejar la eliminación.
- Mantener `useAuth.ts` y `@heroicons/react` como piezas para el futuro CRUD.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `admin-dashboard`: se eliminan los requisitos del dashboard legacy y se añade el placeholder `/admin`.
- `client-portal-auth`: la redirección exitosa apunta a `/admin`; se eliminan los requisitos de sesión y logout del dashboard.
- `tailwind-bem-migration`: el placeholder administrativo requerido es solo `/admin`; se eliminan `/admin/leads` y `/admin/settings`.
- `dashboard-widgets`: se retira la capability completa (todos sus requisitos se eliminan).
- `auth-protection`: se retira la capability completa (todos sus requisitos se eliminan).

## Impact

- Frontend: `apps/web/src/pages/admin/*`, `apps/web/src/components/admin/*`, `apps/web/src/components/auth/LoginForm.tsx`.
- Tests: validación estructural nueva, test unitario de login y expectativas E2E de redirección.
- Documentación: `docs/design/LOCAL_DEV.md`, `docs/design/design-components.md`, `docs/design/DESIGN.md`, `docs/design/ai-design-guidance.md`, `CHANGELOG.md`.
- OpenSpec: `openspec/specs/admin-dashboard`, `client-portal-auth`, `tailwind-bem-migration`, `dashboard-widgets`, `auth-protection`.
- Sin cambios en API, `docs/api-spec.yml`, `docs/data-model.md`, `leads`, `supabase`, autenticación backend ni sitio público.
