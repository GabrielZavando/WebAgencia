# Desarrollo Local con API NestJS

## Configuración Rápida

### Opción 1: Script automático (Recomendado)

```bash
pnpm link-api-local-dev
```

Este script:
- Verifica que `.env.local` exista con las variables correctas
- Verifica que la API NestJS esté configurada
- Muestra instrucciones paso a paso

### Opción 2: Manual

1. **Crear/actualizar `.env.local`**:

```bash
# Variables para desarrollo local con API
PUBLIC_API_URL=http://localhost:3000/api/v1
PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
PUBLIC_GTM_ID=

# Firebase (requerido para login)
PUBLIC_FIREBASE_API_KEY=AIzaSyAAmxImdMCtE_myXZLCJdl-tTv_w7Uig2U
PUBLIC_FIREBASE_AUTH_DOMAIN=api-web-agencia.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=api-web-agencia
PUBLIC_FIREBASE_STORAGE_BUCKET=api-web-agencia.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=31988183470
PUBLIC_FIREBASE_APP_ID=1:31988183470:web:61405275f23da485b9583f
PUBLIC_FIREBASE_MEASUREMENT_ID=G-ETYR7VH4Y7
```

2. **Iniciar la API NestJS** (en el directorio `apps/api`):

```bash
cd apps/api
pnpm start:dev
```

3. **Iniciar el frontend** (en otra terminal):

```bash
pnpm dev
```

4. **Acceder**:
   - Frontend: http://localhost:4321
   - API: http://localhost:3000/api/v1

## Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login con Firebase Auth + validación admin |
| GET | `/blog/posts` | Lista de posts del blog |
| GET | `/blog/posts/:slug` | Post individual |
| POST | `/leads/contact` | Formulario de contacto |
| GET | `/system-config` | Configuración del sistema (opcional, hay fallback estático) |

## Flujo de Login

1. Usuario ingresa email/password en `/login`
2. Firebase Auth valida credenciales
3. Cliente obtiene ID token de Firebase
4. Cliente envía token a `/auth/login` en API NestJS
5. API verifica token con Firebase Admin SDK
6. API valida que usuario tenga rol `admin`
7. Redirección a `/admin/dashboard`

## Solución de Problemas

### Error: "Firebase no está configurado"
- Verificar que las variables `PUBLIC_FIREBASE_*` estén en `.env.local`
- Reiniciar el servidor de desarrollo (`pnpm dev`)

### Error: "Token inválido"
- Verificar que Firebase Admin SDK esté configurado en la API
- Revisar que `FIREBASE_PROJECT_ID` en la API coincida con el proyecto de Firebase

### Error: "Cannot POST /api/v1/api/v1/auth/login"
- El endpoint en el frontend no debe incluir `/api/v1` (ya está en `PUBLIC_API_URL`)
- Usar solo `/auth/login` en las llamadas a `apiClient`

### Error: "Could not find widget" (Turnstile)
- Turnstile no está disponible en todas las páginas
- Para login, se desactivó `injectTurnstile` porque es una página interna

## Estructura de Directorios

```
WebAstro2/
├── API/                    # Backend NestJS
│   ├── src/
│   │   ├── auth/          # Módulo de autenticación
│   │   ├── blog/          # Módulo de blog
│   │   └── leads/         # Módulo de leads
│   └── .env               # Variables de entorno de la API
└── WebAgenciaAstro/       # Frontend Astro
    ├── src/
    │   ├── components/
    │   │   └── auth/      # LoginForm (React island)
    │   ├── lib/
    │   │   ├── api-client.ts
    │   │   └── firebase.ts
    │   └── pages/
    │       └── login/
    └── .env.local         # Variables de entorno del frontend
```
