# Spec Delta

## Purpose

Definir la topología de despliegue del monorepo WebAstro: tres aplicaciones independientes (`web`, `admin`, `api`) con artefactos, modos de renderizado, variables de entorno y destinos de despliegue claramente separados.

## ADDED Requirements

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
