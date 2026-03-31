# Troubleshooting Guide

Solutions for common issues in ServiceFlow.

## Quick Diagnosis

Before diving deeper, try these:

```bash
# 1. Check if services are running
docker ps

# 2. Check logs for errors
docker-compose logs -f        # All services
docker-compose logs backend   # Just backend
docker-compose logs frontend  # Just frontend

# 3. Verify database connection
docker-compose exec backend npx prisma db push

# 4. Clear cache and rebuild
docker-compose down -v        # Remove volumes
docker-compose up --build     # Rebuild

# 5. Check network connectivity
docker-compose exec backend ping postgres
```

---

## Backend Issues

### 1. Database Connection Error

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`

**Causes**:
- PostgreSQL container not running
- Incorrect DATABASE_URL
- Network connectivity issue

**Solutions**:

```bash
# Check if postgres is running
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Verify DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL

# Should look like:
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/serviceflow?schema=public"
```

If postgres not running:
```bash
docker-compose up postgres -d
sleep 10  # Give postgres time to start
docker-compose up backend
```

### 2. Migration Errors

**Error**: `PrismaClientRustPanicError: query engine crashed`

**Causes**:
- Database schema out of sync
- Pending migrations

**Solutions**:

```bash
# Run migrations in container
docker-compose exec backend npx prisma migrate deploy

# Or reset database (DEVELOPMENT ONLY)
docker-compose exec backend npx prisma migrate reset

# Push schema without migration
docker-compose exec backend npx prisma db push
```

### 3. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Causes**:
- Another process on port 3000
- Stale Docker container

**Solutions**:

```bash
# Find process on port 3000
lsof -i :3000                    # Linux/Mac
netstat -ano | findstr :3000     # Windows

# Kill process
kill -9 <PID>                    # Linux/Mac
taskkill /PID <PID> /F           # Windows

# Or change port in docker-compose.yml
# ports:
#   - "3001:3000"    ← Change frontend port mapping
```

### 4. JWT Token Errors

**Error**: `TokenExpiredError: jwt expired`

**Causes**:
- Access token expired
- Clock skew between servers
- Corrupted token

**Solutions**:

```bash
# Check token expiry in backend/.env
JWT_EXPIRY=15m    # Should be short-lived

# Verify server time is correct
docker-compose exec backend date
docker-compose exec postgres date

# Sync time if needed
docker-compose exec backend ntpdate -u pool.ntp.org
```

Token refresh should happen automatically. If not:

```bash
# Frontend should attempt refresh via Axios interceptor
# Check frontend logs for refresh token errors
docker-compose logs frontend
```

### 5. Seed Script Fails

**Error**: `Unique constraint failed on the fields: (email)`

**Causes**:
- Database not empty
- Previous seed data still exists

**Solutions**:

```bash
# Reset database (DEVELOPMENT ONLY)
docker-compose exec backend npx prisma migrate reset

# Or manually clear and reseed
docker-compose exec backend npx prisma db execute --stdin
# Then paste:
# DELETE FROM "User";
# DELETE FROM "Client";
# DELETE FROM "Service";

# Reseed
docker-compose exec backend npm run db:seed
```

### 6. Memory Issues

**Error**: `JavaScript heap out of memory`

**Causes**:
- Large dataset operations
- Memory leak
- Insufficient Node.js heap

**Solutions**:

```bash
# Increase Node.js heap size
docker-compose exec -e NODE_OPTIONS="--max-old-space-size=4096" backend node dist/server.js

# Or update docker-compose.yml:
# environment:
#   NODE_OPTIONS: "--max-old-space-size=4096"

# Check memory usage
docker stats
```

### 7. Type Errors at Runtime

**Error**: `Cannot read property 'email' of undefined`

**Causes**:
- Type mismatch between frontend and backend
- Missing null checks
- DTO fields mismatch

**Solutions**:

```bash
# Recompile TypeScript
docker-compose exec backend npm run build

# Check DTO matches interface
# backend/src/application/dtos/[Entity]DTO.ts
# frontend/src/types/index.ts
# Should have identical fields

# Add null checks
if (user?.email) { ... }
```

### 8. Prisma Client Generation Errors

**Error**: `Prisma Client was already instantiated`

**Causes**:
- Multiple Prisma Client instances
- Hot module reload issue

**Solutions**:

```bash
# Regenerate Prisma Client
docker-compose exec backend npx prisma generate

# Clear Prisma cache
rm -rf node_modules/.prisma

# Rebuild
docker-compose down
docker-compose build backend
docker-compose up backend
```

---

## Frontend Issues

### 1. Blank White Screen

**Causes**:
- React app not starting
- JavaScript errors
- API unreachable

**Solutions**:

```bash
# Check browser console (F12)
# Look for errors, typically:
# - "API is not reachable"
# - "Failed to fetch"

# Verify Vite dev server is running
docker-compose logs frontend

# Should show:
# Local:    http://127.0.0.1:5173/

# Check if backend is accessible
docker-compose exec frontend curl http://backend:3000/health

# Verify VITE_API_URL in frontend/.env
cat frontend/.env

# Should be: VITE_API_URL=http://backend:3000
```

### 2. API Requests Failing

**Error**: `Error: Network Error` or `401 Unauthorized`

**Causes**:
- Backend not running
- CORS issues
- Invalid token
- Authorization header missing

**Solutions**:

```bash
# Check backend is running
docker-compose ps backend

# Check CORS configuration in backend/src/server.ts
# Should include frontend URL

# Test API directly
curl -X GET http://localhost:3000/api/clients \
  -H "Authorization: Bearer <token>"

# Check token in browser
# F12 → Application → localStorage
# Should have: authToken, refreshToken

# Verify Axios interceptor is working
# frontend/src/services/api.ts
# Should inject Authorization header automatically
```

### 3. Token Refresh Not Working

**Error**: `401 Unauthorized` after 15 minutes

**Causes**:
- Refresh token expired
- Refresh endpoint broken
- Interceptor not working

**Solutions**:

```bash
# Check refresh token in localStorage
# F12 → Application → localStorage → refreshToken

# Verify refresh endpoint works
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<your_refresh_token>"}'

# Check Axios interceptor in api.ts
# Should catch 401 and attempt refresh

# Test in frontend by:
# 1. Wait 15 minutes OR manually expire token
# 2. Make API request
# 3. Should refresh silently
# 4. Check Network tab for second request
```

### 4. Vite HMR Not Working

**Error**: Code changes don't reload, or `WebSocket error`

**Causes**:
- HMR port not configured
- Network connectivity issue
- Firewall blocking

**Solutions**:

```bash
# Check Vite config
cat frontend/vite.config.ts

# Should have HMR configuration:
# hmr: {
#   host: 'localhost',
#   port: 5173,
# }

# Check if you can access Vite dev server
curl http://localhost:5173/

# Check browser console for HMR errors
# F12 → Console

# Restart Vite
docker-compose restart frontend
```

### 5. Form Validation Not Working

**Error**: Form submits invalid data or shows no errors

**Causes**:
- Zod schema not matching form fields
- Error display not implemented
- Form not connected to hook

**Solutions**:

```bash
# Check form uses useFormContext()
// frontend/src/forms/[Form].tsx
const { register, formState: { errors } } = useFormContext();

// And displays errors:
{errors.email && <span>{errors.email.message}</span>}

// Check Zod schema matches form fields
// frontend/src/services/api.ts
// All fields in schema must exist in form
```

### 6. State Not Persisting After Refresh

**Error**: Logged out after page refresh

**Causes**:
- Token not saved to localStorage
- Auth context not initialized on mount
- localStorage being cleared

**Solutions**:

```bash
# Check localStorage
// F12 → Application → localStorage
// Should have: authToken, refreshToken

// Check useAuth hook initialization
// frontend/src/hooks/useAuth.ts
// Should read from localStorage on mount:
const [token, setToken] = useLocalStorage('authToken', null);

// Check auth middleware restores state
// Usually in App.tsx or entry point

// Browser might clear localStorage if:
// - Site data is cleared
// - Private browsing
// - Cache clearing
```

### 7. Styling Not Loading (TailwindCSS)

**Error**: Classes not applied, elements unstyled

**Causes**:
- Tailwind config not scanning files
- CSS not imported
- PostCSS not processing

**Solutions**:

```bash
# Check tailwind.config.js has correct paths
cat frontend/tailwind.config.js

# Should include:
# content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]

# Verify index.css imported Tailwind
head -5 frontend/src/index.css

# Should have:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;

# Rebuild frontend
docker-compose up --build frontend
```

### 8. React Query Cache Issues

**Error**: Old data showing, mutations not updating

**Causes**:
- Cache invalidation not working
- staleTime too long
- cacheTime causing issues

**Solutions**:

```bash
// Check mutation invalidates cache
// frontend/src/hooks/use[Entity].ts
const mutation = useMutation({
  mutationFn: ...,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    // ↑ Must call this
  }
});

// Check cache times
const query = useQuery({
  queryKey: ['clients'],
  queryFn: ...,
  staleTime: 5 * 60 * 1000,      // 5 minutes
  cacheTime: 10 * 60 * 1000,     // 10 minutes
});

// Manually clear cache for debugging:
// In browser console:
// localStorage.clear();
// location.reload();
```

---

## Docker Issues

### 1. Container Won't Start

**Error**: `docker-compose up` hangs or exits

**Solutions**:

```bash
# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs postgres

# If database issues:
# Remove volumes (deletes data)
docker-compose down -v

# Rebuild
docker-compose build

# Restart with verbose output
docker-compose up --verbose
```

### 2. Out of Disk Space

**Error**: `no space left on device`

**Solutions**:

```bash
# Check disk usage
docker system df

# Clean up unused images/containers
docker system prune -a

# Remove specific containers
docker-compose down -v

# Remove unused volumes
docker volume prune
```

### 3. Network Connectivity Between Containers

**Error**: Backend can't reach postgres: `Host 'postgres' not found`

**Causes**:
- Docker network not created
- Service name wrong in DATABASE_URL
- Network not connected

**Solutions**:

```bash
# Check networks
docker network ls
docker network inspect serviceflow_default

# Verify services are on same network
docker-compose ps

# Test connectivity
docker-compose exec backend ping postgres

# Check SERVICE_HOST in DATABASE_URL
# Should be: postgres (service name in docker-compose.yml)
# NOT: localhost or 127.0.0.1
```

### 4. Permissions Issues

**Error**: `permission denied` when accessing files

**Causes**:
- File permissions after docker operations
- Running container as different user

**Solutions**:

```bash
# Fix file ownership (Linux)
sudo chown -R $USER:$USER serviceflow/

# Or run with user context
# In docker-compose.yml:
# services:
#   backend:
#     user: "1000:1000"
```

---

## Database Issues

### 1. Corrupted Database

**Error**: `database disk image is malformed` or similar

**Causes**:
- Improper shutdown
- Disk corruption
- Version mismatch

**Solutions**:

```bash
# Backup existing data
docker-compose exec postgres pg_dump -U postgres serviceflow > backup.sql

# Reset database
docker-compose down -v
docker-compose up postgres
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE serviceflow"

# Restore from backup if available
docker-compose exec -T postgres psql -U postgres serviceflow < backup.sql

# Or reseed from scratch
docker-compose up backend
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed
```

### 2. Slow Queries

**Error**: API responses are slow

**Solutions**:

```bash
# Enable query logging in prisma schema
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") # For migrations
}

generator client {
  provider = "prisma-client-js"
  // Enable query logging
  // (Client needs to be regenerated)
}

// Or in code:
// const prisma = new PrismaClient({
//   log: [{emit: 'stdout', level: 'query'}]
// })

// Check slow queries
docker-compose exec postgres psql -U postgres -d serviceflow
# SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;
```

### 3. Backup and Restore

**Backup**:
```bash
docker-compose exec postgres pg_dump -U postgres serviceflow > backup.sql
```

**Restore**:
```bash
docker-compose exec -T postgres psql -U postgres serviceflow < backup.sql
```

**Scheduled Backups** (Docker):
```bash
# Add to crontab
0 2 * * * docker-compose -f /path/to/docker-compose.yml exec -T postgres \
  pg_dump -U postgres serviceflow > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## Performance Optimization

### Backend Slow?

```bash
# Monitor resources
docker stats backend

# Check slow queries
# See Database Issues > Slow Queries

# Profile Node.js
docker-compose exec backend node --prof dist/server.js
docker-compose exec backend node --prof-process isolate-*.log > profile.txt

# Options to increase resources in docker-compose.yml
# environment:
#   NODE_OPTIONS: "--max-old-space-size=4096"
# deploy:
#   resources:
#     limits:
#       cpus: '2'
#       memory: 2G
```

### Frontend Slow?

```bash
# Check bundle size
cd frontend
npm run build
npm run preview    # Test production build

# Analyze bundle
npm install -D rollup-plugin-visualizer
# Update vite.config.ts to include plugin
# Rebuild and open dist/stats.html

# Check network requests
# F12 → Network tab
# Look for slow API calls or large assets

# Common issues:
# - Large images (optimize with tinypng.com)
# - Too many API calls (use pagination)
# - Missing React.memo() (prevent re-renders)
```

---

## Deployment Troubleshooting

### Docker Build Fails

**Error**: `npm install` fails in Docker

**Solutions**:

```bash
# Use npm ci instead of npm install
# backend/Dockerfile
RUN npm ci --only=production

# Include .dockerignore to skip files
# Create file: .dockerignore
node_modules
npm-debug.log
dist
.git
.env
```

### Services Communicate Without Docker Compose

If running services outside Docker (local development):

```bash
# Backend: Update DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/serviceflow"

# Frontend: Update API URL
VITE_API_URL="http://localhost:3000"

# Start postgres in container
docker-compose up postgres

# Start backend and frontend locally
cd backend && npm run dev
cd frontend && npm run dev
```

---

## Getting More Help

### Debugging Steps

1. **Isolate the problem**
   - Frontend, backend, or database?
   - One container or multiple?
   - Always running or sometimes?

2. **Check logs** (most important)
   ```bash
   docker-compose logs -f [service]
   docker-compose logs --tail=100 [service]
   ```

3. **Check connectivity**
   ```bash
   docker-compose exec [service] curl http://[other-service]:3000
   ```

4. **Check configuration**
   ```bash
   docker-compose exec [service] env | grep [VAR]
   docker-compose config  # View resolved docker-compose.yml
   ```

5. **Search error message**
   - Google the exact error
   - Check GitHub issues
   - See Package documentation

### Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [React Documentation](https://react.dev/)

### Community Help

- Search GitHub Issues in repository
- Check Stack Overflow (tag relevant technology)
- Ask in community forums
- Open new issue with:
  - Error message (exact text)
  - Steps to reproduce
  - Relevant logs
  - Environment info (OS, versions)

---

Common patterns that work:

```bash
# Start fresh
docker-compose down -v
docker-compose build
docker-compose up

# Wait for postgres
sleep 10

# Run migrations and seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed

# Verify everything
docker-compose exec backend curl http://localhost:3000/health
```

Good luck! 🚀
