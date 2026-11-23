## 1. Verificación de dirección de `created_at`

- [x] 1.1 Grep en `apps/api/src/` buscando `orderBy('created_at', 'asc')` o `orderBy('created_at')` (asc por defecto). Verificar que NINGUNA consulta ordene ascendente por `created_at`. Verificación: el grep no devuelve coincidencias en código de producción.

## 2. Actualización de `firestore.indexes.json`

- [x] 2.1 Reemplazar los 2 índices existentes (con `created_at` ASCENDING) por equivalentes con `created_at` DESCENDING. Verificación: `apps/api/firestore.indexes.json` no contiene `created_at` con `ASCENDING` en índices compuestos de `articles`.
- [x] 2.2 Añadir índice: `status` ASC + `created_at` DESC + `__name__` ASC en colección `articles`. Verificación: entrada presente en el JSON.
- [x] 2.3 Añadir índice: `category_id` ASC + `created_at` DESC + `__name__` ASC en colección `articles`. Verificación: entrada presente en el JSON.
- [x] 2.4 Añadir índice: `category_id` ASC + `status` ASC + `created_at` DESC + `__name__` ASC en colección `articles`. Verificación: entrada presente en el JSON.
- [x] 2.5 Añadir índice: `category_id` ASC + `status` ASC (para `count()` sin orderBy) en colección `articles`. Verificación: entrada presente en el JSON.
- [x] 2.6 Validar que el JSON es sintácticamente correcto. Verificación: `node -e "JSON.parse(...)"` sale con código 0.

## 3. Despliegue de índices (ejecutar el usuario, no autónomo)

- [x] 3.1 Proveer el comando exacto: `firebase use <proyecto> && firebase deploy --only firestore:indexes` (ejecutar desde `apps/api/`). Verificación: el comando está documentado en tasks.md y el usuario lo ejecuta manualmente.
- [x] 3.2 Verificar en Firebase Console que los índices pasen de "Building" a "Ready". Verificación: estado de los índices en Firebase Console.

## 4. Documentación

- [x] 4.1 Añadir nota de gestión de índices de Firestore vía CLI en `docs/backend-standards.md`. Verificación: la documentación menciona `firebase deploy --only firestore:indexes` y `firestore.indexes.json`.

## 5. Puerta de verificación

- [x] 5.1 Ejecutar `npx openspec validate --all --strict`. Verificación: salida con código 0, 24 passed, 0 failed.
