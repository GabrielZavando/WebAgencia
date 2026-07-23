# Líder Digital API

API REST para gestión de usuarios, blog y captación de leads de sitio web.

## Stack Tecnológico

- **Framework:** NestJS 11 (TypeScript)
- **Autenticación:** Firebase Auth
- **Base de Datos 1:** Firebase Firestore (usuarios, roles, artículos, categorías)
- **Base de Datos 2:** Supabase PostgreSQL (leads/prospectos)
- **SDK Supabase:** @supabase/supabase-js
- **Contenedor:** Docker + Docker Compose

## Requisitos

- Node.js 20 LTS
- Docker y Docker Compose
- Cuenta de Firebase (Proyecto configurado)
- Cuenta de Supabase (Base de datos PostgreSQL)

## Configuración

### 1. Variables de entorno

Copiar `.env.example` a `.env` y completar las credenciales:

```bash
cp .env.example .env
```

**Variables requeridas:**

| Variable | Descripción |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | ID del proyecto en Firebase Console |
| `FIREBASE_CLIENT_EMAIL` | Email del service account |
| `FIREBASE_PRIVATE_KEY` | Clave privada del service account |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SECRET_KEY` | Service role key de Supabase |

### 2. Obtener credenciales de Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar proyecto
3. Configuración del proyecto > Cuentas de servicio
4. Generar nueva clave privada
5. Copiar los valores al `.env`

### 3. Obtener credenciales de Supabase

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto
3. Settings > API
4. Copiar URL a `SUPABASE_URL`
5. Copiar service_role key a `SUPABASE_SECRET_KEY`

## Desarrollo local

### Con Docker Compose (recomendado)

```bash
docker compose -f docker/docker-compose.yml up -d
```

### Sin Docker

```bash
npm install
npm run start:dev
```

## Endpoints principales

La API está versionada en `/api/v1`:

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Iniciar sesión | No |
| GET | `/api/v1/auth/me` | Usuario actual | Sí |
| GET | `/api/v1/users` | Listar usuarios | Admin |
| POST | `/api/v1/users` | Crear usuario | Admin |
| GET | `/api/v1/categories` | Listar categorías | No |
| POST | `/api/v1/categories` | Crear categoría | Admin/Editor |
| GET | `/api/v1/articles` | Listar artículos | No |
| POST | `/api/v1/articles` | Crear artículo | Admin/Editor |
| POST | `/api/v1/leads/subscribe` | Suscripción newsletter | No |
| POST | `/api/v1/leads/contact` | Formulario contacto | No |

## Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## Deployment

### Docker (VPS propio)

```bash
# Build de producción
docker build -f docker/Dockerfile -t lider-digital-api .

# Run
docker run -d -p 3000:3000 --env-file .env lider-digital-api
```

### Con Docker Compose

```bash
docker compose -f docker/docker-compose.yml up -d
```

## Estructura del proyecto

```
├── docs/                      # Especificaciones y estándares
│   ├── base-standards.md
│   ├── backend-standards.md
│   ├── api-spec.yml
│   └── data-model.md
│
├── src/                       # Código fuente NestJS
│   ├── main.ts
│   ├── app.module.ts
│   ├── supabase/              # Cliente Supabase
│   │   ├── supabase.module.ts
│   │   └── supabase.service.ts
│   └── ...
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── openspec/                  # 🔄 OpenSpec change artifacts
│   ├── config.yaml            # Schema: spec-driven
│   ├── specs/                 # Capabilities base
│   └── changes/               # Active + archived changes
│
├── .opencode/                 # 🔧 OpenSpec 1.4 skills & commands (no editar manualmente)
│   ├── skills/                # opsx-propose, opsx-apply, opsx-archive, opsx-explore
│   └── commands/              # Command templates for OpenCode
│
├── ai-specs/                  # ⚙️ Agentes y skills propios de la agencia
│   ├── agents/
│   ├── skills/
│   └── examples/
│
├── .github/
│   ├── pull_request_template.md
│   └── workflows/
│
└── README.md                  # Start here
```

## Flujo de desarrollo con Specboot

Este proyecto usa el flujo **Spec-Driven Development (SSD)** con OpenSpec 1.4:

```bash
/enrich-us TICKET-ID      # Enriquecer ticket vago
/opsx-propose <nombre>   # Crear change + artefactos
/opsx-apply <nombre>     # Implementar con TDD (uno a la vez)
/verify <nombre>          # Validar contra escenarios
/adversarial-review       # Auditoría de código
/opsx-archive <nombre>    # Archivar cambio y sync specs
/commit                   # Commits + PR
```

Ver `AGENTS.md` para más información.

## Licencia

MIT