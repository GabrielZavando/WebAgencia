# Tasks

## 1. TDD — Anti-drift test (red first)

- [x] 1.1 Write the anti-drift test under apps/web/tests/validation/ following the dependency-audit.test.ts precedent; it asserts that versions and stack declared in documentation match the real package.json files. Verification: create the file and run it — it MUST fail (red) against the current (drifted) documentation. Command: pnpm -F @webastro/web test tests/validation/<new-test-file>.test.ts
- [x] 1.2 Capture the red-failure evidence (which docs assertions fail). Verification: test output shows failures pointing at README, docs/base-standards.md, docs/frontend-standards.md drift.

## 2. Documentation fixes (turn the test green)

- [x] 2.1 Create openspec/project.md documenting product purpose, monorepo topology (3 apps + shared-types, pnpm), real stack with exact versions, persistence (Firestore via firebase-admin, Supabase only for leads), deployment target (VPS with Coolify, staging), real dev/build/test/lint commands per package, quality gates (ENFORCED vs ASPIRACIONALES), and SDD conventions. Verification: file exists at openspec/project.md and contains all required sections citing evidence path:line.
- [x] 2.2 Populate openspec/config.yaml context and rules fields (currently comments only) with the verified stack and SDD conventions. Verification: config.yaml has a populated context field (not just example comments).
- [x] 2.3 Fix README.md: correct frontend version (Astro 5 → Astro 7.2.1), OpenSpec version (1.4 → 1.15.0), add apps/admin to structure, align deployment target to Coolify (remove Hostinger FTP references). Verification: README stack table matches package.json versions exactly.
- [x] 2.4 Fix docs/base-standards.md section 8: remove Prisma from the API stack; reflect firebase-admin (Firestore) + @supabase/supabase-js (leads). Verification: no Prisma reference remains; firebase-admin and @supabase/supabase-js are listed.
- [x] 2.5 Fix docs/frontend-standards.md: correct Astro version (5.17.x → 7.2.x), remove the SSR prohibition (apps/admin uses output: 'server' by design), align hosting target to Coolify. Keep Hostinger validation tests intact as legacy work marked for future removal. Verification: Astro 7.2.x stated, no SSR prohibition, Coolify target.

## 3. OpenSpec version unification

- [x] 3.1 Remove the duplicate @fission-ai/openspec devDependency from apps/api/package.json, keeping root (^1.15.0) as the single source. Condition already verified: no apps/api script invokes the local openspec binary (scripts use nest, jest, ts-node only — apps/api/package.json:8-21). Verification: apps/api/package.json no longer contains @fission-ai/openspec; root package.json keeps ^1.15.0.
- [x] 3.2 Sync pnpm-lock.yaml after removing the devDep. Verification: pnpm install runs cleanly and lockfile reflects the removal. NOTE: this task executes during /opsx-apply, not during planning.

## 4. Verification (green + full suite)

- [x] 4.1 Run the anti-drift test and confirm it passes (green) against corrected documentation. Verification: pnpm -F @webastro/web test tests/validation/<new-test-file>.test.ts passes.
- [x] 4.2 Run the full test suite to confirm all 316 existing tests plus the new anti-drift test are green. Verification: pnpm -r --no-bail test exits 0.

## Workflow follow-up

- Run npx openspec validate --all --strict → expect 0 failures.
- Archive the change with pnpm exec openspec archive restore-sdd-context --yes.
- Commit with conventional commits (docs: restore SDD context to real stack and Coolify target).

## 5. Test gate hardening

- [x] 5.1 D1: Derive ROOT from import.meta.url instead of process.cwd(). Verification: test passes when run from repo root (cwd=root). Command: bash apps/web/node_modules/.bin/vitest run tests/validation/anti-drift.test.ts
- [x] 5.2 D2: Remove unused adminPkg and sharedTypesPkg variables. Verification: no unused variables; zero TypeScript/ESLint complaints.
- [x] 5.3 D3: Replace weak /context:/ regex with hasPopulatedField() helper for context and rules. Verification: helper returns false for empty/comment-only fields, true for real content. Helper covered by 5 inline fixture tests.
- [x] 5.4 D4: Replace incomplete SSR regex with prohibitsSsr() helper covering prohibido/prohibida, forbidden, not allowed, no permitido, must not, no SSR (EN+ES). Verification: helper covered by 12 inline fixture tests (11 positive + 1 negative).
- [x] 5.5 Demonstrate old regex was decorative: /context:/ matches empty/comment-only yaml, hasPopulatedField rejects both. Evidence captured in test run output.
- [x] 5.6 Run full suite: all 327 tests green (api 204, admin 79, web 61). Verification: pnpm -r --no-bail test exits 0.

## 6. Contradiction closure

- [x] 6.1 H5: frontend-standards.md anti-patterns — replace blanket adapter prohibition with @astrojs/node exception BY DESIGN. Verification: prohibitsNodeAdapter(frontendStandards) returns false; doc mentions @astrojs/node.
- [x] 6.2 H6: frontend-standards.md anti-patterns — replace blanket Firebase prohibition with firebase-admin (server SDK) prohibited + client SDK (firebase/auth) permitted. Verification: prohibitsFirebaseClientSdk(frontendStandards) returns false; doc mentions firebase-admin specifically, not "Firebase / Firebase admin".
- [x] 6.3 H8: config.yaml context — remove stale "316 tests green (api 22/204, admin 21/79, web 8/33)" phrase. Verification: containsTestCount(configYaml) returns false.
- [x] 6.4 H9: config.yaml context — remove version numbers (Astro 7.2.1, OpenSpec 1.15.0); keep architectural decisions (single source root devDependency). Verification: context contains no version numbers.
- [x] 6.5 H11: config.yaml rules.tasks — remove lockfile sync rule (change-specific detail, not permanent rule). Verification: rules.tasks has 3 entries, no lockfile mention.
- [x] 6.6 H1: README.md flow block — replace /enrich-us legacy command with /opsx-explore and faithful /opsx-* descriptions. Verification: README contains /opsx-propose, /opsx-apply, /opsx-archive; no /enrich-us.
- [x] 6.7 H2: README.md apps table — remove apps/admin/README.md link (file does not exist). Verification: README admin row has no link.
- [x] 6.8 H12-DOC: project.md — remove stale "316 tests green" count from quality gates. Verification: project.md quality gates do not contain test count.
- [x] 6.9 Run full suite + validate: all tests green, validate --all --strict 0 failures.
