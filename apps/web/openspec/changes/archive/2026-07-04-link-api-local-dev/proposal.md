## Why

El frontend actualmente apunta a URLs de producción en la API (`us-central1.run.app` o `southamerica-west1.run.app`), lo que dificulta probar cambios locales en la API NestJS durante el desarrollo. Necesitamos configurar el entorno local para que el frontend se conecte a `http://localhost:3000/api/v1/` y permitir pruebas end-to-end en desarrollo sin afectar producción.

## What Changes

- Configuración de variables de entorno locales (`.env.local`) para apuntar a `http://localhost:3000/api/v1/`
- Documentación del flujo de autenticación local para desarrollo
- Verificación de que el login con Firebase ID token funcione contra la API local
- Validación de que el dashboard admin cargue datos desde la API local
- Ajuste del cliente API si es necesario para soportar ambos entornos (local/producción)

## Capabilities

### New Capabilities

- `local-api-config`: Configuración de entorno para desarrollo con API local
- `auth-integration`: Integración del flujo de login con Firebase ID token hacia la API local

### Modified Capabilities

- (ninguna - no se modifican requirements existentes, sólo se habilita entorno local)

## Impact

- **Archivos afectados**: `.env.local` (nuevo), `src/lib/api-client.ts` (posibles ajustes), `src/components/auth/LoginForm.tsx` (validación)
- **APIs**: `/api/v1/auth/login` (POST con ID token), `/api/v1/auth/me` (GET con credentials), `/api/v1/stats/summary`, `/api/v1/leads/recent`
- **Dependencias**: Ninguna nueva - se usa la infraestructura existente de `apiClient`
- **Sistemas**: API NestJS local debe estar corriendo en `localhost:3000` para pruebas