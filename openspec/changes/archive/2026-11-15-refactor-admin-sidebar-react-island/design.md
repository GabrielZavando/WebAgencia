## Context

En `apps/admin`, el shell de administración (`/admin`) consta de `Sidebar.astro`, `Header.astro` y `AdminLayout.astro`. El estado de apertura/cierre del sidebar se gestiona con un script vanilla (`initAdminShell`) incrustado en `AdminLayout.astro`, que lee/escribe clases CSS del DOM (`-translate-x-full`, `translate-x-0`, `hidden`) para el sidebar y el backdrop.

Problema observado:
1. El botón de alternancia (`#admin-menu-toggle` en `Header.astro`) no minimiza el sidebar de forma fiable.
2. El backdrop (`#admin-sidebar-backdrop`) aparece en desktop, opacando y bloqueando el contenido principal, porque la clase condicional en `AdminLayout.astro` (línea 77) no añade `lg:hidden`: `${!hideSidebar && 'lg:hidden' ? '' : 'hidden'}` evalúa a string vacío cuando `hideSidebar` es `false`, dejando el overlay visible por defecto.

Decisiones de diseño tomadas (usuario):
- Breakpoint: `lg` de Tailwind (1024px). Menos de 1024px = móvil/tablet con overlay.
- Desktop (`lg`+): sidebar fijo y siempre visible. Sin backdrop, sin botón de cierre.
- Implementación: isla React `SidebarShell.tsx` con `useState` para `isOpen`, listener `window.matchMedia('(min-width: 1024px)')`.
- No se toca `apps/api` ni `apps/web`.

## Goals / Non-Goals

**Goals:**
- Corregir que el botón de alternancia abra/cierre el sidebar en móvil.
- Eliminar el overlay/bloqueo en desktop.
- Estado explícito (`isOpen` en React) en lugar de clases implícitas del DOM.
- Mantener el diseño visual actual de TailAdmin (colores, tamaños, iconos, `lg:hidden` en el botón).
- Recibir `hideSidebar` y `hideHeader` como props para que `/login` siga pudiendo ocultarlos.
- Tests unitarios Vitest + React Testing Library para `SidebarShell`.

**Non-Goals:**
- No cambiar la estructura de rutas ni agregar llamadas a API.
- No modificar el backend (`apps/api`).
- No tocar el sitio público (`apps/web`).
- No agregar estado global (Zustand/Redux).
- No cambiar los breakpoints de otros componentes del sitio.

## Decisions

### 1. Isla React `SidebarShell.tsx` (client:load) en lugar de script vanilla

**Rationale:** El estado en clases del DOM es frágil y difícil de probar. Una isla React con `useState` da un single source of truth, sincroniza `aria-expanded` de forma declarativa y permite tests unitarios. `client:load` es apropiado porque el toggle debe funcionar inmediatamente tras la hidratación.

**Alternativas consideradas:**
- **Opción A (solo CSS/Tailwind):** corregir la clase condicional del backdrop. Mínimo cambio, pero el estado sigue implícito en el DOM y no es fácil de probar. Descartada por falta de testabilidad.
- **Opción C (script vanilla + render condicional del backdrop):** mantiene la arquitectura actual pero sigue con estado frágil. Descartada.

### 2. Breakpoint `lg` (1024px) para distinguir desktop de móvil

**Rationale:** `Sidebar.astro` y `Header.astro` ya usan `lg` (`lg:translate-x-0`, `lg:hidden`). Mantener `lg` asegura consistencia con el código existente. En desktop, el sidebar tiene `lg:translate-x-0` (siempre visible) y el botón tiene `lg:hidden`.

**Alternativa:** usar un breakpoint custom (p. ej. 820px de `global.css`). Descartada por inconsistencia con Tailwind estándar usado en el sidebar/header.

### 3. Backdrop renderizado condicionalmente solo cuando `isOpen && !isDesktop`

**Rationale:** En desktop el backdrop no existe en el DOM, por lo que es imposible que bloquee el contenido. En móvil solo aparece cuando el sidebar está abierto.

### 4. `AdminLayout.astro` integra `<SidebarShell client:load>`, pasando `hideSidebar`/`hideHeader`

**Rationale:** Mantiene el layout como propietario de la composición; la isla recibe las props y decide qué renderizar.

## Risks / Trade-offs

| Riesgo / Trade-off | Mitigación |
|---|---|
| Añade hidratación cliente (`client:load`) en páginas que antes eran estáticas | El impacto es mínimo (una sola isla pequeña). El resto del layout sigue siendo `.astro` estático. |
| Dos fuentes de verdad transientemente (clases del DOM + estado React) durante la migración | El script vanilla se elimina por completo; la isla es la única fuente de verdad. |
| `window.matchMedia` no disponible en SSR/prerender | Usar `typeof window !== 'undefined'` o inicializar `isDesktop = false` y corregir en `useEffect` tras hidratación. |
| `astro:page-load` puede reiniciar estado si la isla no persiste | `client:load` hidrata una vez; el estado vive en el componente React, no en el DOM. |

## Migration Plan

1. Crear `SidebarShell.tsx` con `useState<boolean>` para `isOpen` y `matchMedia` para `isDesktop`.
2. Integrar en `AdminLayout.astro` sustituyendo el `<Sidebar />` estático y el `<div id="admin-sidebar-backdrop">` por `<SidebarShell client:load>`.
3. Eliminar el `<script> initAdminShell() </script>` de `AdminLayout.astro`.
4. Añadir tests Vitest + RTL para `SidebarShell`.
5. Ejecutar `pnpm test` en `apps/admin` y verificar que la suite de validación estructural permanece en verde.

## Open Questions

(Ninguna por ahora. El alcance, breakpoint y arquitectura están definidos.)
