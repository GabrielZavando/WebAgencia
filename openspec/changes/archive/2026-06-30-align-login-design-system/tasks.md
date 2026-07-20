## 1. Preparación y análisis

- [x] 1.1 Leer login.astro y LoginForm.tsx para identificar todos los hex/rgba hardcodeados
- [x] 1.2 Crear mapeo de valores actuales → tokens equivalentes (tabla de referencia)
- [x] 1.3 Identificar clases custom (.login-*) y sus equivalentes del sistema (.form-*)

## 2. Reemplazo de valores hardcodeados en login.astro

- [x] 2.1 Reemplazar `#0a0a1a` por `var(--color-body)` o `var(--color-dark)` en fondo de página
- [x] 2.2 Reemplazar gradientes `rgba(166, 0, 255, 0.15)` y `rgba(0, 255, 224, 0.1)` por `var(--color-secondary-rgb)` y `var(--color-accent-rgb)`
- [x] 2.3 Reemplazar `rgba(30, 41, 59, 0.7)` por `var(--color-surface)` con transparencia en card
- [x] 2.4 Reemplazar `rgba(255, 255, 255, 0.1)` por `var(--color-border)` en bordes de card
- [x] 2.5 Reemplazar `rgba(255, 255, 255, 0.9)` por `var(--color-text-secondary)` en labels
- [x] 2.6 Reemplazar `rgba(51, 65, 85, 0.5)` por `var(--color-surface-secondary)` en inputs
- [x] 2.7 Reemplazar `#FF0080` por `var(--color-primary)` en focus, botón y links
- [x] 2.8 Reemplazar `#E6006B` por `var(--btn-primary-hover)` en hover de botón y links
- [x] 2.9 Reemplazar `#ef4444` por `var(--color-error)` en mensajes de error
- [x] 2.10 Reemplazar `rgba(239, 68, 68, 0.1)` por `rgba(var(--color-error-rgb), 0.1)` en background de error

## 3. Reemplazo de valores hardcodeados en LoginForm.tsx

- [x] 3.1 Reemplazar valores hex en estilos inline o clases condicionales
- [x] 3.2 Verificar que error states usen `var(--color-error)`
- [x] 3.3 Verificar que loading states usen tokens del sistema

## 4. Unificación de clases de formulario

- [x] 4.1 Cambiar `.login-input-group` por `.form-group` en login.astro
- [x] 4.2 Cambiar `.login-input-label` por `.form-label` en login.astro
- [x] 4.3 Cambiar `.login-input` por `.form-input` en login.astro
- [x] 4.4 Cambiar `.login-submit-btn` por `.btn-form` en login.astro
- [x] 4.5 Cambiar `.login-error-message` por `.error-message` en login.astro y LoginForm.tsx
- [x] 4.6 Eliminar clases custom duplicadas de login.astro (si existen en <style>)

## 5. Alineación de border-radius y tipografía

- [x] 5.1 Cambiar border-radius de inputs de 8px a 0 (o eliminar para heredar de .form-input)
- [x] 5.2 Cambiar border-radius de botón de 8px a 0 (o eliminar para heredar de .btn-form)
- [x] 5.3 Mantener border-radius de card en 16px (excepción documentada)
- [x] 5.4 Cambiar font-size de labels de 0.85rem a var(--text-xs)
- [x] 5.5 Cambiar font-size de subtitle de 0.95rem a var(--text-sm)
- [x] 5.6 Ajustar font-weight de labels a 700 (si difiere de .form-label)

## 6. Unificación de estados de focus y error

- [x] 6.1 Verificar que focus state de inputs use shadow ring estándar
- [x] 6.2 Verificar que error state use border-color: var(--color-error)
- [x] 6.3 Eliminar estilos custom de focus/error si duplican funcionalidad del sistema

## 7. Documentación

- [x] 7.1 Leer docs/design-components.md para entender formato de entradas
- [x] 7.2 Añadir entrada "LoginPage" con descripción de estructura y clases usadas
- [x] 7.3 Documentar excepción de border-radius en card (16px vs flat design)
- [x] 7.4 Actualizar tabla de componentes en design-components.md

## 8. Validación y testing

- [x] 8.1 Ejecutar `pnpm dev` y verificar visualmente en tema oscuro
- [x] 8.2 Test de keyboard navigation (tab entre inputs, focus states visibles)
- [x] 8.3 Test de responsive (mobile <768px, desktop ≥1200px)
- [x] 8.4 Verificar que no haya hex literales en el código (grep: /#[0-9a-fA-F]{3,6}/)
- [x] 8.5 Ejecutar `pnpm test` para verificar que no haya regresión funcional
- [x] 8.6 Capturar screenshots before/after para documentación