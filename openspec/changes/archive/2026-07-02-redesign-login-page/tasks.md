# Tasks: Rediseño Login Page

## Fase 1: Animaciones en global.css

- [x] 1.1 Agregar keyframes `logoGlowPulse` para glow del logo
- [x] 1.2 Agregar keyframes `cardEntrance` para animación de entrada de card
- [x] 1.3 Agregar keyframes `shake` para feedback de error
- [x] 1.4 Agregar clase `.logo-animate` con animación infinite
- [x] 1.5 Agregar clase `.card-animate` con animación forwards
- [x] 1.6 Agregar clase `.form-error` con animación shake
- [x] 1.7 Verificar `prefers-reduced-motion` para deshabilitar animaciones

## Fase 2: Checkbox Custom en global.css

- [x] 2.1 Agregar estilos base para `.login-checkbox` (appearance: none)
- [x] 2.2 Agregar estado `:checked` con color primary
- [x] 2.3 Agregar estado `:focus` con ring de 3px
- [x] 2.4 Agregar contenedor `.login-checkbox-row` para layout horizontal

## Fase 3: Login Page (index.astro)

- [x] 3.1 Agregar icono `admin_panel_settings` junto al título
- [x] 3.2 Agregar tagline "Acceso administrativo" bajo subtítulo
- [x] 3.3 Aplicar clase `.card-animate` a la card
- [x] 3.4 Aplicar clase `.logo-animate` al logo
- [x] 3.5 Cambiar footer de `sticky` a `flex-shrink-0`

## Fase 4: LoginForm.tsx - Estados

- [x] 4.1 Agregar estado `rememberMe` (boolean)
- [x] 4.2 Agregar estado `isSuccess` (boolean) para success state
- [x] 4.3 Cargar email de localStorage al montar componente
- [x] 4.4 Guardar email en localStorage al submit con rememberMe checked
- [x] 4.5 Limpiar localStorage al unchecked rememberMe

## Fase 5: LoginForm.tsx - Checkbox UI

- [x] 5.1 Agregar checkbox "Recordarme" en JSX
- [x] 5.2 Posicionar en misma línea que "¿Olvidaste tu contraseña?"
- [x] 5.3 Agregar `aria-label="Recordarme mi correo electrónico"`
- [x] 5.4 Aplicar clase `.login-checkbox` al input

## Fase 6: LoginForm.tsx - Loading States

- [x] 6.1 Deshabilitar campos durante `isSubmitting`
- [x] 6.2 Mostrar spinner en botón durante `isSubmitting`
- [x] 6.3 Agregar clase `.login-btn-spinner` al spinner
- [x] 6.4 Cambiar texto del botón a "Iniciando sesión..."

## Fase 7: LoginForm.tsx - Error Feedback

- [x] 7.1 Agregar clase `.form-error` al formulario cuando hay error
- [x] 7.2 Trigger animación shake en cada error (via errorKey)
- [x] 7.3 Mantener bordes rojos en campos con error (ya existe)

## Fase 8: LoginForm.tsx - Success State

- [x] 8.1 Mostrar check verde momentáneo al autenticar
- [x] 8.2 Redirigir después de 500ms de success state
- [x] 8.3 Agregar animación fade-in al check (login-success-check)

## Fase 9: Verificación

- [x] 9.1 Ejecutar `pnpm build` y verificar que pasa
- [x] 9.2 Ejecutar `pnpm test` y verificar que pasa (31/31)
- [ ] 9.3 Verificar responsive en mobile (<380px)
- [ ] 9.4 Verificar responsive en tablet (768px)
- [ ] 9.5 Verificar responsive en desktop (≥1024px)
- [ ] 9.6 Verificar contraste WCAG AA en todos los textos
- [ ] 9.7 Verificar que animaciones respetan `prefers-reduced-motion`

## Fase 10: Documentación

- [ ] 10.1 Actualizar `docs/design-components.md` con nuevos estados
- [ ] 10.2 Actualizar `src/styles/global.css` comments si es necesario

## Notas

- No cambiar textos existentes (mantener en español) ✓
- Mantener gradient overlay actual ✓
- Usar tokens del design system existente ✓
- Cumplir WCAG AA (contraste ≥4.5:1) ✓
- Usar `forcedTheme="dark"` (no cambiar) ✓
