## Context

La página de Login (`src/pages/login/index.astro`) actualmente muestra un logo fijo en la esquina superior izquierda como un simple elemento `<img>`. No es clickeable y no ofrece navegación. El `MainLayout` se renderiza con `hideHeader hideFooter`, por lo que el header global no está disponible en esta página.

## Goals / Non-Goals

**Goals:**
- Hacer que el logo en `/login` sea clickeable y enlace a `/` (Inicio).
- Mantener la misma apariencia visual y comportamiento de animación.

**Non-Goals:**
- Modificar el header global ni otros componentes de navegación.
- Cambiar la ubicación, tamaño o estilo del logo.
- Añadir lógica de estado o comportamiento complejo.

## Decisions

**Decisión 1: Envolver el `<img>` en un `<a href="/">`**
- Alternativa considerada: usar un `<button>` con JavaScript `window.location.href`. Rechazado por ser innecesariamente complejo y menos semántico.
- `<a href="/">` es HTML puro, semántico, accesible y funciona sin JavaScript.

**Decisión 2: Mantener el `aria-label` en el enlace**
- El logo actual tiene `alt="Agencia Digital Logo"`. Se añadirá `aria-label="Ir al inicio"` al `<a>` para accesibilidad.

## Risks / Trade-offs

- **Riesgo mínimo**: Es un cambio visual simple en un solo archivo sin impacto en dependencias, APIs o datos.
- **Trade-off**: Ninguno significativo.
