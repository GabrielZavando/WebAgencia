# Agencia Digital

Landing page SSG con Astro 5. Despliegue estático en Hostinger.

**Arquitectura:** Static Site Generation (SSG) con Astro 5. Despliegue como archivos estáticos en Hostinger.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 5 (output: `static`) |
| CSS | Tailwind CSS 4 + SCSS 5-capas |
| Testing | Vitest + Playwright |
| Package Manager | pnpm |

## Instalación

```bash
pnpm install
```

## Comandos

| Comando | Descripción |
|---------|------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build estático a `dist/` |
| `pnpm preview` | Vista previa del build |
| `pnpm test` | Tests unitarios Vitest |
| `pnpm test:e2e` | Tests E2E Playwright |
| `pnpm test:validation` | Validación SSG completa |
| `bash scripts/validate-ssg.sh` | Suite completa con resumen |

## Despliegue (Hostinger)

1. `pnpm build` → genera `dist/`
2. Subir `dist/` a `public_html` vía FTP
3. Sin configuración especial de rutas (HTML plano)

## Variables de Entorno

Ver `.env.example`. Requeridas: `PUBLIC_API_BASE_URL`, `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_SITE_URL`, `PUBLIC_GTM_ID`, y variables de Firebase para login.

### Desarrollo Local con API Local

Para desarrollar con la API NestJS corriendo localmente:

1. **Crear `.env.local`** (copiar de `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

2. **Configurar variables para local**:
   ```env
   PUBLIC_API_URL=http://localhost:3000/api/v1
   PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
   PUBLIC_SITE_URL=http://localhost:4321
   PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
   ```

3. **Configurar Firebase** (credenciales de tu proyecto):
   ```env
   PUBLIC_FIREBASE_API_KEY=AIza...
   PUBLIC_FIREBASE_AUTH_DOMAIN=api-web-agencia.firebaseapp.com
   PUBLIC_FIREBASE_PROJECT_ID=api-web-agencia
   PUBLIC_FIREBASE_STORAGE_BUCKET=api-web-agencia.firebasestorage.app
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=31988183470
   PUBLIC_FIREBASE_APP_ID=1:31988183470:web:...
   ```

4. **Iniciar la API NestJS** (en el directorio del backend):
   ```bash
   cd ../Api
   npm run start:dev
   ```

5. **Iniciar el frontend** (en este directorio):
   ```bash
   pnpm dev
   ```

6. **Probar login** en `http://localhost:4321/login`

### Producción

Para producción, usar las URLs de Cloud Run en `.env.local`:
```env
PUBLIC_API_URL=https://nestjs-api-XXXXXXXXXX.us-central1.run.app
PUBLIC_API_BASE_URL=https://nestjs-api-XXXXXXXXXX.us-central1.run.app
PUBLIC_SITE_URL=https://tu-dominio.com
PUBLIC_TURNSTILE_SITE_KEY=tu_key_real_de_produccion
```

## Estructura

```
src/
  components/   → Componentes .astro
  layouts/      → MainLayout.astro
  pages/        → Rutas del sitio (11 páginas)
  lib/          → api-client.ts (fetch-based)
  utils/        → Utilidades (config, theme, math)
  scripts/      → Vanilla TS para interactividad
  styles/       → global.css
  assets/       → Imágenes optimizadas
  config/       → company.config.ts
  data/         → JSON estáticos (servicios, planes, menú)
```

## Licencia

MIT
