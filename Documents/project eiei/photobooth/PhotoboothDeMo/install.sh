#!/bin/bash

echo "🔧 Installing Photobooth Demo..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "📋 Copying environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update your Omise API keys in .env file"
else
    echo "✅ .env file already exists"
fi

echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Update your Omise API keys in .env file"
echo "2. Run 'npm start' to start the server"
echo "3. Open http://localhost:3001 in your browser"
echo ""
echo "For development, use 'npm run dev' instead"