#!/bin/bash

echo "🚀 Starting Retail Workforce Management Demo"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env file exists in backend
if [ ! -f ./backend/.env ]; then
    echo "📝 Creating backend environment file..."
    cp ./backend/.env ./backend/.env.example 2>/dev/null || true
fi

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Display access information
echo ""
echo "🎉 Demo is ready!"
echo "=================================="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Demo Scenarios Available:"
echo "• Black Friday Preparation"
echo "• Employee Retention Intervention"  
echo "• Career Development Journey"
echo ""
echo "To stop the demo: docker-compose down"
echo "To view logs: docker-compose logs -f"