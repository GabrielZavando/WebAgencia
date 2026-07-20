## 1. Project Setup

- [x] 1.1 Install dependencies (firebase, firebase-admin, @nestjs/passport, passport-jwt, @nestjs/jwt, class-validator, class-transformer)
- [x] 1.2 Install dev dependencies (@types/passport-jwt)
- [x] 1.3 Create common module structure (common/decorators, common/guards, common/filters, common/interceptors)
- [x] 1.4 Add ValidationPipe to main.ts

## 2. Firebase Module

- [x] 2.1 Create src/firebase/firebase.module.ts
- [x] 2.2 Create src/firebase/firebase.service.ts with singleton FirebaseApp
- [x] 2.3 Load Firebase config from environment variables
- [x] 2.4 Export Firestore and Auth instances
- [x] 2.5 Write unit tests for FirebaseService

## 3. Common Infrastructure

- [x] 3.1 Create AuthGuard (JWT verification)
- [x] 3.2 Create RolesGuard (role-based access)
- [x] 3.3 Create CurrentUser decorator
- [x] 3.4 Create GlobalExceptionFilter for consistent error responses
- [x] 3.5 Create response interceptors for { data, meta } format

## 4. Auth Module

- [x] 4.1 Create src/auth/auth.module.ts
- [x] 4.2 Create src/auth/auth.controller.ts with /login and /me endpoints
- [x] 4.3 Create src/auth/auth.service.ts (verify Firebase token, upsert user, generate JWT)
- [x] 4.4 Create src/auth/strategies/jwt.strategy.ts (Passport JWT strategy)
- [x] 4.5 Create src/auth/dto/login.dto.ts
- [x] 4.6 Write unit tests for AuthService (verify Firebase token, upsert logic, JWT generation)

## 5. Users Module

- [x] 5.1 Create src/users/users.module.ts
- [x] 5.2 Create src/users/users.repository.ts (Firestore operations)
- [x] 5.3 Create src/users/users.service.ts (business logic)
- [x] 5.4 Create src/users/users.controller.ts (CRUD endpoints with @Roles('admin'))
- [x] 5.5 Create src/users/dto/create-user.dto.ts
- [x] 5.6 Create src/users/dto/update-user.dto.ts
- [x] 5.7 Create src/users/entities/user.entity.ts
- [x] 5.8 Write unit tests for UsersService

## 6. Categories Module

- [x] 6.1 Create src/categories/categories.module.ts
- [x] 6.2 Create src/categories/categories.repository.ts (Firestore operations)
- [x] 6.3 Create src/categories/categories.service.ts (business logic with slug uniqueness check)
- [x] 6.4 Create src/categories/categories.controller.ts (CRUD: GET public, POST/PATCH/DELETE protected)
- [x] 6.5 Create src/categories/dto/create-category.dto.ts
- [x] 6.6 Create src/categories/dto/update-category.dto.ts
- [x] 6.7 Create src/categories/entities/category.entity.ts
- [x] 6.8 Write unit tests for CategoriesService (including slug uniqueness)

## 7. Articles Module

- [x] 7.1 Create src/articles/articles.module.ts
- [x] 7.2 Create src/articles/articles.repository.ts (Firestore operations)
- [x] 7.3 Create src/articles/articles.service.ts (business logic with slug uniqueness check, category check on delete)
- [x] 7.4 Create src/articles/articles.controller.ts (CRUD: GET public with filters, POST/PATCH/DELETE protected)
- [x] 7.5 Create src/articles/dto/create-article.dto.ts
- [x] 7.6 Create src/articles/dto/update-article.dto.ts
- [x] 7.7 Create src/articles/dto/query-articles.dto.ts (pagination, filters)
- [x] 7.8 Create src/articles/entities/article.entity.ts
- [x] 7.9 Write unit tests for ArticlesService (including slug uniqueness, category articles check)

## 8. App Module Integration

- [x] 8.1 Import FirebaseModule in AppModule
- [x] 8.2 Import AuthModule in AppModule
- [x] 8.3 Import UsersModule in AppModule
- [x] 8.4 Import CategoriesModule in AppModule
- [x] 8.5 Import ArticlesModule in AppModule
- [x] 8.6 Remove default AppController/AppService scaffold

## 9. Health Check Enhancement

- [x] 9.1 Update health endpoint to include Firebase connectivity status

## 10. API Spec Validation

- [x] 10.1 Verify all endpoints match api-spec.yml contracts
- [x] 10.2 Verify response formats match { data, meta } structure
- [x] 10.3 Verify error formats match { error, message, statusCode }

## 11. Documentation

- [x] 11.1 Update api-spec.yml if any API changes during implementation
- [x] 11.2 Update data-model.md if any data model changes during implementation