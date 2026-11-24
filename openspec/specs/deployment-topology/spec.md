# deployment-topology Specification

## Purpose

Definir la topología de despliegue del monorepo WebAstro: tres aplicaciones independientes (`web`, `admin`, `api`) con artefactos, modos de renderizado, variables de entorno y destinos de despliegue claramente separados.

## Requirements

### Requirement: Tres aplicaciones desplegables de forma independiente

The system **SHALL** organizar el monorepo en tres aplicaciones desplegables de forma independiente: `apps/web` (sitio público), `apps/admin` (panel de administración) y `apps/api` (API NestJS).

#### Scenario: Build independiente por aplicación
- **WHEN** se ejecuta el build filtrado de una aplicación (`@webastro/web`, `@webastro/admin` o `@webastro/api`)
- **THEN** solo se genera el artefacto de esa aplicación
- **AND** no se requiere construir ni desplegar las otras dos

#### Scenario: Un fallo de build no bloquea otros despliegues
- **WHEN** el build de una aplicación falla en CI
- **THEN** las otras aplicaciones conservan su artefacto y pueden desplegarse por separado

### Requirement: Sitio público con salida estática

The system **SHALL** compilar `apps/web` con `output: 'static'` y sin adaptador de servidor, produciendo únicamente HTML, CSS y assets estáticos.

#### Scenario: El artefacto web no contiene servidor
- **WHEN** se inspecciona `apps/web/dist/`
- **THEN** no existen archivos de servidor (`server`, `entry.mjs`, `.cjs`) ni middlewares
- **AND** la configuración de Astro no declara `adapter`

#### Scenario: El sitio público se sirve sin runtime Node
- **WHEN** el artefacto de `apps/web` se publica en un hosting estático o CDN
- **THEN** todas las rutas públicas responden sin ejecutar código Node en el servidor

### Requirement: Panel de administración con salida de servidor

The system **SHALL** compilar `apps/admin` con `output: 'server'` y el adaptador `@astrojs/node` en modo `standalone`, produciendo una entrada de servidor Node ejecutable.

#### Scenario: El artefacto admin contiene entrada de servidor
- **WHEN** se inspecciona el artefacto de build de `apps/admin`
- **THEN** existe `dist/server/entry.mjs`
- **AND** la configuración de Astro declara `output: 'server'` y el adaptador `@astrojs/node`

#### Scenario: El panel arranca como proceso Node
- **WHEN** se ejecuta `node ./dist/server/entry.mjs` con las variables de entorno requeridas
- **THEN** el servidor queda escuchando en el puerto configurado
- **AND** responde las rutas `/login` y `/admin` con HTML renderizado en servidor

### Requirement: Variables de entorno por aplicación

The system **SHALL** documentar y separar las variables de entorno requeridas por cada aplicación, sin compartir secretos entre ellas.

#### Scenario: Variables del sitio público
- **WHEN** se construye `apps/web`
- **THEN** solo requiere variables con prefijo `PUBLIC_` y ninguna credencial de servidor

#### Scenario: Variables del panel admin
- **WHEN** se construye y ejecuta `apps/admin`
- **THEN** requiere `PUBLIC_API_URL` y la configuración pública de Firebase en build time
- **AND** acepta `PORT` y `HOST` en runtime para el adaptador Node

#### Scenario: Variables de la API
- **WHEN** se ejecuta `apps/api`
- **THEN** requiere las credenciales de Firebase Admin, Supabase y la configuración de CORS y webhook
- **AND** ninguna de esas credenciales se expone en `apps/web` ni en `apps/admin`

### Requirement: Integración con Coolify por tipo de aplicación

The system **SHALL** documentar el despliegue de cada aplicación en Coolify con el tipo de recurso correspondiente: Static Site para `web`, Web Application Node para `admin` y Web Application Nixpacks para `api`.

#### Scenario: Despliegue del sitio público
- **WHEN** se configura `apps/web` en Coolify
- **THEN** se usa un recurso Static Site con directorio de publicación `apps/web/dist`

#### Scenario: Despliegue del panel admin
- **WHEN** se configura `apps/admin` en Coolify
- **THEN** se usa un recurso Web Application con comando de inicio `node ./dist/server/entry.mjs`
- **AND** se define un dominio propio para el panel

#### Scenario: Despliegue de la API
- **WHEN** se configura `apps/api` en Coolify
- **THEN** se usa un recurso Web Application con build Nixpacks
- **AND** se define un dominio propio para la API

### Requirement: CORS entre aplicaciones desplegadas

The system **SHALL** permitir que la API acepte peticiones del sitio público y del panel admin mediante una lista de orígenes configurable.

#### Scenario: Orígenes separados
- **WHEN** `CORS_ORIGIN` contiene las URLs del sitio público y del panel admin separadas por coma
- **THEN** la API acepta peticiones autenticadas desde ambos orígenes
- **AND** rechaza orígenes no listados

#### Scenario: Dominio del panel habilitado
- **WHEN** el panel admin llama a la API con su dominio de producción
- **THEN** la petición pasa el control de CORS
- **AND** el header `Authorization` está permitido

### Requirement: Imagen Docker de la API multi-etapa

The system **SHALL** proveer una imagen Docker multi-etapa para `apps/api` basada en Node 26 y pnpm, sin Prisma ni dependencias de base de datos local, que compile `nest build` y ejecute el proceso como usuario no-root.

#### Scenario: Build de imagen de la API
- **WHEN** se construye la imagen de `apps/api` desde la raíz del monorepo con el Dockerfile correspondiente
- **THEN** la etapa de builder instala dependencias con pnpm y genera `apps/api/dist/`
- **AND** la imagen final no contiene Prisma, `package-lock.json` ni el directorio `prisma/`

#### Scenario: Arranque no-root de la API
- **WHEN** el contenedor de la API arranca
- **THEN** el proceso se ejecuta como usuario no-root
- **AND** escucha en el puerto definido por `PORT` (por defecto 3000) y responde `GET /health`

### Requirement: Imagen Docker del sitio público estática

The system **SHALL** proveer una imagen Docker multi-etapa para `apps/web` cuyo builder compile el SSG con pnpm y Node 26 y cuyo runner sirva únicamente el contenido estático de `apps/web/dist/` con un servidor web (sin runtime Node en producción).

#### Scenario: Build de imagen del sitio público
- **WHEN** se construye la imagen de `apps/web` desde la raíz del monorepo
- **THEN** la etapa de builder ejecuta `astro build` con el workspace pnpm completo
- **AND** la imagen final contiene solo el artefacto estático y el servidor web (Nginx), sin fuentes ni `node_modules`

#### Scenario: Servicio estático sin Node
- **WHEN** el contenedor de `apps/web` recibe una petición HTTP a una ruta pública
- **THEN** responde el HTML estático generado en build
- **AND** ningún proceso Node ejecuta código de la aplicación en runtime

### Requirement: Imagen Docker del panel admin Node standalone

The system **SHALL** proveer una imagen Docker multi-etapa para `apps/admin` cuyo builder compile el SSR con pnpm y Node 26 y cuyo runner ejecute `node ./dist/server/entry.mjs` como proceso standalone.

#### Scenario: Build de imagen del panel admin
- **WHEN** se construye la imagen de `apps/admin` desde la raíz del monorepo
- **THEN** la etapa de builder ejecuta `astro build` y genera `dist/server/entry.mjs` con su directorio `dist/client`
- **AND** la imagen final copia el artefacto completo (`dist/`) y las dependencias necesarias para ejecutar el entrypoint

#### Scenario: Arranque standalone del panel
- **WHEN** el contenedor de `apps/admin` arranca con `HOST=0.0.0.0`
- **THEN** el servidor Node escucha en el puerto definido por `PORT` (por defecto 4321)
- **AND** responde las rutas `/login` y `/admin` con HTML renderizado en servidor

### Requirement: Orquestación local con docker-compose

The system **SHALL** proveer un `docker-compose.yml` en la raíz del monorepo que orqueste los tres servicios (`web`, `admin`, `api`) con mapeo de puertos host→contenedor explícito y variables de entorno configurables por `.env`, sin servicios de base de datos.

#### Scenario: Puertos mapeados sin colisiones
- **WHEN** se ejecuta `docker compose up` desde la raíz del monorepo
- **THEN** `api` escucha internamente en 3000 y se mapea al host en 3000
- **AND** `admin` escucha internamente en 4321 y se mapea al host en 4322
- **AND** `web` se mapea al host en 4321
- **AND** no se declaran servicios de PostgreSQL, Prisma ni otras bases de datos

#### Scenario: Configuración por variables de entorno
- **WHEN** el compose define las variables de las apps (CORS, Firebase, Supabase, webhook)
- **THEN** los valores provienen del archivo `.env` raíz o del entorno
- **AND** ningún secreto está hardcodeado en el compose

### Requirement: Contexto de build de workspace optimizado

The system **SHALL** proveer un `.dockerignore` en la raíz que excluya artefactos irrelevantes (`node_modules`, `.git`, `dist`, archivos de entorno) del contexto de build, y los Dockerfiles **MUST** construir desde la raíz del monorepo para incluir `pnpm-workspace.yaml`, `pnpm-lock.yaml` y `packages/shared-types`.

#### Scenario: Contexto excluye dependencias locales
- **WHEN** se envía el contexto de build de cualquier aplicación
- **THEN** el contexto excluye `node_modules`, `.git`, `dist` de builds previos y `.env` con secretos
- **AND** incluye `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `package.json` raíz y `packages/shared-types/`

#### Scenario: Paridad del paquete compartido
- **WHEN** se compila `apps/web` o `apps/admin` dentro de su builder
- **THEN** el build resuelve `@webastro/shared-types` desde el workspace
- **AND** no se necesita publicar el paquete externamente

### Requirement: Documentación de despliegue contenedorizado

The system **SHALL** mantener `docs/deployment.md` como referencia de los comandos de build de imagen, el run local con compose y la configuración esperada de cada aplicación en Coolify, coherente con la topología contenedorizada.

#### Scenario: Documentación actualizada
- **WHEN** un desarrollador consulta `docs/deployment.md` para desplegar
- **THEN** encuentra los comandos exactos de build/run por aplicación y del compose raíz
- **AND** las instrucciones de Coolify (tipo de recurso, comando de inicio, variables) coinciden con los Dockerfiles y compose definidos
