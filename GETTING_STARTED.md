# ServiceFlow - Complete SaaS Application

A production-ready SaaS platform for managing clients and services. Built with clean architecture, modern tech stack, and enterprise-grade security.

## 🚀 Quick Start (Docker Recommended)

### Requirements
- Docker & Docker Compose
- Or: Node.js 18+, PostgreSQL 15+

### Start Application

```bash
# Clone/navigate to project
cd ServiceFlow

# On Linux/Mac
chmod +x setup.sh
./setup.sh

# On Windows (PowerShell)
# Or manually run docker-compose up -d
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

### Test Accounts
```
Admin:     admin@serviceflow.com / admin123
Manager:   manager@serviceflow.com / manager123
User:      user@serviceflow.com / user123
```

## 📚 Documentation

### Setup & Deployment
- [README.md](./README.md) - Complete project documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Clean Architecture details
- [backend/README.md](./backend/README.md) - Backend specific guide
- [frontend/README.md](./frontend/README.md) - Frontend specific guide

### File Structure
```
ServiceFlow/
├── backend/                      # Node.js + Fastify backend
│   ├── src/
│   │   ├── domain/              # Business logic & entities
│   │   ├── application/         # Use cases
│   │   ├── infra/               # Repositories & services
│   │   ├── presentation/        # Controllers & routes
│   │   ├── shared/              # Utilities & errors
│   │   └── server.ts
│   ├── tests/                   # Unit & integration tests
│   ├── prisma/                  # Database schema
│   ├── scripts/                 # Seed script
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/               # Page components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API client
│   │   ├── types/               # TypeScript types
│   │   ├── forms/               # Form components
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tests/                   # Component tests
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docker-compose.yml            # Full stack setup
├── setup.sh                       # Quick start script
├── README.md                      # This file
├── ARCHITECTURE.md               # Architecture guide
└── .gitignore
```

## 🏗 Architecture Highlights

### Clean Architecture
- **Domain Layer**: Pure business logic, no framework dependencies
- **Application Layer**: Use cases, orchestration of domain logic
- **Infrastructure Layer**: Repositories, database, services
- **Presentation Layer**: HTTP controllers, routes, middlewares
- **Shared Layer**: Errors, utilities

### Key Features
✅ JWT authentication (15min access + 7day refresh tokens)  
✅ Role-based access control (Admin, Manager, User)  
✅ Complete audit logging  
✅ Server-side pagination  
✅ Advanced filtering & search  
✅ Dashboard with real-time metrics  
✅ Comprehensive error handling  
✅ TypeScript strict mode  
✅ Production-ready security  

## 📦 Tech Stack

### Backend
```
Node.js + Express Framework    Fastify (Fast & minimal)
Language                       TypeScript
Database                       PostgreSQL
ORM                           Prisma
Authentication                JWT + Refresh Tokens
Validation                    Zod
Testing                       Vitest
Architecture                  Clean Architecture
```

### Frontend
```
Framework                      React 18
Build Tool                     Vite
Language                       TypeScript
State Management               TanStack Query + Hooks
Forms                          React Hook Form + Zod
Styling                        TailwindCSS
Routing                        React Router v6
Testing                        Vitest + Testing Library
```

### DevOps
```
Containerization              Docker & Docker Compose
Database                      PostgreSQL 15
Environment Variables         .env files
```

## 🔐 Security Features

- ✅ Bcryptjs password hashing
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ Role-based access control
- ✅ SQL injection prevention (Prisma)
- ✅ Secure error messages
- ✅ Audit logging
- ✅ CORS headers
- ✅ Environment variable protection

## 📊 Database Schema

### Tables
- **users**: Authentication & roles
- **clients**: Client management
- **services**: Services with status & value tracking
- **audit_logs**: Full operation tracking
- **refresh_tokens**: Token management

## 🧪 Testing

### Backend
```bash
cd backend
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### Frontend
```bash
cd frontend
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 🚀 Development

### Backend Development
```bash
cd backend
npm install
npm run dev          # Runs on http://localhost:3000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev          # Runs on http://localhost:5173
```

### Database Management
```bash
cd backend

# Create migration
npm run db:migrate

# Seed data
npm run db:seed

# View database (Prisma Studio)
npx prisma studio
```

## 📈 Deployment

### Production Environment Variables

**Backend (.env)**
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env)**
```
VITE_API_URL=https://api.yourdomain.com
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Run services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Deployment Checklist
- [ ] Change JWT_SECRET
- [ ] Configure PostgreSQL with backups
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for production domain
- [ ] Run database migrations
- [ ] Set up monitoring/logging
- [ ] Configure health checks
- [ ] Load test the API
- [ ] Set up auto-scaling (optional)

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout user

### Clients
- `GET /clients` - List clients
- `GET /clients/:id` - Get client
- `POST /clients` - Create client (Admin/Manager)
- `PUT /clients/:id` - Update client (Admin/Manager)
- `DELETE /clients/:id` - Delete client (Admin only)

### Services
- `GET /services` - List services
- `GET /services/:id` - Get service
- `POST /services` - Create service (Admin/Manager)
- `PUT /services/:id` - Update service (Admin/Manager)
- `DELETE /services/:id` - Delete service (Admin only)
- `GET /services/dashboard/metrics` - Dashboard metrics

## 📖 Usage Examples

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Client (with token)
```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com"
  }'
```

## 🐛 Troubleshooting

### Docker Issues
```bash
# Remove old containers
docker-compose down -v

# Rebuild
docker-compose build --no-cache

# Start
docker-compose up -d
```

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database exists

### Port Conflicts
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

### TypeScript Errors
```bash
# Regenerate types
cd backend
npx prisma generate

cd ../frontend
npm install
```

## 📝 Contributing

1. Follow Clean Architecture principles
2. Keep business logic in domain layer
3. Write tests for use cases
4. Use TypeScript strict mode
5. Follow Prettier formatting
6. Update documentation
7. Test before submitting

## 📄 Project Files

- [README.md](./README.md) - Full documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture guide
- [backend/README.md](./backend/README.md) - Backend guide
- [frontend/README.md](./frontend/README.md) - Frontend guide
- [docker-compose.yml](./docker-compose.yml) - Docker configuration
- [setup.sh](./setup.sh) - Quick start script

## 🎯 Next Steps

1. **Review Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Backend Setup**: Read [backend/README.md](./backend/README.md)
3. **Frontend Setup**: Read [frontend/README.md](./frontend/README.md)
4. **Run Tests**: `npm test` in both directories
5. **Start Developing**: `npm run dev` in both directories

## 📞 Support

For issues or questions:
1. Check the relevant README
2. Review ARCHITECTURE.md
3. Check error messages in logs
4. Check troubleshooting section

## 📜 License

MIT

---

**Built with production-grade best practices** ✨
