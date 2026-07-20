# Design System — WebAgenciaAstro

> Sistema de diseño versionado y canónico. Única fuente de verdad para decisiones visuales, componentes, tokens, motion y theming.

## Tesis estética

El sistema visual de WebAgenciaAstro se define por:

- **Paleta**: magenta (#FF0080) como color primario de acción, violeta (#A600FF) como secundario, cian (#00FFE0) como acento, violeta oscuro (#1D0033) como base oscura. Esta combinación comunica modernidad, tecnología y cercanía sin caer en los looks genéricos AI (cream/terracotta, black/acid-green, broadsheet-hairline).
- **Tipografía**: Montserrat para titulares (carácter, peso visual), Open Sans para cuerpo (legibilidad, neutralidad). Escala fluida en 4 breakpoints.
- **Espaciado**: sistema basado en múltiplos de 0.25rem, con espaciado generoso en secciones para respiración visual.
- **Motion**: fade-in progresivo con IntersectionObserver, siempre con `prefers-reduced-motion` honrado.
- **Tema**: claro/oscuro persistente en localStorage, forzado vía `MainLayout.forcedTheme` cuando aplique.

**Anti-look explícito**: este sistema **no** usa cream (#F4F1EA), acid-green, ni hairline rules. Evitar cream backgrounds, terracotta accents, black backgrounds con bright-green highlights, y broadsheet layouts con dense columns.

## Mapa del sistema

| Área | Documento | Descripción |
|---|---|---|
| **Tokens** | [design-tokens.md](./design-tokens.md) | Paleta, tipografía, espaciado, sombras, z-index, transiciones |
| **Componentes** | [design-components.md](./design-components.md) | Catálogo de componentes UI con props, estados, casos de uso |
| **Brand** | [brand-brief.md](./brand-brief.md) | Contexto del cliente, propuesta de valor, voz, restricciones |
| **AI Guidance** | [ai-design-guidance.md](./ai-design-guidance.md) | Flujo para agentes IA antes de tocar UI |
| **Motion** | *(pendiente)* | Guía de animaciones y motion design |
| **Theming** | *(pendiente)* | Reglas de claro/oscuro y propagación |
| **Accesibilidad** | *(pendiente)* | WCAG, contraste, focus, ARIA patterns |

## Cómo usar este sistema

### Para desarrolladores humanos

1. **Antes de implementar UI nueva**: leer `brand-brief.md` → `design-tokens.md` → `design-components.md`.
2. **Al modificar componentes existentes**: verificar que el cambio no rompa contratos documentados en `design-components.md`.
3. **Para proponer cambios al sistema**: ejecutar `/opsx:propose <nombre>` y seguir el workflow OpenSpec.
4. **En caso de discrepancia**: si el código no coincide con la documentación, reportar como issue y actualizar ambos (código primero, luego docs).

### Para agentes IA

1. **Cargar skill nativa** (cuando exista `design-system-keeper`) antes de cualquier cambio a `src/components/` o `src/styles/`.
2. **Leer en orden**: `DESIGN.md` → `design-tokens.md` → `design-components.md` → `ai-design-guidance.md`.
3. **Validar antes de escribir**:
   - No usar hex literales fuera de `global.css`.
   - No crear nuevas fuentes ni colores semánticos sin propuesta OpenSpec.
   - Reportar cualquier valor hardcoded (`bg-[#..]`, `text-[rem]`) como violación.
4. **Si los docs están incompletos**: no asumir, proponer OpenSpec para cerrar la brecha.

## Estrategia CSS: Tailwind utility-first

**Decisión oficial (v1.1):** El proyecto usa **Tailwind CSS utility-first** como estrategia principal de estilos.

### Componentes nuevos y admin
- **Todo nuevo** se escribe con clases Tailwind utility-first directamente en el markup.
- **Admin** (`src/components/admin/`) usa exclusivamente Tailwind utility classes + tokens del sistema (`bg-primary`, `text-secondary`, etc.).
- **Login** (`src/pages/login/index.astro`) usa Tailwind utility-first.

### Componentes legacy (en migración)
- Componentes existentes en `src/components/landing/` y `src/components/shared/` usan BEM en `global.css`.
- **No se migran automáticamente** — se migran cuando se modifiquen por otros cambios.
- Si un componente legacy se toca, se aprovecha para migrar a Tailwind.

### Regla para agentes IA
- **Componentes nuevos**: SIEMPRE Tailwind utility-first.
- **Admin**: SIEMPRE Tailwind utility-first con tokens del sistema.
- **Legacy**: No migrar salvo que se modifique activamente. Si se modifica, migrar a Tailwind.

## Gobernanza

**Regla**: todos los cambios al sistema de diseño (nuevos tokens, componentes, motion, theming) deben pasar por `/opsx:propose` antes de implementación.

Excepciones permitidas:
- Corrección de typo en documentación.
- Actualización de valores de tokens cuando el código ya es correcto y los docs están desactualizados (sin cambiar comportamiento).

Prohibido:
- Añadir hex nuevos directamente en componentes.
- Crear clases Tailwind arbitrarias (`bg-[#FF0080]`).
- Introducir animaciones no documentadas.
- Modificar `global.css` sin actualizar `design-tokens.md`.

## Próximas iteraciones del DS

Estas tareas quedan registradas como deuda documentada:

- [ ] **OpenSpec #1**: Migrar componentes legacy BEM a Tailwind utility-first (progresivo).
- [ ] **OpenSpec #2**: Crear `tests/validation/design-system-audit.test.ts` (auditoría estructural).
- [ ] **OpenSpec #3**: Documentar `design-motion-guide.md`.
- [ ] **OpenSpec #4**: Documentar `design-theming.md`.
- [ ] **OpenSpec #5**: Documentar `design-accessibility.md`.
- [ ] **OpenSpec #6**: Crear skill nativa `design-system-keeper`.

## Versionado

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0.0 | 2026-06-30 | Iteración inicial: manifiestos + tokens + componentes (sin migración CSS ni tests) |

## Referencias cruzadas

- **Código fuente**: `src/styles/global.css` (tokens + componentes legacy BEM en migración a Tailwind), `src/components/shared/`, `src/components/landing/`, `src/components/admin/`, `src/components/metodologia/`.
- **Stack**: Astro 5 + Tailwind 4 + React Islands (opcional).
- **Workflow**: Spec-Driven con OpenSpec (`/opsx:propose`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive`).