---
description: Estrategia de despliegue del monorepo WebAstro (API NestJS + Frontend Astro). Editar para contexto.
alwaysApply: true
---

# Deploy Standards — WebAstro Monorepo

Este documento es la **fuente de verdad** para el flujo de release y despliegue de
ambas aplicaciones del monorepo. Sigue el ciclo SDD: nunca se despliega código sin
artefactos OpenSpec aprobados.

## 1. Entornos

| Entorno | API (NestJS) | Frontend (Astro SSG) |
|---------|---------------|----------------------|
| **Local** | `pnpm dev:api` → `http://localhost:3000/api/v1` | `pnpm dev:web` → `http://localhost:4321` |
| **Staging** | Docker / Cloud Run (branch `develop` o tag `rc-*`) | Build estático sobre branch de preview |
| **Producción** | Docker / Cloud Run (tag `vX.Y.Z`) | `dist/` subido a Hostinger `public_html/` vía FTP |

## 2. Versionado

- **Conventional Commits** obligatorio (validado por `commitlint`).
- **Release**: version bump automático vía `release-please` (config en `apps/web`) o
  manual con `openspec` archive + tag semver (`vX.Y.Z`).
- `CHANGELOG.md` por app (`apps/web/CHANGELOG.md`) más raíz (`CHANGELOG.md`).
- El número de versión del frontend es independiente del de la API; se versiona por app.

## 3. Build

```bash
pnpm -r build          # build de todas las apps del workspace
pnpm -F @webastro/api build   # solo API (nest build → dist/)
pnpm -F @webastro/web build    # solo Web (astro build → dist/ SSG)
```

## 4. API (NestJS)

- Contenedor Docker definido en `apps/api/docker/` (`docker-compose.yml`).
- Swagger disponible en `/api/v1/docs` tras el build.
- Variables de entorno: ver `apps/api/.env.example` (Firebase, Firestore, CORS, Throttler).
- Despliegue objetivo: Cloud Run o máquina con Docker. Health check en `/health` o `/api/v1/health`.

## 5. Frontend (Astro SSG)

- Build estático puro (sin adapter) → `apps/web/dist/`.
- Despliegue: subir **solo el contenido** de `dist/` a `public_html/` del hosting (Hostinger) vía FTP.
- No requiere servidor ni runtime Node en producción.
- Validar SSG antes de deploy: `pnpm -F @webastro/web test:validation`.

## 6. Rollback

- **API**: redeploy del tag anterior (Cloud Run revision / imagen Docker previa).
- **Frontend**: redeploy del `dist/` del tag anterior (FTP) o revert del commit + rebuild.
- Registrar el rollback en `CHANGELOG.md` con motivo.

## 7. Pre-deploy checklist

- [ ] `pnpm -r lint` y `pnpm -r test` en verde.
- [ ] `openspec validate --strict` en verde (specs actualizadas).
- [ ] `.env` de producción revisado (secretos NO commiteados).
- [ ] Smoke test post-deploy (health endpoint + carga de home).
