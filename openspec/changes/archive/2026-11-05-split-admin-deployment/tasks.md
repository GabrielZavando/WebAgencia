# Tasks

## 1. Scaffold de `apps/admin` (Astro SSR)

- [x] 1.1 Crear `apps/admin/package.json` con nombre `@webastro/admin`, scripts (`dev`, `build`, `preview`, `astro`, `test`) y dependencias base (`astro`, `@tailwindcss/vite`, `tailwindcss`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@astrojs/react`, `@astrojs/node`, `sharp`, `typescript`). Verificar: `pnpm install` en el monorepo y `pnpm --filter @webastro/admin` resuelve.
- [x] 1.2 Crear `apps/admin/astro.config.mjs` con `output: 'server'`, adaptador `@astrojs/node` en modo `standalone`, integraciones `react()` y `tailwindcss()`, y alias `@/` → `./src`. Verificar: `pnpm --filter @webastro/admin astro check` pasa.
- [x] 1.3 Crear `apps/admin/tsconfig.json`, `apps/admin/vitest.config.ts` y `apps/admin/.env.example` (modelo de variables: `PUBLIC_API_URL`, `PUBLIC_FIREBASE_*`, `PORT`, `HOST`). Verificar: existe `.env.example` y la app compila sin `.env` faltante en CI.
- [x] 1.4 Añadir `@webastro/admin` a `pnpm-workspace.yaml` si no está implícito por `apps/*`. Verificar: `pnpm --filter @webastro/admin build` genera `apps/admin/dist/server/entry.mjs`.

## 2. Migración del panel desde `apps/web` a `apps/admin`

- [x] 2.1 Migrar `src/pages/admin/**` y `src/pages/login/` de `apps/web` a `apps/admin`, ajustando rutas relativas de imports y layouts. Verificar: `pnpm --filter @webastro/admin build` genera rutas `/admin`, `/admin/articles`, `/admin/categories`, `/login` en servidor.
- [x] 2.2 Migrar `src/components/admin/` (incluido `tiptap/`), `src/components/auth/`, `src/components/ui/`, `src/layouts/AdminLayout.astro`, `src/lib/auth-headers.ts`, `src/lib/tiptap.ts`, `src/lib/utils.ts` y estilos de diseño. Verificar: todos los archivos existen en `apps/admin/src/` y el build está en verde.
- [x] 2.3 Reconstruir `AdminLayout.astro` en `apps/admin` como layout autónomo (sin envolver `MainLayout` del sitio público), con script de tema, sidebar colapsable y área de contenido. Verificar: `/admin` renderiza sidebar + header + contenido sin llamadas a la API.
- [x] 2.4 Ajustar imports internos de `@/` y variables `import.meta.env.PUBLIC_*` para que funcionen en SSR y en el bundle cliente de admin. Verificar: `pnpm --filter @webastro/admin test` pasa.

## 3. Limpieza de `apps/web` (solo sitio público SSG)

- [x] 3.1 Eliminar de `apps/web`: `src/pages/admin/`, `src/pages/login/`, `src/components/admin/`, `src/components/auth/`, `src/components/ui/`, `src/layouts/AdminLayout.astro`, `src/lib/auth-headers.ts`, `src/lib/tiptap.ts`, `src/lib/utils.ts` y cualquier import a ellos desde el sitio público. Verificar: los archivos ya no existen y `apps/web` compila.
- [x] 3.2 Ajustar `apps/web/astro.config.mjs` para `output: 'static'` sin adaptador de servidor. Verificar: `ssg-build.test.ts` y `middleware-detection.test.ts` pasan (sin `server`, `function`, `.mjs`/`.cjs` en `dist`).
- [x] 3.3 Ajustar `apps/web/package.json` retirando dependencias que solo usaba el admin (React, `@astrojs/react`, Tiptap, Firebase, shadcn/ui base si el sitio público ya no las usa). Verificar: `dependency-audit.test.ts` de `apps/web` pasa con su allowlist actualizada.
- [x] 3.4 Confirmar que el sitio público conserva landing, blog, servicios, metodología, contactos y captación de leads sin cambios funcionales. Verificar: e2e/build del sitio público en verde.

## 4. Webhook de revalidación en `apps/api`

- [x] 4.1 Escribir tests que fallen primero (TDD red) para `POST /api/v1/webhooks/rebuild-public`: `200` con Firebase ID token de rol admin, `200` con `X-Rebuild-Token`, `401` sin credenciales, `403` rol no admin, `502` cuando Coolify falla o no responde, `200` con `skipped: true` si `COOLIFY_REBUILD_WEBHOOK_URL` no está definida. Verificar: los tests fallan antes de implementar.
- [x] 4.2 Implementar `apps/api/src/webhooks/rebuild.controller.ts` y `apps/api/src/webhooks/rebuild.service.ts`; registrar el módulo en `AppModule`. El servicio llama server-side al webhook de Coolify, no expone URL ni token, y nunca revierte la mutación si el webhook falla. Verificar: tests de 4.1 pasan (TDD green).
- [x] 4.4 Añadir `COOLIFY_REBUILD_WEBHOOK_URL` y `REVALIDATION_WEBHOOK_TOKEN` a `apps/api/.env.example`. Verificar: variables documentadas y no commiteadas.
- [x] 4.5 Actualizar `docs/api-spec.yml` con el endpoint, contrato de request/response, errores `401`/`403`/`502` y ejemplo real. Verificar: `openspec validate` y el spec coinciden con la implementación.
- [x] 4.6 Implementar la llamada desde `apps/admin` al endpoint tras guardar/eliminar artículo o categoría mediante `src/lib/rebuild.ts` (fire-and-forget, no bloqueante). Verificar: tests de `rebuild.spec.ts` y `ArticleForm.test.tsx` pasan; build de `apps/admin` en verde.

## 5. Pruebas, guardarraíles y documentación de despliegue

- [x] 5.1 Reescribir `apps/web/tests/validation/admin-cleanup.test.ts` para afirmar la ausencia de páginas/componentes de admin en `apps/web` y crear una suite equivalente en `apps/admin` que afirme su presencia. Verificar: ambas suites pasan.
- [x] 5.2 Actualizar `apps/web/tests/validation/dependency-audit.test.ts` (quitar deps de admin de la allowlist pública) y crear `apps/admin/tests/validation/dependency-audit.test.ts` con las deps aprobadas del panel. Verificar: dep-audit pasa en ambas apps.
- [x] 5.3 Mover los tests E2E de login de `apps/web/tests/e2e/login-flow.spec.ts` a `apps/admin/tests/e2e/` y ajustar la base URL al dominio del panel. Verificar: E2E de login pasa contra `apps/admin`.
- [x] 5.4 Crear `docs/deployment.md` con la configuración de las tres apps en Coolify (Static Site, Web Application Node con `node ./dist/server/entry.mjs`, Web Application Nixpacks), variables de entorno por app y el flujo del webhook de rebuild. Verificar: el archivo existe y cubre las tres aplicaciones.
- [x] 5.5 Ejecutar `pnpm -r test`, `pnpm -r lint` y `openspec validate --all --strict`. Verificar: todo en verde antes de archivar.

## Workflow follow-up

- Archivar el cambio con `/opsx-archive split-admin-deployment` una vez verificada la implementación.
- Sincronizar los delta specs a las specs principales (`cms-admin-panel`, `landing-public`, `client-portal-auth`, `admin-dashboard`) y crear las nuevas (`deployment-topology`, `public-site-revalidation`).
- Re-ejecutar `openspec validate --all --strict` después del archive.
- Crear el commit convencional y el PR.
