## 1. API Version Prefix

- [x] 1.1 Add setGlobalPrefix('api/v1') in main.ts
- [x] 1.2 Update health controller to exclude from global prefix using @ExcludeFromGlobalPrefix or similar

## 2. Swagger Update

- [x] 2.1 Move Swagger UI from /api/docs to /api/v1/docs
- [x] 2.2 Verify Swagger JSON spec reflects versioned paths

## 3. Documentation Update

- [x] 3.1 Update docs/api-spec.yml server URLs with /api/v1 prefix
- [x] 3.2 Update docs/api-spec.yml paths to reflect versioned endpoints
- [x] 3.3 Update .env.example CORS_ORIGIN and API documentation references

## 4. Verification

- [x] 4.1 Build and start development server
- [x] 4.2 Verify endpoints respond at /api/v1/auth, /api/v1/users, etc.
- [x] 4.3 Verify health check responds at /health (without prefix)
- [x] 4.4 Verify Swagger UI accessible at /api/v1/docs
- [x] 4.5 Run all tests and verify they pass