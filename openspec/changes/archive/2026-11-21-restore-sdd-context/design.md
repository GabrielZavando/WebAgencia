# Design

## Context

The project's documentation and OpenSpec context drift from the real stack
and deployment target (see proposal.md - Why). Verified evidence:

- Root package.json declares `@fission-ai/openspec: ^1.15.0`
  (`package.json:16`); apps/api/package.json declares a duplicate
  `@fission-ai/openspec: ^1.14.3` (`apps/api/package.json:43`).
- README declares Astro 5 and OpenSpec 1.4 (`README.md:9,12`); real
  versions are Astro 7.2.1 (`apps/web/package.json:21`) and OpenSpec 1.15.0.
- docs/base-standards.md section 8 lists Prisma in the API stack
  (`docs/base-standards.md:86`); no Prisma dependency exists in any
  package.json; the backend uses firebase-admin and @supabase/supabase-js
  (`apps/api/package.json:29,33`).
- docs/frontend-standards.md declares Astro 5.17.x, output: 'static',
  Hostinger FTP deploy, and prohibits SSR
  (`docs/frontend-standards.md:67,73,78`); apps/admin builds with
  output: 'server' via @astrojs/node
  (`apps/admin/package.json:41`) and the deployment target is Coolify.
- openspec/config.yaml has no populated `context` field
  (`openspec/config.yaml:3-11`); openspec/project.md does not exist.
- No apps/api script invokes the openspec binary (scripts use nest, jest,
  ts-node, etc. `apps/api/package.json:8-21`).

## Goals / Non-Goals

**Goals:**
- Restore documentation and OpenSpec context to match the real stack and
  Coolify deployment target.
- Unify OpenSpec version to a single source (root).
- Add a TDD anti-drift test that prevents future doc/package.json drift.
- Keep all existing tests green (316 tests) and add the new anti-drift test.

**Non-Goals:**
- No changes to production source under apps/*/src/ or packages/*/src/.
- No changes to existing tests (including hostinger-compat.test.ts).
- No changes to apps/api/docker/, .github/workflows/.
- No implementation of media, newsletter, or client-portal-auth modules.
- No dependency version changes except the OpenSpec devDep removal.
- No invention of new rules; document existing reality only.

## Decisions

### Reuse vs new capability

**Decision:** Create a new capability `sdd-project-context` rather than
modifying an existing one.

**Rationale:** No existing spec capability governs project-level SDD
context or documentation accuracy. `project-onboarding` covers only the
root README; `deployment-topology` covers only deployment topology.
Neither covers the full scope. Creating `sdd-project-context` avoids
overloading unrelated capabilities.

**Alternatives considered:**
- Extend `project-onboarding`: rejected, it is scoped to the root README,
  not the full documentation context.
- Extend `deployment-topology`: rejected, it is scoped to deployment
  topology, not docs/standards/stack accuracy.

### Anti-drift test location

**Decision:** Place the new test under `apps/web/tests/validation/`,
following the `dependency-audit.test.ts` precedent.

**Rationale:** This directory already contains structural validation tests
that read package.json files and assert constraints. It is the natural
home for a test that validates documentation against package.json.

**Alternatives considered:**
- Root-level test: rejected, no established precedent there.
- apps/api test: rejected, the change spans all packages; web validation
  is the cross-package precedent.

### OpenSpec unification strategy

**Decision:** Remove `@fission-ai/openspec: ^1.14.3` from
`apps/api/package.json` devDependencies, keeping root `^1.15.0` as the
single source. Condition: verified no apps/api script invokes the local
openspec binary (none do).

**Rationale:** The root installation (`npx openspec --version` → 1.15.0)
is the one used by the SSD workflow. The apps/api copy is a duplicate at
an older version.

**Alternatives considered:**
- Keep both: rejected, violates the "single source" acceptance criterion.
- Pin apps/api to 1.15.0: rejected, still a duplicate; root is the
  authoritative source.

### SSR for admin

**Decision:** apps/admin uses `output: 'server'` with `@astrojs/node`
adapter by design; this is not a regression introduced by this change.

**Rationale:** The deployment-topology spec
(`openspec/specs/deployment-topology/spec.md`) already defines admin as a
server-rendered Node application. The frontend-standards "no SSR"
prohibition is outdated and must be removed.

**Alternatives considered:**
- Keep the prohibition: rejected, it contradicts the existing
  deployment-topology spec and the actual apps/admin build config.

## Risks / Trade-offs

- [Lockfile regeneration] Removing the devDep from apps/api/package.json
  will change pnpm-lock.yaml. Mitigation: run `pnpm install` in
  /opsx-apply to regenerate the lockfile.
- [Local binary dependency] If any apps/api script invoked the local
  openspec binary, removing the devDep would break it. Mitigation: verified
  none do; if one is found later, keep the devDep and document the
  finding instead.
- [Incorrect rules in config.yaml] Populating config.yaml context/rules
  with inaccurate rules could mislead future changes. Mitigation: every
  rule is cited to verified evidence (package.json lines, existing specs).

## Migration Plan

1. Apply documentation changes (README, docs/*, openspec/*).
2. Remove duplicate OpenSpec devDep from apps/api/package.json.
3. Run `pnpm install` to regenerate pnpm-lock.yaml (in /opsx-apply).
4. Add anti-drift test and confirm it passes.
5. Run full test suite (316 existing + new anti-drift) to confirm green.

Rollback: revert the single commit that contains all docs + manifest
changes. Scope is limited to documentation and package.json; no runtime
behavior changes.

## Open Questions

None.
