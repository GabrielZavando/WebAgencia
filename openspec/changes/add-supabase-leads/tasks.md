## 1. Setup

- [x] 1.1 Install `@supabase/supabase-js` dependency in `apps/api/package.json`
- [x] 1.2 Add Supabase environment variables to `apps/api/.env.example` (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_JWKS_URL)
- [x] 1.3 Remove Prisma dependencies from `apps/api/package.json` (`@prisma/client`, `@prisma/adapter-pg`, `pg`)
- [x] 1.4 Remove `DATABASE_URL` from `apps/api/.env.example`

## 2. SupabaseModule

- [x] 2.1 Create `apps/api/src/supabase/supabase.module.ts` with `@Global()` decorator
- [x] 2.2 Create `apps/api/src/supabase/supabase.service.ts` implementing `OnModuleInit`
- [x] 2.3 Implement `SupabaseService` to initialize client with `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
- [x] 2.4 Add validation for missing environment variables with descriptive error messages
- [x] 2.5 Export `SupabaseService` from `SupabaseModule`
- [x] 2.6 Register `SupabaseModule` in `apps/api/src/app.module.ts`

## 3. LeadsModule Update

- [x] 3.1 Update `apps/api/src/leads/leads.module.ts` to import `SupabaseModule` instead of `PrismaModule`
- [x] 3.2 Update `apps/api/src/leads/leads.repository.ts` to inject `SupabaseService` instead of `PrismaService`
- [x] 3.3 Refactor `LeadsRepository.findLeadByEmail()` to use `supabase.from('leads').select('*').eq('email', email).single()`
- [x] 3.4 Refactor `LeadsRepository.createLead()` to use `supabase.from('leads').insert()`
- [x] 3.5 Refactor `LeadsRepository.createContactMessage()` to use `supabase.from('contact_messages').insert()`
- [x] 3.6 Update `LeadsRepository` to handle Supabase errors gracefully (return null on not found, throw on other errors)

## 4. Remove Prisma

- [x] 4.1 Delete `apps/api/src/prisma/` directory (prisma.module.ts, prisma.service.ts)
- [x] 4.2 Delete `apps/api/prisma/` directory (schema.prisma, migrations, config)
- [x] 4.3 Remove `PrismaModule` import from `apps/api/src/app.module.ts`
- [x] 4.4 Remove Prisma-related mock files from `apps/api/src/__mocks__/` if they exist

## 5. Testing

- [x] 5.1 Create unit test for `SupabaseService` initialization
- [x] 5.2 Create unit test for `LeadsRepository` with mocked `SupabaseService`
- [x] 5.3 Update existing `LeadsModule` tests to use `SupabaseService` mock instead of `PrismaService` mock
- [x] 5.4 Verify `POST /api/v1/leads/contact` endpoint works with Supabase backend

## 6. Documentation

- [x] 6.1 Update `docs/data-model.md` to remove Prisma references for Leads tables
- [x] 6.2 Update `docs/backend-standards.md` to reflect Supabase SDK usage
- [x] 6.3 Update README or relevant docs to reflect new database setup
