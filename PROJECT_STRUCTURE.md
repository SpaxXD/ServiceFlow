# Project Structure Reference

Complete directory and file layout for ServiceFlow.

```
serviceflow/
│
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── User.ts              # User entity with role-based methods
│   │   │   │   ├── Client.ts            # Client entity with validation
│   │   │   │   ├── Service.ts           # Service entity with status logic
│   │   │   │   ├── AuditLog.ts          # Audit log entity
│   │   │   │   └── RefreshToken.ts      # Refresh token entity
│   │   │   └── repositories/
│   │   │       ├── IUserRepository.ts   # User repository interface
│   │   │       ├── IClientRepository.ts # Client repository interface
│   │   │       ├── IServiceRepository.ts# Service repository interface
│   │   │       ├── IAuditLogRepository.ts # Audit log repository interface
│   │   │       └── IRefreshTokenRepository.ts # Refresh token repository interface
│   │   │
│   │   ├── application/
│   │   │   ├── dtos/
│   │   │   │   ├── UserDTO.ts          # User request/response DTOs
│   │   │   │   ├── ClientDTO.ts        # Client request/response DTOs
│   │   │   │   ├── ServiceDTO.ts       # Service request/response DTOs
│   │   │   │   └── DashboardDTO.ts     # Dashboard metrics DTOs
│   │   │   └── use-cases/
│   │   │       ├── AuthUseCase.ts      # Authentication use case (register/login/refresh)
│   │   │       ├── ClientUseCase.ts    # Client CRUD use case
│   │   │       ├── ServiceUseCase.ts   # Service CRUD use case
│   │   │       ├── DashboardUseCase.ts # Dashboard metrics use case
│   │   │       └── AuditLogUseCase.ts  # Audit log use case
│   │   │
│   │   ├── infra/
│   │   │   ├── database/
│   │   │   │   └── connection.ts       # Prisma client initialization
│   │   │   ├── repositories/
│   │   │   │   ├── UserRepository.ts   # User repository implementation
│   │   │   │   ├── ClientRepository.ts # Client repository implementation
│   │   │   │   ├── ServiceRepository.ts# Service repository implementation
│   │   │   │   ├── AuditLogRepository.ts # Audit log repository implementation
│   │   │   │   └── RefreshTokenRepository.ts # Refresh token repository implementation
│   │   │   └── auth/
│   │   │       └── JWTService.ts       # JWT token generation/validation
│   │   │
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   ├── AuthController.ts   # Authentication endpoints (register/login/refresh)
│   │   │   │   ├── ClientController.ts # Client CRUD endpoints
│   │   │   │   ├── ServiceController.ts# Service CRUD endpoints
│   │   │   │   └── DashboardController.ts # Dashboard metrics endpoint
│   │   │   ├── routes/
│   │   │   │   ├── authRoutes.ts       # Auth route definitions
│   │   │   │   ├── clientRoutes.ts     # Client route definitions
│   │   │   │   ├── serviceRoutes.ts    # Service route definitions
│   │   │   │   ├── dashboardRoutes.ts  # Dashboard route definitions
│   │   │   │   └── index.ts            # Route aggregation
│   │   │   └── middlewares/
│   │   │       ├── auth.ts             # JWT authentication middleware
│   │   │       └── errorHandler.ts     # Global error handling middleware
│   │   │
│   │   ├── shared/
│   │   │   ├── errors/
│   │   │   │   ├── AppError.ts         # Custom error class with HTTP status mapping
│   │   │   │   ├── ValidationError.ts  # Validation error class
│   │   │   │   ├── NotFoundError.ts    # Not found error class
│   │   │   │   ├── UnauthorizedError.ts# Unauthorized error class
│   │   │   │   ├── ForbiddenError.ts   # Forbidden error class
│   │   │   │   └── ConflictError.ts    # Conflict error class
│   │   │   └── utils/
│   │   │       ├── helpers.ts          # Utility functions (UUID, token generation)
│   │   │       └── constants.ts        # Application constants
│   │   │
│   │   ├── server.ts                   # Fastify server configuration and startup
│   │   └── types.ts                    # Fastify type augmentation for custom properties
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── AuthUseCase.test.ts     # Auth use case unit tests
│   │   │   ├── ClientUseCase.test.ts   # Client use case unit tests
│   │   │   └── ServiceUseCase.test.ts  # Service use case unit tests
│   │   └── integration/
│   │       └── routes.test.ts          # Integration tests for API routes
│   │
│   ├── prisma/
│   │   ├── schema.prisma               # Prisma database schema (6 models)
│   │   └── migrations/                 # Database migrations (auto-generated)
│   │
│   ├── scripts/
│   │   └── seed.ts                     # Database seed script (creates test users/data)
│   │
│   ├── Dockerfile                      # Docker image for backend
│   ├── package.json                    # Dependencies and npm scripts
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── vitest.config.ts                # Vitest test runner configuration
│   ├── .env                            # Environment variables (git-ignored)
│   ├── .env.example                    # Example environment variables
│   ├── .gitignore                      # Git ignore rules
│   ├── README.md                       # Backend-specific documentation
│   └── biome.json                      # Code formatting rules
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx              # Navigation and user menu component
│   │   │   ├── ProtectedRoute.tsx      # Route protection wrapper component
│   │   │   ├── Toast.tsx               # Toast notification system component
│   │   │   └── Skeleton.tsx            # Loading skeleton placeholders component
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx           # Login page with form
│   │   │   ├── RegisterPage.tsx        # Registration page with role selection
│   │   │   ├── DashboardPage.tsx       # Metrics dashboard with 7 cards
│   │   │   ├── ClientsPage.tsx         # Clients list with CRUD operations
│   │   │   └── ServicesPage.tsx        # Services list with filtering and CRUD
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts              # Authentication state and login/register/logout
│   │   │   ├── useClients.ts           # Client query and mutations with cache
│   │   │   ├── useServices.ts          # Service query and mutations with cache
│   │   │   ├── useToast.tsx            # Toast notification context hook
│   │   │   └── usePermissions.ts       # Permission checking hooks
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx           # Login form with validation
│   │   │   ├── RegisterForm.tsx        # Registration form with validation
│   │   │   ├── ClientForm.tsx          # Client create/edit form
│   │   │   └── ServiceForm.tsx         # Service create/edit form
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                  # Axios API client with interceptors
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces for domain types
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts           # Formatting utilities (currency, date, colors)
│   │   │   ├── calculations.ts         # Calculation utilities (metrics, labels)
│   │   │   └── constants.ts            # Frontend constants
│   │   │
│   │   ├── App.tsx                     # Main app component with routing
│   │   ├── main.tsx                    # React DOM render entry point
│   │   └── index.css                   # Global styles and Tailwind directives
│   │
│   ├── tests/
│   │   ├── LoginForm.test.tsx          # Component test example
│   │   └── setup.ts                    # Test environment setup
│   │
│   ├── index.html                      # HTML entry point
│   ├── vite.config.ts                  # Vite build configuration
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── postcss.config.js               # PostCSS configuration
│   ├── vitest.config.ts                # Vitest configuration
│   ├── Dockerfile                      # Docker image for frontend
│   ├── package.json                    # Dependencies and npm scripts
│   ├── .env                            # Environment variables (git-ignored)
│   ├── .env.example                    # Example environment variables
│   ├── .gitignore                      # Git ignore rules
│   ├── README.md                       # Frontend-specific documentation
│   └── biome.json                      # Code formatting rules
│
├── docker-compose.yml                  # Docker Compose configuration (3 services)
├── setup.sh                            # Setup script for quick start
├── validate.js                         # Project structure validation script
├── Makefile                            # Development command shortcuts
│
├── README.md                           # Main project documentation (600+ lines)
├── ARCHITECTURE.md                     # Architecture explanation and patterns
├── GETTING_STARTED.md                  # Quick start guide
├── API.md                              # Complete API documentation
├── DEPLOYMENT.md                       # Production deployment guide
├── CHANGELOG.md                        # Version history and roadmap
├── CONTRIBUTING.md                     # Contribution guidelines
│
├── .gitignore                          # Git ignore rules at root
├── .prettierrc                         # Code formatter configuration
├── .prettierignore                     # Prettier ignore rules
└── LICENSE                             # Project license (MIT)
```

## File Descriptions by Layer

### Domain Layer (Business Logic)

Contains **Entities** and **Repository Interfaces**—pure business logic with zero dependencies.

**Entities** (represent core concepts):
- `User.ts`: User with roles (admin/manager/user), permissions
- `Client.ts`: Client with name and email
- `Service.ts`: Service with title, description, value, status
- `AuditLog.ts`: Tracks all changes to entities
- `RefreshToken.ts`: Token management for auth

**Repositories** (contracts for data access):
- Define CRUD operations without implementation
- Used by use cases to access domain entities
- Implemented in infrastructure layer

### Application Layer (Use Cases)

Orchestrates the business logic defined in domain layer.

**DTOs** (Data Transfer Objects):
- Define request/response schemas
- Zod validation schemas for API contracts
- Separate from domain entities

**Use Cases** (business workflows):
- `AuthUseCase`: register → hash password → create user, login → verify → return tokens
- `ClientUseCase`: CRUD operations with permission checks, pagination, search
- `ServiceUseCase`: CRUD operations with status validation, filtering
- `DashboardUseCase`: Calculate metrics from services and clients
- `AuditLogUseCase`: Record changes to entities

### Infrastructure Layer (Technical Implementation)

Implements domain interfaces with actual code (database, auth, HTTP).

**Repositories**:
- Query and persist data using Prisma
- Implement sorting, pagination, filtering
- Calculate aggregations for dashboard

**Database**:
- Prisma client initialization
- Connection pooling, timeout configuration

**Auth**:
- JWT token generation (15-minute access, 7-day refresh)
- Token validation and decoding

### Presentation Layer (HTTP Interface)

Handles HTTP requests and responses.

**Controllers**:
- Thin layer that:
  1. Receives HTTP request
  2. Calls use case
  3. Formats response
  4. Sets HTTP status code

**Routes**:
- Define HTTP methods and paths
- Wire controller to dependency injection
- Use services before applying routes

**Middlewares**:
- `auth.ts`: Verify JWT, extract user, attach to request
- `errorHandler.ts`: Catch errors, format response, set status codes

### Shared Layer (Cross-Cutting Concerns)

**Error Classes**:
- `AppError`: Base error with statusCode
- `ValidationError`: 400 status
- `NotFoundError`: 404 status
- `UnauthorizedError`: 401 status
- `ForbiddenError`: 403 status
- `ConflictError`: 409 status

**Utilities**:
- `generateUUID()`: Generate unique IDs
- `generateRandomToken()`: Generate refresh tokens
- `hashPassword()`: Bcryptjs password hashing

## Frontend Structure

### Pages (Full Page Components)

Each page is a complete feature:
- **LoginPage**: Email/password form → calls useAuth.login()
- **RegisterPage**: Registration with role selection
- **DashboardPage**: 7 metric cards, auto-refreshes every 30 seconds
- **ClientsPage**: Table with search, pagination, create/edit/delete modals
- **ServicesPage**: Table with search, status filter, pagination, modals

### Hooks (Stateful Logic)

- **useAuth**: Auth state, login/register mutations, permission checks
- **useClients**: Client queries, create/update/delete mutations
- **useServices**: Service queries, create/update/delete mutations, dashboard metrics
- **useToast**: Toast notification queue with auto-dismiss
- **usePermissions**: Permission checking (canEdit, canDelete)

### Forms (Input Components)

- **LoginForm**: Email/password with React Hook Form + Zod
- **RegisterForm**: Registration with role selection
- **ClientForm**: Name/email fields, optionally populated for editing
- **ServiceForm**: ClientId, title, description, value fields

### Services (API Layer)

- **api.ts** (Axios instance):
  - Request interceptor: Injects "Bearer {token}" header
  - Response interceptor: Catches 401, refreshes token, retries request
  - Auth methods: register, login, logout
  - Client methods: list, create, update, delete
  - Service methods: list, create, update, delete, getMetrics
  - Automatic error handling and retry logic

### Components (Reusable UI)

- **Header**: Navigation menu, user info, logout button, responsive
- **ProtectedRoute**: Wraps routes, redirects to login if not authenticated
- **Toast**: Context provider + container, handles success/error/info messages
- **Skeleton**: Placeholder loaders for tables and cards during data fetch

### Types (TypeScript Interfaces)

Matches backend DTO contracts exactly:
- `User`: id, email, role
- `Client`: id, name, email, createdAt, updatedAt
- `Service`: id, clientId, title, description, value, status, createdAt, updatedAt
- `DashboardMetrics`: totalClients, totalServices, totalRevenue, statusBreakdown, etc.

### Utils (Helper Functions)

**Formatters**:
- `formatCurrency()`: Convert numbers to USD format
- `formatDate()`: Format ISO dates
- `formatDateTime()`: Format with time
- `getStatusColor()`: Return Tailwind color classes for status

**Calculations**:
- `calculateCompletionRate()`: Percentage of completed services
- `calculateAverageServiceValue()`: Mean service value
- `getServiceStatusLabel()`: Human-readable status text
- `getRoleLabel()`: Human-readable role text

## Configuration Files

### Backend Configuration

- **package.json**: 30+ dependencies (Fastify, Prisma, Zod, JWT, bcryptjs, etc.)
- **tsconfig.json**: TypeScript strict mode, module resolution
- **vitest.config.ts**: Unit/integration test configuration
- **.env**: Database URL, JWT secret, frontend URL for CORS

### Frontend Configuration

- **package.json**: 25+ dependencies (React, Vite, Axios, TanStack Query, Tailwind, etc.)
- **tsconfig.json**: React JSX transformation, strict mode
- **vite.config.ts**: Fast development server, production build, hmr configuration
- **tailwind.config.js**: Tailwind theme extension (colors, breakpoints)
- **postcss.config.js**: Autoprefixer for browser compatibility
- **vitest.config.ts**: Component testing configuration
- **.env**: API URL pointing to backend

### Docker Configuration

- **docker-compose.yml**: 3 services (postgres, backend, frontend)
  - PostgreSQL: Port 5432, volumes for data persistence
  - Backend: Port 3000, depends on postgres
  - Frontend: Port 5173, depends on backend
- **backend/Dockerfile**: Multi-stage build, Node.js runtime
- **frontend/Dockerfile**: Multi-stage build, Node.js builder + nginx server

## Entry Points

**Backend**: `backend/src/server.ts`
- Creates Fastify instance
- Registers routes
- Starts listening on port 3000

**Frontend**: `frontend/src/main.tsx`
- Renders React app to DOM
- Wraps with providers (Auth, Toast, Query)

**Database**: `backend/prisma/schema.prisma`
- Defines 6 tables (User, Client, Service, AuditLog, RefreshToken)
- Run migrations with `npx prisma migrate deploy`

## Development Workflow

### Simple Change
```
frontend/src/pages/ClientsPage.tsx → Save → Vite HMR → Browser updates
```

### Backend Change
```
backend/src/presentation/controllers/ClientController.ts → 
  npm run dev → Restart → Test with API tool
```

### Database Change
```
backend/prisma/schema.prisma → 
  npx prisma migrate dev --name [name] → Builds schema, runs migration
```

## Testing Files

**Backend**:
- `tests/unit/AuthUseCase.test.ts`: Unit tests for auth logic
- `tests/unit/ClientUseCase.test.ts`: Unit tests for client CRUD
- `tests/integration/routes.test.ts`: Integration tests for API

**Frontend**:
- `tests/LoginForm.test.tsx`: Component test example

Run with `npm test` in respective directories.

---

For detailed explanations, see:
- [README.md](./README.md) - Full project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architectural patterns
- [API.md](./API.md) - Complete API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
