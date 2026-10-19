# Proposal

## Why

Specboot quedó obsoleto: OpenSpec es el único framework SDD del repo, pero la rama `chore/remove-specboot` aún arrastra tooling de Specboot, specs con formato que rompía la validación estricta, y la documentación declara OpenSpec 1.4 mientras la herramienta instalada es 1.14.3.

## What Changes

- Eliminar el tooling de Specboot: `specboot.sh`, `check-refs.sh`, targets `validate`/`refcheck` del `Makefile`, y los steps `Specboot context validation` / `Reference integrity` del CI.
- Eliminar `apps/web/IMPLEMENTACION_COMPLETADA.md` (registro histórico de la era Specboot).
- Corregir el formato de 6 specs preexistentes (`## Purpose`, `## Requirements`, `#### Scenario:`) para que `openspec validate --all --strict` pase 19/19.
- Alinear CI y `make audit` a `openspec validate --all --strict`.
- Bump `OpenSpec 1.4` → `1.14` en docs y metadatos.
- Regenerar `.opencode/` a 1.14.3 (añade el workflow `opsx-sync`).
- Documentar en `CHANGELOG.md`.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- Ninguna (cambio de tooling/docs/refactor, sin cambio de comportamiento).

## Impact

- Tooling/metadata: `Makefile`, `.github/workflows/ci.yml`, `CHANGELOG.md`, `README.md`, `AGENTS.md`, `package.json`, `opencode.json`, `ai-specs/README.md`, `docs/base-standards.md`, `apps/api/README.md`.
- Specs: `openspec/specs/**` (6 correcciones de formato).
- Elimina `specboot.sh`, `check-refs.sh`, `apps/web/IMPLEMENTACION_COMPLETADA.md`.
- Sin impacto en runtime de API ni frontend.
