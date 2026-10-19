# Design

## Context

El repo adoptó OpenSpec y abandonó Specboot, pero la eliminación quedó a medias: archivos, targets y steps de Specboot seguían presentes, y 6 specs no cumplían el formato estricto de OpenSpec 1.14. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**

- Dejar OpenSpec como único framework SDD, sin rastros de Specboot.
- `openspec validate --all --strict` en verde (19/19) y ejecutado en CI.
- Documentación y metadatos alineados a 1.14.

**Non-Goals:**

- Cambiar el comportamiento de la API o del frontend.
- Reemplazar la validación por referencias (se elimina, no se sustituye).
- Editar `.opencode/` a mano.

## Decisions

1. **Eliminar Specboot en vez de portarlo**: OpenSpec 1.14 cubre la gobernanza de specs; mantener dos herramientas duplica mantenimiento. Alternativa descartada: conservar `check-refs.sh` como script suelto.
2. **`skip_specs: true` en `.openspec.yaml`**: el cambio no altera comportamiento de specs; las correcciones a specs son de formato/metadata (Purpose, headers), no deltas de requisitos. Alternativa descartada: delta specs artificiales.
3. **Gate estricto en CI y `make audit`**: usar `pnpm exec openspec validate --all --strict` (falla el build si una spec se degrada). Alternativa descartada: invocación no bloqueante `npx --yes ... || true`.
4. **Regenerar `.opencode/` con `openspec update`**: deja las skills/comandos en 1.14.3 y añade `opsx-sync`. Alternativa descartada: edición manual.

## Risks / Trade-offs

- **[Riesgo] `--all --strict` bloquea PRs por specs preexistentes** → **Mitigación**: las 6 specs ya quedaron en verde; el gate protege contra regresiones.
- **[Trade-off] Eliminar `IMPLEMENTACION_COMPLETADA.md` borra un registro histórico** → se documenta la eliminación en `CHANGELOG.md`.
- **[Riesgo] Referencias residuales a Specboot** → **Mitigación**: grep final `specboot|check-refs` solo debe aparecer en la sección `Removed` del CHANGELOG.
