# Sesión de Debug y Fixes - Login y Configuración

## Fecha
2026-07-04

## Problemas Resueltos

### 1. Login Fallaba con TurnstileError
**Síntoma:** `Error: [Cloudflare Turnstile] Could not find widget.`

**Causa:** El widget de Turnstile no se renderizaba en la página de login, pero el formulario intentaba inyectar el token.

**Solución:** Eliminar `injectTurnstile: true` del login (es una página interna de admin, no requiere protección anti-spam agresiva).

**Archivo:** `src/components/auth/LoginForm.tsx:118`

---

### 2. URL Duplicada en Llamada a API
**Síntoma:** `POST http://localhost:3000/api/v1/api/v1/auth/login 404`

**Causa:** El endpoint se construía como `/api/v1/auth/login` pero `PUBLIC_API_URL` ya incluye `/api/v1`.

**Solución:** Cambiar endpoint de `/api/v1/auth/login` a `/auth/login`.

**Archivo:** `src/components/auth/LoginForm.tsx:118`

---

### 3. Warning de Hidratación de React
**Síntoma:** `Warning: Prop className did not match. Server: "form-group fade-in animate" Client: "form-group fade-in"`

**Causa:** La clase `animate` se agrega dinámicamente con IntersectionObserver, causando mismatch entre SSR y cliente.

**Solución:** Agregar `suppressHydrationWarning` a los elementos con clase `fade-in`.

**Archivos:** `src/components/auth/LoginForm.tsx:249,275,296,320`

---

### 4. Warning de Configuración de API
**Síntoma:** `⚠️ Error conectando con la API para configuración. Usando fallback estático.`

**Causa:** El endpoint `/system-config` no existe en la API NestJS.

**Solución:** Eliminar llamada a API y usar directamente `companyConfig` (configuración estática).

**Archivo:** `src/utils/config.ts:25-36`

---

### 5. Logs de Debug en Producción
**Síntoma:** Múltiples `console.log` y `console.error` temporales en el código.

**Solución:** Eliminar todos los logs de debug agregados durante la sesión.

**Archivos:** `src/lib/firebase.ts`, `src/components/auth/LoginForm.tsx`

---

### 6. Script de Desarrollo Local
**Necesidad:** Facilitar configuración de desarrollo local con API NestJS.

**Solución:** Crear script `link-api-local-dev` que:
- Verifica `.env.local` con variables correctas
- Verifica que la API esté configurada
- Muestra instrucciones paso a paso

**Archivos creados:**
- `scripts/link-api-local-dev.sh` (script ejecutable)
- `docs/LOCAL_DEV.md` (documentación completa)

**Comando:** `pnpm link-api-local-dev`

---

## Resumen de Cambios

| Archivo | Cambios |
|---------|---------|
| `src/components/auth/LoginForm.tsx` | Eliminar Turnstile, corregir endpoint, suppressHydrationWarning, limpiar logs |
| `src/lib/firebase.ts` | Limpiar logs de debug |
| `src/utils/config.ts` | Eliminar llamada a API, usar configuración estática |
| `scripts/link-api-local-dev.sh` | **Nuevo** - Script de configuración local |
| `docs/LOCAL_DEV.md` | **Nuevo** - Documentación de desarrollo local |
| `package.json` | Agregar script `link-api-local-dev` |

---

## Estado Final

✅ Login funciona correctamente
✅ Dashboard accesible
✅ Sin warnings en consola
✅ Código limpio (sin logs de debug)
✅ Sin dependencias innecesarias de API
✅ Script de desarrollo local automatizado
✅ Documentación actualizada

---

## Comandos Útiles

```bash
# Configuración rápida de desarrollo local
pnpm link-api-local-dev

# Iniciar API (en ../API)
cd ../API && npm run start:dev

# Iniciar frontend (en WebAgenciaAstro)
pnpm dev

# Tests de validación
pnpm test:validation
```
