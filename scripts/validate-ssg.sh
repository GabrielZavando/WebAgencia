#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo "  Validación SSG - Web Agencia Astro"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

fail_count=0

run_step() {
  local step_name=$1
  shift
  echo -e "${YELLOW}[VALIDACIÓN]${NC} $step_name..."
  if "$@" 2>&1; then
    echo -e "${GREEN}[OK]${NC} $step_name"
  else
    echo -e "${RED}[FAIL]${NC} $step_name"
    fail_count=$((fail_count + 1))
  fi
  echo ""
}

# Step 1: Static validations (Vitest)
run_step "Validaciones estáticas (build, dependencias, middleware)" \
  npx vitest run tests/validation/ssg-build.test.ts tests/validation/dependency-audit.test.ts tests/validation/middleware-detection.test.ts tests/validation/hostinger-compat.test.ts --reporter=verbose

# Step 2: Build check
run_step "Verificar que dist/ existe y tiene contenido" \
  bash -c "test -d dist && test -f dist/index.html"

# Step 3: E2E validations (Playwright)
if [ -d dist ]; then
  run_step "Validaciones funcionales (blog, contacto, newsletter, SEO)" \
    npx playwright test --config playwright-validation.config.ts
else
  echo -e "${YELLOW}[SKIP]${NC} Validaciones funcionales - dist/ no existe, ejecuta 'npm run build' primero"
fi

# Summary
echo "======================================"
if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✓ Todas las validaciones pasaron${NC}"
else
  echo -e "${RED}✗ $fail_count validación(es) fallaron${NC}"
fi
echo "======================================"

exit $fail_count
