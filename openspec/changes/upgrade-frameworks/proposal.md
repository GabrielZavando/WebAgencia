# Proposal

## Why

The monorepo still runs NestJS 11, React 18, and Firebase 12 while its runtime baseline is already Node 26.13.1 and the testing/tooling ecosystem has moved to TypeScript 6-aware releases. NestJS 12 (released August 2026) and Firebase 13 (released October 2026) are the current stable lines, and React 19 is the supported runtime for the React 19 typings the admin app already compiles against. Staying pinned increases security and compatibility risk and blocks future feature work that assumes the current majors.

## What Changes

- Upgrade the NestJS ecosystem in `apps/api` from 11.1.x to 12.6.x: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/testing`, `@nestjs/swagger` (11.4 → 12.1), and CLI/schematics (11.x → 12.x). **BREAKING**: Nest 12 packages are ESM-only; the CommonJS API consumes them through Node's `require(esm)` support (Node 26 satisfies this). `@nestjs/throttler` 6.8 already supports Nest 12 and stays.
- Upgrade the API toolchain required by Nest 12: TypeScript `^5.7.3` → `^6.0.3` (required by `@nestjs/schematics` 12) and `@swc/cli` `^0.6.0` → `^0.8.2` (Nest CLI 12 peer). **BREAKING**: TypeScript 6 changes defaults for `types`, `rootDir`, and `strict`, and deprecates `baseUrl`/`moduleResolution: node10`; the API `tsconfig` must be made explicit. Web/admin remain on TypeScript 5.9.
- Upgrade the React runtime in `apps/admin` from 18.3.1 to 19.3.1. `@types/react`/`@types/react-dom` are already 19.x, so runtime and types become aligned. `@astrojs/react` 6.0.1 already supports React 19 and is not moved to 7.x in this change.
- Upgrade the Firebase client from 12.16.0 to 13.4.0 in `apps/admin` and `apps/api` (the API dependency is currently unused). **BREAKING**: Firebase 13 removes deprecated AI Logic APIs, which this project does not use; the modular `firebase/app` and `firebase/auth` APIs used here are unchanged. `firebase-admin` 14.5.1 is already current and stays.
- Add anti-drift assertions for framework majors and update the declared stack in `docs/frontend-standards.md`, `docs/backend-standards.md`, `docs/base-standards.md`, `openspec/project.md`, `openspec/config.yaml`, and `README.md`.
- No REST contract, Firestore/Supabase model, or production source changes are expected. The work is limited to manifests, lockfile, TypeScript config for the API, validation tests, and documentation.

## Capabilities

### New Capabilities

None. This is a tooling/runtime upgrade plus documentation alignment, and it reuses the existing project-context capability rather than inventing a product capability.

### Modified Capabilities

- `sdd-project-context`: the declared-stack requirement moves from NestJS 11 / React 18 / Firebase 12 to NestJS 12.x / React 19.x / Firebase 13.x, and the anti-drift/quality-gate requirements gain checks that the upgraded framework majors are actually installed and verified.

## Impact

- Manifests and lockfile: `apps/api/package.json`, `apps/admin/package.json`, `pnpm-lock.yaml`.
- API TypeScript configuration: `apps/api/tsconfig.json`, `apps/api/tsconfig.build.json`.
- Validation: `apps/web/tests/validation/anti-drift.test.ts`.
- Documentation: `docs/frontend-standards.md`, `docs/backend-standards.md`, `docs/base-standards.md`, `openspec/project.md`, `openspec/config.yaml`, `README.md`.
- Verification gates: `pnpm -r build`, `pnpm -r test`, `pnpm -r --if-present lint`, `pnpm exec openspec validate --all --strict`.
- Not affected: REST endpoints, API spec (`docs/api-spec.yml`), data model (`docs/data-model.md`), Firestore/Supabase schemas.
- Execution constraint: no `pnpm install`/`pnpm update` and no commit/push is performed during planning; the exact install commands are listed in `tasks.md` for explicit approval.
