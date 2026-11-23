# Design

## Context

See `proposal.md` — Why for the motivation. This document records the verified
version matrix, the TypeScript 7 blockers, and the config-level migration for
ESLint 10.

Current state (verified against `pnpm list --depth 0` and the npm registry on
2026-11-23):

| Package | `apps/api` | `apps/web` | `apps/admin` | `packages/shared-types` |
|---------|-----------|------------|--------------|--------------------------|
| typescript | 6.0.3 | 5.9.3 | 5.9.3 | 5.7.3 |
| eslint | 9.39.5 | — | — | — |
| @eslint/js | 9.39.5 | — | — | — |
| typescript-eslint | 8.73.0 | — | — | — |
| globals | 15.15.0 | — | — | — |
| eslint-config-prettier | 10.1.8 | — | — | — |
| eslint-plugin-prettier | 5.5.7 | — | — | — |
| prettier | 3.10.1 | — | — | — |
| @eslint/eslintrc | 3.3.7 | — | — | — |
| @astrojs/check | — | 0.9.9 | 0.9.9 | — |

Registry latest at the same date: `typescript` 7.0.2, `eslint` 10.15.0,
`@eslint/js` 10.0.1, `typescript-eslint` 8.73.0, `globals` 17.14.0,
`eslint-config-prettier` 10.1.8, `eslint-plugin-prettier` 5.5.7, `prettier`
3.10.1, `@eslint/eslintrc` 3.3.7, `@astrojs/check` 0.9.12.

The API is a CommonJS NestJS app (`module: commonjs`,
`moduleResolution: node10`, `ignoreDeprecations: "6.0"`) built with `nest build`
and tested with `ts-jest`. Web/admin are Astro 7.4.13 apps with TypeScript used
only for `@astrojs/check`.

## Goals / Non-Goals

**Goals:**

- Move the API lint stack to ESLint 10 with the smallest configuration delta.
- Move web/admin to the highest TypeScript major their Astro checker declares
  support for, backed by a verification gate.
- Record the TypeScript 7 blocker with exact peer evidence so it is not
  re-litigated every upgrade cycle.
- Make the anti-drift test cover TypeScript and ESLint, not only runtime and
  framework majors.

**Non-Goals:**

- Migrating the API from CommonJS/`node10` to ESM/`nodenext`. This is a
  prerequisite for TS 7 and belongs in its own change.
- Upgrading `packages/shared-types` (`typescript ^5.7.3`); separate follow-up.
- Adding ESLint/lint tooling to `apps/web` or `apps/admin`; explicitly out of
  scope.
- Changing existing lint rules or adopting stylistic rule sets beyond what
  ESLint 10 requires.
- Editing any file under `apps/*/src` or `packages/*/src`.

## Decisions

### D1 — API TypeScript stays on 6.0.3; TypeScript 7 is blocked

TypeScript 7.0.2 is published and stable, but every relevant consumer still
declares an upper bound below 7 or below 6.1:

| Consumer | Verified peer range | TS 6.0.3 | TS 7.0.2 |
|----------|--------------------|----------|----------|
| `typescript-eslint@8.73.0` | `>=4.8.4 <6.1.0` | allowed | blocked |
| `@nestjs/schematics@12.0.16` | `^6.0.0` | allowed | blocked |
| `ts-jest@29.4.15` | `>=4.3 <7` | allowed | blocked |
| `@astrojs/check@0.9.9` / `0.9.12` | `^5.0.0 \|\| ^6.0.0` | allowed | blocked |

In addition, TS 7 turns the API's `moduleResolution: node10` and
`ignoreDeprecations: "6.0"` into hard errors, so the API would need a
module-resolution migration before any version bump. Forcing TS 7 with
`pnpm.overrides` was rejected: it violates the declared peer ranges and breaks
`ts-jest` and `typescript-eslint` at runtime.

### D2 — Web/admin TypeScript moves to 6.0.3, gated and reversible

`@astrojs/check` 0.9.9 (installed) and 0.9.12 (latest) both declare
`typescript ^5.0.0 || ^6.0.0`. They do **not** allow TS 7. The correct target is
therefore TS 6.0.3, not 5.9.3. This corrects the earlier assumption that Astro
requires TS 5.x.

TS 6 deprecates `baseUrl`, and both web/admin tsconfigs currently set
`"baseUrl": "."`. Their `paths` entry (`"@/*": ["./src/*"]`) already resolves
relative to the tsconfig directory without `baseUrl`, so the migration removes
`baseUrl` and keeps `paths`. Because `astro check` is the only consumer, the
change is gated on `astro check`, build, and tests; if the gate fails, both apps
revert to `^5.9.3` and the failure is recorded as a blocker.

### D3 — ESLint 10 with `@eslint/js` 10, keep `typescript-eslint` 8.73.0

`eslint@10.15.0` is the current stable line (`maintenance` tag stays on 9.39.5).
`typescript-eslint@8.73.0` explicitly declares
`eslint: "^8.57.0 || ^9.0.0 || ^10.0.0"`, so no v9 is required. `@eslint/js`
must move to 10.x because ESLint 10 no longer ships it as a direct dependency
and its config objects are version-coupled. `globals` moves to 17.14.0. The
remaining Prettier packages are already at latest and stay.

Alternatives considered:

- **Keep ESLint 9 and wait for typescript-eslint v9**: no stable v9 exists and
  v8.73 already supports ESLint 10, so waiting buys nothing.
- **Pin ESLint 10.0.0 instead of 10.15.0**: no benefit; patches fix migration
  regressions and keep the same major.

### D4 — Absorb ESLint 10 behaviour in `eslint.config.mjs`, never in source

ESLint 10 breaking changes that affect this project:

1. **Legacy eslintrc removed** — the API already uses flat config; no action
   beyond confirming no `.eslintrc*` file exists.
2. **`eslint:recommended` adds `no-unassigned-vars`,
   `no-useless-assignment`, `preserve-caught-error`** — if these flag existing
   code, disable the specific rule in the `rules` block of
   `apps/api/eslint.config.mjs` with a comment referencing this change, instead
   of editing `apps/api/src`.
3. **Config lookup starts from each linted file** — the single root
   `eslint.config.mjs` is still found; no change.
4. **JSX reference tracking** — no JSX in `apps/api`; no impact.
5. **`eslint-env` comments are errors** — grep and remove if any remain
   (comment-only change, allowed).
6. **Node floor** — ESLint 10 requires Node `^20.19 || ^22.13 || >=24`; Node
   26.13.1 satisfies it.

The API config also carries the stale Nest template value
`languageOptions.ecmaVersion: 5`. It is updated to `latest` so parsing is not
constrained by an obsolete target; the TypeScript parser still governs `.ts`
syntax. If that produces new findings, revert to `2022` and record why.

### D5 — Anti-drift assertions derive majors from manifests

The test keeps its existing `majorOf` helper and asserts major equality between
manifests and docs, not hardcoded patch versions, except where
`openspec/project.md` intentionally records exact ranges. New assertions:

- API TypeScript major is 6 and the API standards declare the exact installed
  range.
- Web and admin TypeScript majors are equal and match the frontend standards.
- API ESLint major is 10, `@eslint/js` major is 10, and `openspec/project.md`
  records the exact ESLint/`@eslint/js`/`typescript-eslint` ranges.
- `openspec/project.md` contains the TS 7 blocker record (the blocker can be
  asserted by a stable marker string such as `TypeScript 7` plus a
  `typescript-eslint` peer mention).

### D6 — Documentation is aligned after installation, before green

The docs are updated only after the installed versions are confirmed, so the
documented values are facts rather than intentions. The red anti-drift test is
written first and is expected to fail until the documentation task lands.

## Risks / Trade-offs

- **[ESLint 10 recommended rules flag production code]** → Disable only the new
  rule(s) in `eslint.config.mjs` with a documented rationale; never edit
  `apps/api/src`. Escalate before touching source.
- **[Astro checker rejects TS 6 in practice despite the peer range]** → The
  gate (`astro check` + build + tests) catches it; roll back web/admin to
  `^5.9.3`, record the blocker in `openspec/project.md`, and keep the API on
  TS 6.
- **[`baseUrl` removal changes `@/*` resolution]** → `paths` values are already
  relative to the tsconfig; verify with `astro check` and a production build
  before declaring green.
- **[`typescript-eslint` 8.73 upper bound `<6.1.0`]** → A future TypeScript 6.1
  patch would fall outside the peer range; the caret range on TypeScript keeps
  installs at 6.0.x and the blocker record flags the constraint.
- **[`globals` 17 renames or removes an environment key]** → The config uses
  only `globals.node` and `globals.jest`; verify both exist after install and
  fall back to explicit globals if needed.
- **[`pnpm -F @webastro/api lint` runs `eslint --fix`]** → The verification gate
  uses the non-fix `eslint` invocation to guarantee zero source edits. If the
  `lint` script is used, `git diff --stat` must be empty under `apps/api/src`.
- **[Lockfile churn includes unrelated transitives]** → Review
  `git diff --stat pnpm-lock.yaml` and confirm only tooling packages moved.

## Migration Plan

1. Baseline: record `pnpm -r build` and `pnpm -r test` results.
2. Red: add anti-drift assertions; run the static validation suite and confirm
   the new assertions fail for version mismatch only.
3. ESLint 10: update `apps/api/package.json` ranges, install (user-run),
   adjust `eslint.config.mjs`, lint with zero errors.
4. TypeScript web/admin: install TS 6 (user-run), remove `baseUrl` from both
   tsconfigs, run `astro check`, build, and tests; roll back on failure.
5. Green: align docs and `openspec/project.md`; re-run anti-drift.
6. Full gates: build, all tests, API e2e, API lint, OpenSpec strict.
7. Rollback: restore the pre-change manifests, `pnpm-lock.yaml`, eslint/tsconfig
   files, test, and docs, then `pnpm install --frozen-lockfile` and re-run the
   baseline. No git history is rewritten.

## Open Questions

None that change the approach. `packages/shared-types` alignment and the API
`moduleResolution` migration are deliberately deferred to separate changes.
