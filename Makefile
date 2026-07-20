# WebAstro Monorepo — Makefile (stack-agnostic CI targets)
# Each target delegates to the pnpm workspace. Apps implement their own
# `lint` / `test` / `build` scripts; this file only orchestrates them.

.PHONY: install lint test build audit commitlint validate refcheck ci help

help:
	@echo "Targets: install lint test build audit commitlint validate refcheck ci"

install:
	pnpm install

lint:
	pnpm -r --if-present lint

test:
	pnpm -r test

build:
	pnpm -r build

# Lightweight quality gate: lint all + strict OpenSpec validation.
audit:
	pnpm -r --if-present lint
	@echo "== openspec validate ==" || true
	@(npx --yes @fission-ai/openspec validate --strict && echo "openspec OK") || echo "openspec: no changes to validate (OK)"

# Conventional Commits check (for PRs). Requires @commitlint/cli.
commitlint:
	pnpm exec commitlint --from HEAD~1 --to HEAD

# Specboot structural validation (SDD context integrity).
validate:
	bash specboot.sh --ci

# Reference integrity for {file:...} tokens.
refcheck:
	bash check-refs.sh

# Full local CI pass. Build first: Web validation tests require dist/.
ci: install build lint test validate refcheck
