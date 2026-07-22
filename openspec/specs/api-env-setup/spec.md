# Capability: api-env-setup

## Purpose

Configurar las variables de entorno de la API NestJS para que Firebase Admin SDK se inicialice correctamente y la capa Prisma esté lista para conectarse a Supabase.

## Requirements

### Requirement: Firebase Admin SDK initialization
The system **SHALL** initialize Firebase Admin SDK con credenciales de service account al iniciar la API.

#### Scenario: API inicia con Firebase Admin SDK
- **GIVEN** el archivo `apps/api/.env` existe con `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`
- **WHEN** la API ejecuta `npm run start:dev`
- **THEN** `FirebaseService.onModuleInit()` completa sin errores
- **AND** el log muestra "Firebase Admin SDK initialized successfully"

#### Scenario: API falla sin credenciales de Firebase
- **GIVEN** el archivo `.env` no existe o falta alguna de las 3 variables de Firebase
- **WHEN** la API intenta iniciar
- **THEN** `FirebaseService.onModuleInit()` lanza Error "Firebase configuration is incomplete"

### Requirement: Prisma client dependency
The system **SHALL** tener `@prisma/client` como dependencia runtime en `apps/api/package.json`.

#### Scenario: Prisma client instalado
- **GIVEN** se ejecuta `pnpm install` en la API
- **WHEN** se inspecciona `node_modules/@prisma/client`
- **THEN** el paquete existe y es importable

#### Scenario: Prisma client generado
- **GIVEN** se ejecuta `npx prisma generate`
- **WHEN** se verifica el cliente generado
- **THEN** los tipos para `Lead` y `ContactMessage` están disponibles

### Requirement: PrismaModule lifecycle
The system **SHALL** proveer un `PrismaModule` global con `PrismaService` que gestiona la conexión a PostgreSQL via lifecycle hooks.

#### Scenario: Conexión al iniciar
- **GIVEN** la API inicia con `DATABASE_URL` definido
- **WHEN** `PrismaService.onModuleInit()` se ejecuta
- **THEN** la conexión a PostgreSQL se establece exitosamente

#### Scenario: Desconexión al apagar
- **GIVEN** la API está corriendo con conexión activa
- **WHEN** se recibe señal SIGTERM o se ejecuta graceful shutdown
- **THEN** `PrismaService.onModuleDestroy()` cierra la conexión limpiamente

#### Scenario: Sin DATABASE_URL
- **GIVEN** la variable `DATABASE_URL` no está definida en `.env`
- **WHEN** la API inicia
- **THEN** la API arranca correctamente (sin Prisma)
- **AND** `PrismaService.isConnected()` retorna `false`

### Requirement: Environment file structure
The system **SHALL** tener un archivo `apps/api/.env` con las siguientes secciones:

#### Scenario: Estructura del .env
- **GIVEN** se inspecciona `apps/api/.env`
- **WHEN** se lee el archivo
- **THEN** contiene las secciones: Aplicación, CORS, Firebase Admin SDK, y Supabase/PostgreSQL
- **AND** `FIREBASE_PROJECT_ID` tiene el valor del proyecto (`api-web-agencia`)
- **AND** `FIREBASE_CLIENT_EMAIL` tiene el email del service account
- **AND** `FIREBASE_PRIVATE_KEY` tiene la private key formateada con `\n`
- **AND** `DATABASE_URL` tiene un placeholder con comentario indicando que falta Supabase

### Requirement: .env file security
The system **SHALL** excluir el archivo `.env` del control de versiones.

#### Scenario: .env en gitignore
- **GIVEN** se verifica `.gitignore` de `apps/api/`
- **WHEN** se busca la entrada `.env`
- **THEN** `.env` está excluido del tracking de git
