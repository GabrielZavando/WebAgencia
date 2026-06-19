## 1. Configuración Astro para SSG

- [x] 1.1 Modificar `astro.config.mjs`: cambiar `output: 'server'` a `output: 'static'`
- [x] 1.2 Eliminar import y uso de `@astrojs/node` adapter en `astro.config.mjs`
- [x] 1.3 Remover configuración `server` block (port, host) de `astro.config.mjs`
- [x] 1.4 Verificar que `vite.plugins` solo incluya `tailwindcss()`

## 2. Actualización de dependencias

- [x] 2.1 Eliminar `@astrojs/node` de `dependencies` en `package.json`
- [x] 2.2 Ejecutar `npm install` (o `pnpm install`) para actualizar `package-lock.json` / `pnpm-lock.yaml`
- [x] 2.3 Verificar que no queden referencias a `@astrojs/node` en lockfiles

## 3. Variables de entorno y tipos

- [x] 3.1 Revisar `.env.example` - confirmar que `PUBLIC_API_BASE_URL` y `PUBLIC_TURNSTILE_SITE_KEY` están presentes
- [x] 3.2 Revisar `src/env.d.ts` - confirmar tipado de `PUBLIC_API_BASE_URL` y `PUBLIC_TURNSTILE_SITE_KEY`
- [x] 3.3 Si faltan, añadir variables necesarias a ambos archivos

## 4. Build y verificación local

- [x] 4.1 Ejecutar `npm run build` y verificar que completa sin errores
- [x] 4.2 Verificar que `dist/` contiene solo archivos estáticos (HTML, CSS, JS, assets)
- [x] 4.3 Verificar existencia de rutas públicas en `dist/`:
  - [x] `dist/index.html` (home)
  - [x] `dist/blog/index.html` (blog index)
  - [x] `dist/blog/*/index.html` (blog posts - al menos uno)
  - [x] `dist/diagnostico/index.html`
  - [x] `dist/politica-de-privacidad/index.html`
  - [x] `dist/404.html`
  - [x] `dist/suscripcion-confirmada/index.html`
  - [x] `dist/unsubscribe/index.html`
- [x] 4.4 Verificar que assets (imágenes, fuentes, CSS) están en `dist/_astro/` y `dist/assets/`

## 5. Testing funcional local

- [ ] 5.1 Ejecutar `npm run preview` o `npx serve dist` para servir build estático
- [ ] 5.2 Probar navegación: home → blog index → blog post → diagnóstico → política
- [ ] 5.3 Verificar formulario de contacto: validación, Turnstile, envío (simulado si no hay API)
- [ ] 5.4 Verificar formulario newsletter en footer: validación, Turnstile, envío
- [ ] 5.5 Verificar theme switcher: toggle dark/light, persistencia en localStorage
- [ ] 5.6 Verificar search en blog: filtrado client-side funciona

## 6. Tests automatizados

- [x] 6.1 Ejecutar `npm run test` (unit tests) - verificar que pasan
- [x] 6.2 Ejecutar `npm run test:e2e` (Playwright) - actualizar tests si fallan por cambio a SSG
- [x] 6.3 Verificar coverage no ha bajado significativamente

## 7. Validación de rutas admin/dashboard (documentación)

- [x] 7.1 Verificar que `dist/admin/` y `dist/dashboard/` se generan como HTML estático
- [x] 7.2 Documentar en CHANGELOG/ADR que estas rutas NO tienen protección real en SSG
- [x] 7.3 Confirmar que middleware no se ejecuta (no hay servidor)

## 8. Documentación y limpieza

- [x] 8.1 Actualizar `README.md` con instrucciones de deploy estático (Hostinger)
- [x] 8.2 Actualizar `CHANGELOG.md` con versión y cambios (output: static, removed @astrojs/node)
- [x] 8.3 Verificar `.gitignore` incluye `dist/` (si no estaba)
