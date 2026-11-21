## 1. Build & Tooling (lowest blast radius)

- [x] 1.1 Update `@astrojs/node` 11.1.9 → 11.1.14 in `apps/admin/package.json`; verify `pnpm-lock.yaml` shows no major jump.
  - Verification: `pnpm -F @webastro/admin build` succeeds; `pnpm-lock.yaml` diff contains only `@astrojs/node` version change.
- [x] 1.2 Update `@eslint/eslintrc` 3.3.6 → 3.3.7 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api lint` runs without config errors.
- [x] 1.3 Update `@tailwindcss/vite` 4.3.3 → 4.3.5 in `apps/web` and `apps/admin`.
  - Verification: `pnpm -F @webastro/web build` and `pnpm -F @webastro/admin build` succeed.
- [x] 1.4 Update `@vitejs/plugin-react` 6.0.3 → 6.3.0 in `apps/web` and `apps/admin`.
  - Verification: both admin and web builds succeed (Vite plugin loads).
- [x] 1.5 Update `eslint-plugin-prettier` 5.5.6 → 5.5.7 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api lint` passes.
- [x] 1.6 Update `prettier` 3.9.5 → 3.10.1 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api format` runs without errors.
- [x] 1.7 Update `tailwind-merge` 3.7.0 → 3.7.1 in `apps/admin/package.json`.
  - Verification: `pnpm -F @webastro/admin build` succeeds.
- [x] 1.8 Update `tailwindcss` 4.3.3 → 4.3.5 in `apps/web` and `apps/admin`.
  - Verification: both builds succeed; no CSS build errors.

## 2. Testing

- [x] 2.1 Update `@testing-library/react` 16.3.2 → 16.3.3 in `apps/web` and `apps/admin`.
  - Verification: `pnpm -F @webastro/web test` and `pnpm -F @webastro/admin test` pass.
- [x] 2.2 Update `@playwright/test` 1.61.1 → 1.65.1 in `apps/web` and `apps/admin`.
  - Verification: `pnpm -F @webastro/web test:e2e` and `pnpm -F @webastro/admin test:e2e` run (or at least install browsers without errors).
- [x] 2.3 Update `supertest` 7.2.2 → 7.3.2 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api test:e2e` passes.
- [x] 2.4 Update `ts-jest` 29.4.11 → 29.4.15 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api test` passes (Jest + ts-jest transform works).

## 3. API

- [x] 3.1 Update `@nestjs/throttler` 6.5.0 → 6.8.0 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api build` succeeds; NestJS compiles.
- [x] 3.2 Update `@supabase/supabase-js` 2.110.8 → 2.119.2 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api build` succeeds; no type errors from Supabase SDK.
- [x] 3.3 Update `@swc/core` 1.15.46 → 1.16.22 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api build` succeeds (SWC compiles NestJS source).
- [x] 3.4 Update `firebase-admin` 14.2.0 → 14.5.1 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api build` succeeds; firebase-admin imports resolve.
- [x] 3.5 Update `dotenv` 17.4.2 → 18.0.10 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api build` succeeds; dotenv loads at runtime.

## 4. Admin UI

- [x] 4.1 Update `@tiptap/extension-image`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit` 3.32.0 → 3.35.0 in `apps/admin/package.json`.
  - Verification: `pnpm -F @webastro/admin build` succeeds; Tiptap editor components compile.
- [x] 4.2 Update `@types/react` 19.2.17 → 19.3.0 and `@types/react-dom` 19.2.3 → 19.3.0 in `apps/admin/package.json`.
  - Verification: `pnpm -F @webastro/admin build` succeeds; no React type errors in admin islands.
- [x] 4.3 Update `lucide-react` 1.60.0 → 1.77.0 in `apps/admin/package.json`.
  - Verification: `pnpm -F @webastro/admin build` succeeds; lucide icons import without errors.

## 5. Linting

- [x] 5.1 Update `typescript-eslint` 8.65.0 → 8.73.0 in `apps/api/package.json`.
  - Verification: `pnpm -F @webastro/api lint` passes with new typescript-eslint rules.

## 6. Verification (all workspaces)

- [x] 6.1 Run `pnpm -r test` and confirm all 358 tests pass (api 204, admin 79, web 75).
  - Verification: test output shows 358 passed, 0 failed.
- [x] 6.2 Run `pnpm -r build` and confirm all workspaces build without errors.
  - Verification: all workspace builds exit 0.
- [x] 6.3 Run `npx openspec validate --all --strict` and confirm 0 failures.
  - Verification: validation reports all specs pass.
- [x] 6.4 Inspect `pnpm-lock.yaml` diff to confirm no major version jumps were introduced.
  - Verification: `git diff pnpm-lock.yaml` shows only the intended minor/patch version changes.

## 7. Documentation check

- [x] 7.1 Check `docs/frontend-standards.md` for hard-coded Tailwind version references (4.2.x → 4.3.x).
  - Verification: if a version string references Tailwind 4.2.x, update to 4.3.x; otherwise no change needed.
- [x] 7.2 Check `docs/api-spec.yml` and `docs/data-model.md` for any dependency version references that changed.
  - Verification: no doc updates needed, or updates made if versions are explicitly declared.
- [x] 7.3 Run anti-drift validation test in `apps/web/tests/validation/` and confirm it still passes.
  - Verification: `pnpm -F @webastro/web test:validation:static` passes.

## 8. Commit

- [x] 8.1 Stage all changed files: `package.json` (root, api, web, admin), `pnpm-lock.yaml`, any doc updates.
  - Verification: `git status` shows only intended changes.
- [x] 8.2 Commit with conventional commit message: `feat(deps): update safe minor/patch dependencies`.
  - Verification: commit created successfully; `git log --oneline -1` shows the new commit.
