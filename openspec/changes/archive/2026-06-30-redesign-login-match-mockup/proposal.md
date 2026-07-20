## Why

La implementación actual de la página de login no coincide con el diseño aprobado en el mockup `inicio-sesion.png`. El mockup especifica una estética **dark developer-brand con foto de fondo de escritorio de oficina** (monitores con código, café, gafas, teclado), sombra profunda en el card, footer con nombre del desarrollador en color de acento magenta, y mezcla intencional de border-radius (card redondeado, inputs/botón planos). La implementación actual usa gradientes CSS abstractos que no reflejan la identidad visual aprobada.

## What Changes

- **Reemplazar el fondo abstracto (gradientes radiales + grid animado) por una fotografía real** del escritorio de oficina developer, descargada y optimizada en `public/assets/img/login-bg.jpg` o `.webp`
- **Aplicar overlay oscuro** sobre la foto para mantener contraste WCAG AA con texto blanco
- **Logo**: Cambiar de PNG cuadrado a icono `</>` violeta/magenta con glow magenta (`var(--color-secondary)` con `drop-shadow`)
- **Card**: Mantener border-radius 8-12px (más redondeado que el flat del sistema), aumentar sombra pronunciada con múltiples capas
- **Inputs**: Border-radius 0 (flat), íconos a la **derecha** dentro del input (banderita/key decorativa), no funcionales
- **Botón "INICIAR SESIÓN"**: Border-radius 0 (flat), fondo magenta vibrante (`var(--color-primary)`), full-width, alto prominente, texto blanco uppercase
- **Link "¿Olvidaste tu contraseña?"**: Color magenta, alineado a la derecha, debajo del input de contraseña
- **Footer externo al card**: Centrado, "© 2026 Gabriel Zavando" + "Desarrollado por: Gabriel Zavando" con nombre en magenta
- **Jerarquía asimétrica**: Título y subtítulo centrados; labels/inputs/button alineados a izquierda
- **Mantener funcionalidad intacta**: validación, Turnstile, rate limiting, honeypot, API client

## Capabilities

### New Capabilities

- `login-page-mockup-redesign`: Rediseño visual de LoginPage para alinearse exactamente con el mockup `inicio-sesion.png`

### Modified Capabilities

- `login-page` (de change anterior `align-login-design-system`): Reemplaza los requisitos previos con nueva especificación visual basada en mockup. La change archivada `2026-06-30-align-login-design-system` cubre los requisitos de tokens y clases estándar; esta nueva change los **extiende** con requisitos específicos de mockup (foto de fondo, iconos decorativos, footer externo con nombre del dev, jerarquía asimétrica).

## Impact

- **Archivos modificados**:
  - `src/pages/login.astro` (fondo, card, logo, footer, jerarquía)
  - `src/components/auth/LoginForm.tsx` (alineación, iconos decorativos en inputs)
- **Archivos nuevos**:
  - `public/assets/img/login-bg.jpg` (imagen de fondo optimizada para web)
- **Documentación actualizada**:
  - `docs/design-components.md` (entrada LoginPage actualizada)
- **Breaking changes**: Ninguno (cambios solo de UI, funcionalidad intacta)
- **Nuevos assets**: 1 imagen JPG/WEBP (~200-500KB optimizado), debe aprobarse vía dependency audit si se añade nueva dependencia de optimización

