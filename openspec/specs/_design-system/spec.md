# _design-system Specification

## Purpose

Dotar al proyecto de un lenguaje visual versionado, descubrible por agentes IA y humanos, integrable con el workflow `/opsx`. **Estrategia oficial: Tailwind utility-first** con tokens del sistema de diseño.

## Requirements
### Requirement: Palette

The system **SHALL** usar exclusivamente la paleta declarada en `docs/design-tokens.md` y definida en `src/styles/global.css` (`@theme` block).

#### Scenario: Uso de color no declarado
- **Given** un agente IA quiere implementar un componente nuevo
- **When** propone un color hex que no está en `design-tokens.md`
- **Then** el agente debe detenerse y proponer `/opsx:propose feat-add-new-color-token` antes de escribir código.

#### Scenario: Color literal en componente
- **Given** un componente `.astro` o `.tsx`
- **When** contiene un hex literal como `#FF0080` en lugar de `var(--color-primary)`
- **Then** el test `design-system-audit.test.ts` debe fallar.

### Requirement: Typography

The system **SHALL** usar solo las fuentes Montserrat para headings y Open Sans para cuerpo.

#### Scenario: Nueva fuente propuesta
- **Given** un diseñador propone una fuente para CTA
- **When** la fuente no es Montserrat ni Open Sans
- **Then** se debe proponer `/opsx:propose feat-add-new-font` antes de implementar.

#### Scenario: Escala tipográfica
- **Given** un componente usa tamaño de fuente
- **When** no usa `var(--text-*)` de `docs/design-tokens.md`
- **Then** el componente debe ser refactorizado para usar los tokens declarados.

### Requirement: Components

The system **SHALL** documentar cada componente en `docs/design-components.md` con props, estados y casos de uso.

#### Scenario: Componente nuevo sin documentación
- **Given** un desarrollador crea `src/components/landing/PromoBanner.astro`
- **When** no existe entrada en `docs/design-components.md`
- **Then** debe añadirse la documentación inmediatamente después de implementar.

#### Scenario: Test pareja
- **Given** un componente público como Header, Footer o Modal
- **When** no tiene test asociado Vitest o Playwright
- **Then** se debe crear el test antes de marcar la feature como completa.

### Requirement: Tailwind utility-first

The system **SHALL** implementar componentes nuevos y admin con **Tailwind utility-first**. The system **SHALL** usar tokens del sistema (`bg-primary`, `text-secondary`, etc.) en lugar de colores genéricos de Tailwind.

#### Scenario: Componente nuevo con Tailwind
- **Given** se crea un componente nuevo
- **When** se implementa
- **THEN** usa clases Tailwind utility-first en el markup (no BEM en `global.css`)

#### Scenario: Admin con tokens del sitio
- **Given** se inspecciona un componente admin
- **When** se revisan las clases CSS
- **THEN** usa tokens del sistema (`bg-primary`, `text-success`, etc.) en lugar de `bg-pink-500`, `text-green-500`

#### Scenario: Componente legacy sin modificar
- **Given** un componente legacy con BEM en `global.css`
- **When** no se modifica
- **THEN** no se migra automáticamente (se migra cuando se toque)

### Requirement: Motion

The system **SHALL** honrar `prefers-reduced-motion` en todas las animaciones.

#### Scenario: Animación sin reducción
- **Given** un componente tiene animación CSS o JS
- **When** no respeta `@media (prefers-reduced-motion: reduce)`
- **Then** la animación debe ser desactivada o reducida para usuarios que lo soliciten.

#### Scenario: Nueva animación
- **Given** un componente necesita animación nueva
- **When** la animación no está documentada en `design-motion-guide.md`
- **Then** se debe documentar antes de implementar o proponer `/opsx:propose`.

### Requirement: Theming

The system **SHALL** propagar el tema vía `data-theme="light|dark"` en `:root`.

#### Scenario: Color hardcodeado por tema
- **Given** un componente usa `#FFFFFF` para texto en lugar de `var(--color-text)`
- **When** el usuario cambia a modo oscuro
- **Then** el componente debe ser refactorizado para usar variables CSS temáticas.

#### Scenario: Persistencia de tema
- **Given** un usuario cambia a modo oscuro
- **When** recarga la página
- **Then** el tema debe mantenerse desde localStorage.

### Requirement: Accessibility

The system **SHALL** cumplir WCAG AA mínimo: contraste mayor o igual a 4.5:1 para texto normal y 3:1 para texto grande.

#### Scenario: Contraste insuficiente
- **Given** un par texto/fondo nuevo
- **When** el ratio de contraste es menor que 4.5:1
- **Then** se debe ajustar el color antes de implementar.

#### Scenario: Navegación por teclado
- **Given** un componente interactivo como botón, enlace o input
- **When** no es navegable con teclado usando Tab, Enter o Espacio
- **Then** el componente debe ser refactorizado para soportar navegación por teclado.

#### Scenario: ARIA labels
- **Given** un elemento interactivo como botón, enlace o input
- **When** no tiene label accesible mediante texto visible, `aria-label` o `aria-labelledby`
- **Then** se debe añadir el label antes de marcar la feature como completa.

### Requirement: Design system audit test

The system **SHALL** incluir un test de auditoría estructural (`tests/validation/design-system-audit.test.ts`) que verifique compliance con el design system.

#### Scenario: Test de auditoría existe
- **GIVEN** el proyecto tiene un design system documentado
- **WHEN** se ejecutan tests de validación
- **THEN** existe `design-system-audit.test.ts` que verifica: sin hex literals en componentes, sin inline styles, tokens usados correctamente

#### Scenario: Test de auditoría pasa
- **GIVEN** todos los componentes cumplen el design system
- **WHEN** se ejecuta `pnpm test:validation:static`
- **THEN** el test de auditoría pasa sin errores
