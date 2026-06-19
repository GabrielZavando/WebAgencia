# Contenido del archivo README.md

# Agencia Digital

Este proyecto es una landing page para una agencia digital. La página incluye secciones para presentar los servicios ofrecidos, información sobre la agencia, ejemplos de trabajos realizados y un formulario de contacto.

**Arquitectura:** Static Site Generation (SSG) con Astro 5. Despliegue como archivos estáticos en Hostinger.

## Estructura del Proyecto

- **src/components**: Contiene los componentes reutilizables de la landing page.
- **src/layouts**: Define el diseño general de la página.
- **src/pages**: Contiene las páginas de la aplicación, incluyendo la página principal.
- **src/styles**: Contiene los estilos globales para la landing page.
- **src/data**: Datos estáticos (blog posts, services, plans).
- **public**: Archivos estáticos que se sirven directamente.
- **astro.config.mjs**: Configuración del proyecto Astro (output: 'static').
- **package.json**: Configuración de npm para las dependencias y scripts del proyecto.

## Instalación

Para instalar las dependencias del proyecto, ejecuta:

```
npm install
```

## Ejecución

Para iniciar el servidor de desarrollo, ejecuta:

```
npm run dev
```

## Construcción

Para construir el proyecto para producción (genera archivos estáticos en `dist/`):

```
npm run build
```

## Despliegue en Hostinger (Static Hosting)

1. Ejecutar `npm run build` - genera carpeta `dist/` con archivos estáticos
2. Subir contenido de `dist/` al directorio público de Hostinger (public_html)
3. Configurar dominio para servir `index.html` como página por defecto
4. No requiere configuración especial de rutas (todo es HTML plano)

### Variables de Entorno Requeridas

Crear archivo `.env` basado en `.env.example`:

```env
PUBLIC_API_BASE_URL=https://tu-api-ligera.com
PUBLIC_TURNSTILE_SITE_KEY=tu-turnstile-site-key
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_STORAGE_BUCKET=...
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
PUBLIC_FIREBASE_APP_ID=...
PUBLIC_TURNSTILE_SITE_KEY=...
PUBLIC_SITE_URL=https://tu-dominio.com
PUBLIC_GTM_ID=GTM-XXXXXXXX
```

### Notas Importantes

- **Blog:** Usa datos locales en `src/data/blog-posts.json`. Para actualizar, editar este archivo o sincronizar desde CMS/API externa.
- **Formularios:** Contacto y Newsletter son islas client-side que llaman a API Ligera (`/api/v1/leads/contact`, `/api/v1/leads/subscribe`).
- **Sitemap:** Se genera automáticamente en build (`dist/sitemap.xml`).
- **Login:** Página de inicio de sesión disponible en `/login/` (redirige a home tras autenticarse).

## Licencia

Este proyecto está bajo la Licencia MIT.

## Versionado en `CHANGELOG.md`. Versión actual: `v1.6.0`.