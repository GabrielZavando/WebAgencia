## Context

El sitio WebAgenciaAstro tiene una estrategia CSS híbrida resultante de迭代acionesincrementales:
- **Componentes nuevos** (login, admin): Tailwind utility-first
- **Componentes legacy** (landing, shared, metodología): BEM en `global.css`
- **Tokens**: Definidos en `@theme` block de Tailwind + `:root` variables, pero no todos son usados consistentemente

### Estado actual documentado (Fase 0 completada)
- Archivos de contexto (`AGENTS.md`, `DESIGN.md`, `design-tokens.md`, `design-components.md`, specs) ya actualizados
- Token `--color-teal` y `--container-wide` agregados a `global.css` y docs
- Specs de admin-dashboard y dashboard-widgets reescritos (sin referencias TailAdmin)

## Goals / Non-Goals

**Goals:**
- Unificar TODO el sitio bajo **Tailwind utility-first**
- Eliminar hex literals e inline styles de componentes
- Admin usa mismos tokens que sitio público
- Crear estilos para componentes huérfanos
- Crear placeholders para rutas admin faltantes
- Reducir `global.css` migrando componentes BEM a Tailwind

**Non-Goals:**
- Eliminar `global.css` completamente (tokens y animaciones fade-in se quedan)
- Migrar animaciones CSS complejas (pipeline, skeleton, login) a Tailwind
- Cambiar la arquitectura del sitio (SSG, Astro, React islands)
- Agregar nuevas dependencias npm
- Crear componentes admin nuevos (leads, settings completos)

## Decisions

### Decision 1: Migración incremental por componente, no big-bang

**Elección**: Migrar componente por componente, verificando build + tests después de cada uno.

**Alternativas consideradas**:
- *Big-bang rewrite*: Reescribir todos los archivos de una vez → Riesgo alto de regressions, difícil de revisar
- *Lazy migration*: Solo migrar cuando se toca el componente → Lento, inconsistencia persiste

**Razón**: Incremental permite detectar regressions temprano, hacer code review por archivo, y hacer rollback específico si algo falla.

### Decision 2: Tokens CSS mapeados a Tailwind utility classes

**Elección**: En vez de usar `style="color: var(--color-primary)"`, usar `text-primary` (clase Tailwind que mapea al token).

**Mapeo establecido en `ai-design-guidance.md`**:
| Token | Clase Tailwind |
|-------|----------------|
| `--color-primary` | `bg-primary`, `text-primary` |
| `--color-secondary` | `bg-secondary`, `text-secondary` |
| `--color-teal` | `bg-teal`, `text-teal` |
| `--color-surface` | `bg-surface` |
| `--color-text` | `text-text` |
| `--color-text-secondary` | `text-text-secondary` |
| `--color-success` | `text-success` |
| `--color-error` | `text-error` |

**Alternativas consideradas**:
- *Arbitrary values* (`bg-[var(--color-primary)]`): Funciona pero es verbose y frágil
- *SCSS variables*: Agrega dependencia de preprocesador, innecesario con Tailwind

**Razón**: Tailwind ya tiene el mecanismo `@theme` para mapear tokens a utility classes. Es la forma idiomática.

### Decision 3: Componentes legacy mantienen BEM hasta que se modifiquen

**Elección**: No migrar proactivamente componentes que no se están tocando.

**Alternativas consideradas**:
- *Migrar todo ahora*: Trabajo enorme (~2700 líneas), riesgo alto, beneficio bajo si no se modifica
- *Migrar solo violaciones*: Enfocarse en hex literals, inline styles, y clases huérfanas

**Razón**: El objetivo es corregir violaciones y establecer el patrón para código nuevo. La migración completa es deuda técnica que se paga oportunamente.

### Decision 4: Estilos Tailwind en `<style>` block o inline para componentes huérfanos

**Elección**: Para componentes sin `<style>` block que usan clases no definidas (`PackSistemas`, etc.), crear estilos Tailwind en la misma página que los importa o en un CSS dedicado.

**Alternativas consideradas**:
- *Agregar a global.css*: Contribuye al problema del archivo monolítico
- *Scoped style con Tailwind*: Usar `<style is:global>` o clases Tailwind en markup
- *CSS modules*: No soportado por Astro nativamente

**Razón**: Si el componente se renderiza en una página específica, los estilos pueden ir en esa página. Si se reutiliza, crear un CSS module pequeño o usar Tailwind directamente en el markup.

### Decision 5: Admin usa `bg-surface`/`bg-surface-secondary` en vez de `bg-white`/`bg-gray-100`

**Elección**: Mapear los colores de fondo del admin a tokens del sistema para soporte automático de tema claro/oscuro.

**Mapeo**:
| Actual (genérico) | Token del sistema |
|-------------------|-------------------|
| `bg-white` | `bg-surface` |
| `bg-gray-100` | `bg-surface-secondary` |
| `dark:bg-gray-900` | `dark:bg-body` |
| `border-gray-200` | `border-border` |
| `text-gray-600` | `text-text-secondary` |

**Razón**: Consistencia total con el sitio público. El tema claro/oscuro se propaga automáticamente.

## Risks / Trade-offs

**[Risk] Regressions visuales en componentes migrados** → Mitigación: Verificar build, tests, y revisar visualmente en ambos temas después de cada componente migrado.

**[Risk] Clases Tailwind genéricas en admin pueden no tener contraparte exacta en tokens** → Mitigación: Algunas como `bg-surface` funcionan. Para otras (sombras, border-radius específicos), usar valores Tailwind estándar si son consistentes con el design system.

**[Risk] Componentes huérfanos pueden tener estilos dependientes de otros CSS no detectados** → Mitigación: Verificar el build output (`dist/`) para confirmar que los estilos aparecen. Si no, crear estilos explicitamente.

**[Risk] `global.css` puede crecer temporalmente si se agregan estilos para componentes huérfanos** → Mitigación: Preferir Tailwind inline en markup sobre agregar más CSS a global.css. El objetivo neto es reducir global.css.

**[Trade-off] Migración incremental vs consistencia inmediata** → Elegimos incremental para reducir riesgo, pero implica que por un tiempo el sitio tendrá una mezcla de estrategias CSS.
