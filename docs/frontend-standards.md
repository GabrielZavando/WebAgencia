# Frontend Standards — WebAgenciaAstro

> Stack frontend específico de este proyecto.

## Componentes

- Un componente = una responsabilidad
- Props tipadas explícitamente, sin `any`
- Componentes `.astro` por defecto (zero-JS en build)
- React Islands SOLO cuando se requiere estado cliente complejo o hidratación
- Nombres de componentes en PascalCase, archivos `.astro` o `.tsx`
- Componentes presentacionales separados de contenedores con lógica

## UI/UX

- Accesibilidad: ARIA labels en elementos interactivos
- Estados de carga (skeleton), error y vacío siempre implementados
- Formularios con validación client-side y feedback de error visible
- Mobile-first, diseño responsivo obligatorio
- Nunca mostrar datos parciales al usuario
- Tema claro/oscuro gestionado en `MainLayout` con `forcedTheme` y persistido en localStorage
- Animaciones fade-in vía clase `.fade-in` + `IntersectionObserver` (clase `animate`)

## Gestión de estado

- **Default**: Componentes `.astro` (sin estado runtime)
- **React Islands**: Estado local (`useState`) para estado de UI temporal
- **Sin state global**: Este proyecto no usa Redux/Zustand/Pinia. Si surge necesidad, proponer en OpenSpec.
- No duplicar estado: single source of truth
- Side effects en `useEffect` o event handlers, nunca directamente en el cuerpo de componentes

## CSS

- **Estrategia: Tailwind utility-first** para componentes nuevos y admin
- Tailwind 4 vía plugin `@tailwindcss/vite`
- `src/styles/global.css` contiene tokens + componentes legacy BEM
- **Objetivo**: reducir `global.css` migrando componentes a Tailwind utility-first
- Componentes legacy usan BEM en `global.css` — migrar a Tailwind cuando se modifiquen
- **NO** crear SCSS modules nuevos
- Tokens vía CSS custom properties (variables) en bloque `@theme` de Tailwind + `:root`

## Testing frontend

- **Unit / validación**: Vitest (`globals: true`, `environment: 'jsdom'`)
- **E2E**: Playwright (inicia `pnpm dev` automáticamente)
- **Validación de build**: `pnpm test:validation` (requiere `dist/`)
- Tests de validación estructurales en `tests/validation/*.test.ts`:
  - `dependency-audit`: bloquea deps nuevas no aprobadas
  - `hostinger-compat`: verifica compatibilidad con hosting estático
  - `lighthouse.config`: configuración de auditoría perf
  - `middleware-detection`: detecta middleware (debe estar ausente)
  - `ssg-build`: valida output SSG
- Cobertura objetivo: 80% en código de features nuevas

## Performance

- Lazy loading de imágenes (`loading="lazy"`, `decoding="async"`)
- Imágenes procesadas por `sharp` (build dependency)
- Bundle JS cliente mínimo: aislar componentes React sólo a páginas que los necesiten
- CSS: Tailwind genera solo las clases usadas (tree-shaking automático)
- Blog: SSR no, CSR sí (posts via fetch en `src/scripts/blog-fetch.ts`)
- Cache de blog: sessionStorage 5 minutos

## Stack específico del proyecto

```
Framework: Astro 5.17.x (output: 'static', SSG, sin adapter)
CSS:       Tailwind CSS 4.2.x (plugin @tailwindcss/vite) + global.css (tokens + legacy BEM en migración)
Islands:   React 18 vía @astrojs/react — uso mínimo, sólo donde se requiera hidratación cliente
Build:     Vite (incluido en Astro)
Tests:     Vitest 4.1.x (unit/validación) + Playwright 1.59.x (E2E)
Package:   pnpm 10 con pnpm.allowBuilds para sharp, @parcel/watcher, esbuild, protobufjs
Deploy:    Hostinger (FTP) — solo HTML estático de dist/
```

## Anti-patterns prohibidos

- ❌ Añadir SSR (`output: 'server'`)
- ❌ Añadir adapters (Node, Vercel, Cloudflare)
- ❌ Usar Firebase / Firebase admin (eliminado en v1.7)
- ❌ Crear stores globales sin aprobación explícita en OpenSpec
- ❌ Añadir frameworks UI pesados (Material, Chakra, Antd)
- ❌ Crear componentes nuevos con BEM en `global.css` (usar Tailwind utility-first)
- ❌ Usar colores genéricos de Tailwind sin mapear a tokens (`bg-pink-500` en vez de `bg-primary`)
