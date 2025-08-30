#!/usr/bin/env node

/**
 * Optimized Render build script - extracts deployment package and installs dependencies
 * Handles optimized packages without node_modules for faster deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Optimized Render build process starting...');

// Check if deployment zip exists
const zipPath = path.join(__dirname, '..', 'render-deployment.zip');

if (!fs.existsSync(zipPath)) {
    console.log('❌ render-deployment.zip not found!');
    console.log('📋 Please run: npm run build:render locally first');
    process.exit(1);
}

try {
    console.log('📦 Extracting optimized deployment package...');
    
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
    
    console.log('✅ Optimized deployment package extracted successfully');
    
    // Remove the zip file to save space
    try {
        fs.unlinkSync(zipPath);
        console.log('🗑️ Removed zip file to save space');
    } catch (error) {
        console.log('⚠️ Could not remove zip file:', error.message);
    }
    
    // Verify essential files exist
    const essentialFiles = ['package.json', 'package-lock.json', 'server.js'];
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
    
    // Install dependencies using package-lock.json for faster, deterministic installs
    console.log('📦 Installing dependencies from package-lock.json...');
    try {
        // Set environment variables for optimized npm install
        process.env.NODE_ENV = 'production';
        process.env.NPM_CONFIG_PREFER_OFFLINE = 'true';
        process.env.NPM_CONFIG_NO_AUDIT = 'true';
        process.env.NPM_CONFIG_NO_OPTIONAL = 'true';
        process.env.NPM_CONFIG_PROGRESS = 'false';
        
        // Install using package-lock.json for faster, deterministic installs
        execSync('npm ci --only=production --no-audit --progress=false', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 300000 // 5 minutes timeout
        });
        console.log('✅ Dependencies installed successfully using package-lock.json');
        
    } catch (installError) {
        console.log('⚠️ npm ci failed, trying npm install...');
        try {
            execSync('npm install --only=production --no-audit --progress=false', {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..'),
                timeout: 300000
            });
            console.log('✅ Dependencies installed successfully using npm install');
        } catch (fallbackError) {
            console.log('❌ Both npm ci and npm install failed');
            throw fallbackError;
        }
    }
    
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
    
    // Verify final installation
    console.log('🔍 Verifying installation...');
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
        const nodeModulesStats = fs.statSync(nodeModulesPath);
        console.log(`✅ node_modules created: ${nodeModulesStats.size} bytes`);
    } else {
        throw new Error('node_modules directory not found after installation');
    }
    
    console.log('🚀 Ready to start application');
    console.log('⚡ Optimized build completed successfully!');
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    console.error('📋 Full error details:', error);
    process.exit(1);
} 