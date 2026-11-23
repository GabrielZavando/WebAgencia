# Tasks

> **Execution policy:** do not run `git add`, `git commit`, or `git push` at any point. Do not run `pnpm add`/`pnpm install` for a stage until the user confirms; the Stage 1 install was user-run. Do not edit production source under `apps/*/src` or `packages/*/src`; if a compatibility fix is genuinely required, stop, update the artifacts, and ask first.

## 1. Baseline and guardrails

- [x] 1.1 Confirm the working tree contains only this change's new artifacts.
  - Run: `git status --short`
  - Verify: only `openspec/changes/upgrade-frameworks/` entries appear; no modified tracked files.
- [x] 1.2 Capture the pre-upgrade baseline so regressions are distinguishable from pre-existing failures.
  - Run: `pnpm -r build`
  - Verify: exits 0. Record any failure before continuing.
  - Run: `pnpm -r test`
  - Verify: exits 0. Record any failure before continuing.

## 2. Red: anti-drift assertions for the new framework majors

- [x] 2.1 Extend `apps/web/tests/validation/anti-drift.test.ts` with framework-major assertions (test code only).
  - Add `const projectMd = readDoc('openspec/project.md');`
  - Add a test that derives majors from the manifests and asserts the target majors:
    ```ts
    const nestMajor = majorOf(apiPkg.dependencies['@nestjs/core']);
    const reactMajor = majorOf(adminPkg.dependencies.react);
    const firebaseMajor = majorOf(adminPkg.dependencies.firebase);

    expect(nestMajor).toBe('12');
    expect(reactMajor).toBe('19');
    expect(firebaseMajor).toBe('13');

    expect(backendStandards).toContain(`NestJS ${nestMajor}`);
    expect(frontendStandards).toContain(`React ${reactMajor}`);
    expect(frontendStandards).toContain(`Firebase client ${firebaseMajor}`);
    expect(baseStandards).toContain(`NestJS ${nestMajor}`);
    expect(baseStandards).toContain(`React ${reactMajor}`);
    expect(readme).toContain(`NestJS ${nestMajor}`);
    expect(readme).toContain(`React ${reactMajor}`);
    expect(configYaml).toContain(`NestJS ${nestMajor}`);
    expect(configYaml).toContain(`React ${reactMajor}`);
    expect(configYaml).toContain(`Firebase ${firebaseMajor}`);
    expect(projectMd).toContain(apiPkg.dependencies['@nestjs/core']);
    expect(projectMd).toContain(adminPkg.dependencies.react);
    expect(projectMd).toContain(adminPkg.dependencies.firebase);
    ```
  - Verify with: `pnpm -F @webastro/web test:validation:static`
  - Expected: FAIL on the new assertions (red) because the manifests/docs still declare 11/18/12. Confirm no unrelated failures.

## 3. Stage 1 — NestJS 12 + TypeScript 6 (API)

- [x] 3.1 Set the `apps/api/package.json` target ranges (the Stage 1 `pnpm add` commands in 3.3 also record these ranges).
  - `@nestjs/common`: `^12.6.0`
  - `@nestjs/core`: `^12.6.0`
  - `@nestjs/platform-express`: `^12.6.0`
  - `@nestjs/swagger`: `^12.1.2`
  - `@nestjs/throttler`: keep `^6.8.0` (supports Nest 12)
  - `@nestjs/testing`: `^12.6.0` (dev)
  - `@nestjs/cli`: `^12.0.15` (dev)
  - `@nestjs/schematics`: `^12.0.16` (dev)
  - `typescript`: `^6.0.3` (dev)
  - `@swc/cli`: `^0.8.2` (dev)
  - Verify: every `@nestjs/*` package declares the 12.x major and no 11.x range remains.
- [x] 3.2a Fix the API build output layout in `apps/api/tsconfig.build.json`.
  - Add `"compilerOptions": { "rootDir": "./src" }`.
  - Add `"scripts"` to `exclude` (standalone `ts-node` utilities; not part of the runtime build).
  - Verify: JSON is valid, `scripts/` is excluded, and the next `nest build` emits `dist/main.js` instead of `dist/src/main.js`.
- [x] 3.2b Apply TypeScript 6 compiler options to `apps/api/tsconfig.json`.
  - Add `"types": ["node", "jest"]`.
  - Add `"strict": false` (preserves today's partial strictness; do not silently adopt full strict).
  - Add `"moduleResolution": "node10"` and `"ignoreDeprecations": "6.0"` (preserves CommonJS resolution; TS 6 soft-deprecates `node10`).
  - Remove `"baseUrl": "./"` (deprecated; the API has no `paths`).
  - Verify: JSON is valid and the config still extends correctly.
- [x] 3.3 Install the API upgrade (user-run; wait for confirmation).
  ```bash
  pnpm --filter @webastro/api add \
    @nestjs/common@^12.6.0 \
    @nestjs/core@^12.6.0 \
    @nestjs/platform-express@^12.6.0 \
    @nestjs/swagger@^12.1.2 \
    @nestjs/throttler@^6.8.0

  pnpm --filter @webastro/api add -D \
    @nestjs/cli@^12.0.15 \
    @nestjs/schematics@^12.0.16 \
    @nestjs/testing@^12.6.0 \
    typescript@^6.0.3 \
    @swc/cli@^0.8.2
  ```
  - Verify: `pnpm --filter @webastro/api list @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/swagger @nestjs/cli @nestjs/schematics @nestjs/testing typescript @swc/cli --depth 0` shows the expected majors.
- [x] 3.4 Build the API.
  - Run: `pnpm -F @webastro/api build`
  - Verify: exit 0, `apps/api/dist/main.js` exists (not `dist/src/main.js`), and `apps/api/dist/scripts/` is absent.
- [x] 3.5a Update the API Jest scripts to run through Node with `--experimental-vm-modules`.
  - Set `test`, `test:watch`, `test:cov`, `test:debug`, and `test:e2e` to:
    ```json
    "test": "node --disable-warning=ExperimentalWarning --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "node --disable-warning=ExperimentalWarning --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
    "test:cov": "node --disable-warning=ExperimentalWarning --experimental-vm-modules node_modules/jest/bin/jest.js --coverage",
    "test:debug": "node --disable-warning=ExperimentalWarning --experimental-vm-modules --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/jest/bin/jest.js --runInBand",
    "test:e2e": "node --disable-warning=ExperimentalWarning --experimental-vm-modules node_modules/jest/bin/jest.js --config ./test/jest-e2e.json"
    ```
  - Verify: `node -e "JSON.parse(require('fs').readFileSync('apps/api/package.json','utf8'))"` succeeds.
- [x] 3.5b Run the API unit suite.
  - Run: `pnpm -F @webastro/api test`
  - Verify: 22 suites / 204 tests pass; the `ExperimentalWarning` is suppressed by `--disable-warning`.
- [x] 3.5c Fix the TS6 `supertest` import, remove the obsolete e2e transform override, and run the API e2e suite.
  - In `apps/api/test/app.e2e-spec.ts`, `auth-optional.e2e-spec.ts`, `rate-limit.e2e-spec.ts`, and `security.e2e-spec.ts`, change `import * as request from 'supertest'` to `import request from 'supertest'` (TS6 always enables `esModuleInterop`).
  - Remove the obsolete `transformIgnorePatterns` override from `apps/api/test/jest-e2e.json` so Jest uses its default and loads `jose` as native ESM under `--experimental-vm-modules`.
  - Run: `pnpm -F @webastro/api test:e2e`
  - Verify: 4 suites / 13 tests pass.
- [x] 3.5d Re-run build and lint after the script change.
  - Run: `pnpm -F @webastro/api build`
  - Run: `pnpm -F @webastro/api exec eslint "{src,apps,libs,test}/**/*.ts"`
  - Verify: both exit 0; the build still emits `dist/main.js`.
- [x] 3.6 Lint the API without auto-fixing.
  - Run: `pnpm -F @webastro/api exec eslint "{src,apps,libs,test}/**/*.ts"`
  - Verify: exit 0 (use this instead of the `lint` script, which passes `--fix`).
- [x] 3.7 Escalation gate.
  - If 3.4–3.5d fail because of a Nest 12 API/decorator/lifecycle change that requires editing `apps/api/src`, STOP. Record the error, update the OpenSpec artifacts first, and ask for approval before touching production source.

## 4. Stage 2 — React 19 (admin)

- [x] 4.1 Update `apps/admin/package.json`.
  - `react`: `^19.3.1`
  - `react-dom`: `^19.3.1`
  - Keep `@types/react`/`@types/react-dom` at `^19.3.0` (already current).
  - Keep `@astrojs/react` at `^6.0.0` (supports React 19; do not jump to 7.x here).
  - Verify: no React 18 range remains in `apps/admin/package.json`.
- [x] 4.2 Install the React upgrade (user-run; wait for confirmation).
  ```bash
  pnpm --filter @webastro/admin add react@^19.3.1 react-dom@^19.3.1
  pnpm --filter @webastro/admin add -D @types/react@^19.3.0 @types/react-dom@^19.3.0
  ```
  - Verify: `pnpm --filter @webastro/admin list react react-dom @types/react @types/react-dom --depth 0` shows 19.3.x for all four.
- [x] 4.3 Build admin.
  - Run: `pnpm -F @webastro/admin build`
  - Verify: exit 0.
- [x] 4.4 Test admin.
  - Run: `pnpm -F @webastro/admin test`
  - Verify: 21 files / 79 tests pass.
  - Note: `apps/admin` has no `lint` script or ESLint config. `pnpm -F @webastro/admin lint` reports no script; `astro check` reports 9 pre-existing errors in unmodified files (the React 19 typings were already installed before this change). No lint tooling is added in this change.
- [x] 4.5 Smoke-test the admin UI (manual, after starting `pnpm -F @webastro/admin dev`).
  - Verify: login page renders, Firebase Auth login works, dashboard loads, article editor and categories pages render without console errors.
- [x] 4.6 Escalation gate.
  - If React 19 requires source changes (for example a removed legacy API), STOP and update the artifacts before editing `apps/admin/src`.

## 5. Stage 3 — Firebase client 13 (admin + API)

- [x] 5.1 Update `firebase` ranges.
  - `apps/admin/package.json`: `firebase` `^13.4.0`
  - `apps/api/package.json`: `firebase` `^13.4.0`
  - Keep `firebase-admin` at `^14.5.1`.
  - Verify: no Firebase 12 range remains in either manifest.
- [x] 5.2 Install the Firebase upgrade (user-run; wait for confirmation).
  ```bash
  pnpm --filter @webastro/admin add firebase@^13.4.0
  pnpm --filter @webastro/api add firebase@^13.4.0
  ```
  - Verify: `pnpm --filter @webastro/admin list firebase --depth 0` and `pnpm --filter @webastro/api list firebase --depth 0` both show 13.4.x.
- [x] 5.3 Confirm the used Firebase surface is unchanged.
  - Inspect `apps/admin/src/lib/firebase.ts`, `apps/admin/src/components/auth/AuthGuard.tsx`, and `TailAdminLogin.tsx`.
  - Verify: they import only `firebase/app` and `firebase/auth`; no AI Logic imports.
- [x] 5.4 Build and test both apps.
  - Run: `pnpm -F @webastro/admin build && pnpm -F @webastro/admin test`
  - Run: `pnpm -F @webastro/api build && pnpm -F @webastro/api test`
  - Verify: all four commands exit 0.

## 6. Stage 4 — Documentation alignment (green)

- [x] 6.1 Update `docs/backend-standards.md` stack block.
  - `Framework: NestJS 12`
  - Add the API toolchain line: `TypeScript 6.0.3` (API only), `Jest 30.x` unchanged, `firebase client 13.4.0`.
  - Verify: no `NestJS 11` reference remains in the current-stack block.
- [x] 6.2 Update `docs/frontend-standards.md` stack block.
  - `Islands: React 19 vía @astrojs/react`
  - Add `Firebase client 13.4.0 (admin login)`.
  - Keep Astro 7.4.13 and the `@astrojs/node` SSR exception unchanged.
  - Verify: no `React 18` or `Firebase 12` reference remains.
- [x] 6.3 Update `docs/base-standards.md` section 8.
  - `Stack API: NestJS 12 ...`
  - `Stack Frontend: ... React 19 (islands) ...`
  - Verify: no `NestJS 11` or `React 18` reference remains.
- [x] 6.4 Update `openspec/project.md`.
  - Table: `NestJS ^12.6.0`, `React ^19.3.1`, `firebase ^13.4.0`, `firebase-admin ^14.5.1`.
  - Add the API `TypeScript ^6.0.3` row.
  - Refresh other stale manifest versions discovered in the table (Tailwind, Supabase, Swagger, throttler, Playwright) so every row matches `package.json`.
  - Correct the stale "Angular-based admin panel" wording to Astro/React.
  - Replace line-number source references (for example `package.json:24-28`) with file paths so future version bumps do not shift them.
  - Verify: every declared version matches the manifest exactly.
- [x] 6.5 Update `openspec/config.yaml` `context`.
  - `NestJS 12`, `React 19 islands`, add `Firebase 13.4.0 client`.
  - Verify: no `NestJS 11`, `React 18`, or `Firebase 12` remains in the context block.
- [x] 6.6 Update `README.md` stack table.
  - `Frontend | ... React 19 (islands) ...`
  - `Backend | NestJS 12 + ...`
  - Verify: no `React 18` or `NestJS 11` remains.
- [x] 6.7 Run the anti-drift validation until green.
  - Run: `pnpm -F @webastro/web test:validation:static`
  - Verify: exit 0, including the assertions added in 2.1.

## 7. Stage 5 — Full verification

- [ ] 7.1 Verify lockfile reproducibility.
  - Run: `pnpm install --frozen-lockfile`
  - Verify: exit 0 (no lockfile changes).
- [x] 7.2 Full build.
  - Run: `pnpm -r build`
  - Verify: exit 0 for `@webastro/api`, `@webastro/web`, `@webastro/admin`, and `@webastro/shared-types`.
- [x] 7.3 Full lint.
  - Run: `pnpm -r --if-present lint`
  - Verify: exit 0.
- [x] 7.4 Full test suite.
  - Run: `pnpm -r test`
  - Verify: all suites pass. If a pre-existing test needs a compatibility fix, limit edits to test code and document the change.
- [x] 7.5 OpenSpec strict validation.
  - Run: `pnpm exec openspec validate --all --strict`
  - Verify: exit 0.
- [x] 7.6 Review the lockfile diff.
  - Run: `git diff --stat pnpm-lock.yaml` and inspect the changed package entries.
  - Verify: only NestJS, React, Firebase, `@swc/cli`, TypeScript (API), and their transitive dependencies moved; no unrelated majors.
- [x] 7.7 Confirm no production source drift.
  - Run: `git status --short`
  - Verify: no changes under `apps/*/src` or `packages/*/src`. Allowed changes: manifests, `pnpm-lock.yaml`, `apps/api/tsconfig*.json`, `apps/web/tests/validation/anti-drift.test.ts`, docs, README, `openspec/config.yaml`, `openspec/project.md`, and this change's artifacts.
- [x] 7.8 Mark completed tasks in this file.
  - Verify: every executed task is checked; do not commit.

## 8. Rollback (only if a stage cannot be stabilized)

- [ ] 8.1 With user approval, restore the pre-upgrade manifests, `pnpm-lock.yaml`, API tsconfigs, anti-drift test, and docs (for example `git restore -- <paths>`; this does not commit anything).
- [ ] 8.2 Restore dependencies and re-run the baseline.
  - Run: `pnpm install --frozen-lockfile`
  - Run: `pnpm -r build && pnpm -r test`
  - Verify: back to the task 1.2 baseline.
