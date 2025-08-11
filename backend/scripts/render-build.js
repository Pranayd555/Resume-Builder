#!/usr/bin/env node

/**
 * Render build script - extracts deployment package and sets up environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Render build process starting...');

// Check if deployment zip exists
const zipPath = path.join(__dirname, '..', 'render-deployment.zip');

if (!fs.existsSync(zipPath)) {
    console.log('❌ render-deployment.zip not found!');
    console.log('📋 Please run: npm run build:render locally first');
    process.exit(1);
}

try {
    console.log('📦 Extracting deployment package...');
    
    // Extract the zip file
    execSync(`unzip -q "${zipPath}" -d .`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });
    
    console.log('✅ Deployment package extracted successfully');
    
    // Remove the zip file to save space
    fs.unlinkSync(zipPath);
    console.log('🗑️ Removed zip file to save space');
    
    // Verify essential files exist
    const essentialFiles = ['package.json', 'server.js'];
    essentialFiles.forEach(file => {
        if (!fs.existsSync(path.join(__dirname, '..', file))) {
            throw new Error(`Essential file missing: ${file}`);
        }
    });
    
    console.log('✅ Build verification completed');
    console.log('🚀 Ready to start application');
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
} 