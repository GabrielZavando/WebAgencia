## 1. Setup and Dependencies

- [x] 1.1 Install @nestjs/swagger and swagger-ui-express dependencies
- [x] 1.2 Verify OpenSpec change status is complete

## 2. Swagger Configuration

- [x] 2.1 Configure Swagger module in main.ts with proper options
- [x] 2.2 Set up Swagger to only be available in development environment
- [x] 2.3 Configure Swagger to use existing OpenAPI spec from docs/api-spec.yml

## 3. Update Controllers with Swagger Decorators

- [x] 3.1 Add ApiTags, ApiOperation, ApiResponse decorators to Auth controllers
- [x] 3.2 Add ApiTags, ApiOperation, ApiResponse decorators to Users controllers
- [x] 3.3 Add ApiTags, ApiOperation, ApiResponse decorators to Articles controllers
- [x] 3.4 Add ApiTags, ApiOperation, ApiResponse decorators to Categories controllers
- [x] 3.5 Add ApiTags, ApiOperation, ApiResponse decorators to Leads controllers

## 4. Add Complete API Documentation with Examples

- [x] 4.1 Add ApiProperty decorators to all DTOs with descriptions and examples
- [x] 4.2 Add ApiParam decorators for path parameters with examples
- [x] 4.3 Add ApiQuery decorators for query parameters with examples
- [x] 4.4 Add ApiBody decorators for request bodies
- [x] 4.5 Add detailed response examples with @ApiResponse schema examples

## 5. Verification

- [x] 5.1 Start development server and verify Swagger UI is accessible at /api/docs
- [x] 5.2 Verify all endpoints are documented correctly in Swagger UI
- [x] 5.3 Verify Swagger UI is not accessible in production mode