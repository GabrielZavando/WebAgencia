#!/usr/bin/env bash
# check-refs.sh — verify every {file:...} reference resolves to a real file.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

err=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  refs="$(grep -oE '\{file:[^}]*\}' "$f" 2>/dev/null | sort -u || true)"
  for ref in $refs; do
    path="$(printf '%s' "$ref" | sed -e 's/^{file://' -e 's/}$//')"
    if [ ! -f "$path" ]; then
      echo "MISSING {file:...} -> $path  (in $f)"
      err=1
    fi
  done
done < <(find opencode.json ai-specs .opencode -type f \( -name '*.json' -o -name '*.md' \) 2>/dev/null)

if [ "$err" -ne 0 ]; then echo "check-refs: FAILED"; exit 1; fi
echo "check-refs: OK (all {file:...} resolve)"
