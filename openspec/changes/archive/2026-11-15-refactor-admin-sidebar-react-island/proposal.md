## Why

En `apps/admin`, el botón de alternancia del sidebar no responde de forma fiable y una capa oscura (overlay/backdrop) queda visible y bloqueante en pantallas de escritorio, opacando el contenido principal. El estado de apertura/cierre se gestiona con un script vanilla incrustado en `AdminLayout.astro`, y la clase condicional del backdrop (`!hideSidebar && 'lg:hidden' ? '' : 'hidden'`) no añade `lg:hidden`, dejando el overlay activo incluso en desktop.

## What Changes

- Crear la isla React `SidebarShell.tsx` en `apps/admin/src/components/admin/` que gestione explícitamente el estado `isOpen` del sidebar con `useState` y detecte el breakpoint `lg` (1024px) mediante `window.matchMedia('(min-width: 1024px)')`.
- Refactorizar `AdminLayout.astro`: eliminar el script vanilla `initAdminShell()` e integrar `<SidebarShell client:load>`, pasando `hideSidebar` y `hideHeader` como props.
- Añadir tests unitarios (Vitest + React Testing Library) para `SidebarShell`: comportamiento móvil (inicia cerrado, se abre con clic, se cierra con backdrop) y comportamiento escritorio (visible por defecto, sin backdrop).
- Corregir la clase condicional del backdrop para que no bloquee el contenido en desktop.

## Capabilities

### New Capabilities

(Ninguna. Este cambio corrige una implementación existente, no introduce nuevas capacidades de negocio.)

### Modified Capabilities

(Ninguna. El alcance de `cms-admin-panel` ya cubre el shell `/admin` (sidebar + header + área de contenido). Este cambio no modifica requisitos de negocio, solo corrige la interacción y el renderizado del overlay en desktop.)

## Impact

- `apps/admin/src/layouts/AdminLayout.astro` — se elimina el script vanilla y se integra la isla React.
- `apps/admin/src/components/admin/Sidebar.astro` — se mantiene como markup estático; su visibilidad la controla la isla.
- `apps/admin/src/components/admin/Header.astro` — el botón toggle seguirá aquí; `aria-expanded` se sincroniza desde la isla.
- `apps/admin/src/components/ui/button.tsx` — sin cambios (shadcn/ui existente).
- Solo `apps/admin` se ve afectado. No se toca `apps/api` ni `apps/web`.
