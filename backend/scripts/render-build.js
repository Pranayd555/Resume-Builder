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
    
    // Handle platform-specific dependencies for Linux deployment
    console.log('🔧 Handling platform-specific dependencies...');
    try {
        // First, remove the existing sharp module completely
        console.log('🗑️ Removing existing sharp module...');
        const sharpPath = path.join(__dirname, '..', 'node_modules', 'sharp');
        if (fs.existsSync(sharpPath)) {
            fs.rmSync(sharpPath, { recursive: true, force: true });
            console.log('✅ Removed existing sharp module');
        }
        
        // Install sharp fresh for Linux
        console.log('📦 Installing sharp for Linux...');
        execSync('npm install sharp@latest --platform=linux --arch=x64 --no-save', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 120000
        });
        console.log('✅ Sharp installed for Linux successfully');
        
    } catch (error) {
        console.log('⚠️ Sharp installation failed, trying alternative approach...');
        try {
            // Try with optional dependencies
            execSync('npm install sharp@latest --include=optional --no-save', {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..'),
                timeout: 120000
            });
            console.log('✅ Sharp installed with optional dependencies');
        } catch (installError) {
            console.log('⚠️ Sharp installation failed, trying rebuild...');
            try {
                execSync('npm rebuild sharp --platform=linux --arch=x64', {
                    stdio: 'inherit',
                    cwd: path.join(__dirname, '..'),
                    timeout: 120000
                });
                console.log('✅ Sharp rebuilt successfully');
            } catch (rebuildError) {
                console.log('❌ All sharp installation attempts failed');
                console.log('📋 Sharp may not work correctly on this platform');
            }
        }
    }
    
    // Ensure Chromium is available for Puppeteer at runtime on Render
    console.log('🌐 Ensuring Chromium is installed for Puppeteer...');
    try {
        // Allow Puppeteer to download Chromium even if env was set during local build
        const cleanEnv = { ...process.env };
        delete cleanEnv.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD;

        // Use Puppeteer's browsers installer (v21+) to fetch a Linux Chrome binary
        execSync('npx --yes puppeteer@21.5.2 browsers install chrome', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 600000,
            env: cleanEnv
        });
        console.log('✅ Chromium installed via Puppeteer');
    } catch (chromeInstallError) {
        console.log('⚠️ Puppeteer-managed Chromium install failed:', chromeInstallError.message);
        console.log('🔄 Trying to install system chromium via apt-get (if available)...');
        try {
            execSync('apt-get update && apt-get install -y chromium-browser || apt-get install -y chromium', {
                stdio: 'inherit',
                timeout: 600000
            });
            console.log('✅ System chromium installed');
        } catch (aptError) {
            console.log('❌ Could not install Chromium via apt. Puppeteer may fail to launch if no browser is present.');
        }
    }
    
    console.log('🚀 Ready to start application');
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    console.error('📋 Full error details:', error);
    process.exit(1);
} 