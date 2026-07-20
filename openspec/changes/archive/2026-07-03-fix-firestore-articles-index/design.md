## Context

El `ArticlesRepository.findAll()` ejecuta un query compuesto en Firestore que filtra por `status` y ordena por `created_at`. Firestore requiere índices compuestos explícitos para queries con múltiples campos `where` + `orderBy`. Sin el índice, la API retorna `FAILED_PRECONDITION` (HTTP 500) al listar artículos. El error ya fue identificado en la consola de desarrollo.

Query que requiere el índice:
```typescript
query.where('status', '==', filters.status)
     .orderBy('created_at', 'desc')
     .get()
```

## Goals / Non-Goals

**Goals:**
- Crear el índice compuesto `status` ASC + `created_at` ASC + `__name__` ASC en la colección `articles`
- Documentar el índice en `firestore.indexes.json`
- Verificar que `GET /api/v1/articles` deja de retornar 500

**Non-Goals:**
- No modificar el código del repository
- No crear índices para otros collections
- No modificar la lógica de queries

## Decisions

1. **Crear el índice vía Firebase Console (UI)**
   - Razón: Es una operación puntual, la UI de Firebase muestra el índice exacto requerido
   - Alternativa: `gcloud firestore indexes composite create` → requiere CLI configurado

2. **Documentar el índice en `firestore.indexes.json` (formato oficial)**
   - Razón: Permite replicación en otros entornos, código como documentación
   - Permite deploy automatizado con `firebase deploy --only firestore:indexes`

3. **Scope del índice: colección `articles` a nivel `(default)`**
   - Razón: No hay subcolecciones en este proyecto

## Risks / Trade-offs

- **[Riesgo]** Crear el índice puede tardar varios minutos en Firestore → **Mitigación**: No afecta queries existentes mientras se construye
- **[Trade-off]** Índice aumenta costo de escritura en Firestore → **Beneficio**: Query de listado de artículos es la operación más frecuente