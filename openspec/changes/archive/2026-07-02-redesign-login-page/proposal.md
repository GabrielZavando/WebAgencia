# Proposal: Rediseño Login Page

## Resumen

Mejorar la experiencia de usuario y branding del Login page (`/login`) sin cambiar textos existentes. El cambio incluye mejoras visuales, funcionalidad "Recordarme", y animaciones sutiles.

## Problema

La página de login actual es funcional pero carece de:
- Diferenciación visual como panel administrativo
- Feedback visual durante autenticación (loading, error, success)
- Funcionalidad "Recordarme" para persistir email
- Animaciones que mejoren la experiencia de usuario

## Solución

### 1. Branding Developer (sutil)
- Agregar icono `admin_panel_settings` junto al título "Bienvenido"
- Agregar tagline "Acceso administrativo" bajo el subtítulo
- Mantener textos existentes en español

### 2. Formulario Mejorado
- Checkbox "Recordarme" en la misma línea que "¿Olvidaste tu contraseña?"
- Persistir email en localStorage cuando "Recordarme" está activo
- Loading states: spinner en botón + deshabilitar campos durante auth
- Error feedback: bordes rojos animados + shake animation
- Success state: check verde momentáneo antes de redirect

### 3. Animaciones
- Logo glow pulse en magenta al cargar página
- Card entrance: fade-in + scale (0.98 → 1)
- Mantener glow existente en input focus

### 4. Responsive
- Card max-width adaptativo para pantallas <380px
- Footer: cambiar de sticky a flex-shrink-0 para evitar overlap

## Alcance

### Incluido
- Modificaciones en `src/pages/login/index.astro`
- Modificaciones en `src/components/auth/LoginForm.tsx`
- Modificaciones en `src/styles/global.css`

### No incluido
- Funcionalidad "¿Olvidaste tu contraseña?" (queda para futuro)
- Cambios a otros componentes del sitio
- Nuevos endpoints de API

## Restricciones

- No cambiar textos existentes (mantener en español)
- Mantener gradient overlay actual (magenta → violeta)
- Usar tokens del design system existente
- Cumplir WCAG AA (contraste ≥4.5:1)
- Usar `forcedTheme="dark"` (no cambiar)

## Métricas de Éxito

- Login funcional con "Recordarme" persistiendo en localStorage
- Animaciones suaves sin impacto en rendimiento
- Build passing (`pnpm build`)
- Tests passing (`pnpm test`)
- Responsive en mobile, tablet, desktop

## Dependencias

- Ninguna dependencia nueva
- Usar Material Icons existente (`admin_panel_settings`)
- Usar tokens CSS existentes

## Riesgos

- **Bajo**: Animaciones pueden afectar rendimiento en dispositivos antiguos → Mitigar con `prefers-reduced-motion`
- **Bajo**: localStorage puede no estar disponible → Mitigar con try/catch

## Timeline

- Implementación: ~2-3 horas
- Testing: ~30 minutos
- Total: ~3 horas
