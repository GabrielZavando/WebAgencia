## 1. Preparación y verificación de alcance

- [x] 1.1 Verificar el estado actual del proyecto: `git status`, `git log --oneline -5`
- [x] 1.2 Identificar todos los imports de admin/dashboard en archivos fuera de esas rutas (components/shared, support, styles)
- [x] 1.3 Verificar que `firebase` client SDK no es usado por formularios u otros módulos públicos (decidir si eliminarlo)
- [x] 1.4 Crear rama de trabajo: `git checkout -b chore/remove-private-areas`

## 2. Eliminar páginas de administración (admin)

- [x] 2.1 Eliminar `src/pages/admin/index.astro`
- [x] 2.2 Eliminar `src/pages/admin/estilos.astro`
- [x] 2.3 Eliminar `src/pages/admin/archivos/` (índice + dinámicas)
- [x] 2.4 Eliminar `src/pages/admin/blog/` (índice, [id], categorias)
- [x] 2.5 Eliminar `src/pages/admin/clients/` (índice + [id])
- [x] 2.6 Eliminar `src/pages/admin/contacto/` (índice + [id])
- [x] 2.7 Eliminar `src/pages/admin/ideas/` (índice + [id])
- [x] 2.8 Eliminar `src/pages/admin/informes/index.astro`
- [x] 2.9 Eliminar `src/pages/admin/perfil/index.astro`
- [x] 2.10 Eliminar `src/pages/admin/proyectos/` (índice, [id], nuevo)
- [x] 2.11 Eliminar `src/pages/admin/sistema/configuracion.astro`
- [x] 2.12 Eliminar `src/pages/admin/suscriptores/index.astro`
- [x] 2.13 Eliminar `src/pages/admin/tickets/` (índice + [id])
- [x] 2.14 Eliminar `src/pages/admin/usuarios/` (índice, [id], nuevo)

## 3. Eliminar páginas de dashboard

- [x] 3.1 Eliminar `src/pages/dashboard/index.astro`
- [x] 3.2 Eliminar `src/pages/dashboard/archivos.astro`
- [x] 3.3 Eliminar `src/pages/dashboard/herramientas.astro`
- [x] 3.4 Eliminar `src/pages/dashboard/ideas/nueva.astro`
- [x] 3.5 Eliminar `src/pages/dashboard/informes.astro`
- [x] 3.6 Eliminar `src/pages/dashboard/perfil.astro`
- [x] 3.7 Eliminar `src/pages/dashboard/proyectos.astro`
- [x] 3.8 Eliminar `src/pages/dashboard/soporte.astro`
- [x] 3.9 Eliminar `src/pages/dashboard/soporte/[id].astro`

## 4. Eliminar layouts privados

- [x] 4.1 Eliminar `src/layouts/DashboardLayout.astro`
- [x] 4.2 Eliminar `src/layouts/AuthLayout.astro`

## 5. Eliminar componentes y scripts exclusivos

- [x] 5.1 Eliminar `src/components/admin/` (8 archivos: ContactoTable, IdeaManagementSystem, IdeaTable, ProjectTable, ReportTable, StorageVisualizer, TicketManagementSystem, TicketTable)
- [x] 5.2 Eliminar `src/scripts/dashboard/` (6 archivos: init, notifications, sidebar, theme, user-menu, utils)
- [x] 5.3 Eliminar `src/scripts/proyectos/` (3 archivos: edit, list, new)

## 6. Eliminar middleware y Firebase server-side

- [x] 6.1 Eliminar `src/middleware.ts`
- [x] 6.2 Eliminar `src/lib/firebase/server.ts`
- [x] 6.3 Eliminar `src/stores/authStore.ts` y `src/stores/authStore.spec.ts`

## 7. Eliminar stores y datos de navegación privada

- [x] 7.1 Eliminar `src/data/navigation.ts`
- [x] 7.2 Eliminar `src/lib/stores/filesStore.ts` (solo usado por FileManager admin)
- [x] 7.3 Eliminar `src/lib/stores/reportsStore.ts` (solo usado por admin informes)

## 8. Limpiar componentes compartidos con referencias a admin/dashboard

- [x] 8.1 Limpiar `src/components/shared/AdminFooter.astro`: eliminar archivo (solo usado por DashboardLayout)
- [x] 8.2 Limpiar `src/components/shared/FileManager.astro`: eliminar import de `admin/StorageVisualizer`
- [x] 8.3 Limpiar `src/components/support/TicketDetailView.astro`: eliminar import de DashboardLayout y referencias a rol admin
- [x] 8.4 Limpiar `src/components/support/TicketConversation.astro`: eliminar lógica de `senderRole === 'admin'`
- [x] 8.5 Limpiar `src/components/support/TicketMessageForm.astro`: eliminar lógica de `role === 'admin'`

## 9. Simplificar login page

- [x] 9.1 Modificar `src/pages/login.astro`: eliminar redirect basado en rol (admin → /admin, client → /dashboard); redirigir a `/` en todos los casos
- [x] 9.2 Eliminar o simplificar componentes auth si solo se usaban para login con roles

## 10. Eliminar estilos SCSS de admin/dashboard

- [x] 10.1 Eliminar `src/styles/layout/_dashboard.scss`
- [x] 10.2 Eliminar 12 archivos SCSS de `src/styles/components/`: _admin-forms, _admin-users, _admin-tickets, _admin-ideas, _admin-subscribers, _admin-reports, _admin-files, _admin-blog, _admin-contact, _admin-footer, _dashboard-stats, _admin-table
- [x] 10.3 Eliminar `@forward` de admin/dashboard en `src/styles/components/_index.scss` (~12 líneas)
- [x] 10.4 Eliminar `@forward 'dashboard'` en `src/styles/layout/_index.scss`

## 11. Limpiar API Client y tipos

- [x] 11.1 Eliminar métodos admin de `src/api/index.ts` (10 métodos con endpoints `/forms/admin/*` y `/users/set-admin-role`)
- [x] 11.2 Limpiar `src/lib/api-client.ts`: eliminar lógica de token/session si ya no se usa
- [x] 11.3 Simplificar tipos en `src/types/api.ts` y `src/lib/types/` si contienen campos exclusivos de admin (`role`, `adminResponse`, `senderRole`)

## 12. Eliminar dependencias

- [x] 12.1 Eliminar `firebase-admin` de `package.json`
- [x] 12.2 Eliminar `firebase` de `package.json` (si no hay otro consumo)
- [x] 12.3 Eliminar `@nanostores/persistent` de `package.json` (si solo lo usaba auth store)
- [x] 12.4 Ejecutar `npm install` (o `pnpm install`) para actualizar lockfile

## 13. Build y verificación

- [x] 13.1 Ejecutar `npm run build` y verificar que completa sin errores
- [x] 13.2 Verificar que `dist/` no contiene rutas `/admin/` ni `/dashboard/`
- [x] 13.3 Verificar que `dist/` contiene todas las rutas públicas: index.html, blog/, diagnostico/, politica-de-privacidad/, 404.html, suscripcion-confirmada/, unsubscribe/
- [x] 13.4 Verificar que el bundle CSS no contiene clases `.admin-*` ni `.dashboard-*`

## 14. Tests

- [x] 14.1 Ejecutar `npm run test` (unit tests) y verificar que pasan
- [x] 14.2 Ejecutar `npm run test:e2e` (Playwright) y actualizar tests si es necesario
- [x] 14.3 Verificar que tests de auth store se eliminaron junto con el store

## 15. Documentación

- [x] 15.1 Actualizar `CHANGELOG.md` con versión y cambios (eliminación de áreas privadas)
- [x] 15.2 Actualizar `README.md` eliminando referencias a admin/dashboard
- [x] 15.3 Commit: `git add -A && git commit -m "chore: remove private admin and dashboard areas"`
