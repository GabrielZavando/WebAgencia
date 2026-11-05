## ADDED Requirements

### Requirement: Vista de listado de artículos

The system **SHALL** renderizar `/admin/articles` con una tabla de artículos usando componentes shadcn/ui (`Table`, `Badge`, `Button`) que muestre título, categoría, estado, fecha y acciones.

#### Scenario: Listado con artículos
- **WHEN** un usuario autenticado accede a `/admin/articles`
- **THEN** ve una tabla con los artículos devueltos por `GET /api/v1/articles`
- **AND** cada fila muestra título, categoría, badge de estado (`draft` o `published`), fecha y acciones de editar/eliminar

#### Scenario: Estado de carga
- **WHEN** la tabla solicita los artículos por primera vez
- **THEN** muestra un estado de carga visible antes de renderizar los datos

#### Scenario: Listado vacío
- **WHEN** la API devuelve una lista vacía
- **THEN** la vista muestra el mensaje "No hay artículos aún" y un botón para crear el primero

#### Scenario: Error al cargar
- **WHEN** la API responde con error
- **THEN** la vista muestra un mensaje de error amigable y un botón "Reintentar"

### Requirement: Editor de artículos con Tiptap

The system **SHALL** renderizar `/admin/articles/form?id=<id>` para crear (`?id=new`) y editar artículos, con título, slug auto-generado, extracto derivado del contenido, categoría, estado, imagen de portada por URL y contenido Tiptap como isla React.

#### Scenario: Crear artículo
- **WHEN** un usuario autenticado completa los campos obligatorios y guarda en modo creación
- **THEN** el frontend envía `POST /api/v1/articles` con el contenido Tiptap JSON
- **AND** al finalizar redirige al listado `/admin/articles`

#### Scenario: Editar artículo existente
- **WHEN** un usuario autenticado accede a `/admin/articles/form?id=art123`
- **THEN** el formulario se precarga con los datos del artículo obtenidos de `GET /api/v1/articles/art123`
- **AND** al guardar envía `PATCH /api/v1/articles/art123`

#### Scenario: Slug auto-generado
- **WHEN** el usuario escribe el título en modo creación
- **THEN** el slug se genera automáticamente en minúsculas, sin acentos y separado por guiones
- **AND** el usuario puede editarlo manualmente antes de guardar

#### Scenario: Publicar y despublicar
- **WHEN** el usuario cambia el estado entre `draft` y `published` y guarda
- **THEN** el cambio se envía en el campo `status` al backend

#### Scenario: Contenido Tiptap serializado
- **GIVEN** el usuario escribe contenido en el editor
- **WHEN** guarda el artículo
- **THEN** el body incluye `content` como documento Tiptap JSON (`{ type: 'doc', content: [...] }`)

#### Scenario: Extracto derivado del contenido
- **GIVEN** el modelo `Article` no tiene campo `excerpt`
- **WHEN** el usuario edita el contenido
- **THEN** el formulario muestra una vista previa del extracto generado a partir del texto plano de Tiptap
- **AND** el extracto no se envía como campo independiente al backend

#### Scenario: Portada por URL temporal
- **GIVEN** la biblioteca de medios aún no está implementada
- **WHEN** el usuario ingresa una URL `http(s)` válida como portada
- **THEN** el formulario la envía en `cover_media_id` como valor temporal
- **AND** el artículo se guarda sin modificar el modelo de datos

### Requirement: Autenticación Bearer en acciones de artículos

The system **SHALL** incluir el header `Authorization: Bearer <Firebase ID token>` en las llamadas a la API del panel de artículos.

#### Scenario: Llamada autenticada
- **WHEN** la isla de artículos realiza `GET`, `POST`, `PATCH` o `DELETE`
- **THEN** obtiene el Firebase ID token del usuario actual y lo envía en `Authorization`

#### Scenario: Token inválido o expirado
- **WHEN** la API responde `401 Unauthorized`
- **THEN** la vista muestra el error de sesión y redirige al login

### Requirement: Navegación de artículos en el Sidebar

The system **SHALL** habilitar el enlace "Artículos" del Sidebar apuntando a `/admin/articles`.

#### Scenario: Enlace habilitado
- **WHEN** el usuario autenticado ve el Sidebar del admin
- **THEN** el enlace "Artículos" no está deshabilitado y navega a `/admin/articles`

#### Scenario: Estado activo
- **WHEN** el usuario está en `/admin/articles` o en `/admin/articles/form`
- **THEN** el enlace "Artículos" se muestra como activo
