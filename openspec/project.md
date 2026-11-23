# Project — WebAstro Monorepo

## Purpose

Single source of truth for project-level SDD context: product purpose, monorepo
topology, real stack with exact versions, persistence, deployment target,
quality gates, and SDD conventions. Future changes are proposed against this
document, not against outdated documentation.

## Product purpose

WebAstro is the digital presence and API for **Agencia Digital Gabriel Zavando**.
It combines a public-facing Astro site, a React-based admin panel rendered by
Astro SSR, and a NestJS REST API for users, blog, and lead capture. The monorepo is managed
with pnpm workspaces and governed by OpenSpec Spec-Driven Development.

## Monorepo topology

| App | Package | Role | Rendering / Output |
|-----|---------|------|-------------------|
| Web (public site) | `@webastro/web` | Landing page, blog consumption, lead forms | Astro SSG, `output: 'static'`, no adapter |
| Admin (CMS panel) | `@webastro/admin` | Administration panel for content and users | Astro SSR, `output: 'server'`, `@astrojs/node` adapter |
| API (backend) | `@webastro/api` | REST API at `/api/v1`, Firebase Auth, Firestore, Supabase leads | NestJS, Node server |
| Shared types | `@webastro/shared-types` | TypeScript types shared between API and frontend | Library, `tsc` build |

Package manager: pnpm 10 workspaces (`pnpm-workspace.yaml`).

## Real stack (verified against package.json)

| Layer | Technology | Version | Source |
|-------|-----------|---------|--------|
| Runtime | Node.js | >=26.13.1 | `package.json` |
| Package manager | pnpm | >=10 | `package.json` |
| OpenSpec | `@fission-ai/openspec` | ^1.15.0 | `package.json` |
| Frontend framework | Astro | ^7.4.13 | `apps/web/package.json`, `apps/admin/package.json` |
| Frontend CSS | Tailwind CSS | ^4.3.5 | `apps/web/package.json`, `apps/admin/package.json` |
| Frontend islands | React | ^19.3.1 | `apps/admin/package.json` |
| Frontend Firebase client | firebase | ^13.4.0 | `apps/admin/package.json` |
| Backend framework | NestJS | ^12.6.0 | `apps/api/package.json` |
| Backend language | TypeScript | ^6.0.3 | `apps/api/package.json` |
| Frontend language | TypeScript | ^6.0.3 | `apps/web/package.json`, `apps/admin/package.json` |
| Backend lint tooling | ESLint + typescript-eslint + @eslint/js + globals | ^10.15.0 + ^8.73.0 + ^10.0.1 + ^17.14.0 | `apps/api/package.json` |
| Backend Firebase client | firebase | ^13.4.0 | `apps/api/package.json` |
| Backend Admin SDK | firebase-admin | ^14.5.1 | `apps/api/package.json` |
| Backend Supabase SDK | @supabase/supabase-js | ^2.119.2 | `apps/api/package.json` |
| Backend validation | class-validator + class-transformer | ^0.15.1 + ^0.5.1 | `apps/api/package.json` |
| Backend API docs | @nestjs/swagger + swagger-ui-express | ^12.1.2 + ^5.0.1 | `apps/api/package.json` |
| Backend rate limiting | @nestjs/throttler | ^6.8.0 | `apps/api/package.json` |
| Testing (backend) | Jest | ^30.5.2 | `apps/api/package.json` |
| Testing (frontend) | Vitest | ^5.1.1 | `apps/web/package.json`, `apps/admin/package.json` |
| E2E (frontend) | Playwright | ^1.65.1 | `apps/web/package.json`, `apps/admin/package.json` |

### TypeScript 7 blocker

TypeScript 7.0.2 is published but NOT adopted. Its adoption is blocked by
these peer ranges:

- `typescript-eslint` 8.73.0 requires `typescript >=4.8.4 <6.1.0`
- `@nestjs/schematics` 12.0.16 requires `typescript ^6.0.0`
- `ts-jest` 29.4.15 requires `typescript >=4.3 <7`
- `@astrojs/check` 0.9.x requires `typescript ^5.0.0 || ^6.0.0`

TypeScript 7 also rejects the API's `moduleResolution: node10` and
`ignoreDeprecations`, so an ESM/`nodenext` migration is a prerequisite for any
future TypeScript 7 upgrade.

No Prisma dependency exists in any `package.json`. The API stack uses
`firebase-admin` (Firestore) and `@supabase/supabase-js` (Supabase PostgreSQL
for leads only).

## Persistence

- **Firebase Firestore** (via `firebase-admin`): collections `users`, `roles`,
  `articles`, `categories`. Users, roles, blog.
- **Supabase PostgreSQL** (via `@supabase/supabase-js`): tables `leads`,
  `contact_messages`. Leads/prospects only.

## Deployment target

- **Target**: VPS managed with Coolify.
- **Environment**: Staging is the current target; cycle is development →
  deployment.
- **Hostinger is NO LONGER the deployment target.** Hostinger validation tests
  remain in `apps/web/tests/validation/` as legacy and are marked for future
  removal.
- `apps/web`: Coolify Static Site, publish dir `apps/web/dist`.
- `apps/admin`: Coolify Web Application (Node), start command
  `node ./dist/server/entry.mjs`.
- `apps/api`: Coolify Web Application (Nixpacks).

## Real dev/build/test/lint commands per package

### Root (`package.json`)

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all workspaces |
| `pnpm test` | Run all workspace tests |
| `pnpm lint` | Lint all workspaces (if present) |
| `pnpm dev:api` | Start API NestJS in dev mode |
| `pnpm dev:web` | Start web frontend in dev mode |
| `pnpm validate` | Run all workspace tests |

### apps/api (`@webastro/api`)

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start NestJS in watch mode |
| `npm run test` | Run Jest unit tests |
| `npm run test:e2e` | Run Jest e2e tests |
| `npm run test:cov` | Run Jest with coverage |
| `npm run lint` | ESLint with prettier |

### apps/web (`@webastro/web`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Astro dev server |
| `pnpm build` | Astro static build to `dist/` |
| `pnpm test` | Vitest run |
| `pnpm test:validation` | Static + E2E validation |
| `pnpm test:e2e` | Playwright E2E |

### apps/admin (`@webastro/admin`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Astro dev server |
| `pnpm build` | Astro server build (`output: 'server'`) |
| `pnpm test` | Vitest run |
| `pnpm test:e2e` | Playwright E2E |

### packages/shared-types

| Command | Description |
|---------|-------------|
| `pnpm build` | `tsc` build |

## Quality gates

**ENFORCED** (actually configured and running):

- TDD: write failing test before implementation (strict, per project convention)
- Conventional Commits: enforced via `commitlint` (`.commitlintrc.json`)
- OpenSpec strict: `openspec validate --all --strict` → 0 failures required

**ASPIRACIONALES** (documented as goals, NOT enforced — no threshold configured):

- Test coverage 80%: mentioned in standards but no threshold configured in any
  package.json or CI config
- Lint: no lint script configured in web or admin; root `lint` is `--if-present`
- Typecheck: no typecheck script configured in web or admin

## SDD conventions

- Phases: propose → apply (TDD, one task at a time) → verify → adversarial-review → archive → commit
- All artifact text (proposal.md, design.md, specs/, tasks.md) in English
- Commit messages in English, conventional commits format
- Documentation prose (READMEs, client-facing comments) in Spanish (Latinoamericano neutro)
- One command per step; archive only after merge to main
- No production code without a failing test first
