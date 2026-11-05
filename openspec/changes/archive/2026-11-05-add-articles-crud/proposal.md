## Why

El CMS ya cuenta con el modelo de datos de artículos, el esqueleto del módulo `articles` en la API y piezas aisladas de UI (editor Tiptap de prueba, componentes shadcn/ui), pero no existe un CRUD funcional de artículos ni el panel de administración puede gestionarlos. Este change conecta el backend con el panel admin para cerrar el flujo de creación, publicación y mantenimiento de artículos.

## What Changes

### Backend (`apps/api`)
- Exponer el endpoint público `GET /api/v1/articles/slug/:slug` (detalle por slug para el sitio público, solo artículos publicados).
- Completar/verificar el CRUD existente: `GET /api/v1/articles` (paginación y filtros `status`, `category_id`), `GET /api/v1/articles/:id`, `POST`, `PATCH` y `DELETE`.
- Corregir el rechazo de slug duplicado para responder `409 Conflict` real (hoy devuelve 400 con body 409) y comparar de forma case-insensitive normalizando el slug.
- Agregar tests unitarios de `ArticlesController` y `ArticlesRepository`; actualizar los tests del servicio para el conflicto 409.

### Frontend (`apps/web`)
- Crear el listado de artículos en `/admin/articles` con tabla shadcn/ui, badges de estado y acciones.
- Crear el editor de artículos en `/admin/articles/form?id=...` con título, slug auto-generado, extracto derivado del contenido, categoría, estado, portada por URL y contenido Tiptap como isla React.
- Implementar las llamadas al API con `Authorization: Bearer <Firebase ID token>` y manejo de errores/estados de carga.
- Habilitar el enlace "Artículos" en el Sidebar del admin.

### OpenSpec
- Delta de `article-tiptap-content` para el endpoint público por slug y la semántica de listado/filtros.
- Delta de `cms-admin-panel` para la UI de administración de artículos.

## Capabilities

### New Capabilities

- Ninguna. La UI de artículos pertenece a la capability existente `cms-admin-panel`; no se crea una capability nueva para evitar duplicación.

### Modified Capabilities

- `article-tiptap-content`: se agrega el endpoint público `GET /api/v1/articles/slug/:slug` y se aclara el comportamiento de listado según autenticación y filtros.
- `cms-admin-panel`: se agregan requisitos de listado, editor, autenticación Bearer y navegación para artículos.

## Impact

- Código API: `apps/api/src/articles/` (controller, service, repository, DTOs, tests).
- Código web: `apps/web/src/pages/admin/articles/`, `apps/web/src/components/admin/` (artículos), `apps/web/src/components/admin/Sidebar.astro`, `apps/web/src/components/ui/` (reutilización).
- Contratos: `docs/api-spec.yml` (endpoint por slug y modelo de request/response de artículos).
- Dependencias: no se agregan dependencias nuevas; se reutilizan Tiptap, shadcn/ui y `apiClient`.
- Modelo de datos: sin cambios en `packages/shared-types` ni en las entidades existentes.
- Fuera de alcance: blog público (`blog/index.astro`, `blog/[...slug].astro`, `blog-fetch.ts`), biblioteca de medios/subida de imágenes (portada por URL), lógica de categorías y autenticación desde cero.
