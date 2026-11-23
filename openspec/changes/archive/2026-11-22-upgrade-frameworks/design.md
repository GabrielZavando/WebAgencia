# Design

## Context

See `proposal.md` for motivation. Verified current state (from `package.json` and `pnpm-lock.yaml`):

| Package | Installed | Target |
|---|---|---|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | 11.1.28 | 12.6.x |
| `@nestjs/testing` | 11.1.28 | 12.6.x |
| `@nestjs/swagger` | 11.4.6 | 12.1.x |
| `@nestjs/cli` / `@nestjs/schematics` | 11.0.24 / 11.1.0 | 12.0.x |
| `@nestjs/throttler` | 6.8.0 | 6.8.0 (unchanged) |
| `firebase` | 12.16.0 (admin + api) | 13.4.x |
| `firebase-admin` | 14.5.1 | unchanged |
| `react` / `react-dom` | 18.3.1 (admin) | 19.3.x |
| `@types/react` / `@types/react-dom` | 19.3.0 | unchanged |
| `typescript` (api / web / admin) | 5.9.3 | api 6.0.x; web/admin unchanged |
| `jest` / `ts-jest` | 30.5.2 / 29.4.15 | unchanged |
| `@swc/cli` / `@swc/core` | 0.6.0 / 1.16.22 | `@swc/cli` 0.8.x; core unchanged |
| Astro / `@astrojs/react` | 7.4.13 / 6.0.1 | unchanged |

Constraints that shape the approach:

- Runtime is Node 26.13.1 (`.nvmrc`, `engines.node`, CI). Nest 12 supports Node >=20.19 but its CLI generators need Node 22.22.3+/24.15+/26+, which 26.13.1 satisfies.
- `apps/api` is CommonJS (`tsconfig.module: commonjs`, `nest build`, Jest). Nest 12 packages are ESM-only; Node 26 supports `require(esm)`. Jest 30.5.2 additionally needs Node's `--experimental-vm-modules` flag so its runtime exposes `vm.SourceTextModule` and can load Nest 12's ESM-only packages; without it, 21/22 suites fail with `Must use import to load ES Module`.
- `apps/api` has no `firebase` client imports today; `apps/admin` uses only the modular `firebase/app` + `firebase/auth` API.
- Admin React code uses `forwardRef` only; no `ReactDOM.render`, `findDOMNode`, `defaultProps`, `propTypes`, or legacy context.
- No source-level CSP/Trusted Types header exists (only generated `dist` output); Firebase 13's Trusted Types policy requirement does not force a source change.
- Baseline `nest build` emits `dist/src/main.js` plus `dist/scripts/*` because `tsconfig.build.json` includes the standalone `scripts/` directory and infers `apps/api` as the common root. `start:prod` and `docs/deployment.md` expect `dist/main.js`; no Coolify deployment exists yet, so this change fixes the local build layout before first deployment.

## Goals / Non-Goals

**Goals:**

- Run the API on NestJS 12.6.x, the admin app on React 19.3.x, and both apps on Firebase client 13.4.x.
- Keep `apps/api` CommonJS and preserve its current build/test workflow on Node 26.
- Keep web/admin on TypeScript 5.9 and Astro 7.4 while moving only the API to TypeScript 6.0 (required by Nest 12 schematics).
- Keep all public API contracts, Firestore/Supabase models, and existing application behavior unchanged.
- Align the API build artifact with `start:prod` and `docs/deployment.md` by emitting `dist/main.js`.
- Make documentation and the anti-drift test declare the new majors.
- Leave production source under `apps/*/src` and `packages/*/src` untouched unless a genuine compatibility fix is required; if one is, stop and escalate before editing.

**Non-Goals:**

- Astro, `@astrojs/react` (not moving to 7.x), Vite, Tailwind, Tiptap, Supabase, or `firebase-admin` upgrades.
- Migrating the API to ESM, switching Jest to Vitest, adopting Standard Schema/Zod validation, or migrating webpack to Rspack.
- Adopting Nest 12 opt-ins (route conflict policy, structured logging changes).
- Upgrading web/admin to TypeScript 6.
- Aligning `@types/node` to 26 or removing the unused `firebase` dependency from the API (deferred follow-ups).
- Any `git add`, `git commit`, or `git push`.

## Decisions

### 1. NestJS 12.6.x, not 12.0.x

Use `^12.6.0` for runtime/testing and `^12.0.15`/`^12.0.16` for CLI/schematics. Nest 12.1 fixed the 12.0.x regression where a subclass without its own constructor dropped inherited `@Optional()` markers; starting at 12.6 avoids that known breakage.

Alternatives: stay on 11 (rejected: misses current stable line and TS 6 tooling), or pin 12.0.x (rejected: known regression).

### 2. Keep the API CommonJS and rely on Node 26 `require(esm)`

Nest 12 packages are ESM-only, but Node 26.13.1 supports loading ESM from CommonJS via `require(esm)`. The migration guide confirms CommonJS applications can upgrade without converting to ESM. Jest 30 can load ESM-only packages from Node 24.9+, but only when Node runs with `--experimental-vm-modules` so that `vm.SourceTextModule` exists (see Decision 8).

Alternatives: migrate `apps/api` to ESM (rejected: larger blast radius across `nest build`, Jest, ts-node scripts, and Docker/Coolify startup; explicitly optional per Nest docs). Migrating the API tests to Vitest is explicitly out of scope for this change.

### 3. TypeScript 6.0.x only in `apps/api`

`@nestjs/schematics@12` declares `typescript ^6.0.0` as a peer, and `@nestjs/cli@12` depends on `typescript ~6.0.2`. The workspace therefore needs TS 6 where Nest tooling runs. Web/admin stay on `^5.9.3` to avoid pulling an Astro/Vite/`@astrojs/check` toolchain migration into this change. `ts-jest@29.4.15` accepts `typescript <7`, and `typescript-eslint@8.73.0` accepts `typescript <6.1.0`, so TS 6.0.3 is compatible with the existing tooling.

Required API `tsconfig` adjustments for TS 6 defaults:

- `compilerOptions.types: ["node", "jest"]` — TS 6 defaults `types` to `[]`, so Jest and Node globals would otherwise disappear.
- `compilerOptions.strict: false` — the current config uses partial strictness (`strictNullChecks`, `noImplicitAny`, etc.) but never enabled full `strict`. TS 6 defaults `strict` to `true`; setting it explicitly to `false` preserves today's semantics. Adopting full strict mode is a separate change.
- `compilerOptions.moduleResolution: "node10"` + `ignoreDeprecations: "6.0"` — the API targets CommonJS with `module: commonjs`; `node10` is deprecated in TS 6 but still functional. This is safer than switching to `nodenext`, which would change module emit semantics.
- Remove `compilerOptions.baseUrl` (deprecated; no `paths` are configured in the API).
- Set `compilerOptions.rootDir: "./src"` and add `"scripts"` to `exclude` in `tsconfig.build.json`. The baseline build currently emits `dist/src/main.js` plus `dist/scripts/*` because `scripts/` is included and the inferred root becomes `apps/api`, while `start:prod` and `docs/deployment.md` expect `dist/main.js`. The standalone scripts are `ts-node` utilities and do not need to be compiled, so excluding them and pinning `rootDir` produces `dist/main.js` and aligns the artifact with the documented start command. Keeping these settings in the build config avoids affecting Jest's inclusion of `test/` files.
- TypeScript 6 always enables `esModuleInterop`, so the e2e tests' `import * as request from 'supertest'` namespace import is no longer callable. Change the four `apps/api/test/*.e2e-spec.ts` imports to `import request from 'supertest'` (test-only; no production source).

### 4. React 19.3.x without changing `@astrojs/react`

`@astrojs/react@6.0.1` already declares React `^17 || ^18 || ^19` as a peer, and the admin app already compiles against `@types/react@19.3.0`. Bumping only `react`/`react-dom` aligns runtime and types with minimal risk. `@astrojs/react@7.1.9` adds an `oxc-transform-react` peer and is part of a broader integration upgrade; deferring it avoids coupling this change to Astro toolchain work.

Alternatives: upgrade `@astrojs/react` to 7.x (rejected for scope), keep React 18 (rejected: types/runtime mismatch and misses current major).

### 5. Firebase client 13.4.x in both apps

Firebase 13's breaking changes are concentrated in AI Logic (`VertexAIBackend`, `TemplateGenerativeModel`, `Part`, LiveSession methods) and a shared Trusted Types policy. This repo uses only `firebase/app` and `firebase/auth`, so no application-code changes are expected. The API's `firebase` dependency is unused but is upgraded for version consistency; removing it is a separate cleanup.

Alternatives: upgrade admin only (rejected: leaves two Firebase majors in the workspace), or remove the API dependency now (rejected for scope; separate follow-up).

### 6. Encode the upgrade in the anti-drift test before touching docs

Follow TDD: extend `apps/web/tests/validation/anti-drift.test.ts` with assertions that the documented NestJS/React/Firebase majors match the manifests and target 12/19/13. Run it first to see it fail, then upgrade and update docs until it passes. This keeps documentation from drifting and makes the upgrade observable.

Alternatives: update docs manually without a test (rejected: no guard against regression).

### 7. Incremental upgrade order

Apply NestJS + TypeScript first, then React, then Firebase, verifying build/test after each stage. This isolates failures to one ecosystem and avoids a single un-bisectable "everything changed" commit.

Alternative: one combined `pnpm add` for all packages (rejected: harder to diagnose peer/ESM failures).

### 8. Run Jest with Node's `--experimental-vm-modules`

Jest 30.5.2's `supportsSyncEvaluate` gate checks `vm.SourceTextModule.prototype.hasAsyncGraph`. `vm.SourceTextModule` is only defined when Node runs with `--experimental-vm-modules`, so without the flag Jest rejects Nest 12's ESM-only packages even though Node 26 itself can `require(esm)`. Verified behavior: `pnpm -F @webastro/api test` fails 21/22 suites with `Must use import to load ES Module`; with the flag it passes 22/22 suites (204 tests).

All API test scripts invoke Jest through Node with the flag:

```json
"test": "node --disable-warning=ExperimentalWarning --experimental-vm-modules node_modules/jest/bin/jest.js",
"test:watch": "node --disable-warning=ExperimentalWarning --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
"test:cov": "node --disable-warning=ExperimentalWarning --experimental-vm-modules node_modules/jest/bin/jest.js --coverage",
"test:debug": "node --disable-warning=ExperimentalWarning --experimental-vm-modules --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/jest/bin/jest.js --runInBand",
"test:e2e": "node --disable-warning=ExperimentalWarning --experimental-vm-modules node_modules/jest/bin/jest.js --config ./test/jest-e2e.json"
```

`--disable-warning=ExperimentalWarning` is optional and only suppresses the expected Node warning; Node 26.13.1 supports it. Invoking `node node_modules/jest/bin/jest.js` avoids POSIX-only `NODE_OPTIONS=` syntax and keeps the scripts portable.

The custom `transformIgnorePatterns` in `apps/api/test/jest-e2e.json` (added by the earlier test-runner upgrade to force `.pnpm`/`jose`/`firebase-admin`/`jwks-rsa` through the transform) is now obsolete and harmful: with the flag, transforming `jose` produces `exports is not defined`. Remove the override so Jest uses its default (do not transform `node_modules`) and loads `jose` as native ESM. Verified: 4 e2e suites / 13 tests pass.

Alternatives: transform the `@nestjs/*` ESM packages to CJS inside Jest (rejected: extra transform configuration and dependencies), or migrate the API tests to Vitest (rejected: explicitly out of scope for this change).

## Risks / Trade-offs

- **TypeScript 6 default changes break the API build/type-check** → Explicit `types`, `strict`, `rootDir`, and `ignoreDeprecations` settings above; verify with `pnpm -F @webastro/api build` and `pnpm -F @webastro/api test`.
- **Jest cannot load Nest 12 ESM-only packages** → Run Jest with Node's `--experimental-vm-modules` (Decision 8); verified 22/22 suites and 204 tests pass. Vitest migration is out of scope.
- **Nest 12 lifecycle hook ordering / logger changes affect tests** → Run the full API suite; tests that assert initialization order may need test-only fixes. Any production source change is escalated first.
- **TS6 `esModuleInterop` breaks the supertest namespace import** → Change the four e2e test files to `import request from 'supertest'`; verified by `pnpm -F @webastro/api test:e2e`.
- **E2E `transformIgnorePatterns` conflicts with native ESM** → Remove the override from `apps/api/test/jest-e2e.json`; Jest's default lets `--experimental-vm-modules` load `jose` natively. Verified 4 suites / 13 tests.
- **Admin has no lint script** → `apps/admin` has no ESLint dependency/config and no `lint` script; `pnpm -F @webastro/admin lint` reports no script. `astro check` is the available static check and currently reports 9 pre-existing errors in unmodified files (the React 19 typings were already installed before this change). No lint tooling is added here; the enforced admin gates are build + tests.
- **React 19 runtime changes surface in admin UI** → Run admin unit tests and manually smoke-test login, dashboard, article editor, and categories after upgrade.
- **Firebase 13 Trusted Types policy** → Only relevant if a source CSP adds a `trusted-types` directive; no such source header exists today. If one is added later, allow `firebase-js-sdk-policy`.
- **Peer dependency conflicts during install** → `ts-jest` and `typescript-eslint` already accept TS 6.0; `@nestjs/throttler` accepts Nest 12; `@swc/cli` is bumped to satisfy CLI 12. If pnpm reports another conflict, resolve it within the same major before proceeding.
- **Large lockfile diff hides unintended upgrades** → Review `pnpm-lock.yaml` after install and confirm only the target packages and their transitive dependencies moved; no unrelated majors.
- **Build artifact layout changes from `dist/src/main.js` to `dist/main.js`** → This matches the existing `start:prod` and `docs/deployment.md`, and no deployment exists yet. The standalone `scripts/` tools run through `ts-node` and do not need to be compiled; verify the API build emits `dist/main.js`.
- **Planning leaves the tree dirty by design** → Only new OpenSpec artifacts are added; no manifests, lockfile, source, or docs are modified until the user approves `/opsx-apply`.

## Migration Plan

1. Pre-flight: confirm a clean git working tree (apart from this change's artifacts), capture baseline `pnpm -r build` and `pnpm -r test`.
2. Stage 1 — API/NestJS 12 + TypeScript 6: update `apps/api/package.json`, apply the TypeScript 6 compiler options to `tsconfig.json`, set `rootDir: "./src"` and exclude `scripts` in `tsconfig.build.json`, update the Jest scripts to run with Node's `--experimental-vm-modules`, install, then build/lint/test the API (unit + e2e) and confirm `dist/main.js`.
3. Stage 2 — React 19: update `apps/admin/package.json`, install, then build/lint/test admin and smoke-test the UI.
4. Stage 3 — Firebase 13: update `apps/admin` and `apps/api`, install, then build/test both.
5. Stage 4 — Docs + anti-drift test: add the failing test assertions first, then update `openspec/project.md`, `openspec/config.yaml`, standards docs, and README until green.
6. Stage 5 — Full gates: `pnpm install --frozen-lockfile`, `pnpm -r build`, `pnpm -r --if-present lint`, `pnpm -r test`, `pnpm exec openspec validate --all --strict`.
7. Rollback: restore the pre-upgrade versions of the manifests, lockfile, tsconfigs, test, and docs (for example with `git restore --` on those paths after user approval), then run a frozen install. Since no commits are made, rollback is a working-tree operation.

## Open Questions

- Whether to align `apps/api` `@types/node` from 22.x to 26.x and remove its unused `firebase` dependency. Both are safe to defer; neither changes the specs or this approach.
