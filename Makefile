.PHONY: help install dev build test docker-up docker-down db-migrate db-seed clean

help:
	@echo "ServiceFlow - Development Commands"
	@echo "===================================="
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install all dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev-backend      Start backend development server"
	@echo "  make dev-frontend     Start frontend development server"
	@echo "  make dev              Start both servers (requires two terminals)"
	@echo ""
	@echo "Testing:"
	@echo "  make test-backend     Run backend tests"
	@echo "  make test-frontend    Run frontend tests"
	@echo "  make test             Run all tests"
	@echo ""
	@echo "Building:"
	@echo "  make build-backend    Build backend"
	@echo "  make build-frontend   Build frontend"
	@echo "  make build            Build both"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up        Start all services with Docker"
	@echo "  make docker-down      Stop Docker services"
	@echo "  make docker-logs      View Docker logs"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate       Run database migrations"
	@echo "  make db-seed          Seed database with test data"
	@echo "  make db-studio        Open Prisma Studio"
	@echo ""
	@echo "Utility:"
	@echo "  make clean            Remove build artifacts"
	@echo "  make lint             Lint all code"
	@echo ""

install:
	cd backend && npm install
	cd frontend && npm install

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

dev:
	@echo "Opening two terminals for development..."
	@echo "Start backend: cd backend && npm run dev"
	@echo "Start frontend: cd frontend && npm run dev"

build-backend:
	cd backend && npm run build

build-frontend:
	cd frontend && npm run build

build: build-backend build-frontend

test-backend:
	cd backend && npm test

test-frontend:
	cd frontend && npm test

test: test-backend test-frontend

docker-up:
	docker-compose up -d
	@echo "Services starting..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3000"

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

db-migrate:
	cd backend && npm run db:migrate

db-seed:
	cd backend && npm run db:seed

db-studio:
	cd backend && npx prisma studio

clean:
	rm -rf backend/dist
	rm -rf backend/node_modules
	rm -rf frontend/dist
	rm -rf frontend/node_modules
	rm -rf backend/.next
	rm -rf frontend/.next

lint:
	cd backend && npm run lint 2>/dev/null || echo "Linting not configured"
	cd frontend && npm run lint 2>/dev/null || echo "Linting not configured"
