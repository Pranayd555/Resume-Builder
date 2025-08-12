#!/bin/bash

# Simple deployment script for Render
# This script handles the deployment process more robustly

set -e  # Exit on any error

echo "🚀 Starting Render deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check if render-deployment.zip exists
if [ ! -f "render-deployment.zip" ]; then
    echo "📦 render-deployment.zip not found. Building deployment package..."
    npm run build:render
fi

# Verify the zip file
if [ ! -f "render-deployment.zip" ]; then
    echo "❌ Error: Failed to create render-deployment.zip"
    exit 1
fi

ZIP_SIZE=$(stat -c%s "render-deployment.zip" 2>/dev/null || stat -f%z "render-deployment.zip" 2>/dev/null || echo "unknown")
echo "✅ render-deployment.zip created: $ZIP_SIZE bytes"

# Remove any existing .npmrc to avoid conflicts
if [ -f ".npmrc" ]; then
    echo "🗑️ Removing existing .npmrc to avoid conflicts..."
    rm .npmrc
fi

# Extract the deployment package
echo "📦 Extracting deployment package..."
if command -v unzip >/dev/null 2>&1; then
    # Try with quiet mode first
    if unzip -o -q "render-deployment.zip" -d . 2>/dev/null; then
        echo "✅ Package extracted successfully (quiet mode)"
    else
        echo "🔄 Trying verbose extraction..."
        unzip -o "render-deployment.zip" -d .
        echo "✅ Package extracted successfully (verbose mode)"
    fi
else
    echo "❌ Error: unzip command not found"
    exit 1
fi

# Verify essential files
echo "🔍 Verifying essential files..."
ESSENTIAL_FILES=("package.json" "server.js")
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Essential file missing: $file"
        exit 1
    fi
    echo "✅ Found $file"
done

# Check for .npmrc
if [ -f ".npmrc" ]; then
    echo "✅ .npmrc file found"
else
    echo "⚠️ .npmrc file not found, creating default..."
    cat > .npmrc << EOF
# Optimized npm configuration for Render
prefer-offline=true
no-audit=true
no-optional=true
progress=false
production=true
registry=https://registry.npmjs.org/
fetch-retries=3
fetch-retry-mintimeout=5000
fetch-retry-maxtimeout=60000
EOF
fi

# Clean up the zip file
echo "🗑️ Cleaning up zip file..."
rm -f "render-deployment.zip"

echo "✅ Deployment package ready!"
echo "🚀 Application can now start..." 