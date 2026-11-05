## Why

El panel de administración del CMS tiene un esqueleto funcional (layout, sidebar, header) pero aún no permite gestionar categorías. El backend ya tiene el esqueleto del CRUD de categorías en Firestore, pero falta el endpoint de detalle (`GET /:id`), paginación en el listado y pruebas del controller y repositorio. El frontend no tiene vistas de listado ni formulario para crear/editar categorías, y el enlace en el Sidebar está deshabilitado. Este change conecta backend y frontend para completar el CRUD de categorías.

## What Changes

### Backend (`apps/api`)
- Agregar endpoint `GET /api/v1/categories/:id` (detalle de categoría) al `CategoriesController`
- Agregar paginación (`page`, `limit`) al endpoint `GET /api/v1/categories`
- Agregar tests unitarios para `CategoriesController` y `CategoriesRepository`
- Verificar alineación de DTOs, servicio y repositorio con la spec existente

### Frontend (`apps/web`)
- Crear componente `Table` de shadcn/ui (falta en la instalación actual)
- Crear vista de listado: `apps/web/src/pages/admin/categories/index.astro` con tabla de categorías
- Crear formulario de creación/edición: `apps/web/src/pages/admin/categories/[id].astro`
- Implementar llamadas a la API con `apiClient` incluyendo Bearer token de autenticación
- Habilitar el enlace "Categorías" en `apps/web/src/components/admin/Sidebar.astro` (quitar `disabled: true`)

### OpenSpec
- Delta spec para `cms-admin-panel` agregando requisitos de UI de categorías

## Capabilities

### Modified Capabilities

- `category-management`: No se cambian requisitos de backend; el spec ya cubre el CRUD completo. El delta documenta que el frontend consume estos endpoints.
- `cms-admin-panel`: Se agregan requisitos de UI para listado, creación y edición de categorías en el panel de administración.

## Impact

- Código afectado: `apps/api/src/categories/` (controller, tests), `apps/web/src/pages/admin/categories/` (nuevo), `apps/web/src/components/admin/Sidebar.astro`, `apps/web/src/components/ui/table.tsx` (nuevo)
- APIs: `/api/v1/categories` (listado con paginación), `/api/v1/categories/:id` (detalle)
- Dependencias: ninguna nueva; se usa `shadcn/ui` existente y `apiClient` ya creado
- No se modifica el modelo de datos ni `packages/shared-types`
- No se modifica el sitio público (landing/blog)
- No se implementa editor de artículos ni biblioteca de medios
