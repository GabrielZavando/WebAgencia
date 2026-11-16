## 1. Isla React SidebarShell.tsx

- [x] 1.1 Crear `apps/admin/src/components/admin/SidebarShell.tsx` con estado `isOpen` via `useState`
- [x] 1.2 Implementar detección de breakpoint `lg` con `window.matchMedia('(min-width: 1024px)')` (`isDesktop`)
- [x] 1.3 Renderizar en desktop: sidebar visible (`translate-x-0`), sin backdrop, botón oculto (`lg:hidden`)
- [x] 1.4 Renderizar en móvil: sidebar cerrado por defecto (`-translate-x-full`), backdrop (`bg-black/40`) solo cuando `isOpen`
- [x] 1.5 Manejar clic en botón toggle para alternar `isOpen` y sincronizar `aria-expanded`
- [x] 1.6 Manejar clic en backdrop para cerrar (`isOpen = false`)
- [x] 1.7 Recibir y respetar props `hideSidebar` y `hideHeader`

## 2. Refactorizar AdminLayout.astro

- [x] 2.1 Eliminar el script vanilla `initAdminShell()` de `AdminLayout.astro`
- [x] 2.2 Eliminar el `<div id="admin-sidebar-backdrop">` estático del layout
- [x] 2.3 Integrar `<SidebarShell client:load>` pasando `hideSidebar` y `hideHeader`
- [x] 2.4 Verificar que `Sidebar.astro` y `Header.astro` se rendericen dentro de la isla según corresponda

## 3. Tests (TDD — Vitest + React Testing Library)

- [x] 3.1 Test: entorno móvil — sidebar inicia cerrado y backdrop no está en el DOM
- [x] 3.2 Test: entorno móvil — clic en el botón abre sidebar y muestra backdrop
- [x] 3.3 Test: entorno móvil — clic en el backdrop cierra sidebar y oculta el backdrop
- [x] 3.4 Test: entorno escritorio — sidebar visible por defecto y no hay backdrop

## 4. Verificación y validación

- [x] 4.1 Ejecutar `pnpm test` en `apps/admin` y confirmar suite en verde
- [x] 4.2 Confirmar que la suite de validación estructural (`tests/validation/`) permanece en verde
- [x] 4.3 Verificar que no se modificó `apps/api` ni `apps/web`
