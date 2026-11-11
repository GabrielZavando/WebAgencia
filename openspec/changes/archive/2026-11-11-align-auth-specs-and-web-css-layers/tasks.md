# Tasks

## 1. Alinear la spec `client-portal-auth` con la implementación real

- [x] 1.1 Verificar contra `apps/admin/src/components/auth/TailAdminLogin.tsx` y `docs/api-spec.yml` que el login envía `{ id_token }` y consume `{ data: { user }, meta: { message } }`, y corregir en consecuencia el requisito "Endpoint consumido" y "Manejo de respuesta" del main spec y de la delta spec
- [x] 1.2 Corregir en el main spec y en la delta spec el requisito "Base visual del login con TailAdmin" (eliminar el botón "Reintentar" y renombrar su escenario) y el requisito "Aislamiento de la auth en página dedicada" (`AdminLayout` con `hideHeader`/`hideSidebar`, renombrando su escenario)
- [x] 1.3 Corregir en el main spec y en la delta spec los requisitos "Validación cliente" (el botón no se deshabilita por validación), "Bundle mínimo" (`firebase` es dependencia de auth) e "Island Architecture" (`<TailAdminLogin />`)
- [x] 1.4 Ejecutar `pnpm exec openspec validate align-auth-specs-and-web-css-layers` y `pnpm exec openspec validate --specs`, y confirmar que el change y los specs son válidos y que los 7 bloques MODIFIED de la delta son idénticos a los del main spec

## 2. Baseline visual del sitio público (antes de tocar el CSS)

- [x] 2.1 Capturar con Playwright screenshots de `/`, `/blog`, un post de `/blog/[slug]`, `/servicios`, `/metodologia` y la página 404, y guardarlos como baseline en `apps/web/tests/validation/__screenshots__/baseline/`
- [x] 2.2 Registrar los estilos computados actuales de los dos elementos con conflicto BEM/Tailwind (`.btn-cta` + `inline-block` en `src/pages/blog/[...slug].astro:135`, `.title-section` + `mb-12` en `src/components/metodologia/DetailedPipeline.astro:5`) como referencia de no-regresión

## 3. Test de validación de cascade layers en `apps/web` (TDD rojo)

- [x] 3.1 Crear `apps/web/tests/validation/css-cascade-layers.test.ts` con un parser que rastree el anidamiento de llaves y las capas que envuelven cada regla de `apps/web/src/styles/global.css`
- [x] 3.2 Incluir en el test las aserciones: el reset universal está dentro de una `@layer`, el reset de controles de formulario y las reglas de `html`/`body` están dentro de una `@layer`, y no existen reglas top-level sin capa sobre `*`, `html`, `body`, `input`, `button`, `textarea` o `select`
- [x] 3.3 Ejecutar `pnpm --filter @webastro/web exec vitest run tests/validation/css-cascade-layers.test.ts` y confirmar que **falla** contra el CSS actual

## 4. Mover el bloque de reset a `@layer base` (TDD verde)

- [x] 4.1 En `apps/web/src/styles/global.css`, envolver en `@layer base` el bloque de reset (reglas `*, *::before, *::after`, `html` con su media query, `body`, `input, button, textarea, select`, `button` y `button:disabled`), dejando intactas las reglas BEM legacy de componentes
- [x] 4.2 Ejecutar `pnpm --filter @webastro/web exec vitest run tests/validation/css-cascade-layers.test.ts` y confirmar que el test pasa
- [x] 4.3 Confirmar que el CSS compilado mantiene las utilidades Tailwind en `@layer utilities` y que el reset quedó en una capa de menor prioridad, revisando el CSS generado del build

## 5. Gate visual y no-regresión del diseño

- [x] 5.1 Capturar el mismo set de screenshots en `apps/web/tests/validation/__screenshots__/after/` y compararlos con el baseline
- [x] 5.2 Verificar con estilos computados que `.btn-cta` conserva `display: inline-flex` y `.title-section` conserva `margin-bottom: 3.5rem`, es decir, que las reglas BEM siguen ganando sobre las utilidades Tailwind
- [x] 5.3 Documentar el delta visual observado (utilidades spacing que pasaron a aplicar: `px-4`, `pb-20`, `mt-8`, `mb-2`, `p-8`, `ml-1`, `mr-1`, `py-3`, `px-6`, `mb-4`, `mb-6`, `mb-12`, `mt-2`) en la descripción del PR, confirmando que ningún componente cambia de layout

## 6. Verificación integral de `apps/web`

- [x] 6.1 Ejecutar `pnpm --filter @webastro/web build` y confirmar que el build SSG completa sin errores
- [x] 6.2 Ejecutar `pnpm --filter @webastro/web test` y confirmar que toda la suite unitaria y de validación pasa, incluido el nuevo test de cascade layers
- [x] 6.3 Ejecutar `pnpm --filter @webastro/web test:validation` y confirmar que la validación estática y E2E del sitio público pasa
  - La validación estática pasa completa (25/25). El E2E tiene 11 fallos **preexistentes**, verificados como idénticos con el CSS anterior (mismo recuento `11 failed / 14 passed` y mismos tests): `tests/validation/e2e/performance.test.ts` no puede cargarse porque importa `./lighthouse.config`, archivo que nunca existió en el historial del repo, y el resto depende de una API real (suscripción de leads, posts del blog y metatags Open Graph). Ninguno está relacionado con este change.

## Workflow follow-up

- Archivar el change con `pnpm exec openspec archive align-auth-specs-and-web-css-layers --yes`, que sincronizará las delta specs a los main specs `client-portal-auth` y `tailwind-bem-migration`.
- Verificar con `pnpm exec openspec validate --specs` que los main specs resultantes son válidos y que no contienen headers de operación delta.
