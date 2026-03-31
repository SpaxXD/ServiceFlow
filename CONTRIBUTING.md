# Contributing to ServiceFlow

Guidelines for extending and improving ServiceFlow.

## Project Philosophy

ServiceFlow follows **Clean Architecture** principles:
- **Domain Layer**: Pure business logic, no framework dependencies
- **Application Layer**: Use cases orchestrating domain logic
- **Infrastructure Layer**: Technical implementations (database, auth)
- **Presentation Layer**: HTTP handling and routing
- **Shared Layer**: Utilities and error handling

**Golden Rule**: Dependencies flow inward. Lower layers never depend on higher layers.

## Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/your-org/serviceflow.git
cd serviceflow

# Setup backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev          # Run migrations
npx prisma db seed              # Seed test data
npm run dev                      # Start dev server

# In another terminal, setup frontend
cd frontend
npm install
cp .env.example .env
npm run dev                      # Start dev server
```

Access frontend at: `http://localhost:5173`

Test credentials:
- Email: `admin@serviceflow.com`
- Password: `admin123`

## Adding a New Feature

### Example: Add "Tags" to Services

#### 1. Update Domain Layer

**Step 1a**: Update Service entity

Edit `backend/src/domain/entities/Service.ts`:

```typescript
export interface Service {
  id: string;
  clientId: string;
  title: string;
  description: string;
  value: number;
  status: ServiceStatus;
  tags: string[];              // ← NEW FIELD
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceEntity implements Service {
  // ... existing fields ...
  tags: string[];

  constructor(data: Service) {
    // ... existing code ...
    this.tags = data.tags || [];
  }

  // Add domain logic methods
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }
}
```

#### 1b: Update Repository Interface

Edit `backend/src/domain/repositories/IServiceRepository.ts`:

```typescript
export interface IServiceRepository {
  // ... existing methods ...
  findByTag(tag: string, page: number, pageSize: number): Promise<PaginatedResult<Service>>;
}
```

#### 2. Update Database Layer

**Step 2a**: Update Prisma schema

Edit `backend/prisma/schema.prisma`:

```prisma
model Service {
  id          String    @id @default(uuid())
  clientId    String
  client      Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  title       String
  description String?
  value       Float
  status      String    @default("pending")
  tags        String[]  @default([])              // ← NEW FIELD
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  auditLogs   AuditLog[]

  @@index([clientId])
  @@index([status])
}
```

**Step 2b**: Run migration

```bash
npx prisma migrate dev --name add_service_tags
```

**Step 2c**: Update Repository Implementation

Edit `backend/src/infra/repositories/ServiceRepository.ts`:

```typescript
export class ServiceRepository implements IServiceRepository {
  // ... existing methods ...

  async findByTag(tag: string, page: number, pageSize: number): Promise<PaginatedResult<Service>> {
    const skip = (page - 1) * pageSize;
    
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: { tags: { has: tag } },
        skip,
        take: pageSize,
        include: { client: true },
      }),
      prisma.service.count({ where: { tags: { has: tag } } }),
    ]);

    return {
      data: services,
      total,
      page,
      pageSize,
    };
  }
}
```

#### 3. Update Application Layer

**Step 3a**: Update DTO

Edit `backend/src/application/dtos/ServiceDTO.ts`:

```typescript
export interface CreateServiceDTO {
  clientId: string;
  title: string;
  description?: string;
  value: number;
  tags?: string[];              // ← NEW FIELD
}

export interface ServiceResponseDTO {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  value: number;
  status: string;
  tags: string[];              // ← NEW FIELD
  createdAt: string;
  updatedAt: string;
}
```

**Step 3b**: Update Use Case

Edit `backend/src/application/use-cases/ServiceUseCase.ts`:

```typescript
export class ServiceUseCase {
  async create(dto: CreateServiceDTO, userId: string): Promise<ServiceResponseDTO> {
    // ... existing validation ...

    // NEW: Validate tags (max 5, no duplicates)
    if (dto.tags && dto.tags.length > 5) {
      throw new ValidationError('Maximum 5 tags allowed');
    }
    
    const uniqueTags = [...new Set(dto.tags?.map(t => t.toLowerCase()) || [])];

    const service = await this.serviceRepository.create({
      ...dto,
      tags: uniqueTags,
    });

    // ... existing audit logging ...

    return this.mapToDTO(service);
  }

  async addTag(serviceId: string, tag: string): Promise<ServiceResponseDTO> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) throw new NotFoundError('Service not found');

    service.addTag(tag.toLowerCase());
    const updated = await this.serviceRepository.update(service);

    // Log the change
    await this.auditLogRepository.create({
      userId,
      entityType: 'Service',
      entityId: serviceId,
      action: 'UPDATE',
      oldValues: { tags: service.tags },
      newValues: { tags: service.tags },
    });

    return this.mapToDTO(updated);
  }
}
```

#### 4. Update Presentation Layer

**Step 4a**: Update Controller

Edit `backend/src/presentation/controllers/ServiceController.ts`:

```typescript
export class ServiceController {
  // ... existing methods ...

  async addTag(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const { tag } = request.body as { tag: string };
    
    const service = await this.serviceUseCase.addTag(id, tag);
    reply.status(200).send(service);
  }
}
```

**Step 4b**: Update Routes

Edit `backend/src/presentation/routes/serviceRoutes.ts`:

```typescript
export async function serviceRoutes(fastify: FastifyInstance) {
  // ... existing routes ...

  // NEW: Add tag to service
  fastify.post<{ Params: { id: string } }>(
    '/api/services/:id/tags',
    { onRequest: [authMiddleware] },
    (request, reply) => serviceController.addTag(request, reply),
  );

  // NEW: Remove tag from service
  fastify.delete<{ Params: { id: string; tag: string } }>(
    '/api/services/:id/tags/:tag',
    { onRequest: [authMiddleware] },
    (request, reply) => serviceController.removeTag(request, reply),
  );

  // NEW: Find services by tag
  fastify.get<{ Querystring: { tag: string; page: string; pageSize: string } }>(
    '/api/services/search/by-tag',
    { onRequest: [authMiddleware] },
    (request, reply) => serviceController.findByTag(request, reply),
  );
}
```

#### 5. Update Frontend

**Step 5a**: Update Types

Edit `frontend/src/types/index.ts`:

```typescript
export interface Service {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  value: number;
  status: 'pending' | 'in_progress' | 'completed';
  tags: string[];              // ← NEW FIELD
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string };
}
```

**Step 5b**: Update API Service

Edit `frontend/src/services/api.ts`:

```typescript
const serviceService = {
  // ... existing methods ...

  async addTag(serviceId: string, tag: string): Promise<AxiosResponse<ServiceResponseDTO>> {
    return client.post(`/services/${serviceId}/tags`, { tag });
  },

  async removeTag(serviceId: string, tag: string): Promise<AxiosResponse<void>> {
    return client.delete(`/services/${serviceId}/tags/${tag}`);
  },

  async findByTag(tag: string, page = 1, pageSize = 10): Promise<AxiosResponse<PaginatedResponse<ServiceResponseDTO>>> {
    return client.get('/services/search/by-tag', {
      params: { tag, page, pageSize },
    });
  },
};
```

**Step 5c**: Update Hook

Edit `frontend/src/hooks/useServices.ts`:

```typescript
export function useServices(page = 1, pageSize = 10, status?: string, search?: string) {
  // ... existing query ...

  const addTagMutation = useMutation({
    mutationFn: ({ serviceId, tag }: { serviceId: string; tag: string }) =>
      serviceService.addTag(serviceId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return { 
    // ... existing ...
    addTagMutation,
  };
}
```

**Step 5d**: Update Component

Edit `frontend/src/pages/ServicesPage.tsx`:

```typescript
function ServicesPage() {
  // ... existing code ...

  const { addTagMutation } = useServices();

  const handleAddTag = async (serviceId: string, tag: string) => {
    await addTagMutation.mutateAsync({ serviceId, tag });
  };

  return (
    <div>
      {/* ... existing table ... */}
      {service.tags && service.tags.length > 0 && (
        <div className="flex gap-2 mt-2">
          {service.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 6. Add Tests

**Step 6a**: Add Use Case Test

Create `backend/tests/unit/ServiceUseCase-tags.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { ServiceUseCase } from '../../src/application/use-cases/ServiceUseCase';

describe('ServiceUseCase - Tags', () => {
  it('should add tag to service', async () => {
    // Mock repositories
    const useCase = new ServiceUseCase(mockServiceRepository, mockAuditLogRepository);
    
    const result = await useCase.addTag('service-1', 'vip');
    
    expect(result.tags).toContain('vip');
  });

  it('should not add duplicate tags', async () => {
    // Test logic
  });

  it('should enforce maximum 5 tags', async () => {
    // Test logic
  });
});
```

**Step 6b**: Add Frontend Component Test

Create `frontend/tests/ServiceTags.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { ServiceTags } from '../src/components/ServiceTags';

describe('ServiceTags Component', () => {
  it('should render all tags', () => {
    render(<ServiceTags tags={['vip', 'urgent', 'redesign']} />);
    
    expect(screen.getByText('vip')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });
});
```

#### 7. Update Documentation

Add to `API.md`:

```markdown
### Add Tag to Service

**Endpoint:** `POST /api/services/:id/tags`

**Request Body:**
```json
{
  "tag": "urgent"
}
```

**Response:** 200 OK with updated Service
```

## Code Style & Conventions

### Backend Rules

1. **Entity Methods**: Place business logic in domain entities
   ```typescript
   // ✅ Good: Logic in entity
   service.addTag(tag);
   service.hasTag('urgent');

   // ❌ Bad: Logic in controller
   controller.addTag = () => {
     const tags = [...service.tags, tag];
   }
   ```

2. **Error Handling**: Use custom errors from `shared/errors/`
   ```typescript
   // ✅ Good
   if (service.tags.length >= 5)
     throw new ValidationError('Maximum 5 tags');

   // ❌ Bad
   if (service.tags.length >= 5)
     throw new Error('Max tags');
   ```

3. **Repository Pattern**: Access data via repositories only
   ```typescript
   // ✅ Good
   const service = await repository.findById(id);

   // ❌ Bad
   const service = await prisma.service.findUnique({ where: { id } });
   ```

4. **DTOs**: All API inputs/outputs use DTOs
   ```typescript
   // ✅ Good
   async create(dto: CreateServiceDTO): Promise<ServiceResponseDTO>

   // ❌ Bad
   async create(service: Service): Promise<Service>
   ```

### Frontend Rules

1. **Custom Hooks**: Extract component logic into hooks
   ```typescript
   // ✅ Good
   const { data, loading } = useServices();

   // ❌ Bad
   const Component = () => {
     const [services, setServices] = useState([]);
     useEffect(() => { fetch... }, []);
   };
   ```

2. **Type Safety**: Always use proper TypeScript types
   ```typescript
   // ✅ Good
   interface Props { services: Service[] }
   const Component: React.FC<Props> = ({ services }) => ...

   // ❌ Bad
   const Component = ({ services }) => ...
   ```

3. **Separation of Concerns**: Forms, pages, hooks, services are separate
   ```
   ✅ ServiceForm.tsx (just form)
      → ServicePage.tsx (page layout)
      → useServices.ts (data fetching)
      → api.ts (HTTP calls)

   ❌ ServicePage.tsx (everything mixed)
   ```

## Running Tests

```bash
# Backend tests
cd backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Frontend tests
cd frontend
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## Database Migrations

When you modify `prisma/schema.prisma`:

```bash
# Create a migration
npx prisma migrate dev --name add_service_tags

# Review SQL
cat prisma/migrations/[timestamp]_add_service_tags/migration.sql

# In production, run without --dev flag
npx prisma migrate deploy

# Reset database (DEV ONLY)
npx prisma migrate reset
```

## Commit Message Conventions

Follow conventional commits:

```
feat: add service tags functionality
fix: prevent duplicate tags in service
docs: update API documentation
test: add tests for service tags
refactor: simplify tag validation logic
ci: improve test coverage
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feat/service-tags`
2. Make changes following code style
3. Add tests for new functionality
4. Update documentation
5. Run lint and tests: `npm run lint && npm test`
6. Commit with conventional messages
7. Push and create pull request
8. Main branch requires:
   - ✅ All tests passing
   - ✅ Code review approval
   - ✅ Documentation updated

## Debugging

### Backend Debugging

```bash
# Add debugger breakpoint
debugger;

# Run with inspection
node --inspect-brk dist/server.js

# Chrome: chrome://inspect
```

### Frontend Debugging

```bash
# React DevTools extension
# Browser DevTools (F12)

# Console logs are preserved with HMR
console.log('debug:', value);

# Use React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
<ReactQueryDevtools initialIsOpen={false} />
```

### Database Debugging

```bash
# Open Prisma Studio
npx prisma studio

# View generated SQL
// In code:
prisma.$queryRaw`SELECT * FROM "Service" WHERE tags @> '{urgent}'`
```

## Common Tasks

### Add a New Entity

1. Create entity in `domain/entities/[Entity].ts`
2. Create interface in `domain/repositories/I[Entity]Repository.ts`
3. Add model to `prisma/schema.prisma`
4. Create migration: `npx prisma migrate dev`
5. Create repository in `infra/repositories/[Entity]Repository.ts`
6. Create DTO in `application/dtos/[Entity]DTO.ts`
7. Create use case in `application/use-cases/[Entity]UseCase.ts`
8. Create controller in `presentation/controllers/[Entity]Controller.ts`
9. Create routes in `presentation/routes/[entity]Routes.ts`
10. Register routes in `presentation/routes/index.ts`
11. Add frontend types in `frontend/src/types/index.ts`
12. Create frontend hook in `frontend/src/hooks/use[Entity]s.ts`
13. Create frontend service methods in `frontend/src/services/api.ts`
14. Create pages/components as needed

### Add a New API Endpoint

1. Add DTO if needed (new input/output type)
2. Add method to repository if needed
3. Add method to use case (business logic)
4. Add method to controller (HTTP handling)
5. Add route definition in routes file
6. Add test for use case
7. Update frontend API service
8. Update frontend hook
9. Update API documentation

### Modify Database

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name [description]`
3. Update entity type if needed
4. Update repository queries
5. Update DTO fields
6. Update API documentation
7. Update frontend types
8. Update frontend forms/pages

## Performance Considerations

### Backend Optimization

- Add database indexes for frequently queried fields
- Use pagination to limit result sets
- Implement result caching with Redis (optional)
- Monitor slow queries with `slowQueryLog` in Prisma
- Use connection pooling for database

### Frontend Optimization

- React Query caches queries automatically
- Use `staleTime` and `cacheTime` appropriately
- Implement infinite scroll for large lists
- Lazy-load images with `<img loading="lazy">`
- Code split pages with dynamic imports

## Security Checklist

Before adding features:

- [ ] All endpoints authenticated
- [ ] Row-level security (users see only their data)
- [ ] Input validation (DTOs + Zod)
- [ ] Output encoding (prevent XSS)
- [ ] SQL injection prevention (Prisma parameterized)
- [ ] CSRF protection (if cookies used)
- [ ] Rate limiting on sensitive endpoints
- [ ] Audit logs for data modifications
- [ ] No hardcoded secrets (use .env)
- [ ] Password hashing (bcryptjs, not plaintext)

## Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

## Getting Help

- Review existing code for patterns
- Check tests for usage examples
- Read ARCHITECTURE.md for design decisions
- Open issues for bugs or feature requests
- Discussions for questions

---

Thank you for contributing to ServiceFlow! 🚀
