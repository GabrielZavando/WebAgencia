## 1. Contratos y configuración

- [x] 1.1 Actualizar `docs/api-spec.yml`: agregar `GET /api/v1/articles/slug/{slug}`, corregir el request body de creación (Tiptap JSON, `cover_media_id`, sin `cover_url` obligatorio) y documentar las respuestas `409` por slug duplicado
- [x] 1.2 Agregar el índice compuesto `category_id + status + created_at` para `articles` en `apps/api/firestore.indexes.json`

## 2. Backend — Tests que fallan primero (TDD red)

- [x] 2.1 Crear `apps/api/src/articles/articles.controller.spec.ts` con casos de listado (filtros/paginación), detalle por ID, detalle por slug publicado/borrador, creación, actualización y borrado
- [x] 2.2 Crear `apps/api/src/articles/articles.repository.spec.ts` con mocks de Firestore para filtros `status`/`category_id`, paginación, `findBySlug`, `existsBySlug` y CRUD
- [x] 2.3 Actualizar `apps/api/src/articles/articles.service.spec.ts` para esperar `ConflictException` (409) al crear/actualizar con slug duplicado y cubrir `findPublishedBySlug`

## 3. Backend — Implementación mínima (TDD green)

- [x] 3.1 Normalizar `slug` (`trim` + `toLowerCase`) en `CreateArticleDto` y `UpdateArticleDto` con `@Transform` antes de validar
- [x] 3.2 Reemplazar `BadRequestException` por `ConflictException` en `ArticlesService.create` y `ArticlesService.update`
- [x] 3.3 Implementar `ArticlesService.findPublishedBySlug` que devuelve solo artículos `published` y lanza `NotFoundException` para borradores o slugs inexistentes
- [x] 3.4 Normalizar el slug en `ArticlesRepository.existsBySlug` para comparación case-insensitive
- [x] 3.5 Agregar `@Get('slug/:slug')` en `ArticlesController` antes de `@Get(':id')` con documentación Swagger
- [x] 3.6 Ejecutar `pnpm --filter @webastro/api test` y dejar la suite de artículos en verde

## 4. Frontend — Utilidades compartidas (TDD)

- [x] 4.1 Escribir tests para `slugifyTitle`, `extractPlainTextFromTiptap`, `buildExcerpt` y `renderTiptapToHtml` (incluyendo nodos permitidos y URLs `javascript:`)
- [x] 4.2 Implementar `apps/web/src/lib/tiptap.ts` con generación de slug, texto plano/extracto y renderizador seguro Tiptap JSON → HTML
- [x] 4.3 Escribir test para el helper de autenticación Bearer
- [x] 4.4 Implementar `getAuthHeaders()` (Firebase ID token + manejo de ausencia de sesión)

## 5. Frontend — Panel admin de artículos

- [x] 5.1 Escribir test de `ArticleForm` para modo creación (`?id=new`), modo edición, slug auto-generado y envío con `Authorization: Bearer`
- [x] 5.2 Implementar `apps/web/src/components/admin/ArticleForm.tsx` con campos título, slug, extracto derivado (solo lectura), categoría (`<select>` con tokens), estado, portada por URL y editor Tiptap real
- [x] 5.3 Implementar `apps/web/src/components/admin/ArticlesTable.tsx` con `Table`, `Badge` de estado, fecha, acciones editar/eliminar y confirmación de borrado
- [x] 5.4 Crear `apps/web/src/pages/admin/articles/index.astro` (listado) y `apps/web/src/pages/admin/articles/form.astro` (query param `?id=`)
- [x] 5.5 Habilitar el enlace "Artículos" en `apps/web/src/components/admin/Sidebar.astro` apuntando a `/admin/articles`
- [x] 5.6 Ejecutar `pnpm --filter @webastro/web test` y dejar los tests de admin/utilidades en verde

## 7. Verificación final

- [x] 7.1 Ejecutar `pnpm --filter @webastro/api test` y `pnpm --filter @webastro/web test`
- [ ] 7.2 Validar manualmente los escenarios de los delta specs: CRUD, filtros, slug duplicado 409, endpoint por slug publicado/borrador y listado/editor admin
- [x] 7.3 Confirmar que no se modificaron `packages/shared-types`, entidades ni la lógica de categorías, y que no se agregó biblioteca de medios
