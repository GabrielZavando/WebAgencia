# Tasks

> **Execution policy (non-negotiable):**
> - Do **not** run `git add`, `git commit`, or `git push` at any point. The
>   owner runs git manually.
> - Do **not** run `pnpm install`, `pnpm add`, or `pnpm update`. Tasks marked
>   **(user-run)** print the exact command; stop and wait for explicit
>   confirmation before continuing.
> - Do **not** edit anything under `apps/*/src` or `packages/*/src`. If a
>   compatibility fix seems to require production source, STOP, update the
>   OpenSpec artifacts first, and ask for approval.
> - ESLint 10 findings are absorbed in `apps/api/eslint.config.mjs`, never by
>   editing source.
> - `git status` / `git diff` are read-only and allowed.

## 1. Baseline and guardrails

- [x] 1.1 Confirm the working tree contains only this change's planning artifacts.
  - Run: `git status --short`
  - Verify: only `openspec/changes/upgrade-typescript-eslint/` entries appear; no modified tracked files.
- [x] 1.2 Capture the pre-upgrade build and test baseline.
  - Run: `pnpm -r build`
  - Run: `pnpm -r test`
  - Verify: both exit 0. Record the API (204), web (78), and admin (79) test counts; stop if the baseline is already red.
- [x] 1.3 Capture the pre-upgrade `astro check` baseline for web and admin.
  - Run: `pnpm -F @webastro/web exec astro check 2>&1 | tee /tmp/web-check-before.txt`
  - Run: `pnpm -F @webastro/admin exec astro check 2>&1 | tee /tmp/admin-check-before.txt`
  - Verify: record the error count (admin is expected to have pre-existing errors). This baseline is the reference for task 4.3.
- [x] 1.4 Record the exact current tool versions.
  - Run: `pnpm --filter @webastro/api list typescript eslint @eslint/js typescript-eslint globals eslint-config-prettier eslint-plugin-prettier prettier @eslint/eslintrc --depth 0`
  - Run: `pnpm --filter @webastro/web list typescript @astrojs/check --depth 0`
  - Run: `pnpm --filter @webastro/admin list typescript @astrojs/check --depth 0`
  - Verify: api shows TypeScript 6.0.3 and ESLint 9.39.5; web/admin show TypeScript 5.9.3 and `@astrojs/check` 0.9.9.

## 2. Red: anti-drift assertions for TypeScript and ESLint

- [x] 2.1 Add the new assertions to `apps/web/tests/validation/anti-drift.test.ts` (test code only).
  - Inside `describe('Anti-drift: documentation versions match package.json', ...)`, add:
    ```ts
    it('docs declare the installed TypeScript major for API and frontend', () => {
      const apiTs = apiPkg.devDependencies.typescript;
      const webTs = webPkg.devDependencies.typescript;
      const adminTs = adminPkg.devDependencies.typescript;

      expect(majorOf(apiTs)).toBe('6');
      expect(majorOf(webTs)).toBe(majorOf(adminTs));
      expect(majorOf(webTs)).toBe('6');

      expect(backendStandards).toContain(`TypeScript ${apiTs.replace('^', '')}`);
      expect(frontendStandards).toContain(`TypeScript ${webTs.replace('^', '')}`);
      expect(projectMd).toContain(webTs);
      expect(projectMd).toContain(adminTs);
    });

    it('docs declare the installed ESLint ecosystem majors', () => {
      const eslintMajor = majorOf(apiPkg.devDependencies.eslint);

      expect(eslintMajor).toBe('10');
      expect(majorOf(apiPkg.devDependencies['@eslint/js'])).toBe('10');

      expect(backendStandards).toContain(`ESLint ${eslintMajor}`);
      expect(projectMd).toContain(apiPkg.devDependencies.eslint);
      expect(projectMd).toContain(apiPkg.devDependencies['@eslint/js']);
      expect(projectMd).toContain(apiPkg.devDependencies['typescript-eslint']);
    });

    it('project context records the TypeScript 7 blocker', () => {
      expect(projectMd).toMatch(/TypeScript 7/);
      expect(projectMd).toMatch(/typescript-eslint/);
    });
    ```
  - Note: if task 4.4 falls back to TypeScript 5.9.3 in web/admin, change the
    two `toBe('6')` expectations to `toBe(majorOf(webTs))` and document the
    fallback; do not leave a hardcoded `6` that contradicts the manifests.
  - Verify: `pnpm -F @webastro/web exec prettier --check tests/validation/anti-drift.test.ts` exits 0.
- [x] 2.2 Confirm the new assertions fail for the expected reason (red).
  - Run: `pnpm -F @webastro/web test:validation:static`
  - Verify: FAIL only on the three new assertions because web/admin still declare 5.9.3, the docs lack the ESLint line, and `openspec/project.md` lacks the TS 7 blocker. No other failures.

## 3. Stage 1 — ESLint 10 in the API

- [x] 3.1 Update the API lint ranges in `apps/api/package.json`.
  - `eslint`: `^10.15.0`
  - `@eslint/js`: `^10.0.1`
  - `globals`: `^17.14.0`
  - Keep `typescript-eslint`: `^8.73.0`
  - Keep `eslint-config-prettier`: `^10.1.8`
  - Keep `eslint-plugin-prettier`: `^5.5.7`
  - Keep `prettier`: `^3.10.1`
  - Keep `@eslint/eslintrc`: `^3.3.7`
  - Verify: `node -e "JSON.parse(require('fs').readFileSync('apps/api/package.json','utf8'))"` succeeds and no `^9.` ESLint range remains.
- [x] 3.2 **(user-run)** Install the ESLint 10 stack. Print the command and wait for confirmation.
  ```bash
  pnpm --filter @webastro/api add -D \
    eslint@^10.15.0 \
    @eslint/js@^10.0.1 \
    globals@^17.14.0 \
    typescript-eslint@^8.73.0 \
    eslint-config-prettier@^10.1.8 \
    eslint-plugin-prettier@^5.5.7 \
    prettier@^3.10.1 \
    @eslint/eslintrc@^3.3.7
  ```
  - Verify: `pnpm --filter @webastro/api list eslint @eslint/js typescript-eslint globals --depth 0` shows 10.15.x, 10.0.x, 8.73.x, and 17.14.x.
- [x] 3.3 Migrate `apps/api/eslint.config.mjs` for ESLint 10 (config only).
  - Confirm no `.eslintrc*` remains: `git ls-files 'apps/api/**/.eslintrc*'` returns nothing.
  - Confirm no `eslint-env` comments: `rg -n "eslint-env" apps/api` returns nothing; if found, remove the comments.
  - Change `languageOptions.ecmaVersion: 5` to `latest`.
  - Run lint once to discover new `eslint:recommended` findings from `no-unassigned-vars`, `no-useless-assignment`, or `preserve-caught-error`.
  - If those three rules report on existing source, disable exactly the failing rule(s) in the `rules` block with a comment referencing `upgrade-typescript-eslint`. Do not edit source.
  - Verify: `node -e "import('./apps/api/eslint.config.mjs').then(()=>console.log('ok'))"` prints `ok` (requires the installed packages from 3.2).
- [x] 3.4 Lint the API with zero errors and zero source edits.
  - Run: `pnpm -F @webastro/api exec eslint "{src,apps,libs,test}/**/*.ts"`
  - Run: `git status --short apps/api/src`
  - Verify: ESLint exits 0 and `git status --short apps/api/src` is empty.
  - Note: the `lint` script appends `--fix`; if you run `pnpm -F @webastro/api lint`, immediately run `git status --short apps/api/src` and revert nothing automatically — stop and report if it modified source.
- [x] 3.5 Confirm the API build and unit tests still pass after ESLint tooling changes.
  - Run: `pnpm -F @webastro/api build`
  - Run: `pnpm -F @webastro/api test`
  - Verify: build exits 0, API reports 204 passing tests.

## 4. Stage 2 — TypeScript 6 in web/admin

- [x] 4.1 Update `apps/web/package.json` and `apps/admin/package.json`.
  - `typescript`: `^6.0.3` in both.
  - Verify: `rg -n '"typescript"' apps/web/package.json apps/admin/package.json` shows `^6.0.3` in both and no `^5.9.3` remains.
- [x] 4.2 Remove the TS 6-deprecated `baseUrl` from `apps/web/tsconfig.json` and `apps/admin/tsconfig.json`.
  - Delete the `"baseUrl": "."` line in both files; keep `"paths": { "@/*": ["./src/*"] }`.
  - Verify: `rg -n "baseUrl" apps/web/tsconfig.json apps/admin/tsconfig.json` returns nothing.
- [x] 4.3 **(user-run)** Install TypeScript 6 in web and admin. Print the commands and wait for confirmation.
  ```bash
  pnpm --filter @webastro/web add -D typescript@^6.0.3
  pnpm --filter @webastro/admin add -D typescript@^6.0.3
  ```
  - Verify: `pnpm --filter @webastro/web list typescript --depth 0` and `pnpm --filter @webastro/admin list typescript --depth 0` both show 6.0.x.
- [x] 4.4 Run the TypeScript 6 gate for web.
  - Run: `pnpm -F @webastro/web exec astro check 2>&1 | tee /tmp/web-check-after.txt`
  - Run: `pnpm -F @webastro/web build`
  - Run: `pnpm -F @webastro/web test`
  - Verify: build and tests exit 0; the `astro check` error count is not greater than the baseline from 1.3. Web tests report 81 passing (78 pre-existing + 3 new anti-drift assertions).
- [x] 4.5 Run the TypeScript 6 gate for admin.
  - Run: `pnpm -F @webastro/admin exec astro check 2>&1 | tee /tmp/admin-check-after.txt`
  - Run: `pnpm -F @webastro/admin build`
  - Run: `pnpm -F @webastro/admin test`
  - Verify: build and tests exit 0; the `astro check` error count is not greater than the baseline from 1.3 (9 pre-existing errors expected). Admin tests report 79 passing.
- [ ] 4.6 Fallback gate (conditional): if 4.4 or 4.5 fails because of a real TS 6 incompatibility.
  - **(user-run)** Revert both apps:
    ```bash
    pnpm --filter @webastro/web add -D typescript@^5.9.3
    pnpm --filter @webastro/admin add -D typescript@^5.9.3
    ```
  - Restore `baseUrl` in both tsconfigs if needed for TS 5.9.
  - Update `openspec/project.md` and `docs/frontend-standards.md` with the blocker (Astro checker / language server rejects TS 6 in practice), adjust the anti-drift test expectations to 5, and re-run 4.4–4.5. Do not force TS 6.

## 5. Documentation alignment (green)

- [x] 5.1 Update `docs/backend-standards.md` stack block.
  - Add the ESLint toolchain line: `ESLint 10.x + typescript-eslint 8.73.x (flat config)`.
  - Keep `TypeScript 6.0.3 (api)` (or update to the exact installed range from the manifest).
  - Verify: `rg -n "ESLint 10|TypeScript 6" docs/backend-standards.md` returns both.
- [x] 5.2 Update `docs/frontend-standards.md` stack block.
  - Add `TypeScript 6.0.3` (or the installed range) for web/admin.
  - Keep Astro 7.4.13, React 19.3.1, and the `@astrojs/node` SSR exception unchanged.
  - Verify: `rg -n "TypeScript 6" docs/frontend-standards.md` returns a match.
- [x] 5.3 Update `docs/base-standards.md` section 8.
  - Add the toolchain note: `TypeScript 6.0.3 (api, web, admin cuando @astrojs/check lo permite) | ESLint 10 (api)`.
  - Verify: `rg -n "ESLint 10|TypeScript 6" docs/base-standards.md` returns both.
- [x] 5.4 Update `openspec/project.md` stack table and add the blocker record.
  - Add rows: `TypeScript (api)` `^6.0.3`, `TypeScript (web/admin)` `^6.0.3` (or the fallback), `ESLint` `^10.15.0`, `@eslint/js` `^10.0.1`, `typescript-eslint` `^8.73.0`, `globals` `^17.14.0`.
  - Add a short `### TypeScript 7 blocker` note under the stack table recording that TS 7.0.2 is blocked by `typescript-eslint` (`<6.1.0`), `@nestjs/schematics` (`^6.0.0`), `ts-jest` (`<7`), and `@astrojs/check` (`^5 || ^6`), plus the API's `moduleResolution: node10` hard error.
  - Verify: `rg -n "TypeScript 7|typescript-eslint|\^10.15.0" openspec/project.md` returns the blocker and ranges.
- [x] 5.5 Update `openspec/config.yaml` context.
  - Add `TypeScript 6.0.3 (api, web, admin)` and `ESLint 10` to the context block; keep it free of test counts.
  - Verify: `pnpm exec openspec validate --all --strict` still parses the config.
- [x] 5.6 Update `README.md` stack table.
  - Add a tooling row: `Tooling | TypeScript 6.0.3 (api, web, admin) + ESLint 10 (api)`.
  - Verify: `rg -n "TypeScript 6|ESLint 10" README.md` returns a match.
- [x] 5.7 Re-run the anti-drift validation until green.
  - Run: `pnpm -F @webastro/web test:validation:static`
  - Verify: exit 0, including the assertions added in 2.1.

## 6. Full verification

- [ ] 6.1 Verify lockfile reproducibility.
  - Run: `pnpm install --frozen-lockfile`
  - Verify: exit 0 with no lockfile changes.
- [x] 6.2 Full build.
  - Run: `pnpm -r build`
  - Verify: exit 0 for `@webastro/api`, `@webastro/web`, `@webastro/admin`, and `@webastro/shared-types`.
- [x] 6.3 Full test suite.
  - Run: `pnpm -r test`
  - Verify: API 204, web 81, admin 79 tests pass.
- [x] 6.4 API end-to-end suite.
  - Run: `pnpm -F @webastro/api test:e2e`
  - Verify: 4 suites / 13 tests pass.
- [x] 6.5 Full lint.
  - Run: `pnpm -r --if-present lint`
  - Verify: exit 0; `git status --short apps/api/src` stays empty.
- [x] 6.6 OpenSpec strict validation.
  - Run: `pnpm exec openspec validate --all --strict`
  - Verify: exit 0.
- [x] 6.7 Review the lockfile diff.
  - Run: `git diff --stat pnpm-lock.yaml`
  - Verify: only the ESLint 10 stack (`eslint`, `@eslint/js`, `globals`, transitive) and TypeScript for web/admin moved; no unrelated majors.
- [x] 6.8 Confirm no production source drift.
  - Run: `git status --short`
  - Verify: no changes under `apps/*/src` or `packages/*/src`. Allowed changes: `apps/api/package.json`, `apps/web/package.json`, `apps/admin/package.json`, `pnpm-lock.yaml`, `apps/api/eslint.config.mjs`, `apps/web/tsconfig.json`, `apps/admin/tsconfig.json`, `apps/web/tests/validation/anti-drift.test.ts`, docs, `openspec/config.yaml`, `openspec/project.md`, `README.md`, and this change's artifacts.
- [x] 6.9 Mark completed tasks in this file.
  - Verify: every executed task is checked; do not commit.

## 7. Rollback (only if a stage cannot be stabilized)

- [ ] 7.1 With user approval, restore the pre-change manifests, `pnpm-lock.yaml`, `apps/api/eslint.config.mjs`, web/admin tsconfigs, the anti-drift test, and docs (for example `git restore -- <paths>`; this does not commit anything).
- [ ] 7.2 **(user-run)** Restore dependencies and re-run the baseline.
  ```bash
  pnpm install --frozen-lockfile
  pnpm -r build && pnpm -r test
  ```
  - Verify: back to the task 1.2 baseline.

## Workflow follow-up

- Run `/verify upgrade-typescript-eslint` against the scenarios in the delta spec.
- Run `/adversarial-review` before archiving.
- Archive with the native CLI after the owner merges: `pnpm exec openspec archive upgrade-typescript-eslint --yes`.
- The owner commits manually; the agent never runs `git add`, `git commit`, or `git push`.
