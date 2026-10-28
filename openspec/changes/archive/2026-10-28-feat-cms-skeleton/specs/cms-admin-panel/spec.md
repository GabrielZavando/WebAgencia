# Spec Delta

## Purpose

Definir el esqueleto del panel de administración del CMS: el shell en `/admin` (sidebar, header, área de contenido), la base de componentes shadcn/ui integrada a los tokens del design system, y la página de prueba del editor Tiptap con extensión de imágenes preparada para URLs de Firebase Storage.

## ADDED Requirements

### Requirement: Layout base del panel de administración
The system **SHALL** renderizar `/admin` como shell administrativo (sidebar + header + área de contenido) construido con Tailwind utility-first, tokens del design system y componentes shadcn/ui, reemplazando el placeholder, sin llamadas a la API ni datos de ejemplo.

#### Scenario: /admin renderiza el shell
- **WHEN** un usuario accede a `/admin`
- **THEN** ve un sidebar con navegación, un header y un área de contenido principal
- **AND** no se realiza ninguna llamada a la API

#### Scenario: Sidebar colapsable en mobile
- **GIVEN** un viewport menor a 1024px
- **WHEN** el usuario activa el botón del menú (con `aria-label`)
- **THEN** el sidebar se muestra/oculta sin recargar la página

#### Scenario: El shell sigue el tema del sitio
- **GIVEN** el sitio en modo claro u oscuro
- **WHEN** se renderiza el shell
- **THEN** usa tokens del sistema (`bg-surface`, `text-text`, `border-border`) y cambia con el tema

### Requirement: Base de shadcn/ui configurada
The system **SHALL** tener shadcn/ui configurado en `apps/web`: `components.json`, utilidad `cn()` en `src/lib/utils.ts`, y variables CSS de shadcn mapeadas a los tokens del design system (temas claro y oscuro).

#### Scenario: cn combina y deduplica clases
- **WHEN** se invoca `cn("px-2", cond && "py-1", "px-4")`
- **THEN** retorna las clases combinadas con tailwind-merge (el `px` conflictivo queda resuelto)

#### Scenario: Componentes shadcn usan los colores del sitio
- **WHEN** se renderiza un componente shadcn/ui
- **THEN** sus colores provienen de las variables puente mapeadas a los tokens del design system

### Requirement: Página de prueba del editor Tiptap
The system **SHALL** exponer `/admin/blog/editor-test` que renderiza una isla React con el editor Tiptap (componentes shadcn-tiptap), con toolbar y salida JSON visible.

#### Scenario: La isla monta el editor
- **WHEN** un usuario accede a `/admin/blog/editor-test`
- **THEN** se renderiza la toolbar y un área de contenido editable
- **AND** el usuario puede escribir texto con formato

#### Scenario: Salida JSON del documento
- **GIVEN** contenido escrito en el editor
- **WHEN** se consulta la vista JSON
- **THEN** se muestra un documento Tiptap con `type: 'doc'` y array `content` (mismo formato que consume la API)

### Requirement: Extensión de imágenes preparada para Storage
The system **SHALL** configurar la extensión de imágenes de Tiptap para insertar imágenes por URL (preparada para URLs de Firebase Storage), sin subida de archivos en este change.

#### Scenario: Insertar imagen por URL
- **GIVEN** el editor montado
- **WHEN** el usuario inserta una URL de imagen
- **THEN** el nodo `image` se agrega al documento y se previsualiza

#### Scenario: Sin subida de archivos
- **WHEN** se inspecciona la página del editor
- **THEN** no existe UI ni lógica de subida (quedará en el change de medios)

### Requirement: Guardarraíles de validación actualizados
The system **SHALL** mantener en verde la suite de validación estructural con los nuevos componentes y dependencias aprobadas.

#### Scenario: Allowlist de dependencias incluye las nuevas deps
- **GIVEN** las dependencias de shadcn/ui y Tiptap instaladas en `apps/web/package.json`
- **WHEN** corre `tests/validation/dependency-audit.test.ts`
- **THEN** la aserción de dependencias aprobadas pasa (deps agregadas a `ALLOWED_NEW_DEPS`)

#### Scenario: admin-cleanup refleja el nuevo shell
- **WHEN** corre `tests/validation/admin-cleanup.test.ts`
- **THEN** acepta `src/components/admin/` con los componentes del shell
- **AND** sigue exigiendo que `dashboard.astro`, `leads.astro` y `settings.astro` no existan y que el login redirija a `/admin`
