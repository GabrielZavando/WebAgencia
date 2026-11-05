## Context

El monorepo ya tiene el modelo de datos de artículos (`packages/shared-types`), el esqueleto de `apps/api/src/articles/` (controller, service, repository, DTOs, entity) y las piezas de UI del CMS (AdminLayout, Sidebar, componentes shadcn/ui, editor Tiptap de prueba). El CRUD de categorías ya se completó y sirve como referencia de patrón backend + isla React + formulario por query param.

El estado actual de artículos presenta brechas concretas:

- No existe `GET /api/v1/articles/slug/:slug`; el detalle por slug se resuelve por el endpoint `GET /:id` con fallback, lo que no distingue el caso público ni restringe borradores.
- El slug duplicado lanza `BadRequestException` con body `statusCode: 409` pero respuesta HTTP 400.
- No hay tests del controller ni del repositorio de artículos.
- No existen páginas `/admin/articles` ni un formulario real; el Sidebar tiene "Artículos" deshabilitado.

Restricciones del change:

- No modificar el modelo de datos ni `packages/shared-types`.
- No implementar biblioteca de medios ni subida de archivos.
- No modificar la lógica de categorías.
- El formulario usa query param (`?id=...`) para ser compatible con `output: 'static'`.

## Goals / Non-Goals

**Goals:**

- Cerrar el CRUD de artículos en backend: listado con filtros/paginación, detalle por ID, detalle público por slug, creación, edición y borrado.
- Corregir la semántica de conflicto de slug (HTTP 409) y normalizar slugs para comparación case-insensitive.
- Cubrir con tests unitarios controller, service (conflicto) y repository.
- Entregar listado y editor de artículos en el panel admin, con Tiptap real y llamadas Bearer.
- Corregir y cubrir el backend sin agregar dependencias nuevas.

**Non-Goals:**

- No agregar `excerpt` ni `cover_url` al modelo.
- No implementar resolución de la colección `media` ni subida de imágenes.
- No cambiar autenticación, login ni roles existentes.
- No se modifica el blog público; su adaptación se abordará en un change posterior junto con la decisión de estrategia SSG vs SSR.
- No implementar paginación visual completa en el listado admin (se usa `limit` suficiente; la API ya pagina).

## Decisions

### 1. Endpoint público por slug separado y con restricción de estado

**Decisión:** Agregar `@Get('slug/:slug')` en `ArticlesController`, antes de `@Get(':id')`, respaldado por `ArticlesService.findPublishedBySlug(slug)`. Devuelve solo artículos `published`; un borrador o slug inexistente responde `404`.

**Alternativa:** Mantener el fallback ID→slug en `GET /:id`.
**Rationale:** El sitio público necesita una ruta semántica y segura; `GET /:id` seguirá existiendo para el panel admin (incluye borradores). La ruta de dos segmentos no colisiona con `:id`.

### 2. Slug único case-insensitive sin cambios de modelo

**Decisión:** Normalizar el slug en los DTOs con `@Transform` (`trim` + `toLowerCase`) antes de validar, y comparar siempre contra el slug normalizado en `ArticlesRepository.existsBySlug`. En creación/edición, lanzar `ConflictException` (HTTP 409) con `"El slug ya está en uso"`.

**Alternativa:** Agregar un campo `slug_lower` o consultar todos los documentos para comparar en memoria.
**Rationale:** El slug ya está restringido por regex a minúsculas; normalizar en el borde mantiene el contrato y evita campos nuevos o lecturas costosas. Se documenta que los datos existentes cumplen el patrón.

### 3. Corrección del conflicto HTTP

**Decisión:** Reemplazar `BadRequestException` con body 409 por `ConflictException` en `create` y `update`, y actualizar los tests del servicio.

**Rationale:** El spec exige 409 real. Un body con `statusCode: 409` dentro de un 400 confunde a clientes y rompe el manejo de errores del frontend.

### 4. Listado con filtros y visibilidad por autenticación

**Decisión:** Mantener `OptionalAuthGuard` en `GET /articles`. Sin usuario, forzar `status = published`; con usuario, permitir `status` solicitado (default `published`). Aplicar `category_id` y paginación con límites sanitizados (1–100). Agregar el índice compuesto `category_id + status + created_at` a `firestore.indexes.json` para el filtro combinado.

**Rationale:** Los consumidores anónimos ven solo artículos publicados; el admin puede filtrar borradores. El índice evita `FAILED_PRECONDITION` cuando se combinan categoría y estado con orden por fecha.

### 5. Autenticación Bearer en el panel

**Decisión:** Crear un helper de frontend `getAuthHeaders()` que obtiene `auth.currentUser?.getIdToken()` y devuelve `Authorization: Bearer <token>`. Las islas de artículos lo usan en todas las llamadas; si no hay sesión o la API responde 401, se redirige a `/login`.

**Alternativa:** Reutilizar el patrón de cookies de la UI de categorías.
**Rationale:** El `AuthGuard` del backend solo acepta Bearer. El usuario lo pidió explícitamente. El login ya mantiene la sesión de Firebase en el cliente, por lo que `currentUser` está disponible.

### 6. Listado admin como isla React con componentes existentes

**Decisión:** Crear `apps/web/src/components/admin/ArticlesTable.tsx` (client:only) y `apps/web/src/pages/admin/articles/index.astro`. Reutilizar `Table`, `Badge`, `Button`; mostrar título, categoría (resuelta por `category_id`), estado, fecha y acciones editar/eliminar. El borrado pide confirmación en un diálogo simple, igual que categorías.

**Rationale:** Consistencia con `CategoriesTable`; sin dependencias nuevas.

### 7. Formulario por query param con isla React

**Decisión:** Crear `apps/web/src/pages/admin/articles/form.astro` que lee `?id=` (`new` o ID real) y monta `ArticleForm.tsx`. El formulario:
- Precarga el artículo con `GET /articles/:id` en edición.
- Genera el slug desde el título con `slugifyTitle()` (minúsculas, sin acentos, guiones) mientras el usuario no lo edite manualmente.
- Muestra un extracto derivado en solo lectura, calculado desde el texto plano del Tiptap.
- Usa un `<select>` nativo estilizado con tokens para categoría (evita agregar el componente shadcn Select).
- Envía `cover_media_id` con la URL de portada ingresada, como valor temporal documentado.
- Envía `POST` o `PATCH` con Bearer y redirige a `/admin/articles`.

**Alternativa:** Páginas separadas de creación y edición o un componente shadcn Select nuevo.
**Rationale:** El query param es el patrón ya usado en categorías y compatible con SSG; el `<select>` nativo evita dependencias y mantiene accesibilidad básica.

### 8. Excerpt derivado y portada temporal sin tocar el modelo

**Decisión:** No se agrega `excerpt` al `Article`. Se crea `extractPlainTextFromTiptap()` y `buildExcerpt()` en `apps/web/src/lib/tiptap.ts` para uso del panel admin. La portada se envía en `cover_media_id`; el formulario valida que sea una URL `http(s)` válida y el consumo de esa portada en el sitio público queda fuera de este change.

**Rationale:** Cumple la restricción de no modificar el modelo y mantiene una ruta de migración clara cuando se implemente `media`.

### 9. Renderizador Tiptap JSON → HTML propio y seguro

**Decisión:** Implementar `renderTiptapToHtml()` en `apps/web/src/lib/tiptap.ts` con lista blanca de nodos (`doc`, `paragraph`, `heading`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`, `image`, `hardBreak`) y marcas (`bold`, `italic`, `strike`, `code`, `link`). Escapar todo texto, serializar solo atributos permitidos y validar URLs `http(s)` para imágenes y enlaces.

**Alternativa:** Usar `generateHTML` de `@tiptap/html` o inyectar HTML del editor.
**Rationale:** Evita una dependencia nueva sujeta a `dependency-audit` y elimina el riesgo de XSS por HTML crudo. El editor y sus consumidores trabajan con JSON estructurado, no con HTML arbitrario.

### 10. Tests

**Decisión:**
- Backend: `articles.controller.spec.ts` (listado, detalle por ID, detalle por slug, create/update/delete y propagación de errores) y `articles.repository.spec.ts` (filtros, paginación, slug, CRUD con mocks de Firestore). Actualizar `articles.service.spec.ts` para `ConflictException`.
- Frontend: tests unitarios de `slugifyTitle`, `buildExcerpt` y `renderTiptapToHtml` (incluyendo URLs peligrosas), y test de `ArticleForm` para creación/edición y cabecera Bearer.

**Rationale:** Cubre los escenarios de los delta specs y mantiene la cobertura ≥ 80% en código nuevo.

## Risks / Trade-offs

- [Risk] Guardar una URL en `cover_media_id` mezcla semántica de referencia y URL.
  → Mitigación: documentarlo como deuda temporal en el design y en el código; el renderizador solo la usa si es `http(s)`. Al implementar `media`, migrar los valores URL.
- [Risk] El índice compuesto de categoría puede no existir en el proyecto Firebase actual.
  → Mitigación: agregar la definición a `firestore.indexes.json`; si el entorno ya está desplegado, crear el índice con Firebase CLI.
- [Risk] El renderizador propio puede no cubrir todos los nodos Tiptap futuros.
  → Mitigación: lista blanca explícita; los nodos desconocidos se ignoran de forma segura y se amplía cuando se agreguen extensiones.

## Migration Plan

1. Backend: desplegar endpoints y corrección de 409. Los cambios son aditivos salvo el status de error de slug duplicado (fix esperado).
2. Aplicar el índice compuesto en Firestore antes de usar el filtro combinado en producción.
3. Frontend admin: publicar las nuevas páginas; el Sidebar habilitado es un cambio aditivo.
4. Rollback: revertir el change; no hay migración de datos ni cambios de esquema.

## Open Questions

Ninguna pendiente. Las decisiones de extracto y portada se resolvieron adaptándose al modelo actual.
