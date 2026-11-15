## Why

La interfaz de usuario del CRUD de categorías en el panel de administración (`apps/admin`) ya fue implementada (páginas, islas React, sidebar, llamadas a la API con token Bearer), pero carece de artefactos de gobernanza OpenSpec y de pruebas automatizadas. Se necesita documentar el cambio formalmente y cubrirlo con tests Vitest (unit) y, opcionalmente, Playwright (E2E) para cumplir con el estándar de TDD del proyecto.

## What Changes

- Crear el cambio OpenSpec `add-admin-categories-crud` con sus artefactos: `proposal.md`, `design.md`, `tasks.md` y delta spec de `cms-admin-panel`.
- Añadir requisitos de pruebas a la capability `cms-admin-panel` (Vitest unit para `CategoriesTable` y `CategoryForm`; opcional Playwright E2E).
- Escribir tests Vitest para `CategoriesTable` y `CategoryForm` que verifiquen renderizado y envío del header `Authorization: Bearer <token>`.
- (Opcional) Añadir un test E2E en Playwright que simule la creación de una categoría.
- No se modifica el backend (`apps/api`) ni el sitio público (`apps/web`).

## Capabilities

### Modified Capabilities

- `cms-admin-panel`: Se añaden requisitos de pruebas (Vitest unit + Playwright E2E opcional) para el CRUD de categorías. Los requisitos de UI ya existían; este change los complementa con cobertura de pruebas.

## Impact

- Código afectado: `apps/admin/src/` (solo archivos de test nuevos), `openspec/changes/add-admin-categories-crud/` (artefactos OpenSpec).
- API: sin cambios (endpoints de categorías ya existen en `apps/api`).
- Dependencias: ninguna nueva (usa Vitest y Playwright ya instaladas en `apps/admin`).
