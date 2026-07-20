## Why

El frontend del panel de administración usará el editor de texto enriquecido **Tiptap v3.27.1** para crear y editar artículos. Actualmente el campo `content` de los artículos se almacena como `string` (texto plano), lo cual no permite preservar la estructura del documento rico que produce Tiptap (marks, atributos, nodos anidados). Es necesario almacenar el JSON nativo de Tiptap para evitar pérdida de información y simplificar la integración frontend–backend.

## What Changes

- Modificar el tipo del campo `content` en la entidad `Article` de `string` a `TiptapJSON` (objeto con `type: 'doc'` y `content: TiptapNode[]`).
- Crear las interfaces TypeScript `TiptapNode` y `TiptapJSON` en `src/shared/types/tiptap.ts`.
- Agregar un validador personalizado `IsTiptapDocument` en los DTOs de creación y actualización de artículos.
- Implementar validación de tamaño máximo de payload (5 MB) para el contenido del artículo.
- Actualizar la especificación OpenAPI (`docs/api-spec.yml`) para que `content` sea un objeto referenciado al esquema `TiptapJSON`.
- Actualizar el modelo de datos (`docs/data-model.md`) para reflejar el nuevo tipo de `content`.
- Asegurar que `author_id` permanezca inmutable tras la creación del artículo.

## Capabilities

### New Capabilities

- `article-tiptap-content`: Gestión del contenido de artículos como documentos Tiptap JSON. Abarca la creación, edición, publicación y eliminación de artículos donde el campo `content` es un objeto Tiptap en lugar de una cadena de texto.

### Modified Capabilities

- (Ninguna — no existen ancora capacidades en `openspec/specs/` relacionadas con artículos)

## Impact

- **Código afectado**: `src/articles/entities/article.entity.ts`, `src/articles/dto/create-article.dto.ts`, `src/articles/dto/update-article.dto.ts`, `src/articles/articles.repository.ts`.
- **Documentación**: `docs/api-spec.yml` (esquema `Article`), `docs/data-model.md` (entidad `Article`).
- **Dependencias**: Ninguna nueva; solo cambios en tipos y validaciones existentes.
- **Seguridad**: El contenido Tiptap se almacenará tal cual; la sanitización antes de renderizar es responsabilidad del frontend (fuera del alcance de esta API).