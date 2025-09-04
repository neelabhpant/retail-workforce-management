#!/bin/bash

echo "🔧 Setting up local development environment"
echo "==========================================="

# Check Python version
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "Python version: $python_version"

# Check Node.js version
node_version=$(node --version 2>&1)
echo "Node.js version: $node_version"

# Backend setup
echo ""
echo "📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup complete"

# Frontend setup
echo ""
echo "🎨 Setting up frontend..."
cd ../frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete"

# Back to root directory
cd ..

echo ""
echo "🎉 Development environment ready!"
echo "================================="
echo ""
echo "To start development servers:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend"  
echo "  npm start"
echo ""
echo "Then visit: http://localhost:3000"