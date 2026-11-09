## Context

El login de `apps/admin` (`/login`) usa `AdminLayout.astro` como layout, pero este no importa `apps/admin/src/styles/global.css`. Ese archivo contiene `@import "tailwindcss"` y todos los tokens CSS custom properties (`--color-primary`, `--color-surface`, `--color-border`, etc.) que las clases de Tailwind en `TailAdminLogin.tsx` referencia. Sin el import, los estilos no se aplican y el diseño se ve "roto".

Además, `TailAdminLogin.tsx` línea 206 tiene `<form onsubmit="return false;" ...>`. React rechaza `onsubmit` (minúsculas, HTML nativo) porque los eventos de React usan camelCase (`onSubmit`). El atributo es redundante: `onSubmit={handleSubmit}` ya ejecuta `e.preventDefault()`.

## Goals / Non-Goals

**Goals:**
- Que `/login` cargue los estilos de Tailwind y los tokens CSS del proyecto.
- Eliminar el warning de React `Invalid event handler property 'onsubmit'`.
- No cambiar el flujo de autenticación ni el comportamiento del formulario.

**Non-Goals:**
- Rediseñar el login.
- Modificar la API ni el sitio público.
- Agregar dependencias nuevas.

## Decisions

### Importar global.css en AdminLayout.astro
**Decisión:** Agregar `import '../styles/global.css'` en el frontmatter de `AdminLayout.astro`.
**Razón:** `AdminLayout` es usado por todas las páginas del admin (incluido `/login`). Importar el CSS aquí asegura que los estilos y tokens estén disponibles en todo el panel.
**Alternativa:** Importar `global.css` solo en `pages/login/index.astro`. **Rechazada:** dejaría sin estilos a otras páginas que también usan `AdminLayout`.

### Eliminar `onsubmit="return false;"`
**Decisión:** Borrar el atributo `onsubmit="return false;"` del `<form>` en `TailAdminLogin.tsx`.
**Razón:** `onSubmit={handleSubmit}` ya llama a `e.preventDefault()`. El atributo nativo `onsubmit` causa el warning de React y es innecesario.

## Risks / Trade-offs

- [Risk] Agregar `global.css` al layout podría duplicar estilos si otras páginas ya lo importan. → Mitigación: verificar que ninguna otra página/layout importe `global.css` antes del cambio.
- [Risk] Eliminar `onsubmit="return false;"` podría permitir el submit nativo del form si `handleSubmit` falla. → Mitigación: `handleSubmit` siempre llama a `e.preventDefault()` al inicio.

## Migration Plan

1. Agregar import de `global.css` en `AdminLayout.astro`.
2. Eliminar `onsubmit="return false;"` en `TailAdminLogin.tsx`.
3. Ejecutar `pnpm build` de `apps/admin` y verificar SSR.
4. Ejecutar suite de tests Vitest.

## Open Questions

Ninguna.
