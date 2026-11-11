# Capability: tailwind-bem-migration

## Purpose

Definir la estrategia de migración de componentes legacy (que usan BEM en `global.css`) a **Tailwind utility-first**, gestionando tokens del sistema de diseño, componentes admin y placeholders de rutas faltantes.

## Requirements

### Requirement: Legacy BEM components migrate to Tailwind utility-first

The system **SHALL** migrate componentes legacy que usan BEM en `global.css` a **Tailwind utility-first** cuando se modifiquen o cuando violen el design system.

#### Scenario: Componente con hex literals se migra
- **GIVEN** un componente tiene hex literals (`#00A3A3`, `#f59e0b`, etc.)
- **WHEN** se modifica el componente
- **THEN** los hex se reemplazan por tokens del sistema (`--color-teal`, `--color-warning`, etc.) usando clases Tailwind

#### Scenario: Componente con inline styles se migra
- **GIVEN** un componente tiene inline styles (`style="font-size: 3rem; color: #556;"`)
- **WHEN** se modifica el componente
- **THEN** los inline styles se reemplazan por clases Tailwind utility

#### Scenario: Componente sin estilos definidos se crea
- **GIVEN** un componente usa clases CSS no definidas en ningún archivo
- **WHEN** se detecta (build warning, inspección visual)
- **THEN** se crean estilos Tailwind en el markup del componente

### Requirement: Admin components use design system tokens

The system **SHALL** que todos los componentes admin usen tokens del sistema de diseño (`bg-primary`, `text-text-secondary`, etc.) en lugar de clases Tailwind genéricas (`bg-boxdark`, `text-bodydark2`).

#### Scenario: Admin colors match public site
- **GIVEN** se inspecciona un componente admin
- **WHEN** se revisan las clases CSS
- **THEN** usa tokens del sistema (`bg-surface`, `bg-surface-secondary`, `text-text-secondary`, `border-border`) en lugar de `bg-white`, `bg-gray-100`, `text-gray-600`, `border-gray-200`

#### Scenario: Admin supports dark theme via tokens
- **GIVEN** el usuario cambia a modo oscuro en el admin
- **WHEN** se propaga el tema
- **THEN** los colores del admin cambian automáticamente (porque usan tokens CSS temáticos)

### Requirement: Orphan components get Tailwind styles

The system **SHALL** que componentes sin `<style>` block que usan clases no definidas reciban estilos Tailwind.

#### Scenario: PackSistemas has styles
- **GIVEN** `PackSistemas.astro` usa clases `.pack-section`, `.pack-content`, etc.
- **WHEN** se renderiza en `/servicios`
- **THEN** tiene estilos visibles (Tailwind en markup o CSS dedicado)

#### Scenario: SolucionesModulares has styles
- **GIVEN** `SolucionesModulares.astro` usa clases `.modulares-section`, `.modular-card`, etc.
- **WHEN** se renderiza en `/servicios`
- **THEN** tiene estilos visibles

#### Scenario: PackWebProfesional has styles
- **GIVEN** `PackWebProfesional.astro` usa clases `.pack-section`, `.pack-grid`, etc.
- **WHEN** se renderiza en `/servicios`
- **THEN** tiene estilos visibles

#### Scenario: MetodologiaCTP has styles
- **GIVEN** `MetodologiaCTP.astro` usa clases `.metodologia-section`, `.step-card`, etc.
- **WHEN** se renderiza en `/servicios`
- **THEN** tiene estilos visibles

#### Scenario: GeneralVision has styles
- **GIVEN** `GeneralVision.astro` usa clases `.methodology-vision`, `.transversal-layer`, etc.
- **WHEN** se renderiza en `/metodologia`
- **THEN** tiene estilos visibles

### Requirement: Login page uses pure Tailwind

The system **SHALL** que la página de login use Tailwind utility-first sin valores arbitrarios que no usen tokens.

#### Scenario: Login without arbitrary values
- **GIVEN** se inspecciona `src/pages/login/index.astro`
- **WHEN** se revisan las clases CSS
- **THEN** no tiene `bg-[var(--...)]` ni `max-w-[450px]` ni otros valores arbitrarios — usa clases Tailwind estándar o tokens mapeados

### Requirement: Admin entry uses Tailwind and design tokens
The system **SHALL** exponer `/admin` como shell administrativo construido con Tailwind utility-first, tokens del sistema y componentes shadcn/ui, sin clases BEM nuevas en `global.css`.

#### Scenario: /admin usa tokens del sistema
- **WHEN** se inspeccionan las clases del shell
- **THEN** usa tokens (`bg-surface`, `text-text`, `border-border`) y no genéricos (`bg-white`, `bg-gray-100`, `text-gray-600`)

#### Scenario: Componentes shadcn sin BEM nuevo
- **GIVEN** los componentes admin y shadcn/ui agregados
- **WHEN** se revisa `global.css`
- **THEN** solo se añadieron variables CSS puente (bloque aditivo), sin reglas BEM nuevas

#### Scenario: No legacy admin placeholders
- **WHEN** el usuario intenta acceder a `/admin/leads` o `/admin/settings`
- **THEN** esas rutas ya no existen

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
