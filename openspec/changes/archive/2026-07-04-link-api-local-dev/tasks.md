## 1. Configuración de entorno local

- [x] 1.1 Crear archivo `.env.local` con `PUBLIC_API_URL=http://localhost:3000/api/v1` y demás variables necesarias
- [x] 1.2 Actualizar `.env.example` con comentarios actualizados sobre desarrollo local vs producción
- [x] 1.3 Verificar que `api-client.ts` usa correctamente las variables de entorno en desarrollo

## 2. Documentación de setup

- [x] 2.1 Crear sección en README.md explicando cómo configurar API local
- [x] 2.2 Documentar requisitos previos (API NestJS corriendo en localhost:3000)
- [x] 2.3 Documentar comandos para iniciar frontend y API en paralelo

## 3. Integración de Firebase Auth

- [x] 3.1 Instalar Firebase SDK (`firebase` package) si no está instalado
- [x] 3.2 Crear módulo `src/lib/firebase.ts` con configuración de Firebase Auth
- [x] 3.3 Configurar Firebase para desarrollo local (usar emulador o proyecto de test)
- [x] 3.4 Obtener variables de entorno para Firebase config (`PUBLIC_FIREBASE_API_KEY`, etc.)

## 4. Modificación del LoginForm para Firebase ID token

- [x] 4.1 Modificar `LoginForm.tsx` para integrar Firebase Auth
- [x] 4.2 Implementar `signInWithEmailAndPassword()` para obtener credenciales de Firebase
- [x] 4.3 Obtener el ID token vía `user.getIdToken()` tras autenticación exitosa
- [x] 4.4 Cambiar payload de login de `{ email, password }` a `{ id_token: "firebase_token" }`
- [x] 4.5 Manejar errores específicos de Firebase Auth (email/password incorrectos)
- [x] 4.6 Manejar respuesta de API: `{ data: { user: {...} }, meta: {...} }`
- [x] 4.7 Manejar error 401 de API: `{ error: "Unauthorized", message: "Token inválido o expirado" }`
- [ ] 4.8 Testear login exitoso contra API local
- [ ] 4.9 Testear login fallido (token inválido) contra API local

## 5. Validación del dashboard admin

- [ ] 5.1 Verificar que `/api/v1/auth/me` responde correctamente con sesión activa
- [ ] 5.2 Testear carga de estadísticas desde `/api/v1/stats/summary`
- [ ] 5.3 Testear carga de leads recientes desde `/api/v1/leads/recent`
- [ ] 5.4 Verificar fallback a datos mock cuando API no responde
- [ ] 5.5 Testear logout y redirección a login

## 6. Validación de CORS y cookies

- [ ] 6.1 Verificar que la API local tiene CORS habilitado para `http://localhost:4321`
- [ ] 6.2 Verificar que las cookies httpOnly se setean correctamente en localhost (Secure=false)
- [ ] 6.3 Testear persistencia de sesión al recargar página

## 7. Testing y verificación final

- [ ] 7.1 Ejecutar tests unitarios existentes (`pnpm test`) - **Actualizar tests del LoginForm para Firebase ID token**
- [x] 7.2 Verificar que no hay errores de TypeScript (`pnpm astro check`) - Solo warnings legacy
- [ ] 7.3 Testear flujo completo: login → dashboard → logout - **Requiere API local corriendo**
- [ ] 7.4 Documentar cualquier issue encontrado y resolverlo