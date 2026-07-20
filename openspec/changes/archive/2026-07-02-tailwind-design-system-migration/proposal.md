## Why

El sitio tiene una estrategia CSS mixta e inconsistente: componentes nuevos y admin usan Tailwind utility-first, pero la mayoría de componentes legacy (landing, shared, metodología) usan BEM en un `global.css` monolítico. Esto genera:

- **Violaciones del design system**: hex literals (`#00A3A3`, `#556`), inline styles, valores arbitrarios de Tailwind sin tokens
- **Admin desalineado**: componentes admin usan clases Tailwind genéricas (`bg-boxdark`, `text-bodydark2`) que no existen en el `@theme`
- **Componentes huérfanos**: 5 componentes usan clases CSS no definidas en ningún archivo
- **Duplicación de esfuerzo**: tokens definidos en `global.css` pero no usados por componentes que hardcodedean los mismos valores

El objetivo es unificar todo el sitio bajo **Tailwind utility-first** con tokens del sistema de diseño, eliminando la necesidad de un CSS monolítico grande.

## What Changes

### Correcciones de violaciones (CRÍTICO)
- Reescribir `ErrorPage.astro` — actualmente 100% inline styles con hex fuera de paleta (`#556`, `#0077cc`)
- Reemplazar 6 hex literals de `#00A3A3` en `Plans.astro` y `Workflow.astro` → usar token `--color-teal` recién agregado
- Reemplazar 4 hex literals de `#f59e0b` → usar `var(--color-warning)` existente
- Corregir inline styles en `blog/[...slug].astro` (14 inline styles + valores hardcoded)
- Corregir `suscripcion-confirmada.astro` (hex hardcoded en `<style>`)
- Corregir `Contact.astro` JS-driven `#ef4444` → usar clase CSS con token

### Admin con tokens del sitio público
- Reemplazar clases genéricas TailAdmin (`bg-boxdark`, `bg-graydark`, `text-bodydark2`, `bg-meta-4`) en todos los componentes admin por tokens del sistema (`bg-surface`, `text-text-secondary`, etc.)
- Admin usa misma paleta que sitio público (magenta, violeta, accent)

### Componentes huérfanos
- Crear estilos Tailwind para 5 componentes sin definición CSS: `PackSistemas`, `SolucionesModulares`, `PackWebProfesional`, `MetodologiaCTP`, `GeneralVision`

### Login
- Reescribir `login/index.astro` eliminando 20+ valores arbitrarios de Tailwind (`bg-[var(--color-surface)]`, `max-w-[450px]`, etc.) — usar clases utility directas o tokens mapeados

### Páginas admin faltantes
- Crear `/admin/leads` y `/admin/settings` como placeholders con layout correcto

### Tokens
- Verificar que `--color-teal` y `--container-wide` (ya agregados en Fase 0) funcionan correctamente

## Capabilities

### New Capabilities
- `tailwind-bem-migration`: Migración de componentes legacy BEM a Tailwind utility-first. Cubre todos los componentes en `src/components/landing/`, `src/components/shared/` y `src/components/metodologia/` que usan BEM en `global.css`.

### Modified Capabilities
- `_design-system`: Agregar requirement de Tailwind utility-first como estrategia oficial, requirement de test de auditoría
- `admin-dashboard`: Cambiar de "basado en TailAdmin" a "componentes custom con tokens del sitio público"
- `dashboard-widgets`: Cambiar de "basado en TailAdmin" a "componentes custom con tokens del sistema"
- `landing-public`: Agregar requirements de compliance con design system (sin hex literals, sin inline styles)

## Impact

### Archivos modificados (~30)
- `src/components/shared/ErrorPage.astro` — reescritura completa
- `src/components/landing/Plans.astro` — hex → tokens
- `src/components/landing/Workflow.astro` — hex → tokens + inline styles
- `src/components/landing/Contact.astro` — JS hex → CSS class
- `src/components/landing/PackSistemas.astro` — crear estilos Tailwind
- `src/components/landing/SolucionesModulares.astro` — crear estilos Tailwind
- `src/components/landing/PackWebProfesional.astro` — crear estilos Tailwind
- `src/components/landing/MetodologiaCTP.astro` — crear estilos Tailwind
- `src/components/metodologia/GeneralVision.astro` — crear estilos Tailwind
- `src/components/admin/*.tsx` (6 archivos) — reemplazar clases genéricas por tokens
- `src/pages/login/index.astro` — eliminar valores arbitrarios
- `src/pages/blog/[...slug].astro` — inline styles → Tailwind
- `src/pages/suscripcion-confirmada.astro` — hex → tokens
- `src/pages/admin/leads.astro` — nuevo placeholder
- `src/pages/admin/settings.astro` — nuevo placeholder
- `src/styles/global.css` — agregar tokens faltantes, potencialmente reducir

### Dependencias
- Sin nuevas dependencias npm
- `@heroicons/react` ya instalado

### Riesgo
- **Medio**: Migración visual puede causar regressions sutiles en espaciado/colores
- **Mitigación**: Tests visuales + build verification + verificación en ambos temas (claro/oscuro)
