# Tasks

## 1. Baseline de aceptación

- [x] 1.1 Crear `apps/web/tests/validation/admin-cleanup.test.ts` con asserts de: `/admin/index.astro` existente, páginas legacy ausentes, `src/components/admin/` ausente y redirect de `LoginForm.tsx` a `/admin`; ejecutar `pnpm -F @webastro/web test -- tests/validation/admin-cleanup.test.ts` y confirmar que falla antes de implementar.

## 2. Eliminar UI legacy y actualizar documentación

- [x] 2.1 Borrar `apps/web/src/pages/admin/dashboard.astro`, `leads.astro` y `settings.astro`; verificar con `test ! -e` que los tres archivos no existen.
- [x] 2.2 Borrar el directorio `apps/web/src/components/admin/` completo; verificar que `rg "components/admin|DashboardLayout|RecentLeadsTable|StatsCard" apps/web/src apps/web/tests` no devuelve referencias.
- [x] 2.3 Actualizar `docs/design/design-components.md`, `docs/design/DESIGN.md`, `docs/design/ai-design-guidance.md` y `CHANGELOG.md` para eliminar la documentación de componentes admin borrados; verificar con `rg "src/components/admin|DashboardLayout|RecentLeadsTable|StatsCard" docs/design CHANGELOG.md` que no quedan referencias obsoletas.

## 3. Placeholder `/admin`

- [x] 3.1 Crear `apps/web/src/pages/admin/index.astro` como página estática con `MainLayout`, mensaje de panel en construcción y enlace al inicio; ejecutar `pnpm -F @webastro/web test -- tests/validation/admin-cleanup.test.ts` y verificar que los asserts de archivos pasan.
- [x] 3.2 Ejecutar `pnpm -F @webastro/web build`; verificar que existe `apps/web/dist/admin/index.html` y que no existen `dist/admin/dashboard/index.html`, `dist/admin/leads/index.html` ni `dist/admin/settings/index.html`.

## 4. Redirección de login

- [x] 4.1 Cambiar en `apps/web/src/components/auth/LoginForm.tsx` el destino `window.location.href = '/admin/dashboard'` por `window.location.href = '/admin'`; verificar con `pnpm -F @webastro/web test -- tests/validation/admin-cleanup.test.ts`.
- [x] 4.2 Actualizar `apps/web/tests/e2e/login-flow.spec.ts` para esperar `/admin` y el shape de respuesta que consume el formulario; ejecutar `pnpm -F @webastro/web exec playwright test tests/e2e/login-flow.spec.ts` si el entorno de Firebase está disponible; si no, documentar la limitación preexistente y usar el test estructural como gate.
- [x] 4.3 Actualizar `docs/design/LOCAL_DEV.md` para indicar redirección a `/admin`; verificar con `rg "/admin/dashboard" docs/design` que no quedan referencias.
- [x] 4.4 Ejecutar `pnpm -F @webastro/web test -- src/components/auth/LoginForm.test.tsx` y verificar que los tests existentes de login siguen pasando.

## 5. Verificación de integración

- [x] 5.1 Ejecutar `pnpm -F @webastro/web test` y verificar que toda la suite Vitest pasa, incluida la validación estructural.
- [x] 5.2 Ejecutar `pnpm exec openspec validate --all --strict` y verificar que todas las specs restantes pasan.
- [x] 5.3 Ejecutar `git diff --check` y verificar que no hay errores de whitespace.
- [x] 5.4 Verificar manualmente en `apps/web/dist/` que `/admin` existe y que las rutas legacy devuelven 404 en un servidor estático.

## Workflow follow-up

- Archivar el change con `/opsx-archive refactor-cleanup-admin-panel` cuando la implementación pase verificación.
- Actualizar directamente el Purpose de `openspec/specs/admin-dashboard/spec.md` para describir el placeholder `/admin`, porque los delta specs no modifican el Purpose de capabilities existentes.
- Confirmar que `openspec/specs/dashboard-widgets/spec.md` y `openspec/specs/auth-protection/spec.md` fueron eliminados por `retire_capabilities: true`.
- Re-ejecutar `pnpm exec openspec validate --all --strict` después del archive.
