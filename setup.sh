#!/bin/bash

# HEMA NEWS AGENCY - Quick Start Script
# This script automates the setup process

echo "╔═══════════════════════════════════════════╗"
echo "║  HEMA NEWS AGENCY - Backend Setup         ║"
echo "║  Newspaper Distribution Management System ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Navigate to backend directory
cd "$(dirname "$0")/backend" 2>/dev/null || {
    echo "❌ Could not find backend directory"
    exit 1
}

echo "📁 Working directory: $(pwd)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Edit .env file with your configuration:"
        echo "   - JWT_SECRET: Generate a random 32-character string"
        echo "   - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (optional for Google Drive)"
        echo ""
    else
        echo "❌ .env.example not found"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Create data directory
if [ ! -d data ]; then
    echo "📂 Creating data directory..."
    mkdir -p data
    echo "✅ Data directory created"
fi

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║         Setup Complete! ✅                ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Environment Variables:"
echo "   Edit: .env"
echo "   Set: JWT_SECRET=your_random_32_char_secret"
echo ""
echo "2. Start the Server:"
echo "   npm run dev        (Development with auto-reload)"
echo "   npm start          (Production mode)"
echo ""
echo "3. Verify Server is Running:"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "4. Update Frontend:"
echo "   Set REACT_APP_API_URL=http://localhost:5000/api"
echo ""
echo "5. Create Admin User:"
echo "   See: SETUP_AND_DEPLOYMENT.md"
echo ""
echo "📚 Documentation:"
echo "   - README.md (API documentation)"
echo "   - SETUP_AND_DEPLOYMENT.md (Complete setup guide)"
echo ""
echo "🚀 Get started with:"
echo "   npm run dev"
echo ""
