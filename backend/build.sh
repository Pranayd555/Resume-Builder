#!/bin/bash

# Optimized build script for Render deployments
set -e

echo "🚀 Starting optimized build for Render..."

# Set environment variables
export NODE_ENV=production
export NPM_CONFIG_NO_AUDIT=true
export NPM_CONFIG_PROGRESS=false

echo "📦 Installing dependencies..."

# Clean existing node_modules
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules
fi

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies with optimized settings
echo "🔄 Installing dependencies..."
npm install --only=production --no-audit --progress=false

# Verify installation
echo "✅ Verifying installation..."
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules directory not found!"
    exit 1
fi

# Check critical dependencies
if [ ! -d "node_modules/express" ]; then
    echo "❌ Express not found in node_modules!"
    exit 1
fi

# Create logs directory
mkdir -p logs

echo "📊 Build completed successfully!"
echo "📊 Node version: $(node -v)"
echo "📊 Build size: $(du -sh . | cut -f1)" 