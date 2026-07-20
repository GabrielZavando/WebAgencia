# AI Design Guidance — WebAgenciaAstro

> Protocolo para agentes IA antes de modificar UI. Lectura obligatoria.

## Orden de lectura obligatorio

Antes de tocar cualquier archivo en `src/components/` o `src/styles/`:

1. **`docs/DESIGN.md`** — Tesis estética, mapa del sistema, gobernanza.
2. **`docs/brand-brief.md`** — Contexto del cliente, anti-look, voz.
3. **`docs/design-tokens.md`** — Valores exactos de tokens (paleta, tipografía, espaciado).
4. **`docs/design-components.md`** — Catálogo de componentes con contratos.
5. **`docs/ai-design-guidance.md`** (este archivo) — Protocolo de validación.

## Prohibiciones explícitas

### ❌ Colores

- **No usar hex literales** en componentes (`.astro`, `.tsx`, `.ts`):
  ```astro
  <!-- MAL -->
  <div class="bg-[#FF0080]">...</div>
  
  <!-- BIEN -->
  <div class="bg-primary">...</div>
  ```

- **No crear nuevos colores** sin propuesta OpenSpec (`/opsx:propose`).
- **No usar Tailwind arbitrary values** (`bg-[#xxxxxx]`, `text-[1.25rem]`).

### ❌ Tipografía

- **No añadir nuevas fuentes** (Montserrat + Open Sans son únicas).
- **No modificar escala tipográfica** sin actualizar `design-tokens.md`.
- **No usar `font-size` hardcoded** en rem/px en componentes; usar clases de sistema.

### ❌ Motion

- **No crear `@keyframes` nuevas** sin documentar en `design-motion-guide.md`.
- **No ignorar `prefers-reduced-motion`**: toda animación debe respetarlo.
- **No añadir transiciones >0.5s** sin justificación explícita.

### ❌ Estructura

- **No cambiar `global.css`** sin actualizar `design-tokens.md`.
- **No crear componentes SCSS** — usar Tailwind utility-first.
- **No añadir SSR/adapter** (proyecto SSG puro, `output: 'static'`).

### ❌ CSS Strategy

- **No crear componentes nuevos con BEM en `global.css`**: usar **Tailwind utility-first**.
- **No migrar componentes legacy automáticamente**: solo cuando se modifiquen.
- **No usar colores genéricos de Tailwind** (`bg-pink-500`, `text-gray-600`): mapear a tokens del sistema (`bg-primary`, `text-text-secondary`).

## Valida antes de escribir

### Checklist pre-código

- [ ] ¿He leído `DESIGN.md` y `design-tokens.md`?
- [ ] ¿El color que uso está en la paleta declarada?
- [ ] ¿La fuente que uso es Montserrat u Open Sans?
- [ ] ¿El componente que creo ya existe en `design-components.md`?
- [ ] ¿Si no existe, he propuesto OpenSpec para añadirlo?
- [ ] ¿He verificado que no hay hex literales en mi código?
- [ ] ¿Estoy usando **Tailwind utility-first** (no BEM en `global.css`)?
- [ ] ¿Mapeé los colores a tokens del sistema (no `bg-pink-500`)?

### Detección de discrepancias

Si el código no coincide con la documentación:

1. **Reportar como issue** (no asumir que la docs está mal).
2. **Preguntar antes de corregir**: ¿el código es correcto y la docs está desactualizada, o viceversa?
3. **Actualizar ambos** si hay cambio real: primero el código, luego la docs.

## Flujo para cambios al sistema

### Añadir nuevo token

```bash
/opsx:propose feat-add-new-color-token
```

1. Generar `proposal.md` → `design.md` → `tasks.md`.
2. Implementar con TDD (test primero).
3. Validar con `/opsx:verify`.
4. Archivar con `/opsx:archive`.

### Añadir nuevo componente

```bash
/opsx:propose feat-add-new-ui-component
```

1. Documentar contrato en `design-components.md`.
2. Crear componente + test pareja.
3. Verificar a11y (ARIA, focus, reduced-motion).
4. Archivar.

### Corregir typo en docs

Sin OpenSpec:
- Editar directamente.
- Commit con mensaje claro (`docs: corregir typo en DESIGN.md`).

## Skill nativa (cuando exista)

Cuando se cree `ai-specs/skills/design-system-keeper/`:

- **Cargar automáticamente** al detectar cambios en `src/components/` o `src/styles/`.
- **Validar** que el cambio cumple con `DESIGN.md` y `design-tokens.md`.
- **Alertar** si se detecta violación (hex literal, fuente nueva, animación no documentada).

## Preguntas frecuentes

### ¿Cuándo uso Tailwind vs BEM en `global.css`?

| Escenario | Estrategia |
|-----------|-----------|
| Componente **nuevo** | **Tailwind utility-first** en el markup |
| Componente **admin** (`src/components/admin/`) | **Tailwind utility-first** con tokens del sistema |
| Componente **legacy** sin modificar | **No se toca** (BEM en `global.css`) |
| Componente **legacy** que se modifica | **Migrar a Tailwind** oportunamente |

### ¿Cómo mapeo colores de Tailwind a tokens del sistema?

| Tailwind genérico | Token del sistema |
|-------------------|-------------------|
| `bg-pink-500` | `bg-primary` |
| `text-purple-600` | `text-secondary` |
| `text-green-500` | `text-success` |
| `text-red-500` | `text-error` |
| `text-yellow-500` | `text-warning` |
| `bg-white` | `bg-surface` |
| `bg-gray-100` | `bg-surface-secondary` |
| `text-gray-600` | `text-text-secondary` |

### ¿Puedo usar Tailwind utilities directamente?

Sí, pero **solo si coinciden con tokens declarados**:
- ✅ `bg-primary`, `text-lg`, `p-4`, `shadow-md`.
- ❌ `bg-[#FF0080]`, `text-[1.25rem]`, `p-[17px]`.

### ¿Qué hago si el diseño propuesto por el usuario usa un color no declarado?

1. **Preguntar**: ¿este color es intencional o puede usarse un token existente?
2. **Si es intencional**: proponer OpenSpec para añadirlo al sistema.
3. **Si no**: sugerir usar el token más cercano de la paleta.

### ¿Puedo crear un componente que ya existe pero con variaciones?

- **Si la variación es menor** (color, tamaño): usar props del componente existente.
- **Si la variación es estructural**: proponer OpenSpec para extender el contrato.
- **Si es completamente nuevo**: crear nuevo componente, documentar en `design-components.md`.

### ¿Cómo manejo el tema claro/oscuro en componentes nuevos?

1. **Usar siempre variables CSS** (`var(--color-text)`, `var(--color-surface)`).
2. **No hardcodear colores** por tema (el tema se gestiona en `:root[data-theme]`).
3. **Verificar contraste** en ambos temas (WCAG AA mínimo).

## Referencias

- [DESIGN.md](./DESIGN.md) — Manifiesto del sistema de diseño.
- [brand-brief.md](./brand-brief.md) — Contexto del cliente.
- [design-tokens.md](./design-tokens.md) — Valores de tokens.
- [design-components.md](./design-components.md) — Catálogo de componentes.
- [frontend-standards.md](./frontend-standards.md) — Estándares técnicos del proyecto.