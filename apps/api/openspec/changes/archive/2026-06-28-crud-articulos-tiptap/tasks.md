## 1. Tipos compartidos Tiptap

- [x] 1.1 Crear `src/shared/types/tiptap.ts` con las interfaces `TiptapNode` y `TiptapJSON` (versión 3.27.1)
- [x] 1.2 Exportar las interfaces desde `src/shared/index.ts` (o crear el archivo si no existe)

## 2. Validador personalizado

- [x] 2.1 Implementar el decorador `IsTiptapDocument` en `src/common/validators/` (o ubicación adecuada para validadores)
- [x] 2.2 Implementar la función de validación que verifica `type === 'doc'` y `content` como array
- [x] 2.3 Registrar el validador en el módulo correspondiente (`CommonModule` o directamente en `ArticlesModule`)

## 3. Entidad Article

- [x] 3.1 Actualizar `src/articles/entities/article.entity.ts`: cambiar `content: string` a `content: TiptapJSON`

## 4. DTOs de Article

- [x] 4.1 Actualizar `src/articles/dto/create-article.dto.ts`: importar `TiptapJSON` y `IsTiptapDocument`, cambiar `content: string` a `content: TiptapJSON`, aplicar `@IsTiptapDocument()` y `@IsWithinMaxSize()`
- [x] 4.2 Actualizar `src/articles/dto/update-article.dto.ts` de forma análoga
- [x] 4.3 Exportar el tipo `ArticleStatus` desde `create-article.dto.ts` si aún no está exportado (verificar imports en repository)

## 5. Repositorio y Service

- [x] 5.1 Verificar que `src/articles/articles.repository.ts` no realiza `JSON.stringify`/`JSON.parse` del campo `content` y que los tipos de retorno son correctos con `content: TiptapJSON`
- [x] 5.2 Actualizar los tipos de los métodos `create` y `update` en el repositorio si es necesario para que acepten `TiptapJSON` en `content`
- [x] 5.3 Verificar que `src/articles/articles.service.ts` funciona correctamente con los nuevos tipos (sin cambios esperados)

## 6. Documentación OpenAPI

- [x] 6.1 Añadir esquema `TiptapJSON` en `docs/api-spec.yml` bajo `components.schemas`
- [x] 6.2 Cambiar en `Article` el tipo de `content` de `type: string` a `$ref: '#/components/schemas/TiptapJSON'`
- [x] 6.3 Actualizar ejemplos en `POST /articles` y `PATCH /articles/{id}` para incluir un objeto Tiptap JSON válido
- [x] 6.4 Verificar que el esquema de `Article` en OpenAPI es válido (no genera conflictos de referencias)

## 7. Modelo de datos

- [x] 7.1 Actualizar `docs/data-model.md`: cambiar el tipo de `content` en la entidad `Article` de `string` a `Object (Tiptap JSON)`
- [x] 7.2 Añadir nota sobre el formato y versión de Tiptap

## 8. Pruebas unitarias

- [x] 8.1 Escribir prueba unitaria para el validador `IsTiptapDocument` (casos válidos, inválidos, edge cases)
- [x] 8.2 Actualizar `src/articles/articles.service.spec.ts` para usar payloads Tiptap JSON en los tests de creación y actualización
- [x] 8.3 Asegurar que todas las pruebas unitarias existentes sigan pasando (ejecutar `npm run test`)

## 9. Verificación y lint

- [x] 9.1 Ejecutar `npm run build` y verificar que no hay errores de compilación
- [x] 9.2 Ejecutar `npm run lint` y corregir cualquier problema de estilo o uso de `any`
- [x] 9.3 Ejecutar el conjunto completo de tests (`npm run test`) y confirmar que todos pasan

## 10. Commit y Pull Request

- [ ] 10.1 Crear commit con mensaje: `feat(articles): add Tiptap JSON content support (v3.27.1)`
- [ ] 10.2 Crear Pull Request describiendo los cambios, enlazando a la historia de usuario enriquecida y a los artefactos de OpenSpec