# Design

## Context

See `proposal.md` — Why. Current state verified during discovery:

- Root `package.json` declares `engines.node: ">=22.12.0"`; the local machine
  runs Node **22.23.5** and `.github/workflows/ci.yml` / `deploy.yml` pin
  `node-version: 22`.
- `apps/web/package.json` and `apps/admin/package.json` declare `astro: ^7.2.1`;
  `pnpm-lock.yaml` resolves **7.4.5**. `apps/admin` already declares
  `@astrojs/node: ^11.1.14` (lockfile 11.1.14), so that dependency only needs
  verification, not a version change.
- `astro@7.4.13` exists and is the latest 7.x; its `engines` require
  `node >=22.23.4`. Node **26.13.1** is the current LTS ("Lithium",
  released 2026-11-10).
- `apps/web/tests/validation/anti-drift.test.ts` derives the expected Astro
  version from `apps/web/package.json` (`astro.replace('^','')`) and asserts
  it appears in `README.md` and `docs/frontend-standards.md`. It does not
  currently check `engines.node`, CI workflows, or `docs/base-standards.md`.
- Stale drift found: `docs/backend-standards.md` still says
  `Runtime: Node.js 20 LTS`.

## Goals / Non-Goals

**Goals:**
- Single Node baseline: `>=26.13.1` declared in root `engines.node`, CI, and
  `.nvmrc`.
- Astro at the latest 7.x patch (`^7.4.13`) in both Astro apps, lockfile
  resolving 7.4.13.
- Documentation and the anti-drift test agree with the new versions.
- Existing test suite remains green (baseline: 358 tests).

**Non-Goals:**
- No Astro major (8.x) or any other major bump (NestJS, React, TypeScript,
  Vitest, OpenSpec).
- No production source changes, no API contract or data-model changes.
- No refactor of the anti-drift test beyond adding engine/CI coverage.

## Decisions

| Decision | Rationale | Alternatives considered |
|----------|-----------|------------------------|
| Target `engines.node: ">=26.13.1"` (LTS) instead of the `>=22.23.4` minimum Astro needs | Matches the user directive, gives a single supported baseline, and unblocks future majors that require newer Node features. 26.13.1 is the current LTS. | `>=22.23.4` (minimal, but leaves the project on an older baseline and re-opens the blocker soon). |
| Use caret ranges `astro: "^7.4.13"` (not exact pins) | Consistent with the repo's existing caret convention; `pnpm-lock.yaml` still pins the exact resolved version. | Exact pin `7.4.13` (diverges from every other dependency). |
| Update CI workflows to `node-version: 26` and add `.nvmrc` with `26.13.1` | Keeps local, CI, and docs aligned; without it `engines.node` would be contradicted by CI. Approved by the user. | Engine-only change with CI as a follow-up (leaves a documented inconsistency). |
| Extend `anti-drift.test.ts` for engine + CI + base-standards | TDD: the test encodes the new contract and prevents future doc drift; reuses the existing test precedent. | Rely on manual review (already drifted once for `docs/backend-standards.md`). |
| Bump `@astrojs/node` only if resolution changes | Already `^11.1.14`; changing it would create a no-op diff. | Force a redundant version edit (noise). |
| Sequence: test (red) → manifests → lockfile → docs → green | TDD order required by project standards and lets each failure localize. | Big-bang update (harder to bisect). |

## Risks / Trade-offs

- [Risk] Dev machines and Coolify still run Node 22, so `pnpm install` emits
  `ERR_PNPM_UNSUPPORTED_ENGINE` warnings (fatal only under `engine-strict`).
  → Mitigation: document the Node 26 upgrade as a prerequisite; add `.nvmrc`;
  update CI; verify `node --version` is 26.13.1 before install.
- [Risk] Coolify build/runtime image may not offer Node 26 yet.
  → Mitigation: confirm the Nixpacks/Node image tag supports 26.13.1 during
  verification; rollback is a one-line `engines` revert.
- [Risk] Astro 7.4.5 → 7.4.13 patch introduces a regression not covered by
  tests. → Mitigation: run `pnpm -r test` and both Astro builds; if red,
  bisect to the offending patch.
- [Risk] Lockfile churn from a Node 26 baseline pulls unrelated transitive
  updates. → Mitigation: scope commands to `astro` / `@astrojs/node`; inspect
  the `pnpm-lock.yaml` diff before committing.
- [Risk] Test-count baseline (358) is asserted in tasks and may drift if
  unrelated work lands first. → Mitigation: treat 358 as the expected baseline
  at the time of writing; re-read the actual count if it differs and note it.
- [Risk] Under Node 26, the Vitest jsdom environment may not expose
  `localStorage`, so `apps/web/src/utils/theme.spec.ts` fails with
  `Cannot read properties of undefined (reading 'clear')`.
  → Mitigation: install an in-memory `localStorage` mock in the spec before
  `describe`, independent of the jsdom global (post-apply fix).

## Migration Plan

1. Write the failing anti-drift assertions (engine, CI, base-standards).
2. Update `apps/web` / `apps/admin` manifests and root `engines.node`; add
   `.nvmrc`; update CI workflows.
3. Run the exact `pnpm update` commands (see `tasks.md`) to regenerate
   `pnpm-lock.yaml`; verify resolved Astro is 7.4.13.
4. Update documentation (`README.md`, `docs/frontend-standards.md`,
   `docs/base-standards.md`, `docs/backend-standards.md`, `openspec/project.md`).
5. Run `pnpm -r test`, builds, and `pnpm exec openspec validate --all --strict`.
6. Rollback: revert the manifests, lockfile, docs, and CI edits; reinstall on
   the previous Node baseline. No data migration involved.

## Verification

Final state confirmed after apply:

- `pnpm -r test` on Node 26.13.1: **358 passed** (api 204, admin 79, web 75).
- `pnpm -r build`: all workspaces exit 0 (the web build logs a non-fatal
  sitemap `ECONNREFUSED` when the API is not running).
- `pnpm exec openspec validate --all --strict`: **24 passed, 0 failed**.
- Astro resolves **7.4.13** in `@webastro/web` and `@webastro/admin`;
  `@astrojs/node` resolves **11.1.14**.
- Post-apply fix: `apps/web/src/utils/theme.spec.ts` installs an in-memory
  `localStorage` mock for the Node 26/jsdom environment (6/6 tests green).

## Open Questions

- None. The Node target and CI scope were confirmed by the user; remaining
  version details are pinned above.
