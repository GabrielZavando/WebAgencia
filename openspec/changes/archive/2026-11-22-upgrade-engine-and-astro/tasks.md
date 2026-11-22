# Tasks

> **Execution note for the user:** the `pnpm install` / `pnpm update` commands
> below are written for you to run and confirm. Do not run them as part of
> planning. Upgrade Node to 26.13.1 **before** running any `pnpm` install
> command, or pnpm will warn/fail on the new `engines.node` constraint.

## 1. Red test: extend the anti-drift contract (TDD)

- [x] 1.1 Extend `apps/web/tests/validation/anti-drift.test.ts` so it also
  asserts: root `engines.node` is `>=26.13.1`; `.github/workflows/ci.yml` and
  `.github/workflows/deploy.yml` contain `node-version: 26`; `.nvmrc` contains
  `26.13.1`; `README.md` contains `Node.js >= 26.13.1`; `docs/base-standards.md`
  contains `Astro 7.4.13`. Prefer adding assertions to the existing `it`
  blocks (keeps the 358 baseline); if you add new `it` blocks, record the new
  expected count.
  - Verification: `pnpm --filter @webastro/web test:validation:static` fails
    (red) only on the new assertions, proving the test encodes the target
    state before any manifest/doc change.
- [x] 1.2 Confirm the red state is limited to the new contract assertions.
  - Verification: failure output names engine/CI/nvmrc/README/base-standards
    assertions; no unrelated validation test regresses.

## 2. Manifests and runtime configuration

- [x] 2.1 Update root `package.json` `engines.node` from `">=22.12.0"` to
  `">=26.13.1"`.
  - Verification: `node -e "console.log(require('./package.json').engines.node)"`
    prints `>=26.13.1`.
- [x] 2.2 Update `apps/web/package.json` `dependencies.astro` from `^7.2.1` to
  `^7.4.13`.
  - Verification: `node -e "console.log(require('./apps/web/package.json').dependencies.astro)"`
    prints `^7.4.13`.
- [x] 2.3 Update `apps/admin/package.json` `dependencies.astro` from `^7.2.1`
  to `^7.4.13`; leave `devDependencies["@astrojs/node"]` at `^11.1.14` (already
  correct).
  - Verification: `node -e "const p=require('./apps/admin/package.json');console.log(p.dependencies.astro,p.devDependencies['@astrojs/node'])"`
    prints `^7.4.13 ^11.1.14`.
- [x] 2.4 Create `.nvmrc` at the repo root containing `26.13.1`.
  - Verification: `cat .nvmrc` prints `26.13.1`.
- [x] 2.5 Update `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`
  from `node-version: 22` to `node-version: 26`.
  - Verification: `grep -n "node-version" .github/workflows/ci.yml .github/workflows/deploy.yml`
    shows `26` in both files.
- [x] 2.6 Upgrade the local runtime to the new baseline before installing.
  - Command: `nvm install 26.13.1 && nvm use 26.13.1` (or equivalent version
    manager).
  - Verification: `node --version` prints `v26.13.1`.

## 3. Lockfile regeneration (run only after user confirmation)

- [x] 3.1 Run the scoped update commands to refresh Astro and the Node adapter:
  ```bash
  pnpm --filter @webastro/web update astro@7.4.13
  pnpm --filter @webastro/admin update astro@7.4.13
  pnpm --filter @webastro/admin update @astrojs/node@11.1.14
  ```
  - Verification: each command exits 0; no unrelated package ranges change.
- [x] 3.2 Reconcile the workspace lockfile:
  ```bash
  pnpm install
  ```
  - Verification: `pnpm install` exits 0 with Node 26.13.1 active.
- [x] 3.3 Confirm the resolved versions and caret ranges.
  - Commands:
    ```bash
    pnpm --filter @webastro/web list astro --depth -1
    pnpm --filter @webastro/admin list astro @astrojs/node --depth -1
    ```
  - Verification: Astro resolves to `7.4.13` in both apps and
    `@astrojs/node` to `11.1.14`; if `pnpm update` wrote an exact
    `astro: "7.4.13"`, edit both manifests to `^7.4.13` and rerun
    `pnpm install`.
- [x] 3.4 Inspect the `pnpm-lock.yaml` diff for unintended major jumps.
  - Verification: `git diff pnpm-lock.yaml` shows Astro 7.4.5 → 7.4.13 (and
    related transitive updates) with no unrelated major version changes.

## 4. Documentation alignment

- [x] 4.1 Update `README.md`: stack table `Astro 7.4.13`, requirements
  `Node.js >= 26.13.1`.
  - Verification: `grep -n "Astro 7.4.13\|26.13.1" README.md` returns both.
- [x] 4.2 Update `docs/frontend-standards.md` Framework line to
  `Astro 7.4.13`.
  - Verification: `grep -n "Framework: Astro 7.4.13" docs/frontend-standards.md`.
- [x] 4.3 Update `docs/base-standards.md` Stack Frontend line to
  `Astro 7.4.13`.
  - Verification: `grep -n "Astro 7.4.13" docs/base-standards.md`.
- [x] 4.4 Update `docs/backend-standards.md` `Runtime: Node.js 20 LTS` to
  `Runtime: Node.js 26 LTS` (stale drift found during discovery).
  - Verification: `grep -n "Runtime: Node.js 26 LTS" docs/backend-standards.md`.
- [x] 4.5 Update `openspec/project.md`: Runtime row to `>=26.13.1`, Frontend
  framework row to `^7.4.13`, and the `package.json` line references.
  - Verification: `grep -n "26.13.1\|7.4.13" openspec/project.md` returns the
    updated rows.
- [x] 4.6 Confirm the anti-drift suite is green after the doc/manifest edits.
  - Verification: `pnpm --filter @webastro/web test:validation:static` passes.

## 5. Integration verification

- [x] 5.1 Run the full test suite and confirm the baseline is green (expected
  358 tests; adjust only if new `it` blocks were added in 1.1).
  - Command: `pnpm -r test`
  - Verification: 0 failures; total matches the expected baseline.
- [x] 5.2 Build all workspaces.
  - Command: `pnpm -r build`
  - Verification: every workspace exits 0, including `apps/web` (static) and
    `apps/admin` (SSR via `@astrojs/node`).
- [x] 5.3 Validate OpenSpec artifacts.
  - Command: `pnpm exec openspec validate --all --strict`
  - Verification: `24 passed, 0 failed` (23 existing specs + this change).
- [x] 5.4 Confirm the working tree contains only intended changes (no commit).
  - Command: `git status --short`
  - Verification: only `package.json` (root/web/admin), `pnpm-lock.yaml`,
    `.nvmrc`, the two CI workflows, the listed docs, `openspec/project.md`,
    the extended anti-drift test, `apps/web/src/utils/theme.spec.ts`, and this
    change's artifacts are modified or added.

## 6. Post-apply fix: jsdom localStorage in theme spec

- [x] 6.1 Add an in-memory `localStorage` mock at the top of
  `apps/web/src/utils/theme.spec.ts` (before the `describe`) and install it via
  `Object.defineProperty(window, 'localStorage', { value: localStorageMock })`.
  - Verification: `pnpm --filter @webastro/web exec vitest run src/utils/theme.spec.ts`
    passes all 6 tests under Node 26 (previously failed on `localStorage.clear()`).

## Workflow follow-up

- Review the diff with the user before any commit; commits are explicitly out
  of scope for this planning cycle.
- After approval, archive with `pnpm exec openspec archive upgrade-engine-and-astro --yes`.
- Verify the archived change and that `openspec/specs/sdd-project-context/spec.md`
  now reflects Astro 7.4.13 / Node >=26.13.1.
