## Context

The WebAstro monorepo contains two apps (`apps/api` — NestJS, `apps/web` — Astro) with shared SDD context at root (`docs/`, `ai-specs/`, `openspec/`, `.opencode/`). Each app has its own README, but the root has none. The project uses pnpm workspaces, a `Makefile` for orchestration, and OpenSpec 1.4 for Spec-Driven Development.

New developers currently have to read `AGENTS.md` + each app's README to understand the full picture. There is no single entry point.

## Goals / Non-Goals

**Goals:**
- Provide a single README.md at root that serves as onboarding entry point.
- Cover: project description, tech stack, prerequisites, monorepo setup, available commands, app overview, and SSD workflow.
- Written in Spanish (Latinoamericano neutro) per documentation standards.
- Reference (link to) existing app-level READMEs instead of duplicating their content.

**Non-Goals:**
- Rewrite or modify existing app-level READMEs (those stay as-is).
- Add deployment instructions to the root README (each app handles its own deploy).
- Create any new tooling, scripts, or dependencies.

## Decisions

1. **Language: Spanish (Latinoamericano neutro)** — The root README targets the client/team. Documentation standards specify client-facing docs in Spanish. Code and commits remain in English.

2. **Structure: Overview + quick-start + command reference + links** — Follows the pattern from `docs/documentation-standards.md` (description, prerequisites, setup in 3 steps or less, key commands, architecture summary). Keeps it scannable.

3. **No duplication of app content** — Links to `apps/api/README.md` and `apps/web/README.md` for app-specific details (env vars, endpoints, deploy). The root README focuses on the monorepo as a whole.

4. **Single file, no subdirectory** — A root `README.md` is the universal convention. No need for a `docs/getting-started/` subdirectory for a single document.

## Risks / Trade-offs

- **[Risk] README gets stale as project evolves** → Mitigation: Keep sections high-level and link to canonical sources (app READMEs, `docs/`). Changes to apps naturally update their own READMEs; the root README only needs updating when the monorepo structure changes.
- **[Trade-off] Less detail per section** → By design. The root README is a map, not the territory. Deep dives live in app READMEs and `docs/`.
