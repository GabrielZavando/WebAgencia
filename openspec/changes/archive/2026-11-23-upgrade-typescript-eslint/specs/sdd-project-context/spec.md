# Spec Delta

## MODIFIED Requirements

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

#### Scenario: Anti-drift gate validates TypeScript majors per app
- **WHEN** the anti-drift test reads the API, web, and admin package.json
  files and the standards documents
- **THEN** it asserts the TypeScript major in each manifest matches the
  major declared in the corresponding standards document, and that the API
  and frontend TypeScript majors agree with the verified toolchain matrix

#### Scenario: Anti-drift gate validates ESLint ecosystem majors
- **WHEN** the anti-drift test reads `apps/api/package.json`,
  `docs/backend-standards.md`, and `openspec/project.md`
- **THEN** it asserts the declared ESLint major, `@eslint/js` range, and
  `typescript-eslint` range match the installed manifests

#### Scenario: Anti-drift gate records the TypeScript 7 blocker
- **WHEN** the anti-drift test reads `openspec/project.md`
- **THEN** it asserts the project context records why TypeScript 7 is not
  adopted and which dependency peer ranges block it

### Requirement: Core framework majors are upgraded

The system SHALL run the API on NestJS 12.x, the admin app on React 19.x,
and both apps on Firebase client 13.x, with the API on TypeScript 6.0.x,
web/admin on the highest TypeScript major their Astro checker accepts, and
the API lint stack on ESLint 10.x.

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

#### Scenario: API TypeScript stays on the verified major
- **WHEN** a developer inspects `apps/api/package.json`
- **THEN** `typescript` declares the 6.0.x major, matching the highest major
  accepted by `@nestjs/schematics`, `ts-jest`, and `typescript-eslint`

#### Scenario: Web and admin TypeScript follow the Astro checker range
- **WHEN** a developer inspects `apps/web/package.json` and
  `apps/admin/package.json`
- **THEN** both declare the same TypeScript major accepted by the installed
  `@astrojs/check` peer range, and both builds and test suites pass

#### Scenario: API lint stack is on ESLint 10
- **WHEN** a developer inspects `apps/api/package.json`
- **THEN** `eslint` and `@eslint/js` declare the 10.x major, `globals`
  declares 17.x, `typescript-eslint` declares the version whose peer range
  includes ESLint 10, and the API lint command reports zero errors

#### Scenario: Toolchain split is intentional
- **WHEN** a developer inspects the workspace TypeScript versions
- **THEN** `apps/api` keeps TypeScript 6.0.x, while `apps/web` and
  `apps/admin` use the same major their installed `@astrojs/check` accepts,
  and TypeScript 7 remains blocked by the recorded peer ranges

### Requirement: Documentation declares upgraded framework majors

The system SHALL declare the upgraded framework majors consistently across
project documentation and SDD context.

#### Scenario: Backend standards declare the new majors
- **WHEN** a developer reads `docs/backend-standards.md`
- **THEN** it states NestJS 12.x, the API TypeScript 6.0.x toolchain, and
  the ESLint 10.x toolchain

#### Scenario: Frontend standards declare the new majors
- **WHEN** a developer reads `docs/frontend-standards.md`
- **THEN** it states React 19.x, Firebase client 13.x, and the TypeScript
  major installed in `apps/web` and `apps/admin`

#### Scenario: Base standards and README are aligned
- **WHEN** a developer reads `docs/base-standards.md` and `README.md`
- **THEN** both state NestJS 12 and React 19 and identify the TypeScript and
  ESLint toolchain versions

#### Scenario: SDD context is aligned
- **WHEN** a developer reads `openspec/config.yaml` and
  `openspec/project.md`
- **THEN** both state NestJS 12, React 19, and Firebase 13

#### Scenario: Project context records the toolchain matrix and blocker
- **WHEN** a developer reads the stack table in `openspec/project.md`
- **THEN** it lists the exact installed TypeScript range per app, the ESLint
  and `typescript-eslint` ranges, and the dependency peer ranges that block
  TypeScript 7

#### Scenario: No stale framework majors remain
- **WHEN** a developer searches current-stack documentation
- **THEN** no current-stack section declares NestJS 11, React 18, Firebase 12,
  ESLint 9, or TypeScript 7 as the installed stack

## ADDED Requirements

### Requirement: Tooling upgrade preserves quality gates

The system SHALL keep all existing quality gates green after the TypeScript
and ESLint upgrade without changing API contracts, persistence behavior, or
production source code.

#### Scenario: Lint gate passes without source edits
- **WHEN** the API is linted after the ESLint 10 upgrade
- **THEN** the command reports zero errors and no files under `apps/api/src`
  are modified as part of the upgrade

#### Scenario: Build gate passes
- **WHEN** a developer runs the monorepo build after the upgrade
- **THEN** the build exits 0 for `@webastro/api`, `@webastro/web`,
  `@webastro/admin`, and `@webastro/shared-types`

#### Scenario: Test gates pass
- **WHEN** a developer runs the workspace and API end-to-end suites
- **THEN** the API reports 204 unit tests, web 81 tests, admin 79 tests, and
  the API e2e suite 13 tests, all passing

#### Scenario: Spec gate passes
- **WHEN** a developer runs OpenSpec strict validation for all specs and
  changes
- **THEN** validation exits 0

#### Scenario: Contracts are unchanged
- **WHEN** the upgrade is complete
- **THEN** `docs/api-spec.yml` and `docs/data-model.md` require no changes
