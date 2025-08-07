#!/bin/bash

# Render-optimized build script
set -e

echo "🚀 Starting Render-optimized build..."

# Set environment variables for faster builds
export NODE_ENV=production
export NPM_CONFIG_PREFER_OFFLINE=true
export NPM_CONFIG_NO_AUDIT=true
export NPM_CONFIG_NO_OPTIONAL=true
export NPM_CONFIG_PROGRESS=false
export NPM_CONFIG_CACHE=/opt/render/.npm
export NPM_CONFIG_TIMEOUT=300000

# Create cache directory
mkdir -p /opt/render/.npm

echo "📦 Installing dependencies with optimization..."

# Clean any existing node_modules for fresh install
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules
fi

# Install dependencies with maximum optimization
npm ci --only=production \
    --prefer-offline \
    --no-audit \
    --no-optional \
    --progress=false \
    --cache=/opt/render/.npm \
    --timeout=300000

# Clean npm cache to reduce build size
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Create logs directory
mkdir -p logs

# Verify installation
echo "✅ Verifying installation..."
node -e "console.log('Node.js version:', process.version)"
npm list --depth=0 --only=production | head -10

echo "📊 Build size: $(du -sh . | cut -f1)"
echo "✅ Render build completed successfully!" 