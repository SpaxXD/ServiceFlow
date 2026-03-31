# ServiceFlow Backend

The backend is a production-ready Fastify server built with TypeScript, following Clean Architecture principles.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Setup environment variables**:
```bash
cp .env.example .env
```

3. **Update .env with your database credentials**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/serviceflow
JWT_SECRET=your-secret-key-here
```

### Database Setup

1. **Create Prisma migrations**:
```bash
npm run db:migrate
```

This creates the database schema from `prisma/schema.prisma`.

2. **Seed database with initial data**:
```bash
npm run db:seed
```

This creates:
- 3 users (admin, manager, user) with test passwords
- 3 sample clients
- 4 sample services

### Development

Start the development server:
```bash
npm run dev
```

Server runs on: `http://localhost:3000`

### Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
src/
├── domain/
│   ├── entities/          # User, Client, Service, AuditLog
│   └── repositories/      # IUserRepository, IClientRepository, etc.
├── application/
│   ├── dtos/              # Request/response schemas
│   └── use-cases/         # Auth, Client, Service use cases
├── infra/
│   ├── database/          # Prisma connection
│   ├── repositories/      # Repository implementations
│   └── auth/              # JWT service
├── presentation/
│   ├── controllers/       # Auth, Client, Service controllers
│   ├── routes/            # Route definitions
│   └── middlewares/       # Auth middleware, error handler
├── shared/
│   ├── errors/            # Custom error classes
│   └── utils/             # Helper functions
└── server.ts              # Entry point
```

## API Features

### Authentication
- User registration with role selection
- JWT-based login (15-minute tokens)
- Refresh token generation (7-day tokens)
- Secure logout
- Token refresh for continued sessions

### Clients
- Create/read/update/delete clients
- Search and pagination
- Audit logging

### Services
- Create/read/update/delete services
- Status tracking (pending, in progress, completed)
- Value tracking and revenue calculation
- Dashboard metrics endpoint
- Filter by status and client

### Authorization
- Admin: Full CRUD access
- Manager: Create, read, update (no delete)
- User: Read-only access

## Testing

### Run Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://serviceflow:serviceflow@localhost:5432/serviceflow

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Database Migrations

### Create a new migration
```bash
npx prisma migrate dev --name migration_name
```

### Apply pending migrations
```bash
npm run db:migrate
```

### Reset database (development only)
```bash
npx prisma migrate reset
```

### View database
```bash
npx prisma studio
```

## Common Tasks

### Add a new entity
1. Create entity in `src/domain/entities/`
2. Create repository interface in `src/domain/repositories/`
3. Add Prisma model in `prisma/schema.prisma`
4. Implement repository in `src/infra/repositories/`
5. Create use case in `src/application/use-cases/`
6. Create controller in `src/presentation/controllers/`
7. Add routes in `src/presentation/routes/`

### Handle database errors
The error handler middleware catches all errors and returns appropriate HTTP status codes:
- 400: Validation errors
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 409: Conflict (duplicate records)
- 500: Internal server error

### Debug logs
Enable detailed logging by checking the Fastify server initialization:
```bash
NODE_DEBUG=* npm run dev
```

## Security

- ✅ JWT tokens with short expiration
- ✅ Refresh tokens in database for revocation
- ✅ Bcryptjs password hashing
- ✅ Role-based access control
- ✅ SQL injection prevention via Prisma
- ✅ Audit logging for all operations
- ✅ TypeScript strict mode

## Production Deployment

### Before deploying:
1. Change JWT_SECRET to a strong, random value
2. Set NODE_ENV=production
3. Configure database with SSL
4. Set up automated backups
5. Configure monitoring and logging
6. Test all migrations
7. Load test the API

### Docker deployment:
```bash
docker build -t serviceflow-backend .
docker run -p 3000:3000 --env-file .env serviceflow-backend
```

## Troubleshooting

### Database connection failed
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check username/password
- Ensure database exists

### Migrations failed
```bash
npx prisma migrate resolve --rolled-back migration_name
```

### Type errors after schema changes
```bash
npx prisma generate
```

### Port already in use
```bash
lsof -i :3000
kill -9 <PID>
```

## API Examples

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","role":"user"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Client
```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Client Name","email":"client@example.com"}'
```

### Dashboard Metrics
```bash
curl http://localhost:3000/services/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Optimization

- Database queries are optimized with proper indexes
- Pagination implemented (default 10 items per page)
- Query result caching via TanStack Query on frontend
- JWT tokens reduce database lookups per request
- Audit logs don't block main operations

## Contributing

1. Follow Clean Architecture principles
2. Keep business logic in domain/entities
3. Keep use cases orchestrating, not implementing complex logic
4. Write tests for use cases
5. Use TypeScript strict mode
6. Update README for new features
