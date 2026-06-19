## REMOVED Requirements

### Requirement: Firebase client authentication
The system SHALL initialize Firebase client SDK and provide `auth` for sign-in, password reset, and token-based API calls.

**Reason**: Sin páginas privadas (admin/dashboard), no hay destino post-login ni páginas que requieran token JWT de Firebase.

**Migration**: Eliminar `src/lib/firebase/client.ts`, `firebase` dependency, y todos los imports de `firebase/auth`.

#### Scenario: Login page no existe
- **GIVEN** un sitio desplegado en SSG
- **WHEN** un usuario navega a `/login/`
- **THEN** el servidor devuelve 404 (página no encontrada)

#### Scenario: Firebase no se inicializa en cliente
- **GIVEN** el sitio sin Firebase SDK
- **WHEN** se carga cualquier página pública
- **THEN** el bundle JS no contiene código de Firebase
- **AND** no hay llamadas a `initializeApp`

### Requirement: Forgot password modal
The system SHALL provide a password reset modal using Firebase `sendPasswordResetEmail`.

**Reason**: Sin login, no hay necesidad de recuperación de contraseña.

**Migration**: Eliminar `src/components/auth/ForgotPasswordModal.astro`.

#### Scenario: ForgotPasswordModal no se renderiza
- **GIVEN** el sitio sin login ni ForgotPasswordModal
- **WHEN** se genera el build
- **THEN** el HTML no contiene referencias al modal de recuperación

### Requirement: Auth utilities (loginWithEmail, getCurrentToken)
The system SHALL provide `loginWithEmail` and `getCurrentToken` utility functions using Firebase auth.

**Reason**: Código muerto — no importado por ningún archivo activo.

**Migration**: Eliminar `src/lib/auth-utils.ts`.

#### Scenario: Build sin auth-utils
- **GIVEN** que `auth-utils.ts` fue eliminado
- **WHEN** se ejecuta `npm run build`
- **THEN** el build completa sin errores

## ADDED Requirements

### Requirement: Landing pública funciona sin Firebase
The system SHALL continue serving all public pages without relying on Firebase SDK.

#### Scenario: Build genera todas las rutas públicas
- **GIVEN** el proyecto sin Firebase SDK
- **WHEN** se ejecuta `npm run build`
- **THEN** `dist/` contiene: index.html, blog/, blog/*/, diagnostico/, politica-de-privacidad/, 404.html, suscripcion-confirmada/, unsubscribe/, metodologia/, servicios/

#### Scenario: Formularios funcionan sin Firebase
- **GIVEN** el proyecto sin Firebase SDK
- **WHEN** un usuario envía el formulario de contacto
- **THEN** el formulario hace fetch a `POST /api/v1/leads/contact` con Turnstile
- **AND** no requiere token Firebase para la petición

### Requirement: Bundle JS sin Firebase
The system SHALL NOT include Firebase SDK code in the client-side JavaScript bundle.

#### Scenario: Bundle reducido
- **GIVEN** el proyecto sin dependencia `firebase`
- **WHEN** se ejecuta `npm run build`
- **THEN** el JS generado en `dist/_astro/` no contiene referencias a Firebase
- **AND** el tamaño total del bundle se reduce en ~273 KB

### Requirement: Sin variables de entorno Firebase
The system SHALL NOT require `PUBLIC_FIREBASE_*` environment variables.

#### Scenario: Build sin variables Firebase
- **GIVEN** `.env` sin variables `PUBLIC_FIREBASE_*`
- **WHEN** se ejecuta `npm run build`
- **THEN** el build completa sin errores
- **AND** no hay advertencias sobre variables faltantes
