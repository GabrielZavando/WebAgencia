## 1. Backend — Completar CRUD de categorías

- [x] 1.1 Agregar endpoint `GET /api/v1/categories/:id` (findById) en CategoriesController
- [x] 1.2 Agregar paginación (`page`, `limit`) a `GET /api/v1/categories` en CategoriesController y CategoriesService
- [x] 1.3 Agregar tests unitarios para CategoriesRepository (mock de Firestore)
- [x] 1.4 Agregar tests unitarios para CategoriesController (endpoints CRUD)
- [x] 1.5 Verificar alineación de DTOs (CreateCategoryDto, UpdateCategoryDto) con validaciones de slug y nombre

## 2. Frontend — Componente Table y vistas de categorías

- [x] 2.1 Crear componente `Table` de shadcn/ui en `apps/web/src/components/ui/table.tsx`
- [x] 2.2 Crear vista de listado: `apps/web/src/pages/admin/categories/index.astro` con tabla de categorías
- [x] 2.3 Crear formulario de creación/edición: `apps/web/src/pages/admin/categories/[id].astro`
- [x] 2.4 Implementar llamadas a la API con `apiClient` incluyendo Bearer token (Firebase ID token)
- [x] 2.5 Habilitar enlace "Categorías" en `apps/web/src/components/admin/Sidebar.astro` (quitar `disabled: true`)
- [x] 2.6 Agregar confirmación de eliminación (dialog/confirm) en la vista de listado

## 3. OpenSpec — Delta specs

- [x] 3.1 Crear delta spec para `cms-admin-panel` con requisitos de UI de categorías (hecho en propuesta)
