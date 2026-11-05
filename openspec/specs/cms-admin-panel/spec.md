# cms-admin-panel Specification

## Purpose
Definir el esqueleto del panel de administración del CMS: el shell en `/admin` (sidebar, header, área de contenido), la base de componentes shadcn/ui integrada a los tokens del design system, y la página de prueba del editor Tiptap con extensión de imágenes preparada para URLs de Firebase Storage.

## Requirements

### Requirement: Layout base del panel de administración
The system **SHALL** renderizar `/admin` como shell administrativo (sidebar + header + área de contenido) construido con Tailwind utility-first, tokens del design system y componentes shadcn/ui, reemplazando el placeholder, sin llamadas a la API ni datos de ejemplo.

#### Scenario: /admin renderiza el shell
- **WHEN** un usuario accede a `/admin`
- **THEN** ve un sidebar con navegación, un header y un área de contenido principal
- **AND** no se realiza ninguna llamada a la API

#### Scenario: Sidebar colapsable en mobile
- **GIVEN** un viewport menor a 1024px
- **WHEN** el usuario activa el botón del menú (con `aria-label`)
- **THEN** el sidebar se muestra/oculta sin recargar la página

#### Scenario: El shell sigue el tema del sitio
- **GIVEN** el sitio en modo claro u oscuro
- **WHEN** se renderiza el shell
- **THEN** usa tokens del sistema (`bg-surface`, `text-text`, `border-border`) y cambia con el tema

### Requirement: Base de shadcn/ui configurada
The system **SHALL** tener shadcn/ui configurado en `apps/web`: `components.json`, utilidad `cn()` en `src/lib/utils.ts`, y variables CSS de shadcn mapeadas a los tokens del design system (temas claro y oscuro).

#### Scenario: cn combina y deduplica clases
- **WHEN** se invoca `cn("px-2", cond && "py-1", "px-4")`
- **THEN** retorna las clases combinadas con tailwind-merge (el `px` conflictivo queda resuelto)

#### Scenario: Componentes shadcn usan los colores del sitio
- **WHEN** se renderiza un componente shadcn/ui
- **THEN** sus colores provienen de las variables puente mapeadas a los tokens del design system

### Requirement: Página de prueba del editor Tiptap
The system **SHALL** exponer `/admin/blog/editor-test` que renderiza una isla React con el editor Tiptap (componentes shadcn-tiptap), con toolbar y salida JSON visible.

#### Scenario: La isla monta el editor
- **WHEN** un usuario accede a `/admin/blog/editor-test`
- **THEN** se renderiza la toolbar y un área de contenido editable
- **AND** el usuario puede escribir texto con formato

#### Scenario: Salida JSON del documento
- **GIVEN** contenido escrito en el editor
- **WHEN** se consulta la vista JSON
- **THEN** se muestra un documento Tiptap con `type: 'doc'` y array `content` (mismo formato que consume la API)

### Requirement: Extensión de imágenes preparada para Storage
The system **SHALL** configurar la extensión de imágenes de Tiptap para insertar imágenes por URL (preparada para URLs de Firebase Storage), sin subida de archivos en este change.

#### Scenario: Insertar imagen por URL
- **GIVEN** el editor montado
- **WHEN** el usuario inserta una URL de imagen
- **THEN** el nodo `image` se agrega al documento y se previsualiza

#### Scenario: Sin subida de archivos
- **WHEN** se inspecciona la página del editor
- **THEN** no existe UI ni lógica de subida (quedará en el change de medios)

### Requirement: Guardarraíles de validación actualizados
The system **SHALL** mantener en verde la suite de validación estructural con los nuevos componentes y dependencias aprobadas.

#### Scenario: Allowlist de dependencias incluye las nuevas deps
- **GIVEN** las dependencias de shadcn/ui y Tiptap instaladas en `apps/web/package.json`
- **WHEN** corre `tests/validation/dependency-audit.test.ts`
- **THEN** la aserción de dependencias aprobadas pasa (deps agregadas a `ALLOWED_NEW_DEPS`)

#### Scenario: admin-cleanup refleja el nuevo shell
- **WHEN** corre `tests/validation/admin-cleanup.test.ts`
- **THEN** acepta `src/components/admin/` con los componentes del shell
- **AND** sigue exigiendo que `dashboard.astro`, `leads.astro` y `settings.astro` no existan y que el login redirija a `/admin`

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
