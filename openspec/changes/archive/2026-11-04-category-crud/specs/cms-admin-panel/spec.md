## ADDED Requirements

### Requirement: Interfaz de administración de categorías (cms-admin-panel)

The system **SHALL** proporcionar una interfaz de administración para gestionar categorías en el panel del CMS, incluyendo listado, creación, edición y eliminación.

#### Categoria-UI-1: Vista de listado de categorías
- **WHEN** un usuario autenticado accede a `/admin/categories`
- **THEN** ve una tabla con todas las categorías (nombre, slug, descripción, fechas)
- **AND** cada fila tiene botones de editar y eliminar

#### Categoria-UI-2: Formulario de creación de categoría
- **WHEN** un usuario admin/editor hace clic en "Nueva categoría"
- **THEN** ve un formulario con campos: nombre, slug, descripción
- **AND** al enviar con datos válidos se crea la categoría y se redirige al listado

#### Categoria-UI-3: Formulario de edición de categoría
- **WHEN** un usuario admin/editor hace clic en "Editar" en una categoría
- **THEN** ve el formulario precargado con los datos de la categoría
- **AND** al enviar se actualizan los datos y se redirige al listado

#### Categoria-UI-4: Eliminación con confirmación
- **WHEN** un usuario admin hace clic en "Eliminar" en una categoría
- **THEN** se muestra un diálogo de confirmación
- **AND** si confirma, se envía `DELETE` al backend y la categoría desaparece del listado

#### Categoria-UI-5: Autenticación en llamadas al API
- **WHEN** el frontend hace llamadas mutantes (POST, PATCH, DELETE) a `/api/v1/categories`
- **THEN** incluye el header `Authorization: Bearer <token>` con el Firebase ID token
- **AND** si el token es inválido o expirado, se redirige al login

#### Categoria-UI-6: Manejo de errores
- **WHEN** el backend retorna 400 (slug duplicado, categoría con artículos)
- **THEN** se muestra el mensaje de error al usuario
- **AND** si el backend retorna 404, se muestra "Categoría no encontrada"

#### Categoria-UI-7: Navegación en el Sidebar
- **WHEN** el usuario está autenticado y tiene rol admin o editor
- **THEN** el enlace "Categorías" en el Sidebar está habilitado y apunta a `/admin/categories`

### Requirement: Componente Table de shadcn/ui

The system **SHALL** tener un componente `Table` de shadcn/ui en `apps/web/src/components/ui/table.tsx` para usar en la vista de listado de categorías.

#### Scenario: Table component exists
- **WHEN** se importa `Table` desde `@/components/ui/table`
- **THEN** el componente está disponible y usa los tokens del design system
