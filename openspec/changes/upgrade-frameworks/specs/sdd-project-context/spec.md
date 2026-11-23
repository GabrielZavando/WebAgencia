# Spec Delta

## MODIFIED Requirements

### Requirement: Project context file documents real stack and topology

The system SHALL provide `openspec/project.md` documenting product purpose,
monorepo topology (3 apps + shared-types, pnpm), real stack with exact
versions, persistence (Firestore via firebase-admin, Supabase only for
leads), deployment target (VPS with Coolify), real dev/build/test/lint
commands per package, and quality gates distinguishing ENFORCED from
ASPIRACIONALES.

#### Scenario: Project context file exists
- **WHEN** a developer looks for project context
- **THEN** `openspec/project.md` exists at the change root

#### Scenario: Project context lists real stack versions
- **WHEN** a developer reads `openspec/project.md`
- **THEN** it lists NestJS 12.x, React 19.x, Firebase client 13.x,
  firebase-admin 14.x, Astro 7.4.13, Node >=26.13.1, OpenSpec 1.15.0, and
  pnpm 10 with exact versions matching the real package.json files

#### Scenario: Project context omits stale framework majors
- **WHEN** a developer reads the stack table in `openspec/project.md`
- **THEN** it does not declare NestJS 11, React 18, or Firebase 12 as the
  current stack

### Requirement: Frontend standards reflect real versions and SSR

The system SHALL update `docs/frontend-standards.md` to correct the Astro
version, remove the SSR prohibition (apps/admin uses output: 'server' by
design), and align hosting target to Coolify.

#### Scenario: Frontend standards Astro version is correct
- **WHEN** a developer reads `docs/frontend-standards.md` stack section
- **THEN** it states Astro 7.4.x, matching `apps/web/package.json`

#### Scenario: Frontend standards allow SSR for admin
- **WHEN** a developer reads `docs/frontend-standards.md` anti-patterns
- **THEN** there is no prohibition of SSR (`output: 'server'`)

#### Scenario: Frontend standards target Coolify
- **WHEN** a developer reads `docs/frontend-standards.md` deploy section
- **THEN** it targets Coolify, not Hostinger

#### Scenario: Frontend standards React version is correct
- **WHEN** a developer reads `docs/frontend-standards.md` stack section
- **THEN** it states React 19.x, matching `apps/admin/package.json`

### Requirement: Anti-drift test validates documentation against package.json

The system SHALL maintain a TDD anti-drift test under
`apps/web/tests/validation/` asserting that versions declared in
documentation, the root `engines.node` constraint, and the CI Node pin
match the real `package.json` files and workflow configuration.

#### Scenario: Anti-drift test exists
- **WHEN** a developer runs the validation suite
- **THEN** a new anti-drift test file exists under
  `apps/web/tests/validation/`

#### Scenario: Anti-drift test passes against corrected docs
- **WHEN** documentation versions match package.json
- **THEN** the anti-drift test passes

#### Scenario: Anti-drift gate detects adapter Node exception
- **WHEN** docs/frontend-standards.md anti-patterns are read
- **THEN** the test confirms no blanket adapter prohibition (excepts @astrojs/node BY DESIGN)

#### Scenario: Anti-drift gate detects Firebase client/admin distinction
- **WHEN** docs/frontend-standards.md anti-patterns are read
- **THEN** the test confirms firebase-admin (server SDK) is prohibited in frontends,
  while Firebase client SDK (firebase/auth) is permitted as admin login mechanism

#### Scenario: Anti-drift gate rejects stale test counts in config
- **WHEN** openspec/config.yaml is read
- **THEN** the test confirms no test count assertions (e.g. "N tests green") are present

#### Scenario: Anti-drift gate validates Node engine and CI runtime
- **WHEN** the anti-drift test reads root `package.json`, the CI workflows,
  `README.md`, and `docs/base-standards.md`
- **THEN** it asserts `engines.node` is `>=26.13.1`, the CI workflows pin
  `node-version: 26`, and the docs declare the same Node and Astro versions

#### Scenario: Anti-drift gate validates framework majors
- **WHEN** the anti-drift test reads the API and admin package.json files
  and the standards documents
- **THEN** it asserts the documented NestJS major is 12, the documented
  React major is 19, and the documented Firebase major is 13, matching
  the manifests

## ADDED Requirements

### Requirement: Core framework majors are upgraded

The system SHALL run the API on NestJS 12.x, the admin app on React 19.x,
and both apps on Firebase client 13.x, with the API on TypeScript 6.0.x and
web/admin remaining on their current Astro 7.4.x and TypeScript 5.9.x
toolchains.

#### Scenario: NestJS 12 is installed
- **WHEN** a developer inspects `apps/api/package.json`
- **THEN** `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`,
  `@nestjs/testing`, `@nestjs/swagger`, `@nestjs/cli`, and
  `@nestjs/schematics` all declare the 12.x major and the API build and
  tests pass

#### Scenario: API stays CommonJS on Node 26
- **WHEN** the API is built and tested
- **THEN** its CommonJS output consumes Nest 12's ESM-only packages through
  Node `require(esm)` on Node 26.13.1 without migrating `apps/api` to ESM

#### Scenario: React 19 is installed
- **WHEN** a developer inspects `apps/admin/package.json`
- **THEN** `react` and `react-dom` declare 19.3.x, the React 19 typings are
  present, and the admin build and tests pass

#### Scenario: Firebase 13 is installed
- **WHEN** a developer inspects `apps/admin/package.json` and
  `apps/api/package.json`
- **THEN** `firebase` declares 13.4.x and the modular `firebase/app` and
  `firebase/auth` usage compiles and tests pass

#### Scenario: Toolchain split is intentional
- **WHEN** a developer inspects the workspace TypeScript versions
- **THEN** `apps/api` uses TypeScript 6.0.x while `apps/web` and
  `apps/admin` stay on TypeScript 5.9.x

### Requirement: Framework upgrade passes quality gates

The system SHALL preserve existing API contracts and persistence behavior
while passing build, lint, test, lockfile, and spec-validation gates after
the upgrade.

#### Scenario: Lockfile is reproducible
- **WHEN** a developer runs a frozen-lockfile install on Node 26.13.1
- **THEN** installation completes successfully from the committed lockfile

#### Scenario: Build gate passes
- **WHEN** a developer runs the monorepo build
- **THEN** the build exits 0 for `@webastro/api`, `@webastro/web`,
  `@webastro/admin`, and `@webastro/shared-types`

#### Scenario: Lint gate passes
- **WHEN** a developer runs the workspace lint script
- **THEN** the lint command exits 0

#### Scenario: Test gate passes
- **WHEN** a developer runs the workspace test script
- **THEN** all API, web, and admin test suites pass

#### Scenario: Spec gate passes
- **WHEN** a developer runs OpenSpec strict validation for all specs and
  changes
- **THEN** validation exits 0

#### Scenario: Contracts are unchanged
- **WHEN** the upgrade is complete
- **THEN** `docs/api-spec.yml` and `docs/data-model.md` require no changes

### Requirement: Documentation declares upgraded framework majors

The system SHALL declare the upgraded framework majors consistently across
project documentation and SDD context.

#### Scenario: Backend standards declare the new majors
- **WHEN** a developer reads `docs/backend-standards.md`
- **THEN** it states NestJS 12.x and the API TypeScript 6.0.x toolchain

#### Scenario: Frontend standards declare the new majors
- **WHEN** a developer reads `docs/frontend-standards.md`
- **THEN** it states React 19.x and Firebase client 13.x

#### Scenario: Base standards and README are aligned
- **WHEN** a developer reads `docs/base-standards.md` and `README.md`
- **THEN** both state NestJS 12 and React 19

#### Scenario: SDD context is aligned
- **WHEN** a developer reads `openspec/config.yaml` and
  `openspec/project.md`
- **THEN** both state NestJS 12, React 19, and Firebase 13

#### Scenario: No stale framework majors remain
- **WHEN** a developer searches current-stack documentation
- **THEN** no current-stack section declares NestJS 11, React 18, or
  Firebase 12
