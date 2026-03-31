#!/bin/bash

# ServiceFlow Production Deployment Script
# Usage: ./deploy.sh [environment]

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "prod" ] || [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    if [ ! -f .env.prod ]; then
        echo "❌ .env.prod file not found. Please copy .env.prod.example and configure your variables."
        exit 1
    fi
fi

echo "🚀 Deploying ServiceFlow in $ENVIRONMENT mode..."

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Build and start services
echo "🐳 Starting Docker services..."
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Run database migrations
echo "🗄️ Running database setup..."
docker-compose -f $COMPOSE_FILE exec -T backend npm run db:setup

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost:${FRONTEND_PORT:-5173}"
echo "🔧 Backend: http://localhost:${BACKEND_PORT:-3000}"