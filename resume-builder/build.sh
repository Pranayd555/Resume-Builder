#!/bin/bash

# Exit on any error
set -e

echo "=== Starting Vercel Build Process ==="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in current directory"
    exit 1
fi

echo "=== Installing Dependencies ==="
# Force clean install
rm -rf node_modules package-lock.json
npm ci --production=false

echo "=== Verifying react-scripts installation ==="
# Check if react-scripts is installed
if [ ! -f "node_modules/.bin/react-scripts" ]; then
    echo "Error: react-scripts not found in node_modules/.bin/"
    echo "Installing react-scripts explicitly..."
    npm install react-scripts@5.0.1
fi

echo "=== Building Application ==="
# Run the build
npm run build

echo "=== Build Completed Successfully ===" 