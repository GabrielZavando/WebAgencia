## Context

The WebAstro monorepo (Agencia Digital Gabriel Zavando) has multiple dependencies with minor/patch updates available across three workspaces (`@webastro/api`, `@webastro/web`, `@webastro/admin`) plus the root devDependency `@fission-ai/openspec`. The current `pnpm -r outdated` output shows 57 outdated packages, of which 23 are major-version jumps. This change handles only the safe minor/patch updates, explicitly excluding major jumps and two deferred packages (Astro, OpenSpec).

## Goals / Non-Goals

**Goals:**
- Update all listed minor/patch dependencies to their latest versions.
- Keep `pnpm-lock.yaml` consistent with `package.json` changes.
- Verify all existing tests pass after each batch of updates.
- Update documentation only if it explicitly declares a changed version.
- Establish a repeatable pattern: update → verify tests → update docs → commit.

**Non-Goals:**
- No major-version jumps (NestJS 11→12, React 18→19, TypeScript 5→7, Vitest 4→5, ESLint 9→10, etc.).
- No Astro update (7.4.5 → 7.4.13 requires Node engine bump to >= 22.23.4; deferred to change 2).
- No OpenSpec update (1.15.0 → 2.1.1; deferred to a later change).
- No new features, no API contract changes, no data model changes.

## Decisions

| Decision | Rationale | Alternatives considered |
|----------|-----------|------------------------|
| Update per-package using `pnpm update <pkg>@latest` | Precise control; avoids accidentally pulling major jumps. | `pnpm update --latest` (too broad, risks major jumps); interactive `pnpm update` (slower, error-prone). |
| Batch updates by risk level (build tooling → testing → API → admin UI → linting) | Lower-risk batches first; if a breakage occurs, it's isolated and easier to roll back. | Single monolithic `pnpm update` (high blast radius, hard to bisect failures). |
| Exclude Astro and OpenSpec from this change | Astro's latest requires Node >= 22.23.4 (project declares >= 22.12.0); OpenSpec is a separate governance concern. | Include them anyway (would require engine-constraint change and OpenSpec artifact migration, out of scope). |
| No new tests for this change | Dependency updates don't add behavior; existing test suite is the regression net. | Add version-pinning tests (over-engineering for a maintenance change). |

## Risks / Trade-offs

- [Risk] A patch release introduces a behavioral regression not caught by existing tests. → Mitigation: run full `pnpm -r test` after each batch; if failures appear, pin the offending package and investigate.
- [Risk] `pnpm update` resolves transitive dependencies differently than expected, introducing an unintended major jump. → Mitigation: inspect `pnpm-lock.yaml` diff before committing; reject any major version change in the lockfile.
- [Risk] Tailwind 4.2.x → 4.3.x may require a doc update in `docs/frontend-standards.md` which references Tailwind 4.2.x. → Mitigation: check docs for explicit version strings after updating; update only if a hard-coded version reference exists.
- [Risk] `@types/react` 19.2.x → 19.3.0 with React still at 18.3.x may cause type mismatches in admin React islands. → Mitigation: `@types/react` is a devDependency for type-checking only; admin build uses React 18 runtime. Monitor admin build output.

## Migration Plan

1. Apply updates batch by batch (see `tasks.md`).
2. After each batch, run `pnpm -r test` and `pnpm build`.
3. If all green, proceed to next batch; if red, roll back that batch's `package.json` + `pnpm-lock.yaml` changes and investigate.
4. After all batches, run `openspec validate --all --strict` and the anti-drift validation test.
5. Commit with conventional commit message.

## Open Questions

- None identified.
