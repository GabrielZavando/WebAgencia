## Why

La página de login actual (`src/pages/login.astro` + `src/components/auth/LoginForm.tsx`) viola el sistema de diseño flat premium documentado en `docs/DESIGN.md` y `docs/design-tokens.md`. Contiene **25+ valores hex/rgba hardcodeados**, duplica clases de formulario que ya existen en el sistema, y introduce border-radius inconsistente (8px/16px) cuando el sistema usa diseño flat (0px). Esto genera deuda técnica, dificulta el mantenimiento y rompe la consistencia visual del proyecto.

## What Changes

- **Reemplazo de valores hardcodeados**: Todos los hex/rgba literales en login.astro y LoginForm.tsx se reemplazan por variables CSS del sistema (`var(--color-*)`, `var(--btn-*)`, etc.)
- **Unificación de clases de formulario**: `.login-input` → `.form-input`, `.login-submit-btn` → `.btn-form`, `.login-error-message` → `.error-message`
- **Alineación de border-radius**: Inputs y botón cambian de 8px a 0px (flat design); card mantiene 16px como excepción documentada
- **Corrección de tipografía**: Labels de `0.85rem` → `var(--text-xs)` (0.75rem), subtitle de `0.95rem` → `var(--text-sm)` (0.875rem)
- **Estados de focus/error unificados**: Se alinean con `.form-input` del sistema (shadow ring con token primario)
- **Documentación**: Se añade entrada "LoginPage" en `docs/design-components.md`

## Capabilities

### New Capabilities

- `login-page`: Componente visual de página de login con alineación completa al sistema de diseño flat premium

### Modified Capabilities

Ninguna. Esta change no modifica requisitos de capacidades existentes, solo corrige implementación para alinearla con specs ya documentados en `design-tokens.md` y `design-components.md`.

## Impact

- **Archivos modificados**: `src/pages/login.astro` (CSS inline), `src/components/auth/LoginForm.tsx` (clases CSS)
- **Archivos creados**: Ninguno nuevo (se reutilizan clases existentes de `global.css`)
- **Documentación actualizada**: `docs/design-components.md` (entrada LoginPage)
- **Breaking changes**: Ninguno (cambios visuales menores, funcionalidad intacta)
- **Riesgo**: Bajo (solo cambios estéticos, sin lógica de negocio)