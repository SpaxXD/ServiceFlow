#!/bin/bash
set -e

echo "🚀 ServiceFlow Setup"
echo "==================="

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
  echo "📝 Creating backend/.env..."
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env (update with your settings)"
fi

if [ ! -f frontend/.env ]; then
  echo "📝 Creating frontend/.env..."
  cp frontend/.env.example frontend/.env
  echo "✅ Created frontend/.env"
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker first."
  exit 1
fi

echo ""
echo "⬇️  Starting services with Docker Compose..."
echo ""

docker-compose up -d

echo ""
echo "✅ Services started!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:3000"
echo "🗄️  PostgreSQL: localhost:5432"
echo ""
echo "📖 Default Credentials:"
echo "   Admin: admin@serviceflow.com / admin123"
echo "   Manager: manager@serviceflow.com / manager123"
echo "   User: user@serviceflow.com / user123"
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"
