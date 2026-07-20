## ADDED Requirements

### Requirement: Palette

The system **SHALL** usar exclusiva la paleta declarada en `docs/design-tokens.md`.

#### Scenario: Uso de color no declarado
- **Given** un agente IA quiere implementar un componente nuevo
- **When** propone un color hex que no está en `design-tokens.md`
- **Then** el agente debe detenerse y proponer `/opsx:propose feat-add-new-color-token` antes de escribir código.

#### Scenario: Color literal en componente
- **Given** un componente `.astro` o `.tsx`
- **When** contiene un hex literal como `#FF0080` en lugar de `var(--color-primary)`
- **Then** el test `design-system-audit.test.ts` futuro debe fallar.

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
