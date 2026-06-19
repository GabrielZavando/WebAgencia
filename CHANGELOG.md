# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versión siguiendo [Semantic Versioning](https://semver.org/lang/es/).

## [1.6.0] - 2026-06-18

### Removed

* **admin:** Eliminadas todas las rutas `/admin/*` (24 páginas) y `/dashboard/*` (9 páginas)
* **layouts:** Eliminados `DashboardLayout.astro` y `AuthLayout.astro`
* **components:** Eliminados componentes admin (`src/components/admin/`, 8 archivos) y scripts dashboard (`src/scripts/dashboard/`, 6 archivos)
* **auth:** Eliminado middleware de autenticación (`src/middleware.ts`) y Firebase Admin SDK (`src/lib/firebase/server.ts`)
* **stores:** Eliminados `authStore.ts`, `filesStore.ts`, `reportsStore.ts`, `navigation.ts`
* **styles:** Eliminados ~13 archivos SCSS de admin/dashboard
* **deps:** Eliminadas dependencias `firebase-admin`, `@nanostores/persistent`, `nanostores`, `quill`

### Changed

* **login:** Simplificado sin redirect basado en rol (redirige a `/` en todos los casos)
* **login:** Cambiado layout de `AuthLayout` a `MainLayout` (con header/footer ocultos)
* **auth-utils:** Eliminada lógica de cookies SSR
* **api-client:** Simplificado (eliminada lógica de token por cookie)
* **api:** Eliminados 10 métodos admin del cliente API generado
* **support:** Limpiadas referencias a rol admin en componentes de tickets
* **SCSS:** Limpiados `@forward` de admin/dashboard en índices SCSS

### Notas

- La landing pública (home, blog, diagnóstico, metodología, servicios, política, contacto, formularios) funciona sin cambios.
- La página `/login` se mantiene pero redirige a home tras autenticación (sin distinción admin/client).

## [1.5.0] - 2026-06-17

### Features

* **build:** Migración a Static Site Generation (SSG) puro para despliegue en Hostinger
* **blog:** Blog completamente estático usando datos locales JSON (`src/data/blog-posts.json`)
* **build:** Eliminado adapter `@astrojs/node` y configuración SSR (`output: 'server'` → `output: 'static'`)

## [1.4.0](https://github.com/GabrielZavando/WebAgenciaAstro/compare/landing-page-v1.3.1...landing-page-v1.4.0) (2026-03-25)


### Features

* add idea submission form and admin moderation interface ([15d660c](https://github.com/GabrielZavando/WebAgenciaAstro/commit/15d660c7e4cf3d0f1b5c10ba9a5d1fdd4ccd0ffc))
* add UI for files, reports, and support in dashboard and admin ([2809959](https://github.com/GabrielZavando/WebAgenciaAstro/commit/2809959ca7c2901d0fe57fd6168e86c076b4be7d))
* **admin:** unifica creación y edición de posts del blog y mejoras generales ([8984c87](https://github.com/GabrielZavando/WebAgenciaAstro/commit/8984c8732e4474f7e952c03e0db85d451f5a7341))
* **anti-spam:** Cloudflare Turnstile, Double Opt-In y campaña de re-confirmación ([90c97e3](https://github.com/GabrielZavando/WebAgenciaAstro/commit/90c97e3f115ffb539708cf85eeba1c9851a1a085))
* **blog:** refactor blog views to SSR with vanilla JS, improve UI, translate anchors and add dynamic sitemap ([c8e6052](https://github.com/GabrielZavando/WebAgenciaAstro/commit/c8e60527e95bc76755eb6fd3fed9aff7b09d8f88))
* **components:** mejora implementación de modales y sistema de diseño ([7f6a5b9](https://github.com/GabrielZavando/WebAgenciaAstro/commit/7f6a5b9ce574e5fce4b3535cc92adb58a74d4079))
* dashboard improvements, card reordering, and rebranding to Gabriel Zavando ([326fcff](https://github.com/GabrielZavando/WebAgenciaAstro/commit/326fcff7277936aa1e3033abb0531fcd05379adb))
* Implementación completa del sistema de diseño flat y workflow infográfico ([8af0749](https://github.com/GabrielZavando/WebAgenciaAstro/commit/8af074977c4f080289cebfc7b233ecc2161ccfd9))
* refactor responsivo y actualización de tokens ([9a2037b](https://github.com/GabrielZavando/WebAgenciaAstro/commit/9a2037bfe82a918abcd64ea96dd18d817a903604))
* standardize dashboard popups and enhance UI components ([a85977c](https://github.com/GabrielZavando/WebAgenciaAstro/commit/a85977cbf0c8d7fdb0fbad9fddf0d55b923f0924))
* **support:** UI updates for project-centric ticket quotas ([b97ee9d](https://github.com/GabrielZavando/WebAgenciaAstro/commit/b97ee9d5e951e01d3b76b666e9c19ae092be5f2d))
* **ui:** unified search component, firebase i18n auth reset, and round ticket spinners ([994fde3](https://github.com/GabrielZavando/WebAgenciaAstro/commit/994fde33bc02102dba44bf29b5614dc19a637408))


### Bug Fixes

* **blog:** remove literal script/style tags from comments to fix astro compiler bug ([f478edd](https://github.com/GabrielZavando/WebAgenciaAstro/commit/f478edd6071191041d3ef290cffb67ef47278d42))
* resolve global window types for modal helpers in TypeScript ([46d5956](https://github.com/GabrielZavando/WebAgenciaAstro/commit/46d5956650b579f71aa3153c3c19f78b761f0aff))

## [1.0.2] - 2025-10-27
### Añadido
- Nueva imagen de perfil `src/assets/img/gabriel.jpeg`.
- Documentación interna para IA en `.github/copilot-instructions.md` (no afecta al runtime).

### Cambiado
- Actualizaciones de contenido en `src/data/services.json` y `src/data/plans.json`.
- Mejoras y ajustes en secciones: `About.astro`, `Banner.astro`, `Contact.astro`, `Plans.astro`, `Services.astro`, `Workflow.astro`.
- Ajustes de componentes: `Modal.astro`, `ServiceCard.astro` y `shared/Header.astro`.
- Refinamientos de estilos en `styles/components/header.scss` y variables/transiciones en `styles/foundation/_root.scss`.

### Nota
- Se mantiene la arquitectura SCSS de 5 capas y el sistema unificado de animaciones mediante `IntersectionObserver`.

## [1.0.1] - 2025-08-29
### Cambiado
- Ajustes en `Banner.astro` y mejoras en estilos base (`_tokens.scss`, `_root.scss`).

### Eliminado
- Limpieza de iconos y SVG no utilizados en `src/assets/img`.

### Nota
- Realineación de versionado: se continúa desde `1.0.0` definido en `package.json`.

## [0.1.0] - 2025-08-11
### Añadido
- Nuevo breakpoint `xxs (400px)` para mejorar tipografía y escalado en móviles muy pequeños.
- Variables CSS para alturas de header y `scroll-padding-top` (mejor experiencia de anclaje interno).

### Cambiado
- Refactor responsivo general: ajustes de grids (Servicios pasa a 1→2→4 columnas, reorganización de Workflow y otras secciones).
- Breakpoint `md` ajustado a `820px` (optimización para tablets verticales modernas).
- Padding del contenedor incrementado (`container: 1.5rem`) para lograr consistencia visual.
- Reescritura de gran parte de `Workflow.astro` (80%) para un layout de grid más flexible.
- Normalización de comentarios y uso de mixins `respond-to` en componentes.

### Mejorado
- Cohesión de design tokens y mapas (`_tokens.scss`) para futura extensibilidad (i18n, dark mode avanzado, accesibilidad).
- Estructura de variables contextuales en `_root.scss` preparada para mejoras de accesibilidad (focus management en modales y skip links futuros).

### Próximos pasos (no incluidos en esta versión)
- SEO (meta OG/Twitter, sitemap, JSON-LD servicios y planes).
- Accesibilidad de modales (focus trap / aria-describedby / retorno de foco).
- Sanitización de iconos (remplazar `set:html` por componente seguro SVG).
- Refactor JS modular (centralizar lógica de modales y toggles de UI).

---

[1.0.1]: https://github.com/GabrielZavando/WebAgenciaAstro/releases/tag/v1.0.1
[1.0.2]: https://github.com/GabrielZavando/WebAgenciaAstro/releases/tag/v1.0.2
[0.1.0]: https://github.com/GabrielZavando/WebAgenciaAstro/releases/tag/v0.1.0
