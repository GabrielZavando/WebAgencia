# Scenarios — Add API v1 Prefix

## Escenario 1: Todos los endpoints de negocio tienen prefijo /api/v1/

**Como** desarrollador de API  
**Quiero** que todos los endpoints de negocio tengan el prefijo `/api/v1/`  
**Para** permitir versionado futuro sin breaking changes

### Casos de prueba

```gherkin
Scenario: Endpoint de auth tiene prefijo v1
  Given la API está corriendo en localhost:3000
  When hago POST a /api/v1/auth/login
  Then el endpoint debe responder (200, 400, o 401)
  Y el endpoint /auth/login NO debe responder (404)
```

```gherkin
Scenario: Endpoint de usuarios tiene prefijo v1
  Given la API está corriendo en localhost:3000
  When hago GET a /api/v1/users
  Then el endpoint debe responder (200, 401, o 403)
  Y el endpoint /users NO debe responder (404)
```

```gherkin
Scenario: Endpoint de categorías tiene prefijo v1
  Given la API está corriendo en localhost:3000
  When hago GET a /api/v1/categories
  Then el endpoint debe responder 200 con lista de categorías
  Y el endpoint /categories NO debe responder (404)
```

```gherkin
Scenario: Endpoint de artículos tiene prefijo v1
  Given la API está corriendo en localhost:3000
  When hago GET a /api/v1/articles
  Then el endpoint debe responder 200 con lista de artículos
  Y el endpoint /articles NO debe responder (404)
```

```gherkin
Scenario: Endpoint de leads tiene prefijo v1
  Given la API está corriendo en localhost:3000
  When hago POST a /api/v1/leads/subscribe
  Then el endpoint debe responder (201, 400)
  Y el endpoint /leads/subscribe NO debe responder (404)
```

---

## Escenario 2: Health check NO tiene prefijo de versión

**Como** equipo de DevOps  
**Quiero** que el health check esté disponible en `/health` sin prefijo  
**Para** que los sistemas de monitoreo puedan verificar la salud sin configuración de versión

### Casos de prueba

```gherkin
Scenario: Health check accesible sin prefijo
  Given la API está corriendo en localhost:3000
  When hago GET a /health
  Then el endpoint debe responder 200
  Y el response debe contener { status: 'ok', timestamp }
```

```gherkin
Scenario: Health check NO accesible con prefijo
  Given la API está corriendo en localhost:3000
  When hago GET a /api/v1/health
  Then el endpoint debe responder 404
```

---

## Escenario 3: Swagger UI disponible en /api/v1/docs

**Como** desarrollador consumidor de la API  
**Quiero** acceder a la documentación Swagger en `/api/v1/docs`  
**Para** ver todos los endpoints versionados y probar la API

### Casos de prueba

```gherkin
Scenario: Swagger UI accesible en ruta versionada
  Given la API está corriendo en localhost:3000
  When navego a /api/v1/docs
  Then debo ver la interfaz de Swagger UI
  Y todos los endpoints deben mostrar el prefijo /api/v1/
```

```gherkin
Scenario: Swagger JSON spec refleja paths versionados
  Given la API está corriendo en localhost:3000
  When obtengo el JSON spec de Swagger
  Then todos los paths deben comenzar con /api/v1/
  Excepto /health que no debe tener prefijo
```

---

## Escenario 4: Documentación OpenAPI actualizada

**Como** mantenedor del proyecto  
**Quiero** que `docs/api-spec.yml` refleje el versionado  
**Para** que la documentación esté sincronizada con la implementación

### Casos de prueba

```gherkin
Scenario: API spec tiene server URL versionado
  Given el archivo docs/api-spec.yml
  When leo la sección 'servers'
  Entonces la URL del servidor debe ser http://localhost:3000/api/v1
```

```gherkin
Scenario: API spec tiene todos los paths versionados
  Given el archivo docs/api-spec.yml
  When leo la sección 'paths'
  Entonces todos los paths deben comenzar con /api/v1/
  Excepto /health
```

---

## Escenario 5: Tests pasan con nueva configuración

**Como** desarrollador  
**Quiero** que todos los tests existentes pasen  
**Para** asegurar que el cambio no rompió funcionalidad

### Casos de prueba

```gherkin
Scenario: Tests de API pasan
  Given el cambio add-api-v1-prefix implementado
  When ejecuto pnpm test en apps/api
  Entonces todos los tests deben pasar (100%)
```

```gherkin
Scenario: Tests de Web pasan
  Given el cambio add-api-v1-prefix implementado
  When ejecuto pnpm test en apps/web
  Entonces todos los tests deben pasar (100%)
```