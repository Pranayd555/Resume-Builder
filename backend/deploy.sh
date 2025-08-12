#!/bin/bash

# Quick deployment script for Render
echo "🚀 Starting deployment to Render..."

# Build the deployment package
echo "📦 Building deployment package..."
npm run build:render

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Add and commit the zip file
echo "📝 Committing deployment package..."
git add render-deployment.zip
git commit -m "Deploy: $(date +%Y-%m-%d_%H-%M-%S)"

# Push to trigger Render deployment
echo "🚀 Pushing to Git to trigger Render deployment..."
git push origin main

echo "✅ Deployment triggered!"
echo "📊 Check Render dashboard for deployment status" 