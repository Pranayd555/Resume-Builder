#!/bin/bash

# Optimized build script for Render - Fast & Reliable
set -e

echo "🚀 Starting optimized build for Render..."

# Set environment variables for maximum performance
export NODE_ENV=production
export NPM_CONFIG_PREFER_OFFLINE=true
export NPM_CONFIG_NO_AUDIT=true
export NPM_CONFIG_NO_OPTIONAL=true
export NPM_CONFIG_PROGRESS=false
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

echo "📦 Installing production dependencies..."

# Clean existing node_modules only if it exists
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules
fi

# Install only production dependencies (much faster)
echo "🔄 Installing dependencies with optimizations..."
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
echo "📊 npm version: $(npm -v)"
echo "📊 Build size: $(du -sh . | cut -f1)"
echo "📊 Dependencies installed: $(ls node_modules | wc -l)" 