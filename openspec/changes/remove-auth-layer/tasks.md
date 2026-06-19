## 1. Eliminar página de login y componentes auth

- [x] 1.1 Eliminar `src/pages/login.astro`
- [x] 1.2 Eliminar `src/components/auth/ForgotPasswordModal.astro`
- [x] 1.3 Eliminar `src/components/auth/` (directorio auth, si solo contenía ForgotPasswordModal)

## 2. Eliminar Firebase client y auth utilities

- [x] 2.1 Eliminar `src/lib/firebase/client.ts`
- [x] 2.2 Eliminar `src/lib/firebase/` (directorio firebase, si solo contenía client.ts)
- [x] 2.3 Eliminar `src/lib/auth-utils.ts`
- [x] 2.4 Eliminar `debug-env.ts`

## 3. Limpiar imports Firebase en componentes huérfanos

- [x] 3.1 Limpiar `src/components/shared/FileManager.astro`: eliminar import de `firebase/auth` y `lib/firebase/client`, eliminar lógica `onAuthStateChanged`
- [x] 3.2 Limpiar `src/components/support/TicketConversation.astro`: eliminar import de `firebase/auth` y `lib/firebase/client`, eliminar lógica `onAuthStateChanged` y `auth.currentUser`
- [x] 3.3 Limpiar `src/components/support/TicketMessageForm.astro`: eliminar import de `firebase/auth` y `lib/firebase/client`, eliminar lógica `onAuthStateChanged` y `auth.currentUser`

## 4. Eliminar dependencia Firebase de package.json

- [x] 4.1 Eliminar `firebase` de `dependencies` en `package.json`
- [x] 4.2 Eliminar `@firebase/util` de `pnpm.allowBuilds` si existe
- [x] 4.3 Ejecutar `npm install` (o `pnpm install`) para actualizar lockfile

## 5. Limpiar variables de entorno Firebase

- [x] 5.1 Eliminar 6 variables `PUBLIC_FIREBASE_*` de `.env.example`
- [x] 5.2 Eliminar 6 variables `PUBLIC_FIREBASE_*` de `src/env.d.ts`
- [x] 5.3 Eliminar variables `PUBLIC_FIREBASE_*` del `Dockerfile` (ARG + ENV)
- [x] 5.4 Eliminar referencias Firebase de `README.md`

## 6. Build y verificación

- [x] 6.1 Ejecutar `npm run build` y verificar que completa sin errores
- [x] 6.2 Verificar que `dist/` no contiene `/login/index.html`
- [x] 6.3 Verificar que `dist/` contiene todas las rutas públicas: index.html, blog/, blog/*/, diagnostico/, politica-de-privacidad/, 404.html, suscripcion-confirmada/, unsubscribe/, metodologia/, servicios/
- [x] 6.4 Verificar que el bundle JS no contiene referencias a Firebase (grep por `firebase` en `dist/_astro/*.js`)

## 7. Tests

- [x] 7.1 Ejecutar `npm run test` (unit tests) y verificar que pasan
- [x] 7.2 Ejecutar `npm run test:e2e` (Playwright) y verificar que pasan

## 8. Documentación

- [x] 8.1 Actualizar `CHANGELOG.md` con versión y cambios
- [x] 8.2 Commit: `git add -A && git commit -m "chore: remove Firebase client auth layer"`
