# Proposal

## Why

The tooling upgrade roadmap is almost complete: Node 26, Vitest 5 / Jest 30, NestJS 12 / React 19 / Firebase 13 are already in place. The remaining gap is the language-and-lint toolchain. The API still runs ESLint 9 and an outdated `globals`/`@eslint/js` pair, while the monorepo has never recorded which TypeScript 7 blockers are real. Without this change the workspace keeps drifting from the current ecosystem and the "declared stack equals installed stack" anti-drift gate stops covering lint/type tooling.

Registry verification (2026-11-23) shows that TypeScript 7.0.2 and ESLint 10.15.0 are stable, but TypeScript 7 is not adoptable yet: `typescript-eslint@8.73.0` requires `typescript >=4.8.4 <6.1.0`, `@nestjs/schematics@12.0.16` requires `typescript ^6.0.0`, `ts-jest@29.4.15` requires `typescript >=4.3 <7`, and `@astrojs/check` (0.9.9 and 0.9.12) requires `typescript ^5.0.0 || ^6.0.0`. The upgrade therefore lands ESLint 10 now, keeps the API on TypeScript 6.0.3, and moves web/admin to TypeScript 6.0.3 (allowed by `@astrojs/check`) instead of forcing TS 7.

## What Changes

- Upgrade the API lint stack: `eslint` `^9.18.0` → `^10.15.0`, `@eslint/js` `^9.18.0` → `^10.0.1`, `globals` `^15.14.0` → `^17.14.0`.
- Keep `typescript-eslint` at `^8.73.0` (already the latest release and the version that declares `eslint ^8.57 || ^9 || ^10` support) and keep `eslint-config-prettier` `^10.1.8`, `eslint-plugin-prettier` `^5.5.7`, `prettier` `^3.10.1`, `@eslint/eslintrc` `^3.3.7` (all already latest).
- **BREAKING (tooling)**: ESLint 10 removes the legacy `.eslintrc` configuration path and updates `eslint:recommended` with three new rules (`no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error`). The API already uses flat config, so the migration is configuration-only; any new finding is handled in `eslint.config.mjs`, never by editing `apps/api/src`.
- **BLOCKED (documented)**: API TypeScript stays at `^6.0.3`. TypeScript 7.0.2 is blocked by the peer ranges above and by TS 7 hard errors on `moduleResolution: node10`, which the CommonJS API tsconfig still uses. No attempt is made to force TS 7.
- Upgrade `typescript` in `apps/web` and `apps/admin` from `^5.9.3` to `^6.0.3` because the verified `@astrojs/check` peer range accepts TypeScript 6. This requires removing the TS 6-deprecated `baseUrl` from both tsconfigs (`paths` are already relative) and is gated on `astro check`, build, and tests; if the gate fails, both apps return to `^5.9.3` and the blocker is recorded.
- Keep `typescript` at `^6.0.3` for the API and leave `packages/shared-types` (`^5.7.3`) untouched (out of scope; separate follow-up).
- Extend `apps/web/tests/validation/anti-drift.test.ts` (red first) so the declared TypeScript and ESLint versions in the standards, `openspec/project.md`, and `README.md` are asserted against the real manifests, and so the TypeScript 7 blocker is recorded in project context.
- Align documentation: `docs/base-standards.md`, `docs/backend-standards.md`, `docs/frontend-standards.md`, `openspec/project.md`, `openspec/config.yaml`, `README.md`.
- No REST contract, Firestore/Supabase model, or production source changes. The work is limited to manifests, lockfile, lint/TS config, the validation test, and documentation.

## Capabilities

### New Capabilities

None. This is a tooling/documentation change and reuses the existing project-context capability.

### Modified Capabilities

- `sdd-project-context`: the upgraded-toolchain requirement changes from "API on TypeScript 6, web/admin on 5.9.x" to a verified matrix (API TS 6.0.x, web/admin TS 6.0.x, ESLint 10.x, TS 7 documented as blocked), and the anti-drift/documentation requirements gain assertions for the TypeScript and ESLint versions plus the TS 7 blocker record.

## Impact

- Manifests and lockfile: `apps/api/package.json`, `apps/web/package.json`, `apps/admin/package.json`, `pnpm-lock.yaml`.
- Lint and TypeScript config: `apps/api/eslint.config.mjs`, `apps/web/tsconfig.json`, `apps/admin/tsconfig.json` (only if the TS 6 gate requires it).
- Validation: `apps/web/tests/validation/anti-drift.test.ts`.
- Documentation: `docs/base-standards.md`, `docs/backend-standards.md`, `docs/frontend-standards.md`, `openspec/project.md`, `openspec/config.yaml`, `README.md`.
- Verification gates: `pnpm -r build`, `pnpm -r test` (API 204, web 81, admin 79), `pnpm -F @webastro/api test:e2e` (13), API ESLint with 0 errors, `pnpm exec openspec validate --all --strict`.
- Not affected: REST endpoints, `docs/api-spec.yml`, `docs/data-model.md`, Firestore/Supabase schemas, `apps/*/src`, `packages/*/src`.
- Execution constraint: no `pnpm install`/`pnpm add`/`pnpm update` and no `git add`/`git commit`/`git push` is performed during planning; the exact install commands are listed in `tasks.md` for explicit approval.
