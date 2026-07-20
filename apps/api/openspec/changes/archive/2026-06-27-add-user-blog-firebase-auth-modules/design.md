## Context

El proyecto usa NestJS 11 con Clean Architecture. La API está versionada en `/api/v1/`. Existen las especificaciones `api-spec.yml` y `data-model.md` que definen los contratos y el modelo de datos.

**Estado actual:**
- Scaffold base de NestJS funcionando
- Endpoints de salud (`/health`)
- Sin módulos implementados

**Stack definido:**
- Runtime: Node.js 20 LTS
- ORM: Prisma 6 (para Supabase PostgreSQL - leads)
- Firebase Admin SDK (Firestore y Auth)
- Validation: class-validator + class-transformer

**Restricciones:**
- Firebase service account key en variable de entorno (nunca hardcodeada)
- Mensajes de API en español latinoamericano neutro
- Código en inglés

## Goals / Non-Goals

**Goals:**
- Implementar módulos de Firebase, Auth, Users, Categories, Articles siguiendo Clean Architecture
- Autenticación via Firebase Auth con JWT custom para la API
- Control de acceso basado en roles (admin/editor)
- CRUD completo según `api-spec.yml`
- Responses consistentes `{ data, meta }` y errores `{ error, message, statusCode }`

**Non-Goals:**
- No implementar el módulo de Leads (Supabase PostgreSQL) — queda para otro change
- No implementar features como password reset, email verification
- No implementar rate limiting (futuro)
- No implementar uploads de archivos (Cover URLs son solo strings)

## Decisions

### Decisión 1: Arquitectura de módulos

**Opción elegida:** Clean Architecture con Modules → Controllers → Services → Repositories → Firestore

**Alternativas consideradas:**
- Services directamente con Firestore client: Mezcla responsabilidades, difícil de testear
- Arquitectura simple (Controllers + Services): Carece de abstracción de datos

**Justificación:** Separación clara de responsabilidades. Los repositories permiten mocks en tests y facilitan cambiar la fuente de datos si es necesario.

---

### Decisión 2: Estructura de módulos NestJS

**Opción elegida:**
```
src/
├── common/           # Decorators, guards, filters compartidos
├── firebase/         # Módulo singleton con FirebaseApp
├── auth/             # Login, JWT strategy, guards
├── users/            # CRUD usuarios
├── categories/       # CRUD categorías
└── articles/         # CRUD artículos
```

**Justificación:** Cada dominio tiene su propio módulo con controllers, services, repositories y DTOs. Común agrupado en `common/`.

---

### Decisión 3: Autenticación JWT

**Opción elegida:**
1. Cliente envía Firebase ID token (`id_token`) a `/auth/login`
2. Backend verifica token con Firebase Admin SDK
3. Si válido, busca/crea usuario en Firestore `users`
4. Genera JWT propio con `{ userId, email, role }`
5. Cliente usa este JWT en header `Authorization: Bearer <token>`

**Alternativas consideradas:**
- Usar Firebase ID token directamente en cada request: No permite expires personalizados ni info adicional en token
- Sesiones con refresh tokens: Más complejo, no necesario para API stateless

**Justificación:** JWT propio da flexibilidad de expires, permite info adicional (role), y desacopla la API de Firebase para future Auth provider.

---

### Decisión 4: Guards de autenticación y roles

**Opción elegida:**
- `@AuthGuard()`: Verifica JWT propio, extrae user del request
- `@RolesGuard()`: Verifica que el usuario tiene el rol requerido

**DTOs de respuesta:**
```typescript
// Éxito
{ data: T, meta?: { message: string, pagination?: Pagination } }

// Error
{ error: string, message: string, statusCode: number }
```

**Justificación:** Guards como decorators permiten composabilidad. Responses consistentes facilitan el consumo del cliente.

---

### Decisión 5: Validación de DTOs

**Opción elegida:**
- DTOs con decorators de `class-validator` (IsEmail, IsString, IsEnum, etc.)
- ValidationPipe a nivel global en `main.ts`

**Justificación:** Centraliza la validación, genera errores automáticos con mensajes claros. Compatible con class-transformer para sanitización.

---

### Decisión 6: Repositories Firestore

**Opción elegida:**
```typescript
// Repository interface + Implementation
interface IUsersRepository {
  findAll(pagination): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}
```

**Justificación:** Interface permite testing con mocks. Firestore SDK se inyecta en el constructor.

---

### Decisión 7: Slugs únicos

**Opción elegida:**
- Verificar unicidad en el service antes de crear/actualizar
- Query a Firestore por slug

**Justificación:** Firestore no tiene constraints uniques nativas. Se valida application-level y se devuelve error 400 si existe.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Firebase SDK errors (network, quota) | Try-catch con errores mapeados a 500/503 |
| Concurrent slug writes | Optimistic locking con last_update timestamp |
| Large article content storage | Límite de contenido en DTO (sin límite práctico en Firestore) |
| User upsert race condition | Firestore transactions para crear/actualizar |
| JWT secret exposure | Variable de entorno `JWT_SECRET`, rotate periódicamente |

## Migration Plan

1. Crear módulos en branches separados o Feature Flags si es necesario
2. Deployar primero `/health` y verificar
3. Deployar módulos uno a uno con rollback disponible
4. No hay migración de datos (Firestore collections nuevas)

## Open Questions

1. **¿Seed data inicial?** ¿Categorías o artículos de prueba necesarios?
2. **¿Rate limiting?** ¿Implementar ahora o después?
3. **Firebase project:** ¿Usar el mismo para dev y prod o proyectos separados?