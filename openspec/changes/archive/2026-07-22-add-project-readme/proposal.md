## Why

The monorepo root lacks a README.md. A new developer cloning the repo has no single entry point to understand the project structure, prerequisites, setup steps, or available commands. Each app has its own README, but there is no unified overview that ties them together and explains the monorepo workflow (pnpm workspaces, OpenSpec/SSD, Makefile targets).

## What Changes

- Create a new `README.md` at the project root.
- Content covers: project description, tech stack summary, prerequisites, monorepo setup (single `pnpm install`), available commands (Makefile + pnpm scripts), links to app-level READMEs, and the SSD/OpenSpec workflow overview.
- Language: Spanish (Latinoamericano neutro) per documentation standards — audience is the client/team.

## Capabilities

### New Capabilities

- `project-onboarding`: Root-level README that serves as the single entry point for onboarding new developers and team members to the monorepo.

### Modified Capabilities

_(none — this change is purely additive documentation)_

## Impact

- **Files created**: `README.md` (root)
- **No code changes**: no backend, frontend, API, or database modifications.
- **No dependencies added or removed**.
- **Complements** existing `apps/api/README.md` and `apps/web/README.md` by providing the unified monorepo view.
