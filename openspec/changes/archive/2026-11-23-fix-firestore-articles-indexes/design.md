## Context

El proyecto WebAstro es un monorepo con una API NestJS que usa Firebase Firestore (vía firebase-admin) para usuarios, roles y artículos, y Supabase PostgreSQL solo para leads. La colección `articles` de Firestore es consultada por `ArticlesRepository.findAll()` con filtros opcionales `category_id` y `status`, y siempre ordena por `created_at` descendente.

El archivo `apps/api/firestore.indexes.json` ya declara dos índices compuestos para `articles`, pero ambos usan `created_at` en `ASCENDING`, mientras que la consulta de producción usa `orderBy('created_at', 'desc')`. Esto provoca un error `FAILED_PRECONDITION` (500) en `/admin/articles` cuando se aplican filtros.

No hay consultas `orderBy('created_at', 'asc')` ni `orderBy('created_at')` (asc por defecto) en `apps/api/src/`, por lo que los índices existentes con `created_at` ASC no sirven a ninguna consulta vigente y pueden reemplazarse por su equivalente DESC.

## Goals / Non-Goals

**Goals:**
- Versionar en `apps/api/firestore.indexes.json` todos los índices compuestos requeridos por las consultas de `articles`, con la dirección `DESCENDING` en `created_at` donde corresponda.
- Eliminar el error 500 de `/admin/articles` causado por índice compuesto faltante o con dirección incorrecta.
- Proveer el comando exacto de despliegue para que el usuario lo ejecute manualmente (no ejecución autónoma de Firebase CLI).

**Non-Goals:**
- Modificar código fuente bajo `apps/api/src/` (este cambio es solo de configuración y documentación).
- Ejecutar `firebase deploy` autónomamente.
- Crear índices para colecciones distintas de `articles` (users, categories usan orderBy de un solo campo o filtros de igualdad simple, auto-indexados por Firestore).
- Cambiar contratos de API o modelo de datos.

## Decisions

### D1: Dirección de `created_at` en los índices (flip vs. add)

**Decisión:** Reemplazar los índices existentes con `created_at` ASCENDING por versiones con `created_at` DESCENDING, en lugar de mantener ambos.

**Razón:** Una búsqueda en `apps/api/src/` confirma que no existe `orderBy('created_at', 'asc')` ni `orderBy('created_at')` sin dirección explícita. Todas las consultas que ordenan por `created_at` usan `desc`. Mantener índices ASC sería almacenamiento sin uso. Reemplazarlos reduce el número de índices y evita confusión futura.

**Alternativa considerada:** Mantener los índices ASC y añadir nuevos DESC. Descartada porque genera índices duplicados (mismos campos, distinta dirección) que no sirven a ninguna consulta real y aumentan el costo de escritura en Firestore.

### D2: Formas de índice requeridas

**Decisión:** Crear 4 entradas de índice en `firestore.indexes.json`:

1. `status` ASC + `created_at` DESC + `__name__` ASC — filtro solo por `status`
2. `category_id` ASC + `created_at` DESC + `__name__` ASC — filtro solo por `category_id`
3. `category_id` ASC + `status` ASC + `created_at` DESC + `__name__` ASC — ambos filtros (consulta paginada)
4. `category_id` ASC + `status` ASC — ambos filtros para `count()` (sin orderBy)

**Razón:** `findAll()` construye los filtros de forma condicional, por lo que en tiempo de ejecución pueden generarse hasta 4 formas distintas. Cada forma que combine igualdad + `orderBy` requiere su propio índice compuesto con `__name__` como campo de desempate. La forma 4 cubre el `count()` que reusa el mismo objeto `query` sin `orderBy`.

### D3: Origen de la consulta fallante

**Decisión:** La consulta que provoca el 500 es `ArticlesRepository.findAll()` (línea 49): `query.orderBy('created_at', 'desc').offset(offset).limit(limit).get()` con al menos uno de `category_id` o `status` presente.

**Razón:** Es el único sitio en `apps/api/src/` que combina `.where()` con `.orderBy()` en la misma colección. El `count()` (línea 50) reusa el mismo `query` pero elimina `orderBy`/`offset`/`limit`, por lo que necesita una forma de índice sin ordenamiento.

## Risks / Trade-offs

- [Risk] Los índices compuestos en Firestore se construyen de forma asíncrona y pueden tardar minutos en collections grandes → [Mitigation] Desplegar en horario de bajo tráfico; verificar estado en Firebase Console antes de anunciar la fix.
- [Risk] Si el admin empieza a pasar un tercer filtro opcional (ej. `author_id`), el número de combinaciones de índice crece combinatoriamente → [Mitigation] Revisar esta decisión si se añade un tercer filtro; considerar hacer filtros requeridos en lugar de opcionales.
- [Risk] Ejecutar `firebase deploy --only firestore:indexes` apunta al proyecto Firebase configurado en la CLI; si no está el proyecto correcto seleccionado, se desplegaría en el entorno equivocado → [Mitigation] El usuario debe verificar `firebase use <proyecto>` antes de ejecutar el comando.
- [Trade-off] Reemplazar índices ASC por DESC elimina la capacidad de consultar ascendente por `created_at` → aceptable, pues no existe tal consulta en el código actual.

## Migration Plan

1. Confirmar con `grep` en `apps/api/src/` que no existe `orderBy('created_at', 'asc')` ni `orderBy('created_at')` (asumido: no existe).
2. Actualizar `apps/api/firestore.indexes.json` con las 4 formas de índice (dirección DESC en `created_at`).
3. El usuario ejecuta: `firebase use <proyecto> && firebase deploy --only firestore:indexes` (desde `apps/api/`).
4. Verificar en Firebase Console → Firestore → Índices que los nuevos índices pasen de "Building" a "Ready".
5. Probar `GET /api/v1/articles?status=published` y `?category_id=<x>&status=published` para confirmar que el 500 desaparece.

**Rollback:** Revertir `apps/api/firestore.indexes.json` a la versión anterior y re-desplegar con Firebase CLI.

## Open Questions

- ¿Se confirma que ninguna consulta llama con `orderBy('created_at', 'asc')` en ramas no desplegadas o feature branches?
- ¿Cuál es el proyecto Firebase destino (staging vs. producción) para el despliegue inicial?
