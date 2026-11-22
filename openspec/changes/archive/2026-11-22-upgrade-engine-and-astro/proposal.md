# Proposal

## Why

The root `engines.node` constraint is `>=22.12.0`, while Astro 7.4.13 already
requires Node `>=22.23.4` and upcoming major upgrades will require newer Node
features. The project also pins Astro 7.2.x in its manifests/docs while the
latest 7.x patch is 7.4.13. Raising the engine to the current LTS
(Node 26.13.1, "Lithium", released 2026-11-10) and aligning Astro to 7.4.13
removes the engine blocker for future upgrades and keeps runtime, CI, and
documentation on a single supported baseline.

## What Changes

- **BREAKING** (environment): root `package.json` `engines.node` goes from
  `>=22.12.0` to `>=26.13.1`. Any environment on Node < 26.13.1 (local dev
  machines, CI runners, Coolify build/runtime) must be upgraded.
- `apps/web/package.json` and `apps/admin/package.json`: bump `astro` from
  `^7.2.1` (lockfile 7.4.5) to `^7.4.13`.
- `apps/admin/package.json`: `@astrojs/node` is already `^11.1.14`; no version
  change is needed, only verification that the resolved version stays 11.1.14.
- CI alignment: `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`
  move from `node-version: 22` to `node-version: 26`; add `.nvmrc` with
  `26.13.1` so local and CI runtimes agree.
- Documentation alignment (required by the anti-drift test):
  - `README.md`: Astro `7.4.13`, Node `>= 26.13.1`.
  - `docs/frontend-standards.md`: Framework line `Astro 7.4.13`.
  - `docs/base-standards.md`: Stack Frontend line `Astro 7.4.13`.
  - `openspec/project.md`: Runtime `>=26.13.1`, Frontend framework `^7.4.13`,
    and its "verified against package.json" source references.
  - `docs/backend-standards.md`: stale `Runtime: Node.js 20 LTS` updated to
    Node 26 LTS (incidental drift found during discovery).
- `pnpm-lock.yaml` regenerated to resolve Astro 7.4.13 and Node 26-compatible
  transitive dependencies.
- Test environment: `apps/web/src/utils/theme.spec.ts` installs an in-memory
  `localStorage` mock so the suite passes under Node 26 / jsdom (post-apply
  fix discovered during verification).

No production source code (`apps/*/src/`, `packages/*/src/`), API contract,
or data model changes.

## Capabilities

### New Capabilities

(None — this change introduces no new capabilities.)

### Modified Capabilities

- `sdd-project-context`: the declared-stack and documentation-accuracy
  requirements change from Astro 7.2.1 / Node >=22.12 to Astro 7.4.13 /
  Node >=26.13.1, and the anti-drift guarantee is extended to cover the
  Node engine constraint and CI runtime pin.

## Impact

- Manifests: root `package.json`, `apps/web/package.json`,
  `apps/admin/package.json`; `pnpm-lock.yaml`.
- Docs: `README.md`, `docs/frontend-standards.md`, `docs/base-standards.md`,
  `docs/backend-standards.md`, `openspec/project.md`.
- CI/infra config: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`,
  new `.nvmrc`; Coolify build/runtime images must provide Node 26.13.1.
- Tests: existing suite is the regression net; `apps/web/tests/validation/anti-drift.test.ts`
  is extended for the Node engine and CI runtime, and
  `apps/web/src/utils/theme.spec.ts` mocks `localStorage` for Node 26/jsdom.
- No API (`docs/api-spec.yml`) or data model (`docs/data-model.md`) impact.
