# Tasks

## 1. API — Firebase Storage (TDD)

- [x] 1.1 Agregar en `apps/api/src/firebase/firebase.service.spec.ts` mock inline de `firebase-admin/storage` (patrón existente) y tests que fallen: `getStorage()` retorna instancia; lanza "Firebase app not initialized" sin app; `storageBucket` se pasa a `initializeApp` solo si `FIREBASE_STORAGE_BUCKET` está definida. Confirmar rojo con `pnpm -F @webastro/api test -- firebase`.
- [x] 1.2 Implementar `getStorage()` en `FirebaseService` + `storageBucket` opcional en `initializeApp`; documentar `FIREBASE_STORAGE_BUCKET` (opcional) en `apps/api/.env.example`. Confirmar verde con `pnpm -F @webastro/api test -- firebase`.

## 2. API — Verificación de módulos existentes (sin cambios de código)

- [x] 2.1 Ejecutar `pnpm -F @webastro/api test` y verificar en verde los suites de `articles`, `categories`, `firebase`, `auth`, `users`, `leads`; comparar comportamiento de `/api/v1/categories` y `/api/v1/articles` contra `article-tiptap-content` y la delta de `category-management`; documentar cualquier drift (esperado: ninguno) y los hallazgos de Open Questions (409 vs 400 en slug duplicado).
- [x] 2.2 Verificar CORS en `apps/api/src/main.ts` contra lo documentado (`CORS_ORIGIN`, credentials, métodos) y dejar evidencia en la PR (sin cambios de código esperados).

## 3. Web — Base shadcn/ui (TDD)

- [x] 3.1 Instalar deps base en `apps/web` (`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`, radix según componentes) y confirmar que `dependency-audit` 3.5 queda rojo con `pnpm -F @webastro/web test -- dependency-audit`.
- [x] 3.2 Agregar las deps nuevas a `ALLOWED_NEW_DEPS` en `tests/validation/dependency-audit.test.ts` y confirmar verde; crear `components.json` + `src/lib/utils.ts` (`cn`) + bloque aditivo de variables CSS puente en `src/styles/global.css` (claro/oscuro).
- [x] 3.3 Unit test de `cn()` en Vitest (rojo → implementación → verde) con `pnpm -F @webastro/web test -- utils`.

## 4. Web — Shell admin en /admin (TDD)

- [x] 4.1 Actualizar `tests/validation/admin-cleanup.test.ts`: exige `AdminLayout.astro`, `Sidebar.astro`, `Header.astro` en `src/components/admin/`, mantiene asserts de rutas legacy ausentes y redirect de login; confirmar rojo.
- [x] 4.2 Crear `src/layouts/AdminLayout.astro` (reutiliza MainLayout con `hideHeader`/`hideFooter`) y `src/components/admin/{Sidebar,Header}.astro`; reemplazar el contenido de `src/pages/admin/index.astro` por el shell (tokens, `aria-label` en toggle, script inline para colapsar sidebar); confirmar verde con `pnpm -F @webastro/web test -- admin-cleanup`.
- [x] 4.3 Ejecutar `pnpm -F @webastro/web build` + `pnpm -F @webastro/web test:validation` y verificar `dist/admin/index.html` presente, rutas legacy ausentes, ssg-build/hostinger/middleware-detection en verde.

## 5. Web — Isla del editor Tiptap (TDD)

- [x] 5.1 Instalar deps Tiptap (`@tiptap/react@^3`, `@tiptap/starter-kit@^3`, `@tiptap/extension-image@^3`, `@tiptap/pm`) + deps de shadcn-tiptap elegidas en apply; actualizar allowlist y confirmar verde con `pnpm -F @webastro/web test -- dependency-audit`.
- [x] 5.2 Unit test de `EditorTest.tsx` en Vitest/jsdom (monta la isla, expone documento JSON `type: 'doc'`); confirmar rojo con `pnpm -F @webastro/web test -- EditorTest`.
- [x] 5.3 Crear `src/pages/admin/blog/editor-test.astro` (isla `client:only="react"`, `immediatelyRender: false`) y `src/components/admin/EditorTest.tsx` con toolbar shadcn-tiptap, vista JSON/HTML y extensión de imágenes con inserción por URL (`insertImageUrl`, sin upload); integrar componentes tiptap en `src/components/admin/tiptap/`; confirmar verde con `pnpm -F @webastro/web test -- EditorTest`.
- [x] 5.4 Ejecutar build + validación completa y verificar `dist/admin/blog/editor-test/index.html`.

## 6. Docs y verificación final

- [x] 6.1 Actualizar `CHANGELOG.md` y `docs/design/design-components.md` con el shell admin y la base shadcn/ui.
- [x] 6.2 Ejecutar suites completas (`pnpm -F @webastro/web test`, `pnpm -F @webastro/api test`) y `pnpm exec openspec validate --all --strict`; confirmar verde.
- [x] 6.3 `/verify feat-cms-skeleton` contra los escenarios de las deltas; resolver hallazgos actualizando artefactos primero si aparece un fix.

## Workflow follow-up

- `/opsx-archive feat-cms-skeleton` sincroniza deltas; verificar que `admin-dashboard` y `tailwind-bem-migration` reflejen el shell en main.
- Los Open Questions (slug 409 vs 400, unicidad case-insensitive, distribución shadcn-tiptap) se resuelven en changes futuros.
