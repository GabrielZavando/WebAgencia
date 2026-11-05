## Context

El monorepo WebAstro tiene un backend NestJS con Firebase Firestore y un frontend Astro con shadcn/ui. El backend ya tiene el esqueleto del CRUD de categorías (`categories.controller.ts`, `categories.service.ts`, `categories.repository.ts`, DTOs, entity, unit tests del servicio). El frontend tiene el shell de administración (`AdminLayout`, `Sidebar`, `Header`) y el cliente HTTP (`apiClient`), pero no tiene vistas de categorías ni el componente `Table` de shadcn/ui.

El enlace "Categorías" en el Sidebar está `disabled: true`. No existe `apps/web/src/pages/admin/categories/`. El backend carece del endpoint `GET /:id` y de paginación en `GET /`, y no hay tests del controller ni del repositorio.

## Goals / Non-Goals

**Goals:**
- Completar el CRUD de categorías en backend y frontend
- Exponer `GET /api/v1/categories/:id` para detalle de categoría
- Agregar paginación a `GET /api/v1/categories`
- Crear vista de listado y formulario de creación/edición en el panel admin
- Habilitar la navegación a Categorías en el Sidebar
- Llamadas al API con Bearer token de autenticación
- Mantener tests unitarios con cobertura ≥ 80% en código nuevo

**Non-Goals:**
- No modificar el modelo de datos ni `packages/shared-types`
- No implementar editor de artículos ni biblioteca de medios
- No modificar el sitio público (landing/blog)
- No implementar autenticación desde cero (ya existe `LoginForm`, `useAuth`)

## Decisions

### Backend: Agregar `findById` al controller y service
**Alternativa:** Dejar el detalle solo en el service y no exponerlo por HTTP.
**Decisión:** Exponer `GET /:id` porque el frontend lo necesita para el formulario de edición y la spec `category-management` ya lo requiere (`### Requirement: Obtener categoría por ID` implícito en el CRUD completo).
**Rationale:** El repository ya tiene `findById`; solo falta exponerlo en el controller y agregar la ruta.

### Backend: Paginación en `findAll`
**Alternativa:** Retornar todas las categorías sin paginar.
**Decisión:** Agregar query params `page` y `limit` con defaults seguros.
**Rationale:** El listado público puede crecer; la paginación evita payloads grandes. El spec pide "listado, con paginación".

### Frontend: Componente Table de shadcn/ui
**Alternativa:** Usar tabla HTML nativa sin shadcn.
**Decisión:** Crear `apps/web/src/components/ui/table.tsx` siguiendo el patrón de los componentes shadcn/ui existentes.
**Rationale:** Consistencia con el design system; el estándar del proyecto usa shadcn/ui para componentes admin.

### Frontend: Autenticación Bearer token
**Alternativa:** Usar cookies httpOnly (como sugiere `data-model.md` para AuthSession).
**Decisión:** Enviar el Bearer token obtenido de `useAuth` / Firebase ID token en el header `Authorization` de cada llamada al API.
**Rationale:** El backend `AuthGuard` espera `Authorization: Bearer <token>`. El `apiClient` acepta headers personalizados. El `useAuth` ya verifica sesión vía `/api/v1/auth/me` con cookies.

### Frontend: Página de edición vs creación
**Alternativa:** Dos páginas separadas (`create.astro` y `edit/[id].astro`).
**Decisión:** Una sola página `[id].astro` que maneja tanto creación (id="new") como edición.
**Rationale:** Menos duplicación; el formulario es idéntico salvo por el endpoint (POST vs PATCH) y los valores iniciales.

### OpenSpec: Delta specs para capabilities existentes
**Alternativa:** Crear nuevas capabilities `category-crud` y `cms-categories`.
**Decisión:** Usar delta specs solo en `cms-admin-panel` que ya existe en `openspec/specs/`. No se crea delta spec para `category-management` porque sus requisitos de backend ya están completos.
**Rationale:** Evitar duplicación de capabilities; los requisitos de frontend de categorías pertenecen a `cms-admin-panel`.

## Risks / Trade-offs

- [Risk] El `useAuth` no expone el token directamente; solo verifica autenticación.
  → Mitigation: Obtener el Firebase ID token vía `firebase/auth` (`getIdToken()`) en la isla React que hace las llamadas, igual que hace `LoginForm`.
- [Risk] Firestore `count()` para `countByCategoryId` requiere índice compuesto.
  → Mitigation: El repository ya lo implementa; asumir que el índice existe en Firestore.
- [Risk] La página `[id].astro` con `id="new"` puede confundir con un ID real.
  → Mitigation: Manejar `id === 'new'` como modo creación en el componente.

## Migration Plan

1. Desplegar cambios de backend primero (endpoints nuevos son aditivos, no rompen clientes existentes).
2. Desplegar frontend después; las páginas nuevas son independientes del shell existente.
3. Rollback: revertir el change; no hay migración de datos (no se cambia el modelo).

## Open Questions (cerradas)

### Q1: CSRF en llamadas mutantes
**Decisión:** Opción A — No se requiere validación CSRF.
**Rationale:** Las llamadas mutantes (POST/PATCH/DELETE) usan Bearer token en el header `Authorization`, no cookies de sesión. El uso de Bearer token mitiga el riesgo de CSRF porque los navegadores no envían automáticamente el header `Authorization` en peticiones cross-origin sin preflight explícito, y no hay cookies de sesión que puedan ser explotadas por un atacante.

### Q2: Endpoint `GET /api/v1/categories/:id` — ¿público o protegido?
**Decisión:** Opción A — Público (sin `AuthGuard`).
**Rationale:** Coherente con el listado público de categorías (`GET /api/v1/categories` no requiere autenticación según la spec `category-management`). La lectura de categorías no expone datos sensibles, por lo que no requiere autenticación.
