---
description: Reglas globales de desarrollo para agentes IA (OpenCode, Codex, Cursor). Aplica siempre.
alwaysApply: true
---

# Base Standards — Agencia Zavando

## 1. Principios core

- **Pasos pequeños, uno a la vez**: Nunca avanzar más de un paso sin confirmar. Baby steps siempre.
- **TDD (Test-Driven Development)**: Escribir test fallido primero para cualquier funcionalidad nueva.
- **Tipado completo**: Todo el código debe estar completamente tipado (TypeScript, PHPDoc, etc.).
- **Nombres descriptivos**: Variables y funciones con nombres claros y específicos al dominio.
- **Cambios incrementales**: Preferir modificaciones pequeñas y revisables sobre cambios grandes.
- **Cuestionar supuestos**: Siempre preguntar ante ambigüedades antes de asumir.
- **Detectar patrones repetidos**: Identificar y señalar código duplicado o patrones que deben abstraerse.

## 2. Idioma del código

- **Todo en inglés**: Variables, funciones, clases, comentarios, mensajes de error, logs.
- **Documentación en español**: READMEs para el cliente, comentarios de negocio, tickets pueden ir en español.
- **Commits en inglés**: Siempre. Conventional commits format.
- **Nombres de base de datos en inglés**: Tablas, columnas, índices.

## 3. Estándares específicos por área

Para estándares detallados, leer los archivos correspondientes:

- [Backend Standards](docs/backend-standards.md) — API, base de datos, testing, seguridad
- [Frontend Standards](docs/frontend-standards.md) — Componentes, UI/UX, estado
- [Documentation Standards](docs/documentation-standards.md) — Estructura docs, OpenAPI, mantenimiento

## 4. Skills del proyecto

- Los skills viven en `ai-specs/skills/`.
- Cuando una solicitud coincida con la descripción de un skill, cargar y seguir el `SKILL.md` correspondiente automáticamente antes de continuar.
- Cargar también los archivos referenciados en la carpeta del skill cuando el skill los requiera.

Skills disponibles:
- `enrich-us` — Enriquecer user story vaga antes de planificar
- `using-git-worktrees` — Workspace aislado por feature
- `code-auditing` — Auditoría sistemática de calidad
- `commit` — Conventional commits y gestión de PR

## 5. Modelo de planning

Los flujos de Spec-Driven Development se ejecutan mediante los custom commands definidos en `opencode.json`:

| Comando | Propósito | Agente |
|---------|-----------|--------|
| `/enrich-us <TICKET>` | Enriquecer user story vaga antes de planificar | plan |
| `/opsx-explore [tema]` | Modo pensar: explorar ideas, investigar problemas | plan |
| `/opsx-propose <nombre>` | Crear change + artefactos (proposal/design/tasks) | plan |
| `/opsx-apply [nombre]` | Implementar tareas con TDD (una a la vez) | build |
| `/verify [nombre]` | Validar implementación contra escenarios | build |
| `/adversarial-review` | Auditoría 7-fases de calidad de código | reviewer |
| `/opsx-archive [nombre]` | Archivar change y sincronizar delta specs | build |
| `/commit` | Conventional commits y pull request | build |

El modelo para cada agente está definido en `opencode.json`. No hardcodear modelos aquí.

## 6. Integridad de artefactos y portabilidad

- **Fuente canónica**: Los artefactos reutilizables viven en `ai-specs/`.
- **Seguridad al renombrar**: Al renombrar o mover un archivo, verificar y actualizar todas las referencias antes de cerrar el cambio.
- **Un cambio es incompleto** si deja artefactos canónicos duplicados o referencias rotas.

## 7. Actualización de artefactos OpenSpec ante cambios post-apply

Si aparece un fix o cambio nuevo después de `/apply` y antes de `/archive`:

1. Actualizar primero los artefactos OpenSpec afectados (scenarios, requirements, tasks.md)
2. Si se necesita regenerar artefactos, ejecutar el paso OpenSpec correspondiente antes de codear
3. Solo implementar código después de que los artefactos reflejen el nuevo requerimiento
4. Re-ejecutar verificación contra artefactos actualizados antes de archivar

**No aplicar fixes directos en código sin actualizar OpenSpec primero.**

## 8. Contexto del proyecto (personalizar por proyecto)

> ⚠️ Esta sección DEBE ser actualizada al iniciar cada proyecto nuevo.

```
Repo: Monorepo pnpm (un solo repo, contexto SDD compartido en la raíz)
Layout: apps/api (NestJS) + apps/web (Astro). Contexto agentico en raíz: docs/, ai-specs/, openspec/, .opencode/
Stack API:        NestJS 11 + Firebase Auth + Firestore + Prisma + Swagger + Docker
Stack Frontend:   Astro 7 (SSG) + React 18 (islands) + Tailwind 4 + Playwright + Vitest
Arquitectura API: Clean Architecture (Modules + Services + Repositories)
Dominio:       API ligera para usuarios/roles, blog y captación de leads desde el sitio web
Cliente:       Agencia Digital Gabriel Zavando
Gestor:        pnpm workspaces (apps/*)
Convenciones:  Conventional Commits (commitlint)
Lenguaje código: English | Documentación cliente: Español (Latinoamericano neutro)
Mensajes API:   Español (Latinoamericano neutro)
```

## 9. Flujo OpenSpec (Spec-Driven Development)

Este proyecto usa **OpenSpec 1.4+** como sistema de gobernanza de cambios. Toda feature, fix o refactor significativo debe pasar por este flujo.

### Principios

1. **Nunca codear sin artefactos OpenSpec**: Antes de escribir código, el change debe tener al menos `proposal.md`, `design.md` y `tasks.md`.
2. **TDD obligatorio**: Escribir test fallido antes de implementar cada tarea.
3. **Una tarea a la vez**: Solo la primera tarea pendiente de `tasks.md` se implementa por ciclo de `/opsx-apply`.
4. **Actualizar docs antes de commit**: Si el change modifica API o modelo de datos, actualizar `docs/api-spec.yml` y `docs/data-model.md` antes de marcar la tarea como completada.
5. **No skips**: No saltarse pasos del flujo por presión de tiempo. Si el flujo no encaja, mejorar el flujo, no saltarlo.

### Estructura de artefactos

```
openspec/
├── config.yaml                     # Schema: spec-driven (verificar versión)
├── specs/                          # Capabilities base (emergen con archive)
│   └── <capability>/
│       └── spec.md
└── changes/
    ├── <change-name>/
    │   ├── .openspec.yaml          # Metadata del change
    │   ├── proposal.md             # Qué y por qué
    │   ├── design.md               # Cómo (decisiones técnicas)
    │   ├── tasks.md                # Lista de tareas TDD
    │   └── specs/                  # Delta specs (para sync al archive)
    └── archive/
        └── YYYY-MM-DD-<change-name>/   # Cambios archivados
```

### Flujo completo (SSD)

```
1. /enrich-us TICKET-ID         → Enriquecer ticket vago con criterios Gherkin
2. /opsx-propose <nombre>       → Crear change + generar proposal/design/tasks
3. /opsx-apply <nombre>          → Implementar tareas con TDD (una a la vez)
4. /verify <nombre>              → Validar implementación contra escenarios
5. /adversarial-review           → Auditoría 7-fases de calidad
6. /opsx-archive <nombre>        → Archivar + sincronizar delta specs a main
7. /commit                       → Conventional commits + PR
```

### CLI de OpenSpec (referencia)

```bash
npx openspec --version             # Versión instalada (debe ser 1.4+)
npx openspec list --json            # Listar cambios activos
npx openspec status --change <name> --json   # Estado de artefactos
npx openspec instructions <artifact> --change <name> --json  # Instrucciones
npx openspec new change <kebab-name>          # Crear nuevo cambio
npx openspec archive <change-name>           # Archivar cambio
npx openspec validate <name>                  # Validar cambio/spec
```

### Convenciones de nomenclatura

- **Change name**: kebab-case, descriptivo, relacionado al ticket (ej: `add-password-reset`, `fix-lead-duplicate-email`)
- **Capability**: sustantivo singular que representa dominio (ej: `auth`, `users`, `articles`, `leads`)
- **Commits**: conventional commits (type(scope): description)

### Reglas de archivos

- `docs/api-spec.yml` es la **fuente de verdad** para contratos HTTP.
- `docs/data-model.md` es la **fuente de verdad** para entidades y relaciones.
- `openspec/changes/<name>/tasks.md` es la **fuente de verdad** para tareas de implementación.
- Nunca hardcodear paths; usar referencias relativas desde la raíz del proyecto.
