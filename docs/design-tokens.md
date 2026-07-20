# Design Tokens — WebAgenciaAstro

> Especificación canónica de todos los tokens visuales. Fuente de verdad para colores, tipografía, espaciado, sombras, z-index y transiciones.

## Regla de uso

**Nunca usar valores literales** (hex, px, rem) en componentes. Siempre usar variables CSS:

```astro
<!-- MAL -->
<div style="color: #FF0080; font-size: 1.25rem;">Texto</div>

<!-- BIEN -->
<div class="text-primary text-md">Texto</div>
```

## Paleta base

| Token | Hex | RGB | Uso |
|---|---|---|---|
| `--color-primary` | `#FF0080` | `255, 0, 128` | CTA principal, enlaces, énfasis |
| `--color-secondary` | `#A600FF` | `166, 0, 255` | Acentos, hover, elementos secundarios |
| `--color-accent` | `#00FFE0` | `0, 255, 224` | Highlights, gradientes, overlays |
| `--color-dark` | `#1D0033` | `29, 0, 51` | Fondos de banner, footer, overlays |
| `--color-white` | `#FEFFFE` | `254, 255, 254` | Texto sobre fondos oscuros |
| `--color-neutral` | `#2F2F2F` | `47, 47, 47` | Elementos neutros, bordes oscuros |
| `--color-teal` | `#00A3A3` | `0, 163, 163` | Badges, acentos decorativos, switches |

### RGB tripletas (para transparencias)

| Token | RGB |
|---|---|
| `--color-primary-rgb` | `255, 0, 128` |
| `--color-secondary-rgb` | `166, 0, 255` |
| `--color-accent-rgb` | `0, 255, 224` |
| `--color-dark-rgb` | `29, 0, 51` |
| `--color-surface-rgb` | `31, 41, 55` |
| `--color-surface-secondary-rgb` | `55, 65, 81` |
| `--color-white-rgb` | `254, 255, 254` |
| `--color-black-rgb` | `0, 0, 0` |
| `--color-teal-rgb` | `0, 163, 163` |

## Paleta semántica

| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#10b981` | Éxito, validación, estados positivos |
| `--color-error` | `#ef4444` | Errores, validación fallida, alertas críticas |
| `--color-warning` | `#f59e0b` | Advertencias, estados de precaución |
| `--color-info` | `#A600FF` | Información, estados neutros (violeta primario) |

### Semántica en RGB (para transparencias)

| Token | RGB |
|---|---|
| `--color-success-rgb` | `16, 185, 129` |
| `--color-error-rgb` | `239, 68, 68` |
| `--color-warning-rgb` | `245, 158, 11` |

## Tokens de superficie (por tema)

### Tema claro (`:root[data-theme="light"]`)

| Token | Hex | Uso |
|---|---|---|
| `--color-body` | `#f9fafb` | Fondo general del body |
| `--color-surface` | `#ffffff` | Tarjetas, contenedores principales |
| `--color-surface-secondary` | `#f3f4f6` | Fondos alternativos, secciones |
| `--color-text` | `#1F2937` | Texto principal |
| `--color-text-secondary` | `#6b7280` | Texto secundario, descripciones |
| `--color-text-muted` | `#9ca3af` | Texto atenuado, metadata |
| `--color-input-text` | `#1F2937` | Texto en inputs |
| `--color-border` | `#e5e7eb` | Bordes principales |
| `--color-border-secondary` | `#f3f4f6` | Bordes sutiles |
| `--color-background` | `#f9fafb` | Fondo de aplicación |
| `--color-headings` | `var(--color-text)` | Títulos (hereda de texto) |

### Tema oscuro (`:root[data-theme="dark"]`)

| Token | Hex | Uso |
|---|---|---|
| `--color-body` | `#111827` | Fondo general del body |
| `--color-surface` | `#1f2937` | Tarjetas, contenedores principales |
| `--color-surface-secondary` | `#374151` | Fondos alternativos, secciones |
| `--color-text` | `#f9fafb` | Texto principal |
| `--color-text-secondary` | `#d1d5db` | Texto secundario, descripciones |
| `--color-text-muted` | `#9ca3af` | Texto atenuado, metadata |
| `--color-input-text` | `#f9fafb` | Texto en inputs |
| `--color-border` | `#374151` | Bordes principales |
| `--color-border-secondary` | `#4b5563` | Bordes sutiles |
| `--color-background` | `#111827` | Fondo de aplicación |
| `--color-headings` | `var(--color-white)` | Títulos (blanco puro) |

## Tokens de botón

### Tema claro

| Token | Hex | Estado |
|---|---|---|
| `--btn-primary-bg` | `#FF0080` | Fondo primario |
| `--btn-primary-text` | `#FFFFFF` | Texto primario |
| `--btn-primary-hover` | `#E6006B` | Hover primario |
| `--btn-secondary-bg` | `transparent` | Fondo secundario |
| `--btn-secondary-text` | `#A600FF` | Texto secundario |
| `--btn-secondary-border` | `#A600FF` | Borde secundario |
| `--btn-secondary-hover` | `#F0E6FF` | Hover secundario |

### Tema oscuro (mismo que claro para consistencia)

| Token | Hex | Estado |
|---|---|---|
| `--btn-primary-bg` | `#FF0080` | Fondo primario |
| `--btn-primary-text` | `#FFFFFF` | Texto primario |
| `--btn-primary-hover` | `#E6006B` | Hover primario |
| `--btn-secondary-bg` | `transparent` | Fondo secundario |
| `--btn-secondary-text` | `#A600FF` | Texto secundario |
| `--btn-secondary-border` | `#A600FF` | Borde secundario |
| `--btn-secondary-hover` | `#F0E6FF` | Hover secundario |

## Navegación (por tema)

### Tema claro

| Token | Hex | Uso |
|---|---|---|
| `--color-nav-bg` | `#ffffff` | Fondo del header |
| `--color-nav-hamburger-default` | `#FFFFFF` | Icono hamburguesa (por defecto) |
| `--color-nav-hamburger-scrolled` | `#2F2F2F` | Icono hamburguesa (scroll) |
| `--color-nav-hamburger-active` | `#2F2F2F` | Icono hamburguesa (activo) |
| `--color-nav-link-default` | `#FFFFFF` | Enlaces del nav (por defecto) |
| `--color-nav-link-scrolled` | `#111827` | Enlaces del nav (scroll) |
| `--color-footer-link-light` | `#FFFFFF` | Enlaces del footer (claro) |

### Tema oscuro

| Token | Hex | Uso |
|---|---|---|
| `--color-nav-bg` | `#1f2937` | Fondo del header |
| `--color-nav-hamburger-default` | `#FFFFFF` | Icono hamburguesa (por defecto) |
| `--color-nav-hamburger-scrolled` | `#FFFFFF` | Icono hamburguesa (scroll) |
| `--color-nav-hamburger-active` | `#FFFFFF` | Icono hamburguesa (activo) |
| `--color-nav-link-default` | `#FFFFFF` | Enlaces del nav (por defecto) |
| `--color-nav-link-scrolled` | `#FFFFFF` | Enlaces del nav (scroll) |
| `--color-footer-link-light` | `#FFFFFF` | Enlaces del footer (claro) |

## Overlays de banner

| Token | Valor | Tema |
|---|---|---|
| `--banner-overlay-start` | `#1d0033f2` (29, 0, 51, 95%) | Claro |
| `--banner-overlay-end` | `rgba(166, 0, 255, 0.8)` | Claro |
| `--banner-overlay-start` | `rgba(0, 0, 0, 0.9)` | Oscuro |
| `--banner-overlay-end` | `rgba(10, 5, 30, 0.75)` | Oscuro |

## Tipografía

### Fuentes

| Token | Valor | Uso |
|---|---|---|
| `--font-primary` | `'Open Sans', system-ui, sans-serif` | Cuerpo, párrafos, bullets |
| `--font-headings` | `'Montserrat', system-ui, sans-serif` | H1-H6, títulos, headings |

### Escala tipográfica (fluida en 4 breakpoints)

| Token | <768px | 768-819px | 820-1199px | ≥1200px |
|---|---|---|---|---|
| `--text-xs` | `0.75rem` (12px) | `0.75rem` | `0.75rem` | `0.75rem` |
| `--text-sm` | `0.875rem` (14px) | `0.875rem` | `0.875rem` | `0.875rem` |
| `--text-base` | `1rem` (16px) | `1.05rem` | `1.0625rem` | `1.125rem` |
| `--text-md` | `1.125rem` (18px) | `1.2rem` | `1.25rem` | `1.5rem` |
| `--text-lg` | `1.25rem` (20px) | `1.4rem` | `1.5rem` | `1.75rem` |
| `--text-xl` | `1.5rem` (24px) | `1.75rem` | `2rem` | `2rem` |
| `--text-2xl` | `2rem` (32px) | `2.25rem` | `2.5rem` | `3rem` |
| `--text-3xl` | `2.5rem` (40px) | `3rem` | `3.5rem` | `4rem` |
| `--text-4xl` | `3rem` (48px) | `3rem` | `4.5rem` | `5rem` |
| `--text-5xl` | `4rem` (64px) | `4rem` | `5.5rem` | `6.5rem` |

### Mapeo a headings

| Heading | Token |
|---|---|
| H1 | `font-size: var(--text-3xl)` |
| H2 | `font-size: var(--text-2xl)` |
| H3 | `font-size: var(--text-xl)` |
| H4 | `font-size: var(--text-lg)` |
| H5 | `font-size: var(--text-md)` |
| H6 | `font-size: var(--text-base)` |

### Clases de tipo (utility)

| Clase | Token |
|---|---|
| `.title-5xl` | `font-size: var(--text-5xl)` |
| `.title-4xl` | `font-size: var(--text-4xl)` |
| `.title-3xl` | `font-size: var(--text-3xl)` |
| `.title-2xl` | `font-size: var(--text-2xl)` |
| `.title-xl` | `font-size: var(--text-xl)` |
| `.title-lg` | `font-size: var(--text-lg)` |
| `.title-md` | `font-size: var(--text-md)` |

## Espaciado

### Espaciado base

| Token | Valor | Uso |
|---|---|---|
| `--space-xs` | `0.25rem` (4px) | Micro espaciado |
| `--space-sm` | `0.5rem` (8px) | Pequeño |
| `--space-md` | `1rem` (16px) | Medio |
| `--space-lg` | `1.5rem` (24px) | Grande |
| `--space-xl` | `2rem` (32px) | Extra grande |
| `--space-2xl` | `3rem` (48px) | Dos veces grande |

### Padding de componentes

| Token | Valor | Uso |
|---|---|---|
| `--padding-btn` | `0.75rem 1.5rem` | Botón estándar |
| `--padding-btn-sm` | `0.5rem 1rem` | Botón pequeño |
| `--padding-btn-lg` | `1rem 2rem` | Botón grande |
| `--padding-card` | `1.5rem` | Tarjetas |
| `--padding-section` | `2rem` | Secciones |
| `--padding-container` | `1.5rem` | Contenedores |

## Sombras

| Token | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Sombra sutil |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | Sombra media |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | Sombra grande |
| `--shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1)` | Sombra extra grande |
| `--shadow-hover` | `0 12px 28px rgba(0, 0, 0, 0.12)` | Hover de tarjetas |

## Z-index (jerarquía)

| Token | Valor | Uso |
|---|---|---|
| `--z-behind` | `-10` | Elementos detrás del contenido |
| `--z-background` | `-5` | Fondos decorativos |
| `--z-base` | `0` | Contenido base |
| `--z-content` | `1` | Contenido principal |
| `--z-dropdown` | `100` | Dropdowns |
| `--z-sticky` | `200` | Elementos sticky |
| `--z-overlay` | `300` | Overlays genéricos |
| `--z-header` | `400` | Header |
| `--z-nav-mobile` | `450` | Menú móvil |
| `--z-nav-toggle` | `500` | Toggle de navegación |
| `--z-modal` | `600` | Modales |
| `--z-popover` | `700` | Popovers |
| `--z-tooltip` | `800` | Tooltips |

## Transiciones

| Token | Valor | Uso |
|---|---|---|
| `--transition-fast` | `0.15s` | Transiciones rápidas (hover) |
| `--transition-normal` | `0.3s` | Transiciones normales (theme switch) |
| `--transition-slow` | `0.5s` | Transiciones lentas (animaciones complejas) |

## Dimensiones específicas

| Token | Valor | Uso |
|---|---|---|
| `--logo-size` | `3rem` | Logo estándar |
| `--logo-size-full` | `4rem` | Logo completo |
| `--nav-mobile-breakpoint` | `1024px` | Breakpoint menú móvil |
| `--header-height-mobile` | `60px` | Altura header móvil |
| `--header-height-desktop` | `45px` | Altura header desktop |
| `--container-wide` | `1440px` | Ancho máximo de contenedor para blog, metodología |

## Scroll

| Token | Valor | Uso |
|---|---|---|
| `scroll-padding-top` | `60px` (<820px) | Scroll offset móvil |
| `scroll-padding-top` | `45px` (≥820px) | Scroll offset desktop |

## Breakpoints

| Breakpoint | Valor | Uso |
|---|---|---|
| `sm` | `640px` | Tailwind default |
| `md` | `768px` | Tailwind default |
| Custom | `820px` | Servicios, pipeline (usado 13 veces en global.css) |
| `lg` | `1024px` | Tailwind default, nav móvil |
| `xl` | `1280px` | Tailwind default |
| `2xl` | `1536px` | Tailwind default |

**Nota**: El breakpoint `820px` es un valor custom no estándar de Tailwind. Se usa extensivamente en componentes de servicios y pipeline. En componentes nuevos usar `lg` (1024px) de Tailwind.

## Reglas de uso

1. **Nunca escribir hex/px/rem en componentes**: siempre `var(--*)`.
2. **Tailwind utilities**: usar solo si coinciden con tokens (`bg-primary`, no `bg-[#FF0080]`).
3. **Nuevos tokens**: proponer vía `/opsx:propose` antes de añadir.
4. **Actualización**: si el código cambia, actualizar `design-tokens.md` inmediatamente.
5. **Contraste**: verificar WCAG AA (≥4.5:1 para texto normal) antes de añadir pares color/fondo.

## Referencias

- **Fuente**: `src/styles/global.css` (bloque `@theme`, `:root` y `[data-theme]`).
- **Tema claro/oscuro**: implementado via `data-theme` en `:root`. Ver `global.css` líneas 92-160.
- **Accesibilidad**: `docs/design-accessibility.md` (próxima iteración).