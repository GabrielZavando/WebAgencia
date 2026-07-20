# Tasks: feat-design-system-docs

> Lista de tareas para implementar la documentación del sistema de diseño.

## Task 1: Crear `docs/DESIGN.md`

**Objetivo**: Manifiesto del sistema de diseño (tesis estética, mapa, gobernanza).

**Criterios de aceptación**:
- [x] Tesis estética en 1 párrafo (paleta, tipografía, motion, anti-look).
- [x] Mapa de documentos con enlaces a `design-tokens.md`, `design-components.md`, `brand-brief.md`, `ai-design-guidance.md`.
- [x] "Cómo usar este sistema" para devs y agentes IA.
- [x] Gobernanza: protocolo `/opsx:propose` obligatorio.
- [x] Próximas iteraciones registradas (OpenSpec #1-#6).
- [x] Tabla de versionado.
- [x] ~150 líneas.

**Tiempo estimado**: 30 min.

---

## Task 2: Crear `docs/brand-brief.md`

**Objetivo**: Contexto del cliente, propuesta de valor, restricciones, anti-look.

**Criterios de aceptación**:
- [x] Cliente: Gabriel Zavando, freelance, B2B, Chile.
- [x] Propuesta de valor: experiencia, claridad, soporte cercano.
- [x] Voz y tono: español, cercano, sin jerga.
- [x] Restricciones: 1 admin, sin e-commerce, sin multi-idioma, blog CSR, Hostinger FTP.
- [x] Público objetivo: PyMEs, freelancers, startups, profesionales.
- [x] Anti-look explícito: cream/terracotta, black/acid-green, broadsheet-hairline.
- [x] Elementos de marca: logo, colores, tipografía.
- [x] Métricas de éxito: tasa de conversión, LCP, accesibilidad, retención blog.
- [x] Notas para agentes IA: idioma del código vs UI.
- [x] ~80 líneas.

**Tiempo estimado**: 25 min.

---

## Task 3: Crear `docs/ai-design-guidance.md`

**Objetivo**: Protocolo obligatorio para agentes IA antes de tocar UI.

**Criterios de aceptación**:
- [x] Orden de lectura: DESIGN.md → brand-brief.md → design-tokens.md → design-components.md → ai-design-guidance.md.
- [x] Prohibiciones explícitas: hex literales, nuevas fuentes, animaciones no documentadas, cambiar global.css sin actualizar docs.
- [x] Checklist pre-código: 6 preguntas.
- [x] Detección de discrepancias: reportar, preguntar, actualizar ambos.
- [x] Flujo para cambios: `/opsx:propose` para tokens/componentes nuevos.
- [x] FAQ: Tailwind utilities, colores no declarados, variaciones, theming.
- [x] ~60 líneas.

**Tiempo estimado**: 20 min.

---

## Task 4: Crear `docs/design-tokens.md`

**Objetivo**: Especificación canónica de todos los tokens visuales.

**Criterios de aceptación**:
- [x] Regla de uso: nunca valores literales en componentes.
- [x] Paleta base: 6 colores con hex + RGB + uso.
- [x] Paleta semántica: success/error/warning/info con hex + uso.
- [x] Tokens de superficie (claro/oscuro): body, surface, text, border.
- [x] Tokens de botón: primario, secundario, hover states.
- [x] Navegación (claro/oscuro): nav-bg, hamburger, links.
- [x] Overlays de banner: gradientes por tema.
- [x] Tipografía: fuentes + escala fluida en 4 breakpoints (tabla).
- [x] Espaciado: base + padding de componentes.
- [x] Sombras: sm/md/lg/xl/hover.
- [x] Z-index: jerarquía completa.
- [x] Transiciones: fast/normal/slow.
- [x] Dimensiones específicas: logo, header height, scroll offset.
- [x] Reglas de uso: 5 reglas duras.
- [x] ~200 líneas.

**Tiempo estimado**: 45 min.

---

## Task 5: Crear `docs/design-components.md`

**Objetivo**: Catálogo de componentes UI con contratos.

**Criterios de aceptación**:
- [x] Cómo usar el catálogo.
- [x] Componentes compartidos (10+): Header, Footer, Modal, ModalMessage, ThemeSwitcher, Search, ErrorPage, Schema, PrivacyPolicy, Unsubscribe, Head.
- [x] Componentes de landing (10+): Banner, ServiceCard, Services, ServicesLanding, Plans, PackWebProfesional, PackSistemas, Contact, About, Workflow, MetodologiaCTP, SolucionesModulares.
- [x] Componentes de autenticación (1): LoginForm.
- [x] Componentes de metodología (4): GeneralVision, MaturitySpiral, ChangeManagement, DetailedPipeline.
- [x] Para cada componente: propósito, props, estados, casos de uso, no usar para, A11y.
- [x] Reglas para nuevos componentes: 7 reglas.
- [x] ~250 líneas.

**Tiempo estimado**: 60 min.

---

## Task 6: Crear `openspec/specs/_design-system/spec.md`

**Objetivo**: Spec transversal OpenSpec que ancla el DS al workflow.

**Criterios de aceptación**:
- [x] Purpose: dotar al proyecto de un lenguaje visual versionado.
- [x] Capabilities: palette, typography, components, motion, theming, a11y.
- [x] Requirements por capability con bloques WHEN/THEN.
- [x] Scenarios con bloques WHEN/THEN.
- [x] Formato compatible con specs existentes (`lead-capture`, `blog-content`).
- [x] ~80 líneas.

**Tiempo estimado**: 30 min.

---

## Task 7: Actualizar `AGENTS.md`

**Objetivo**: Añadir referencia a `DESIGN.md` en sección Arquitectura.

**Criterios de aceptación**:
- [x] En sección "Arquitectura", añadir nota: "El sistema de diseño está documentado en `docs/DESIGN.md`. Leer antes de modificar UI."
- [x] En sección "Convenciones y peculiaridades", añadir: "Todos los cambios al sistema de diseño deben pasar por `/opsx:propose`."
- [x] Sin romper formato Markdown existente.

**Tiempo estimado**: 10 min.

---

## Task 8: Verificar

**Objetivo**: Validar que los documentos son correctos y no rompen nada.

**Criterios de aceptación**:
- [x] `pnpm test` pasa sin errores.
- [x] Todos los enlaces cruzados entre documentos funcionan (verificar manualmente).
- [x] Valores en `design-tokens.md` coinciden con `global.css` (verificar manualmente: paleta, tipografía, espaciado).
- [x] Componentes en `design-components.md` existen en `src/components/` (verificar manualmente).
- [x] Sintaxis Markdown válida en todos los documentos (verificar con linter si existe).

**Tiempo estimado**: 20 min.

---

## Task 9: Archivar

**Objetivo**: Cerrar la iteración con `/opsx:archive`.

**Criterios de aceptación**:
- [x] Ejecutar `/opsx:archive feat-design-system-docs`.
- [x] Archivos movidos a `openspec/changes/archive/<fecha>_feat-design-system-docs/`.
- [x] `AGENTS.md` actualizado.

**Tiempo estimado**: 5 min.

---

## Resumen de tiempos

| Task | Tiempo | Estado |
|---|---|---|
| Task 1: DESIGN.md | 30 min | ✅ Completada |
| Task 2: brand-brief.md | 25 min | ✅ Completada |
| Task 3: ai-design-guidance.md | 20 min | ✅ Completada |
| Task 4: design-tokens.md | 45 min | ✅ Completada |
| Task 5: design-components.md | 60 min | ✅ Completada |
| Task 6: spec transversal | 30 min | ✅ Completada |
| Task 7: AGENTS.md | 10 min | ✅ Completada |
| Task 8: Verificar | 20 min | ✅ Completada |
| Task 9: Archivar | 5 min | ✅ Completada |
| **Total** | **~3 horas** | **9/9 completadas** |

## Notas

- Todas las tasks están completas.
- El cambio quedó listo para archive y fue validado con `openspec validate feat-design-system-docs --strict`.
