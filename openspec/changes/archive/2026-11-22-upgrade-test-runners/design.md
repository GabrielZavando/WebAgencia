# Design

## Context

See `proposal.md` for motivation. The repository state that shapes this approach,
verified on 2026-11-22:

| Package | Declared | Installed | Workspaces |
|---------|----------|-----------|------------|
| `vitest` | `^4.1.2` | 4.1.10 | `apps/web`, `apps/admin` |
| `@vitest/coverage-v8` | `^4.1.2` | 4.1.10 | `apps/web`, `apps/admin` |
| `@testing-library/jest-dom` | `^6.9.1` | 6.9.1 | `apps/web`, `apps/admin` |
| `jsdom` | `^29.0.1` | 29.1.1 | `apps/web`, `apps/admin` |
| `jest` | `^29.7.0` | 29.7.0 | `apps/api` |
| `@types/jest` | `^29.5.14` | 29.5.14 | `apps/api` |
| `ts-jest` | `^29.4.15` | 29.4.15 | `apps/api` |

Constraints found in the project:

- pnpm 10 with `.npmrc` `auto-install-peers=true` and `strict-peer-dependencies=false`.
- `apps/web` and `apps/admin` each have a `vitest.config.ts` using `globals: true`,
  `environment: 'jsdom'`, and `setupFiles: ['./src/test-setup.ts']`; the setup files only
  do `import '@testing-library/jest-dom';`.
- The `dependency-audit` validation tests in both frontends assert that **every** key in
  `dependencies` + `devDependencies` appears in a hardcoded allowlist of package names.
  Adding a package name therefore requires a test edit.
- `pnpm -r test` runs `vitest run` in the frontends with
  `include: ['src/**/*.{test,spec}.{js,ts,tsx}', 'tests/validation/*.test.ts']`.
  `tests/validation/ssg-build.test.ts` and `tests/validation/hostinger-compat.test.ts`
  assert that `apps/web/dist` exists, so **a build is required before the root test
  command passes** (CI already builds before testing).
- `apps/api` Jest config lives inline in `package.json` (`rootDir: src`,
  `testRegex: '.*\\.spec\\.ts$'`, `ts-jest` transform, `moduleNameMapper` for the
  `firebase-admin` mocks, `testEnvironment: 'node'`), plus `test/jest-e2e.json`.
- No `vite` or `@testing-library/dom` direct dependency exists; both are present only as
  auto-installed/transitive peers (`vite@8.3.8` via Astro 7.4.13 which requires
  `^8.3.8`; `@testing-library/dom@10.4.1` via `@testing-library/react`).

## Goals / Non-Goals

**Goals:**

- Move all four named test runners to their latest stable majors verified compatible
  with Node 26.13.1.
- Keep the dependency surface (package names) unchanged so the dependency-audit gates
  stay meaningful and untouched.
- Make the documentation/version alignment enforced by the existing anti-drift test.
- Give the operator an explicit, reversible command sequence (no automated installs in
  the planning phase).

**Non-Goals:**

- No migration to other runners (no Vitest↔Jest consolidation), no SWC transform for
  Jest, no test-file rewrites unless a real breaking change forces one.
- No production code, API, or data-model changes.
- No upgrade of Astro, NestJS, Playwright, React, TypeScript, or `ts-jest`.
- No CI workflow changes (Node 26 is already pinned).
- No commit, staging, or push.

## Decisions

### D1. Target versions

Registry-verified latest stable on 2026-11-22, with compatibility evidence:

| Package | Target range | Evidence |
|---------|--------------|----------|
| `vitest` | `^5.1.1` | engines `^22.12 \|\| ^24 \|\| >=26`; peer `vite ^6.4 \|\| ^7 \|\| ^8` (repo has Vite 8.3.8) |
| `@vitest/coverage-v8` | `^5.1.1` | peer `vitest: 5.1.1` — must stay in lockstep with `vitest` |
| `@testing-library/jest-dom` | `^8.0.0` | peers `vitest >=5 <6`, `@testing-library/dom >=10 <11`; Node `>=22` |
| `jsdom` | `^31.0.1` | engines `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` |
| `jest` | `^30.5.2` | engines `^18.14 \|\| ^20 \|\| ^22 \|\| >=24` |
| `@types/jest` | `^30.0.0` | matches Jest 30; Jest 30 requires TS >= 5.4 (repo: 5.9.3) |
| `ts-jest` | unchanged `^29.4.15` | peer `jest ^29 \|\| ^30` — already supports Jest 30 |

`@testing-library/react@^16.3.3` and `@vitejs/plugin-react@^6.3.0` stay unchanged; their
peer ranges already cover the target versions.

### D2. Two upgrade groups, one install

Frontend runners and the Jest runner are independent, but `jest-dom@8` cannot be
installed without Vitest 5 (peer) and `vitest@5` cannot run without a Vite peer. Therefore:

1. `apps/web` + `apps/admin` together: `vitest`, `@vitest/coverage-v8`,
   `@testing-library/jest-dom`, `jsdom` (one `pnpm add`, both filters).
2. `apps/api` alone: `jest`, `@types/jest`.
3. A single `pnpm install` to materialize the lockfile.

Alternative considered: upgrading `jest-dom` first or `vitest` first. Rejected because it
would leave the tree with a broken peer graph between the two commands.

### D3. Do not add `vite` or `@testing-library/dom` to manifests

Vitest 5 and jest-dom 8 require them as peers, and `.npmrc` has
`auto-install-peers=true`, so pnpm resolves them without a manifest entry. Adding them
explicitly would make both `dependency-audit` tests fail (their allowlists are
name-based) and widen the reviewed dependency surface for no runtime benefit.

Alternative considered: add the peers and extend both allowlists. Rejected: it changes
the dependency-audit contract in two files for packages that were already installed
transitively.

**Consequence to verify:** pnpm must resolve exactly one usable `vite` 8.x per app.
If the install produces a conflicting/duplicated Vite resolution, the fallback is to add
`vite` explicitly **and** extend the allowlists in the same task — recorded as a
conditional step, not the default path.

### D4. Keep `ts-jest` at 29.4.x

`ts-jest@29.4.15` already declares `jest ^29 || ^30`. Upgrading `ts-jest` is not needed
and would add another variable. Its default type-checking is retained (the project
values typed tests), which is why Jest 30's stricter `toHaveBeenCalledWith` inference is
a real (compile-time) risk to plan for.

### D5. Enforce documentation alignment with the existing anti-drift test

`apps/web/tests/validation/anti-drift.test.ts` already owns "documentation versions match
`package.json`". Extend it with **major-level** assertions read from `package.json`
(not hardcoded strings):

- frontend docs contain `Vitest <major>` derived from `webPkg.devDependencies.vitest`
  (target: `Vitest 5`).
- frontend docs contain the `jsdom` and `@testing-library/jest-dom` majors
  (target: `jsdom 31`, `jest-dom 8`).
- backend docs contain `Jest <major>` derived from `apiPkg.devDependencies.jest`
  (target: `Jest 30`).

Major-level (not patch-level) assertions keep docs stable across patch releases while
still catching the drift that matters. This assertion is written **before** the docs are
updated, so the change has a genuine red→green TDD cycle even though it is tooling-only.

Alternative considered: leave docs unenforced. Rejected: `sdd-project-context` already
requires doc/package.json parity.

### D6. Verification order: build, then test

Because `apps/web` validation tests assert `dist/` exists, the verification sequence is
`pnpm build` → `pnpm -r test` → `pnpm -r --if-present lint` →
`pnpm exec openspec validate --all --strict`. Running `pnpm -r test` on a clean checkout
without a build produces failures unrelated to this change.

### D7. Operator-executed installs only

The planning phase produces commands; it does not run `pnpm install`/`add`/`update`,
does not stage, and does not commit. Implementation starts only on explicit approval.

## Risks / Trade-offs

**Vitest 5 breaking changes (from the official migration guide):**

- `clearMocks` now defaults to `true`, clearing call history before every test →
  `AuthGuard.test.tsx` and `AuthGuard.children.test.tsx` already call
  `mockUnsubscribe.mockClear()` in `beforeEach`, and all mocks are module-scope
  `vi.fn()` instances injected through `vi.mock` factories, so implementations persist.
  No top-level/`beforeAll` call-history assertions were found. Mitigation if a test
  regresses: set `clearMocks: false` in that app's `vitest.config.ts` rather than
  rewriting tests.
- `vi.mock`/`vi.unmock`/`vi.hoisted` outside module top level now throw → all 18
  `vi.mock` calls in `apps/admin` are top-level (verified). If a nested call surfaces,
  move it to the top level.
- `vite` is now a required peer → see D3; verify resolution and inspect lockfile.
- Unawaited async assertions now fail → the only two `.resolves` usages
  (`apps/admin/src/lib/rebuild.spec.ts:48,55`) are awaited (verified).
- Coverage `include`/`exclude` matching tightened → configs use `exclude` only with
  root-relative globs (`node_modules/**`, `dist/**`, `.astro/**`, `src/env.d.ts`);
  verify with the optional `test:coverage` scripts.
- Reporters writing to files, `test.sequential` removal, `toThrow('')` semantics,
  `expect.poll` timeouts, `pretty-format` titles, config lookup from parent dirs → none
  of these features are used in this repo (verified by inspection).

**Jest 30 breaking changes (official upgrade guide):**

- Alias matchers removed (`toBeCalled*`, `toThrowError`, …) → none used in `apps/api`
  (verified by grep).
- `@types/jest` must be 30 → included in the upgrade.
- Stricter `CalledWith` inference is a compile-time change under `ts-jest` → `apps/api`
  has many `toHaveBeenCalledWith` assertions; type errors may appear. Mitigation: fix
  **test** argument types/casts only; production code must not change.
- Non-enumerable properties excluded from object matchers → possible in
  mock/repository assertions; mitigation: assert explicit fields.
- `--testPathPattern` → `--testPathPatterns`, `jest --init` removal, custom sequencer /
  programmatic API changes → not used (scripts and inline config use neither).
- Default `moduleFileExtensions`/`testMatch` now include `.mts`/`.cts` → both Jest
  configs set `moduleFileExtensions`/`testRegex` explicitly, so defaults do not apply.
- `glob@10` pattern changes → only `testRegex` and `moduleNameMapper` are used.
- Snapshot serializer changes → no snapshots exist in `apps/api` (verified).
- `jest.genMockFromModule` removal, case-sensitive `jest.mock` paths → the
  `firebase-admin` mocks are manual factory modules wired through `moduleNameMapper`;
  paths already match exactly.

**jest-dom 8 / jsdom 31:**

- jest-dom 8 hard-requires Vitest ≥ 5 → enforced by the atomic frontend upgrade (D2).
- `@testing-library/dom` is now a required jest-dom peer (v7+) → provided by pnpm peers;
  must be `>=10 <11` (installed 10.4.1). Watch the install output for peer warnings.
- jsdom 31 rewrote its CSS engine and changed the optional canvas backend to
  `@napi-rs/canvas` → component tests use `toBeInTheDocument`/`toBeVisible`, not
  `toHaveStyle` or `getComputedStyle`; the only `getComputedStyle` usage is in a
  Playwright e2e spec, which does not use jsdom. Canvas is unused. Risk: low; confirm
  with the admin web test run.
- jsdom 30 raised the Node minimum → Node 26.13.1 satisfies it.

**Process risks:**

- The lockfile change is large → review the diff for unexpected packages; the expected
  additions are Vitest 5 toolchain, jest 30 packages, jest-dom 8, jsdom 31, and the
  auto-installed `vite`/`@testing-library/dom` peers only.
- `pnpm -r test` without a build fails on pre-existing `dist/` assertions → D6.
- Major upgrades can surface behaviour assertions that were accidentally passing →
  failures are fixed in tests only; if a failure indicates a product bug, stop and
  report instead of weakening the assertion.

## Migration Plan

1. **Baseline (read-only):** record `pnpm build`, `pnpm -r test`,
   `pnpm exec openspec validate --all --strict` results before touching versions.
2. **Red:** extend `anti-drift.test.ts`; run it and confirm it fails against the current
   docs (Vitest 4 / Jest 29).
3. **Upgrade manifests + lockfile:** run the two `pnpm add` commands and `pnpm install`
   from `tasks.md`.
4. **Green:** run the frontend and API suites; apply only documented test-side fixes if a
   breaking change actually triggers.
5. **Docs:** update the two standards files and `openspec/project.md`; the anti-drift
   test goes green.
6. **Full verification:** build → root tests → lint → OpenSpec strict validate.

**Rollback:** `git checkout -- package.json apps/web/package.json
apps/admin/package.json apps/api/package.json pnpm-lock.yaml docs openspec/project.md
apps/web/tests/validation/anti-drift.test.ts` (or revert the individual files), then
`pnpm install` to restore the previous lockfile state.

## Open Questions

- Whether pnpm resolves a single Vite 8.x per frontend after the peer change (D3). This
  is checked during apply and does not alter the plan: the default is no explicit peer
  entry; only a conflicting resolution would trigger the documented fallback.
