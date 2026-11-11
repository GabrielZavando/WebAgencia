# Design

## Context

La spec `client-portal-auth` describe el login como un formulario que envía `{ email, password }` y recibe `{ token, user, expiresAt }`. La implementación real, tras migrar a Firebase Auth + TailAdmin, envía `{ id_token }` y consume `{ data: { user }, meta: { message } }` — contrato confirmado en `docs/api-spec.yml` (`POST /api/v1/auth/login`, `required: [id_token]`, respuesta `data.user` con el schema `User`).

`apps/web/src/styles/global.css` (2856 líneas) replica la estructura de `apps/admin`: dos bloques `@theme` (líneas 8-243) y luego ~2600 líneas de CSS legacy sin capa, que arrancan con un reset universal (`margin: 0; padding: 0; border: 0`), reglas de `html`/`body` y un reset de controles de formulario (`background: transparent; border-radius: 0; appearance: none`).

El sitio público usa utilidades Tailwind en 13 archivos, y el reset sin capa las anula. Inventario de las que hoy están muertas y que resucitarán: `px-4` (×4), `mt-8` (×5), `mb-2` (×9), `p-8`, `pb-20`, `ml-1` (×2), `mr-1`, `py-3`, `px-6`, `mb-4`, `mb-6`, `mb-12`, `mt-2`.

Además, dos elementos mezclan clase BEM legacy y utilidad Tailwind en conflicto:

- `src/pages/blog/[...slug].astro:135` → `class="btn-cta inline-block mt-2"`, donde `.btn-cta` define `display: inline-flex`.
- `src/components/metodologia/DetailedPipeline.astro:5` → `class="title-section text-center mb-12"`, donde `.title-section` define `margin-bottom: 3.5rem`.

La precedencia de CSS Cascade Layers es la clave: una regla sin capa gana a cualquier regla en `@layer`. Tailwind v4 emite sus utilidades en `@layer utilities`, así que el reset legacy sin capa las anula. En `apps/admin` esto dejó el botón de login transparente y sin padding; `apps/web` tiene la misma trampa latente para la próxima migración a Tailwind utility-first.

## Goals / Non-Goals

**Goals:**
- Que la spec `client-portal-auth` describa el comportamiento realmente implementado, de modo que `/verify` y la auditoría evaluen el código y no contradicciones de documentación.
- Que el sitio público deje de anular sus propias utilidades Tailwind, sin alterar el layout de ningún componente BEM existente.
- Que exista una defensa automática (test de validación) contra la reintroducción del patrón.

**Non-Goals:**
- No modificar la lógica de la API ni los componentes React de `apps/admin`: el comportamiento del código es el correcto y la spec es lo que estaba atrasado.
- No modificar `docs/api-spec.yml` ni `docs/data-model.md`: el contrato de la API ya refleja la implementación.
- No migrar componentes del sitio público a Tailwind utility-first: solo se normaliza la estructura de capas del CSS.
- No rediseñar el sitio público. El delta visual admitido es exclusivamente el de las utilidades spacing que el markup ya declaraba.

## Decisions

### D1: Corregir el main spec de `client-portal-auth` directamente y reflejarlo en la delta spec

OpenSpec no soporta renombrar un escenario: una delta `MODIFIED` debe conservar los nombres de escenario exactos del spec actual, tanto al validar (`validator.js`, `diffScenarioNames`) como al archivar (`specs-apply.js`, que lanza error si el bloque pierde alguno). Dos de las correcciones lo requieren:

- "Error de red muestra mensaje y botón Reintentar" → "Error de red muestra mensaje inline"
- "Header y footer ocultos en login" → "Header y sidebar ocultos en login"

El main spec de `client-portal-auth` se corrige directamente (el encargo lo autorizaba de forma explícita) y la delta spec de este change reproduce los mismos bloques con los nombres ya renombrados. Así el spec queda alineado con el código, la delta documenta el cambio a nivel de capability, y el archivado aplica un no-op limpio en lugar de fallar.

**Alternativas descartadas**:
- *Conservar los nombres antiguos en la delta*: el validador y el archivado lo permitirían, pero dejaría en el spec un escenario titulado "muestra mensaje y botón Reintentar" cuyos propios bullets niegan ese botón: el spec seguiría mintiendo, que es exactamente lo que este change viene a corregir.
- *Expresar el renombrado como `REMOVED` + `ADDED` del mismo requisito*: el CLI lo rechaza como conflicto entre operaciones (`specs-apply.js`).
- *Editar el main spec sin delta*: dejaría la capability `client-portal-auth` fuera del change y el proposal sería incoherente con los artefactos.

### D2: En `apps/web`, mover solo el bloque de reset a `@layer base` y dejar el BEM legacy sin capa

Esta es la diferencia clave respecto a `apps/admin`, donde se envolvió todo el legacy en `@layer components`. En el admin la migración a Tailwind era total, así que hacer que las utilidades ganaran era exactamente lo buscado. En el sitio público el legacy BEM sigue siendo el dueño del diseño: si también se metiera en `@layer components`, `.btn-cta` perdería contra `inline-block` (de `inline-flex` a `inline-block`) y `.title-section` perdería contra `mb-12` (de `3.5rem` a `3rem`), alterando el layout de dos componentes.

Mover únicamente el reset a `@layer base` hace que las utilidades ganen frente al reset —que es lo que las mataba— sin que las utilities ganen frente a las reglas de componente.

**Alcance de la verificación**: la comprobación de "no existen reglas top-level sin capa" se limita a las reglas de reset de nivel elemento (selector sin clases ni IDs). Las reglas legacy que combinan un elemento con clases o atributos (`body.menu-active`, `html[data-theme="dark"] .header.scrolled`) siguen sin capa a propósito: son reglas de componente o de estado, y enlayerarlas haría que cualquier utilidad Tailwind pudiera sobreescribirlas —justo el comportamiento que este change evita.

**Alternativas descartadas**:
- *Envolver todo el legacy en `@layer components`* (paridad con admin): más consistente entre apps, pero rompe la intención del autor en 2 componentes y contradice la restricción de no alterar el diseño.
- *Eliminar el reset y delegar en el preflight de Tailwind v4*: el preflight ya aplica `margin: 0; padding: 0; border: 0 solid; box-sizing: border-box` en `@layer base`, pero no cubre `border-radius: 0` ni `appearance: none` de los controles, que el sitio público sí necesita (botones cuadrados, inputs sin appearance nativa).

### D3: Conservar el reset, solo reubicarlo

El reset no es redundante: `border-radius: 0` y `appearance: none` son decisiones de diseño del sitio público que el preflight no cubre. Por eso se mueve el bloque completo, en lugar de eliminarlo o recortarlo.

### D4: Test de validación con parser de capas, no simple búsqueda de texto

Un test que solo compruebe que la cadena `@layer components` exista sería insuficiente: pasaría aunque quedaran reglas sin capa que anulen utilidades. El test (adaptado del ya existente en `apps/admin/tests/validation/css-cascade-layers.test.ts`) recorre el CSS rastreando el anidamiento de llaves y las capas que envuelven cada regla, y falla si el reset universal, el reset de controles de formulario o alguna regla de nivel superior sobre `*`/`html`/`body`/formularios queda fuera de una capa.

**Alternativa descartada**: aserciones por `indexOf` de cadenas. Rechazada por ser frágil: no detecta reglas sin capa en posiciones inesperadas.

### D5: Gate visual con capturas Playwright antes/después

El cambio de cascada no es verificable por aserciones de texto. Se capturan screenshots de las páginas afectadas (`/`, `/blog`, `/blog/[slug]`, `/servicios`, `/metodologia` y la 404) **antes** de tocar el CSS y **después**, y se documenta el delta. El baseline se toma como primer paso de implementación, porque después del cambio el estado anterior ya no es recuperable sin revertir.

La verificación de que las reglas BEM conservan su prioridad se hace de forma dirigida sobre los dos elementos de conflicto conocido (`.btn-cta` + `inline-block`, `.title-section` + `mb-12`), comprobando los estilos computados.

**Alternativa descartada**: no verificar visualmente y confiar en que el cambio es trivial. Rechazada porque la restricción del encargo es explícita sobre no alterar el diseño del sitio público.

### D6: La corrección de la spec se limita a lo verificado contra el código y `docs/api-spec.yml`

Cada uno de los 7 requisitos MODIFIED se redacta contra el código real (`apps/admin/src/components/auth/TailAdminLogin.tsx`, `apps/admin/src/lib/api-client.ts`, `apps/admin/src/layouts/AdminLayout.astro`) y contra `docs/api-spec.yml`. No se introduce comportamiento nuevo en la spec: solo se describe lo que ya existe.

La mención al botón "Reintentar" aparecía en dos requisitos distintos ("Manejo de respuesta" y "Base visual del login con TailAdmin"); se corrigen ambos, porque el delta de un requisito reemplaza su bloque completo y dejar el segundo sin tocar reintroduciría la contradicción.

## Risks / Trade-offs

- **El sitio público cambia de aspecto en ~25 elementos** → El markup ya declaraba esas utilidades; el render actual es el resultado de que el reset las anulaba. El delta se acota al efecto de las propias utilidades y se documenta con capturas. Si algún elemento resultara visualmente inaceptable, la corrección es en el markup de ese elemento, no en la capa.
- **El bloque de reset incluye `html` y `body`** → Moverlos a `@layer base` los expone a las utilidades Tailwind, que no apuntan a esos elementos en el sitio público, así que no hay conflicto. El test de validación lo cubre.
- **La spec puede volver a quedar atrás** → Es el riesgo estructural de una spec que describe un flujo que cambió varias veces. Mitigación parcial: los requisitos MODIFIED citan el contrato concreto (`{ id_token }`, `data.user`), de modo que una divergencia futura se detecte por contraste con `docs/api-spec.yml`, que sí es la fuente de verdad del contrato HTTP.
- **`firebase` como dependencia de auth contradice el histórico "bundle mínimo"** → Se corrige el requisito en vez de eliminar la dependencia: Firebase Auth es la fuente de identidad y emite el `id_token` que consume la API; sin ella no hay login.

## Migration Plan

1. Capturar el baseline visual (antes de tocar el CSS).
2. Escribir el test de validación y verificar que falla.
3. Mover el bloque de reset a `@layer base`.
4. Verificar que el test pasa y capturar el estado "después".
5. Comparar y documentar el delta visual.
6. Ejecutar `pnpm build`, `pnpm test` y `pnpm test:validation` en `apps/web`.

**Rollback**: revertir el commit que mueve el bloque de reset devuelve el sitio público a su estado actual; el cambio es un único bloque CSS reubicado, sin migraciones de datos ni cambios de esquema.
