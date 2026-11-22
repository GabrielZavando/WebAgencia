# Proposal

## Why

The monorepo's test toolchain is several majors behind: `vitest` 4.1.10 (declared
`^4.1.2`), `jest` 29.7.0, `@testing-library/jest-dom` 6.9.1, and `jsdom` 29.1.1.
`@testing-library/jest-dom` 8.x requires Vitest ≥ 5, and Vitest 5 moved `vite` to a
required peer dependency, so the DOM-matching and runner upgrades are coupled. Staying
on Vitest 4 blocks those upgrades and keeps a growing gap with the upcoming Astro/Nest
framework work. Node 26.13.1 (the pinned runtime) is supported by every target major,
so the upgrade is safe to perform now and gives the framework upgrades a supported,
reproducible test baseline.

## What Changes

- **BREAKING (dev-only)**: upgrade `vitest` 4.1.10 → 5.1.1 in `apps/web` and
  `apps/admin`, in lockstep with `@vitest/coverage-v8` (its peer requires the exact
  Vitest version).
- **BREAKING (dev-only)**: upgrade `jest` 29.7.0 → 30.5.2 and `@types/jest` 29 → 30 in
  `apps/api`; keep `ts-jest@^29.4.15` (its peer range already accepts Jest 30).
- **BREAKING (dev-only)**: upgrade `@testing-library/jest-dom` 6.9.1 → 8.0.0 (requires
  Vitest ≥ 5) and `jsdom` 29.1.1 → 31.0.1 in `apps/web` and `apps/admin`.
- Do **not** add `vite` or `@testing-library/dom` as explicit devDependencies: pnpm
  `auto-install-peers=true` already supplies them, and the `dependency-audit` validation
  tests only allow the declared package names, so an explicit entry would fail them.
- Align `docs/frontend-standards.md` and `docs/backend-standards.md` with the new
  versions, and refresh the testing rows of `openspec/project.md`.
- Extend the anti-drift validation test so documented test-runner majors must match the
  real `package.json` files.
- No production/runtime code, HTTP API, data model, or user-facing behavior changes.

## Capabilities

### New Capabilities

- None. This is a tooling and documentation change; it introduces no new system
  behavior.

### Modified Capabilities

- None. The `sdd-project-context` requirements already mandate that documentation
  versions match `package.json` and that an anti-drift test enforces it; this change
  exercises those requirements without changing their intent. `skip_specs: true` is set
  in `.openspec.yaml` because no spec-level behavior changes.

## Impact

- **Dependencies / lockfile**: `apps/web/package.json`, `apps/admin/package.json`,
  `apps/api/package.json`, `pnpm-lock.yaml`. Peer additions (`vite`, `@testing-library/dom`)
  are resolved by pnpm and must not be written to the manifests.
- **Docs**: `docs/frontend-standards.md`, `docs/backend-standards.md`,
  `openspec/project.md`.
- **Tests (non-production)**: `apps/web/tests/validation/anti-drift.test.ts` gains
  test-runner version assertions.
- **Not affected**: `apps/*/src/`, `packages/*/src/`, API contracts in
  `docs/api-spec.yml`, `docs/data-model.md`, deployment configuration, CI workflow
  (Node 26 already pinned).
- **Rollback**: revert the four `package.json`/`openspec` files plus `pnpm-lock.yaml`
  and run `pnpm install`.
