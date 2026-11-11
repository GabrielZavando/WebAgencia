# Delta visual — `apps/web` tras mover el reset a `@layer base`

Evidencia del gate visual de `align-auth-specs-and-web-css-layers` (tareas 2.x y 5.x).

## Método

- Build SSG de `apps/web` con `PUBLIC_API_URL` apuntando a un mock local que sirve un post publicado
  y fuerza un `500` en la petición del post (para poder capturar el estado de error del artículo).
- Viewport fijo de `1440x900`, página completa (`fullPage: true`), esperando `load` + 2.5 s.
- Antes de capturar se fuerza `.animate` en todos los `.fade-in`: en una captura de página completa el
  `IntersectionObserver` nunca dispara para las secciones bajo el fold y elas quedan con `opacity: 0`,
  lo que ocultaría del comparison el contenido real.
- Comparación píxel a píxel con `sharp` (umbral de diferencia por canal: 8/255).

## Resultado por página

| Página | Estado | Diff | Región |
|---|---|---|---|
| `/` | DIFF | 0.198 % | `x:537 y:3264 878x484` — sección Workflow |
| `/blog` | IDENTICAL | 0.000 % | — |
| `/blog/baseline-post-sample` | SIZE_DIFF | alto 1373 → 1421 px | skeleton del post |
| `/servicios` | DIFF | 0.496 % | `x:326 y:195 788x234` — bloque con `mt-8` |
| `/metodologia` | DIFF | 0.042 % | `x:527 y:4260 386x44` — CTA con `ml-1` |
| 404 | DIFF | 0.835 % | `x:459 y:180 522x204` — bloque de error |

## Delta medido sobre el DOM completo

Medición de `margin`, `padding`, `border-width`, `border-style`, `border-color`, `box-sizing` y caja
de **todos** los elementos de las 6 páginas (`before-boxes.json` vs `after-boxes.json`):
**30 elementos modificados, todos por utilidades de spacing que el markup ya declaraba**.

| Página | Elemento | Antes | Después |
|---|---|---|---|
| 404 | `div.mb-4` | `margin-bottom: 0` | `margin-bottom: 16px` |
| 404 | `a.px-6.py-3` | `padding: 0` | `padding: 12px 24px` (caja `117x24` → `165x48`) |
| `/` | `span.ml-1` | `margin-left: 0` | `margin-left: 4px` |
| `/` | `a.btn-cta` | caja `362x44` | caja `366x44` (por el `ml-1` del icono) |
| `/blog` | `div.px-4` | `padding: 0` | `padding: 0 16px` (rejilla `1440` → `1408`) |
| `/blog/[slug]` | `div.px-4` ×2 | `padding: 0` | `padding: 0 16px` |
| `/blog/[slug]` | `div.mt-8` | `margin-top: 0` | `margin-top: 32px` |
| `/blog/[slug]` | `div.mb-2` ×3 | `margin-bottom: 0` | `margin-bottom: 8px` |
| `/servicios` | `div.mt-8` | `margin-top: 0` | `margin-top: 32px` |
| `/metodologia` | `div.px-4` | `padding: 0` | `padding: 0 16px` |
| `/metodologia` | `span.ml-1` | `margin-left: 0` | `margin-left: 4px` |

**Sin cambios**: ningún `border-width`, `border-style`, `border-color` ni `box-sizing` de todo el sitio.

## Utilidades que siguen sin aplicar (por diseño)

Las reglas BEM legacy permanecen sin capa, por lo que conservan su prioridad sobre las utilidades
(requisito "Las reglas BEM legacy conservan su prioridad sobre las utilidades Tailwind"):

| Utilidad | Elemento | Regla legacy que gana |
|---|---|---|
| `mb-12` | `.title-section` (`DetailedPipeline.astro:5`) | `.title-section { margin-bottom: 3.5rem }` → **56 px** |
| `inline-block` | `.btn-cta` (`[...slug].astro:135`) | `.btn-cta { display: inline-flex }` |
| `pb-20` | `section.bg-surface` (`metodologia/index.astro:38`) | `section { padding: var(--space-2xl) 0 }` |
| `mb-2`, `mb-6` | `h1`, `p` del 404 | `h1, h2, ... { margin-bottom: 1rem }` → 16 px |

## Verificación de no-regresión de los dos elementos en conflicto

| Elemento | Propiedad | Baseline | Después | Esperado |
|---|---|---|---|---|
| `.btn-cta.inline-block` | `display` | `inline-flex` | `inline-flex` | la regla BEM sigue ganando |
| `.btn-cta.inline-block` | `margin-top` | `0px` | `8px` | la utilidad `mt-2` vuelve a aplicar |
| `.btn-cta.inline-block` | caja | `200x52` | `200x52` | sin cambio de layout |
| `.title-section` | `margin-bottom` | `56px` | `56px` | la regla BEM sigue ganando (`3.5rem`) |
| `.title-section` | caja | `1240x29` | `1240x29` | sin cambio de layout |

## Conclusión del gate

Ningún componente BEM cambia de layout. El único delta visual corresponde a las utilidades de spacing
que el markup ya declaraba y que el reset sin capa anulaba.

## Nota

El estado de error del artículo (`src/pages/blog/[...slug].astro:131-136`), que contiene el elemento
`.btn-cta.inline-block.mt-2`, **no se renderiza en el sitio publicado**: Astro emite el script inline
con `define:vars` como script clásico (sin `type="module"`), por lo que su `import` lanza
`SyntaxError: Cannot use import statement outside a module` y la página queda en skeleton de forma
permanente. Para poder medir ese elemento, el markup se inyectó en el DOM antes de leer los estilos
computados (marcado con `"injected": true` en `computed-styles.json`). Es un bug preexistente, ajeno a
este change.
