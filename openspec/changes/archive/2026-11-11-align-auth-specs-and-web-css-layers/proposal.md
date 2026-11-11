# Proposal

## Why

La spec `client-portal-auth` quedó atrás respecto a la implementación real del login (migrado a Firebase ID token + TailAdmin), dejando 7 divergencias que hacen que `/verify` y las auditorías fallen por motivos falsos en lugar de por defectos reales. En paralelo, `apps/web/src/styles/global.css` arrastra el mismo reset legacy sin cascade layer que en `apps/admin` dejó el botón de login invisible: es una trampa latente para la próxima migración de componentes del sitio público a Tailwind utility-first.

## What Changes

- Alinear la spec `client-portal-auth` con el comportamiento implementado, corrigiendo 7 requisitos:
  - El endpoint de login consume `{ id_token }` (token de Firebase), no `{ email, password, turnstileToken? }`.
  - La respuesta exitosa es `{ data: { user }, meta: { message } }` con el shape de `User` definido en `docs/api-spec.yml`.
  - El error de red se muestra inline, sin botón "Reintentar" (la mención aparecía duplicada en dos requisitos).
  - La validación cliente muestra errores inline en `onBlur`/submit y **no** deshabilita el botón de submit.
  - La página de login se aísla con `AdminLayout` (`hideHeader`/`hideSidebar`), no con `MainLayout` (`hideHeader`/`hideFooter`).
  - `firebase` sí es dependencia de auth del panel admin.
  - El island de login es `TailAdminLogin`, no `LoginForm`.
- Declarar en `tailwind-bem-migration` que las utilidades Tailwind deben prevalecer sobre el CSS legacy, y aplicarlo en `apps/web` moviendo el bloque de reset a `@layer base`.
- Añadir `apps/web/tests/validation/css-cascade-layers.test.ts` para que el patrón no vuelva a introducirse.
- Verificar con un gate visual (capturas Playwright antes/después) que el sitio público solo recupera las utilidades spacing que su markup ya declaraba, sin alterarse las reglas BEM legacy.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `client-portal-auth`: 7 requisitos MODIFIED que describen el contrato real del login (endpoint, respuesta, validación, aislamiento del layout, dependencias de auth y nombre del island).
- `tailwind-bem-migration`: 1 requisito ADDED que exige que el CSS legacy de `apps/web` esté en una cascade layer para que las utilidades Tailwind no queden anuladas.

## Impact

- **Specs**: `openspec/specs/client-portal-auth/spec.md` se corrige en este change (incluye el renombrado de 2 escenarios, que una delta `MODIFIED` no puede expresar) y su delta spec reproduce los bloques corregidos. `openspec/specs/tailwind-bem-migration/spec.md` se actualiza al archivar, cuando el comportamiento exista.
- **Código**: `apps/web/src/styles/global.css` (solo la estructura del CSS: el bloque de reset pasa a `@layer base`).
- **Tests**: nuevo `apps/web/tests/validation/css-cascade-layers.test.ts`; capturas de baseline visual como evidencia del delta esperado.
- **API / Backend**: sin cambios. `docs/api-spec.yml` y `docs/data-model.md` no se modifican: la spec OpenSpec estaba desalineada, el contrato de la API es el correcto.
- **Admin**: sin cambios de código. Los componentes React de `apps/admin` y la lógica de la API quedan intactos.
- **Riesgo visual**: el sitio público recupera el efecto de ~25 utilidades spacing (`px-4`, `pb-20`, `mt-8`, `mb-2`, `p-8`, `ml-1`, `mr-1`, `py-3`, `px-6`, `mb-4`, `mb-6`, `mb-12`, `mt-2`) que su markup ya declaraba pero que el reset sin capa anulaba.
