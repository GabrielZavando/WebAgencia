## Context

La interfaz de usuario del CRUD de categorías en el panel de administración (`apps/admin`) ya está implementada:
- `apps/admin/src/pages/admin/categories/index.astro` → renderiza `CategoriesTable` (isla React)
- `apps/admin/src/pages/admin/categories/form.astro` → renderiza `CategoryForm` (isla React) con `?id=new` o `?id=<id>`
- `apps/admin/src/components/admin/CategoriesTable.tsx` → tabla con shadcn/ui (Table, Badge, Button), listado, edición, eliminación con diálogo de confirmación
- `apps/admin/src/components/admin/CategoryForm.tsx` → formulario con shadcn/ui (Input, Label, Button), creación (POST) y edición (PATCH), validación de slug
- `apps/admin/src/components/admin/Sidebar.astro` → enlace "Categorías" apuntando a `/admin/categories`
- `apps/admin/src/lib/auth-headers.ts` → helper `getAuthHeaders()` que devuelve `Authorization: Bearer <Firebase ID token>`
- `apps/admin/src/lib/api-client.ts` → `apiClient` con `get`/`post`/`patch`/`delete`

Lo que falta:
- Pruebas Vitest unitarias para `CategoriesTable` y `CategoryForm` (renderizado y envío del token Bearer)
- (Opcional) prueba E2E en Playwright para creación de categoría
- Artefactos OpenSpec para gobernanza del cambio

El backend (`apps/api`) ya tiene los endpoints `GET/POST/PATCH/DELETE /api/v1/categories` implementados y probados. No se modifica el backend ni `apps/web`.

## Goals / Non-Goals

**Goals:**
- Cubrir con tests Vitest el renderizado y el envío del header `Authorization: Bearer <token>` en `CategoriesTable` y `CategoryForm`.
- Documentar la estrategia de validación del formulario de categoría.
- Generar los artefactos OpenSpec necesarios para archivar el cambio.
- No romper la funcionalidad existente del panel.

**Non-Goals:**
- Modificar el backend (`apps/api`) ni sus endpoints de categorías.
- Modificar el sitio público (`apps/web`).
- Añadir estado global (Redux/Zustand/Pinia) — el proyecto lo prohíbe.
- Implementar subida de archivos o portada de categoría (quedará para futuros cambios).

## Decisions

### 1. Usar `fetch` directamente + `getAuthHeaders()` en lugar de `apiClient` para llamadas mutantes
**Razón:** El requerimiento especifica usar `fetch` con `Authorization: Bearer <token>` vía el helper `auth-headers.ts` existente. `apiClient` envía `credentials: 'include'` (cookie httpOnly) pero no inyecta el header Bearer de Firebase. Usar `fetch` + `getAuthHeaders()` cumple exactamente el contrato del spec.
**Alternativa considerada:** Extender `apiClient` para aceptar headers dinámicos. Descartada por añadir complejidad innecesaria cuando `fetch` + `getAuthHeaders()` ya resuelve el caso.

### 2. Validación del formulario en cliente (React) + validación en backend
**Razón:** El formulario valida client-side (slug con regex `^[a-z0-9]+(-[a-z0-9]+)*$`, name minLength 2/maxLength 100) para feedback inmediato. El backend valida de nuevo (fuente de verdad) y retorna 400 con mensaje en español. Esto cumple con "doble fuente de verdad" del data model.
**Alternativa considerada:** Usar una librería de formularios (React Hook Form, Zod). Descartada por mantener el mínimo de dependencias y usar solo shadcn/ui ya instalado.

### 3. Estados de carga, error y vacío siempre implementados
**Razón:** Estándar frontend del proyecto: estados de carga (skeleton/spinner), error y vacío son obligatorios. `CategoriesTable` ya los implementa; `CategoryForm` los tiene parciales (loading, error).
**Alternativa considerada:** Omitir estados en la versión inicial. Descartada por violar los UI/UX standards.

### 4. Diálogo de confirmación nativo (HTML dialog / overlay CSS) antes de eliminar
**Razón:** El requerimiento exige un diálogo de confirmación antes de borrar. `CategoriesTable` ya implementa un overlay con `confirmDeleteId` que funciona como diálogo modal.
**Alternativa considerada:** Usar `window.confirm()`. Descartada por mala UX y falta de estilo consistente con TailAdmin.

## Risks / Trade-offs

- [Risk] Las llamadas mutantes usan `fetch` directamente en lugar de `apiClient`, por lo no se benefician de retry/timeout de `apiClient`. → Mitigación: los endpoints son internos y rápidos; se puede migrar a `apiClient` con headers personalizados en el futuro.
- [Risk] El token Firebase se obtiene en cliente (`auth.currentUser.getIdToken()`), expuesto a XSS si no hay CSP estricto. → Mitigación: el proyecto ya usa este patrón en todo el panel; no es un cambio nuevo.
- [Risk] El diálogo de eliminación es un overlay CSS, no un elemento `<dialog>` nativo con `aria-modal`. → Mitigación: tiene `onClick` para cerrar al hacer clic fuera y `e.stopPropagation()` en el contenido. Se podría mejorar a `<dialog>` en una iteración posterior.

## Migration Plan

No hay migración de datos ni de schema. Los artefactos OpenSpec se archivan con `openspec archive add-admin-categories-crud --yes`, lo cual sincroniza el delta spec de `cms-admin-panel` a `openspec/specs/`.

## Open Questions

- ¿Se añade la prueba E2E opcional en Playwright? (marcada como opcional en el requerimiento)
- ¿Se migra `fetch` + `getAuthHeaders()` a `apiClient` con headers personalizados en un cambio posterior?
