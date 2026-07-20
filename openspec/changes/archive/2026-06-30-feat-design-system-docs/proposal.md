# Proposal: feat-design-system-docs

> Documentación canónica del sistema de diseño para WebAgenciaAstro.

## Problem

El proyecto carece de un sistema documental unificado que conecte:
- Código (`global.css`, componentes `src/components/`)
- Convenciones (`frontend-standards.md`)
- Decisiones estéticas (`frontend-design` skill)
- Workflow OpenSpec

**Consecuencia**: agentes IA y humanos no tienen una fuente de verdad única para seguir el sistema de diseño, lo que lleva a inconsistencias visuales y decisiones arbitrarias.

## Proposed Solution

Crear un sistema documental jerárquico en 5 archivos:

1. **`docs/DESIGN.md`** — Manifiesto del sistema de diseño (tesis estética, mapa, gobernanza).
2. **`docs/brand-brief.md`** — Contexto del cliente, propuesta de valor, anti-look, restricciones.
3. **`docs/ai-design-guidance.md`** — Protocolo para agentes IA antes de tocar UI.
4. **`docs/design-tokens.md`** — Especificación canónica de tokens (paleta, tipografía, espaciado, sombras, z-index).
5. **`docs/design-components.md`** — Catálogo de componentes con props, estados, casos de uso.

**Alcance**: solo documentación, 0 cambios de código, 0 riesgo de regresión visual.

## Design

### Estructura documental

```
docs/
├── DESIGN.md                    # Índice maestro, tesis estética, gobernanza
├── brand-brief.md               # Contexto cliente, anti-look, voz
├── ai-design-guidance.md        # Protocolo para agentes IA
├── design-tokens.md             # Canónica de tokens (tablas con valores exactos)
├── design-components.md         # Catálogo de componentes (25+ entradas)
├── frontend-standards.md        # EXISTENTE → no modificar en esta iteración
├── base-standards.md            # EXISTENTE → no modificar
└── data-model.md                # EXISTENTE → no modificar
```

### Gobernanza

**Regla**: todos los cambios al sistema de diseño deben pasar por `/opsx:propose` antes de implementación.

Excepciones:
- Corrección de typo en documentación.
- Actualización de valores cuando el código ya es correcto y los docs están desactualizados.

Prohibido:
- Añadir hex nuevos directamente en componentes.
- Crear clases Tailwind arbitrarias (`bg-[#FF0080]`).
- Introducir animaciones no documentadas.

### Próximas iteraciones (fuera de alcance)

- Extraer tokens a `src/styles/design-tokens.css` (riesgo de regresión).
- Crear `tests/validation/design-system-audit.test.ts` (auditoría estructural).
- Documentar `design-motion-guide.md`, `design-theming.md`, `design-accessibility.md`.
- Crear skill nativa `design-system-keeper`.

## Tasks

1. **Crear `docs/DESIGN.md`** — Manifiesto con tesis estética, mapa del sistema, gobernanza.
2. **Crear `docs/brand-brief.md`** — Contexto del cliente, propuesta de valor, anti-look.
3. **Crear `docs/ai-design-guidance.md`** — Protocolo para agentes IA.
4. **Crear `docs/design-tokens.md`** — Especificación canónica de tokens.
5. **Crear `docs/design-components.md`** — Catálogo de componentes existentes.
6. **Crear `openspec/specs/_design-system/spec.md`** — Spec transversal OpenSpec.
7. **Actualizar `AGENTS.md`** — Añadir nota sobre DESIGN.md en sección Arquitectura.
8. **Verificar** — `pnpm test` + revisión manual de docs cruzados.
9. **Archivar** — `/opsx:archive feat-design-system-docs`.

## Scenarios

### Scenario: Agente IA modifica componente existente

- **WHEN** un agente IA quiere modificar `src/components/shared/Header.astro`
- **AND** no ha leído `docs/design-components.md`
- **THEN** el agente debe detenerse y leer la documentación antes de escribir código

### Scenario: Agente IA propone nuevo color

- **WHEN** un agente IA necesita un nuevo color semántico
- **AND** el color no está en `docs/design-tokens.md`
- **THEN** el agente debe proponer `/opsx:propose feat-add-new-color-token` antes de añadir el hex

### Scenario: Desarrollador humano crea componente nuevo

- **WHEN** un desarrollador humano quiere crear `src/components/landing/PromoBanner.astro`
- **AND** el componente no existe en `docs/design-components.md`
- **THEN** el desarrollador debe documentar el contrato en `design-components.md` después de implementar

## Delta Specs

### Capability: palette (nueva)

- El sistema DEBE usar exclusiva paleta declarada en `design-tokens.md`.
- El sistema DEBE rechazar hex literales en componentes (test estructural futuro).

### Capability: typography (nueva)

- El sistema DEBE escalar tipo en 4 breakpoints (768/820/1200).
- El sistema DEBE usar solo Montserrat + Open Sans.

### Capability: components (nueva)

- Cada componente de `design-components.md` DEBE tener test pareja.
- Cada componente nuevo DEBE documentarse en `design-components.md`.

## Risk Assessment

| Riesgo | Nivel | Mitigación |
|---|---|---|
| Regresión visual | Nulo | 0 cambios de código |
| Docs desactualizadas | Bajo | Actualizar junto con el código (regla en `DESIGN.md`) |
| Agentes IA no leen docs | Bajo | `ai-design-guidance.md` con protocolo obligatorio |

## Success Metrics

- [ ] 5 documentos creados sin errores de sintaxis.
- [ ] `pnpm test` pasa sin cambios.
- [ ] Enlaces cruzados entre documentos funcionan.
- [ ] AGENTS.md actualizado con referencia a `DESIGN.md`.