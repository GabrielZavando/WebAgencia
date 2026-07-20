# Design: Rediseño Login Page

## Visión General

El Login page es la puerta de entrada al panel administrativo. Debe comunicar seguridad, profesionalismo, y identidad de developer-brand sin ser intrusivo.

## Principios de Diseño

1. **Sutilidad**: Los cambios deben mejorar sin llamar la atención excesiva
2. **Consistencia**: Mantener flat design (border-radius: 0) y tokens existentes
3. **Accesibilidad**: WCAG AA en todos los elementos
4. **Rendimiento**: Animaciones ligeras que no afecten performance

## Paleta de Colores

### Tokens Existentes (no cambiar)
- `--color-primary`: #FF0080 (magenta) - CTA principal, accent
- `--color-secondary`: #A600FF (violeta) - Hover states
- `--color-accent`: #00FFE0 (cian) - Acento secundario
- `--color-surface`: #1f2937 (dark mode) - Fondo card
- `--color-text`: #f9fafb (dark mode) - Texto principal
- `--color-text-muted`: #9ca3af - Texto secundario

### Uso en Login
- **Icono admin**: `--color-primary` (magenta)
- **Tagline**: `--color-text-muted` (sutil)
- **Checkbox focus ring**: `--color-primary` con opacidad
- **Logo glow**: `--color-primary` con opacidad variable

## Tipografía

### Tokens Existentes
- `--font-headings`: Montserrat - Para títulos
- `--font-primary`: Open Sans - Para cuerpo

### Aplicación
- **Título "Bienvenido"`: `--text-3xl`, `--font-headings`, bold
- **Subtítulo**: `--text-sm`, `--color-text-muted`
- **Tagline "Acceso administrativo"`: `--text-xs`, `--color-text-muted`, italic
- **Labels**: `--text-xs`, uppercase, `--font-headings`, bold
- **Checkbox label**: `--text-sm`, `--font-primary`

## Espaciado

### Tokens Existentes
- `--space-xs`: 0.25rem (4px)
- `--space-sm`: 0.5rem (8px)
- `--space-md`: 1rem (16px)
- `--space-lg`: 1.5rem (24px)

### Layout
- **Card padding**: `--space-lg` (1.5rem)
- **Gap entre campos**: `--space-lg` (1.5rem)
- **Checkbox row gap**: `--space-md` (1rem)
- **Logo position**: fixed, top: 1rem, left: 1rem

## Componentes

### 1. Logo con Glow Pulse

```css
@keyframes logoGlowPulse {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(var(--color-primary-rgb), 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(var(--color-primary-rgb), 0.9));
  }
}

.logo-animate {
  animation: logoGlowPulse 2s ease-in-out infinite;
}
```

### 2. Card con Entrance Animation

```css
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card-animate {
  animation: cardEntrance 0.5s ease-out forwards;
}
```

### 3. Error Shake Animation

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.form-error {
  animation: shake 0.5s ease-in-out;
}
```

### 4. Checkbox Custom

```css
.login-checkbox {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-border);
  background: var(--color-surface-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.login-checkbox:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.login-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.3);
}
```

### 5. Loading Spinner

```css
.login-btn-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(var(--color-white-rgb), 0.3);
  border-top-color: var(--color-white);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Animaciones

| Elemento | Keyframes | Duration | Easing | Trigger |
|----------|-----------|----------|--------|---------|
| Logo | `logoGlowPulse` | 2s | ease-in-out | infinite |
| Card | `cardEntrance` | 0.5s | ease-out | on load |
| Error | `shake` | 0.5s | ease-in-out | on error |
| Loading | `spin` | 0.6s | linear | while loading |

## Responsive

### Breakpoints
- `<380px`: Card max-width 100%, padding reducido
- `380-768px`: Card max-width 380px
- `≥768px`: Card max-width 450px

### Footer
- **Actual**: `sticky bottom-0` (puede causar overlap)
- **Propuesto**: `flex-shrink-0` (se mantiene al fondo sin overlap)

## Accesibilidad

### Focus Indicators
- Todos los campos deben tener `box-shadow` visible en focus
- Checkbox debe tener ring de 3px en focus

### ARIA
- Icono admin: `aria-hidden="true"` (decorativo)
- Tagline: sin ARIA (texto visible)
- Checkbox: `aria-label="Recordarme mi correo electrónico"`

### Contraste
- Tagline en `--color-text-muted` sobre `--color-surface`: verificar 4.5:1
- Checkbox label en `--color-text-secondary`: verificar 4.5:1

## Decisiones de Diseño

1. **Por qué `admin_panel_settings`**: Comunica claramente que es panel administrativo sin ser intimidante
2. **Por qué tagline sutil**: Refuerza identidad sin competir con el título principal
3. **Por qué checkbox en misma línea**: Ahorra espacio vertical y mantiene relación visual con "¿Olvidaste tu contraseña?"
4. **Por qué localStorage**: Persiste sin enviar al backend, más simple y seguro
5. **Por qué no cambiar textos**: Mantener consistencia con el copy existente

## Referencias

- `docs/design-tokens.md` - Tokens de color, tipografía, espaciado
- `docs/design-components.md` - Contrato del componente LoginForm
- `docs/brand-brief.md` - Contexto del cliente y anti-look
