## Context

El proyecto WebAgenciaAstro es un sitio estático generado con Astro que se conecta a una API NestJS externa. Actualmente, las variables de entorno en `.env.example` apuntan a producción (`us-central1.run.app`), y no existe un `.env.local` configurado para desarrollo local.

**Estado actual:**
- Login: React island en `/login` que envía POST a `/api/v1/auth/login` con email/password
- Autenticación: Basada en cookies httpOnly (el token JWT retornado no se almacena en el cliente)
- Dashboard: `/admin/dashboard` verifica sesión vía `/api/v1/auth/me` con `credentials: 'include'`
- API Client: `src/lib/api-client.ts` usa `PUBLIC_API_URL` o `PUBLIC_API_BASE_URL` del entorno
- Turnstile: Integrado con inyección de token en requests

**Flujo de login esperado:**
1. Usuario ingresa email/password en LoginForm
2. Frontend envía POST a `/api/v1/auth/login` con `{ email, password }`
3. Backend valida credenciales y responde con `{ token, user, expiresAt }` + setea cookie httpOnly
4. Frontend redirige a `/admin/dashboard`
5. Dashboard llama a `/api/v1/auth/me` con `credentials: 'include'` para verificar sesión

**Información faltante identificada:**
- El usuario mencionó enviar Firebase ID token, pero el LoginForm actual envía email/password directamente
- Se necesita confirmar si la API local espera email/password o Firebase ID token
- La URL mencionada es `localhost:3000` pero `.env.example` comenta `localhost:8080`

## Goals / Non-Goals

**Goals:**
- Habilitar desarrollo local conectando el frontend a una API NestJS en `http://localhost:3000/api/v1/`
- Crear `.env.local` con configuración para desarrollo
- Documentar el proceso de setup para desarrollo local
- Validar que login, auth check y dashboard funcionen contra API local
- Mantener compatibilidad con producción (fácil switch entre local/prod)

**Non-Goals:**
- Cambiar el mecanismo de autenticación actual (email/password → cookie httpOnly)
- Modificar el flujo de login existente (salvo ajuste si se confirma Firebase ID token)
- Agregar nuevas features al dashboard o login
- Cambiar la integración con Turnstile

## Decisions

### 1. Usar `.env.local` para configuración de desarrollo

**Decisión:** Crear `.env.local` apuntando a `http://localhost:3000/api/v1/` en lugar de modificar `.env.example`.

**Rationale:** 
- `.env.local` está en `.gitignore` por convención de Astro, no se commitea
- Cada desarrollador puede tener su propia configuración
- `.env.example` permanece como template para producción/nuevos desarrolladores
- Astro carga `.env.local` automáticamente en modo desarrollo

**Alternativa considerada:** Modificar `.env.example` y pedir que copien a `.env`. Rechazada porque es más propenso a errores y menos flexible.

### 2. Mantener dualidad PUBLIC_API_URL / PUBLIC_API_BASE_URL

**Decisión:** Usar `PUBLIC_API_URL` como primary para desarrollo, mantener `PUBLIC_API_BASE_URL` como fallback.

**Rationale:** 
- `api-client.ts` ya tiene esta jerarquía: `PUBLIC_API_URL || PUBLIC_API_BASE_URL || ''`
- No requiere cambios de código
- Permite tener URLs distintas si es necesario (ej: CDN vs API directa)

### 3. Turnstile en modo test para desarrollo

**Decisión:** Usar la key de test `1x00000000000000000000AA` ya implementada en Contact.astro y Footer.astro.

**Rationale:**
- Ya está implementado en otros componentes
- Permite saltar validación de Turnstile en desarrollo
- No requiere configuración adicional

### 4. Firebase ID token - Confirmado

**Decisión:** La API local espera Firebase ID token en el formato `{ id_token: "..." }`. El LoginForm debe modificarse para:
1. Integrar Firebase SDK para autenticación
2. Obtener el ID token tras ingresar email/password del usuario
3. Enviar POST a `/api/v1/auth/login` con `{ id_token: "firebase_token" }`

**Rationale:**
- La API no valida email/password directamente
- Firebase Auth actúa como identity provider
- El token debe obtenerse vía `signInWithEmailAndPassword()` de Firebase

### 5. Cookies httpOnly en localhost

**Decisión:** La API local debe setear cookies con `SameSite=Lax` o `SameSite=Strict` y `Secure=false` para localhost.

**Rationale:**
- En producción se usa `Secure=true` (HTTPS)
- En localhost HTTP, las cookies Secure no se guardan
- El backend debe tener configuración por entorno para esto

## Risks / Trade-offs

**[Riesgo] Cookies no persisten en localhost** → Mitigación: El backend debe configurar `Secure=false` para desarrollo. Verificar que la API NestJS tenga esta configuración.

**[Riesgo] Turnstile no funciona sin internet** → Mitigación: Usar la key de test que siempre pasa. Si no hay internet, el backend debe aceptar requests sin Turnstile en desarrollo.

**[Riesgo] Confusión Firebase ID token vs email/password** → Mitigación: Confirmar con el usuario antes de implementar. Si es Firebase ID token, se necesita implementar Firebase SDK en el frontend.

**[Riesgo] CORS en desarrollo** → Mitigación: La API local debe tener CORS habilitado para `http://localhost:4321` (puerto por defecto de Astro).

**[Trade-off]** No se agrega detección automática de entorno (dev/prod). El desarrollador debe cambiar `.env.local` manualmente si quiere switchear entre local y producción.

## Migration Plan

**Setup inicial (una vez):**
1. Crear `.env.local` con URLs de localhost
2. Asegurar que API NestJS esté corriendo en `localhost:3000`
3. Verificar CORS y configuración de cookies en backend

**Para cada sesión de desarrollo:**
1. Iniciar API NestJS: `cd ../Api && npm run start:dev` (o equivalente)
2. Iniciar frontend: `pnpm dev`
3. Testear login en `http://localhost:4321/login`
4. Verificar dashboard carga datos en `http://localhost:4321/admin/dashboard`

**Rollback:** Simplemente remover o renombrar `.env.local` - el frontend usará las variables de producción del entorno o `.env.example`.

## Open Questions

1. **¿El puerto de la API local es 3000 o 8080?** - El usuario confirmó 3000. `.env.example` se actualizará.

2. **¿La API NestJS local ya tiene configurado CORS y cookies para localhost?** - Necesario verificar.

3. **¿Existe un endpoint `/api/v1/auth/me` en la API local que retorne el usuario actual desde la cookie?** - Asumimos que sí basado en el código existente.

4. **¿Cómo maneja la API local las cookies httpOnly?** - La respuesta del login no incluye token en el body para el frontend, debe setear cookie httpOnly. Verificar que funcione en localhost con `Secure=false`.