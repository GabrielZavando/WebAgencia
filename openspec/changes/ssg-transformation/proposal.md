## Why

El proyecto actual usa Astro en modo SSR con adapter Node, incluye rutas privadas protegidas (/admin, /dashboard) con Firebase Auth, y renderiza el blog server-side llamando a una API externa en build time. El objetivo es migrar a **100% SSG (Static Site Generation)** para desplegar en Hostinger como archivos estáticos, eliminando toda la infraestructura de servidor, autenticación y middleware, y delegando la interactividad (blog dinámico, formularios) a llamadas fetch desde el cliente hacia una API Ligera (NestJS) que aún no existe.

## What Changes

**Eliminaciones (BREAKING):**
- Rutas `/admin/**` y `/dashboard/**` completas (30+ páginas)
- Middleware de autenticación (`src/middleware.ts`)
- Firebase Admin SDK (`firebase-admin`) y Firebase Client (`firebase`)
- Adapter `@astrojs/node` y configuración `output: 'server'`
- Layouts `DashboardLayout.astro`, `AuthLayout.astro`
- Componentes admin (`src/components/admin/**`, `AdminFooter`, `FileManager`)
- Páginas de auth (`suscripcion-confirmada.astro`, `unsubscribe.astro`, `Unsubscribe.astro`)
- Stores de autenticación (`authStore.ts`, `authStore.spec.ts`)
- Dependencias: `@nanostores/persistent` (solo usada por auth store)

**Modificaciones:**
- `astro.config.mjs` → `output: 'static'`, quitar adapter node
- Blog: migrar de fetch server-side en build a **datos locales JSON** (`src/data/blog-posts.json`) para SSG puro
- Contacto y Newsletter: convertir a islas client-side (`client:visible`) que consumen API Ligera
- `api-client.ts`: simplificar (quitar lógica auth/tokens, mantener fetch con timeout/retry)
- Search del blog: filtrado client-side sobre posts renderizados (sin API)
- Variables de entorno: limpiar a solo `PUBLIC_API_BASE_URL`, `PUBLIC_TURNSTILE_SITE_KEY`

**Nuevas adiciones:**
- `src/data/blog-posts.json` con posts de ejemplo para SSG
- Componente `NewsletterForm.astro` (isla) extraído de `Footer.astro`
- Build genera `dist/` listo para Hostinger (solo estáticos)

## Capabilities

### New Capabilities
- `ssg-blog`: Renderizado estático del blog (index + posts individuales) desde datos locales JSON en build time
- `client-contact-form`: Isla interactiva para formulario de contacto con validación anti-spam, Turnstile y fetch a API Ligera
- `client-newsletter-form`: Isla interactiva para suscripción newsletter en footer con Double Opt-In y fetch a API Ligera
- `api-client-light`: Cliente HTTP simplificado para consumo de API Ligera (timeout, retry, error handling, sin auth)
- `static-deploy`: Configuración Astro para output estático desplegable en hosting compartido (Hostinger)

### Modified Capabilities
- (ninguna - no hay specs previas en el proyecto)

## Impact

**Código afectado:**
- `astro.config.mjs` - Configuración de output y adapter
- `package.json` - Dependencias (eliminar 5+ paquetes)
- `src/middleware.ts` - Eliminar
- `src/lib/firebase/` - Eliminar carpeta completa
- `src/stores/` - Eliminar carpeta completa
- `src/pages/admin/**` - Eliminar carpeta completa
- `src/pages/dashboard/**` - Eliminar carpeta completa
- `src/pages/blog/index.astro` - Refactor a SSG con datos locales
- `src/pages/blog/[...slug].astro` - Refactor a SSG con datos locales
- `src/components/landing/Contact.astro` - Añadir `client:visible`
- `src/components/shared/Footer.astro` - Extraer NewsletterForm
- `src/components/shared/Search.astro` - Filtrado client-side
- `src/lib/api-client.ts` - Simplificar
- `src/data/blog-posts.json` - Nuevo archivo
- `.env.example`, `src/env.d.ts` - Limpiar variables

**Sistemas:**
- Despliegue: De Cloud Run (contenedor Node) → Hostinger (archivos estáticos)
- CI/CD: Build genera `dist/` sin step de containerización
- API Ligera (NestJS): Consumida solo en runtime client-side, no en build
