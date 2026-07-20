#!/bin/bash
# validate.sh — Validar que el proyecto API está correctamente configurado
# Ejecutar antes de commits o en CI para verificar estado del proyecto

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "🔍 Líder Digital API — Validation"
echo "================================"
echo ""

# Helper functions
pass() {
  echo -e "  ${GREEN}✓${NC} $1"
}

fail() {
  echo -e "  ${RED}✗${NC} $1"
  ((ERRORS++)) || true
}

warn() {
  echo -e "  ${YELLOW}⚠${NC} $1"
  ((WARNINGS++)) || true
}

info() {
  echo -e "  ${BLUE}ℹ${NC} $1"
}

# =============================================================================
# 1. File Structure Validation
# =============================================================================

echo "→ Verificando estructura de archivos..."

REQUIRED_FILES=(
  "AGENTS.md"
  "opencode.json"
  "docs/base-standards.md"
  "docs/backend-standards.md"
  "docs/frontend-standards.md"
  "docs/documentation-standards.md"
  "docs/api-spec.yml"
  "docs/data-model.md"
  "ai-specs/README.md"
  "ai-specs/agents/backend-developer.md"
  "ai-specs/agents/frontend-developer.md"
  "ai-specs/agents/build-agent.md"
  "ai-specs/skills/enrich-us/SKILL.md"
  "ai-specs/skills/commit/SKILL.md"
  "ai-specs/skills/code-auditing/SKILL.md"
  "ai-specs/skills/using-git-worktrees/SKILL.md"
  "ai-specs/skills/deploy/SKILL.md"
  "ai-specs/skills/onboarding/SKILL.md"
  "setup.sh"
  "docker/Dockerfile"
  "docker/docker-compose.yml"
  "prisma/schema.prisma"
  ".github/pull_request_template.md"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "FALTA: $f"
  fi
done

# =============================================================================
# 2. Placeholder Detection
# =============================================================================

echo ""
echo "→ Verificando placeholders sin reemplazar..."

PLACEHOLDER_PATTERNS=(
  "\[definir stack"
  "\[Clean Architecture"
  "\[descripción del dominio"
  "\[nombre del cliente"
  "\[definir stack del proyecto"
)

PLACEHOLDER_FOUND=false
for pattern in "${PLACEHOLDER_PATTERNS[@]}"; do
  if grep -rqE "$pattern" docs/ 2>/dev/null; then
    FILES_WITH_PLACEHOLDER=$(grep -rlE "$pattern" docs/ 2>/dev/null | tr '\n' ', ')
    warn "Placeholder '$pattern' encontrado en: $FILES_WITH_PLACEHOLDER"
    PLACEHOLDER_FOUND=true
  fi
done

if [ "$PLACEHOLDER_FOUND" = false ]; then
  pass "Sin placeholders detectados en docs/"
fi

# =============================================================================
# 3. OpenCode JSON Validation
# =============================================================================

echo ""
echo "→ Verificando opencode.json..."

if command -v node &> /dev/null; then
  if node -e "JSON.parse(require('fs').readFileSync('opencode.json'))" 2>/dev/null; then
    pass "opencode.json es JSON válido"

    # Check model
    if grep -q '"model": "deepseek-v4-flash-free"' opencode.json; then
      warn "opencode.json usa el model por defecto (deepseek-v4-flash-free)"
    elif grep -q '"model": "nvidia/minimaxai/minimax-m3"' opencode.json; then
      pass "Model configurado (nvidia/minimaxai/minimax-m3)"
    else
      pass "Model personalizado configurado"
    fi
  else
    fail "opencode.json tiene errores de sintaxis"
  fi
else
  warn "Node.js no instalado, no se puede validar JSON"
fi

# =============================================================================
# 4. Skills Structure Validation
# =============================================================================

echo ""
echo "→ Verificando skills..."

SKILL_DIRS=(
  "ai-specs/skills/enrich-us"
  "ai-specs/skills/commit"
  "ai-specs/skills/code-auditing"
  "ai-specs/skills/using-git-worktrees"
  "ai-specs/skills/deploy"
  "ai-specs/skills/onboarding"
)

for skill in "${SKILL_DIRS[@]}"; do
  if [ -d "$skill" ] && [ -f "$skill/SKILL.md" ]; then
    pass "$skill/SKILL.md"
  else
    fail "$skill/SKILL.md (falta)"
  fi
done

# =============================================================================
# 5. OpenSpec CLI Validation
# =============================================================================

echo ""
echo "→ Verificando OpenSpec CLI..."

if command -v openspec &> /dev/null; then
  OPENSPEC_VERSION=$(openspec --version)
  pass "OpenSpec CLI instalado ($OPENSPEC_VERSION)"
elif [ -f "node_modules/.bin/openspec" ]; then
  OPENSPEC_VERSION=$(npx openspec --version 2>/dev/null || echo "unknown")
  pass "OpenSpec CLI instalado via npm ($OPENSPEC_VERSION)"
else
  warn "OpenSpec CLI no instalado (npm install --save-dev @fission-ai/openspec)"
fi

# =============================================================================
# 6. NestJS Validation
# =============================================================================

echo ""
echo "→ Verificando NestJS..."

if [ -f "src/main.ts" ]; then
  pass "src/main.ts existe"
else
  fail "src/main.ts no encontrado"
fi

if [ -f "prisma/schema.prisma" ]; then
  pass "prisma/schema.prisma existe"
else
  warn "prisma/schema.prisma no encontrado"
fi

# =============================================================================
# 7. Examples Validation
# =============================================================================

echo ""
echo "→ Verificando ejemplos..."

EXAMPLE_FILES=(
  "ai-specs/examples/scenarios-example.md"
  "ai-specs/examples/requirements-example.md"
  "ai-specs/examples/ticket-ejemplo.md"
  "ai-specs/examples/tasks.md"
)

for ex in "${EXAMPLE_FILES[@]}"; do
  if [ -f "$ex" ]; then
    pass "$ex"
  else
    warn "$ex (falta - agregar para mejores ejemplos)"
  fi
done

# =============================================================================
# 7b. OpenSpec Directory Structure
# =============================================================================

echo ""
echo "→ Verificando estructura OpenSpec..."

OPENSPEC_DIRS=(
  "openspec/config.yaml"
  "openspec/changes"
  "openspec/specs"
)

for d in "${OPENSPEC_DIRS[@]}"; do
  if [ -e "$d" ]; then
    pass "$d"
  else
    warn "$d (falta)"
  fi
done

# =============================================================================
# 8. Git Hooks (if using husky)
# =============================================================================

echo ""
echo "→ Verificando git hooks..."

if [ -f ".husky/commit-msg" ]; then
  pass "commit-msg hook instalado"
elif [ -d ".husky" ]; then
  warn "Directorio .husky existe pero commit-msg no configurado"
else
  info "Husky no instalado (opcional)"
fi

# =============================================================================
# 9. CI/CD Validation
# =============================================================================

echo ""
echo "→ Verificando CI/CD..."

if [ -f ".github/workflows/ci.yml" ]; then
  pass "GitHub Actions CI configurado"
else
  warn ".github/workflows/ci.yml no encontrado"
fi

if [ -f ".commitlintrc.json" ]; then
  pass "commitlint configurado"
else
  info ".commitlintrc.json no encontrado (opcional)"
fi

# =============================================================================
# Summary
# =============================================================================

echo ""
echo "================================"
echo "📊 Resumen"
echo "================================"
echo -e "  ${RED}Errores: $ERRORS${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ Validación fallida${NC}"
  echo "Corrige los errores antes de continuar."
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}⚠️  Validación con warnings${NC}"
  echo "Revisa los warnings opcionales."
  exit 0
else
  echo ""
  echo -e "${GREEN}✅ Validación exitosa${NC}"
  echo "El proyecto está correctamente configurado."
  exit 0
fi