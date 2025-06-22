#!/bin/bash

# Simple Menu Frontend Start Script
echo "🚀 Starting Simple Menu Frontend..."

# Set Node.js memory options for Docker
export NODE_OPTIONS="--max_old_space_size=2048"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --legacy-peer-deps
fi

# Check if Angular CLI is available
if ! command -v ng &> /dev/null; then
    echo "📦 Installing Angular CLI..."
    npm install -g @angular/cli
fi
# Build the application using dynamic environment (LAN compatible)
echo "🔨 Building application with dynamic environment..."
ng build --configuration=development --verbose

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Starting development server..."

    # Start the development server with dynamic environment (LAN compatible)
    ng serve --host 0.0.0.0 --port 4200 --disable-host-check --configuration=development
else
    echo "❌ Build failed!"
    echo "💡 Checking system resources..."
    free -h 2>/dev/null || echo "Memory info not available"
    exit 1
fi
