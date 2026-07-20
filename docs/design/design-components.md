# Design Components — WebAgenciaAstro

> Catálogo de componentes UI con contratos de props, estados y casos de uso. Fuente de verdad para componentes existentes y guía para nuevos.

## Cómo usar este catálogo

- **Antes de crear un componente nuevo**: verificar si ya existe aquí.
- **Al usar un componente existente**: seguir el contrato de props documentado.
- **Al modificar un componente**: actualizar esta documentación inmediatamente.
- **Para añadir un componente**: proponer vía `/opsx:propose`.

---

## Componentes compartidos (`src/components/shared/`)

### `Header.astro`

**Propósito**: Navegación principal del sitio, sticky en scroll.

**Props**:
- `menuItems: { label: string; href: string }[]` — Items del menú (de `src/data/menu.json`).
- `logoUrl: string` — URL del logo.
- `logoText: string` — Texto del logo (fallback).

**Estados**:
- `scrolled` — Header con fondo sólido tras scroll.
- `menu-active` — Menú móvil abierto (clase en `body`).

**Casos de uso**:
- ✅ Página principal, todas las páginas públicas.
- ✅ Menú móvil con hamburguesa.

**No usar para**:
- ❌ Páginas de login (usar `LoginForm` en `/login`).
- ❌ Modales (usar `Modal.astro`).

**A11y**:
- `role="navigation"` en `<nav>`.
- `aria-label="Main navigation"` en `<nav>`.
- Focus visible en enlaces.

---

### `Footer.astro`

**Propósito**: Footer del sitio con enlaces legales y redes sociales.

**Props**:
- `socialLinks: { platform: string; url: string; icon: string }[]` — Redes sociales.
- `legalLinks: { label: string; href: string }[]` — Enlaces legales (privacidad, términos).
- `copyright: string` — Texto de copyright.

**Estados**:
- `dark` — Fondo oscuro (por defecto).
- `light` — Fondo claro (opcional, para secciones específicas).

**Casos de uso**:
- ✅ Todas las páginas públicas.

**A11y**:
- `role="contentinfo"` en `<footer>`.
- `aria-label="Footer"` en `<footer>`.

---

### `Modal.astro`

**Propósito**: Modal genérico con backdrop, cierre por Escape y click fuera.

**Props**:
- `title: string` — Título del modal.
- `isOpen: boolean` — Estado de apertura.
- `onClose: () => void` — Callback al cerrar.
- `size: "sm" | "md" | "lg"` — Tamaño (default: `"md"`).

**Estados**:
- `open` — Modal visible.
- `closed` — Modal oculto.
- `loading` — Estado de carga (opcional).

**Casos de uso**:
- ✅ Confirmaciones, formularios cortos, mensajes informativos.

**No usar para**:
- ❌ Formularios complejos (usar página dedicada).
- ❌ Contenido que requiere scroll largo (usar página dedicada).

**A11y**:
- Focus trap dentro del modal.
- `role="dialog"`, `aria-modal="true"`.
- Cerrar con Escape.
- Devolver foco al elemento que abrió al cerrar.

---

### `ModalMessage.astro`

**Propósito**: Modal para mensajes de éxito/error tras envío de formulario.

**Props**:
- `type: "success" | "error" | "info"` — Tipo de mensaje.
- `title: string` — Título.
- `message: string` — Cuerpo del mensaje.
- `onClose: () => void` — Callback al cerrar.

**Estados**:
- `success` — Verde, icono check.
- `error` — Rojo, icono warning.
- `info` — Violeta, icono info.

**Casos de uso**:
- ✅ Confirmación de envío de formulario de contacto.
- ✅ Mensajes de error tras validación fallida.

**A11y**:
- `role="alert"` en el mensaje.
- `aria-live="polite"` para anunciar automáticamente.

---

### `ThemeSwitcher.astro`

**Propósito**: Switcher de tema claro/oscuro con persistencia en localStorage.

**Props**:
- `initialTheme: "light" | "dark" | "system"` — Tema inicial.

**Estados**:
- `light` — Modo claro.
- `dark` — Modo oscuro.
- `system` — Seguir preferencia del sistema.

**Casos de uso**:
- ✅ Header, footer.
- ✅ Páginas donde el usuario puede cambiar tema.

**No usar para**:
- ❌ Páginas donde el tema está forzado (ej. `/login` con `forcedTheme`).

**A11y**:
- `role="switch"`, `aria-checked` en el toggle.
- `aria-label="Toggle dark mode"`.

---

### `Search.astro`

**Propósito**: Buscador con autocompletado y atajos de teclado.

**Props**:
- `placeholder: string` — Texto de placeholder.
- `onSearch: (query: string) => void` — Callback de búsqueda.
- `debounceMs: number` — Debounce (default: `300`).

**Estados**:
- `idle` — Input vacío.
- `loading` — Búsqueda en curso.
- `results` — Resultados mostrados.
- `empty` — Sin resultados.

**Casos de uso**:
- ✅ Blog, documentación, catálogo de servicios.

**A11y**:
- `role="search"` en el formulario.
- `aria-label="Search"`.
- Navegación con flechas en resultados.
- `aria-activedescendant` en items.

---

### `ErrorPage.astro`

**Propósito**: Página de error genérica (404, 500, etc.).

**Props**:
- `statusCode: number` — Código de estado.
- `title: string` — Título del error.
- `message: string` — Mensaje al usuario.
- `backUrl: string` — URL para volver (default: `/`).

**Estados**:
- `404` — Página no encontrada.
- `500` — Error del servidor.
- `default` — Error genérico.

**Casos de uso**:
- ✅ Página 404 (`src/pages/404.astro`).
- ✅ Errores de API capturados en UI.

**A11y**:
- `role="alert"` en el mensaje de error.
- `aria-live="assertive"` para errores críticos.

---

### `Schema.astro`

**Propósito**: Inyectar JSON-LD para SEO (Schema.org).

**Props**:
- `type: "Organization" | "Person" | "WebSite" | "Blog"` — Tipo de schema.
- `data: object` — Datos del schema.

**Casos de uso**:
- ✅ `<Head>` de páginas principales.
- ✅ SEO de marca, blog, servicios.

**No usar para**:
- ❌ Contenido dinámico no estructurado.

---

### `PrivacyPolicy.astro`

**Propósito**: Página de política de privacidad.

**Props**:
- `companyName: string` — Nombre de la empresa.
- `contactEmail: string` — Email de contacto.
- `lastUpdated: string` — Fecha de última actualización.

**Casos de uso**:
- ✅ Página `/privacy-policy`.

---

### `Unsubscribe.astro`

**Propósito**: Página de cancelación de suscripción (newsletter).

**Props**:
- `token: string` — Token de confirmación.
- `onUnsubscribe: (token: string) => Promise<void>` — Callback de cancelación.

**Estados**:
- `idle` — Esperando confirmación.
- `loading` — Cancelando.
- `success` — Cancelado exitosamente.
- `error` — Error al cancelar.

**Casos de uso**:
- ✅ Enlace en emails de newsletter.

---

### `Head.astro`

**Propósito**: Componente `<head>` con metadatos comunes.

**Props**:
- `title: string` — Título de la página.
- `description: string` — Meta description.
- `canonicalUrl: string` — URL canónica.
- `ogImage: string` — Imagen Open Graph.

**Casos de uso**:
- ✅ `<Head>` de todas las páginas.

---

## Componentes de landing (`src/components/landing/`)

### `Banner.astro`

**Propósito**: Banner hero con overlay gradiente y CTA.

**Props**:
- `title: string` — Título principal.
- `subtitle: string` — Subtítulo.
- `ctaText: string` — Texto del CTA.
- `ctaHref: string` — URL del CTA.
- `backgroundImage: string` — Imagen de fondo (opcional).

**Estados**:
- `with-image` — Con imagen de fondo.
- `solid` — Fondo sólido (sin imagen).

**A11y**:
- `aria-label="Hero banner"`.
- Contraste del texto sobre overlay.

---

### `ServiceCard.astro`

**Propósito**: Tarjeta de servicio individual.

**Props**:
- `title: string` — Título del servicio.
- `description: string` — Descripción corta.
- `icon: string` — Icono (SVG o emoji).
- `href: string` — URL al detalle (opcional).
- `features: string[]` — Lista de features (opcional).

**Estados**:
- `default` — Estado normal.
- `hover` — Hover con shadow.
- `linked` — Con enlace (clicable).

**A11y**:
- `role="button"` si es clicable.
- `tabindex="0"` si es clicable.

---

### `Services.astro`

**Propósito**: Sección de lista de servicios (grid de `ServiceCard`).

**Props**:
- `services: { title: string; description: string; icon: string }[]` — Lista de servicios.
- `title: string` — Título de la sección.
- `subtitle: string` — Subtítulo.

**Casos de uso**:
- ✅ Página principal, sección `/servicios`.

---

### `ServicesLanding.astro`

**Propósito**: Página completa de servicios (con filtros, categorías).

**Props**:
- `services: Service[]` — Lista completa de servicios.
- `categories: string[]` — Filtros por categoría.

**Estados**:
- `all` — Mostrar todos.
- `filtered` — Mostrar por categoría.

---

### `Plans.astro`

**Propósito**: Sección de planes tarifarios (3 packs).

**Props**:
- `plans: { name: string; price: string; features: string[]; cta: string }[]` — Lista de planes.
- `highlighted: number` — Índice del plan destacado.

**Estados**:
- `monthly` — Precio mensual.
- `annual` — Precio anual (con descuento).

**A11y**:
- `aria-label="Pricing plans"`.
- Contraste de precios.

---

### `PackWebProfesional.astro`

**Propósito**: Componente específico del pack "Web Profesional".

**Props**:
- `features: string[]` — Features del pack.
- `price: string` — Precio.
- `ctaText: string` — Texto del CTA.

---

### `PackSistemas.astro`

**Propósito**: Componente específico del pack "Sistemas".

**Props**:
- `features: string[]` — Features del pack.
- `price: string` — Precio.
- `ctaText: string` — Texto del CTA.

---

### `Contact.astro`

**Propósito**: Formulario de contacto con anti-spam (honeypot, Turnstile, cooldown).

**Props**:
- `onSubmit: (data: ContactForm) => Promise<void>` — Callback de envío.
- `turnstileSiteKey: string` — Cloudflare Turnstile key.

**Estados**:
- `idle` — Formulario vacío.
- `loading` — Enviando.
- `success` — Enviado exitosamente.
- `error` — Error de envío.
- `cooldown` — Cooldown activo (localStorage).

**A11y**:
- `aria-live` para mensajes de error.
- `aria-invalid` en campos con error.
- Labels asociados a inputs.

**Anti-spam**:
- Honeypot (campo oculto).
- Cooldown 2min en localStorage.
- Turnstile token (inyectado por `apiClient`).

---

### `About.astro`

**Propósito**: Sección "Sobre mí" / "Sobre la empresa".

**Props**:
- `title: string` — Título.
- `content: string` — Contenido (HTML o markdown).
- `imageUrl: string` — Imagen del autor/empresa.

---

### `Workflow.astro`

**Propósito**: Sección de workflow / metodología de trabajo.

**Props**:
- `steps: { title: string; description: string; icon: string }[]` — Pasos del workflow.

**A11y**:
- `aria-label="Workflow"`.
- Secuencia numerada con `aria-setpos`.

---

### `MetodologiaCTP.astro`

**Propósito**: Sección de metodología CTP (Construir, Transformar, Proteger).

**Props**:
- `phases: { name: string; description: string; icon: string }[]` — Fases de la metodología.

---

### `SolucionesModulares.astro`

**Propósito**: Sección de soluciones modulares.

**Props**:
- `solutions: { title: string; description: string; features: string[] }[]` — Soluciones.

---

## Componentes de autenticación (`src/components/auth/`)

### `LoginForm.tsx` (React Island)

**Propósito**: Formulario de login admin (único usuario).

**Props**:
- `onLogin: (credentials: { email: string; password: string }) => Promise<AuthSession>` — Callback de login.
- `turnstileSiteKey: string` — Cloudflare Turnstile key.

**Estados**:
- `idle` — Formulario vacío.
- `loading` — Autenticando.
- `success` — Autenticado.
- `error` — Credenciales inválidas.

**A11y**:
- `aria-live` para errores.
- `aria-invalid` en campos con error.
- Labels asociados.

**Seguridad**:
- No guardar JWT en localStorage.
- Token en cookie `httpOnly` (gestionado por backend).
- Rate limit en backend.

---

### `LoginPage` (`/login`)

**Propósito**: Página standalone de autenticación con identidad developer-brand, implementada con **Tailwind-first** y overlay transparente sobre imagen de fondo. Alineada al mockup `inicio-sesion.png` respetando flat design del sistema.

**Implementación**: Tailwind utilities para layout/espaciado/estructura + CSS mínimo solo para iconos y casos específicos no cubiertos por Tailwind.

**Estructura**:
- Logo PNG con glow magenta en esquina superior izquierda (fixed).
- Imagen de fondo `banner-web.jpg` con overlay gradiente tokenizado (`--banner-overlay-start/end`).
- Card centrada con sombra profunda, **sin blur**, **border-radius: 0** (flat design).
- Header del card centrado (título + subtítulo).
- Formulario con iconos dentro de los inputs (email: `mail`, password: toggle visibilidad).
- Footer sticky full-width abajo con textos en una línea (nowrap + ellipsis fallback).

**Clases del sistema utilizado**:
- `.form-group` — Agrupación de label + input.
- `.form-label` — Label de campo.
- `.form-input` — Input de email/password.
- `.btn-form` — Botón submit.
- `.error-message` — Mensaje de error por campo.
- `.fade-in` — Animación de entrada.
- `forcedTheme="dark"` — Tema oscuro forzado.

**Utilidades Tailwind principales**:
- `relative min-h-screen flex flex-col overflow-hidden` — estructura sección
- `absolute inset-0 z-[-1]` — fondo imagen
- `fixed top-6 left-6 z-[80]` — logo
- `flex-1 flex items-center justify-center px-4 py-8` — contenido centrado
- `w-full max-w-[450px]` — card responsive
- `sticky bottom-0 w-full` — footer
- `whitespace-nowrap overflow-hidden text-ellipsis` — textos footer una línea

**CSS residual (casos específicos)**:
- `.login-input-icon` — posicionamiento absoluto de iconos dentro de inputs
- `.login-password-toggle` — botón toggle con hover state
- `.login-forgot-link` — link "¿Olvidaste tu contraseña?" con hover underline
- Media query mobile para ajuste de logo

**Tokens utilizados**:
- `--color-body` — fondo base de sección
- `--banner-overlay-start`, `--banner-overlay-end` — gradiente overlay transparente
- `--color-surface` — fondo de card (sólido, sin blur)
- `--color-border` — borde de card
- `--color-text-muted` — texto secundario, iconos
- `--color-headings` — título "Bienvenido"
- `--color-primary` — acento magenta: nombre dev en footer, link, glow del logo
- `--color-error` — mensajes de error
- `--btn-primary-hover` — hover de elementos magenta
- `--color-primary-rgb` — drop-shadow glow del logo
- `--color-black-rgb` — fondo semi-transparente del footer

**Excepciones documentadas (flat design)**:
- **Card border-radius: 0** — Alineado al sistema flat design. Sin excepciones.
- **Inputs/botón border-radius: 0** — Consistente con sistema flat.
- **Imagen de fondo con overlay** — Mismo patrón que banner Inicio (`linear-gradient(135deg, --banner-overlay-start, --banner-overlay-end)`).
- **Iconos dentro de inputs** — Email: `mail` (carta), Password: toggle visibilidad. Posicionados con absolute dentro de wrapper relative.
- **Footer sticky full-width** — Siempre abajo, ancho completo, textos en una línea cuando hay espacio.

**A11y**:
- Foto de fondo con `aria-hidden="true"` (decorativa).
- Overlay con `aria-hidden="true"`.
- Logo con `alt="Agencia Digital Logo"`.
- Icono email con `aria-hidden="true"`.
- Toggle de password con `aria-label` descriptivo.
- Focus visible en inputs (shadow ring estándar del sistema `.form-input`).
- `aria-invalid` y `aria-describedby` en campos con error.
- Labels asociados a inputs.
- `role="alert"` en mensajes de error.

**Responsive**:
- Mobile (<768px): Logo 3rem, padding reducido en card, textos footer en `var(--text-xs)`.
- Tablet (768-1023px): Card max-width 400px.
- Desktop (≥1024px): Card max-width 450px.

**Asset de fondo**:
- `src/assets/img/banner-web.jpg` (183KB, optimizado JPG) — usado como fondo oficial del login con overlay transparente.
- Contraste WCAG AA garantizado por overlay oscuro de 65%.

**Responsive**:
- Mobile (<768px): Logo más pequeño (3rem), card con padding reducido (2rem 1.5rem), title 1.75rem.
- Tablet (768-1023px): Card max-width 400px.
- Desktop (≥1024px): Card max-width 450px.

---

## Componentes de administración (`src/components/admin/`)

> **Estrategia**: Todos los componentes admin usan **Tailwind utility-first** con tokens del sistema (`bg-primary`, `text-secondary`, etc.). No usan BEM ni `global.css` para estilos propios.

### `DashboardLayout.tsx`

**Propósito**: Layout wrapper del admin. Sidebar + header + content area.

**Props**:
- `children: React.ReactNode` — Contenido del dashboard.
- `hideHeader?: boolean` — Ocultar header (default: false).
- `hideFooter?: boolean` — Ocultar footer (default: false).

**Estilos**: Tailwind utility classes (`bg-gray-100 dark:bg-gray-900`, `p-4 md:p-6`).

**A11y**:
- Estructura semántica con `<div>` roles.
- Skip link opcional.

---

### `Sidebar.tsx`

**Propósito**: Navegación lateral colapsable con iconos Heroicons.

**Props**:
- `collapsed?: boolean` — Estado colapsado (default: false).
- `onToggle?: () => void` — Callback al toggle.

**Estados**:
- `mobileOpen` — Sidebar móvil abierto.
- `collapsed` — Solo iconos (desktop).

**Estilos**: Tailwind utility classes + `bg-primary` para toggle móvil.

**Items de menú**: Dashboard, Leads, Configuración (placeholder).

**A11y**:
- `<nav>` con aria-label.
- Focus visible en enlaces.
- Escape cierra en móvil.

---

### `Header.tsx`

**Propósito**: Header administrativo con theme toggle y dropdown de usuario.

**Props**:
- `onLogout?: () => void` — Callback de logout.

**Estados**:
- `theme` — light/dark, persistido en localStorage.
- `dropdownOpen` — Dropdown de perfil abierto.

**Estilos**: Tailwind utility classes + tokens (`bg-white dark:bg-boxdark`, `border-gray-200`).

**Funciones**:
- Toggle de tema claro/oscuro.
- Dropdown con opción "Cerrar sesión".

**A11y**:
- Click outside cierra dropdown.
- Escape cierra dropdown.
- Focus management.

---

### `StatsCard.tsx`

**Propósito**: Tarjeta reutilizable para métricas del dashboard.

**Props**:
- `title: string` — Nombre de la métrica.
- `value: string | number` — Valor formateado.
- `change?: string` — Indicador de tendencia (ej. "+15%").
- `changeType?: 'positive' | 'negative'` — Tipo de tendencia.
- `icon: React.ComponentType<{className?: string}>` — Icono Heroicon.

**Estilos**: Tailwind utility classes + `bg-primary/10 text-primary` para icono, `text-success`/`text-error` para tendencia.

**A11y**:
- Valor con `aria-label` descriptivo.
- Indicador de tendencia con `aria-label`.

---

### `RecentLeadsTable.tsx`

**Propósito**: Tabla de los últimos leads recibidos.

**Props**:
- `leads: Lead[]` — Array de leads.
- `loading?: boolean` — Estado de carga.

**Estados**:
- `loading` — Muestra skeleton loader.

**Columnas**: Nombre, Email, Teléfono, Servicio, Fecha.

**Estilos**: Tailwind utility classes + tokens (`bg-primary/10` para badges).

**A11y**:
- `<table>` semántico con `<thead>`, `<tbody>`.
- Skeleton con `aria-busy`.

---

### `Dashboard.tsx`

**Propósito**: Componente principal del dashboard. Integra stats, tabla y layout.

**Props**: Ninguno (usa hooks internos).

**Hooks**:
- `useAuth()` — Verifica sesión, redirige a `/login` si no autenticado.

**API**:
- `apiClient.get('/api/v1/stats/summary')` — Estadísticas.
- `apiClient.get('/api/v1/leads/recent')` — Leads recientes.
- `Promise.allSettled` con fallback a mock data.

**Estilos**: Tailwind utility classes + `text-error` para mensajes de error.

---

## Componentes de metodología (`src/components/metodologia/`)

### `GeneralVision.astro`

**Propósito**: Visión general de la metodología.

**Props**:
- `title: string` — Título.
- `content: string` — Contenido.

---

### `MaturitySpiral.astro`

**Propósito**: Gráfico de espiral de madurez.

**Props**:
- `levels: { name: string; description: string }[]` — Niveles de madurez.

---

### `ChangeManagement.astro`

**Propósito**: Sección de change management.

**Props**:
- `process: { step: string; description: string }[]` — Pasos del proceso.

---

### `DetailedPipeline.astro`

**Propósito**: Pipeline detallado de desarrollo.

**Props**:
- `stages: { name: string; tasks: string[] }[]` — Etapas del pipeline.

---

## Reglas para nuevos componentes

1. **Nombre en PascalCase**: `ServiceCard`, no `service-card`.
2. **Archivo `.astro` por defecto**: solo `.tsx` si requiere estado React complejo.
3. **Props tipadas explícitamente**: no usar `any`.
4. **Test pareja**: cada componente debe tener test (Vitest o Playwright).
5. **Documentar aquí**: añadir entrada en este catálogo al crear componente nuevo.
6. **A11y**: cumplir WCAG AA (contraste, focus, ARIA).
7. **Sin hex literales**: usar `var(--*)` de `design-tokens.md`.
8. **Estrategia CSS**: nuevos componentes usan **Tailwind utility-first**. Componentes legacy usan BEM en `global.css` (no migrar salvo que se modifiquen).

## Referencias

- **Tokens**: `design-tokens.md`.
- **Theming**: `design-theming.md` (próxima iteración).
- **Motion**: `design-motion-guide.md` (próxima iteración).
- **Accesibilidad**: `design-accessibility.md` (próxima iteración).