## Why

Several dependencies in the WebAstro monorepo have minor or patch updates available. Updating them keeps the project current with security patches and bug fixes without introducing breaking changes. This change establishes the reusable pattern for dependency upgrades: update → verify tests → update docs if needed → commit. Major-version jumps (NestJS 11→12, React 18→19, TypeScript 5→7, Vitest 4→5, Astro engine bump) are intentionally deferred to separate changes.

## What Changes

Update the following packages to their latest minor/patch versions (no major jumps), per workspace:

**Build & Tooling:**
- `@astrojs/node`: 11.1.9 → 11.1.14 (admin)
- `@eslint/eslintrc`: 3.3.6 → 3.3.7 (api)
- `@tailwindcss/vite`: 4.3.3 → 4.3.5 (admin, web)
- `@vitejs/plugin-react`: 6.0.3 → 6.3.0 (admin, web)
- `eslint-plugin-prettier`: 5.5.6 → 5.5.7 (api)
- `prettier`: 3.9.5 → 3.10.1 (api)
- `tailwind-merge`: 3.7.0 → 3.7.1 (admin)
- `tailwindcss`: 4.3.3 → 4.3.5 (admin, web)

**Testing:**
- `@testing-library/react`: 16.3.2 → 16.3.3 (admin, web)
- `@playwright/test`: 1.61.1 → 1.65.1 (admin, web)
- `supertest`: 7.2.2 → 7.3.2 (api)
- `ts-jest`: 29.4.11 → 29.4.15 (api)

**API:**
- `@nestjs/throttler`: 6.5.0 → 6.8.0 (api)
- `@supabase/supabase-js`: 2.110.8 → 2.119.2 (api)
- `@swc/core`: 1.15.46 → 1.16.22 (api)
- `firebase-admin`: 14.2.0 → 14.5.1 (api)
- `dotenv`: 17.4.2 → 18.0.10 (api)

**Admin UI:**
- `@tiptap/extension-image`: 3.32.0 → 3.35.0 (admin)
- `@tiptap/pm`: 3.32.0 → 3.35.0 (admin)
- `@tiptap/react`: 3.32.0 → 3.35.0 (admin)
- `@tiptap/starter-kit`: 3.32.0 → 3.35.0 (admin)
- `@types/react`: 19.2.17 → 19.3.0 (admin)
- `@types/react-dom`: 19.2.3 → 19.3.0 (admin)
- `lucide-react`: 1.60.0 → 1.77.0 (admin)

**Linting:**
- `typescript-eslint`: 8.65.0 → 8.73.0 (api)

## Capabilities

### New Capabilities

(None — this change introduces no new capabilities.)

### Modified Capabilities

(None — this change modifies no capability requirements; it only updates dependency patch/minor versions.)

## Impact

- `package.json` files: root, `apps/api`, `apps/web`, `apps/admin`
- `pnpm-lock.yaml` (regenerated via `pnpm update`)
- `docs/frontend-standards.md` (only if Tailwind version reference changes from 4.2.x to 4.3.x)
- Anti-drift validation test in `apps/web/tests/validation/` (if new versions are documented)

`skip_specs: true`
