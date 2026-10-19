# Changelog

All notable changes to the WebAstro monorepo are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Monorepo pnpm workspace with `apps/api` (NestJS) and `apps/web` (Astro).
- Shared SDD context at root: `docs/`, `ai-specs/`, `openspec/`, `.opencode/`, `AGENTS.md`, `opencode.json`.
- OpenSpec-based SDD tooling: `Makefile`, CI/deploy workflows.

### Removed
- Specboot validation tooling (`specboot.sh`, `check-refs.sh`, `Makefile` targets `validate` / `refcheck`, and the corresponding CI steps).
- Obsolete `apps/web/IMPLEMENTACION_COMPLETADA.md` (historical record from the Specboot era).

### Fixed
- OpenSpec strict validation: 6 pre-existing specs (`article-tiptap-content`, `security-hardening`, `landing-public`, `firestore-indexes`, `login-logo-navigation`, `project-onboarding`) aligned with the current spec format (`## Purpose`, `## Requirements`, `#### Scenario`). `openspec validate --all --strict` now reports 19/19.

### Changed
- OpenSpec CLI/tooling upgraded and `.opencode/` regenerated (adds `opsx-sync` workflow).
- CI and `make audit` now run `openspec validate --all --strict` (replaces the previous non-blocking `npx --yes ... || true` invocation).
- Documentation and metadata now reference OpenSpec 1.14 (was 1.4).
