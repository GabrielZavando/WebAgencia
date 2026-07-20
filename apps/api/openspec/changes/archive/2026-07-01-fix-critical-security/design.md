## Context

El proyecto Líder Digital usa **NestJS** con Firebase Auth (JWT) y Firebase Firestore. Actualmente tiene múltiples vulnerabilidades de seguridad que deben resolverse antes de agregar funcionalidad (como el módulo Leads). El estándar del proyecto (`backend-standards.md`) exige: CORS explícito, autenticación JWT, rate limiting en endpoints públicos, y headers de seguridad.

Las vulnerabilidades identificadas incluyen:
- JWT secret hardcodeado como fallback
- Auth falsa en el listado de artículos (solo verifica formato del header)
- Sin CORS configurado
- Sin rate limiting
- Sin verificación de revocación de tokens
- Sin headers de seguridad (Helmet)
- Clave privada Firebase en `.env.example`

## Goals / Non-Goals

**Goals:**
- Eliminar el fallback de JWT secret peligroso y forzar su definición al arrancar.
- Implementar autenticación opcional real en el listado de artículos.
- Configurar CORS explícito con origen configurable.
- Habilitar verificación de revocación de tokens Firebase.
- Agregar rate limiting con `@nestjs/throttler`.
- Agregar helmet para headers de seguridad.
- Sanitizar `.env.example` y `docker-compose.yml`.

**Non-Goals:**
- ConfigModule centralizado (se propone en `fix-code-quality-high`).
- Sanitización XSS de inputs de texto (requiere decisión sobre librería).
- Logging JSON estructurado (se propone en `fix-medium-issues`).
- Módulo Leads (se propone en `add-leads-module`).

## Decisions

### 1. JWT Secret estricto (sin fallback)

**Decisión:** Eliminar `process.env.JWT_SECRET || 'default-secret-change-in-production'`. En su lugar, lanzar un `Error` si la variable no está definida.

**Implementación en `auth.module.ts`:**
```ts
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

**Implementación en `jwt.strategy.ts`:**
```ts
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: jwtSecret,
});
```

**Alternativa considerada:** Usar `ConfigService` de `@nestjs/config` → Rechazado porque requiere refactor mayor (agregar `ConfigModule` global). Se propone en un change separado (`fix-code-quality-high`).

### 2. OptionalAuthGuard

**Decisión:** Crear un guard personalizado `OptionalAuthGuard` que:
- Si no hay header `Authorization` → permite el request sin usuario autenticado.
- Si hay header `Authorization` pero el token es inválido → retorna 401.
- Si hay header `Authorization` y el token es válido → adjunta el usuario al request.

**Implementación:**
```ts
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token → allow request without user
      request.user = null;
      return true;
    }

    const token = authHeader.substring(7);
    try {
      const decoded = await this.firebaseService.verifyIdToken(token);
      request.user = {
        userId: decoded.uid,
        email: decoded.email,
        role: decoded.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'Token inválido',
        statusCode: 401,
      });
    }
  }
}
```

**Uso en `articles.controller.ts` `findAll()`:**
```ts
@Get()
@UseGuards(OptionalAuthGuard)
async findAll(
  @Query() query: QueryArticlesDto,
  @CurrentUser() user: CurrentUserData | null,
): Promise<...> {
  const isAuthenticated = !!user;

  if (isAuthenticated) {
    filters.status = query.status || ArticleStatus.PUBLISHED;
  } else {
    filters.status = ArticleStatus.PUBLISHED;
  }
  // ...
}
```

**Alternativa considerada:** Dos endpoints separados (`GET /articles` público, `GET /articles/drafts` autenticado) → Rechazado porque duplica la lógica y viola REST.

### 3. CORS explícito

**Decisión:** Configurar `app.enableCors()` en `main.ts` con origen configurable.

**Implementación:**
```ts
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4321';
app.enableCors({
  origin: corsOrigin.split(','),
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

### 4. Token revocation

**Decisión:** Cambiar `verifyIdToken(idToken)` a `verifyIdToken(idToken, true)` para verificar revocación.

**Razón:** Cuando un usuario es deshabilitado en Firebase Auth, su token debe ser rechazado. `checkRevoked = true` hace esta verificación.

### 5. Rate limiting con @nestjs/throttler

**Decisión:** Instalar `@nestjs/throttler` y configurar como guard global con throttling por defecto.

**Configuración:**
```ts
// main.ts
ThrottlerModule.forRoot([
  {
    name: 'default',
    ttl: 60000, // 1 minute
    limit: 100,
  },
])
```

Para endpoints públicos (cuando se implementen Leads):
```ts
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 20, ttl: 60000 } })
```

### 6. Helmet

**Decisión:** Instalar `helmet` y configurar `app.use(helmet())` antes de otras configuraciones.

**Headers habilitados por defecto:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (si HTTPS)
- `X-XSS-Protection`
- `Referrer-Policy`

### 7. Sanitizar .env.example

**Decisión:** Reemplazar la clave privada truncada con placeholder `REPLACE_ME` y agregar variables faltantes.

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nREPLACE_ME\n-----END PRIVATE KEY-----\n"
JWT_SECRET=
CORS_ORIGIN=http://localhost:4321
```

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Rate limiting bloquea usuarios legítimos | 100 req/min es generoso para uso normal. Se puede ajustar por endpoint con `@Throttle()`. |
| Helmet bloquea scripts inline del frontend | No afecta al backend; el frontend usa CSP propio si es necesario. |
| Token revocation agrega latencia a cada request auth | La verificación de revocación es una llamada a Firebase Auth (~10ms). Aceptable para la seguridad ganada. |
| OptionalAuthGuard tiene más complejidad que la verificación manual | La complejidad se justifica por la corrección: token inválido → 401, no token → permite. |
| CORS_ORIGIN hardcodeado en código | Es configurable vía env var. Alternativa: usar `ConfigService` (propuesto en `fix-code-quality-high`). |

## Migration Plan

1. **Preparación:**
   - Agregar `JWT_SECRET` al `.env` local con un valor seguro (ej: `openssl rand -hex 32`).
   - Ejecutar `npm install @nestjs/throttler helmet`.

2. **Implementación (TDD):**
   - Implementar cada tarea con test fallido primero.
   - Verificar que tests existentes sigan pasando.

3. **Verificación:**
   - `npm run build` — sin errores de compilación.
   - `npm run test` — todos los tests pasan.
   - `npm run lint` — sin warnings de seguridad.

4. **Despliegue:**
   - Actualizar variables de entorno en el servidor de producción.
   - Desplegar con `npx prisma migrate deploy` + `node dist/main.js`.

**Rollback:** Revertir el commit. No hay cambios de esquema de BD.

## Open Questions

1. **CORS_ORIGIN:** ¿Cuál es el dominio exacto del frontend en producción? (Se puede configurar después con la variable de entorno).
2. **Rate limiting de Leads:** ¿Los endpoints de Leads ya están implementados, o se agregarán con este change? (Respuesta: no están implementados; se agregará rate limiting preparado para ellos).
3. **Helmet CSP:** ¿El frontend necesita `Content-Security-Policy` personalizado o Helmet con defaults es suficiente?
