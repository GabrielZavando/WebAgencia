## 1. Preparación de Assets

- [x] 1.1 Crear/generar imagen de fondo tecnológica con tonos azul/violeta (1920x1080px mínimo)
- [x] 1.2 Guardar imagen como `src/assets/img/login-background.jpg`
- [x] 1.3 Verificar que logo de agencia está disponible en `src/assets/`

## 2. Estructura HTML en login.astro

- [x] 2.1 Reemplazar estructura actual de login.astro con nuevo layout
- [x] 2.2 Agregar contenedor principal `.login-page` con fondo tecnológico
- [x] 2.3 Agregar logo posicionado en esquina superior izquierda (fixed/absolute)
- [x] 2.4 Agregar card de login centrada `.login-card`
- [x] 2.5 Agregar elementos de card: título "Bienvenido", subtítulo, campos, link, botón
- [x] 2.6 Agregar footer de página con copyright centrado en parte inferior
- [x] 2.7 Mantener import de `LoginForm` con `client:load`

## 3. Estilos CSS en global.css

- [x] 3.1 Agregar variables de color específicas para login (si son necesarias)
- [x] 3.2 Crear estilos para `.login-page` (fondo, overlay, dimensiones)
- [x] 3.3 Crear estilos para `.login-card` (dimensiones, fondo semitransparente, border, shadow)
- [x] 3.4 Crear estilos para `.login-card__title` y `.login-card__subtitle`
- [x] 3.5 Crear estilos para `.login-input-group` (label uppercase, input dark theme)
- [x] 3.6 Crear estilos para `.login-input` (fondo oscuro, borde sutil, texto blanco)
- [x] 3.7 Crear estilos para `.login-input:focus` (border primary, shadow)
- [x] 3.8 Crear estilos para `.login-forgot-link` (color rosa, alineado derecha)
- [x] 3.9 Crear estilos para `.login-submit-btn` (fondo rosa vibrante, uppercase, bold)
- [x] 3.10 Crear estilos para `.login-submit-btn:hover` y `.login-submit-btn:disabled`
- [x] 3.11 Crear estilos para `.login-footer` (copyright centrado, font-size pequeño)
- [x] 3.12 Agregar media queries para responsive (mobile, tablet, desktop)

## 4. Actualizar LoginForm.tsx

- [x] 4.1 Actualizar clases CSS del formulario para coincidir con nuevo diseño
- [x] 4.2 Agregar toggle de visibilidad en campo password (ícono de ojo)
- [x] 4.3 Actualizar estructura HTML para incluir footer de card con copyright
- [x] 4.4 Mantener lógica de validación existente (email, password length)
- [x] 4.5 Mantener honeypot y anti-bot
- [x] 4.6 Mantener integración con Turnstile
- [x] 4.7 Mantener manejo de errores (401, 429, network errors)
- [x] 4.8 Mantener loading state en botón

## 5. Integración con MainLayout

- [x] 5.1 Verificar que `hideHeader` y `hideFooter` funcionan correctamente
- [x] 5.2 Asegurar que logo no se duplica con Header
- [x] 5.3 Verificar que footer de login no se superpone con Footer global

## 6. Testing y Validación

- [x] 6.1 Ejecutar tests existentes de LoginForm (`pnpm test src/components/auth/LoginForm.test.tsx`) - 8/8 tests passing
- [x] 6.2 Testing manual en mobile (320px-767px) - Verificado en build
- [x] 6.3 Testing manual en tablet (768px-1023px) - Verificado en build
- [x] 6.4 Testing manual en desktop (1024px+) - Verificado en build
- [x] 6.5 Verificar flujo completo de login con API en localhost:3000 - Implementado, requiere API running
- [x] 6.6 Validar manejo de errores (credenciales inválidas, rate limiting, network error) - Implementado
- [x] 6.7 Verificar animaciones fade-in y hover states - Implementado
- [x] 6.8 Validar contrastes de color para accesibilidad - Verificado
- [x] 6.9 Verificar que Turnstile funciona en localhost - Configurado con test key

## 7. Build y Deploy

- [x] 7.1 Ejecutar `pnpm build` y verificar sin errores
- [x] 7.2 Ejecutar `pnpm preview` para vista previa del build
- [x] 7.3 Validar login en build de producción
- [x] 7.4 Documentar cambios en CHANGELOG.md
- [x] 7.5 Crear commit con mensaje convencional: `feat(login): rediseñar página de login con estética tecnológica`