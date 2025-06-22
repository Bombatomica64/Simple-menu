#!/bin/bash

# Simple Menu Frontend Start Script
echo "🚀 Starting Simple Menu Frontend..."

# Set Node.js memory options for Docker
export NODE_OPTIONS="--max_old_space_size=4096"

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

# Skip separate build step - ng serve will build automatically
echo "🌐 Starting development server (builds automatically)..."
echo "💡 Using dynamic environment for LAN compatibility..."

# Start the development server with dynamic environment (builds on the fly)
ng serve --host 0.0.0.0 --port 4200 --configuration=development &
