## Why

El proyecto ya no necesita las áreas privadas de administración (`/admin`) y dashboard de clientes (`/dashboard`), ya que la arquitectura migró a SSG puro y no hay servidor que ejecute middleware de autenticación. Mantener estas rutas añade complejidad, código muerto y falsa sensación de seguridad (se generan como HTML estático sin protección real). Eliminarlas reduce la superficie de mantenimiento, simplifica el build y elimina dependencias de servidor como Firebase Admin.

## What Changes

- **BREAKING**: Eliminar todas las rutas `/admin/*` (24 páginas)
- **BREAKING**: Eliminar todas las rutas `/dashboard/*` (9 páginas)
- Eliminar layout `DashboardLayout.astro` y `AuthLayout.astro`
- Eliminar componentes exclusivos de admin/dashboard (`src/components/admin/`, dashboard scripts, project scripts)
- Eliminar middleware de autenticación (`src/middleware.ts`)
- Eliminar Firebase Admin SDK y lógica server-side de auth (`src/lib/firebase/server.ts`, `src/stores/authStore.ts`)
- Eliminar datos de navegación privada (`src/data/navigation.ts`)
- Eliminar estilos SCSS exclusivos de admin/dashboard (~13 archivos)
- Limpiar referencias cruzadas en componentes compartidos (support, shared)
- Simplificar `login.astro` sin redirects basados en rol
- Eliminar dependencias `firebase-admin`, posiblemente `firebase`, `@nanostores/persistent`
- La landing pública (home, blog, diagnóstico, política, contacto, newsletter) debe seguir funcionando sin cambios

## Capabilities

### New Capabilities
- *(ninguna — este cambio solo elimina funcionalidad)*

### Modified Capabilities
- *(ninguna — no hay specs existentes que modificar)*

## Impact

- **Código eliminado**: ~70 archivos (páginas admin/dashboard, componentes, layouts, scripts, middleware, stores, estilos, datos de navegación)
- **Dependencias eliminadas**: `firebase-admin`, posible `firebase` y `@nanostores/persistent`
- **Rutas eliminadas**: `/admin/*` (24 rutas), `/dashboard/*` (9 rutas), `/login` (posiblemente)
- **Login**: Simplificar para redirigir a home o contenido público
- **API Client**: Eliminar métodos de endpoints admin (`/forms/admin/*`, `/users/set-admin-role`)
- **Componentes compartidos**: Limpiar referencias a roles y layouts privados en `TicketDetailView`, `TicketConversation`, `TicketMessageForm`, `FileManager`
- **Landing pública**: Sin cambios — debe seguir generándose correctamente en SSG
