## REMOVED Requirements

### Requirement: Admin pages
The system SHALL serve admin management pages under `/admin/*` with authentication middleware.

**Reason**: La arquitectura migró a SSG puro. No hay servidor que ejecute middleware de autenticación. Las páginas admin se generaban como HTML estático sin protección real.

**Migration**: Las funcionalidades admin serán provistas por la API Ligera externa (NestJS) cuando esté disponible. No hay reemplazo directo en el frontend estático.

#### Scenario: Acceso a /admin/index.html genera 404
- **GIVEN** un sitio desplegado en SSG
- **WHEN** un usuario navega a `/admin/` o cualquier ruta `/admin/*`
- **THEN** el servidor devuelve 404 (página no encontrada)

### Requirement: Dashboard pages
The system SHALL serve client dashboard pages under `/dashboard/*` with authentication middleware.

**Reason**: Misma razón que admin pages. No hay servidor que ejecute middleware. Las páginas dashboard se generaban como HTML estático sin protección real.

**Migration**: Las funcionalidades de cliente serán provistas por la API Ligera externa (NestJS). No hay reemplazo directo en el frontend estático.

#### Scenario: Acceso a /dashboard/index.html genera 404
- **GIVEN** un sitio desplegado en SSG
- **WHEN** un usuario navega a `/dashboard/` o cualquier ruta `/dashboard/*`
- **THEN** el servidor devuelve 404 (página no encontrada)

### Requirement: Middleware de autenticación
The system SHALL protect `/admin/*` and `/dashboard/*` routes using Firebase Auth middleware on the server.

**Reason**: SSG no ejecuta middleware. Firebase Admin SDK (`firebase-admin`) ya no tiene uso en el proyecto.

**Migration**: Eliminar `src/middleware.ts` y `src/lib/firebase/server.ts`. Eliminar dependencia `firebase-admin` de `package.json`.

#### Scenario: Middleware no se ejecuta en build
- **GIVEN** un proyecto Astro configurado con `output: 'static'`
- **WHEN** se ejecuta `npm run build`
- **THEN** el archivo `src/middleware.ts` no es invocado durante la generación de páginas
- **AND** el build completa sin errores aunque el middleware esté eliminado

### Requirement: Roles de usuario (admin / client)
The system SHALL distinguish between admin and client user roles for routing and UI rendering.

**Reason**: Sin páginas privadas que consuman el rol, la distinción admin/client no tiene propósito en el frontend estático.

**Migration**: Eliminar referencias a `role === 'admin'` en componentes compartidos. Simplificar `login.astro` sin redirect basado en rol.

#### Scenario: Login redirige a home sin importar el rol
- **GIVEN** un usuario que inicia sesión
- **WHEN** el login detecta el rol del usuario
- **THEN** redirige a `/` (home) independientemente de si el rol es `admin` o `client`

## ADDED Requirements

### Requirement: Landing pública funciona sin cambios
The system SHALL continue serving all public pages (home, blog, diagnóstico, política de privacidad, contacto, newsletter, 404, suscripción-confirmada, unsubscribe) exactly as before.

#### Scenario: Build genera todas las rutas públicas
- **GIVEN** el proyecto sin archivos admin/dashboard
- **WHEN** se ejecuta `npm run build`
- **THEN** el directorio `dist/` contiene las mismas rutas públicas que antes de la eliminación
- **AND** no contiene rutas `/admin/` ni `/dashboard/`

#### Scenario: Navegación pública funciona
- **GIVEN** el sitio desplegado en SSG
- **WHEN** un usuario navega desde home → blog → post → diagnóstico → política de privacidad
- **THEN** todas las páginas se renderizan correctamente con su contenido completo

### Requirement: Formularios de contacto y newsletter funcionan
The system SHALL keep contact and newsletter forms working as client-side islands with Cloudflare Turnstile.

#### Scenario: Envío de formulario de contacto
- **GIVEN** un usuario en la página de contacto
- **WHEN** completa el formulario y pasa Turnstile
- **THEN** el formulario envía los datos a la API Ligera (`POST /api/v1/leads/contact`)
- **AND** muestra feedback de éxito o error al usuario

#### Scenario: Suscripción a newsletter
- **GIVEN** un usuario en el footer o página de suscripción
- **WHEN** ingresa su email y pasa Turnstile
- **THEN** el formulario envía los datos a la API Ligera (`POST /api/v1/leads/subscribe`)
- **AND** redirige a `/suscripcion-confirmada/`

### Requirement: Blog SSG funciona con datos locales
The system SHALL keep the blog working as SSG with local JSON data (`src/data/blog-posts.json`).

#### Scenario: Blog index muestra lista de posts
- **GIVEN** el sitio construido en SSG
- **WHEN** un usuario navega a `/blog/`
- **THEN** ve la lista de posts desde `src/data/blog-posts.json`

#### Scenario: Post individual se renderiza
- **GIVEN** el sitio construido en SSG
- **WHEN** un usuario navega a `/blog/<slug>/`
- **THEN** ve el contenido completo del post correspondiente

### Requirement: Dependencias de servidor eliminadas
The system SHALL NOT have server-side dependencies (`firebase-admin`, `@astrojs/node`) in `package.json`.

#### Scenario: Build exitoso sin dependencias de servidor
- **GIVEN** `package.json` sin `firebase-admin` ni `@astrojs/node`
- **WHEN** se ejecuta `npm install` y luego `npm run build`
- **THEN** el build completa sin errores
- **AND** el bundle resultante es solo HTML/CSS/JS estáticos

### Requirement: Sin estilos muertos de admin/dashboard
The system SHALL NOT include SCSS styles exclusive to admin/dashboard in the build output.

#### Scenario: Build sin estilos admin
- **GIVEN** que se eliminaron los archivos SCSS de admin/dashboard y sus `@forward`
- **WHEN** se ejecuta `npm run build`
- **THEN** el CSS generado no contiene clases como `.admin-*`, `.dashboard-*`
- **AND** los estilos públicos (landing, blog, formularios) se mantienen intactos
