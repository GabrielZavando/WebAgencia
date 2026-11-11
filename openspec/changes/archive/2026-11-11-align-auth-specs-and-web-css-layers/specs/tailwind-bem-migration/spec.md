## ADDED Requirements

### Requirement: Las utilidades Tailwind prevalecen sobre el CSS legacy del sitio público

The system **SHALL** declarar el bloque de reset legacy de `apps/web/src/styles/global.css` (reset universal, reglas de `html`/`body` y reset de controles de formulario) dentro de una cascade layer, de modo que las utilidades Tailwind, emitidas en `@layer utilities`, no queden anuladas por CSS sin capa, que tiene mayor prioridad en la cascada.

#### Scenario: El reset universal del sitio público está dentro de una cascade layer
- **WHEN** se inspecciona `apps/web/src/styles/global.css`
- **THEN** la regla `*, *::before, *::after` que declara `margin: 0; padding: 0; border: 0` está contenida en un bloque `@layer`

#### Scenario: El reset de controles de formulario del sitio público está dentro de una cascade layer
- **WHEN** se inspecciona `apps/web/src/styles/global.css`
- **THEN** las reglas `html`, `body`, `input, button, textarea, select` y `button` del bloque de reset están contenidas en un bloque `@layer`

#### Scenario: No existen reglas de reset top-level sin capa que sobrescriban utilidades
- **WHEN** se recorren las reglas de nivel superior de `apps/web/src/styles/global.css`
- **THEN** ninguna regla de reset de nivel elemento (selector sin clases ni IDs) sobre `*`, `html`, `body`, `input`, `button`, `textarea` o `select` queda fuera de una cascade layer
- **AND** las reglas BEM legacy que combinan esos elementos con clases o atributos, como `body.menu-active` o `html[data-theme="dark"] .header.scrolled`, permanecen sin capa para conservar su prioridad

#### Scenario: Existe un test de validación que protege la estructura de capas
- **WHEN** se ejecuta la suite de validación de `apps/web`
- **THEN** existe `apps/web/tests/validation/css-cascade-layers.test.ts` y verifica que el reset del sitio público está dentro de una cascade layer

#### Scenario: Las utilidades spacing del markup público surten efecto
- **GIVEN** el markup del sitio público declara utilidades de spacing como `px-4`, `pb-20`, `mt-8` y `mb-2`
- **WHEN** se renderiza la página
- **THEN** esas utilidades aplican su valor, porque el reset sin capa ya no las anula

### Requirement: Las reglas BEM legacy conservan su prioridad sobre las utilidades Tailwind

The system **SHALL** mantener las reglas BEM legacy de componentes de `apps/web` fuera de la cascade layer de utilidades, de modo que sigan determinando el valor de las propiedades en conflicto y el layout del sitio público no se altere.

#### Scenario: Las reglas BEM siguen determinando el valor en conflicto
- **GIVEN** un elemento declara una clase BEM legacy y una utilidad Tailwind en conflicto, por ejemplo `class="btn-cta inline-block mt-2"`
- **WHEN** se renderiza la página
- **THEN** la regla BEM legacy sigue determinando el valor de la propiedad en conflicto
- **AND** el layout del componente no se altera respecto al diseño actual

#### Scenario: El sitio público conserva su layout tras el cambio de capas
- **GIVEN** el sitio público fue renderizado antes del cambio de estructura de capas
- **WHEN** se renderiza después del cambio
- **THEN** el único delta visual corresponde a las utilidades spacing que el markup ya declaraba
- **AND** ningún componente BEM cambia de layout
