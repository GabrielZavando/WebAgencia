# Spec Delta

## ADDED Requirements

### Requirement: Panel de administración como aplicación independiente

The system **SHALL** servir el panel de administración desde `apps/admin` como aplicación Astro en modo servidor, incluyendo las rutas `/login` y `/admin/*`, sin depender del build del sitio público.

#### Scenario: Login servido por la aplicación admin
- **WHEN** un usuario accede a `/login` en el dominio del panel
- **THEN** la aplicación `apps/admin` renderiza el formulario de autenticación en servidor
- **AND** el sitio público no sirve esa ruta

#### Scenario: Rutas del panel renderizadas en servidor
- **WHEN** un usuario accede a `/admin`, `/admin/articles` o `/admin/categories`
- **THEN** la aplicación `apps/admin` responde con HTML generado en servidor
- **AND** las islas React se hidratan en el cliente

#### Scenario: Independencia del despliegue del panel
- **WHEN** se despliega una nueva versión de `apps/admin`
- **THEN** no es necesario reconstruir ni redesplegar el sitio público
- **AND** el login y el panel comparten el mismo dominio de administración

### Requirement: Autenticación del panel en su propia aplicación

The system **SHALL** inicializar Firebase Auth y resolver el token Bearer dentro de `apps/admin`, sin incluir esa configuración en el bundle del sitio público.

#### Scenario: Token resuelto en el panel
- **WHEN** una isla del panel necesita llamar a la API
- **THEN** obtiene el Firebase ID token desde la sesión activa en `apps/admin`

#### Scenario: Sitio público sin Firebase Auth
- **WHEN** se inspecciona el bundle del sitio público
- **THEN** no contiene el SDK de Firebase Auth ni el helper de cabeceras de autenticación

## MODIFIED Requirements

### Requirement: Layout base del panel de administración
The system **SHALL** renderizar `/admin` como shell administrativo (sidebar + header + área de contenido) construido con Tailwind utility-first, tokens del design system y componentes shadcn/ui, servido por `apps/admin`, sin llamadas a la API ni datos de ejemplo en el shell.

#### Scenario: /admin renderiza el shell
- **WHEN** un usuario accede a `/admin`
- **THEN** ve un sidebar con navegación, un header y un área de contenido principal
- **AND** no se realiza ninguna llamada a la API desde el shell

#### Scenario: Sidebar colapsable en mobile
- **GIVEN** un viewport menor a 1024px
- **WHEN** el usuario activa el botón del menú (con `aria-label`)
- **THEN** el sidebar se muestra/oculta sin recargar la página

#### Scenario: El shell sigue el tema del sitio
- **GIVEN** el sitio en modo claro u oscuro
- **WHEN** se renderiza el shell
- **THEN** usa tokens del sistema (`bg-surface`, `text-text`, `border-border`) y cambia con el tema

### Requirement: Base de shadcn/ui configurada
The system **SHALL** tener shadcn/ui configurado en `apps/admin`: `components.json`, utilidad `cn()` en `src/lib/utils.ts`, y variables CSS de shadcn mapeadas a los tokens del design system (temas claro y oscuro).

#### Scenario: cn combina y deduplica clases
- **WHEN** se invoca `cn("px-2", cond && "py-1", "px-4")`
- **THEN** retorna las clases combinadas con tailwind-merge (el `px` conflictivo queda resuelto)

#### Scenario: Componentes shadcn usan los colores del sitio
- **WHEN** se renderiza un componente shadcn/ui
- **THEN** sus colores provienen de las variables puente mapeadas a los tokens del design system

#### Scenario: shadcn no vive en el sitio público
- **WHEN** se inspecciona `apps/web`
- **THEN** no contiene `components.json` ni `src/components/ui/`

### Requirement: Página de prueba del editor Tiptap
The system **SHALL** exponer `/admin/blog/editor-test` desde `apps/admin` con una isla React con el editor Tiptap (componentes shadcn-tiptap), con toolbar y salida JSON visible.

#### Scenario: La isla monta el editor
- **WHEN** un usuario accede a `/admin/blog/editor-test`
- **THEN** se renderiza la toolbar y un área de contenido editable
- **AND** el usuario puede escribir texto con formato

#### Scenario: Salida JSON del documento
- **GIVEN** contenido escrito en el editor
- **WHEN** se consulta la vista JSON
- **THEN** se muestra un documento Tiptap con `type: 'doc'` y array `content` (mismo formato que consume la API)

### Requirement: Guardarraíles de validación actualizados
The system **SHALL** mantener en verde la suite de validación estructural de `apps/web` y `apps/admin` con el código del panel en su aplicación y las dependencias aprobadas por aplicación.

#### Scenario: Allowlist de dependencias incluye las nuevas deps
- **GIVEN** las dependencias de shadcn/ui y Tiptap instaladas en el package.json correspondiente
- **WHEN** corre `tests/validation/dependency-audit.test.ts`
- **THEN** la aserción de dependencias aprobadas pasa (deps agregadas a `ALLOWED_NEW_DEPS`)

#### Scenario: admin-cleanup refleja el nuevo shell
- **WHEN** corre `tests/validation/admin-cleanup.test.ts` en cada aplicación
- **THEN** en `apps/web` exige la ausencia de páginas/componentes de administración
- **AND** en `apps/admin` exige la presencia de `AdminLayout.astro`, `components/admin/` y `components/ui/`

#### Scenario: La suite web verifica la ausencia del panel
- **WHEN** corre la validación estructural de `apps/web`
- **THEN** verifica que no existan `src/pages/admin/`, `src/pages/login/`, `src/components/admin/`, `src/components/auth/`, `src/components/ui/` ni `AdminLayout.astro`
- **AND** verifica que `apps/web` no declare `@astrojs/node` ni adaptadores

#### Scenario: La suite admin verifica el panel
- **WHEN** corre la validación estructural de `apps/admin`
- **THEN** verifica la existencia de `src/pages/admin/`, `src/pages/login/`, `AdminLayout.astro`, `components/admin/` y `components/ui/`
- **AND** verifica que `astro.config.mjs` declare `output: 'server'` y `@astrojs/node`

### Requirement: Componente Table de shadcn/ui

The system **SHALL** tener un componente `Table` de shadcn/ui en `apps/admin/src/components/ui/table.tsx` para usar en la vista de listado de categorías.

#### Scenario: Table component exists
- **WHEN** se importa `Table` desde `@/components/ui/table`
- **THEN** el componente está disponible y usa los tokens del design system
