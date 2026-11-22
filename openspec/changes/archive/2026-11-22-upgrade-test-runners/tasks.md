# Tasks

> Operator-executed commands. The planning agent does not run `pnpm install`/`add`/`update`
> and never runs `git add`, `git commit`, or `git push`. Run each command from the repo
> root unless stated otherwise.

## 1. Baseline and anti-drift test

- [x] 1.1 Capture the pre-upgrade baseline (read-only): run `pnpm build`, then
      `pnpm -r test`, then `pnpm exec openspec validate --all --strict`. Verify all three
      commands finish and record any pre-existing failures so they are not attributed to
      this change.
- [x] 1.2 Extend `apps/web/tests/validation/anti-drift.test.ts` with major-level
      assertions derived from the manifests, e.g.:

      ```ts
      const majorOf = (range: string) => range.replace(/^[^0-9]*/, '').split('.')[0];
      // `backendStandards` must read docs/backend-standards.md; the existing
      // `baseStandards` constant points at docs/base-standards.md.
      const backendStandards = readDoc('docs/backend-standards.md');

      it('docs/frontend-standards.md declares the installed Vitest, jsdom and jest-dom majors', () => {
        expect(frontendStandards).toMatch(new RegExp(`Vitest ${majorOf(webPkg.devDependencies.vitest)}\\.`));
        expect(frontendStandards).toContain(`jsdom ${majorOf(webPkg.devDependencies.jsdom)}.`);
        expect(frontendStandards).toContain(`jest-dom ${majorOf(webPkg.devDependencies['@testing-library/jest-dom'])}`);
      });

      it('docs/backend-standards.md declares the installed Jest major', () => {
        expect(backendStandards).toContain(`Jest ${majorOf(apiPkg.devDependencies.jest)}`);
      });
      ```

      Verify with
      `pnpm --filter @webastro/web exec vitest run tests/validation/anti-drift.test.ts`:
      this is the RED step. The new `jsdom` / `jest-dom` / `Jest` assertions must fail
      because the docs do not yet declare those versions (the `Vitest` assertion still
      passes, because docs and manifests are both on major 4 until group 2). All existing
      anti-drift assertions must remain green. This test turns fully GREEN in 4.4.

## 2. Upgrade dependencies

- [x] 2.1 Upgrade the frontend runners together (Vitest and coverage in lockstep, because
      `@vitest/coverage-v8` peers the exact Vitest version and `jest-dom` 8 peers Vitest ≥ 5):
      `pnpm --filter @webastro/web --filter @webastro/admin add -D vitest@^5.1.1 @vitest/coverage-v8@^5.1.1 @testing-library/jest-dom@^8.0.0 jsdom@^31.0.1`
      Verify the command exits 0 and both `apps/web/package.json` and
      `apps/admin/package.json` show the new ranges.
- [x] 2.2 Upgrade the API runner:
      `pnpm --filter @webastro/api add -D jest@^30.5.2 @types/jest@^30.0.0`
      Verify the command exits 0; `ts-jest` stays at `^29.4.15` (its peer already accepts
      Jest 30). Do not change `ts-jest`, `supertest`, or `@nestjs/testing`.
- [x] 2.3 Reconcile the lockfile and inspect peer resolution: run `pnpm install`, then
      `pnpm list -r --depth 0`, `pnpm --filter <app> why vite`, and
      `pnpm --filter <app> why @testing-library/dom`.
      Verify: installed `vitest`/`@vitest/coverage-v8` are 5.1.1, `jest` is 30.5.x,
      `@types/jest` 30.0.x, `@testing-library/jest-dom` 8.0.0, `jsdom` 31.0.x; the
      Vitest/Astro Vite peer resolves to 8.3.8 in both frontends; `@testing-library/dom`
      is 10.4.x; pnpm prints no unresolved/missing peer warning. A nested Vite copy that
      is not the Vitest/Astro peer must be shown to pre-exist (the admin app keeps a
      pre-existing `@astrojs/react -> @vitejs/plugin-react@5.2.0 -> vite@8.1.5` copy that
      this change does not touch). If (and only if) the Vitest/Astro peer itself is
      conflicting or duplicated, go to 2.5.
- [x] 2.4 Confirm the RED checkpoint for the documentation contract: run
      `pnpm --filter @webastro/web exec vitest run tests/validation/anti-drift.test.ts`.
      Verify it fails only on the new Vitest/jsdom/jest-dom/Jest documentation assertions
      (manifests moved to the new majors, docs are still old). This failure is expected and
      is resolved in group 4.
- [x] 2.5 Not applicable in this run (2.3 resolved a single Vitest/Astro Vite 8.3.8; the nested 8.1.5 copy pre-exists). Conditional fallback only if 2.3 showed a Vite peer conflict: add
      `vite@^8` to `apps/web` and `apps/admin` devDependencies and add `'vite'` and
      `'@testing-library/dom'` to both `ALLOWED_NEW_DEPS` allowlists in
      `apps/web/tests/validation/dependency-audit.test.ts` and
      `apps/admin/tests/validation/dependency-audit.test.ts`; rerun `pnpm install` and the
      two dependency-audit suites. Verify both audit suites pass and 2.3's resolution checks
      are satisfied. Do not take this path when 2.3 already resolved a single Vite 8.x.

## 3. Absorb breaking changes

- [x] 3.1 Run the frontend suites:
      `pnpm --filter @webastro/web test` and `pnpm --filter @webastro/admin test`.
      Verify the admin suite passes, and the web suite passes for every file except
      `tests/validation/anti-drift.test.ts`, which is intentionally RED until 4.4 (the
      only acceptable web failure is the new documentation assertion). Confirm no Vitest 5
      breaking-change failure appears in the remaining web tests. If an unexpected failure
      appears, apply only the documented fix: set
      `clearMocks: false` in the affected `vitest.config.ts` when a test depends on
      call history recorded outside the test body; move a nested `vi.mock`/`vi.hoisted` to
      module top level; replace a style assertion unsupported by the jsdom 31 CSS engine
      with a structure/attribute assertion. Re-run until green.
- [x] 3.2 Run the API suites: `pnpm --filter @webastro/api test` and
      `pnpm --filter @webastro/api test:e2e`. Verify both pass. Fix Jest 30 fallout only in
      test files: replace any removed alias matcher with its canonical name and correct
      `toHaveBeenCalledWith` argument types surfaced by the stricter inference. Jest 30
      also surfaced an ESM interop failure in `test/jest-e2e.json`: the pnpm layout
      (`.pnpm/.../node_modules/<pkg>/`) bypassed the old `transformIgnorePatterns`, so
      `jose` (ESM, pulled by `firebase-admin`) was `require()`d untransformed. Fixed in the
      test config only by allowing `.pnpm` in the pattern. Do not modify production code;
      if a failure points at a real product bug, stop and report it.
- [x] 3.3 Sanity-check coverage after the Vitest 5 include/exclude tightening:
      `pnpm --filter @webastro/admin test:coverage` and, while `anti-drift.test.ts` is RED,
      the src-scoped `pnpm --filter @webastro/web exec vitest run --coverage src` (the full
      `pnpm --filter @webastro/web test:coverage` is re-run once 4.4 is green). Verify both
      coverage reports are produced and `coverageFinal.json` contains only source files —
      no `node_modules`, `dist`, `.astro`, or `src/env.d.ts` entries.

## 4. Documentation alignment

- [x] 4.1 Update `docs/frontend-standards.md`: in the Testing section make the unit/validation
      line read `Vitest 5.x` with `jsdom 31.x` and `@testing-library/jest-dom` 8.x, and change
      the stack block `Tests:` line to `Vitest 5.1.x (unit/validación) + jsdom 31.x (…)+
      Playwright …`. Verify the `Vitest 5.` / `jsdom 31.` / `jest-dom 8` assertions in
      `anti-drift.test.ts` can find those strings.
- [x] 4.2 Update `docs/backend-standards.md`: change the testing bullet to
      `Unit tests para lógica de dominio y servicios (Jest 30 + ts-jest 29.4)` and the stack
      block line `Tests: Jest` to `Tests: Jest 30.x (ts-jest 29.4.x)`. Verify the `Jest 30`
      assertion finds the string.
- [x] 4.3 Update the testing rows of `openspec/project.md`:
      `| Testing (backend) | Jest | ^30.5.2 | apps/api/package.json |` and
      `| Testing (frontend) | Vitest | ^5.1.1 | apps/web/package.json |`. Verify both rows
      match the real manifests with `pnpm list -r --depth 0`.
- [x] 4.4 Verify the documentation contract is GREEN:
      `pnpm --filter @webastro/web exec vitest run tests/validation/anti-drift.test.ts` must
      pass in full (old and new assertions).

## 5. Integration verification

- [x] 5.1 Run `pnpm build`. Verify all workspaces build with no new errors.
- [x] 5.2 Run `pnpm -r test`. Verify every workspace suite passes (the build from 5.1 is
      required because `apps/web` validation tests assert `dist/` exists).
- [x] 5.3 Run `pnpm -r --if-present lint`. Verify no new lint errors appear.
- [x] 5.4 Run `pnpm exec openspec validate --all --strict`. Verify zero failures, including
      this change with `skip_specs: true`.
- [x] 5.5 Review scope with `git status --porcelain` (read-only). Verify the only modified
      files are `package.json`, `apps/web/package.json`, `apps/admin/package.json`,
      `apps/api/package.json`, `pnpm-lock.yaml`, `docs/frontend-standards.md`,
      `docs/backend-standards.md`, `openspec/project.md`,
      `apps/web/tests/validation/anti-drift.test.ts`, plus the new
      `openspec/changes/upgrade-test-runners/` artifacts. Verify no file under
      `apps/*/src/`, `packages/*/src/`, `docs/api-spec.yml`, or `docs/data-model.md` changed.
- [x] 5.6 Leave the changes uncommitted for review. Verify `git log -1` is unchanged (no new
      commit was created).

## Workflow follow-up

- After review and explicit approval, archive with the native CLI:
  `pnpm exec openspec archive upgrade-test-runners --yes`.
- Then run `/commit` to create the conventional commit (`chore(deps): upgrade test runners
  to vitest 5 and jest 30`) and the PR when requested.
