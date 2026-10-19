# Tasks

## 1. Eliminar tooling de Specboot

- [x] 1.1 Borrar `specboot.sh` y `check-refs.sh` y verificar que `grep -rin "specboot\|check-refs"` no devuelve resultados (excluyendo `.opencode/`)
- [x] 1.2 Quitar los steps `Specboot context validation` y `Reference integrity` de `.github/workflows/ci.yml` y verificar el YAML con `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`
- [x] 1.3 Quitar los targets `validate`/`refcheck` del `Makefile` (incluidos `.PHONY`, `help` y la cadena `ci: install build lint test`) y verificar `make -n ci`
- [x] 1.4 Borrar `apps/web/IMPLEMENTACION_COMPLETADA.md` y verificar con `ls apps/web/IMPLEMENTACION_COMPLETADA.md` que no existe

## 2. Gate de validación OpenSpec

- [x] 2.1 Añadir el step `Validate OpenSpec specs` (`pnpm exec openspec validate --all --strict`) en CI tras `Install` y verificar el YAML
- [x] 2.2 Alinear el target `audit` del `Makefile` al comando estricto y verificar `make -n audit`

## 3. Alinear specs a 1.14

- [x] 3.1 Corregir el formato de las 6 specs (`article-tiptap-content`, `security-hardening`, `landing-public`, `firestore-indexes`, `login-logo-navigation`, `project-onboarding`) y verificar `openspec validate --all --strict` = 19/19

## 4. Versionado y docs

- [x] 4.1 Bump `OpenSpec 1.4` → `1.14` en `README.md`, `AGENTS.md`, `apps/api/README.md`, `ai-specs/README.md`, `docs/base-standards.md`, `package.json`, `opencode.json` y verificar que `grep -rn "OpenSpec 1\.4\b"` no devuelve resultados
- [x] 4.2 Regenerar `.opencode/` con `openspec update` y verificar que existen `.opencode/commands/opsx-sync.md` y `.opencode/skills/openspec-sync-specs/`
- [x] 4.3 Añadir al `CHANGELOG.md` las secciones `Removed`, `Fixed` y `Changed` documentadas en la tarea, y verificar `grep -n "^### \(Removed\|Fixed\|Changed\)" CHANGELOG.md`

## 5. Verificación

- [x] 5.1 Correr los 7 checks finales (validate 19/19, CI YAML OK, Makefile sin indentación con espacios, `package.json` JSON válido, greps de `specboot`/`1.4`, `ls` de archivos borrados) y verificar que todos pasan

## Workflow follow-up

- Archivar el change con `/opsx-archive remove-specboot-align-openspec-1-14` una vez satisfechos los requisitos de review.
- Verificar el resultado archivado (`skip_specs: true`, sin delta specs).
