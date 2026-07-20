## Context

El proyecto WebAgenciaAstro utiliza Astro 5 con arquitectura de islas React para componentes interactivos. Actualmente existe una página de login (`/login`) implementada como React island que consume la API NestJS para autenticación. Sin embargo, no hay un dashboard administrativo post-login.

TailAdmin es un template administrativo basado en Tailwind CSS que proporciona componentes pre-construidos (sidebar, header, stats cards, tablas). La documentación oficial está en https://tailadmin.com/docs.

**Restricciones del proyecto:**
- Tailwind 4 (no v3) - requiere ajustes de compatibilidad con TailAdmin
- Astro 5 con output estático (SSG)
- React 18 como isla para componentes interactivos
- Sin adapter de servidor - todo debe ser estático o CSR
- API NestJS externa para autenticación y datos

**Stakeholders:**
- Administrador único del sitio (usuario auth)
- Equipo de desarrollo (mantenimiento)

## Goals / Non-Goals

**Goals:**
- Integrar TailAdmin como base visual del dashboard administrativo
- Crear ruta `/admin/dashboard` accesible solo para usuarios autenticados
- Implementar sidebar de navegación con menú administrativo
- Implementar header con perfil de usuario y controles de tema
- Mostrar tarjetas de estadísticas básicas (ej. visitantes, leads, proyectos)
- Incluir tabla de datos para gestión de contenido (ej. leads recientes)
- Mantener arquitectura de islas React de Astro
- Redirigir desde `/login` al dashboard tras autenticación exitosa
- Proteger rutas `/admin/*` con validación de sesión

**Non-Goals:**
- Implementar CRUD completo de contenidos (fase posterior)
- Multi-usuario o sistema de roles complejo
- Gráficos avanzados o reportes complejos
- Notificaciones en tiempo real
- Configuración personalizada del dashboard (settings)
- Exportación de datos o reportes PDF/Excel

## Decisions

### 1. Componentes de Admin
**Decisión:** Crear componentes propios usando Tailwind CSS directamente, inspirados en el diseño de TailAdmin.

**Rationale:**
- `tailadmin-react-free` tiene conflictos con Tailwind 4 (usa v3)
- Crear componentes propios es más simple y mantenible
- Usa las clases de Tailwind que ya tenemos configuradas
- Sin dependencias externas problemáticas
- Control total sobre el diseño

**Alternativas consideradas:**
- **Usar `tailadmin-react-free`:** Rechazado por conflictos de versiones
- **Copiar componentes de TailAdmin:** Duplicación innecesaria

### 2. Tailwind 4 Compatibility
**Decisión:** Usar clases estándar de Tailwind 4 en todos los componentes.

**Rationale:**
- Tailwind 4 es retro-compatible con la mayoría de clases de v3
- El plugin `@tailwindcss/vite` procesa todas las clases automáticamente
- Sin necesidad de configuración especial o overrides
- Clases como `flex`, `grid`, `bg-*`, `text-*` funcionan igual

**Alternativas consideradas:**
- **Usar `tailadmin-react-free`:** Rechazado por incompatibilidad
- **Configuración dual Tailwind v3/v4:** Complejidad innecesaria

### 3. Dashboard como Isla React Única vs Múltiples Islas
**Decisión:** Dashboard completo como una isla React con `client:load`.

**Rationale:**
- TailAdmin requiere estado compartido (sidebar colapsable, tema)
- Múltiples islas complicarían comunicación de estado
- Performance aceptable para dashboard administrativo
- Consistente con enfoque actual del LoginForm

**Alternativas consideradas:**
- **Múltiples islas (sidebar, header, content separados):** Mejor code-splitting pero complejidad de estado
- **Astro components estáticos + React parcial:** Pierde interactividad de TailAdmin

### 4. Autenticación y Protección de Rutas
**Decisión:** Validación de sesión vía cookie HTTP-only con verificación en cliente.

**Rationale:**
- Coherente con spec `client-portal-auth` existente
- JWT en cookie httpOnly (no localStorage)
- Redirección a `/login` si no hay sesión válida
- API endpoint `/api/v1/auth/me` para validar sesión

**Alternativas consideradas:**
- **Middleware de Astro:** No disponible en modo estático
- **LocalStorage + validación cliente:** Menos seguro
- **Session storage:** Se pierde al cerrar pestaña

### 5. Estructura de Directorios
**Decisión:** 
```
src/components/admin/
  - DashboardLayout.tsx    # Layout principal (sidebar + header + content)
  - Sidebar.tsx            # Navegación lateral
  - Header.tsx             # Header administrativo
  - StatsCard.tsx          # Tarjeta de estadísticas
  - RecentLeadsTable.tsx   # Tabla de leads recientes
src/pages/admin/
  - dashboard.astro        # Página wrapper
src/styles/
  - admin.css              # Estilos específicos del admin
```

**Rationale:**
- Componentes limpios usando solo Tailwind CSS
- Sin dependencias externas problemáticas
- Fácil de mantener y extender

### 6. Datos del Dashboard
**Decisión:** Obtener datos de la API NestJS vía `apiClient` existente.

**Endpoints a consumir:**
- `GET /api/v1/stats/summary` - Estadísticas generales
- `GET /api/v1/leads/recent` - Leads recientes (tabla)

**Rationale:**
- Reutiliza infraestructura de API existente
- Mantiene consistencia con blog (CSR desde API)
- Fácil extensión para futuras features

## Risks / Trade-offs

**[TailAdmin puede tener dependencias adicionales]** → Mitigación: Revisar `package.json` de `@tailadmin/react` antes de instalar. Aprobar deps vía OpenSpec si es necesario.

**[Bundle size mayor por librería externa]** → Mitigación: Dashboard es ruta protegida (pocos usuarios), tree-shaking de Vite reduce impacto.

**[Estilos de TailAdmin pueden diferir del diseño público]** → Mitigación: Aceptable — dashboard es área administrativa, no necesita coherencia visual con sitio público.

**[TailAdmin requiere iconos (Heroicons, etc.)]** → Mitigación: Instalar paquete de iconos recomendado (`@heroicons/react` o similar).

**[Sin SSR para dashboard (Astro estático)]** → Mitigación: Dashboard es CSR completo. Loading state mientras cargan datos de API.

## Migration Plan

### Fase 1: Setup (Día 1)
1. `pnpm add @tailadmin/react` (y dependencias requeridas: iconos)
2. Actualizar `package.json` y aprobar deps si es necesario
3. Crear estructura mínima: `src/components/admin/`, `src/pages/admin/`
4. Leer documentación de TailAdmin (https://tailadmin.com/docs)

### Fase 2: Implementación (Día 2)
1. Crear `Dashboard.tsx` importando componentes de `@tailadmin/react`
2. Ensamblar layout: `<Sidebar>`, `<Header>`, `<Card>` (TailAdmin)
3. Crear página `/admin/dashboard.astro` con isla React
4. Integrar validación de autenticación

### Fase 3: Integración (Día 3)
1. Conectar StatsCards con datos de API
2. Conectar Tabla con leads recientes
3. Añadir redirección post-login desde `/login`
4. Testing visual y de funcionalidad

### Fase 4: Testing y Deploy (Día 6)
1. Tests E2E de flujo login → dashboard
2. Validar protección de rutas
3. Build de producción y validación
4. Deploy a Hostinger

**Rollback Strategy:**
- `pnpm remove @tailadmin/react`
- Eliminar directorio `src/components/admin/`
- Eliminar página `/admin/dashboard.astro`
- Restaurar `src/pages/login.astro` (sin redirección al dashboard)

## Open Questions

1. **¿Qué versión exacta de TailAdmin Free usar?** - Se recomienda última estable (v2.x)
2. **¿La API NestJS tiene endpoint de estadísticas?** - Verificar con backend
3. **¿Se requiere modo oscuro en dashboard?** - Asumir sí (coherente con sito público)
4. **¿Iconos para sidebar?** - TailAdmin usa Heroicons o similar - verificar licencia
5. **¿Responsive completo o solo desktop?** - Asumir responsive (TailAdmin ya lo es)