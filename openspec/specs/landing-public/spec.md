# Capability: landing-public

## Purpose

Renderizar las páginas públicas de la landing page (hero, servicios, planes, metodología, contacto) en una experiencia estática rápida, accesible y coherente con la marca. El sitio genera confianza transmitiendo propuestas comerciales claras a potenciales clientes (B2B, freelance Chile web).

## Requirements

### Requirement: Renderizado estático
The system **SHALL** renderizar todas las rutas públicas como páginas de HTML estático durante el build (`output: 'static'`).

#### Scenario: Página home se sirve como HTML estático
- **Given** el sitio está construido para producción
- **When** un usuario accede a `/`
- **Then** el servidor (Hostinger) responde con HTML precompilado.

### Requirement: Datos de servicios y planes desde archivos JSON
The system **SHALL** leer `src/data/services.json` y `src/data/plans.json` en build time. The system **SHALL NOT** consultar la API para estos datos.

#### Scenario: Servicios renderizados desde JSON local
- **Given** `services.json` contiene 3 packs/paquetes
- **When** se construye `/servicios`
- **Then** las cards se generan desde el archivo JSON sin llamadas de red.

### Requirement: Información de empresa desde config
The system **SHALL** obtener metadatos del sitio (nombre, descripción, contacto, redes) desde `src/config/company.config.ts`. The system **MAY** intentar sobreescribir vía API con fallback estático.

#### Scenario: Datos de empresa fallback
- **Given** la API de SystemConfig no responde
- **When** se construye el layout
- **Then** se usa `companyConfig` estático sin romper la build.

### Requirement: Tema claro/oscuro
The system **SHALL** soportar temas claro y oscuro. Persistencia en `localStorage` con clave `theme`. Si no hay valor, seguir `prefers-color-scheme`.

#### Scenario: Cambio de tema
- **Given** el usuario hace click en el toggle de tema
- **When** se persiste en localStorage
- **Then** todas las páginas (tras navegación) respetan el tema elegido.

### Requirement: SEO básico
The system **SHALL** incluir `<title>`, `<meta description>`, Open Graph y Schema.org JSON-LD en cada página.

#### Scenario: Meta tags presentes en home
- **Given** el usuario accede a `/`
- **When** inspecciona el HTML
- **Then** encuentra `<title>`, `<meta name="description">`, og:title, og:description y un bloque `<script type="application/ld+json">` con datos de la organización.

### Requirement: Accesibilidad AA
The system **SHALL** cumplir con WCAG 2.1 AA: contraste mínimo, navegación por teclado, ARIA en componentes interactivos, focus visible.

#### Scenario: Navegación por teclado funcional
- **Given** el usuario navega con Tab
- **When** presiona secuencialmente Tab por el home
- **Then** cada enlace/botón recibe foco visible y es activable con Enter/Space.

### Requirement: Responsive mobile-first
The system **SHALL** ser completamente funcional entre 320px y 1920px de ancho. Mobile-first.

#### Scenario: Home en móvil
- **Given** viewport 375px
- **When** se carga `/`
- **Then** todas las secciones son legibles y operables sin scroll horizontal.

## ADDED Requirements

### Requirement: Design system compliance
The system **SHALL** que todos los componentes en `src/components/landing/` y `src/components/shared/` cumplan con el design system documentado en `docs/DESIGN.md`.

#### Scenario: No hex literals en componentes
- **GIVEN** un componente `.astro` o `.tsx` en `src/components/landing/` o `src/components/shared/`
- **WHEN** contiene un hex literal como `#00A3A3`, `#f59e0b`, `#556`, `#0077cc`
- **THEN** debe ser reemplazado por un token del sistema (`--color-teal`, `--color-warning`, etc.)

#### Scenario: No inline styles
- **GIVEN** un componente tiene inline styles (`style="font-size: 3rem; color: #556;"`)
- **WHEN** se detecta
- **THEN** debe ser reemplazado por clases Tailwind utility

#### Scenario: Tokens del sistema en colores
- **GIVEN** un componente usa colores
- **WHEN** se revisan los colores
- **THEN** usa tokens del sistema via clases Tailwind (`bg-primary`, `text-text-secondary`, etc.) en lugar de colores hardcoded

#### Scenario: Componentes huérfanos tienen estilos
- **GIVEN** un componente usa clases CSS no definidas en ningún archivo
- **WHEN** se detecta (build warning, inspección visual)
- **THEN** se crean estilos Tailwind en el markup del componente

### Requirement: Componentes legacy migran oportunamente
The system **SHALL** que componentes legacy con BEM en `global.css` se migren a Tailwind utility-first cuando se modifiquen.

#### Scenario: Modificación trigger migración
- **GIVEN** un componente legacy con BEM en `global.css`
- **WHEN** se modifica por cualquier razón
- **THEN** se aprovecha para migrar a Tailwind utility-first

#### Scenario: Sin modificación no se migra
- **GIVEN** un componente legacy con BEM en `global.css`
- **WHEN** no se modifica
- **THEN** no se migra automáticamente (queda como deuda técnica)