## 1. Ruta raíz / con redirección

- [x] 1.1 Crear `apps/admin/src/pages/index.astro` que verifique sesión de Firebase Auth y redirija a `/login` (sin sesión) o `/admin` (con sesión)
- [x] 1.2 Verificar que `apps/admin` sigue compilando en SSR (`output: 'server'`) tras agregar la ruta raíz

## 2. Protección de rutas /admin/* en AdminLayout

- [x] 2.1 Modificar `apps/admin/src/layouts/AdminLayout.astro` para verificar `auth.currentUser` / `onAuthStateChanged` en rutas `/admin/*` y redirigir a `/login` si no hay sesión
- [x] 2.2 Saltear verificación en `AdminLayout` cuando la ruta actual es `/login` (evitar bucle de redirección)

## 3. Redirección de /login con sesión activa

- [x] 3.1 Modificar `apps/admin/src/pages/login/index.astro` para redirigir a `/admin` cuando Firebase Auth tenga sesión activa
- [x] 3.2 `/login` sin sesión sigue mostrando el formulario de TailAdmin

## 4. Tests

- [x] 4.1 Añadir tests Vitest para la redirección de ruta raíz (sin sesión → /login, con sesión → /admin)
- [x] 4.2 Añadir tests Vitest para la protección de rutas /admin/* (sin sesión → /login)
- [x] 4.3 Añadir tests Vitest para /login con sesión activa (→ /admin)
- [x] 4.4 Verificar que los tests existentes del login (`TailAdminLogin.test.tsx`, `LoginForm.test.tsx`) siguen pasando

## 5. Verificación final

- [x] 5.1 Ejecutar `pnpm --filter @webastro/admin build` y confirmar `dist/server/entry.mjs`
- [x] 5.2 Ejecutar `pnpm --filter @webastro/admin test` y confirmar que todos pasan
