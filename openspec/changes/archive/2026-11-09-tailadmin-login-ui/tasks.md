## 1. Seed del primer usuario administrador

- [x] 1.1 Crear `apps/api/scripts/create-admin-user.ts` que use Firebase Admin SDK (`getAuth().createUser({ email, password })`) con credenciales desde variables de entorno o argumentos
- [x] 1.2 Documentar en `design.md` cómo ejecutar el script (`pnpm ts-node scripts/create-admin-user.ts`)
- [x] 1.3 Verificar que no se expone ningún endpoint público para crear usuarios

## 2. Integración de TailAdmin en el login

- [x] 2.1 Añadir la dependencia visual del componente de login de TailAdmin (React) a `apps/admin`
- [x] 2.2 Reemplazar el formulario en `apps/admin/src/pages/login/index.astro` por una isla React que renderice el componente de login de TailAdmin (`client:load`)
- [x] 2.3 Mantener la llamada a `signInWithEmailAndPassword` de Firebase Auth y la redirección a `/admin` tras éxito
- [x] 2.4 Mantener el manejo de errores (credenciales inválidas, usuario no encontrado, rate limit, error de red) con mensajes claros
- [x] 2.5 Verificar que el login sigue envuelto en `MainLayout` con `hideHeader` y `hideFooter`

## 3. Limpieza de componentes y estilos legacy del login

- [x] 3.1 Eliminar los componentes y estilos del login anterior que ya no se usen
- [x] 3.2 Auditar referencias a clases legacy (`login-*`, `form-*`) para evitar romper otras páginas

## 4. Tests

- [x] 4.1 Añadir tests Vitest del nuevo formulario de login (render, submit con credenciales válidas, submit con credenciales inválidas, redirección)
- [x] 4.2 Añadir tests E2E Playwright (carga de `/login`, submit exitoso, submit con credenciales inválidas)
- [x] 4.3 Añadir test opcional para el script de seed (solo si es viable sin credenciales reales)

## 5. Verificación de build y pruebas

- [x] 5.1 Ejecutar `pnpm build` de `apps/admin` y confirmar que compila en SSR (`output: 'server'`)
- [x] 5.2 Ejecutar la suite de tests (Vitest + Playwright) y verificar que pasan
