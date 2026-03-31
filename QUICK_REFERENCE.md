# Quick Reference

Essential commands and configurations for ServiceFlow.

## Startup Commands

### Docker (Recommended)

```bash
# First time setup
docker-compose up --build

# Subsequent runs
docker-compose up

# Run in background
docker-compose up -d

# Stop all services
docker-compose down

# Reset everything (delete data!)
docker-compose down -v
docker-compose up --build
```

### Local Development

```bash
# Terminal 1: Database
docker-compose up postgres

# Terminal 2: Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

### Verify Everything Works

```bash
# Check all services running
docker-compose ps

# Test backend API
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer {token}"

# Test frontend
open http://localhost:5173
# or
curl http://localhost:5173
```

## Test Credentials

```
Email:    admin@serviceflow.com
Password: admin123
Role:     admin
```

Other test users created by seed:
- `manager@serviceflow.com` / `manager123` (manager)
- `user@serviceflow.com` / `user123` (user)

## Key URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:3000 | 3000 |
| Database | localhost:5432 | 5432 |
| Prisma Studio | `npx prisma studio` | 5555 |

## Common Commands

### Backend

```bash
cd backend

# Development
npm run dev              # Start with hot reload
npm run build           # Compile TypeScript
npm start               # Prod build
npm test                # Run tests
npm run test:watch      # Tests in watch mode
npm run lint            # Check code style
npm run format          # Auto-format code

# Database
npx prisma studio      # Visual database editor
npx prisma migrate dev # Create migration
npx prisma db push     # Sync schema
npx prisma db pull     # Pull from database
npx prisma generate    # Regenerate client
npm run db:seed        # Populate test data
```

### Frontend

```bash
cd frontend

# Development
npm run dev              # Start with HMR
npm run build           # Production build
npm run preview         # Preview production build
npm test                # Run tests
npm run test:watch      # Tests in watch mode
npm run lint            # Check code style
npm run format          # Auto-format code
```

### Docker

```bash
# View logs
docker-compose logs -f                # All services
docker-compose logs -f {service}      # Specific service
docker-compose logs --tail=100 {service}

# Execute commands
docker-compose exec {service} {command}
docker-compose exec backend npm test
docker-compose exec postgres psql -U postgres

# Manage containers
docker-compose start
docker-compose stop
docker-compose restart {service}
docker-compose rebuild {service}
```

## Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/serviceflow?schema=public

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

All values are examples. Change in production and use `.env.example` as reference.

## File Organization

```
backend/
  src/
    domain/         ← Business logic (entities, interfaces)
    application/    ← Use cases (workflows)
    infra/          ← Database, Auth implementations
    presentation/   ← Controllers, Routes
    shared/         ← Errors, Utils
  tests/
  prisma/

frontend/
  src/
    components/     ← Reusable UI components
    pages/          ← Full page components
    hooks/          ← Custom React hooks
    forms/          ← Form components
    services/       ← API client
    types/          ← TypeScript interfaces
    utils/          ← Helper functions
  tests/
```

## API Endpoints

### Authentication

```
POST   /api/auth/register      Create account
POST   /api/auth/login         Get tokens
POST   /api/auth/refresh       Refresh access token
POST   /api/auth/logout        Invalidate refresh token
```

### Clients

```
GET    /api/clients             List all (paginated)
GET    /api/clients/:id         Get one
POST   /api/clients             Create
PUT    /api/clients/:id         Update
DELETE /api/clients/:id         Delete
```

### Services

```
GET    /api/services            List all (paginated)
GET    /api/services/:id        Get one
POST   /api/services            Create
PUT    /api/services/:id        Update
DELETE /api/services/:id        Delete
```

### Dashboard

```
GET    /api/dashboard/metrics   Get all metrics
```

All require Authorization header except register/login:
```
Authorization: Bearer {accessToken}
```

## Database Schema

```sql
User          -- Accounts with roles
├── id
├── email (unique)
├── password (hashed)
├── role (admin|manager|user)
├── createdAt
├── updatedAt

Client        -- Business clients
├── id
├── name
├── email (unique)
├── createdAt
├── updatedAt

Service       -- Services provided
├── id
├── clientId (FK)
├── title
├── description
├── value
├── status (pending|in_progress|completed)
├── createdAt
├── updatedAt

AuditLog      -- Change history
├── id
├── userId (FK)
├── entityType
├── entityId
├── action (CREATE|UPDATE|DELETE|LOGIN|LOGOUT)
├── oldValues (JSON)
├── newValues (JSON)
├── createdAt

RefreshToken  -- Auth tokens
├── id
├── userId (FK)
├── token (unique)
├── expiresAt
├── createdAt
```

## Testing

```bash
# Run all tests
npm test

# Run specific file
npm test [filename]

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E (if configured)
npm run test:e2e
```

## Debugging

```bash
# Backend
# 1. Add breakpoints in code
debugger;

# 2. Run with inspection
node --inspect-brk dist/server.js

# 3. Open Chrome DevTools
chrome://inspect

# Frontend
# 1. Open browser DevTools (F12)
# 2. Check Console for errors
# 3. Use Sources tab for breakpoints
# 4. React DevTools extension helpful

# Database
# 1. Open Prisma Studio
npx prisma studio

# 2. Query directly
docker-compose exec postgres psql -U postgres -d serviceflow
# SELECT * FROM "User";
```

## Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy with Docker
docker build -t serviceflow-backend .
docker run -p 3000:3000 serviceflow-backend

# With docker-compose
docker-compose -f docker-compose.yml up -d
```

For full deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Port already in use | Change port in docker-compose.yml |
| Database connection error | Check DATABASE_URL, ensure postgres running |
| API 401 Unauthorized | Verify JWT token, check Authorization header |
| API 403 Forbidden | Check user role and permissions |
| Blank frontend screen | Check browser console (F12), verify backend running |
| Old data showing | Clear localStorage, refresh page, restart services |
| TypeScript errors | Run `npm run build`, check types in tsconfig.json |
| Database corrupted | `docker-compose down -v && docker-compose up` |

For more help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Code Style & Patterns

### Backend Patterns

```typescript
// Repository pattern - access data
const user = await userRepository.findById(id);

// Use case pattern - business logic
const user = await authUseCase.register(dto);

// Controller pattern - thin HTTP layer
async register(request, reply) {
  const user = await useCase.register(request.body);
  reply.status(201).send(user);
}

// Error handling
throw new NotFoundError('User not found');  // 404
throw new ValidationError('Invalid email'); // 400
throw new ForbiddenError('Access denied');  // 403
```

### Frontend Patterns

```typescript
// Custom hooks - reusable logic
const { data, isLoading } = useClients();

// API service - HTTP calls
await clientService.list(page, pageSize);

// React Hook Form - form handling
const { register, handleSubmit } = useForm();

// TanStack Query - data fetching
const query = useQuery({
  queryKey: ['clients'],
  queryFn: () => clientService.list(),
});
```

## Performance Tips

### Backend
- Use pagination (max 10-20 items per page)
- Add database indexes for common queries
- Cache frequently accessed data
- Monitor slow queries with Prisma logging

### Frontend
- React Query caches automatically
- Use `staleTime` to reduce refetches
- Code-split pages with dynamic imports
- Lazy-load images
- Check Network tab for slow requests

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS/SSL in production
- [ ] Verify all endpoints authenticated
- [ ] Check row-level security (users see own data)
- [ ] Enable CORS only for trusted domains
- [ ] Hash passwords (bcryptjs)
- [ ] Validate all inputs (Zod)
- [ ] No hardcoded secrets in code
- [ ] Enable rate limiting
- [ ] Regular security audits

## Useful Tools

| Tool | Purpose | Command |
|------|---------|---------|
| Curl | Test API | `curl -H "Authorization: Bearer {token}" http://localhost:3000/api/clients` |
| jq | Parse JSON | `curl ... \| jq '.data[0]'` |
| Postman | API testing | GUI for testing endpoints |
| VS Code | Code editor | Already configured with extensions |
| pgAdmin | Database GUI | Optional PostgreSQL management |
| Docker Desktop | Container GUI | Docker management |

## Project Statistics

- **Backend**: ~3,000 lines of TypeScript
- **Frontend**: ~2,500 lines of TypeScript/JSX
- **Database**: 5 models, auto-generated migrations
- **Tests**: 20+ test cases
- **Documentation**: 2,000+ lines
- **Docker**: Multi-service orchestration
- **Dependencies**: 50+ (with security scanning)

## Version Information

```
Node.js:       18.0.0+
PostgreSQL:    15 (Alpine)
React:         18.0+
Fastify:       4.0+
Prisma:        4.0+
TypeScript:    5.0+
Docker:        20.10+
Docker Compose: 2.0+
```

## File Sizes (Approximate)

```
backend/src              ~500 KB (50 files)
frontend/src             ~300 KB (25 files)
backend/node_modules     ~500 MB
frontend/node_modules    ~400 MB
database                 ~50 MB
docker-compose.yml       ~2 KB
```

## Common Git Commands

```bash
# Before making changes
git pull origin main

# Create feature branch
git checkout -b feat/your-feature

# Stage changes
git add .

# Commit
git commit -m "feat: add feature"

# Push
git push origin feat/your-feature

# Create pull request
# (On GitHub interface)
```

## Links & Resources

- [Project README](./README.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Project Structure](./PROJECT_STRUCTURE.md)

## Support Channels

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review [API.md](./API.md) for endpoint reference
3. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for patterns
4. Review existing code in repository
5. Check logs: `docker-compose logs -f`
6. Open GitHub issue with details

---

**Pro Tip**: Bookmark this page! It covers 95% of what you need to know.

Last updated: February 2024
