# Spec Delta

## ADDED Requirements

### Requirement: Sitio público sin rutas ni código de administración

The system **SHALL** limitar `apps/web` al sitio público (landing, blog, servicios, metodología, legales y captación), sin páginas, componentes ni utilidades del panel de administración.

#### Scenario: Rutas administrativas ausentes
- **WHEN** un visitante solicita `/login` o `/admin` en el sitio público
- **THEN** el artefacto estático no contiene esas rutas
- **AND** la respuesta corresponde a una ruta no encontrada del hosting estático

#### Scenario: Bundle público sin dependencias de admin
- **WHEN** se inspecciona el build de `apps/web`
- **THEN** no incluye React islands, Firebase, Tiptap, shadcn/ui ni el helper de autenticación
- **AND** el JavaScript enviado al navegador se limita a los scripts del sitio público

#### Scenario: Sitio público sin cambios funcionales
- **WHEN** se navega por las rutas públicas existentes
- **THEN** landing, blog, servicios y metodología mantienen su contenido y comportamiento
- **AND** las llamadas públicas a la API de leads y blog siguen funcionando

### Requirement: Blog público estático regenerado por rebuild

The system **SHALL** mantener el blog público como contenido SSG y **SHALL NOT** convertirlo a SSR; el contenido nuevo aparece tras la regeneración y el redespliegue del artefacto estático.

#### Scenario: Contenido nuevo tras el rebuild
- **WHEN** se publica un artículo y se completa la regeneración del sitio público
- **THEN** el nuevo artefacto estático incluye el artículo
- **AND** los visitantes lo ven sin ejecutar Astro en un servidor

#### Scenario: Blog sin runtime de servidor
- **WHEN** un visitante carga el blog o un artículo
- **THEN** recibe HTML estático precompilado
- **AND** el hosting no necesita Node para servirlo
