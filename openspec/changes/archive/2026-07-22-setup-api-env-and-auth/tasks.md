## 1. Environment Setup

- [x] 1.1 Create `apps/api/.env` from `.env.example` with Firebase Admin SDK credentials extracted from `api-web-agencia-firebase.json` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- [x] 1.2 Add placeholder `DATABASE_URL` in `.env` with comment indicating Supabase URL is pending
- [x] 1.3 Verify `.env` is in `apps/api/.gitignore` (already should be from root `.gitignore`)

## 2. Prisma Infrastructure

- [x] 2.1 Add `@prisma/client` to `dependencies` in `apps/api/package.json`
- [x] 2.2 Run `pnpm install` in `apps/api`
- [x] 2.3 Run `npx prisma generate` to generate Prisma client from schema
- [x] 2.4 Create `apps/api/src/prisma/prisma.service.ts` extending `PrismaClient` with `OnModuleInit` and `OnModuleDestroy` lifecycle hooks
- [x] 2.5 Create `apps/api/src/prisma/prisma.module.ts` as `@Global()` module exporting `PrismaService`
- [x] 2.6 Register `PrismaModule` in `app.module.ts` imports

## 3. Auth Logout Endpoint

- [x] 3.1 Add `@Post('logout')` method to `apps/api/src/auth/auth.controller.ts` with Swagger decorators
- [x] 3.2 Implement logout logic: clear session cookie via `Set-Cookie` header with `max-age=0`, `httpOnly`, `sameSite=strict`
- [x] 3.3 Return `{ data: null, meta: { message: "Sesión cerrada exitosamente" } }` on success
- [x] 3.4 Write unit test for logout endpoint (test cookie clearing and response format)

## 4. Leads Module

- [x] 4.1 Create `apps/api/src/leads/dto/create-lead.dto.ts` with class-validator decorators: `name` (string, 2-120), `email` (IsEmail), `message` (string, 10+), optional `phone`, optional `subject`
- [x] 4.2 Create `apps/api/src/leads/leads.repository.ts` with `create(data)` method using Prisma to persist Lead + ContactMessage
- [x] 4.3 Create `apps/api/src/leads/leads.service.ts` with `createLead(dto)` that handles upsert by email (if lead exists, create new ContactMessage linked to existing lead)
- [x] 4.4 Create `apps/api/src/leads/leads.controller.ts` with `POST /leads/contact` endpoint (public, no auth guard)
- [x] 4.5 Create `apps/api/src/leads/leads.module.ts` importing `PrismaModule`, registering controller, service, and repository
- [x] 4.6 Register `LeadsModule` in `app.module.ts` imports

## 5. Integration & Validation

- [x] 5.1 Start API with `npm run start:dev` and verify Firebase Admin SDK initializes successfully (log message appears)
- [x] 5.2 Test `POST /api/v1/auth/logout` returns 200 with correct response format
- [x] 5.3 Test `POST /api/v1/leads/contact` with valid payload returns 503 when DATABASE_URL is placeholder (Prisma not connected)
- [x] 5.4 Verify `POST /api/v1/auth/me` still works after logout (returns 401 as expected)
- [x] 5.5 Update `docs/api-spec.yml` with new endpoints: `POST /auth/logout` and `POST /leads/contact`
