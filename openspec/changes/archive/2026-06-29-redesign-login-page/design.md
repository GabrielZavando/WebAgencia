## Context

**Estado Actual:**
- Página de login existe en `src/pages/login.astro` con diseño genérico
- Componente React `LoginForm.tsx` funciona correctamente con API `/api/v1/auth/login`
- Firebase fue eliminado del proyecto (v1.6-v1.7) - autenticación directa con email/password
- Estilos inline en login.astro sin identidad visual específica
- MainLayout con `hideHeader hideFooter` pero sin logo ni footer personalizados

**Referencia de Diseño:**
- Imagen `inicio-sesion.png` en raíz del proyecto establece el diseño objetivo
- Estética cyberpunk/tech: fondo oscuro, tonos azul/violeta, card semitransparente
- Logo en esquina superior izquierda, footer con copyright en parte inferior

**Restricciones Técnicas:**
- Astro 5 con output estático (SSG)
- Tailwind 4 + CSS global monolítico (~6K líneas)
- Sin nuevas dependencias (dependency-audit bloquea Firebase)
- Mantener funcionalidad actual de autenticación

## Goals / Non-Goals

**Goals:**
- Replicar diseño visual de `inicio-sesion.png` con 95%+ de similitud
- Crear fondo tecnológico oscuro con overlay gradiente azul/violeta
- Implementar card de login centrada con elementos estilizados
- Posicionar logo de agencia en esquina superior izquierda
- Agregar footer con copyright en parte inferior de pantalla
- Mantener funcionalidad de login existente (POST a API con Turnstile)
- Implementar responsive design (mobile-first: 320px, 768px, 1024px+)
- Preservar tests existentes de LoginForm

**Non-Goals:**
- NO modificar lógica de autenticación (se mantiene email/password → token)
- NO agregar Firebase u otras dependencias de autenticación
- NO cambiar endpoints de API (localhost:3000/api/v1/auth/login)
- NO modificar otras páginas del sitio (el cambio es aislado a /login)
- NO implementar recuperación de contraseña ni registro de usuarios
- NO modificar MainLayout globalmente (sólo para esta página)

## Decisions

### D1: Estrategia de Estilos - CSS Global Scoped
**Decisión:** Agregar clases específicas para login en `global.css` con scope `.login-page`

**Rationale:**
- El proyecto ya usa CSS global monolítico como patrón establecido
- Scoped styles previenen efectos colaterales en otras páginas
- Tailwind 4 `@theme` ya está configurado con variables de diseño
- Alternativa (CSS modules o styled-components) requeriría nuevas dependencias

**Alternativas Consideradas:**
- CSS Modules: Rechazado - requiere configuración adicional en Astro
- Tailwind utility classes: Rechazado - el proyecto sigue patrón de componentes semánticos
- Styled-components: Rechazado - agregaría dependencia nueva

### D2: Imagen de Fondo - Asset Estático
**Decisión:** Crear nueva imagen estática en `src/assets/img/login-background.jpg`

**Rationale:**
- Astro optimiza imágenes estáticas automáticamente con `Image` component
- Control total sobre la estética visual (vs. generar con CSS gradients)
- Performance: Astro genera WebP/AVIF automáticamente
- Un solo asset es más mantenible que múltiples capas CSS

**Alternativas Consideradas:**
- CSS gradients puros: Rechazado - no logra estética tech compleja
- Canvas/SVG generativo: Rechazado - complejidad innecesaria
- Imagen externa (URL): Rechazado - dependencias de red, sin optimización

### D3: Logo - Reutilizar Componente Existente
**Decisión:** Extraer logo del Header y posicionarlo con absolute positioning

**Rationale:**
- El logo ya existe en `Header.astro` - evitar duplicación
- Posicionamiento absolute permite ubicación precisa sin modificar MainLayout
- Mismo asset, mismo tamaño (~3-4rem), consistencia visual

**Implementación:**
- Importar logo desde Header o usar asset directo
- Posicionar con `position: fixed; top: 1rem; left: 1rem`
- Z-index alto para asegurar visibilidad sobre el fondo

### D4: Footer de Página - Inline en Login.astro
**Decisión:** Implementar footer directamente en login.astro (no en MainLayout)

**Rationale:**
- MainLayout con `hideFooter` ya oculta footer global
- Footer de login es específico de esta página (copyright + crédito)
- Evita modificar MainLayout (cambio más aislado y seguro)
- Control total sobre estilos y posicionamiento

### D5: LoginForm - Mantener Lógica, Actualizar UI
**Decisión:** Preservar lógica de autenticación, sólo actualizar clases CSS y estructura HTML

**Rationale:**
- La lógica actual funciona (validaciones, honeypot, Turnstile, rate limiting)
- Tests existentes continúan pasando
- Menor riesgo de regresión
- Separación clara: lógica (React) vs. presentación (CSS)

**Cambios en LoginForm:**
- Actualizar clases CSS para coincidir con nuevo diseño
- Agregar toggle de visibilidad en campo password (opcional, mejora UX)
- Mantener estructura de formulario y handlers

### D6: Responsive - Mobile-First con Breakpoints Existentes
**Decisión:** Usar breakpoints del proyecto (320px, 768px, 1024px, 1440px)

**Rationale:**
- Consistencia con resto del sitio
- Tailwind 4 ya configurado con estos breakpoints
- Testing más sencillo en dispositivos reales

**Breakpoints:**
- Mobile: 320px - 767px (card 100% width - 2rem padding)
- Tablet: 768px - 1023px (card max-width 400px)
- Desktop: 1024px+ (card max-width 450px)

## Risks / Trade-offs

### [R1] Imagen de fondo no disponible inicialmente
**Riesgo:** La imagen `login-background.jpg` debe ser creada/obtenida antes del deploy

**Mitigación:**
- Usar placeholder temporal (gradiente CSS) durante desarrollo
- Documentar especificaciones de la imagen (dimensiones, estética)
- Crear tarea específica para generación/obtención de asset

### [R2] Estilos en global.css pueden afectar otras páginas
**Riesgo:** Clases mal scopped podrían filtrarse a otras páginas

**Mitigación:**
- Todas las clases de login bajo scope `.login-page`
- Usar naming específico: `.login-card`, `.login-input`, etc.
- Revisar visualmente otras páginas post-implementación

### [R3] API localhost:3000 no disponible para testing
**Riesgo:** El endpoint de autenticación puede no estar corriendo durante desarrollo

**Mitigación:**
- Documentar requirement: API debe estar running en localhost:3000
- Agregar manejo de error claro para "connection refused"
- Considerar mock de API para desarrollo frontend aislado

### [R4] Turnstile puede fallar en localhost
**Riesgo:** Cloudflare Turnstile requiere configuración específica para localhost

**Mitigación:**
- El proyecto ya usa `1x00000000000000000000AA` (test key) para desarrollo
- Verificar que la key esté configurada en variables de entorno
- Documentar setup de Turnstile para nuevos desarrolladores

### [R5] Diseño no coincide exactamente con referencia
**Riesgo:** Implementación visual puede desviarse de `inicio-sesion.png`

**Mitigación:**
- Usar imagen como referencia constante durante implementación
- Checklist visual en criterios de aceptación
- Iterar con feedback del usuario antes de completar

## Migration Plan

**Fase 1: Preparación (Pre-Implementación)**
1. Obtener/crear imagen de fondo tecnológica
2. Verificar API corriendo en localhost:3000
3. Confirmar Turnstile configurado para localhost

**Fase 2: Implementación**
1. Crear estructura HTML en login.astro
2. Agregar estilos en global.css
3. Actualizar LoginForm.tsx con nuevas clases
4. Posicionar logo y footer
5. Implementar responsive design

**Fase 3: Testing**
1. Ejecutar tests existentes de LoginForm
2. Testing manual en mobile/tablet/desktop
3. Verificar flujo completo de login
4. Validar manejo de errores

**Fase 4: Deploy**
1. Build de producción (`pnpm build`)
2. Validar sin errores de build
3. Deploy a Hostinger vía FTP
4. Smoke test en producción

**Rollback Strategy:**
- Revert git commit si hay issues críticos
- El cambio es aislado a `/login` - no afecta otras páginas
- Mantener backup de login.astro y LoginForm.tsx originales

## Open Questions

1. **Imagen de fondo:** ¿Se generará con IA, se comprará en stock, o se diseñará manualmente?
2. **Toggle de visibilidad en password:** ¿Se agrega o se mantiene simple sin toggle?
3. **Animaciones:** ¿Se incluyen animaciones de entrada (fade-in) como el resto del sitio?
4. **Accesibilidad:** ¿Se requiere validación WCAG específica (contrast ratios, focus states)?
5. **Logo:** ¿El mismo del header o una versión alternativa para fondo oscuro?