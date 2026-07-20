## Why

La página de login aún no replica con fidelidad el mockup `inicio-sesion.png`, y mezcla estilos locales que dificultan consistencia y mantenimiento. Se necesita una implementación exacta del diseño, pero expresada con utilidades Tailwind y respetando los tokens/capas visuales del sistema de diseño del proyecto.

## What Changes

- Rediseñar `/login` para que coincida visualmente con `inicio-sesion.png` (estructura, jerarquía, espaciados, iconografía, footer y tratamiento del fondo).
- Reescribir el layout visual del login usando utilidades Tailwind en el componente/página en lugar de clases CSS específicas de login.
- Implementar capa transparente sobre la imagen de fondo usando el mismo patrón visual del banner de Inicio (overlay con gradiente tokenizado).
- Generar y añadir una nueva imagen de fondo optimizada para login (`src/assets/img/login-bg-generated.webp` o `.jpg`).
- Mantener funcionalidad existente de autenticación (validación, honeypot, rate limit, Turnstile y flujos de error) sin cambios funcionales.
- Actualizar documentación de componentes para reflejar el patrón final de Login con Tailwind + overlay + fondo generado.

## Capabilities

### New Capabilities
- `login-tailwind-mockup`: Implementación visual exacta del login según mockup, usando Tailwind utilities y overlay transparente sobre imagen de fondo generada.

### Modified Capabilities
- Ninguna.

## Impact

- **Código afectado**: `src/pages/login/index.astro`, `src/components/auth/LoginForm.tsx` (solo capa visual/estructura de clases).
- **Assets**: nuevo fondo generado en `src/assets/img/`.
- **Documentación**: `docs/design-components.md` (sección LoginPage).
- **Dependencias**: no se agregan nuevas dependencias npm; se usan herramientas ya disponibles para generar/optimizar imagen.
- **Riesgo**: medio-bajo (cambio visual amplio sin alterar lógica de negocio).
