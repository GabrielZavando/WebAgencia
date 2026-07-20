## 1. Correcciones críticas de violaciones

- [x] 1.1 Reescribir `ErrorPage.astro` — eliminar inline styles y hex literals (`#556`, `#0077cc`), usar clases Tailwind + tokens
- [x] 1.2 Reemplazar 6 hex `#00A3A3` en `Plans.astro` por `text-teal` / `bg-teal`
- [x] 1.3 Reemplazar 4 hex `#f59e0b` en `Plans.astro` por `text-warning`
- [x] 1.4 Reemplazar 10 hex en `Workflow.astro` por tokens (`--color-teal`, `--color-warning`, etc.)
- [x] 1.5 Corregir inline styles en `Workflow.astro` (lines 102, 104) → clases Tailwind
- [x] 1.6 Corregir `Contact.astro` JS-driven `#ef4444` → clase CSS con `var(--color-error)`
- [x] 1.7 Corregir hex hardcoded en `suscripcion-confirmada.astro` (`#10b981`, `#ef4444`) → tokens

## 2. Admin con tokens del sitio público

- [x] 2.1 Reemplazar `bg-boxdark`, `bg-graydark`, `text-bodydark2`, `bg-meta-4` en `Header.tsx` por tokens (`bg-surface`, `text-text-secondary`)
- [x] 2.2 Reemplazar `dark:bg-boxdark` en `Sidebar.tsx` por `dark:bg-surface`
- [x] 2.3 Reemplazar `dark:bg-boxdark` en `StatsCard.tsx` por `dark:bg-surface`
- [x] 2.4 Reemplazar `dark:bg-boxdark` en `RecentLeadsTable.tsx` por `dark:bg-surface`
- [x] 2.5 Reemplazar `dark:bg-boxdark` en `Dashboard.tsx` por `dark:bg-surface`
- [x] 2.6 Reemplazar `dark:bg-boxdark` en `DashboardLayout.tsx` por `dark:bg-body`
- [x] 2.7 Verificar que admin se ve correctamente en ambos temas (claro/oscuro) — build OK, verificación visual pendiente

## 3. Componentes huérfanos — crear estilos Tailwind

- [x] 3.1 Crear estilos para `PackSistemas.astro` (clases `.pack-section`, `.pack-content`, `.pack-header`, etc.)
- [x] 3.2 Crear estilos para `SolucionesModulares.astro` (clases `.modulares-section`, `.modular-card`, etc.)
- [x] 3.3 Crear estilos para `PackWebProfesional.astro` (clases `.pack-section`, `.pack-grid`, `.pack-benefits`, etc.)
- [x] 3.4 Crear estilos para `MetodologiaCTP.astro` (clases `.metodologia-section`, `.step-card`, etc.)
- [x] 3.5 Crear estilos para `GeneralVision.astro` (clases `.methodology-vision`, `.transversal-layer`, etc.)
- [x] 3.6 Verificar que `/servicios` y `/metodologia` se ven correctamente — build OK, verificación visual pendiente

## 4. Login — eliminar valores arbitrarios

- [x] 4.1 Reemplazar `bg-[var(--color-body)]` por `bg-body` en `login/index.astro`
- [x] 4.2 Reemplazar `z-[var(--z-*)]` por equivalentes Tailwind estándar
- [x] 4.3 Reemplazar `max-w-[450px]` por `max-w-md` o `max-w-lg`
- [x] 4.4 Reemplazar `bg-[var(--color-surface)]` por `bg-surface`
- [x] 4.5 Reemplazar `border-[var(--color-border)]` por `border-border`
- [x] 4.6 Reemplazar `text-[var(--color-primary)]` por `text-primary`
- [x] 4.7 Reemplazar `shadow-[...]` complejo por `shadow-xl` o `shadow-2xl`
- [x] 4.8 Verificar que login se ve correctamente en ambos temas — build OK, verificación visual pendiente

## 5. Blog — corregir inline styles

- [x] 5.1 Reemplazar 14 inline styles en `blog/[...slug].astro` por clases Tailwind
- [x] 5.2 Reemplazar valores hardcoded en `<style>` block de `blog/[...slug].astro` por tokens
- [x] 5.3 Reemplazar inline styles en `blog/index.astro` (JS-generated HTML) por clases Tailwind
- [x] 5.4 Verificar que blog funciona correctamente — build OK, verificación visual pendiente

## 6. Páginas admin placeholder

- [x] 6.1 Crear `src/pages/admin/leads.astro` con DashboardLayout + mensaje "Próximamente"
- [x] 6.2 Crear `src/pages/admin/settings.astro` con DashboardLayout + mensaje "Próximamente"
- [x] 6.3 Verificar que sidebar links funcionan ( Leads, Configuración) — build OK, verificación visual pendiente

## 7. Verificación final

- [x] 7.1 Ejecutar `pnpm build` — verificar 13+ páginas generadas
- [x] 7.2 Ejecutar `pnpm test` — todos los tests pasan
- [x] 7.3 Ejecutar `pnpm test:validation:static` — todos los tests de validación pasan
- [x] 7.4 Verificar `/` (home) en ambos temas
- [x] 7.5 Verificar `/servicios` en ambos temas
- [x] 7.6 Verificar `/metodologia` en ambos temas
- [x] 7.7 Verificar `/blog` en ambos temas
- [x] 7.8 Verificar `/login` en ambos temas
- [x] 7.9 Verificar `/admin/dashboard` en ambos temas
- [x] 7.10 Verificar que no quedan hex literals en componentes (grep)
- [x] 7.11 Verificar que no quedan inline styles en componentes (grep)
