## Context

El proyecto Líder Digital usa **NestJS** con Firebase Firestore para gestionar artículos de blog. El frontend (panel de administración) utilizará **Tiptap v3.27.1** como editor de texto enriquecido. El campo `content` actualmente se define como `string` en la entidad `Article` y se almacena como texto plano en Firestore.

La necesidad es que el API acepte, almacene y devuelva el objeto JSON que Tiptap genera directamente, sin conversión a string. Esto implica cambios en tipos TypeScript, validaciones de DTO, modelo de datos, repositorio y especificación OpenAPI.

## Goals / Non-Goals

**Goals:**
- Almacenar el contenido del artículo como objeto JSON nativo de Tiptap en Firestore.
- Validar que el `content` sea un documento Tiptap válido (`type: 'doc'`, `content: array`).
- Limitar el tamaño del payload de `content` a 5 MB máximo.
- Mantener la lógica de negocio existente (crud de artículos, publicación, author_id inmutable).
- Actualizar `docs/api-spec.yml` y `docs/data-model.md` para reflejar el nuevo tipo.

**Non-Goals:**
- Implementar migraciones de datos (base de datos vacía según confirmación del usuario).
- Sanitización del contenido HTML generado por Tiptap (responsabilidad del frontend).
- Cambios en el controlador de artículos (`articles.controller.ts`) — la validación ocurre en los DTOs.
- Versionado del formato Tiptap; se usa la versión 3.27.1 específicamente.

## Decisions

### 1. Definir interfaces `TiptapNode` y `TiptapJSON` en `src/shared/types/tiptap.ts`

**Decisión:** Crear un archivo de tipos compartidos en lugar de definirlos inline en los DTOs.

**Justificación:** Permite reutilización en toda la aplicación (entity, DTOs, otros módulos si se расширя later) y genera un punto único de mantenimiento.

**Alternativas consideradas:**
- Definir el tipo inline en `CreateArticleDto` → Difícil de reutilizar.
- Usar `type: any` → Violación del principio de tipado completo.

```ts
export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: unknown[];
}

export interface TiptapJSON {
  type: 'doc';
  content: TiptapNode[];
}
```

### 2. Validador personalizado `IsTiptapDocument`

**Decisión:** Crear un decorador `class-validator` que valide la estructura del documento Tiptap.

**Justificación:** La validación se ejecuta en la capa de presentación (NestJS pipes) antes de llegar al servicio/repositorio. Un decorador dedicado mantiene los DTOs limpios y la lógica de validación reutilizable.

**Validaciones realizadas:**
- `value` es un objeto (no string ni null).
- `value.type === 'doc'`.
- `Array.isArray(value.content)`.

### 3. Límite de tamaño de payload (5 MB)

**Decisión:** Implementar un validador `@MaxSize(5 * 1024 * 1024)` en el campo `content` de los DTOs.

**Justificación:** Firestore tiene un límite de documento de 1 MB; un artículo con contenido enriquecido puede crecer. Limitar a 5 MB es un balance entre flexibilidad y protección del servidor. El validador devuelve `400 Bad Request` con mensaje en español.

### 4. Persistencia en Firestore

**Decisión:** Firestore almacenará el objeto JavaScript directamente (sin `JSON.stringify`).

**Justificación:** El SDK de Firestore admin para Node.js soporta objetos anidados de forma nativa. Almacenar como objeto permite consultas eficientes si en el futuro se necesita filtrar por tipos de nodos. No se requiere transformación en el repositorio.

### 5. Inmutabilidad de `author_id`

**Decisión:** No incluir `author_id` en `UpdateArticleDto`; el repositorio solo actualiza los campos presentes en el DTO.

**Justificación:** Confirmado con el usuario que `author_id` es inmutable. Al no existir el campo en el DTO de actualización, no puede ser enviado por el cliente. El repositorio ignora campos `undefined`.

### 6. Actualización de `docs/api-spec.yml`

**Decisión:** Agregar un esquema `TiptapJSON` como componente nuevo y referenciarlo en `Article.content`.

**Justificación:** OpenAPI 3.0 requiere que el tipo de `content` sea un objeto con propiedades definidas. Usar `$ref` mantiene la consistencia y permite que el фронтенд genere clientes tipados correctamente.

```yaml
TiptapJSON:
  type: object
  required:
    - type
    - content
  properties:
    type:
      type: string
      enum: [doc]
    content:
      type: array
      items:
        type: object
```

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Un documento Tiptap mal formado pasa la validación | El validador solo verifica la estructura básica (`type: 'doc'`, `content` array). Contenido inválido dentro de los nodos se detecta en el frontend al renderizar. |
| Payload muy grande afecta rendimiento de Firestore | Límite de 5 MB en validación + límite global de `MaxBodySize` en NestJS (opcional, agregar si es necesario). |
| Cambios en la estructura de `TiptapJSON` entre versiones de Tiptap | Se especifica versión exacta (3.27.1) en la documentación; cualquier actualización de versión requiere un cambio dedicado. |
| Romper artículos existentes si la base de datos no estuviera vacía | (No aplica — base de datos confirmada vacía). Para futuros casos, documentar script de migración. |

## Migration Plan

Dado que la base de datos está vacía, no se requiere script de migración. El flujo de despliegue es:

1. Desplegar código con los nuevos tipos y validaciones (sin datos existentes).
2. Verificar que `POST /articles` y `PATCH /articles/:id` acepten y devuelvan `content` como objeto Tiptap JSON.
3. Confirmar que los tests unitarios e integración pasan.
4. Desplegar a producción.

**Rollback:** Revertir el commit con los cambios de tipos y volver a la versión anterior del código. No hay datos que migrar.

## Open Questions

1. **Límite global de payload:** ¿Desea implementarse un `MaxBodySize` global en el `main.ts` de NestJS además del validador en el DTO, o bastará con el validador a nivel de campo?
2. **Schema de nodos Tiptap:** ¿Se desea definir recursivamente el esquema completo de `TiptapNode` en OpenAPI (atributos, marks, text, etc.) o con la definición abierta (`type: object`) es suficiente para la generación de clientes?
3. **Pruebas de integración:** ¿Existe un conjunto de pruebas E2E existente para los endpoints de artículos que deba actualizarse, o se crearán desde cero?