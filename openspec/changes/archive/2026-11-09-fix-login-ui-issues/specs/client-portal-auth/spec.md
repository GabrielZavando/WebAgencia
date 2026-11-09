## ADDED Requirements

### Requirement: Estilos del login cargados correctamente

The system **SHALL** cargar los estilos de Tailwind y los tokens CSS del proyecto en la página `/login` para que el formulario de login se renderice con el diseño esperado (tarjeta, inputs, botón).

#### Scenario: global.css importado en el layout admin
- **WHEN** se inspecciona `apps/admin/src/layouts/AdminLayout.astro`
- **THEN** contiene un import de `../styles/global.css`
- **AND** los tokens CSS custom properties (`--color-primary`, `--color-surface`, etc.) están disponibles en el DOM

### Requirement: Las utilidades Tailwind prevalecen sobre el CSS legacy

The system **SHALL** declarar el CSS legacy (reset universal y reset de controles de formulario) dentro de una cascade layer para que las utilidades Tailwind, emitidas en `@layer utilities`, siempre prevalezcan. El CSS sin capa tiene mayor prioridad en la cascada y anula las utilidades, dejando el botón de login transparente y sin padding.

#### Scenario: El reset universal está dentro de una cascade layer
- **WHEN** se inspecciona `apps/admin/src/styles/global.css`
- **THEN** la regla `*, *::before, *::after` que declara `margin: 0; padding: 0; border: 0` está contenida en un bloque `@layer`

#### Scenario: El reset de controles de formulario está dentro de una cascade layer
- **WHEN** se inspecciona `apps/admin/src/styles/global.css`
- **THEN** la regla `input, button, textarea, select` que declara `background: transparent` está contenida en un bloque `@layer`

#### Scenario: No existen reglas top-level sin capa que sobrescriban utilidades
- **WHEN** se recorren las reglas de nivel superior de `apps/admin/src/styles/global.css`
- **THEN** ninguna regla sobre `*`, `html`, `body`, `input`, `button`, `textarea` o `select` queda fuera de una cascade layer

#### Scenario: El botón de login renderiza con sus utilidades Tailwind
- **WHEN** se abre `/login` en un navegador
- **THEN** el botón "Iniciar sesión" tiene `padding-block` de 12px, fondo no transparente y una altura de al menos 40px
- **AND** la tarjeta del login tiene padding interior y borde visible de 1px

### Requirement: La página de login ocupa toda la pantalla

The system **SHALL** renderizar la página `/login` a pantalla completa, sin el padding lateral reservado para el sidebar, con la imagen de fondo visible y el logo con opacidad distinta de cero.

#### Scenario: Sin padding de sidebar en la página de login
- **WHEN** se abre `/login` en un viewport de escritorio
- **THEN** el contenedor del layout no aplica `padding-left` para el sidebar

#### Scenario: La imagen de fondo es visible
- **WHEN** se abre `/login` en un navegador
- **THEN** el contenedor de la imagen de fondo tiene un `z-index` igual o mayor que el del fondo de la sección, y menor que el del contenido

#### Scenario: El logo es visible
- **WHEN** se abre `/login` en un navegador
- **THEN** el logo tiene `opacity` distinta de cero

### Requirement: Sin warning de React por evento onsubmit

The system **SHALL** no usar el atributo nativo `onsubmit` en formularios React del login, evitando el warning "Invalid event handler property 'onsubmit'".

#### Scenario: Formulario usa onSubmit de React
- **WHEN** se inspecciona `apps/admin/src/components/auth/TailAdminLogin.tsx`
- **THEN** el elemento `<form>` no contiene el atributo `onsubmit`
- **AND** el elemento `<form>` contiene `onSubmit={handleSubmit}` que llama a `e.preventDefault()`

## REMOVED Requirements

Ninguna.

## MODIFIED Requirements

Ninguna. Los requisitos existentes de `client-portal-auth` se mantienen sin cambios; solo se corrigen problemas de implementación (CSS y warning de React).
