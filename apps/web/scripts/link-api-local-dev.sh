#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Link API Local Dev - Configura desarrollo local con API NestJS
# =============================================================================
# Este script:
# 1. Verifica que .env.local exista con las variables correctas
# 2. Verifica que la API NestJS esté configurada
# 3. Crea enlace simbólico opcional para desarrollo
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
API_DIR="$(dirname "$ROOT_DIR")/API"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Link API Local Dev${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Step 1: Verificar .env.local
echo -e "${YELLOW}[1/4]${NC} Verificando .env.local..."
if [ ! -f "$ROOT_DIR/.env.local" ]; then
  echo -e "${RED}[ERROR]${NC} .env.local no existe"
  echo "Copiando desde .env.example..."
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"
  echo -e "${GREEN}[OK]${NC} .env.local creado"
else
  echo -e "${GREEN}[OK]${NC} .env.local existe"
fi

# Step 2: Verificar variables de entorno requeridas
echo ""
echo -e "${YELLOW}[2/4]${NC} Verificando variables de entorno..."
REQUIRED_VARS=(
  "PUBLIC_API_URL=http://localhost:3000/api/v1"
  "PUBLIC_API_BASE_URL=http://localhost:3000/api/v1"
  "PUBLIC_FIREBASE_PROJECT_ID"
)

all_ok=true
for var in "${REQUIRED_VARS[@]}"; do
  if [[ "$var" == *"="* ]]; then
    # Verificar valor exacto
    var_name="${var%%=*}"
    var_value="${var#*=}"
    if ! grep -q "^${var_name}=${var_value}" "$ROOT_DIR/.env.local" 2>/dev/null; then
      echo -e "${YELLOW}[WARN]${NC} $var_name no tiene el valor esperado para desarrollo local"
      all_ok=false
    fi
  else
    # Solo verificar que existe
    if ! grep -q "^${var}=" "$ROOT_DIR/.env.local" 2>/dev/null; then
      echo -e "${RED}[ERROR]${NC} $var no está definida en .env.local"
      all_ok=false
    fi
  fi
done

if [ "$all_ok" = true ]; then
  echo -e "${GREEN}[OK]${NC} Variables de entorno configuradas correctamente"
else
  echo ""
  echo -e "${YELLOW}[INFO]${NC} Para desarrollo local, .env.local debería tener:"
  echo "  PUBLIC_API_URL=http://localhost:3000/api/v1"
  echo "  PUBLIC_API_BASE_URL=http://localhost:3000/api/v1"
  echo "  PUBLIC_FIREBASE_PROJECT_ID=api-web-agencia"
  echo ""
  echo -e "${YELLOW}[INFO]${NC} ¿Quieres actualizar .env.local automáticamente? (s/n)"
  read -r response
  if [[ "$response" =~ ^[Ss]$ ]]; then
    # Backup
    cp "$ROOT_DIR/.env.local" "$ROOT_DIR/.env.local.bak"
    
    # Actualizar variables
    sed -i 's|^PUBLIC_API_URL=.*|PUBLIC_API_URL=http://localhost:3000/api/v1|' "$ROOT_DIR/.env.local"
    sed -i 's|^PUBLIC_API_BASE_URL=.*|PUBLIC_API_BASE_URL=http://localhost:3000/api/v1|' "$ROOT_DIR/.env.local"
    
    # Asegurar Firebase config
    if ! grep -q "^PUBLIC_FIREBASE_PROJECT_ID=" "$ROOT_DIR/.env.local"; then
      echo "PUBLIC_FIREBASE_PROJECT_ID=api-web-agencia" >> "$ROOT_DIR/.env.local"
    fi
    
    echo -e "${GREEN}[OK]${NC} .env.local actualizado (backup en .env.local.bak)"
  fi
fi

# Step 3: Verificar API NestJS
echo ""
echo -e "${YELLOW}[3/4]${NC} Verificando API NestJS..."
if [ -d "$API_DIR" ]; then
  echo -e "${GREEN}[OK]${NC} API encontrada en $API_DIR"
  
  if [ -f "$API_DIR/.env" ]; then
    echo -e "${GREEN}[OK]${NC} API .env encontrado"
  else
    echo -e "${YELLOW}[WARN]${NC} API .env no encontrado - copia .env.example en la API"
  fi
else
  echo -e "${RED}[ERROR]${NC} API no encontrada en $API_DIR"
  echo "Esperado: ../API desde WebAgenciaAstro"
fi

# Step 4: Instrucciones finales
echo ""
echo -e "${YELLOW}[4/4]${NC} Instrucciones de uso:"
echo ""
echo "Para desarrollar con la API local:"
echo ""
echo "  ${GREEN}1.${NC} Inicia la API NestJS:"
echo "     cd ../API"
echo "     npm run start:dev"
echo ""
echo "  ${GREEN}2.${NC} Inicia el frontend (en otra terminal):"
echo "     cd WebAgenciaAstro"
echo "     pnpm dev"
echo ""
echo "  ${GREEN}3.${NC} Accede a:"
echo "     Frontend: http://localhost:4321"
echo "     API:      http://localhost:3000/api/v1"
echo ""
echo "Endpoints disponibles:"
echo "  - POST /auth/login (Firebase Auth + validación admin)"
echo "  - GET  /blog/posts (lista de posts)"
echo "  - GET  /blog/posts/:slug (post individual)"
echo "  - POST /leads/contact (formulario de contacto)"
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}✓ Configuración completada${NC}"
echo -e "${YELLOW}========================================${NC}"
