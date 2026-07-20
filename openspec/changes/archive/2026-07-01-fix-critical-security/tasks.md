## 1. JWT Secret estricto

- [x] 1.1 Escribir test que verifique que `AuthModule` lanza error si `JWT_SECRET` no está definido
- [x] 1.2 Modificar `src/auth/auth.module.ts`: eliminar fallback `'default-secret-change-in-production'`, lanzar error si falta
- [x] 1.3 Modificar `src/auth/strategies/jwt.strategy.ts`: eliminar fallback, lanzar error si falta
- [x] 1.4 Actualizar `.env.example`: agregar `JWT_SECRET=` y eliminar clave privada truncada
- [x] 1.5 Actualizar `docker/docker-compose.yml`: agregar `JWT_SECRET=${JWT_SECRET}`
- [x] 1.6 Ejecutar tests y verificar que pasan

## 2. OptionalAuthGuard

- [x] 2.1 Escribir test unitario para `OptionalAuthGuard`: sin token → permite request
- [x] 2.2 Escribir test: token inválido → lanza `UnauthorizedException`
- [x] 2.3 Escribir test: token válido → adjunta usuario al request
- [x] 2.4 Implementar `src/common/guards/optional-auth.guard.ts`
- [x] 2.5 Modificar `src/articles/articles.controller.ts`: reemplazar verificación manual con `@UseGuards(OptionalAuthGuard)` en `findAll()`
- [x] 2.6 Actualizar types de `@CurrentUser()` para permitir `null`
- [x] 2.7 Ejecutar tests y verificar que pasan

## 3. CORS explícito

- [x] 3.1 Escribir test E2E que verifique header `Access-Control-Allow-Origin` en respuesta
- [x] 3.2 Agregar `CORS_ORIGIN` a `.env.example`
- [x] 3.3 Modificar `src/main.ts`: agregar `app.enableCors()` con configuración
- [x] 3.4 Ejecutar tests y verificar que pasan

## 4. Token revocation

- [x] 4.1 Escribir test unitario que verifique que `verifyIdToken` se llama con `checkRevoked=true`
- [x] 4.2 Modificar `src/firebase/firebase.service.ts`: pasar `true` como segundo argumento
- [x] 4.3 Ejecutar tests y verificar que pasan

## 5. Rate limiting

- [x] 5.1 Instalar `@nestjs/throttler`: `npm install @nestjs/throttler`
- [x] 5.2 Escribir test que verifique que exceder el límite retorna 429
- [x] 5.3 Configurar `ThrottlerModule.forRoot()` en `AppModule`
- [x] 5.4 Configurar `ThrottlerGuard` como guard global en `main.ts`
- [x] 5.5 Ejecutar tests y verificar que pasan

## 6. Helmet

- [x] 6.1 Instalar `helmet`: `npm install helmet`
- [x] 6.2 Escribir test E2E que verifique headers de seguridad (X-Content-Type-Options, X-Frame-Options)
- [x] 6.3 Modificar `src/main.ts`: agregar `app.use(helmet())` antes de CORS y pipes
- [x] 6.4 Ejecutar tests y verificar que pasan

## 7. Documentación

- [x] 7.1 Actualizar `docs/api-spec.yml` si es necesario (no se esperan cambios en contratos)
- [x] 7.2 Verificar que `.env.example` refleja todas las variables requeridas

## 8. Verificación final

- [x] 8.1 Ejecutar `npm run build` y verificar que no hay errores de compilación
- [x] 8.2 Ejecutar `npm run lint` y corregir cualquier problema
- [x] 8.3 Ejecutar `npm run test` y confirmar que todos los tests pasan
- [x] 8.4 Ejecutar `npm run test:e2e` y verificar que los tests E2E pasan

## 9. Scenario coverage verification

- [x] 9.1 Map each Gherkin scenario in specs to actual test file + test name
- [x] 9.2 Fix spec/code mismatch: X-Frame-Options (DENY → SAMEORIGIN), preflight status (200 → 204)
- [x] 9.3 Add E2E test: unauthenticated GET /articles returns published articles only (`test/auth-optional.e2e-spec.ts`)
- [x] 9.4 Add E2E test: invalid token on GET /articles returns 401 (`test/auth-optional.e2e-spec.ts`)
- [x] 9.5 Add E2E test: revoked token returns 401 (`test/auth-optional.e2e-spec.ts`)
- [x] 9.6 Add E2E test: authenticated user can filter by status=draft (`test/auth-optional.e2e-spec.ts`)
- [x] 9.7 Run full test suite: 89 unit + 13 E2E = 102 tests all passing

## 10. Commit

- [ ] 10.1 Crear commit con mensaje: `fix(security): eliminate critical vulnerabilities (JWT, auth bypass, CORS, helmet, rate-limit)`
