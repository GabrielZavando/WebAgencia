## Why

La colección `articles` en Firestore no tiene el índice compuesto necesario para el query principal de listado: `where('status', '==', ...)` + `orderBy('created_at', 'desc')`. Esto causa errores `FAILED_PRECONDITION` en producción cada vez que se listan artículos, especialmente los publicados.

## What Changes

- Se crea un índice compuesto en Firestore para la colección `articles` con los campos `status` (ASC), `created_at` (ASC) y `__name__` (ASC)
- Se documenta el índice en un archivo de configuración `firestore.indexes.json` para referencia futura y despliegues automáticos

## Capabilities

### New Capabilities

- `firestore-indexes`: Sistema de índices de Firestore para queries de la aplicación

### Modified Capabilities

- Ninguna

## Impact

- **Código afectado**: Ninguno (el índice se crea en la consola de Firebase/Firestore)
- **APIs afectadas**: `/api/v1/articles` (GET) — deja de retornar 500 y funciona correctamente
- **Firebase**: Se crea un índice compuesto en Firestore (no requiere deploy de código)
- **Documentación**: Se crea `firestore.indexes.json` como referencia