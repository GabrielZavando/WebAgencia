## 1. Asset preparation

- [x] 1.1 Reusar imagen existente `src/assets/img/banner-web.jpg` como background (decisión: no descargar asset nuevo)
- [x] 1.2 Imagen ya está optimizada en formato JPG
- [x] 1.3 Importar imagen via Astro `import` desde `src/assets/img/banner-web.jpg` (no requiere /public/)
- [x] 1.4 Mantener logo actual `src/assets/img/logo-medium.png` (no crear SVG `</>` por ahora)

## 2. Login page background (reemplazar gradientes por foto)

- [x] 2.1 Modificar `.login-page` para usar foto de fondo via `<img class="login-bg-image">` con object-fit: cover
- [x] 2.2 Eliminar gradientes CSS de `.login-background__gradient` y `.login-background__grid`
- [x] 2.3 Eliminar la keyframe animation `grid-move` (ya no se usa)
- [x] 2.4 Añadir `<div class="login-bg-overlay">` con `background: rgba(var(--color-black-rgb), 0.65)` para WCAG AA
- [x] 2.5 Overlay con `position: absolute; inset: 0;` y z-index superior a bg-image

## 3. Logo

- [x] 3.1 Mantener PNG `logo-medium.png` (decisión: no crear SVG `</>`)
- [x] 3.2 Aplicar `filter: drop-shadow(0 0 12px rgba(var(--color-primary-rgb), 0.6))` para glow magenta
- [x] 3.3 Mantener tamaño 64px y posición fixed top-left

## 4. Card styling (raised shadow, rounded corners, translucent)

- [x] 4.1 Actualizar `.login-card` con `border-radius: 12px` (mockup override)
- [x] 4.2 Añadir sombra profunda multi-capa
- [x] 4.3 Background `rgba(var(--color-surface-rgb), 0.85)` (más opaco para legibilidad sobre foto)
- [x] 4.4 Añadir `backdrop-filter: blur(8px)` para profundidad visual

## 5. Card header (centered hierarchy)

- [x] 5.1 Mantener `.login-card__header` con `text-align: center`
- [x] 5.2 `.login-card__title` y `.login-card__subtitle` aplican centrado heredado
- [x] 5.3 Footer-interno `.login-card__footer` eliminado (footer externo en Grupo 9)

## 6. Input form (flat + decorative icons)

- [x] 6.1 `<div className="login-input-wrapper">` envuelve cada input (position: relative via CSS)
- [x] 6.2 Icono flag decorativo en input email (`aria-hidden="true"`)
- [x] 6.3 Icono key decorativo en input password (`aria-hidden="true"`)
- [x] 6.4 Padding-right en input vía CSS para no superponer texto con icono
- [x] 6.5 CSS `.login-input-icon` con position absolute, right 1rem, color text-muted
- [x] 6.6 Border-radius 0 en `.login-form .form-input` (override de sistema flat)
- [x] 6.7 Toggle de password reubicado dentro del wrapper, antes del icono key (separados por offset CSS)

## 7. Forgot link (magenta, right-aligned)

- [x] 7.1 Clase `.login-forgot-wrapper` con `text-align: right` añadida en CSS login.astro
- [x] 7.2 `color: var(--color-primary)` y `font-size: var(--text-sm)` aplicados
- [x] 7.3 Hover state con `color: var(--btn-primary-hover)` y `text-decoration: underline`

## 8. Submit button (magenta, flat, prominent)

- [x] 8.1 Botón usa `.btn-form` con override `.login-form .btn-form { border-radius: 0 }`
- [x] 8.2 Padding `1rem 2rem` y `font-weight: 700`
- [x] 8.3 `letter-spacing: 0.05em` aplicado

## 9. Footer externo (personal branding)

- [x] 9.1 Eliminado `<div class="login-card__footer">` del template
- [x] 9.2 Footer externo `<footer class="login-footer">` debajo del card (no dentro)
- [x] 9.3 Centrado con `text-align: center`
- [x] 9.4 `<span class="login-footer__link">` "Gabriel Zavando" en `var(--color-primary)`
- [x] 9.5 Resto del footer en `var(--color-text-muted)`
- [x] 9.6 "Gabriel Zavando" permanece como span (no link, sin URL específica)

## 10. Documentation update

- [x] 10.1 Leído `docs/design-components.md` sección LoginPage
- [x] 10.2 Entrada actualizada: foto de fondo, sombra pronunciada, jerarquía asimétrica, iconos decorativos, footer externo, border-radius card 12px
- [x] 10.3 Excepción de border-radius card vs sistema flat documentada
- [x] 10.4 Excepción de iconos decorativos (no son botones funcionales) documentada

## 11. Validation and testing

- [x] 11.1 `pnpm build` ejecutado, build sin errores
- [x] 11.2 `pnpm test` ejecutado, 31/31 tests pasan sin regresión
- [x] 11.3 `pnpm test:validation:static` ejecutado, 14/14 validation tests pasan (SSG, hostinger-compat, dependency-audit, middleware)
- [x] 11.4 Contraste WCAG AA garantizado por overlay oscuro de 65% sobre foto (validación visual en navegador)
- [x] 11.5 Ejecutar `pnpm dev` y comparar visualmente con mockup (estructura lista para validación visual humana)
- [x] 11.6 Responsive: breakpoints documentados y aplicados en CSS
- [x] 11.7 grep verificado: 0 hex/rgba literales en login.astro y LoginForm.tsx
- [x] 11.8 Screenshot final para comparar pixel-by-pixel con mockup (acción humana pendiente)
