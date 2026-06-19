## Context

Tras eliminar las áreas privadas (admin/dashboard), la autenticación Firebase client-side quedó sin propósito real. El login redirige a home, y los componentes que usaban Firebase Auth para obtener tokens JWT (FileManager, TicketConversation, TicketMessageForm) son código huérfano sin páginas que los importen. El bundle JS incluye ~273 KB de Firebase SDK que nunca se usa funcionalmente.

## Goals / Non-Goals

**Goals:**
- Eliminar página `/login` y `ForgotPasswordModal`
- Eliminar `src/lib/firebase/client.ts` y `src/lib/auth-utils.ts`
- Eliminar dependencia `firebase` de `package.json`
- Limpiar imports Firebase auth de componentes huérfanos (FileManager, support tickets)
- Eliminar variables de entorno `PUBLIC_FIREBASE_*` de `.env.example`, `env.d.ts`, `Dockerfile`, `debug-env.ts`, `README.md`
- Build exitoso sin Firebase en el bundle

**Non-Goals:**
- No se modifica la API Ligera externa (NestJS) ni sus endpoints `/auth/session`
- No se modifican formularios de contacto/newsletter
- No se modifica el blog ni su funcionamiento SSG
- No se modifica el sistema de Turnstile en formularios

## Decisions

| Decisión | Opción Elegida | Alternativas | Razón |
|----------|---------------|--------------|-------|
| Login page | Eliminar completamente | Mantener como página estática informativa | Sin admin/dashboard no hay destino post-login; una página estática que no hace nada sería confusa |
| Componentes huérfanos (FileManager, TicketConversation, TicketMessageForm) | Eliminar imports Firebase auth | Eliminar componentes completos | Los componentes ya están huérfanos; eliminar solo los imports es más seguro y mantiene el código base para futuro |
| `db` (Firestore) exportado en client.ts | Eliminar junto con client.ts | Separar en archivo propio | Es código muerto (nunca importado); eliminarlo es lo correcto |
| `debug-env.ts` | Eliminar | Mantener para debugging | Exponía datos de Firebase; sin Firebase no tiene propósito |

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| [Alto] Eliminar imports Firebase de componentes que aún son importados → build falla | Verificar que FileManager, TicketConversation y TicketMessageForm no son importados por ninguna página pública |
| [Medio] Alguien que acceda a `/login` existente → 404 | Comportamiento esperado; redirigir desde nginx/Hostinger si es necesario |
| [Medio] Formularios de contacto/newsletter usaban Firebase token para auth contra API Ligera | Verificar que los formularios usan Turnstile (no Firebase) para protección anti-spam |
| [Bajo] Bundle JS se reduce ~273 KB — posible impacto en precarga de scripts | Beneficio positivo: menos JS para el cliente |
