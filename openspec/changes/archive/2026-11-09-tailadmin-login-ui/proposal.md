## Why

El formulario de login del panel de administración (`apps/admin/src/pages/login`) usa un componente `LoginForm.tsx` construido a mano con estilos legacy (BEM en `global.css`, clases `login-*`, `form-*`) que no siguen el estándar Tailwind utility-first del proyecto. Además, no existe un usuario administrador creado en Firebase Auth, por lo que no se puede acceder al panel en desarrollo. Este cambio reemplaza el formulario visual por la isla de login de TailAdmin (React), añade un script de seed para crear el primer usuario admin y elimina los componentes y estilos del login anterior que ya no se usen.

## What Changes

- Crear `apps/api/scripts/create-admin-user.ts` que use Firebase Admin SDK (`getAuth().createUser`) para crear el primer usuario administrador a partir de variables de entorno o argumentos. No se expone endpoint público de creación de usuarios.
- Reemplazar en `apps/admin/src/pages/login/index.astro` el formulario actual por una isla React que renderice el componente de login de TailAdmin (versión React), manteniendo la llamada a `signInWithEmailAndPassword` y la redirección a `/admin` tras éxito.
- Mantener el manejo de errores (credenciales inválidas, usuario no encontrado, rate limit, error de red) con mensajes claros y genéricos.
- Eliminar componentes y estilos del login anterior que ya no se usen.
- Asegurar que `apps/admin` sigue compilando en SSR (`output: 'server'`).
- Añadir tests del nuevo formulario de login (render, submit válido/inválido, redirección) y un test opcional para el script de seed.
- Actualizar la capability `client-portal-auth` con los nuevos requisitos de UI de login (base visual TailAdmin).

## Capabilities

### New Capabilities

Ninguna. El cambio no introduce una capacidad nueva; solo modifica la UI de una existente.

### Modified Capabilities

- `client-portal-auth`: el requisito de UI de login cambia de un formulario custom (`LoginForm.tsx` con estilos legacy) a la isla de login de TailAdmin (React). El flujo de autenticación (Firebase Auth + API `/auth/login`, redirección a `/admin`, cookie httpOnly, sin localStorage, sin registro, sin recuperación) se mantiene sin cambios.

## Impact

- Código afectado: `apps/admin/src/pages/login/index.astro`, `apps/admin/src/components/auth/LoginForm.tsx` (y estilos legacy asociados), nuevo `apps/api/scripts/create-admin-user.ts`.
- Dependencias: se añade la isla de login de TailAdmin (React) como dependencia visual del login; no se añaden dependencias de auth nuevas (no Firebase, no NextAuth, no Auth.js en el frontend).
- Especificaciones: se actualiza `openspec/specs/client-portal-auth/spec.md` mediante delta spec en este change.
- No se modifica `apps/web` (sitio público). No se modifica la lógica de autenticación de la API (`AuthGuard`, `AuthService`).
