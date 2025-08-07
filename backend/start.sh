#!/bin/bash

# Optimized start script for Render
set -e

echo "🚀 Starting application on Render..."

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-5000}

# Create logs directory
mkdir -p logs

# Start the application
echo "📍 Starting server on port $PORT..."
exec node server.js 