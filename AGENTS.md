# AGENTS.md — WebAgenciaAstro

> Documento principal para asistentes IA que operan en este repositorio.
> OpenCode (`.opencode/`) es el único cliente IA soportado.

## Stack
- **Framework:** Astro 5 (`output: 'static'`, SSG, sin adapter)
- **CSS:** Tailwind 4 (plugin `@tailwindcss/vite`) — componentes nuevos y admin usan utility-first. `src/styles/global.css` contiene tokens + componentes legacy BEM en migración progresiva.
- **Islands (opcional):** React 18 vía `@astrojs/react` — uso mínimo, sólo para componentes que requieren hidratación cliente (ej. `/login`)
- **Gestor de paquetes:** pnpm
- **Testing:** Vitest (unitario/validación) + Playwright (E2E)
- **Blog:** Renderizado del lado del cliente (CSR) — los posts se obtienen de la API NestJS en tiempo de ejecución vía `src/scripts/blog-fetch.ts`.
- **Cliente API:** `src/lib/api-client.ts` — basado en fetch con reintento, timeout, inyección de Turnstile y métodos tipados (`apiClient.get/post/put/patch/delete`)

## Workflow Spec-Driven (OBLIGATORIO)

Este proyecto sigue **Spec-Driven Development** con **OpenSpec**.

Comandos disponibles en OpenCode (en `.opencode/commands/`):

| Comando | Acción |
|---------|--------|
| `/opsx:explore` | Pensar la solución antes de planear (no escribe código) |
| `/opsx:propose <nombre>` | Generar propuesta OpenSpec (`proposal.md`, `design.md`, `tasks.md`, delta specs) |
| `/opsx:apply` | Implementar tasks una por una con TDD |
| `/opsx:verify` | Validar implementación contra scenarios |
| `/opsx:archive` | Archivar cambio al completar |

> **Regla**: Antes de codear, generar artefactos OpenSpec. Sólo implementar después de alinear specs.
> **Regla**: Si el ticket es vago, usar `/opsx:explore` primero para reducir ambigüedad.
> **Regla**: Antes de `/opsx:archive`, ejecutar `/opsx:verify`. Si hay CRITICAL issues, resolverlos antes de archivar. Warnings se permiten pero deben documentarse.

Estructuras relevantes:
- `openspec/specs/` — Capacidades versionadas (vision a futuro). Aquí viven las specs de dominio.
- `openspec/changes/<nombre>/` — Cambios en WIP, con `proposal.md`, `design.md`, `tasks.md` y deltas de specs.
- `openspec/changes/archive/<fecha>_<nombre>/` — Historial de cambios completados.
- `docs/` — Estándares editables (frontend, backend, documentación, modelo de datos, API).
- `ai-specs/` — Skills y agentes IA (no editar salvo skill nuevo aprobado).
- `.opencode/` — Skills y commands nativos OpenSpec (regenerados por `openspec init`).

## Comandos esenciales
| Comando | Acción |
|---------|--------|
| `pnpm dev` | Servidor de desarrollo (abre navegador automáticamente) |
| `pnpm build` | Build estático → `dist/` |
| `pnpm preview` | Vista previa del build |
| `pnpm test` | Tests unitarios Vitest (`src/**/*.{test,spec}.{js,ts}` + `tests/validation/*.test.ts`) |
| `pnpm test:e2e` | Tests E2E Playwright (inicia servidor dev automáticamente) |
| `pnpm test:validation` | Validación estática + E2E sobre el build |
| `pnpm test:validation:static` | Solo tests de validación estática (Vitest, requiere `dist/`) |
| `pnpm test:validation:e2e` | Solo tests Playwright sobre build de producción |
| `bash scripts/validate-ssg.sh` | Suite completa de validación con resumen |
| `npx @fission-ai/openspec list` | Listar cambios activos |
| `npx @fission-ai/openspec validate --strict` | Validar todas las specs |

## Arquitectura
- **Páginas (12):** `src/pages/` — index, 404, blog (index + [slug]), servicios, metodologia, diagnostico, login, admin/dashboard, suscripcion-confirmada, unsubscribe, politica-de-privacidad, sitemap.xml.ts
- **Componentes:** `src/components/shared/` (Header, Footer, Modal, Search, ErrorPage, etc.) + `src/components/landing/` (Banner, About, Services, Plans, Workflow, Contact, ServiceCard, PackSistemas, PackWebProfesional, SolucionesModulares, MetodologiaCTP) + `src/components/auth/` (LoginForm React island) + `src/components/admin/` (DashboardLayout, Sidebar, Header, StatsCard, RecentLeadsTable, Dashboard) + `src/components/metodologia/` (GeneralVision, MaturitySpiral, ChangeManagement, DetailedPipeline)
- **Datos:** Archivos JSON en `src/data/` — `services.json`, `plans.json`, `menu.json` (no se obtienen de API)
- **Config:** `src/config/company.config.ts` — info de empresa, redes sociales; `src/utils/config.ts` — obtiene config de API con fallback estático
- **Sitemap generado:** `src/pages/sitemap.xml.ts` — endpoint ejecutado en tiempo de build
- **Formulario de contacto:** Envía a NestJS `/api/v1/leads/contact` vía `apiClient.post()`. Incluye anti-spam integrado: honeypot, cooldown (2min localStorage), análisis de contenido, verificación de tiempo de llenado.
- **Login (feature piloto):** `/login` con React island (`client:load`). Un único usuario admin, sin registro público, sin recuperación de contraseña vía UI.
- **Sistema de diseño:** Documentado en `docs/DESIGN.md`. Leer antes de modificar UI. Todos los cambios al sistema de diseño deben pasar por `/opsx:propose`.

## Peculiaridades de testing
- Vitest: `globals: true`, `environment: 'jsdom'`. Importar `describe/it/expect` desde vitest.
- Config Playwright E2E: inicia `pnpm dev` como webServer. Config E2E de validación: ejecuta `pnpm build && pnpm preview`.
- Los tests de validación requieren que `dist/` exista (ejecutar `pnpm build` primero). Verifican: sin artefactos de servidor, sin adapter, dependencias firebase bloqueadas (excepto `@astrojs/react`/`react`/`react-dom`/`@vitejs/plugin-react` aprobadas tras feature piloto de login).
- Los **deps-audit** actualmente bloquean dependencias nuevas — una nueva dep debe aprobarse explícitamente vía OpenSpec y reflejarse en `tests/validation/dependency-audit.test.ts` antes de mergear.

## Convenciones y peculiaridades
- No hay scripts `lint` ni `typecheck` en package.json. Astro dev toolbar deshabilitado.
- Variables de entorno requeridas: `PUBLIC_API_BASE_URL`, `PUBLIC_API_URL`, `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_SITE_URL`, `PUBLIC_GTM_ID`.
- Tema: sistema claro/oscuro, persistido en localStorage, forzado via prop `forcedTheme` de `MainLayout`.
- Animaciones fade-in: clase `.fade-in` con clase `animate` manejada por IntersectionObserver. Retardos via `.fade-in-delay-N`.
- **Estrategia CSS:** Tailwind utility-first para componentes nuevos y admin. Componentes legacy usan BEM en `global.css` en migración progresiva a Tailwind. Ver `docs/DESIGN.md` para decisión oficial.
- Todos los cambios al sistema de diseño deben pasar por `/opsx:propose`.
- Cliente API generado: `pnpm gen:api` lee `../Api/swagger.json` → escribe `src/api/index.ts`. El directorio `src/api/` suele estar vacío si no se ha generado.
- `sharp` y `@parcel/watcher` son dependencias de build permitidas (fijadas en `pnpm.allowBuilds` en package.json).
- Firebase fue eliminado (v1.6-v1.7). La feature piloto `feat-login-island` reintroduce `/login` y `/admin/dashboard` como puntos de entrada aislados con React islands.
- `opencode.json` está minimal — contiene solo `$schema`. No hardcodear modelos; OpenCode usa el modelo activo del editor.
- `vitest.config.ts` incluye plugin `@vitejs/plugin-react` para soportar tests de componentes React.

## Available skills (OpenCode nativo)

Las skills se cargan automáticamente cuando una solicitud coincide con su descripción.

| Skill | Uso |
|-------|-----|
| `openspec-explore` (`/opsx:explore`) | Explorar ideas antes de planear |
| `openspec-propose` (`/opsx:propose`) | Generar propuesta de cambio OpenSpec |
| `openspec-apply-change` (`/opsx:apply`) | Implementar tasks con TDD |
| `openspec-verify-change` (`/opsx:verify`) | Validar implementación contra artifacts antes de archivar |
| `openspec-archive-change` (`/opsx:archive`) | Archivar cambio completado |

Skills adicionales en `ai-specs/skills/` (legado Specboot — opcional):
- `enrich-us` — Enriquecer user story vaga antes de planificar
- `using-git-worktrees` — Workspace aislado por feature
- `code-auditing` — Auditoría sistemática de calidad
- `commit` — Conventional commits y PR
- `deploy` — Release y rollback
- `onboarding` — Setup nuevos desarrolladores

> Skills del usuario (NO modificar): `.agents/skills/frontend-design` — pertenece al entorno del usuario.

## Deploy
1. `pnpm build` → `dist/`
2. Subir contenido de `dist/` a `public_html/` de Hostinger vía FTP
3. No se necesita configuración de servidor (HTML puro)
