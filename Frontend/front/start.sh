#!/bin/bash

# Simple Menu Frontend Start Script
echo "🚀 Starting Simple Menu Frontend..."

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

# Build the application in development mode
echo "🔨 Building application..."
ng build --configuration=development

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Starting development server..."

    # Start the development server
    ng serve --host 0.0.0.0 --port 4200 --disable-host-check
else
    echo "❌ Build failed!"
    exit 1
fi
