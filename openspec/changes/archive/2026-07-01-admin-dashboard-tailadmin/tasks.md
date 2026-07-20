## 1. Setup e Instalación

- [x] 1.1 Instalar `@heroicons/react` para iconos
- [x] 1.2 Crear directorios `src/components/admin/` y `src/pages/admin/`
- [ ] 1.3 Revisar documentación de TailAdmin (https://tailadmin.com/docs) para diseño de referencia

## 2. Configuración de Tailwind

- [x] 2.1 Verificar que `@heroicons/react` funciona con Tailwind 4
- [x] 2.2 Usar clases de utilidad de Tailwind directamente en componentes
- [x] 2.3 Eliminar CSS innecesario y usar clases estándar

## 3. Implementación del Dashboard

- [x] 3.1 Crear `DashboardLayout.tsx` con estructura sidebar + header + content
- [x] 3.2 Crear `Sidebar.tsx` con navegación usando Heroicons
- [x] 3.3 Crear `Header.tsx` con perfil de usuario y toggle de tema
- [x] 3.4 Crear `Dashboard.tsx` con StatsCards y tabla de leads
- [x] 3.5 Integrar toggle de tema claro/oscuro con persistencia en localStorage

## 4. Componentes de Datos

- [x] 4.1 Crear `StatsCard.tsx` con soporte para iconos y tendencias
- [x] 4.2 Crear `RecentLeadsTable.tsx` con tabla responsive
- [x] 4.3 Crear skeleton loaders para estados de carga
- [x] 4.4 Crear manejo de errores con mensajes amigables

## 5. Página del Dashboard

- [x] 5.1 Crear `src/pages/admin/dashboard.astro` como wrapper
- [x] 5.2 Configurar layout con `hideHeader` y `hideFooter` activos
- [x] 5.3 Importar `Dashboard` como isla React con `client:load`
- [x] 5.4 Ensamblar vista con StatsCards y RecentLeadsTable

## 6. Autenticación

- [x] 6.1 Crear hook `useAuth` para verificar estado de sesión
- [x] 6.2 Implementar redirección a `/login` si no hay sesión
- [x] 6.3 Implementar logout (llamar a `POST /api/v1/auth/logout`)
- [x] 6.4 Actualizar `LoginForm.tsx` para redirigir a `/admin/dashboard`

## 7. Integración con API

- [x] 7.1 Identificar endpoints en API NestJS (stats, leads)
- [x] 7.2 Conectar StatsCards con endpoint de estadísticas usando `apiClient`
- [x] 7.3 Conectar RecentLeadsTable con endpoint de leads recientes

## 8. Responsive

- [x] 8.1 Sidebar responsive con botón hamburger en móvil
- [x] 8.2 Grid de stats responsive (1 col móvil, 2 tablet, 4 desktop)
- [x] 8.3 Tabla con scroll horizontal en móvil

## 9. Tests

- [x] 9.1 Crear tests Vitest para StatsCard y RecentLeadsTable
- [ ] 9.2 Crear spec Playwright: flujo login → dashboard → logout
- [ ] 9.3 Crear spec Playwright: protección de rutas (acceso sin auth)
- [x] 9.4 Ejecutar `pnpm test` y validar que todos pasan (38/38)
- [ ] 9.5 Ejecutar `pnpm test:e2e` y validar flujos completos

## 10. Deploy

- [x] 10.1 Ejecutar `pnpm build` y validar build estático
- [x] 10.2 Ejecutar `pnpm preview` para vista previa
- [x] 10.3 Validar sin dependencias de servidor en `dist/`
- [ ] 10.4 Deploy a Hostinger