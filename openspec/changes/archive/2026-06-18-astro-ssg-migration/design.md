## Context

El proyecto WebAgenciaAstro es una landing page para agencia digital construida con Astro 5, TypeScript, Tailwind CSS. Actualmente configurada como SSR (`output: 'server'`) usando `@astrojs/node` adapter en modo standalone, desplegada en Google Cloud Run. Incluye:
- Páginas públicas: home, blog (index + posts dinámicos), diagnóstico, política de privacidad, suscripción confirmada, unsubscribe
- Área privada: `/admin/**` (gestión blog, usuarios, proyectos, tickets, clientes, informes, archivos, configuración) y `/dashboard/**` (perfil, proyectos, soporte, ideas, herramientas, archivos)
- Middleware de autenticación basado en Firebase Auth (session cookies)
- Blog que hace fetch a API externa en build time (`PUBLIC_API_BASE_URL`)
- Formularios de contacto y newsletter como islas client-side con validación anti-spam y Turnstile

## Goals / Non-Goals

**Goals:**
1. Cambiar `astro.config.mjs` a `output: 'static'` y remover `@astrojs/node`
2. Eliminar `@astrojs/node` de `package.json` dependencias
3. Verificar que `npm run build` genere solo archivos estáticos en `dist/`
4. Mantener funcionando todas las rutas públicas existentes (home, blog, diagnóstico, diagnóstico, política, 404)
5. Que el build pase sin errores de prerenderizado

**Non-Goals:**
- Eliminar o modificar middleware de autenticación (`src/middleware.ts`)
- Eliminar o modificar rutas `/admin/**` y `/dashboard/**`
- Cambiar la lógica del blog (fetch en build time a API externa)
- Modificar formularios de contacto o newsletter
- Eliminar Firebase Admin/Client de dependencias
- Cambiar estilos, componentes, o lógica de negocio
- Configurar headers de caché, redirects, o rewrites para hosting estático

## Decisions

### 1. Cambiar `output: 'static'` sin adapter
**Decisión:** Remover completamente el adapter `@astrojs/node` y usar `output: 'static'` nativo de Astro.
**Razón:** Es la forma estándar de Astro para SSG puro. El adapter node solo es necesario para SSR/Edge.
**Alternativa considerada:** Mantener adapter con `output: 'static'` - pero esto añade dependencia innecesaria.

### 2. Manejo de rutas dinámicas del blog (`[...slug].astro`)
**Decisión:** Mantener la página `src/pages/blog/[...slug].astro` tal cual. Astro en modo static intentará prerenderizar todas las rutas. Como el blog hace fetch a API externa en el frontmatter, funcionará en build time siempre que la API esté accesible.
**Razón:** El usuario indicó no modificar el blog. Si la API no está disponible en build, el build fallará - esto es comportamiento esperado y se documentará.
**Riesgo:** Build falla si API externa no responde. **Mitigación:** Documentar requisito de API disponible en CI/CD.

### 3. Middleware y rutas protegidas en SSG
**Decisión:** Mantener `src/middleware.ts` y las rutas `/admin/**`, `/dashboard/**` en el código. En SSG, el middleware no se ejecuta (no hay servidor). Las páginas se generarán como HTML estático pero sin protección real.
**Razón:** Usuario indicó no modificar admin/dashboard. Esto evita breaking changes en el código.
**Trade-off:** Páginas admin se generarán como HTML estático accesible públicamente. **Mitigación:** Documentar que en SSG no hay protección real; requerirá trabajo futuro (eliminar rutas o migrar a API separada).

### 4. Variables de entorno en build
**Decisión:** Asegurar que `PUBLIC_API_BASE_URL` y `PUBLIC_TURNSTILE_SITE_KEY` estén disponibles en build time (ya son `PUBLIC_*` así que Astro las inyecta).
**Razón:** El blog y formularios las necesitan en build/client.

## Risks / Trade-offs

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Build falla si API externa (blog) no responde en CI/CD | Build roto | Documentar requisito; configurar mock/fallback en CI si necesario |
| Rutas admin generadas como HTML estático público | Seguridad (info expuesta) | Documentar limitación; no es objetivo de este change |
| Middleware no ejecuta en producción | Auth bypass en rutas admin | Fuera de scope; documentar |
| `astro preview` no replica SSR behavior | Testing local limitado | Usar `npm run build && npx serve dist` para validar |

## Migration Plan

1. **Pre-build:** Verificar `PUBLIC_API_BASE_URL` accesible desde entorno de build
2. **Cambio config:** Modificar `astro.config.mjs` y `package.json`
3. **Build local:** `npm run build` → verificar `dist/` solo estáticos
4. **Test local:** `npm run preview` o `npx serve dist` → validar rutas públicas
5. **Deploy:** Subir `dist/` a Hostinger
6. **Rollback:** Revertir `astro.config.mjs` y `package.json` → rebuild → redeploy container

## Open Questions

1. ¿La API externa del blog (`PUBLIC_API_BASE_URL`) estará accesible desde el entorno de build de CI/CD (GitHub Actions, etc.)?
2. ¿Se necesita configurar `_redirects` o `_headers` para Hostinger (SPA fallback, cache headers)?
3. ¿Las imágenes en `/public` y `src/assets` se optimizan correctamente con `sharp` en build estático?
