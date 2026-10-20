# Design

## Context

Ver `proposal.md` — Why.

El frontend es Astro estático (`output: 'static'`), sin middleware ni adapter de servidor. El panel legacy se monta como islas React (`Dashboard`, `DashboardLayout`, `Sidebar`, `Header`) y usa `useAuth` para consultar `/api/v1/auth/me`. El dashboard intenta consumir `/api/v1/stats/summary` y `/api/v1/leads/recent`, endpoints que no existen en la API actual, y cae en datos de ejemplo. Las rutas `/admin/leads` y `/admin/settings` son placeholders que enlazan de vuelta al dashboard.

Las specs actuales describen ese panel como si estuviera operativo. Además, `tailwind-bem-migration` exige `/admin/leads` y `/admin/settings`, y `auth-protection` exige protección de `/admin/*`. Esas expectativas ya no coinciden con el producto que se quiere construir.

## Goals / Non-Goals

**Goals:**

- Eliminar la UI administrativa muerta y sus dependencias directas.
- Dejar un único punto de entrada `/admin`, estático y sin datos.
- Alinear specs, documentación y tests con ese estado.
- Mantener el futuro CRUD como un cambio separado y explícito.

**Non-Goals:**

- Implementar CRUD, métricas, leads o autenticación administrativa.
- Proteger `/admin` en este cambio.
- Modificar backend, API, Firestore, Supabase o el sitio público.
- Corregir el contrato de blog o la redacción histórica de `client-portal-auth`.
- Eliminar `useAuth.ts` ni `@heroicons/react`.

## Decisions

### 1. Eliminar el panel en vez de refactorizarlo

**Decisión:** borrar páginas y componentes legacy; no adaptarlos.

**Rationale:** el panel depende de endpoints inexistentes, muestra datos falsos y no tiene acciones reales. Refactorizarlo conservaría deuda y daría una falsa impresión de funcionalidad.

**Alternativas consideradas:**
- Mantener el dashboard con datos de ejemplo: rechazado por engañoso y costoso de mantener.
- Convertir el dashboard en una vista real: rechazado porque requiere CRUD/endpoints fuera de alcance.

### 2. Placeholder `/admin` estático y público

**Decisión:** crear `src/pages/admin/index.astro` con `MainLayout`, sin isla React, sin fetch y sin auth gate.

**Rationale:** cumple el objetivo de cleanup con cero JavaScript de administración. El placeholder no expone datos ni acciones, así que no requiere protección todavía.

**Alternativas consideradas:**
- Reutilizar `useAuth` para redirigir a `/login`: rechazado porque añade comportamiento y una isla React que este cambio no necesita.
- Mantener `/admin/dashboard` como placeholder: rechazado porque conserva una URL legacy y confunde el punto de entrada.

### 3. Retirar `dashboard-widgets` y `auth-protection`

**Decisión:** eliminar todos sus requisitos y borrar sus specs principales al archivar, usando `retire_capabilities: true`.

**Rationale:** sin widgets ni rutas protegidas, esas capabilities solo contendrían requisitos negativos o falsos. Es más honesto retirarlas y recrearlas cuando exista el CRUD.

**Alternativas consideradas:**
- Dejar requisitos “deferred”: rechazado porque una spec debe describir comportamiento actual, no intenciones.
- Mantener las capabilities intactas: rechazado porque contradice el sistema real.

### 4. Mantener `useAuth` y `@heroicons/react`

**Decisión:** no borrar `src/hooks/useAuth.ts` ni la dependencia de Heroicons.

**Rationale:** son piezas reutilizables para el CRUD futuro. `useAuth` no se importa desde ninguna página después del cleanup, por lo que no entra al bundle; Heroicons queda disponible para los nuevos componentes.

**Alternativas consideradas:**
- Borrar todo lo no usado: rechazado por la decisión de conservar primitives para el siguiente cambio.

### 5. Verificación estructural como gate principal

**Decisión:** añadir `apps/web/tests/validation/admin-cleanup.test.ts` y usarlo como test de aceptación del cleanup.

**Rationale:** el suite E2E de login no corre en CI y tiene un desajuste preexistente entre el mock de API y el flujo real de Firebase. Un test estructural verifica de forma determinista que las rutas/componentes desaparecieron y que el redirect apunta a `/admin`.

**Alternativas consideradas:**
- Depender solo de E2E: rechazado porque no es estable en este repo.
- Test unitario de `window.location`: posible, pero jsdom no implementa navegación de forma fiable; se puede añadir como complemento, no como gate único.

### 6. Actualizar documentación en el mismo cambio

**Decisión:** actualizar `LOCAL_DEV.md`, `design-components.md`, `DESIGN.md`, `ai-design-guidance.md` y `CHANGELOG.md`.

**Rationale:** la documentación es fuente de verdad y no debe seguir describiendo componentes borrados.

## Risks / Trade-offs

- **Bookmarks a `/admin/dashboard` dejan de funcionar** → `/admin` queda como nuevo punto de entrada y la documentación se actualiza.
- **Placeholder público sin auth** → no muestra datos ni acciones; cualquier CRUD futuro debe añadir protección antes de exponer información.
- **Retirar capabilities pierde requisitos documentados** → quedan en el historial de git y en el change archivado; se recrean en el cambio de CRUD.
- **`useAuth` queda sin referencias** → se conserva intencionalmente; se documenta como primitive para el futuro.
- **El E2E de login puede seguir fallando por Firebase** → el gate obligatorio es el test estructural; el E2E se actualiza para consistencia, no como bloqueo de CI.
- **Referencias históricas en `openspec/changes/archive/`** → no se editan; los greps de verificación las excluyen.

## Migration Plan

1. Crear artefactos OpenSpec de este cambio.
2. Añadir el test estructural y confirmar que falla.
3. Eliminar páginas y componentes legacy; añadir `/admin`.
4. Cambiar el redirect de login y actualizar tests/documentación.
5. Ejecutar build, tests y validación OpenSpec.
6. Verificar rutas generadas en `dist/`.
7. Archivar el change; actualizar el Purpose de `admin-dashboard` directamente en su spec principal y confirmar que las capabilities retiradas desaparecen.

**Rollback:** revertir el commit del cambio. No hay migraciones de datos ni cambios de backend.

## Open Questions

Ninguna.
