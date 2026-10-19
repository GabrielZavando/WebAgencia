# WebAstro Monorepo — Makefile (stack-agnostic CI targets)
# Each target delegates to the pnpm workspace. Apps implement their own
# `lint` / `test` / `build` scripts; this file only orchestrates them.

.PHONY: install lint test build audit commitlint ci help

help:
	@echo "Targets: install lint test build audit commitlint ci"

install:
	pnpm install

lint:
	pnpm -r --if-present lint

test:
	pnpm -r test

build:
	pnpm -r build

# Lightweight quality gate: lint all + strict OpenSpec validation (all specs).
audit:
	pnpm -r --if-present lint
	@echo "== openspec validate =="
	pnpm exec openspec validate --all --strict

# Conventional Commits check (for PRs). Requires @commitlint/cli.
commitlint:
	pnpm exec commitlint --from HEAD~1 --to HEAD

# Full local CI pass. Build first: Web validation tests require dist/.
ci: install build lint test
