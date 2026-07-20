# Proposal: feat-login-island

## What & Why

Reintroducir una página de login (`/login`) como punto de entrada aislado para un único usuario admin. Esta feature fue eliminada en v1.7 junto con Firebase y el sistema de autenticación completo. Ahora se reintroduce de forma minimalista usando **React Islands Architecture** (`@astrojs/react`) sin reintroducir Firebase, admin dashboard ni rutas `/admin/*`.

**Motivación:**
- Habilitar acceso a un futuro portal de cliente/admin sin comprometer la arquitectura SSG actual
- Validar el flujo Spec-Driven Development end-to-end con una feature acotada
- Mantener el bundle mínimo: una sola isla React, sin stores globales, sin Firebase

## Scope

**Incluye:**
- Página `/login` con formulario React hidratado (`client:load`)
- Validación cliente (email, password 8-128 chars, honeypot, Turnstile opcional)
- Consumo de endpoint `${PUBLIC_API_URL}/api/v1/auth/login` vía `apiClient.post()`
- Manejo de errores amigable (401, 429, network errors)
- Tests unit (Vitest) y E2E (Playwright)
- Actualización de `dependency-audit.test.ts` para permitir `@astrojs/react`

**Excluye:**
- Registro de usuarios (no hay endpoint público de sign-up)
- Recuperación de contraseña por UI (proceso manual fuera de banda)
- Dashboard admin ni rutas `/admin/*`
- Persistencia de token en localStorage (el backend gestiona cookie `httpOnly`)
- Multi-tenant o múltiples roles (único usuario `admin`)

## Impacto en Specs

- **Delta en `openspec/specs/client-portal-auth/spec.md`**: Esta spec ya existe como visión a futuro. Esta implementación cubre los requirements RC-1 a RC-12 definidos.
- **No afecta** las specs `landing-public`, `lead-capture`, `blog-content`, `newsletter-double-optin`.

## Success Criteria

1. ✅ Página `/login` accesible, con header/footer ocultos
2. ✅ Formulario React funcional con validación cliente
3. ✅ Integración con API (endpoint `/auth/login`)
4. ✅ Tests unit y E2E passing
5. ✅ `dependency-audit.test.ts` actualizado
6. ✅ Build SSG sin errores ni warnings
7. ✅ Bundle JS dentro de presupuesto (< 50KB adicionales)

## Timeline Estimado

- Setup (deps + config): 15 min
- Implementación (LoginForm + página): 60 min
- Tests: 30 min
- Validación + fix: 15 min
- **Total**: ~2 horas