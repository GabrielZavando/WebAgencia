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
- **THEN** it lists Astro 7.4.13, Node >=26.13.1, NestJS 11, OpenSpec 1.15.0,
  pnpm 10, firebase-admin, and @supabase/supabase-js with exact versions
  matching the real package.json files

### Requirement: README versions match real package.json

The system SHALL correct `README.md` so declared versions and deployment
target match the real package.json files and the confirmed Coolify target.

#### Scenario: README frontend version is correct
- **WHEN** a developer reads the README stack table
- **THEN** it states Astro 7.4.13 (not Astro 5) and OpenSpec 1.15.0
  (not OpenSpec 1.4)

#### Scenario: README Node version is correct
- **WHEN** a developer reads the README requirements section
- **THEN** it states Node.js >= 26.13.1, matching the root `engines.node`

#### Scenario: README deployment target is Coolify
- **WHEN** a developer reads the README deployment section
- **THEN** it targets a VPS with Coolify, not Hostinger FTP

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

## ADDED Requirements

### Requirement: Runtime engine and CI Node version stay aligned

The system SHALL run on Node 26.13.1 (current LTS) across local development
and CI, declaring that baseline in the root `engines.node`, the CI workflows,
and a version file consumable by Node version managers.

#### Scenario: Root engine declares Node 26.13.1
- **WHEN** a developer reads the root `package.json`
- **THEN** `engines.node` is `>=26.13.1`

#### Scenario: CI workflows use Node 26
- **WHEN** a developer reads `.github/workflows/ci.yml` and
  `.github/workflows/deploy.yml`
- **THEN** both declare `node-version: 26`

#### Scenario: Node version file pins the LTS
- **WHEN** a developer reads `.nvmrc` at the repo root
- **THEN** it contains `26.13.1`

#### Scenario: Astro resolves to the latest 7.x patch
- **WHEN** a developer inspects `apps/web/package.json` and
  `apps/admin/package.json`
- **THEN** both declare `astro` `^7.4.13`, and `apps/admin` declares
  `@astrojs/node` `^11.1.14`
