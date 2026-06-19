## Context

El proyecto migró a SSG puro (output: 'static') en el cambio anterior. Las rutas `/admin/*` y `/dashboard/*` se generan como HTML estático sin protección de autenticación real (el middleware no se ejecuta sin servidor). Se decidió eliminar completamente estas áreas privadas para reducir complejidad, eliminar código muerto y dependencias de servidor.

Actualmente existen ~70 archivos relacionados con admin/dashboard: páginas, componentes, layouts, scripts, middleware, stores, estilos SCSS y datos de navegación. La landing pública (home, blog, formularios, diagnóstico) debe permanecer intacta.

## Goals / Non-Goals

**Goals:**
- Eliminar todas las rutas `/admin/*` (24 páginas) y `/dashboard/*` (9 páginas)
- Eliminar layouts privados (`DashboardLayout.astro`, `AuthLayout.astro`)
- Eliminar componentes exclusivos (`src/components/admin/*`, `src/scripts/dashboard/*`, `src/scripts/proyectos/*`)
- Eliminar middleware de autenticación y Firebase Admin SDK
- Eliminar stores de auth y datos de navegación privada
- Eliminar estilos SCSS de admin/dashboard (~13 archivos)
- Limpiar referencias a roles/layouts privados en componentes compartidos
- Simplificar login sin redirects basados en rol
- Eliminar dependencias `firebase-admin`, `firebase`, `@nanostores/persistent`
- La landing pública debe seguir build y funcionamiento correctos

**Non-Goals:**
- No se modifica la API Ligera externa (NestJS)
- No se modifican formularios de contacto/newsletter
- No se modifica el blog ni su funcionamiento SSG
- No se refactoriza la lógica de componentes compartidos más allá de limpiar referencias a admin/dashboard

## Decisions

| Decisión | Opción Elegida | Alternativas | Razón |
|----------|---------------|--------------|-------|
| Estrategia de eliminación | Eliminar archivos directamente + limpiar imports | Mover a directorio `_disabled/` | Los archivos no serán necesarios nunca más; mantenerlos como "disabled" añade ruido y confusión |
| Login page | Mantener `login.astro` pero simplificado (sin redirect por rol, redirige a home) | Eliminar completamente | La página de login podría servir para futura autenticación client-side; por ahora redirige a home |
| Componentes support | Limpiar referencias a `role === 'admin'` y layout DashboardLayout; mantener funcionalidad base | Eliminar completamente | Los tickets podrían exponerse vía client-side en el futuro; el código base es útil |
| SCSS admin | Eliminar archivos y sus `@forward` en los `_index.scss` | Mantener pero no importar | Sin páginas que los usen, son código muerto que aumenta el bundle |
| API Client (`src/api/index.ts`) | Eliminar solo los métodos admin; mantener el resto | Regenerar desde cero | El cliente genera ~10 métodos admin; el resto (blog, forms) aún se usa o se usará |
| Dependencia `firebase` | Eliminar si no hay otro consumo | Mantener si otros módulos lo usan | Verificar antes de eliminar; si solo lo usaba auth store, se elimina |
| `getStaticPaths` en admin/dashboard | Eliminar archivos → los getStaticPaths vacíos desaparecen con ellos | N/A | Los getStaticPaths vacíos eran un parche para que el build no fallara; al eliminar las rutas, se elimina el parche |

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| [Alto] Eliminar un archivo que aún es importado desde la landing pública → build falla | Buscar todas las referencias cruzadas antes de eliminar. Usar el build como verificación final |
| [Medio] Alguien accede directamente a `/admin` o `/dashboard` en producción → 404 (esperado, pero puede confundir) | No hay mitigación necesaria; es el comportamiento deseado tras la eliminación |
| [Medio] Eliminar `firebase` client SDK si aún lo usa forms/contact | Verificar imports en formularios antes de eliminar |
| [Bajo] Los componentes support (tickets) pierden funcionalidad admin | Ya no hay usuarios admin, solo clientes; limpiar referencias es suficiente |
| [Bajo] El build genera páginas 404 para rutas que antes existían — afecta SEO | Estas rutas tenían meta noindex por ser privadas; no hay impacto SEO |
