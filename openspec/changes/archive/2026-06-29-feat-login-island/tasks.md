# Tasks: feat-login-island

## Implementation Steps

### Task 1.1: Instalar dependencias React
- `pnpm add @astrojs/react react@18 react-dom@18 @types/react @types/react-dom`
- Verificar `package.json` actualizado
- [ ] Pendiente
- [ ] Completado

### Task 1.2: Configurar Astro para React
- Editar `astro.config.mjs`: añadir `import react from '@astrojs/react'` y `integrations: [react()]`
- Ejecutar `pnpm dev` para verificar sin errores
- [ ] Pendiente
- [ ] Completado

### Task 2.1: Crear componente LoginForm.tsx
- Archivo: `src/components/auth/LoginForm.tsx`
- Estado: email, password, errors, isSubmitting, honeypot
- Validación: email regex, password 8-128 chars
- Submit: `apiClient.post('/api/v1/auth/login', { email, password, turnstileToken })`
- Manejo de errores: 401, 429, network
- Retorno: JSX con form, labels, inputs, button, error messages
- [ ] Pendiente
- [ ] Completado

### Task 2.2: Crear página login.astro
- Archivo: `src/pages/login.astro`
- Importar `MainLayout` y `LoginForm`
- Usar `<LoginForm client:load />`
- Props de MainLayout: `hideHeader` y `hideFooter` activos
- Título: "Iniciar sesión | Agencia Digital"
- [ ] Pendiente
- [ ] Completado

### Task 3.1: Tests unitarios de LoginForm
- Archivo: `src/components/auth/LoginForm.test.tsx`
- Tests:
  - Renderiza sin errores
  - Muestra error si email inválido
  - Muestra error si password < 8 chars
  - Honeypot descarta envío si tiene valor
  - Maneja error 401 correctamente
  - Maneja error 429 correctamente
- Ejecutar: `pnpm test src/components/auth/LoginForm.test.tsx`
- [ ] Pendiente
- [ ] Completado

### Task 3.2: Tests E2E de login
- Archivo: `tests/e2e/login-flow.spec.ts`
- Tests:
  - Carga página con foco en email
  - Submit exitoso redirige a `/`
  - Submit con credenciales inválidas muestra error
  - Rate limit deshabilita botón
- Ejecutar: `pnpm test:e2e tests/e2e/login-flow.spec.ts`
- [ ] Pendiente
- [ ] Completado

### Task 4.1: Actualizar dependency-audit.test.ts
- Archivo: `tests/validation/dependency-audit.test.ts`
- Añadir a lista de deps permitidas: `@astrojs/react`, `react`, `react-dom`
- Ejecutar: `pnpm test:validation:static`
- [ ] Pendiente
- [ ] Completado

### Task 5.1: Validación final
- Ejecutar `pnpm build` → verificar sin errores
- Ejecutar `pnpm test:validation` → todo passing
- Ejecutar `npx @fission-ai/openspec validate feat-login-island` → passing
- [ ] Pendiente
- [ ] Completado

### Task 6.1: Actualizar AGENTS.md
- Sección "Convenciones y peculiaridades": actualizar para reflejar que `/login` existe como feature piloto
- Sección "Deploy": mencionar que login es React island
- [ ] Pendiente
- [ ] Completado

### Task 7.1: Archivar cambio
- Mover `openspec/changes/feat-login-island/` a `openspec/changes/archive/2026-06-29-feat-login-island/`
- Actualizar `openspec/specs/client-portal-auth/spec.md` con delta implementado
- Ejecutar `/opsx:archive` (si está disponible)
- [ ] Pendiente
- [ ] Completado