## Context

El panel de administración (`apps/admin`) es una app Astro en modo servidor (`output: 'server'`, adaptador `@astrojs/node`) que expone:
- `/login` — formulario de login con TailAdmin (isla React, `client:load`) que usa Firebase Auth (`signInWithEmailAndPassword`) + POST id_token a `POST /api/v1/auth/login`.
- `/admin/*` — páginas del panel (CMS skeleton, artículos, categorías, etc.), envueltas en `AdminLayout.astro`.

Actualmente:
- No existe la ruta raíz `/` en `apps/admin`.
- No existe protección de rutas: cualquier usuario puede acceder a `/admin/*` o `/` sin haber iniciado sesión.
- No hay middleware de Astro en `apps/admin`.
- El backend (`apps/api`) no setea cookie de sesión httpOnly tras `/auth/login` (el `logout` limpia cookies `session`/`token` pero `login` nunca las setea), por lo que el middleware de Astro no puede verificar sesión desde el servidor leyendo cookies.
- La persistencia de sesión vive en Firebase Auth del cliente (`auth.currentUser` / `onAuthStateChanged`), expuesta vía `apps/admin/src/lib/firebase.ts`.

Restricciones del cambio:
- No modificar la API (`apps/api`) ni el sitio público (`apps/web`).
- No cambiar el flujo de Firebase Auth (`signInWithEmailAndPassword`, id_token a `/api/v1/auth/login`).
- No introducir dependencias nuevas sin justificar.
- Build SSR (`output: 'server'`) debe seguir funcionando.

## Goals / Non-Goals

**Goals:**
- `GET /` sin sesión → redirect a `/login`.
- `GET /` con sesión → redirect a `/admin`.
- `GET /admin/*` sin sesión → redirect a `/login`.
- `GET /login` con sesión activa → redirect a `/admin` (evitar re-login innecesario).
- `GET /login` sin sesión → mostrar el formulario de login.
- Build SSR sigue generando `dist/server/entry.mjs`.
- Tests existentes del login siguen pasando.

**Non-Goals:**
- Implementar middleware de Astro que verifique cookies de sesión del servidor (el backend no setea cookies de sesión; no se modifica la API).
- Cambiar el contrato de autenticación de la API.
- Agregar dependencias npm nuevas.
- Implementar cierre de sesión automático por expiración de token.

## Decisions

### 1. Estrategia cliente (Firebase Auth) vs. middleware de servidor
**Decisión:** Usar verificación de cliente (Firebase Auth `auth.currentUser` / `onAuthStateChanged`) en la ruta raíz y en `AdminLayout`.
**Razón:** El backend no setea cookie de sesión httpOnly tras el login, por lo que un middleware de Astro no tendría sesión que verificar en el servidor. Modificar la API para setear cookies está fuera de alcance (restricción). Firebase Auth ya está configurado en el cliente y expone `auth` vía `apps/admin/src/lib/firebase.ts`.
**Alternativa considerada:** Middleware de Astro (`src/middleware.ts`) leyendo cookies. **Rechazada:** no hay cookie de sesión para leer; requeriría modificar la API.

### 2. Dónde aplicar la verificación
**Decisión:**
- Ruta raíz `/`: nueva página `apps/admin/src/pages/index.astro` con script inline de cliente que verifica `auth` y redirige.
- Rutas `/admin/*`: verificación en `AdminLayout.astro` (usa `Astro.url.pathname` para saltar la verificación cuando la ruta es `/login`).
- `/login` con sesión: redirigir a `/admin` desde el mismo `TailAdminLogin` o desde la página de login.

### 3. Detección de sesión en el cliente
**Decisión:** Usar `auth` de `apps/admin/src/lib/firebase.ts` y `onAuthStateChanged` para escuchar cambios de estado de autenticación. Si `auth` es `null` (Firebase no configurado), se asume que no hay sesión y se redirige a `/login`.
**Razón:** `onAuthStateChanged` es la forma idiomática de Firebase Auth para detectar estado de sesión, incluido el caso de token persistido en IndexedDB.

### 4. Evitar bucle de redirección en `/login`
**Decisión:** `AdminLayout` salta la verificación de sesión cuando `Astro.url.pathname === '/login'` o comienza con `/login`. La página de login maneja su propia redirección si ya hay sesión.
**Razón:** Evitar que el layout redirija a `/login` cuando el usuario ya está en `/login`.

## Risks / Trade-offs

- [Risk] Flash de contenido no autorizado: el HTML de `/admin/*` se renderiza en el servidor antes de que el script de cliente ejecute la redirección. → Mitigación: el script se ejecuta lo antes posible (`client:load` o script inline al inicio del `<body>`); el contenido sensible no se expone porque la API requiere token válido.
- [Risk] `auth` es `null` si Firebase no está configurado (variables de entorno faltantes o `dummy-api-key-for-tests`). → Mitigación: tratar `auth === null` como "no hay sesión" y redirigir a `/login`; documentar que se requiere Firebase configurado en desarrollo.
- [Risk] El build SSR podría fallar si el script de cliente usa `window`/`document` en el servidor. → Mitigación: envolver código de cliente en `typeof window !== 'undefined'` o usar directiva `client:load` en una isla React.

## Migration Plan

1. Crear `apps/admin/src/pages/index.astro` (ruta raíz) con redirección de cliente.
2. Modificar `apps/admin/src/layouts/AdminLayout.astro` para verificar sesión en rutas `/admin/*`.
3. Ajustar `apps/admin/src/pages/login/index.astro` para redirigir a `/admin` si ya hay sesión.
4. Añadir tests de redirección (Vitest).
5. Ejecutar `pnpm build` de `apps/admin` y la suite de tests.

## Open Questions

- ¿Debería `AdminLayout` usar una isla React con `client:load` para la verificación de sesión en lugar de script inline en el `.astro`? (Afecta cuándo se ejecuta la redirección en el ciclo de hidratación.)
