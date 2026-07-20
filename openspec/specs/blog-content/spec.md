# Capability: blog-content

## Purpose

Mostrar posts de blog cargados en runtime (CSR) desde la API NestJS, con caché de sesión, sanitización de contenido y soporte para vista individual por slug. Generar sitemap dinámico que incluye posts publicados.

## Requirements

### Requirement: Origen de datos
The system **SHALL** obtener la lista de posts publicados desde `${PUBLIC_API_URL}/api/v1/blog/posts?status=published`.

#### Scenario: Primera visita a /blog
- **Given** sessionStorage está vacío
- **When** el usuario accede a `/blog`
- **Then** aparecen 3 skeleton cards
- **And** tras fetch + mínimo 800ms se renderizan los posts reales.

### Requirement: Cache de sesión
The system **SHALL** cachear la respuesta en `sessionStorage` con clave `blog_posts_cache` durante 5 minutos.

#### Scenario: Visita repetida en less than 5 minutes
- **Given** ya hay posts en sessionStorage
- **When** el usuario recarga `/blog`
- **Then** se sirven desde cache (sin nueva petición API).

### Requirement: Skeleton + delay mínimo
The system **SHALL** mostrar skeleton cards durante la carga. If la respuesta llega en menos de 800ms, **SHALL** esperar hasta cumplir 800ms (evita parpadeo).

#### Scenario: Skeleton visible mínimo 800ms
- **Given** la API responde en 200ms
- **When** se cargan los posts
- **Then** el skeleton permanece visible hasta completar 800ms.

### Requirement: Sanitización de contenido
The system **SHALL** quitar de cualquier HTML inyectado:
- bloques `<script>` y `<style>`
- tags estructurales `<html>`, `<head>`, `<body>`, `<meta>`, `<link>`, `<title>`, `<!DOCTYPE>`, `<?xml`
- atributos `on*` (onclick, onload, etc.)

#### Scenario: Post contiene script malicioso
- **Given** un post tiene `<script>alert(1)</script>` en su contenido
- **When** se renderiza al usuario
- **Then** el script ya no está en el DOM (sanitizado antes de inyectar).

### Requirement: Posts individuales en /blog/[...slug]
The system **SHALL** generar rutas dinámicas `/blog/<slug>` que cargan el post por slug desde la lista cacheada.

#### Scenario: Navegación a post individual
- **Given** existe un post con `slug: "mi-post"`
- **When** el usuario accede a `/blog/mi-post`
- **Then** se muestra título, contenido completo y metadata del post.

### Requirement: Filtrado por categoría (query)
The system **SHALL** soportar filtrado vía `?category=` que oculta cards que no coinciden (case-insensitive).

#### Scenario: Filtro por categoría
- **Given** el usuario accede a `/blog?category=Marketing`
- **When** los posts cargan
- **Then** solo se muestran cards con `data-category === "marketing"`.

### Requirement: Manejo de errores
The system **SHALL** mostrar mensaje amigable con icono `cloud_off` y botón "Reintentar" cuando `ApiError` ocurre (no errores técnicos al usuario final).

#### Scenario: Sin posts publicados
- **Given** la API devuelve array vacío
- **When** se limpia el skeleton
- **Then** aparece mensaje "No hay artículos publicados aún".

#### Scenario: API no responde
- **Given** la API retorna error de red
- **When** se agota el intento de fetch
- **Then** aparece mensaje de error con botón "Reintentar".

### Requirement: Sitemap dinámico
The system **SHALL** generar `/sitemap.xml` (endpoint propio `src/pages/sitemap.xml.ts`) que combina:
- Páginas estáticas: `/`, `/servicios`, `/metodologia`, `/diagnostico`, `/blog`, `/politica-de-privacidad`
- URLs dinámicas: `${PUBLIC_API_URL}/blog` filtradas por `published === true`

#### Scenario: Build sitemap con posts
- **Given** el backend responde 200 con posts publicados
- **When** se ejecuta el build
- **Then** el sitemap contiene todas las páginas estáticas + una entrada por post con `lastmod` derivado de `updatedAt`, `createdAt` o `publishedAt`.

### Requirement: Sitemap cache
The system **SHALL** enviar `Cache-Control: s-maxage=3600, stale-while-revalidate` en respuesta del sitemap.

#### Scenario: Cache headers en sitemap
- **Given** se solicita `/sitemap.xml`
- **When** se inspeccionan los headers de respuesta
- **Then** incluye `Cache-Control: s-maxage=3600, stale-while-revalidate`.