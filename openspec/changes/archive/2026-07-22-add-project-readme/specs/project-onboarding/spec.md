## ADDED Requirements

### Requirement: Root README exists at project root
The project root SHALL contain a `README.md` file that serves as the primary onboarding entry point for new developers and team members.

#### Scenario: README is present
- **WHEN** a developer clones the repository and opens the root directory
- **THEN** a `README.md` file exists at the project root

### Requirement: README describes the project
The README SHALL include a concise project description explaining that this is a monorepo with a NestJS API and an Astro frontend, operated by Agencia Digital Gabriel Zavando.

#### Scenario: Project description is visible
- **WHEN** a developer opens `README.md`
- **THEN** the first section contains a project description mentioning the monorepo structure, NestJS API, and Astro frontend

### Requirement: README lists prerequisites
The README SHALL list all prerequisites needed to work on the project: Node.js (>=20), pnpm (>=10), Docker (optional for API), and relevant accounts (Firebase, Supabase).

#### Scenario: Prerequisites section exists
- **WHEN** a developer reads the README
- **THEN** a prerequisites section lists Node.js, pnpm, Docker, and account requirements

### Requirement: README provides setup instructions
The README SHALL include setup instructions that can be completed in 3 steps or less: clone, install dependencies, and start development.

#### Scenario: Quick start is completable in 3 steps
- **WHEN** a developer follows the setup section
- **THEN** they can get the project running in at most 3 numbered steps (clone, install, dev)

### Requirement: README documents available commands
The README SHALL document all top-level commands available via pnpm scripts and the Makefile, including `dev:api`, `dev:web`, `build`, `test`, `lint`, and `make ci`.

#### Scenario: Commands table is complete
- **WHEN** a developer looks at the commands section
- **THEN** a table or list shows all top-level pnpm and Makefile commands with brief descriptions

### Requirement: README links to app-level READMEs
The README SHALL include links to `apps/api/README.md` and `apps/web/README.md` for app-specific details (env vars, endpoints, deployment).

#### Scenario: App links are present
- **WHEN** a developer reads the README
- **THEN** clickable references to both app READMEs are included

### Requirement: README explains the SSD workflow
The README SHALL include a brief overview of the Spec-Driven Development workflow using OpenSpec, listing the key commands (`/opsx-propose`, `/opsx-apply`, `/verify`, `/opsx-archive`, `/commit`).

#### Scenario: SSD workflow section exists
- **WHEN** a developer reads the README
- **THEN** a section describes the SSD/OpenSpec workflow with the key commands listed

### Requirement: README is written in Spanish
The README content SHALL be written in Spanish (Latinoamericano neutro) per the project's documentation standards, while code examples and command names remain in English.

#### Scenario: Language is correct
- **WHEN** a Spanish-speaking team member reads the README
- **THEN** all prose is in Spanish while code blocks and command names remain in English
