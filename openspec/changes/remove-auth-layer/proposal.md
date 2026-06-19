## Why

La migración a SSG eliminó las rutas privadas (`/admin`, `/dashboard`) y el middleware de autenticación server-side. El cliente Firebase Auth (`firebase` SDK) ya no tiene propósito: no hay páginas protegidas a las que acceder, y el login redirige a home sin distinción de rol. Mantener Firebase client añade 273 KB al bundle JS, dependencias innecesarias y falsa expectativa de autenticación.

## What Changes

- **BREAKING**: Eliminar página de login (`/login`) — sin admin/dashboard, no hay destino post-login
- **BREAKING**: Eliminar `ForgotPasswordModal.astro` (solo usado por login)
- Eliminar `src/lib/firebase/client.ts` (inicialización Firebase)
- Eliminar `src/lib/auth-utils.ts` (código muerto, no importado)
- Limpiar imports Firebase auth en componentes huérfanos (`FileManager`, `TicketConversation`, `TicketMessageForm`) o eliminarlos
- Eliminar dependencia `firebase` de `package.json`
- Eliminar variables de entorno `PUBLIC_FIREBASE_*` de `.env.example`, `src/env.d.ts`, `Dockerfile`, `README.md`
- Eliminar `debug-env.ts`
- La landing pública (home, blog, diagnóstico, formularios) debe seguir funcionando sin cambios
- Formularios de contacto y newsletter deben mantener su funcionamiento (Turnstile, fetch a API Ligera)

## Capabilities

### New Capabilities
- *(ninguna — este cambio solo elimina funcionalidad)*

### Modified Capabilities
- *(ninguna — no hay specs existentes que modificar)*

## Impact

- **Código eliminado**: `src/pages/login.astro`, `src/components/auth/ForgotPasswordModal.astro`, `src/lib/firebase/client.ts`, `src/lib/auth-utils.ts`, `debug-env.ts`
- **Componentes limpiados**: `FileManager.astro`, `TicketConversation.astro`, `TicketMessageForm.astro` (eliminar imports Firebase auth)
- **Dependencia eliminada**: `firebase` (~273 KB del bundle JS cliente)
- **Variables eliminadas**: 6 `PUBLIC_FIREBASE_*` vars de `.env.example`, `env.d.ts`, `Dockerfile`, `README.md`
- **Ruta eliminada**: `/login/` (generaba `dist/login/index.html`)
- **Landing pública**: sin cambios — build debe seguir generando 12 páginas públicas correctamente
