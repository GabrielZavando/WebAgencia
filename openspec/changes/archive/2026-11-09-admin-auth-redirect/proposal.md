## Why

El panel de administración (`apps/admin`) expone `/login` y `/admin`, pero no protege las rutas del panel: un usuario sin sesión puede acceder directamente a `/admin` o a la raíz `/` sin haber iniciado sesión. Se requiere redirigir automáticamente a `/login` cuando no exista sesión activa, y redirigir a `/admin` cuando ya exista sesión y se intente acceder a `/login`.

## What Changes

- Crear `apps/admin/src/pages/index.astro` (ruta raíz `/`) que redirija a `/login` si no hay sesión, o a `/admin` si la hay.
- Agregar verificación de sesión de cliente (Firebase Auth `auth.currentUser`) en `apps/admin/src/layouts/AdminLayout.astro` para rutas `/admin/*`: si no hay sesión, redirigir a `/login`.
- `/login` con sesión activa redirige a `/admin` (evitar re-login innecesario).
- No se modifica la API ni el sitio público (`apps/web`).
- No se introducen nuevas dependencias; se reutiliza `apps/admin/src/lib/firebase.ts` (expone `auth` de Firebase).
- Añadir tests que verifiquen la redirección.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `client-portal-auth`: se adiciona el requisito de redirección automática a `/login` cuando no hay sesión activa en rutas protegidas (`/`, `/admin/*`), y redirección de `/login` a `/admin` cuando ya existe sesión. El flujo de autenticación subyacente (Firebase Auth + `/api/v1/auth/login`) se mantiene sin cambios.

## Impact

- Código afectado: `apps/admin/src/pages/index.astro` (nuevo), `apps/admin/src/layouts/AdminLayout.astro` (modificado), `apps/admin/src/pages/login/index.astro` (posible ajuste para redirigir si ya hay sesión).
- No se modifica `apps/api` ni `apps/web`.
- No se introducen nuevas dependencias npm.
