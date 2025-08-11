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
    
    // Remove existing .npmrc if it exists to avoid conflicts
    const npmrcPath = path.join(__dirname, '..', '.npmrc');
    if (fs.existsSync(npmrcPath)) {
        fs.unlinkSync(npmrcPath);
        console.log('🗑️ Removed existing .npmrc to avoid conflicts');
    }
    
    // Extract the zip file with better error handling
    try {
        execSync(`unzip -o -q "${zipPath}" -d .`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 300000 // 5 minutes timeout
        });
    } catch (unzipError) {
        console.error('❌ Unzip failed:', unzipError.message);
        console.log('🔄 Trying alternative extraction method...');
        
        // Try with different unzip options
        execSync(`unzip -o "${zipPath}" -d .`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 300000
        });
    }
    
    console.log('✅ Deployment package extracted successfully');
    
    // Remove the zip file to save space
    try {
        fs.unlinkSync(zipPath);
        console.log('🗑️ Removed zip file to save space');
    } catch (error) {
        console.log('⚠️ Could not remove zip file:', error.message);
    }
    
    // Verify essential files exist
    const essentialFiles = ['package.json', 'server.js'];
    essentialFiles.forEach(file => {
        if (!fs.existsSync(path.join(__dirname, '..', file))) {
            throw new Error(`Essential file missing: ${file}`);
        }
    });
    
    // Verify .npmrc was extracted properly
    if (fs.existsSync(npmrcPath)) {
        console.log('✅ .npmrc file extracted successfully');
    } else {
        console.log('⚠️ .npmrc file not found in deployment package');
    }
    
    console.log('✅ Build verification completed');
    console.log('🚀 Ready to start application');
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    console.error('📋 Full error details:', error);
    process.exit(1);
} 