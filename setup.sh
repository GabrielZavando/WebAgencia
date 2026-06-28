#!/bin/bash
# setup.sh — Inicializar estructura SSD y verificar archivos del proyecto
# Ejecutar desde la raíz del proyecto: bash setup.sh

set -e

echo "🔧 Líder Digital API — Setup SSD"
echo "================================"

# Verificar archivo de instrucciones principal para OpenCode
echo ""
echo "→ Verificando archivos de agente..."

[ -f "AGENTS.md" ] && echo "  ✓ AGENTS.md existe" || echo "  ✗ FALTA AGENTS.md"
[ -f "opencode.json" ] && echo "  ✓ opencode.json existe" || echo "  ✗ FALTA opencode.json"

# Verificar estructura
echo ""
echo "→ Verificando estructura..."

FILES=(
  "docs/base-standards.md"
  "docs/backend-standards.md"
  "docs/frontend-standards.md"
  "docs/documentation-standards.md"
  "docs/api-spec.yml"
  "docs/data-model.md"
  "ai-specs/agents/backend-developer.md"
  "ai-specs/agents/frontend-developer.md"
  "ai-specs/agents/build-agent.md"
  "ai-specs/skills/enrich-us/SKILL.md"
  "ai-specs/skills/commit/SKILL.md"
  "ai-specs/skills/code-auditing/SKILL.md"
  "ai-specs/skills/using-git-worktrees/SKILL.md"
  "ai-specs/skills/deploy/SKILL.md"
  "ai-specs/skills/onboarding/SKILL.md"
  ".github/pull_request_template.md"
  "docker/Dockerfile"
  "docker/docker-compose.yml"
  "prisma/schema.prisma"
  "LICENSE"
)

ALL_OK=true
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "  ✓ $f"
  else
    echo "  ✗ FALTA: $f"
    ALL_OK=false
  fi
done

# Verificar placeholders comunes (no deben existir en un proyecto personalizado)
echo ""
echo "→ Verificando configuración personalizada..."

PLACEHOLDERS=(
  "\[definir stack"
  "\[Clean Architecture"
  "\[descripción del dominio"
  "\[nombre del cliente"
  "\[definir stack del proyecto"
)

PLACEHOLDER_FOUND=false
for placeholder in "${PLACEHOLDERS[@]}"; do
  if grep -rqE "$placeholder" docs/ 2>/dev/null; then
    echo "  ⚠️  Placeholder encontrado: $placeholder"
    grep -rlE "$placeholder" docs/ | while read -r file; do
      echo "      → $file"
    done
    PLACEHOLDER_FOUND=true
  fi
done

if [ "$PLACEHOLDER_FOUND" = true ]; then
  echo ""
  echo "⚠️  ATENCIÓN: Se detectaron placeholders sin reemplazar."
  echo "   Ejecuta los pasos de personalización en el README."
else
  echo "  ✓ Sin placeholders detectados"
fi

# Verificar que opencode.json tenga un model válido
echo ""
echo "→ Verificando opencode.json..."

if grep -q '"model": "deepseek-v4-flash-free"' opencode.json 2>/dev/null; then
  echo "  ⚠️  opencode.json usa el model por defecto (deepseek-v4-flash-free)"
  echo "   Considera cambiarlo por tu modelo preferido en la sección 'model'"
elif grep -q '"model": "nvidia/minimaxai/minimax-m3"' opencode.json 2>/dev/null; then
  echo "  ✓ Model configurado (nvidia/minimaxai/minimax-m3)"
else
  echo "  ✓ Model personalizado detectado"
fi

# Verificar estructura OpenSpec
echo ""
echo "→ Verificando estructura OpenSpec..."

if [ -f "openspec/config.yaml" ]; then
  echo "  ✓ openspec/config.yaml existe"
else
  echo "  ⚠️  openspec/config.yaml no existe (crear con: npx openspec init)"
fi

if [ -d "openspec/changes" ]; then
  echo "  ✓ openspec/changes/ existe"
else
  echo "  ✗ FALTA: openspec/changes/"
fi

if [ -d "openspec/specs" ]; then
  echo "  ✓ openspec/specs/ existe"
else
  echo "  ⚠️  openspec/specs/ no existe (se creará con npx openspec new change)"
fi

# Verificar herramientas necesarias
echo ""
echo "→ Verificando herramientas..."

# OpenSpec CLI (local via npm, no global)
if command -v openspec &> /dev/null; then
  OPENSPEC_VERSION=$(openspec --version)
  echo "  ✓ OpenSpec CLI instalado ($OPENSPEC_VERSION)"
elif [ -f "node_modules/.bin/openspec" ]; then
  OPENSPEC_VERSION=$(npx openspec --version 2>/dev/null || echo "unknown")
  echo "  ✓ OpenSpec CLI instalado via npm ($OPENSPEC_VERSION)"
else
  echo "  ⚠️  OpenSpec CLI no instalado"
  echo "   Instalando como devDependency..."
  npm install --save-dev @fission-ai/openspec
  OPENSPEC_VERSION=$(npx openspec --version)
  echo "  ✓ OpenSpec CLI instalado ($OPENSPEC_VERSION)"
fi

if command -v nest &> /dev/null; then
  echo "  ✓ NestJS CLI instalado"
else
  echo "  ⚠️  NestJS CLI no instalado (npm install -g @nestjs/cli)"
fi

echo ""
if [ "$ALL_OK" = true ]; then
  echo "✅ Setup completo."

  if [ "$PLACEHOLDER_FOUND" = true ]; then
    echo ""
    echo "⚠️  Recuerda personalizar los archivos docs/ antes de comenzar."
  fi

  echo ""
  echo "Próximos pasos:"
  echo "   1. Configurar variables de entorno en .env"
  echo "   2. Ejecutar: npx prisma generate"
  echo "   3. Ejecutar: npx prisma migrate dev"
  echo "   4. Comenzar con: /enrich-us TICKET-ID o /plan-change TICKET-ID"
else
  echo "⚠️  Faltan archivos. Revisar estructura del repositorio."
  exit 1
fi