## Why

El logo en la página de Login (`/login`) no es clickeable. Los usuarios esperan poder hacer clic en el logo de una página para volver al inicio, lo cual es un patrón de navegación estándar. Esto mejora la experiencia de usuario al ofrecer una ruta de retorno rápida desde el login.

## What Changes

- El logo en la esquina superior izquierda de la página `/login` se envuelve en un enlace (`<a>`) que redirige a la página de Inicio (`/`).
- Se añade `aria-label` para accesibilidad.

## Capabilities

### New Capabilities

- `login-logo-navigation`: El logo en la página de login funciona como enlace a la página principal.

### Modified Capabilities

<!-- No hay cambios en capabilities existentes -->

## Impact

- **Archivos modificados:** `src/pages/login/index.astro`
- **Dependencias:** Ninguna nueva
- **APIs:** Ninguna
- **Breaking changes:** Ninguno
