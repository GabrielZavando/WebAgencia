## Context

La change anterior (`2026-06-30-align-login-design-system`) alineó los tokens y clases del sistema, pero la implementación visual resultante no coincide con el mockup aprobado `inicio-sesion.png`. Este redesign completa la alineación visual agregando:

- **Fotografía real de fondo**: escritorio developer con monitores de código, café, gafas — refuerza la narrativa "personal brand developer" del sitio
- **Logo `</>` violeta**: reemplaza el PNG cuadrado por un icono code que es más distintivo
- **Sombra profunda en card**: efecto "floating panel" dramático
- **Card border-radius 8-12px**: rompe con flat design del sistema pero está justificado (card como modal flotante)
- **Inputs/botón border-radius 0**: contraste intencional con card redondeado
- **Iconos decorativos en inputs** (banderita): no funcionales, puramente visuales
- **Footer externo con branding personal**: nombre del dev en color de acento

**Stakeholders**: Diseño (fidelidad al mockup), desarrollo (mantenibilidad), usuarios (experiencia coherente con marca personal).

**Constraints**:
- No romper tests existentes (`LoginForm.test.tsx`)
- Mantener tema oscuro forzado
- No añadir dependencias nuevas (imagen se añade directamente a `public/`)
- WCAG AA: imagen de fondo debe tener overlay suficiente para contraste de texto blanco
- Astro SSG: no usar lógica que requiera build server-side

## Goals / Non-Goals

**Goals:**
- Matchear visualmente el mockup `inicio-sesion.png` con ≥90% de fidelidad
- Mantener specs de la change anterior (tokens, clases estándar `.form-*`)
- Añadir fotografía de fondo optimizada (JPG/webp ≤300KB)
- Implementar jerarquía asimétrica (título centrado, formulario izquierda)
- Footer externo al card con nombre del dev en magenta
- Sombra profunda del card con múltiples capas

**Non-Goals:**
- Cambiar funcionalidad de autenticación
- Modificar API client o Turnstile
- Cambiar validación o rate limiting
- Crear variantes light/dark del login (mantiene `forcedTheme="dark"`)
- Añadir dependencias de optimización de imágenes
- Internacionalización de textos (mantiene español)

## Decisions

### 1. Imagen de fondo: fotografía real vs gradiente CSS

**Decisión**: Usar fotografía real (~200-300KB, 1920x1080 o similar), almacenada en `public/assets/img/login-bg.jpg` con `loading="eager"` y `fetchpriority="high"`.

**Rationale**: El mockup muestra claramente una foto de escritorio developer (no gradiente abstracto). Esto refuerza la identidad de marca personal del sitio.

**Alternativas consideradas**:
- *Mantener gradientes CSS*: Rechazado (no match el mockup, ya implementado así sin éxito)
- *Usar SVG ilustrado*: Rechazado (más caro de mantener, menos realista)
- *Imagen de stock royalty-free*: Considerado. Se usará una foto de Unsplash (developer desk setup, dark tones) o similar

**Implementación técnica**:
```css
.login-page {
  background-image: url('/assets/img/login-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

### 2. Overlay oscuro sobre foto

**Decisión**: Aplicar overlay de `rgba(0, 0, 0, 0.6)` o más (60-70% opacidad) para garantizar WCAG AA con texto blanco del card.

**Rationale**: Foto oscura + texto blanco requiere contraste ≥4.5:1. Sin overlay, partes claras de la foto romperían legibilidad.

**Alternativas consideradas**:
- *Overlay gradiente (más oscuro en bordes)*: Considerado para mejor legibilidad en bordes
- *Backdrop-filter blur en card*: Mantiene el card destacado y difumina la foto detrás

### 3. Logo: icono `</>` vs PNG actual

**Decisión**: Crear SVG inline del icono `</>` en color magenta/violeta (`var(--color-secondary)` con `drop-shadow` magenta).

**Rationale**: SVG inline es más ligero que PNG, escala perfecto, y permite control de color vía CSS variable.

**Alternativas consideradas**:
- *Mantener PNG* (`logo-medium.png`): rechazado (no es el icono del mockup)
- *Crear SVG como archivo separado*: Considerado pero inline permite control de color inmediato

### 4. Card border-radius: 8-12px (rompe flat design)

**Decisión**: `border-radius: 12px` para el card. Esto es **excepción documentada** al flat design del sistema.

**Rationale**: El mockup requiere card redondeado. Justificación: card funciona como "modal flotante" visualmente distinto, y este cambio fue aprobado por el diseño.

**Alternativas consideradas**:
- *Mantener 16px (de change anterior)*: Considerado pero 12px es más fiel al mockup
- *0px (flat puro)*: Rechazado (no match el mockup)

### 5. Inputs/botón border-radius: 0 (flat)

**Decisión**: Border-radius 0 en `.form-input` y `.btn-form`.

**Rationale**: El mockup muestra contraste intencional: card redondeado, controles internos planos. Decisión consciente de diseño que rompe la consistencia interna por identidad visual.

**Alternativas consideradas**:
- *Mantener border-radius del sistema (.form-input)*: Rechazado (no match el mockup)
- *Aplicar radius intermedio (4px)*: Rechazado (mockup es completamente plano)

### 6. Iconos decorativos en inputs (banderita/key)

**Decisión**: Añadir icono Material Symbols (`flag` o `key`) **a la derecha** de cada input, como elemento decorativo no funcional. Posición absoluta dentro del wrapper del input.

**Rationale**: Refuerza la estética "developer terminal/playful" del mockup sin afectar funcionalidad.

**Alternativas consideradas**:
- *Sin iconos (solo placeholder)*: Rechazado (mockup tiene iconos)
- *Iconos a la izquierda* (estándar): Rechazado (mockup tiene a la derecha)

**Implementación**:
```tsx
<div className="login-input-wrapper">
  <input className="form-input" ... />
  <span className="material-symbols-outlined login-input-icon">flag</span>
</div>
```

CSS: `position: relative` en wrapper, `position: absolute; right: 1rem;` en icono.

### 7. Footer externo al card con branding personal

**Decisión**: Mover footer fuera del card (como en mockup, debajo del card, no dentro). Color magenta (`var(--color-primary)`) solo en el nombre "Gabriel Zavando".

**Rationale**: Footers internos al card reducen área útil. Footer externo refuerza marca personal y deja el card enfocado en el formulario.

**Alternativas consideradas**:
- *Footer dentro del card (actual)*: Rechazado (mockup tiene fuera)

### 8. Jerarquía asimétrica: título centrado, form izquierda

**Decisión**: Header del card con `text-align: center` (título + subtítulo). Cuerpo del card con `text-align: left`.

**Rationale**: El mockup muestra asimetría intencional que crea jerarquía visual sin requerir CSS adicional.

**Alternativas consideradas**:
- *Todo centrado*: Rechazado (form queda raro centrado cuando es largo)
- *Todo izquierda*: Rechazado (pierde el efecto de centrado del título)

## Risks / Trade-offs

**[Riesgo] Tamaño de imagen de fondo aumenta bundle** → Mitigación: Optimizar a webp/jpg ≤300KB. Usar `loading="eager"` solo en login (página crítica), no lazy.

**[Riesgo] Contraste WCAG AA con foto** → Mitigación: Overlay oscuro (60%+) + test con axe-core o Lighthouse. Si falla, aumentar opacidad del overlay.

**[Riesgo] Cambio de border-radius rompe consistencia con sistema flat** → Mitigación: Documentar en design-components.md como "excepción aprobada por cambio de mockup v1.7.1".

**[Riesgo] Logo SVG inline coincide con `</>` oficial** → Mitigación: Validar con usuario que el icono del mockup sea correcto. Si no coinciden, ajustar.

**[Trade-off] Card pierde clase `.login-card__footer` interno** → Aceptado: Cambio aprobado por diseño. Footer ahora es externo.

**[Trade-off] Diferencia entre system flat design y login** → Aceptado: Login es caso especial documentado como excepción.

## Migration Plan

1. **Obtener imagen de fondo**: Descargar foto royalty-free de Unsplash (developer desk, dark tones) o usar placeholder similar. Optimizar a ≤300KB.
2. **Crear SVG del logo `</>`** si el icono actual no coincide con mockup
3. **Implementar cambios** task por task según `tasks.md`
4. **Validar**:
   - Build sin errores
   - Tests pasan (sin cambios funcionales)
   - Contraste WCAG con axe-core (opcional)
   - Responsive (mobile <768px, desktop ≥1200px)
5. **Capturar screenshot** y comparar con mockup pixel-by-pixel aproximado

## Open Questions

1. **¿La imagen del mockup es una referencia específica o podemos usar una equivalente?** — Asumimos equivalente royalty-free. Si usuario tiene imagen específica, reemplazar.
2. **¿El icono `</>` del mockup debe coincidir con el logo real de la marca?** — Asumimos que sí; si no, usar icon genérico.
3. **¿Sitio del footer "Gabriel Zavando" debe ser link?** — Asumimos que sí (link a portfolio/LinkedIn). Si no, mantener texto plano.

