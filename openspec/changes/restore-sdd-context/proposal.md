# Proposal

## Why

The project's documentation and OpenSpec context do not reflect the real stack
and deployment target. `README.md` claims Astro 5 and OpenSpec 1.4 while the
actual versions are Astro 7.2.1 and OpenSpec 1.15.0
(`apps/web/package.json:21`, `package.json:16`). `docs/base-standards.md`
section 8 references Prisma in the API stack
(`docs/base-standards.md:86`) but no Prisma dependency exists in any
`package.json`; the backend uses `firebase-admin` and `@supabase/supabase-js`
(`apps/api/package.json:29,33`). `docs/frontend-standards.md` declares
`output: 'static'` and a Hostinger FTP deploy target
(`docs/frontend-standards.md:67,73`) while `apps/admin` builds with
`output: 'server'` via `@astrojs/node`
(`apps/admin/package.json:41`) and the confirmed deployment target is a VPS
managed with Coolify. `openspec/config.yaml` has no populated `context` field
(`openspec/config.yaml:3-11`), and `openspec/project.md` does not exist.
OpenSpec version is duplicated between root (`^1.15.0`) and `apps/api`
(`^1.14.3`) (`package.json:16`, `apps/api/package.json:43`). These drifts make
it impossible to propose future SDD changes against the real stack and target.

## What Changes

- Create `openspec/project.md` documenting product purpose, monorepo topology,
  real stack with exact versions, persistence, deployment target, real dev/
  build/test commands per package, quality gates, and SDD conventions.
- Populate `openspec/config.yaml` `context` and `rules` fields (currently
  comments only) with the verified stack and SDD conventions.
- Update `README.md`: correct frontend version (Astro 5 → Astro 7.2.1),
  OpenSpec version (1.4 → 1.15.0), add `apps/admin` to the structure, and
  point deployment target to Coolify (remove Hostinger FTP references).
- Update `docs/base-standards.md` section 8: remove Prisma from the API stack;
  reflect `firebase-admin` (Firestore) + `@supabase/supabase-js` (leads).
- Update `docs/frontend-standards.md`: correct Astro version (5.17.x → 7.2.1);
  remove the "no SSR" prohibition because `apps/admin` uses `output: 'server'`
  by design; align hosting target to Coolify; keep Hostinger validation tests
  intact as legacy work marked for future removal.
- Unify OpenSpec version: remove the duplicate `@fission-ai/openspec`
  devDependency from `apps/api/package.json`, keeping root (`^1.15.0`) as the
  single source — conditioned on verifying no `apps/api` script invokes the
  local openspec binary (none found; scripts only use `nest`, `jest`, `ts-node`,
  etc., `apps/api/package.json:8-21`).
- Add a new TDD anti-drift test under `apps/web/tests/validation/` following
  the existing `dependency-audit.test.ts` precedent, asserting that versions and
  stack declared in documentation match the real `package.json` files.

## Capabilities

### New Capabilities

- `sdd-project-context`: governs project-level SDD context, documentation
  standards, declared stack versions, deployment target, and quality gates so
  future changes are proposed against the real stack and target.

### Modified Capabilities

- None. No existing spec capability governs project-level SDD context or
  documentation accuracy; `project-onboarding` covers only the root README and
  `deployment-topology` covers only deployment topology, neither covers the
  full documentation-context scope of this change.

## Impact

- Documentation files only: `openspec/project.md` (new),
  `openspec/config.yaml`, `README.md`, `docs/base-standards.md`,
  `docs/frontend-standards.md`.
- Manifest: `apps/api/package.json` (remove duplicate OpenSpec devDep).
- New test file: `apps/web/tests/validation/` (anti-drift).
- No changes to `apps/*/src/`, `packages/*/src/`, `apps/api/docker/`,
  `.github/workflows/`, or existing tests.
