# Design: feat-design-system-docs

> Especificación técnica de la documentación del sistema de diseño.

## Contexto

Este proyecto tiene un sistema de diseño implementado en código (`global.css`, componentes) pero sin documentación canónica. Los agentes IA y desarrolladores humanos toman decisiones visuales sin consultar una fuente de verdad única.

## Objetivo

Crear 5 documentos que conecten:
- Código existente → documentación
- Decisiones estéticas → explícitas
- Workflow OpenSpec → integrado

## Documentos a crear

### 1. `docs/DESIGN.md` (manifiesto)

**Propósito**: Índice maestro del sistema de diseño.

**Contenido**:
- Tesis estética (1 párrafo): paleta, tipografía, motion, anti-look.
- Mapa de documentos: enlaces a `design-tokens.md`, `design-components.md`, `brand-brief.md`, `ai-design-guidance.md`.
- "Cómo usar este sistema": flujo para devs y para agentes IA.
- Gobernanza: protocolo `/opsx:propose` obligatorio.
- Próximas iteraciones: tareas OpenSpec futuras.
- Versionado: tabla de cambios.

**Audiencia**: cliente (Gabriel Zavando) + devs + agentes IA.

**Líneas objetivo**: ~150 líneas.

---

### 2. `docs/brand-brief.md` (contexto)

**Propósito**: Contexto del cliente, propuesta de valor, restricciones.

**Contenido**:
- Cliente: Gabriel Zavando, freelance, B2B, Chile.
- Propuesta de valor: experiencia, claridad, soporte cercano.
- Voz y tono: español, cercano, sin jerga.
- Restricciones: 1 admin, sin e-commerce, sin multi-idioma, blog CSR, Hostinger FTP.
- Público objetivo: PyMEs, freelancers, startups, profesionales.
- Anti-look explícito: cream/terracotta, black/acid-green, broadsheet-hairline.
- Elementos de marca: logo, colores, tipografía.
- Contenido legal: política de privacidad, Schema.org.
- Métricas de éxito: tasa de conversión, LCP, accesibilidad, retención blog.
- Notas para agentes IA: idioma del código vs UI, nombres de componentes.

**Audiencia**: cliente + devs + agentes IA.

**Líneas objetivo**: ~80 líneas.

---

### 3. `docs/ai-design-guidance.md` (protocolo IA)

**Propósito**: Protocolo obligatorio para agentes IA antes de tocar UI.

**Contenido**:
- Orden de lectura: DESIGN.md → brand-brief.md → design-tokens.md → design-components.md → ai-design-guidance.md.
- Prohibiciones explícitas:
  - No hex literales en componentes.
  - No nuevas fuentes.
  - No animaciones no documentadas.
  - No cambiar `global.css` sin actualizar docs.
- Checklist pre-código: 6 preguntas de validación.
- Detección de discrepancias: reportar, preguntar, actualizar ambos.
- Flujo para cambios: `/opsx:propose` para tokens/componentes nuevos.
- FAQ: Tailwind utilities, colores no declarados, variaciones de componentes, theming.

**Audiencia**: agentes IA + devs.

**Líneas objetivo**: ~60 líneas.

---

### 4. `docs/design-tokens.md` (tokens canónicos)

**Propósito**: Especificación canónica de todos los tokens visuales.

**Contenido**:
- Regla de uso: nunca valores literales en componentes.
- Paleta base: 6 colores con hex + RGB + uso.
- Paleta semántica: success/error/warning/info con hex + uso.
- Tokens de superficie (claro/oscuro): body, surface, text, border.
- Tokens de botón: primario, secundario, hover states.
- Navegación (claro/oscuro): nav-bg, hamburger, links.
- Overlays de banner: gradientes por tema.
- Tipografía: fuentes + escala fluida en 4 breakpoints (tabla).
- Espaciado: base + padding de componentes.
- Sombras: sm/md/lg/xl/hover.
- Z-index: jerarquía completa con ejemplos.
- Transiciones: fast/normal/slow.
- Dimensiones específicas: logo, header height, scroll offset.
- Reglas de uso: 5 reglas duras.

**Audiencia**: devs + agentes IA.

**Líneas objetivo**: ~200 líneas.

---

### 5. `docs/design-components.md` (catálogo)

**Propósito**: Catálogo de componentes UI con contratos.

**Contenido**:
- Cómo usar el catálogo: verificar antes de crear, actualizar al modificar.
- Componentes compartidos (10): Header, Footer, Modal, ModalMessage, ThemeSwitcher, Search, ErrorPage, Schema, PrivacyPolicy, Unsubscribe, Head.
- Componentes de landing (10): Banner, ServiceCard, Services, ServicesLanding, Plans, PackWebProfesional, PackSistemas, Contact, About, Workflow, MetodologiaCTP, SolucionesModulares.
- Componentes de autenticación (1): LoginForm (React island).
- Componentes de metodología (4): GeneralVision, MaturitySpiral, ChangeManagement, DetailedPipeline.
- Para cada componente: propósito, props, estados, casos de uso, no usar para, A11y.
- Reglas para nuevos componentes: 7 reglas.

**Audiencia**: devs + agentes IA.

**Líneas objetivo**: ~250 líneas.

---

### 6. `openspec/specs/_design-system/spec.md` (spec transversal)

**Propósito**: Spec OpenSpec transversal que ancla el DS al workflow.

**Contenido**:
- Purpose: dotar al proyecto de un lenguaje visual versionado.
- Requirements por capability:
  - `palette`: usar exclusiva paleta declarada, rechazar hex literales.
  - `typography`: escalar en 4 breakpoints, solo Montserrat+Open Sans.
  - `components`: test pareja por componente, documentar nuevos.
  - `motion`: honrar prefers-reduced-motion.
  - `theming`: propagar via data-theme en :root.
  - `a11y`: WCAG AA mínimo.
- Scenarios con bloques WHEN/THEN.

**Audiencia**: agentes IA (validación de cambios).

**Líneas objetivo**: ~80 líneas.

---

## Criterios de aceptación

- [ ] Los 5 documentos en `docs/` existen y tienen sintaxis Markdown válida.
- [ ] Todos los enlaces cruzados entre documentos funcionan.
- [ ] Los valores en `design-tokens.md` coinciden con `global.css` (verificar manualmente).
- [ ] Los componentes en `design-components.md` existen en `src/components/`.
- [ ] `openspec/specs/_design-system/spec.md` sigue el formato de otras specs.
- [ ] `pnpm test` pasa sin cambios en el código.
- [ ] AGENTS.md actualizado con referencia a `DESIGN.md` en sección Arquitectura.

## Notas técnicas

- **Sin cambios de código**: 0 archivos `.astro`, `.tsx`, `.ts`, `.css` modificados.
- **Sin regresión visual**: el build no cambia.
- **Doble audiencia**: algunos documentos son para cliente + devs (DESIGN.md, brand-brief.md).
- **Gobernanza**: todos los cambios futuros pasan por `/opsx:propose`.

## Dependencias

- Ninguna. Los documentos se basan en código existente (`global.css`, `src/components/`).

## Riesgos

| Riesgo | Nivel | Mitigación |
|---|---|---|
| Docs desactualizadas | Bajo | Regla en DESIGN.md: actualizar junto con el código |
| Agentes IA no leen docs | Bajo | ai-design-guidance.md con protocolo obligatorio |
| Valores incorrectos en tokens | Bajo | Verificar contra global.css antes de archivar |

## Timeline

- **Fase 1**: Crear 5 documentos en `docs/` (~2 horas).
- **Fase 2**: Crear spec transversal en `openspec/specs/_design-system/` (~30 min).
- **Fase 3**: Actualizar AGENTS.md (~10 min).
- **Fase 4**: Verificar tests + enlaces cruzados (~20 min).
- **Total**: ~3 horas.

## Referencias

- `src/styles/global.css` — Fuente de tokens.
- `src/components/shared/`, `src/components/landing/` — Fuente de componentes.
- `docs/frontend-standards.md` — Estándares técnicos existentes.
- `AGENTS.md` — Workflow OpenSpec del proyecto.