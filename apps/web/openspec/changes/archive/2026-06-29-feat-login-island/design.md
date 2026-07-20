# Design: feat-login-island

## Decisiones Técnicas

### 1. React Islands Architecture
**Decisión**: Usar `@astrojs/react` con hidratación `client:load`.

**Razones:**
- Único componente que requiere estado cliente complejo (validación, submit, manejo de errores)
- `client:load` garantiza disponibilidad inmediata (no `client:idle`)
- Aislado: no afecta otras páginas SSG

**Alternativas consideradas:**
- **Vanilla TS**: Coherente con el resto del proyecto, pero más verboso para manejo de estado de formulario
- **Preact**: ~3KB vs ~45KB de React, pero menos estándar si crece el uso de React

### 2. Estructura de Archivos

```
src/
  components/auth/
    LoginForm.tsx        # React island (nuevo directorio)
  pages/
    login.astro          # Página dedicada con MainLayout (hideHeader/hideFooter)
  lib/auth/
    api.ts               # Wrapper de apiClient para login (opcional, puede ir directo)
```

### 3. Dependencias Nuevas

```json
{
  "dependencies": {
    "@astrojs/react": "^3.x",
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x"
  }
}
```

**Impacto en build**: ~45-50KB gz adicionales (aceptable para feature piloto).

### 4. Validación Cliente

- **Email**: regex estándar `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Password**: 8-128 caracteres, trim previo
- **Honeypot**: input `.website-url` oculto con CSS
- **Turnstile**: inyectado vía `apiClient.post(..., { injectTurnstile: true })` si `PUBLIC_TURNSTILE_SITE_KEY` está definido

### 5. Manejo de Estado (React)

```tsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [errors, setErrors] = useState<{email?: string, password?: string, form?: string}>({})
const [isSubmitting, setIsSubmitting] = useState(false)
const [honeypot, setHoneypot] = useState('') // si tiene valor, descartar envío
```

### 6. Manejo de Errores

- **401**: `setErrors({ form: 'Credenciales inválidas' })` (genérico, no revela si email existe)
- **429**: `setErrors({ form: 'Demasiados intentos, espera unos minutos' })` + deshabilitar botón 60s
- **NETWORK_ERROR**: `setErrors({ form: 'Error de conexión, intenta más tarde' })` + botón "Reintentar"
- **400**: `setErrors({ email: 'Email inválido' })` o `password: 'Password muy corto'}` según response

### 7. Estilos

- Usar clases Tailwind existentes (no añadir CSS nuevo)
- Coherente con diseño actual (tokens de `global.css`)
- Layout centrado vertical y horizontalmente

### 8. Accesibilidad

- `autoFocus` en campo email
- `htmlFor` en labels vinculados a `id` de inputs
- `aria-live="polite"` en contenedor de errores
- `type="email"` y `type="password"` para teclado móvil correcto
- Focus visible en todos los elementos interactivos

### 9. Seguridad

- **No** almacenar token en `localStorage`
- Backend gestiona cookie `httpOnly` (cliente no toca el token)
- Honeypot descarta envíos de bots silenciosamente
- Turnstile si está configurado

### 10. Tests

**Unit (Vitest)**:
- Render inicial sin errores
- Validación email inválido
- Validación password corto
- Honeypot detecta bot
- Manejo de errores 401, 429, network

**E2E (Playwright)**:
- Carga de página con foco en email
- Submit exitoso → redirección a `/`
- Submit con credenciales inválidas → mensaje de error
- Rate limit → botón deshabilitado 60s

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Bundle size crece | Monitorear en CI; si > 60KB, evaluar Preact |
| Conflicto con AGENTS.md que dice "No queda sistema de autenticación" | Actualizar AGENTS.md para reflejar feature piloto |
| Tests de validación fallan por nueva dep | Actualizar `dependency-audit.test.ts` antes de mergear |
| Usuario espera dashboard post-login | Documentar que `/login` es placeholder; redirigir a `/` por ahora |

## Checklist de Implementación

- [ ] `pnpm add @astrojs/react react@18 react-dom@18 @types/react @types/react-dom`
- [ ] Editar `astro.config.mjs`: añadir integración React
- [ ] Crear `src/components/auth/LoginForm.tsx`
- [ ] Crear `src/pages/login.astro`
- [ ] (Opcional) Crear `src/lib/auth/api.ts`
- [ ] Crear `src/components/auth/LoginForm.test.tsx`
- [ ] Crear `tests/e2e/login-flow.spec.ts`
- [ ] Actualizar `tests/validation/dependency-audit.test.ts`
- [ ] Actualizar `AGENTS.md` (sección de autenticación)
- [ ] Ejecutar `pnpm test`, `pnpm build`, `pnpm test:validation`