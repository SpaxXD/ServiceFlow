# ServiceFlow - Architecture Overview

## Clean Architecture Implementation

This project strictly follows Clean Architecture principles with clear separation of concerns across layers.

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)
**Purpose**: Contains pure business logic and domain models

**Files**:
- `entities/`: Domain entities with business logic methods
  - User, Client, Service, AuditLog, RefreshToken
  - Methods like `isAdmin()`, `canEdit()`, `canDelete()`
  - Pure business rules without any framework dependencies
  
- `repositories/`: Interface contracts (no implementations)
  - IUserRepository, IClientRepository, IServiceRepository
  - IAuditLogRepository, IRefreshTokenRepository
  - Define contracts that infrastructure must implement

**Key Principle**: Domain layer has NO dependencies on other layers

### 2. Application Layer (`src/application/`)
**Purpose**: Implements use cases and orchestrates domain logic

**Files**:
- `dtos/`: Data Transfer Objects
  - UserDTO, ClientDTO, ServiceDTO
  - Define data structures for API requests/responses
  - Validation schemas for frontend communication
  
- `use-cases/`: Business logic orchestration
  - AuthUseCase: Handles registration, login, token refresh
  - ClientUseCase: Client CRUD with permission checks
  - ServiceUseCase: Service CRUD with business rules
  - Dashboard metrics calculation
  - Permission validation via UserEntity methods

**Key Principle**: Application layer depends only on Domain layer

### 3. Infrastructure Layer (`src/infra/`)
**Purpose**: Implements technical details and external services

**Files**:
- `database/`: Database connection setup
  - Prisma client initialization
  - Connection lifecycle management
  
- `repositories/`: Repository implementations
  - UserRepository implements IUserRepository
  - ClientRepository implements IClientRepository
  - ServiceRepository implements IServiceRepository
  - AuditLogRepository implements IAuditLogRepository
  - RefreshTokenRepository implements IRefreshTokenRepository
  - SQL queries and database operations
  
- `auth/`: Authentication services
  - JWTService: Token generation and validation

**Key Principle**: Infrastructure depends on Domain through repository interfaces

### 4. Presentation Layer (`src/presentation/`)
**Purpose**: HTTP request handling and routing

**Files**:
- `controllers/`: Request handlers
  - AuthController: Registration, login, token refresh
  - ClientController: Client CRUD endpoints
  - ServiceController: Service CRUD and metrics endpoints
  - Thin controllers - delegate to use cases
  
- `routes/`: Route definitions
  - Group endpoints by resource
  - Wire dependencies (repositories → use cases → controllers)
  - Attach middlewares
  
- `middlewares/`: Cross-cutting concerns
  - authMiddleware: JWT verification and user context
  - errorHandler: Centralized error handling

**Key Principle**: Presentation depends on Application and Infra, NOT vice versa

### 5. Shared Layer (`src/shared/`)
**Purpose**: Utilities and errors used across all layers

**Files**:
- `errors/`: Custom error classes
  - AppError, ValidationError, NotFoundError, UnauthorizedError
  - HTTP status codes
  - Proper error propagation
  
- `utils/`: Helper functions
  - UUID generation
  - Random token generation
  - Date formatting

**Key Principle**: No business logic, only utilities

## Dependency Inversion

### Repositories pattern
```
Domain (Interface) ← Infra (Implementation)
    ↓               Application
 Use Case (depends on interface, not implementation)
```

### Use Cases pattern
```
Controllers → Use Cases → Domain Entities
                              ↓
                      Repository Interface
                              ↓
                        Repository Implementation
                              ↓
                        Prisma/Database
```

## Data Flow

### Create Client Request Flow
1. **Presentation**: ClientController receives POST /clients
2. **Validation**: Zod schema validates request body
3. **Application**: ClientUseCase.createClient processes request
4. **Domain**: ClientEntity validates business rules
5. **Permission Check**: UserEntity.canEdit() checks authorization
6. **Infra**: ClientRepository.create() executes database query
7. **Audit Log**: AuditLog created for the operation
8. **Response**: Mapped DTO returned to client

### Authentication Flow
1. **Presentation**: AuthController receives login request
2. **Application**: AuthUseCase.login orchestrates login
3. **Infra**: UserRepository.findByEmail fetches user
4. **Domain**: Password validation via bcrypt
5. **Infra**: RefreshTokenRepository creates refresh token
6. **Response**: JWT and refresh token returned

## Testing Strategy

### Unit Tests
- Test UseCases in isolation with mocked repositories
- Test Entity business logic
- Test utility functions

### Integration Tests
- Test full request flow
- Test repository queries
- Test middleware behavior

Example:
```typescript
// Clear separation - mock at repository level
const mockUserRepository = { findByEmail: vi.fn() }
const authUseCase = new AuthUseCase(mockUserRepository, mockRefreshTokenRepository)

// Test only the use case logic, not database
await authUseCase.register({ email, password, role })
```

## Environment & Configuration

- Database connection: Infrastructure layer
- JWT secrets: Environment variables accessed by JWTService
- Error handling: Presentation layer catches and formats errors
- Logging: Can be added to any layer without affecting others

## Key Principles Applied

✅ **Single Responsibility Principle**: Each class has one reason to change
✅ **Open/Closed Principle**: Interfaces allow extension without modification
✅ **Liskov Substitution Principle**: Repository implementations are interchangeable
✅ **Interface Segregation Principle**: Focused repository interfaces
✅ **Dependency Inversion Principle**: Depend on abstractions, not implementations

## Extending the Architecture

### Adding a new entity (e.g., Invoice)
1. Create InvoiceEntity in `domain/entities/`
2. Create IInvoiceRepository in `domain/repositories/`
3. Create InvoiceUseCase in `application/use-cases/`
4. Create InvoiveRepository in `infra/repositories/`
5. Add Prisma schema
6. Create InvoiceController in `presentation/controllers/`
7. Add routes in `presentation/routes/`
8. Write tests

### Adding a new feature
- Identify which layers it affects
- Respect dependency direction (outer layers can depend on inner)
- Keep domain logic pure and framework-agnostic
