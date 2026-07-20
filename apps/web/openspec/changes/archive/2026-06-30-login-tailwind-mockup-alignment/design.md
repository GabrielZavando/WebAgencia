## Context

El login actual tuvo múltiples iteraciones visuales, pero aún presenta desalineaciones respecto al mockup `inicio-sesion.png` (posición de iconos en inputs, overlay del fondo, comportamiento de footer y consistencia móvil). Además, la implementación mantiene estilos locales extensos en lugar de priorizar utilidades Tailwind para estructura/presentación del componente.

El objetivo de esta change es cerrar la brecha visual con el mockup y reducir ambigüedad de estilos migrando a una aproximación Tailwind-first, sin romper la lógica existente de `LoginForm` ni las reglas del sistema de diseño documentado.

## Goals / Non-Goals

**Goals:**
- Replicar con alta fidelidad el layout del mockup `inicio-sesion.png`.
- Implementar el login con utilidades Tailwind para layout/espaciado/alineación visual.
- Garantizar iconos dentro de los campos input (email con icono de carta, password con icono/toggle alineado).
- Aplicar capa transparente sobre la imagen de fondo usando el patrón de overlay del banner de Inicio (`--banner-overlay-start/end`).
- Mantener footer full-width, abajo sticky, con textos en una línea cuando el ancho lo permita.
- Generar una nueva imagen de fondo optimizada y utilizarla en `/login`.

**Non-Goals:**
- No cambiar endpoints, contratos ni validación de autenticación.
- No introducir nuevas dependencias npm para UI.
- No rediseñar otras páginas fuera de `/login`.
- No alterar semántica de tests de autenticación existente.

## Decisions

### 1) Login en carpeta dedicada
**Decisión:** mantener `src/pages/login/index.astro` como fuente única de la ruta `/login`.

**Rationale:** facilita organización y escalabilidad (subcomponentes/assets/metadata futuros) y responde a la necesidad de tener carpeta propia para login.

### 2) Tailwind-first para layout visual
**Decisión:** mover layout estructural de login (contenedor, card, footer, overlays, wrappers de input) a clases Tailwind inline en el markup, dejando CSS local mínimo solo para casos no triviales.

**Rationale:** reduce divergencias entre plantilla y estilos, mejora trazabilidad de ajustes pixel-level y cumple la solicitud explícita de usar Tailwind en lugar de clases CSS dedicadas.

**Alternativas consideradas:**
- Mantener CSS local grande: rechazado por dificultad de depuración de alineaciones.
- Migración completa a componente React estilado: rechazado por sobrecosto y riesgo funcional.

### 3) Overlay igual patrón banner Inicio
**Decisión:** usar overlay gradiente tokenizado con `linear-gradient(135deg, var(--banner-overlay-start), var(--banner-overlay-end))` encima de la imagen de fondo.

**Rationale:** alinea login con el lenguaje visual existente del proyecto y elimina inconsistencias de capas “semi-opacas” ad hoc.

### 4) Iconos dentro del input (alineación determinística)
**Decisión:** cada input usa wrapper relativo y el icono se posiciona absoluto dentro del mismo contenedor con padding-right suficiente en el input.

**Rationale:** evita desalineación entre navegadores y asegura que el icono siempre quede dentro del borde del input.

**Reglas específicas:**
- Email: icono `mail`.
- Password: toggle/icono en misma zona derecha sin solape.

### 5) Card y footer
**Decisión:**
- Card sin blur de fondo (color sólido de superficie + borde/sombra controlada).
- Footer sticky inferior, ancho completo, con `nowrap` y fallback de ellipsis.

**Rationale:** responde directamente a defectos reportados (blur no deseado, footer no sticky/full-width, quiebres de línea innecesarios).

### 6) Nueva imagen de fondo generada
**Decisión:** generar asset dedicado (`src/assets/img/login-bg-generated.webp`) en resolución desktop-first, optimizado para carga estática.

**Rationale:** desacopla el login de imágenes reutilizadas de otras secciones y permite tuning visual exacto al mockup.

## Risks / Trade-offs

- **[Riesgo] Tailwind + CSS residual mezclados generen inconsistencia** → Mitigación: definir claramente qué queda en Tailwind y qué en CSS mínimo; remover clases legacy.
- **[Riesgo] Overlay reduzca demasiado contraste de la imagen** → Mitigación: ajustar stop/colors por tokens y validar visualmente en mobile/desktop.
- **[Riesgo] Icono/toggle de password interfieran entre sí** → Mitigación: reservar un único slot derecho por campo y pruebas de foco/teclado.
- **[Trade-off] Fidelidad exacta vs pureza del sistema flat** → Aceptado: priorizar mockup, manteniendo tokens y convenciones de proyecto.

## Migration Plan

1. Crear/optimizar nueva imagen de fondo y referenciarla en login.
2. Refactor de `src/pages/login/index.astro` a Tailwind-first para estructura visual.
3. Ajustar `LoginForm.tsx` para iconos internos y alineación precisa.
4. Validar footer sticky/full-width + comportamiento responsive.
5. Ejecutar `pnpm build`, `pnpm test` y validaciones estáticas.
6. Documentar contratos visuales finales en `docs/design-components.md`.

## Open Questions

- ¿El nuevo fondo generado debe derivar de `inicio-sesion.png` (estilo similar) o puede ser una composición completamente nueva con la misma intención visual?
- ¿Se acepta usar `Image` de Astro para el background en login o se prefiere `<img>`/`background-image` directo para control estricto de layout?
