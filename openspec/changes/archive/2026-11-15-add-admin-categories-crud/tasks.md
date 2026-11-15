## 1. Frontend (`apps/admin`) — CRUD de categorías

- [x] 1.1 Vista de listado: `apps/admin/src/pages/admin/categories/index.astro` renderiza isla React `CategoriesTable.tsx` (shadcn/ui Table, Badge, Button) con Nombre, Slug, Fecha de creación y acciones (Editar, Eliminar)
- [x] 1.2 Formulario: `apps/admin/src/pages/admin/categories/form.astro` con query param `?id=new` o `?id=<id>` renderiza isla React `CategoryForm.tsx` (shadcn/ui Input, Label, Button)
- [x] 1.3 Lógica API: llamadas `fetch` GET/POST/PATCH/DELETE a `/api/v1/categories` con `Authorization: Bearer <token>` vía `auth-headers.ts`
- [x] 1.4 Eliminación: diálogo de confirmación antes de borrar una categoría
- [x] 1.5 Navegación: enlace "Categorías" en `Sidebar.astro` apunta a `/admin/categories`

## 2. Tests (TDD) — Vitest unitarios

- [x] 2.1 Escribir test Vitest para `CategoriesTable`: verifica renderizado de tabla y envío de header `Authorization: Bearer <token>` en DELETE
- [x] 2.2 Escribir test Vitest para `CategoryForm`: verifica renderizado de formulario, validación de slug y envío de header `Authorization: Bearer <token>` en POST/PATCH
- [x] 2.3 Ejecutar `pnpm test` en `apps/admin` y confirmar que los tests pasan

## 3. Tests (opcional) — Playwright E2E

- [ ] 3.1 Añadir test E2E en Playwright que simule creación de una categoría desde `/admin/categories/form?id=new` (Saltado: requiere entorno real con Firebase y backend API)

## 4. OpenSpec — artefactos (completados)

- [x] 4.1 `proposal.md` — qué y por qué del cambio
- [x] 4.2 `design.md` — estrategia de validación del formulario y decisiones técnicas
- [x] 4.3 `specs/cms-admin-panel/spec.md` — delta spec con requisitos de pruebas para `cms-admin-panel`
- [x] 4.4 `tasks.md` — lista de tareas TDD (este archivo)
