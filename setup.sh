#!/bin/bash

echo "🍻 Qeqs - Setup Script"
echo "====================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first."
    exit 1
fi

echo "✓ PostgreSQL found"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✓ Node.js found ($(node --version))"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  .env file not found. Please copy .env.example to .env and configure it:"
    echo "   cp .env.example .env"
    echo ""
    echo "Then edit .env with your database credentials."
    exit 1
fi

echo "✓ .env file found"

# Try to create database (will fail if already exists, that's ok)
echo ""
echo "🗄️  Setting up database..."
createdb qeqs 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Database 'qeqs' created"
else
    echo "ℹ️  Database 'qeqs' already exists (this is fine)"
fi

# Run migrations
echo ""
echo "🔄 Running database migrations..."
npm run migrate --workspace=backend

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi

echo "✓ Migrations completed"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo ""

