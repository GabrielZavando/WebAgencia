## Context

El panel de administración (`apps/admin`) es una aplicación Astro en modo servidor (`output: 'server'`) que expone la ruta `/login`. El login actual está implementado con `LoginForm.tsx` (isla React, `client:load`) que usa estilos legacy (clases `login-*`, `form-*` y BEM en `src/styles/global.css`) y llama directamente a `signInWithEmailAndPassword` de Firebase Auth seguido de un POST a `${PUBLIC_API_URL}/api/v1/auth/login`.

El proyecto adopta Tailwind utility-first como estándar para componentes nuevos y admin, y busca reducir `global.css` migrando componentes a utilidades. No existe aún un usuario administrador en Firebase Auth, por lo que no se puede acceder al panel en desarrollo sin un mecanismo de creación out-of-band.

Las capabilities existentes relevantes son:
- `openspec/specs/client-portal-auth/spec.md`: define los requisitos de auth del portal cliente (única ruta `/login`, sin registro, sin recuperación, un solo admin, validación cliente, endpoint `/api/v1/auth/login`, React island `client:load`, token solo en cookie httpOnly, tests Vitest + Playwright).
- `openspec/specs/login-tailwind-mockup/spec.md`: define la implementación visual del login con Tailwind utilities, overlay sobre imagen de fondo, iconos dentro de inputs y footer sticky.

Restricciones del cambio (definidas por el usuario):
- No modificar la lógica de autenticación de la API (`AuthGuard`, `AuthService`).
- No tocar `apps/web` (sitio público).
- No implementar registro de usuarios; los usuarios se crean con el script de seed.
- El login debe funcionar en desarrollo local (Firebase Auth ya configurado).
- Mensajes de API en español latinoamericano neutro; código en inglés.

## Goals / Non-Goals

**Goals:**
- Reemplazar el formulario visual del login por la isla de login de TailAdmin (React), tomando solo tarjeta, inputs y botón (no migrar dashboard ni navegación).
- Mantener el flujo de autenticación actual: Firebase Auth (`signInWithEmailAndPassword`) + POST id_token a `/api/v1/auth/login` + redirección a `/admin` en éxito.
- Mantener el manejo de errores con mensajes claros y genéricos (credenciales inválidas, usuario no encontrado, rate limit, error de red).
- Crear script `apps/api/scripts/create-admin-user.ts` (Firebase Admin SDK `getAuth().createUser`) para crear el primer usuario admin vía variables de entorno o argumentos; sin endpoint público de creación.
- Eliminar componentes y estilos del login anterior que ya no se usen.
- Asegurar que `apps/admin` sigue compilando en SSR (`output: 'server'`).
- Añadir tests del nuevo formulario (render, submit válido/inválido, redirección) y test opcional del script de seed.
- Actualizar la capability `client-portal-auth` con los nuevos requisitos de UI de login.

**Non-Goals:**
- Migrar el dashboard de TailAdmin ni su navegación al panel.
- Implementar registro de usuarios, recuperación de contraseña vía UI o multi-tenancy.
- Cambiar el contrato de la API (`/api/v1/auth/login`, `/api/v1/auth/me`, etc.).
- Modificar `AuthGuard`, `AuthService` ni ningún endpoint de la API.
- Tocar `apps/web`.

## Decisions

### 1. Usar TailAdmin (React) como base visual del login (vs. mantener LoginForm custom)
**Razón:** El estándar del proyecto es Tailwind utility-first para componentes nuevos/admin. LoginForm usa estilos legacy BEM en `global.css` y clases propias (`login-*`, `form-*`) que no se ajustan a ese estándar. TailAdmin entrega una tarjeta de login con inputs y botón ya mapeados a Tailwind, reduciendo CSS custom y manteniendo consistencia visual.
**Alternativa considerada:** Mantener `LoginForm.tsx` y solo refactorizar sus clases a Tailwind. **Rechazada:** implicaría reescribir el marcado y estilos a mano, con mayor esfuerzo y sin el beneficio de un componente de diseño aprobado.
**Alternativa considerada:** Migrar todo el dashboard de TailAdmin. **Rechazada:** fuera de alcance; el usuario pide solo el formulario de login.

### 2. Mantener el flujo de autenticación actual (Firebase Auth + API `/api/v1/auth/login`)
**Razón:** La restricción prohíbe modificar la lógica de auth de la API. El flujo actual (Firebase client-side + envío de id_token al backend + cookie httpOnly) funciona y está cubierto por tests existentes. Se reutiliza `LoginForm.tsx` adaptándolo o se adapta la lógica a la isla de TailAdmin conservando `signInWithEmailAndPassword` y `apiClient.post`.

### 3. Isla React con `client:load` (no `client:idle`)
**Razón:** La capability `client-portal-auth` exige disponibilidad inmediata del formulario al cargar `/login`. `client:load` garantiza hidratación inmediata; `client:idle` podría dejar el formulario sin interactuar inicialmente.

### 4. Script de seed con Firebase Admin SDK (`getAuth().createUser`)
**Razón:** No hay endpoint público de creación de usuarios (restricción + `client-portal-auth`). El primer admin se crea out-of-band mediante script ejecutado localmente con variables de entorno o argumentos. Nunca se exponen credenciales en el código.

### 5. Mantener `output: 'server'` en `apps/admin`
**Razón:** El panel es una aplicación en modo servidor; el cambio no altera su modo de salida. Se verificará que el build SSR siga pasando tras introducir la isla de TailAdmin.

## Risks / Trade-offs

- [Risk] El componente de login de TailAdmin puede no usar los tokens de diseño del proyecto (colores `--primary`, `--surface`, etc.). → Mitigation: mapear las clases de TailAdmin a los tokens CSS del proyecto y verificar contraste/accesibilidad (ARIA labels).
- [Risk] TailAdmin puede incluir código que asume `window`/`document` al nivel de módulo, rompiendo el SSR de Astro. → Mitigation: importar dinámicamente o proteger con `typeof window !== 'undefined'`; validar con `pnpm build` de `apps/admin`.
- [Risk] El script de seed requiere credenciales de Firebase Admin (service account) que no deben commitearse. → Mitigation: leer de variables de entorno (`FIRE_ADMIN_*`) o argumentos; agregar a `.gitignore` si se genera archivo de credenciales.
- [Risk] Eliminar estilos legacy del login anterior podría romper otras páginas que los compartan. → Mitigation: auditar referencias a clases `login-*`/`form-*` antes de borrar; eliminar solo lo exclusivo del login.

## Migration Plan

1. Crear `apps/api/scripts/create-admin-user.ts` y documentar su ejecución (`pnpm ts-node scripts/create-admin-user.ts` con `ADMIN_EMAIL`/`ADMIN_PASSWORD` o argumentos).
2. Reemplazar el formulario en `apps/admin/src/pages/login/index.astro` por isla React de TailAdmin.
3. Mover/adaptar la lógica de `signInWithEmailAndPassword` + `apiClient.post` + manejo de errores a la isla de TailAdmin (o conservar `LoginForm.tsx` como contenedor de lógica renderizado por TailAdmin).
4. Eliminar componentes y estilos legacy del login no usados.
5. Ejecutar `pnpm build` de `apps/admin` para confirmar SSR.
6. Ejecutar tests (Vitest + Playwright) del login.
7. Ejecutar el script de seed en desarrollo para crear el primer admin.

## Open Questions

- ¿Se conserva `LoginForm.tsx` como contenedor de lógica y se renderiza dentro de la tarjeta de TailAdmin, o se reescribe la lógica dentro de la isla de TailAdmin? (Decisión a tomar al iniciar la implementación; no afecta los requisitos de la capability.)
- ¿TailAdmin se instala como paquete npm o se copia solo el componente visual de login? (El usuario pide "tomar solo el componente visual del formulario y los estilos necesarios".)
