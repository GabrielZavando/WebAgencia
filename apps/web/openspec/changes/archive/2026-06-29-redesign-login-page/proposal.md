## Why

La página de login actual (`/login`) tiene un diseño genérico que no refleja la identidad visual profesional y tecnológica de la agencia. La imagen de referencia `inicio-sesion.png` establece el estándar de diseño esperado: una pantalla de login con estética cyberpunk/tech (fondo oscuro con tonos azul/violeta, card centrada semitransparente, logo en esquina superior, footer con copyright). Este cambio alinea la implementación actual con el diseño aprobado.

## What Changes

- **Página de login rediseñada**: Nueva estructura visual en `src/pages/login.astro` con fondo tecnológico oscuro, card centrada y elementos estilizados
- **Estilos específicos de login**: Nuevas clases CSS en `src/styles/global.css` para card, inputs, botón y elementos de la página de login
- **Imagen de fondo tecnológica**: Nuevo asset en `src/assets/img/` con temática tech (código, servidores, tonos azul/violeta)
- **Logo posicionado**: Logo de la agencia en esquina superior izquierda (fuera de la card de login)
- **Footer de página**: Copyright centrado en parte inferior de pantalla
- **LoginForm actualizado**: Clases CSS y estructura HTML renovadas en `src/components/auth/LoginForm.tsx` para coincidir con el nuevo diseño
- **Responsive design**: Adaptación mobile-first para la página de login

## Capabilities

### New Capabilities

- `login-ui-redesign`: Nueva interfaz visual para la página de login con diseño tecnológico oscuro, card centrada, logo en esquina superior izquierda y footer con copyright

### Modified Capabilities

- None

## Impact

- **Archivos modificados**:
  - `src/pages/login.astro` (estructura y estilos)
  - `src/components/auth/LoginForm.tsx` (clases CSS y estructura HTML)
  - `src/styles/global.css` (nuevas clases para login)
  - `src/assets/img/` (nueva imagen de fondo)
- **Sin cambios en autenticación**: La lógica de login se mantiene intacta (POST a `/api/v1/auth/login`)
- **Sin nuevas dependencias**: No se agregan paquetes npm
- **Sin cambios en API**: El endpoint de autenticación permanece igual
- **Testing**: Tests existentes de LoginForm deben continuar pasando
- **Responsive**: Mobile (320px+), Tablet (768px+), Desktop (1024px+)