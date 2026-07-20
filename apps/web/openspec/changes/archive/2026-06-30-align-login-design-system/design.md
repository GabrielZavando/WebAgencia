## Context

La página de login es una feature piloto (v1.7) que reintrodujo `/login` como punto de entrada aislado con React island (`client:load`). Sin embargo, la implementación visual se hizo de forma rápida, resultando en:

- **200+ líneas de CSS custom** en `login.astro` que duplican funcionalidad del sistema de forms genérico
- **25+ valores hex/rgba hardcodeados** que violan la regla #1 de design tokens
- **Inconsistencia visual**: border-radius de 8px/16px vs. diseño flat (0px) del resto del sistema
- **Clases duplicadas**: `.login-input` vs `.form-input`, `.login-submit-btn` vs `.btn-form`

**Stakeholders**: Equipo de desarrollo (mantenibilidad), diseño (consistencia visual), usuarios (experiencia coherente).

**Constraints**: 
- No cambiar funcionalidad (validación, API calls, Turnstile, rate limiting)
- Mantener theme oscuro forzado (`forcedTheme="dark"`)
- Preservar fondo tecnológico con gradientes (identidad visual de login)

## Goals / Non-Goals

**Goals:**
- Eliminar todos los hex/rgba literales de componentes de login
- Unificar clases de formulario con el sistema estándar
- Alinear border-radius, tipografía y estados con design tokens
- Documentar LoginPage en design-components.md
- Reducir CSS custom en ~150 líneas

**Non-Goals:**
- Cambiar la funcionalidad de autenticación
- Modificar la API de login o integración con Turnstile
- Alterar el fondo tecnológico con gradientes animados
- Cambiar la estructura de la página (logo fixed, card centrada, footer)
- Añadir features nuevas (recuperación de contraseña, registro)

## Decisions

### 1. Reemplazo total de hex literales por variables CSS

**Decisión**: Todos los valores hex/rgba se reemplazan por `var(--color-*)` o `var(--btn-*)`.

**Rationale**: Cumplir regla #1 de design-tokens.md ("Nunca usar valores literales en componentes").

**Alternativas consideradas**:
- *Crear tokens específicos para login*: Rechazado (aumentaría complejidad innecesaria)
- *Mantener algunos hex por ser tema oscuro*: Rechazado (el sistema ya tiene tokens para dark theme)

### 2. Unificación de clases de formulario

**Decisión**: `.login-input` → `.form-input`, `.login-submit-btn` → `.btn-form`, `.login-error-message` → `.error-message`

**Rationale**: Eliminar duplicación, aprovechar CSS existente en global.css (~300 líneas de sistema de forms).

**Alternativas consideradas**:
- *Mantener clases custom con alias*: Rechazado (doble mantenimiento)
- *Refactorizar global.css primero*: Rechazado (fuera de scope, riesgo alto)

### 3. Border-radius: inputs y botón a 0px, card mantiene 16px

**Decisión**: Inputs y botón cambian a `border-radius: 0` (flat design). Card mantiene `16px` como excepción documentada.

**Rationale**: Alinear con sistema flat premium. Card mantiene radius por ser un "modal" visualmente distinto.

**Alternativas consideradas**:
- *Todo a 0px (incluyendo card)*: Rechazado (cambio visual muy drástico)
- *Crear token `--radius-card`*: Rechazado (fuera de scope, requiere OpenSpec separado)

### 4. Tipografía: ajustar a escala documentada

**Decisión**: Labels `0.85rem` → `var(--text-xs)` (0.75rem), subtitle `0.95rem` → `var(--text-sm)` (0.875rem).

**Rationale**: Usar escala tipográfica fluida documentada.

**Alternativas consideradas**:
- *Mantener valores actuales*: Rechazado (violan design tokens)
- *Usar `text-sm` para labels también*: Rechazado (jerarquía visual menos clara)

### 5. Estados de focus/error: shadow ring estándar

**Decisión**: Inputs usan el mismo `box-shadow` que `.form-input` (inset ring + outer glow).

**Rationale**: Consistencia con resto de formularios del sitio.

**Alternativas consideradas**:
- *Mantener border-color simple*: Rechazado (menos accesible, menos distintivo)

## Risks / Trade-offs

**[Riesgo] Cambio visual perceptible en inputs/botón** → Mitigación: Documentar en PR con screenshots before/after, validar con stakeholder de diseño.

**[Riesgo] Regresión en accesibilidad (focus states)** → Mitigación: Test manual con keyboard navigation, verificar contraste de colores.

**[Riesgo] CSS inline en login.astro difícil de mantener** → Mitigación: Esta change no mueve CSS a global.css (fuera de scope), pero reduce líneas en ~150.

**[Trade-off] Card mantiene border-radius 16px (inconsistente)** → Aceptado: Cambio menos drástico, se documenta como excepción. Future OpenSpec puede unificar.

**[Trade-off] No se refactoriza CSS a global.css** → Aceptado: Scope se limita a alineación visual. Refactorización estructural requiere propuesta separada.

## Migration Plan

1. **Preparación**: Leer `docs/design-tokens.md` y `docs/design-components.md` para identificar tokens equivalentes
2. **Implementación**:
   - Task 1: Reemplazar hex literales en login.astro
   - Task 2: Reemplazar hex literales en LoginForm.tsx
   - Task 3: Cambiar clases custom por estándar (.login-input → .form-input, etc.)
   - Task 4: Ajustar border-radius y tipografía
   - Task 5: Actualizar design-components.md
3. **Validación**:
   - Test visual en tema oscuro (forzado)
   - Test de keyboard navigation (focus states)
   - Test de responsive (mobile/desktop)
4. **Rollback**: Revertir commits de la change si hay regresión crítica de funcionalidad

## Open Questions

Ninguna. Esta change es correctiva, no introduce ambigüedad.