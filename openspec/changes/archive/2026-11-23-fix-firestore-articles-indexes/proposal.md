## Why

El endpoint `GET /api/v1/articles` (usado por `/admin/articles`) devuelve error 500 (`FAILED_PRECONDITION`) cuando se aplican filtros opcionales (`status`, `category_id`) junto con `orderBy('created_at', 'desc')`. Firestore requiere un índice compuesto que combine los campos de filtro con el campo de ordenamiento, y el índice existente en `apps/api/firestore.indexes.json` declara `created_at` en `ASCENDING` mientras la consulta ordena en `DESCENDING`, por lo que no sirve la consulta real. Es necesario versionar todos los índices compuestos requeridos con la dirección correcta.

## What Changes

- Actualizar `apps/api/firestore.indexes.json` para incluir los 4 índices compuestos necesarios sobre la colección `articles`:
  1. `status` ASC + `created_at` DESC + `__name__` ASC
  2. `category_id` ASC + `created_at` DESC + `__name__` ASC
  3. `category_id` ASC + `status` ASC + `created_at` DESC + `__name__` ASC
  4. `category_id` ASC + `status` ASC (para `count()` sin orderBy)
- Corregir la dirección de `created_at` de `ASCENDING` a `DESCENDING` en los índices existentes si no existe ninguna consulta `orderBy('created_at', 'asc')` (ver decisión en design.md).
- Proveer el comando exacto de despliegue: `firebase deploy --only firestore:indexes` (sin ejecutarlo autónomamente).
- Añadir nota de gestión de índices de Firestore vía CLI en documentación (`docs/backend-standards.md` o `README.md`).

## Capabilities

### New Capabilities

(Ninguna. Se modifica una capacidad existente.)

### Modified Capabilities

- `firestore-indexes`: Los requisitos de índice compuesto para `articles` cambian para incluir la combinación `category_id` + `status` + `created_at` DESC y corregir la dirección de `created_at` de ASC a DESC.

## Impact

- Código afectado: `apps/api/src/articles/articles.repository.ts` (consulta `findAll` con filtros opcionales y `orderBy('created_at', 'desc')`). No se modifica el código fuente; solo se ajusta la configuración de índices.
- Archivo de configuración: `apps/api/firestore.indexes.json`.
- Documentación: `docs/backend-standards.md` o `README.md` (nota de despliegue de índices).
- Sistemas: Firebase Firestore (proyecto de producción vía Firebase Console o CLI).
- No hay cambios en contratos de API ni en el modelo de datos.
