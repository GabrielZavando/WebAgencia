## 1. Fix CSS del login

- [x] 1.1 Escribir test que falle verificando que `AdminLayout.astro` importa `global.css`
- [x] 1.2 Agregar `import '../styles/global.css'` en `AdminLayout.astro`
- [x] 1.3 Verificar que el test pasa y el build SSR compila

## 2. Fix warning React onsubmit

- [x] 2.1 Escribir test que falle verificando que `TailAdminLogin.tsx` no tiene `onsubmit` en el `<form>`
- [x] 2.2 Eliminar `onsubmit="return false;"` del `<form>` en `TailAdminLogin.tsx`
- [x] 2.3 Verificar que el test pasa y el suite de tests existente sigue verde

## 4. Reestructurar layout del login (TailAdmin)

- [x] 4.1 Escribir test que falle verificando que `TailAdminLogin.tsx` usa `flex items-center justify-center` sin `min-h-screen` en el formulario (index.astro provee el 100vh)
- [x] 4.2 Reestructurar `TailAdminLogin.tsx` con layout de tarjeta centrada (`flex items-center justify-center`, `max-w-md w-full` en el form) y altura controlada en inputs y botón
- [x] 4.3 Reemplazar íconos `material-symbols-outlined` rotos por SVGs de `lucide-react` (Mail, Eye, EyeOff, CheckCircle, LayoutDashboard SVG inline)

## 5. Corregir integración de AuthGuard en login

- [x] 5.1 Escribir test que falle verificando que `AuthGuard.tsx` no renderiza un `div min-h-screen` que empuje el layout mientras verifica la sesión
- [x] 5.2 Corregir `AuthGuard.tsx` para que el estado de verificación sea un overlay/spinner sutil sin romper el layout del formulario
- [x] 5.3 Verificar que en `/login` con `redirectToLogin={false}` y `redirectToAdmin`, el AuthGuard no interfiere con el renderizado del formulario

## 6. Ajustar fondo de la página /login

- [x] 6.1 Verificar que el fondo de `/login` use `bg-cover bg-center` o diseño de dos columnas limpio (TailAdmin style)

## 8. Rehacer UI del login con estructura exacta de TailAdmin

- [x] 8.1 Escribir test que falle verificando que `TailAdminLogin.tsx` renderiza tarjeta con `rounded-sm border border-stroke bg-white shadow-default p-8 sm:p-12`
- [x] 8.2 Reescribir `TailAdminLogin.tsx` con layout real de TailAdmin: tarjeta blanca centrada, header con logo + "Bienvenido" (mb-9), inputs con `px-5 py-3 border border-stroke rounded-md bg-transparent`, botón submit `w-full bg-primary text-white py-3 rounded-md`
- [x] 8.3 Escribir test que falle verificando que `TailAdminLogin.tsx` tiene botón de submit tipo submit con texto "Iniciar sesión"
- [x] 8.4 Corregir `AuthGuard.tsx` para que sea overlay de pantalla completa cuando verifica sesión, no renderizado junto al formulario
- [x] 8.5 Asegurar que `index.astro` tenga contenedor principal con `min-h-screen flex items-center justify-center bg-cover bg-center` y que `TailAdminLogin` NO tenga `min-h-screen`
- [x] 8.6 Ejecutar `pnpm --filter @webastro/admin build` y confirmar `dist/server/entry.mjs`
- [x] 8.7 Ejecutar `pnpm --filter @webastro/admin test` y confirmar que todos pasan

## 9. Resolver bloqueo en "Verificando sesión..." (AuthGuard)

- [x] 9.1 Escribir test que falle verificando que `AuthGuard.tsx` acepta prop `children` y la renderiza cuando no hay redirect
- [x] 9.2 Corregir `AuthGuard.tsx` para renderizar `children` inmediatamente sin bloquear en la verificación de Firebase
- [x] 9.3 Eliminar overlay de "Verificando sesión..." que bloqueaba el formulario en la página de login
- [x] 9.4 Quitar `pointer-events-none` del `<main>` en `index.astro` para que el botón sea visible y clickeable
- [x] 9.5 Envolver `TailAdminLogin` dentro de `AuthGuard` como children en `index.astro`
- [x] 9.6 Ejecutar `pnpm --filter @webastro/admin build` y confirmar `dist/server/entry.mjs`
- [x] 9.7 Ejecutar `pnpm --filter @webastro/admin test` y confirmar que todos pasan

## 10. Simplificar formulario de login a mínima expresión funcional

- [x] 10.1 Escribir test que falle verificando que `TailAdminLogin.tsx` NO importa lucide-react
- [x] 10.2 Escribir test que falle verificando que `TailAdminLogin.tsx` usa clases estándar de Tailwind (bg-white, border-gray-300, text-gray-900, bg-blue-600 text-white)
- [x] 10.3 Escribir test que falle verificando que `TailAdminLogin.tsx` tiene botón submit con texto "Iniciar sesión" y clases w-full rounded-md bg-blue-600 py-3 text-white
- [x] 10.4 Escribir test que falle verificando que errores de validación solo aparecen tras submit (estado submitted/touched)
- [x] 10.5 Reescribir `TailAdminLogin.tsx`: eliminar lucide-react, usar Tailwind estándar, agregar estado submitted para validación temprana, simplificar estructura
- [x] 10.6 Ejecutar `pnpm --filter @webastro/admin build` y confirmar `dist/server/entry.mjs`
- [x] 10.7 Ejecutar `pnpm --filter @webastro/admin test` y confirmar que todos pasan

## 11. Restaurar las utilidades Tailwind anuladas por el CSS legacy (cascade layers)

- [x] 11.1 Diagnosticar con navegador real que el botón de login renderiza sin `padding`, con fondo transparente y 16px de alto
- [x] 11.2 Escribir test de validación que falle: el reset universal y el reset de controles de formulario deben estar dentro de una cascade layer
- [x] 11.3 Escribir test E2E que falle: el botón de login debe tener fondo visible, padding de 12px, altura >= 40px; la tarjeta con padding y borde
- [x] 11.4 Envolver el CSS legacy de `apps/admin/src/styles/global.css` en `@layer components` para que `@layer utilities` de Tailwind prevalezca
- [x] 11.5 Reemplazar clases `z-background`/`z-base`/`z-content`/`z-tooltip` (inexistentes en Tailwind v4) por utilidades z-index reales en `login/index.astro`
- [x] 11.6 Eliminar el `<main>` anidado de `login/index.astro` y usar un `<div data-testid="login-container">`
- [x] 11.7 No aplicar `lg:pl-64` ni `p-4 md:p-6` del layout en la página de login
- [x] 11.8 Quitar `fade-in animate-in` del logo (no hay IntersectionObserver en admin, la opacidad queda en 0)
- [x] 11.9 Agregar `space-y-6` a la tarjeta del login para separar los bloques de formulario
- [x] 11.10 Ejecutar `pnpm --filter @webastro/admin build` y confirmar `dist/server/entry.mjs`
- [x] 11.11 Ejecutar `pnpm --filter @webastro/admin test` y confirmar que todos pasan
- [x] 11.12 Ejecutar `pnpm --filter @webastro/admin test:e2e` y confirmar que la suite de visibilidad del login pasa

## 12. Alinear la suite E2E con el componente `TailAdminLogin`

- [x] 12.1 Validar en `onBlur` los campos email y password para mostrar el error sin necesidad de submit
- [x] 12.2 Agregar la clase `form-error` al contenedor del error de formulario para mantener el contrato con la suite E2E
- [x] 12.3 Ajustar el test de tabulación para que sea coherente con el `autoFocus` del campo email
- [x] 12.4 Marcar como skipped los tests E2E que requieren credenciales Firebase reales cuando el entorno usa credenciales dummy
- [x] 12.5 Ejecutar `pnpm --filter @webastro/admin test:e2e` y confirmar que la suite queda verde
