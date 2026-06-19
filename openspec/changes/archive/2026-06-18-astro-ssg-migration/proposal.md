## Why

El proyecto actualmente usa Astro en modo SSR (`output: 'server'`) con el adapter `@astrojs/node`, lo que genera un servidor Node.js en producción. El objetivo es migrar a **Static Site Generation (SSG)** puro (`output: 'static'`) para poder desplegar la web como archivos estáticos en Hostinger, eliminando la necesidad de un servidor Node.js en producción, mientras se mantiene el funcionamiento de todas las rutas públicas actuales.

## What Changes

**Modificaciones (BREAKING - cambia el modelo de despliegue):**
- `astro.config.mjs`: Cambiar `output: 'server'` → `output: 'static'` y remover el adapter `@astrojs/node`
- `package.json`: Eliminar dependencia `@astrojs/node`
- Build process: `astro build` generará únicamente archivos estáticos en `dist/` (HTML, CSS, JS, assets)

**Mantenidos sin cambios (fuera de scope):**
- Middleware de autenticación (`src/middleware.ts`) - se mantiene pero no se ejecutará en build estático
- Rutas `/admin/**` y `/dashboard/**` - se mantienen en código pero no tendrán funcionalidad SSR
- Blog (`src/pages/blog/**`) - se mantiene la lógica actual de fetch en build time
- Formularios (Contacto, Newsletter) - se mantienen como islas client-side
- Firebase Admin/Client - se mantienen en dependencias
- Componentes y layouts existentes

## Capabilities

### New Capabilities
- `static-build`: Generación de build estático desplegable en hosting compartido (Hostinger, Netlify, Vercel static, etc.)

### Modified Capabilities
- (ninguna - no hay specs previas en el proyecto)

## Impact

**Código afectado:**
- `astro.config.mjs` - Configuración principal de output y adapter
- `package.json` - Dependencias de producción (eliminar `@astrojs/node`)

**Sistemas:**
- Despliegue: De contenedor Node.js (Cloud Run) → Archivos estáticos (Hostinger)
- CI/CD: Build simplificado sin step de containerización
- Runtime: No hay servidor Node.js en producción; todo se sirve como archivos estáticos
