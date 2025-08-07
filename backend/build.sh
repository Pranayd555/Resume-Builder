#!/bin/bash

# Render-optimized build script
set -e

echo "🚀 Starting optimized build for Render..."

# Set environment variables for faster builds
export NODE_ENV=production
export NPM_CONFIG_PREFER_OFFLINE=true
export NPM_CONFIG_NO_AUDIT=true
export NPM_CONFIG_NO_OPTIONAL=true
export NPM_CONFIG_PROGRESS=false

# Clean any existing node_modules
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules
fi

# Install dependencies with optimization
echo "📦 Installing dependencies..."
npm ci --only=production --prefer-offline --no-audit --no-optional --progress=false

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Create logs directory if it doesn't exist
mkdir -p logs

echo "✅ Build completed successfully!"
echo "📊 Build size: $(du -sh . | cut -f1)" 