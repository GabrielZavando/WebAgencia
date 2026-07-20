#!/usr/bin/env bash
# Specboot — setup & SDD context validation for the WebAstro monorepo.
# Usage: bash specboot.sh [--ci|--init|--help]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

MODE="${1:---init}"

REQUIRED_DIRS=(docs ai-specs openspec .opencode)
REQUIRED_FILES=(
  AGENTS.md
  opencode.json
  docs/base-standards.md
  docs/backend-standards.md
  docs/frontend-standards.md
  docs/documentation-standards.md
  docs/api-spec.yml
  docs/data-model.md
)

err=0

check_structure() {
  local ok=1
  for d in "${REQUIRED_DIRS[@]}"; do
    [ -d "$d" ] || { echo "MISSING dir: $d"; ok=0; }
  done
  for f in "${REQUIRED_FILES[@]}"; do
    [ -f "$f" ] || { echo "MISSING file: $f"; ok=0; }
  done
  [ -f docs/deploy-standards.md ] || echo "WARN: docs/deploy-standards.md missing (recommended)"
  [ "$ok" -eq 1 ]
}

check_opencode_json() {
  python3 - <<'PY' || { echo "INVALID JSON: opencode.json"; return 1; }
import json, sys
json.load(open('opencode.json'))
PY
}

check_placeholders() {
  local hits
  hits="$(grep -rIn -E 'REPLACE_ME|TODO: replace|<your-|FIXME|Lorem ipsum' docs AGENTS.md 2>/dev/null | grep -v node_modules || true)"
  [ -n "$hits" ] && { echo "WARN: possible placeholders:"; echo "$hits"; }
  return 0
}

case "$MODE" in
  --ci)
    echo "== Specboot --ci =="
    check_structure || err=1
    check_opencode_json || err=1
    check_placeholders
    bash check-refs.sh || err=1
    ;;
  --init)
    echo "== Specboot --init =="
    check_structure || err=1
    check_opencode_json || err=1
    echo "Structure OK. Customize docs/* and opencode.json for this project."
    ;;
  --help|-h)
    echo "Usage: bash specboot.sh [--ci|--init|--help]"
    exit 0
    ;;
  *)
    echo "Unknown mode: $MODE"; exit 2 ;;
esac

if [ "$err" -ne 0 ]; then echo "FAILED"; exit 1; fi
echo "OK"
