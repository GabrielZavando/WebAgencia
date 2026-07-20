## Why

El proyecto actualmente cuenta con una página de login (feature piloto `feat-login-island`) pero no tiene un dashboard de administración para usuarios autenticados. Se necesita integrar TailAdmin para proporcionar una interfaz de administración profesional y funcional que permita gestionar el contenido del sitio desde el panel administrativo.

## What Changes

- Integración del template TailAdmin como isla React en Astro
- Creación de ruta `/admin/dashboard` protegida por autenticación
- Componente Dashboard React con hidratación `client:load`
- Sistema de navegación lateral (sidebar) con menú administrativo
- Header administrativo con perfil de usuario y controles de tema
- Tarjetas de estadísticas básicas (stats cards)
- Tabla de datos para gestión de contenido
- Integración con sistema de autenticación existente
- Adaptación de TailAdmin a Tailwind 4 (ajustes de compatibilidad)

## Capabilities

### New Capabilities

- `admin-dashboard`: Panel de administración con TailAdmin para usuarios autenticados
- `auth-protection`: Protección de rutas administrativas con validación de sesión
- `dashboard-widgets`: Componentes reutilizables del dashboard (stats, tablas, gráficos)

### Modified Capabilities

- `user-auth`: Extender para incluir redirección al dashboard tras login exitoso y gestión de estado de sesión

## Impact

- **Nueva dependencia**: `@tailadmin/react` (paquete oficial)
- **Nuevas rutas**: `/admin/dashboard`, `/admin/*` (rutas administrativas futuras)
- **Componentes React**: Dashboard como isla React con `client:load`
- **Autenticación**: El login debe redirigir al dashboard y validar sesión
- **CSS**: TailAdmin usa Tailwind — compatible nativamente con Tailwind 4 (sin conflictos)
- **Arquitectura**: Patrón de islas React se expande para soportar dashboard completo