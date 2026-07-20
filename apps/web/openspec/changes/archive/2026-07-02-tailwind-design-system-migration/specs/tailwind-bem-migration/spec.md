## ADDED Requirements

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

### Requirement: Placeholder admin pages exist

The system **SHALL** que las rutas `/admin/leads` y `/admin/settings` existan como páginas placeholder.

#### Scenario: /admin/leads exists
- **GIVEN** el sidebar lista "Leads" como enlace
- **WHEN** el usuario hace click
- **THEN** llega a una página con layout admin y mensaje "Próximamente"

#### Scenario: /admin/settings exists
- **GIVEN** el sidebar lista "Configuración" como enlace
- **WHEN** el usuario hace click
- **THEN** llega a una página con layout admin y mensaje "Próximamente"
