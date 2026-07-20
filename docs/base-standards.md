---
description: Reglas globales de desarrollo para agentes IA (OpenCode). Aplica siempre.
alwaysApply: true
---

# Base Standards — WebAgenciaAstro

## 1. Principios core

- **Pasos pequeños, uno a la vez**: Nunca avanzar más de un paso sin confirmar. Baby steps siempre.
- **TDD (Test-Driven Development)**: Escribir test fallido primero para cualquier funcionalidad nueva.
- **Tipado completo**: Todo el código debe estar completamente tipado (TypeScript).
- **Nombres descriptivos**: Variables y funciones con nombres claros y específicos al dominio.
- **Cambios incrementales**: Preferir modificaciones pequeñas y revisables sobre cambios grandes.
- **Cuestionar supuestos**: Siempre preguntar ante ambigüedades antes de asumir.
- **Detectar patrones repetidos**: Identificar y señalar código duplicado o patrones que deben abstraerse.
- **Spec-Driven Development**: Antes de codear, generar artefactos OpenSpec (`proposal.md`, `specs/`, `design.md`, `tasks.md`). Sólo implementar después de alinear specs.
- **Brownfield-aware**: Este proyecto tiene código maduro. Los cambios no deben introducir dependencias nuevas sin justificación explícita aprobada vía OpenSpec.

## 2. Idioma del código

- **Código en inglés**: Variables, funciones, clases, interfaces, tipos, mensajes de error, logs.
- **UI en español**: Todo lo visible para el usuario final (textos, labels, mensajes de error form).
- **Documentación interna en español**: READMEs para cliente, comentarios de negocio, tickets.
- **Commits en inglés**: Conventional Commits format.
- **Nombres de campos de datos/API en inglés**: Sigan el contrato del backend NestJS.

## 3. Estándares específicos por área

Para estándares detallados, leer los archivos correspondientes:

- [Backend Standards](docs/backend-standards.md) — Contrato de la API consumida (este proyecto NO es backend)
- [Frontend Standards](docs/frontend-standards.md) — Astro 5 + Tailwind 4 + React Islands opcional
- [Documentation Standards](docs/documentation-standards.md) — Estructura docs, OpenAPI, mantenimiento

## 4. Skills del proyecto

- Los skills viven en `ai-specs/skills/` y en `.opencode/skills/` (generados por `openspec init`).
- Cuando una solicitud coincida con la descripción de un skill, cargar y seguir el `SKILL.md` correspondiente automáticamente antes de continuar.
- Cargar también los archivos referenciados en la carpeta del skill cuando el skill los requiera.

Skills disponibles en `ai-specs/skills/`:
- `enrich-us` — Enriquecer user story vaga antes de planificar
- `using-git-worktrees` — Workspace aislado por feature
- `code-auditing` — Auditoría sistemática de calidad
- `commit` — Conventional commits y gestión de PR
- `deploy` — Release, version bump, rollback
- `onboarding` — Setup para nuevos desarrolladores

Skills OpenSpec nativos (generados automáticamente en `.opencode/skills/`):
- `openspec-explore`
- `openspec-propose`
- `openspec-apply-change`
- `openspec-archive-change`

> NOTA: `.agents/skills/frontend-design` pertenece al usuario (no al boilerplate) y no debe modificarse.

## 5. Modelo de planning

Los flujos de planning se ejecutan mediante los custom commands definidos por OpenSpec:

- `/opsx:explore` — Pensar la solución antes de planear
- `/opsx:propose <nombre>` — Generar artifacts OpenSpec (proposal + specs delta + design + tasks)
- `/opsx:apply` — Implementar tasks una por una con TDD
- `/opsx:verify` — Validar implementación contra scenarios
- `/opsx:archive` — Archivar cambio completado
- `/opsx:adversarial-review` (opcional) — Auditoría 7 fases

**Modelo agnóstico**: `opencode.json` NO contiene campo `model`. OpenCode usará el modelo activo del editor en cada sesión. Los agentes no deben hardcodear nombres de modelo en código o documentación.

## 6. Integridad de symlinks (N/A este proyecto)

Este proyecto trabaja **únicamente con OpenCode**. No se usan las carpetas `.claude/` o `.cursor/`. Los symlinks multi-agente definidos en Specboot original no aplican.

## 7. Actualización de artefactos OpenSpec ante cambios post-apply

Si aparece un fix o cambio nuevo después de `/opsx:apply` y antes de `/opsx:archive`:

1. Actualizar primero los artefactos OpenSpec afectados (scenarios, requirements, tasks.md)
2. Si se necesita regenerar artefactos, ejecutar el paso OpenSpec correspondiente antes de codear
3. Solo implementar código después de que los artefactos reflejen el nuevo requerimiento
4. Re-ejecutar verificación contra artefactos actualizados antes de archivar

**No aplicar fixes directos en código sin actualizar OpenSpec primero.**

## 8. Contexto del proyecto (WebAgenciaAstro)

```
Stack: Astro 5 (output: 'static', SSG puro, sin adapter) + Tailwind 4 + Vitest + Playwright + pnpm 10
Arquitectura: SSG multi-página con un endpoint dinámico (/sitemap.xml) y una sección CSR (blog).
Islands: React 18 vía @astrojs/react — mínimo, sólo para componentes que requieren hidratación.
Dominio: Landing page B2B para freelance de desarrollo web (Chile).
Backend: NO es backend este repo. Consumimos API NestJS vía fetch. Ver docs/api-spec.yml.
Cliente: Gabriel Zavando (gabrielzavando.cl)
Deploy: Hostinger (FTP). pnpm build → dist/ → subir a public_html.
Convenciones de commits: Conventional Commits (enforced por commitlint)
Lenguaje del código: English
Lenguaje de UI/documentación cliente: Español
```
