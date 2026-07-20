## ADDED Requirements

### Requirement: Design system compliance

The system **SHALL** que todos los componentes en `src/components/landing/` y `src/components/shared/` cumplan con el design system documentado en `docs/DESIGN.md`.

#### Scenario: No hex literals en componentes
- **GIVEN** un componente `.astro` o `.tsx` en `src/components/landing/` o `src/components/shared/`
- **WHEN** contiene un hex literal como `#00A3A3`, `#f59e0b`, `#556`, `#0077cc`
- **THEN** debe ser reemplazado por un token del sistema (`--color-teal`, `--color-warning`, etc.)

#### Scenario: No inline styles
- **GIVEN** un componente tiene inline styles (`style="font-size: 3rem; color: #556;"`)
- **WHEN** se detecta
- **THEN** debe ser reemplazado por clases Tailwind utility

#### Scenario: Tokens del sistema en colores
- **GIVEN** un componente usa colores
- **WHEN** se revisan los colores
- **THEN** usa tokens del sistema via clases Tailwind (`bg-primary`, `text-text-secondary`, etc.) en lugar de colores hardcoded

#### Scenario: Componentes huérfanos tienen estilos
- **GIVEN** un componente usa clases CSS no definidas en ningún archivo
- **WHEN** se detecta (build warning, inspección visual)
- **THEN** se crean estilos Tailwind en el markup del componente

### Requirement: Componentes legacy migran oportunamente

The system **SHALL** que componentes legacy con BEM en `global.css` se migren a Tailwind utility-first cuando se modifiquen.

#### Scenario: Modificación trigger migración
- **GIVEN** un componente legacy con BEM en `global.css`
- **WHEN** se modifica por cualquier razón
- **THEN** se aprovecha para migrar a Tailwind utility-first

#### Scenario: Sin modificación no se migra
- **GIVEN** un componente legacy con BEM en `global.css`
- **WHEN** no se modifica
- **THEN** no se migra automáticamente (queda como deuda técnica)
