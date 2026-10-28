# Design

## Context

Exploración del repo (2026-10-20):

- **Backend ya implementado**: `apps/api/src/articles/` y `apps/api/src/categories/` tienen controller, service, repository, DTOs, entity y unit tests (change archivado `2026-06-28-crud-articulos-tiptap`). Contratos ya documentados en `docs/api-spec.yml` (`/api/v1/articles`, `/api/v1/categories`) y `docs/data-model.md` (colecciones `articles`, `categories`). CORS ya configurado en `main.ts` vía `CORS_ORIGIN` (default `http://localhost:4321`, credentials, métodos GET/POST/PATCH/DELETE/OPTIONS).
- **FirebaseService** (`apps/api/src/firebase/firebase.service.ts`) inicializa Firebase Admin con `FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY` y expone `getFirestore()`, `getAuth()`, `verifyIdToken()`. **No existe `getStorage()`** — única brecha real de API en este change. El spec de Jest usa mocks inline de `firebase-admin/*`.
- **Frontend**: `/admin/index.astro` es placeholder estático (change `2026-10-20-refactor-cleanup-admin-panel`). React 18 + `@astrojs/react` ya integrados; Tailwind 4 vía `@tailwindcss/vite` con tokens semánticos en `global.css` (`@theme` + `:root`/dark: `--color-body`, `--color-surface`, `--color-text`, `--color-border`, `--color-primary`, etc.). shadcn/ui y Tiptap NO están instalados. `lib/api-client.ts` ya existe para llamadas API futuras.
- **Guardarraíles**: `tests/validation/dependency-audit.test.ts` (3.5 bloquea deps no aprobadas) y `tests/validation/admin-cleanup.test.ts` (exige que `src/components/admin/` NO exista y que `/admin` sea placeholder). Ambos se actualizan en este change (decisión del usuario).

## Goals / Non-Goals

**Goals:**

- Cliente de Firebase Storage disponible en la API (TDD), sin endpoints de subida.
- Base shadcn/ui funcional en `apps/web` integrada a los tokens existentes (claro/oscuro).
- Shell administrativo en `/admin` (sidebar + header + content) que reemplace el placeholder.
- Isla React con Tiptap (shadcn-tiptap) + extensión de imágenes por URL en `/admin/blog/editor-test`.
- Guardarraíles estructurales actualizados y suite de validación en verde.

**Non-Goals:**

- Subida de archivos a Storage ni biblioteca de medios (change futuro).
- CRUD UI de artículos/categorías, dashboards con datos, protección de rutas `/admin/*` (auth queda intacto por restricción del usuario).
- Cambiar DTOs, contratos (`api-spec.yml`), entidades (`data-model.md`) o el sitio público.
- Re-scaffold de módulos `articles`/`categories` (ya existen y están specced).

## Decisions

### 1. Verificar, no re-scaffold, el backend

**Decisión**: los módulos existentes se verifican contra `article-tiptap-content` y la delta de `category-management`; el único código API nuevo es `getStorage()`.

**Rationale**: re-crear módulos destruiría código probado y duplicaría specs. El TDD aplica a lo nuevo (Storage) y la verificación corre los suites ya existentes.

**Alternativas consideradas**: re-scaffold completo (rechazado: destruye trabajo archivado); auditar y corregir drift (rechazado para este change: se anota en Open Questions).

### 2. Storage como capability propia y delgada (`firebase-storage`)

**Decisión**: capability nueva solo con disponibilidad del cliente; sin operaciones.

**Rationale**: honesto con el alcance (uploads son otro change) y no contamina `category-management` ni `api-env-setup`.

**Alternativas consideradas**: incluir en `category-management` (rechazado: dominio incorrecto); delta MODIFIED en `api-env-setup` (rechazado: la env es opcional y no cambia requisitos existentes).

### 3. Shell admin en `.astro` + JS mínimo; React solo para el editor

**Decisión**: `AdminLayout.astro`, `Sidebar.astro`, `Header.astro` en `src/components/admin/` con Tailwind utility-first y un script inline para el toggle móvil. La isla React se reserva para `EditorTest.tsx` (Tiptap).

**Rationale**: frontend-standards exigen componentes `.astro` por defecto y islas React solo con estado complejo. Un toggle de sidebar no justifica hidratación. shadcn/ui se usa como librería de componentes estilizados; los componentes usados en el shell (contenedores, badges, separator) se renderizan desde `.astro` cuando no requieren estado.

**Alternativas consideradas**: shell completo como isla React (rechazado: JS innecesario en todas las páginas admin).

### 4. AdminLayout reutiliza MainLayout con `hideHeader`/`hideFooter`

**Decisión**: `AdminLayout.astro` envuelve `MainLayout` con `hideHeader`/`hideFooter = true` en vez de duplicar el bootstrap de tema.

**Rationale**: evita duplicar la lógica de persistencia de tema (localStorage) y `<Head>`. El costo (script Turnstile/GTM y observer fade-in presentes) es aceptable y no afecta comportamiento.

**Alternativas consideradas**: layout propio desde cero (rechazado: duplicación de lógica de tema, riesgo de divergencia).

### 5. Puente de tokens shadcn/ui → design system

**Decisión**: definir en `global.css` (bloque aditivo) las variables que shadcn/ui espera (`--background`, `--foreground`, `--primary`, `--radius`, etc.) mapeadas a los tokens existentes (`--color-body`, `--color-text`, `--color-primary`...), en ambos temas. El selector de dark debe coincidir con el mecanismo existente (se verifica en apply: `[data-theme="dark"]`/`.dark` + `@custom-variant` de Tailwind 4).

**Rationale**: los componentes shadcn heredan automáticamente el tema claro/oscuro del sitio sin duplicar paleta. `global.css` solo recibe adiciones, nunca modificaciones (protege el sitio público).

**Alternativas consideradas**: variables independientes de shadcn con valores propios (rechazado: rompe single source of truth del design system).

### 6. Editor: Tiptap v3 + shadcn-tiptap, isla `client:only`

**Decisión**: deps `@tiptap/react@^3`, `@tiptap/starter-kit@^3`, `@tiptap/extension-image@^3`, `@tiptap/pm`. Componentes shadcn-tiptap integrados en `src/components/admin/tiptap/` (patrón shadcn: código copiado al repo). Isla montada con `client:only="react"` y `immediatelyRender: false`. La extensión de imágenes se configura con un helper `insertImageUrl(url)` (inserción por URL, sin upload handler).

**Rationale**: `data-model.md` documenta Tiptap JSON v3.27.1 — se fija major v3 para compatibilidad de formato con la API. `client:only` evita problemas de SSR del editor en build SSG. La lista exacta de deps del paquete shadcn-tiptap se fija en apply (permitido por allowlist actualizada).

**Alternativas consideradas**: Tiptap v2 (rechazado: JSON no coincide con el tipo `TiptapJSON` de la API); paquete npm de shadcn-tiptap si existiera (evaluar en apply, preferencia por copia de código estilo shadcn).

### 7. Guardarraíles actualizados dentro del change

**Decisión**: `dependency-audit.test.ts` recibe las nuevas deps en `ALLOWED_NEW_DEPS`; `admin-cleanup.test.ts` pasa a exigir el shell (AdminLayout/Sidebar/Header existen, `/admin/index.astro` existe, `dashboard|leads|settings` ausentes, redirect de login intacto).

**Rationale**: los tests estructurales codifican la spec vigente; la spec cambia, el test la sigue (los asserts de páginas legacy se conservan).

**Alternativas consideradas**: mover componentes a otro directorio para no tocar tests (rechazado: esconde la decisión y deja un guardarraíl desactualizado).

### 8. DTOs documentados para revisión (no se modifican)

**Decisión**: documentar aquí los DTOs ya implementados y dejar los hallazgos de revisión como Open Questions. No se cambia ningún DTO en este change.

**CreateCategoryDto (existente)**: `name` (string, requerido), `slug` (string URL-friendly, requerido), `description` (string, opcional). **UpdateCategoryDto**: todos opcionales.

**CreateArticleDto (existente)**: `title` (5–150), `slug` (URL-friendly), `content` (TiptapJSON válido, máx 5MB), `cover_url` (URL), `category_id`, `status` (`draft|published`), `tags` (opcional, minúsculas sin espacios). **UpdateArticleDto**: todos opcionales, `author_id` excluido (inmutable).

## Risks / Trade-offs

- **`@types/react@19` con `react@18.3` (mismatch preexistente)** → los nuevos paquetes se instalan con tipos compatibles con React 18; si el tipado de islas se queja, se documenta y se limita a este scope.
- **Tailwind 4 + shadcn/ui** → usar el flujo shadcn para Tailwind v4 (`tw-animate-css`, sin `tailwindcss-animate`); verificar en apply que el CLI shadcn detecta el setup Vite/Astro.
- **`global.css` compartido con el sitio público** → cambios estrictamente aditivos (bloque de variables); suite `ssg-build`/visual del sitio público debe quedar intacto.
- **Tiptap requiere DOM** → `client:only="react"` + unit test en jsdom con mocks de `@tiptap/react` si hiciera falta.
- **admin-cleanup podría perder protecciones** → los asserts de rutas legacy y redirect de login se conservan textualmente.
- **Deps nativas** → radix/lucide/tiptap son JS puros; no se espera cambio en `pnpm.allowBuilds`.

## Migration Plan

1. Artefactos de este change (propose — actual).
2. Tarea 1: Storage con TDD (test rojo → implementación → verde).
3. Tarea 2: verificación API (suites existentes en verde, evidencia en PR).
4. Tareas 3–5: shadcn base → shell admin → editor (TDD con guardarraíles).
5. Tarea 6: docs + suites completas + `openspec validate --all --strict`.
6. `/verify` → `/opsx-archive` sincroniza deltas (`admin-dashboard` y `tailwind-bem-migration` se modifican en main).

**Rollback**: revertir el/los commits del change; no hay migraciones de datos ni cambios de contrato.

## Open Questions

1. **Código de slug duplicado inconsistente**: artículos devuelve `409 Conflict` ("El slug ya está en uso"); categorías devuelve `400 Bad Request` ("El slug ya existe"). ¿Unificar? (no se toca en este change).
2. **Unicidad case-insensitive**: artículos documenta slug case-insensitive; categorías usa `existsBySlug` exacto. ¿Alinear?
3. Distribución de shadcn-tiptap (copia de código vs paquete npm) — se fija en apply.
4. Selector dark exacto para el puente de variables (`.dark` vs `[data-theme="dark"]`) — se verifica en apply.
