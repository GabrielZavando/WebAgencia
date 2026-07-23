# WebAstro Monorepo

Monorepo para el sitio web y API de **Agencia Digital Gabriel Zavando**. Combina un frontend estático (Astro) con una API backend (NestJS), gestionado como workspace compartido con contexto de Spec-Driven Development (SDD).

**Stack principal:**

| Capa | Tecnología |
|------|-----------|
| Frontend | Astro 5 (SSG) + React 18 (islands) + Tailwind CSS 4 |
| Backend | NestJS 11 + Firebase Auth + Firestore + Supabase PostgreSQL |
| Gestor de paquetes | pnpm 10 (workspaces) |
| Metodología | Spec-Driven Development con OpenSpec 1.4 |

## Requisitos

- **Node.js** >= 22.12
- **pnpm** >= 10
- **Docker** y Docker Compose (opcional, para la API)
- **Cuenta de Firebase** (proyecto configurado para Auth y Firestore)
- **Cuenta de Supabase** (base de datos PostgreSQL para leads)

## Inicio rápido

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd WebAstro2

# 2. Instalar dependencias
pnpm install

# 3. Iniciar el frontend en desarrollo
pnpm dev:web
```

Para la API, copiar las variables de entorno y ver las instrucciones en [apps/api/README.md](apps/api/README.md).

## Comandos disponibles

### Scripts pnpm (raíz)

| Comando | Descripción |
|---------|------------|
| `pnpm dev:api` | Iniciar la API NestJS en modo desarrollo |
| `pnpm dev:web` | Iniciar el frontend Astro en modo desarrollo |
| `pnpm build` | Build de producción para todas las apps |
| `pnpm test` | Ejecutar tests de todas las apps |
| `pnpm lint` | Lint de todas las apps |
| `pnpm validate` | Validación completa de todas las apps |

### Makefile

| Comando | Descripción |
|---------|------------|
| `make install` | Instalar dependencias |
| `make lint` | Lint de todas las apps |
| `make test` | Ejecutar tests |
| `make build` | Build de producción |
| `make ci` | Pass completo de CI (install + build + lint + test + validate + refcheck) |
| `make validate` | Validación estructural de Specboot |
| `make refcheck` | Verificar integridad de referencias `{file:...}` |
| `make audit` | Lint + validación OpenSpec |
| `make commitlint` | Verificar convención de commits |

## Estructura del monorepo

```
WebAstro2/
├── apps/
│   ├── api/          → API NestJS (usuarios, blog, leads)
│   └── web/          → Frontend Astro (sitio estático)
├── docs/             → Especificaciones y estándares del proyecto
├── ai-specs/         → Agentes y skills para desarrollo asistido
├── openspec/         → Artefactos OpenSpec (changes y specs)
├── .opencode/        → Configuración de OpenCode y skills
├── Makefile          → Orquestación de CI local
└── package.json      → Configuración del workspace pnpm
```

## Aplicaciones

| App | Descripción | README |
|-----|------------|--------|
| **API** | Backend NestJS — autenticación, gestión de usuarios, blog y captación de leads | [apps/api/README.md](apps/api/README.md) |
| **Web** | Frontend Astro — sitio web estático con SSR mínimo vía React islands | [apps/web/README.md](apps/web/README.md) |

## Flujo de desarrollo (Spec-Driven Development)

Este proyecto usa **OpenSpec 1.4** para gestionar cambios mediante un flujo de desarrollo guiado por especificaciones:

```bash
/enrich-us <TICKET>        # Enriquecer un ticket vago antes de planificar
/opsx-explore [tema]       # Modo exploración: pensar, investigar, clarificar
/opsx-propose <nombre>     # Crear un change con proposal, design y tasks
/opsx-apply <nombre>       # Implementar tareas con TDD (una a la vez)
/verify <nombre>           # Validar implementación contra escenarios
/adversarial-review        # Auditoría de calidad de código (7 fases)
/opsx-archive <nombre>     # Archivar cambio completado y sincronizar specs
/commit                    # Crear commits convencionales y PR
```

Los artefactos OpenSpec viven en `openspec/changes/<nombre>/` y la fuente de verdad para contratos HTTP y modelo de datos está en `docs/api-spec.yml` y `docs/data-model.md`.

## Documentación del proyecto

| Archivo | Contenido |
|---------|----------|
| [docs/base-standards.md](docs/base-standards.md) | Reglas globales de desarrollo |
| [docs/backend-standards.md](docs/backend-standards.md) | Estándares del backend (NestJS) |
| [docs/frontend-standards.md](docs/frontend-standards.md) | Estándares del frontend (Astro) |
| [docs/api-spec.yml](docs/api-spec.yml) | Contratos HTTP (OpenAPI 3.0) |
| [docs/data-model.md](docs/data-model.md) | Entidades y modelo de datos |
| [AGENTS.md](AGENTS.md) | Instrucciones para agentes IA |

## Licencia

MIT
