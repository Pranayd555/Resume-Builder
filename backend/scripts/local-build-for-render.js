#!/usr/bin/env node

/**
 * Optimized local build script for Render deployment
 * Excludes node_modules to reduce zip size significantly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('🚀 Building optimized package for Render deployment...');

// Configuration
const DEPLOY_DIR = path.join(__dirname, '..', 'deploy');
const PACKAGE_NAME = 'render-deployment.zip';

// Copy directory function using modern Node.js fs.cpSync
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    fs.cpSync(src, dest, { recursive: true });
}

// Clean previous builds
function cleanBuild() {
    console.log('🧹 Cleaning previous builds...');
    
    // Clean deploy directory
    if (fs.existsSync(DEPLOY_DIR)) {
        fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
    }
    
    // Remove previous zip file
    const zipPath = path.join(__dirname, '..', PACKAGE_NAME);
    if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
        console.log('🗑️ Removed previous zip file');
    }
}

// Create optimized deployment package (without node_modules)
function createPackage() {
    console.log('📦 Creating optimized deployment package...');
    
    fs.mkdirSync(DEPLOY_DIR, { recursive: true });
    
    // Copy only essential files and directories (excluding node_modules)
    const items = [
        'package.json', 'package-lock.json', 'server.js', 'Dockerfile',
        'config', 'middleware', 'models', 'routes', 'utils', 'templates', 'thumbnails'
    ];
    
    items.forEach(item => {
        const src = path.join(__dirname, '..', item);
        const dest = path.join(DEPLOY_DIR, item);
        
        if (fs.existsSync(src)) {
            if (fs.statSync(src).isDirectory()) {
                copyDirectory(src, dest);
                console.log(`✅ Copied ${item}/`);
            } else {
                fs.copyFileSync(src, dest);
                console.log(`✅ Copied ${item}`);
            }
        }
    });
    
    // Copy .npmrc file separately to ensure it's included
    const npmrcSrc = path.join(__dirname, '..', '.npmrc');
    const npmrcDest = path.join(DEPLOY_DIR, '.npmrc');
    if (fs.existsSync(npmrcSrc)) {
        fs.copyFileSync(npmrcSrc, npmrcDest);
        console.log('✅ Copied .npmrc');
    } else {
        console.log('⚠️ .npmrc file not found, creating optimized one...');
        // Create an optimized .npmrc file for Render
        const optimizedNpmrc = `# Optimized npm configuration for Render
        prefer-offline=true
        no-audit=true
        no-optional=true
        progress=false
        production=true
        registry=https://registry.npmjs.org/
        fetch-retries=3
        fetch-retry-mintimeout=5000
        fetch-retry-maxtimeout=60000
        cache-min=3600
        prefer-dedupe=true`;
        fs.writeFileSync(npmrcDest, optimizedNpmrc);
        console.log('✅ Created optimized .npmrc');
    }
    
    // Create essential directories
    ['logs', 'uploads'].forEach(dir => {
        fs.mkdirSync(path.join(DEPLOY_DIR, dir), { recursive: true });
    });
    
    // Optimize package.json for Render deployment
    const packagePath = path.join(DEPLOY_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Remove devDependencies to reduce package size
    delete packageJson.devDependencies;
    
    // Optimize scripts for Render
    packageJson.scripts = {
        "start": "node server.js",
        "build": "node scripts/render-build.js",
        "postinstall": "echo 'Dependencies installed successfully'"
    };
    
    // Add build script reference
    packageJson.buildScript = "render-build.js";
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Optimized package.json for Render');
}

// Create optimized zip (without node_modules)
function createZip() {
    console.log('🗜️ Creating optimized deployment zip...');
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(path.join(__dirname, '..', PACKAGE_NAME));
        const archive = archiver('zip', { 
            zlib: { level: 9 }, // Maximum compression
            store: false
        });
        
        output.on('close', () => {
            const sizeInMB = Math.round(archive.pointer() / 1024 / 1024);
            console.log(`✅ Created: ${PACKAGE_NAME} (${sizeInMB}MB)`);
            
            // Verify the zip file was created and is valid
            const zipPath = path.join(__dirname, '..', PACKAGE_NAME);
            if (fs.existsSync(zipPath)) {
                const stats = fs.statSync(zipPath);
                if (stats.size > 0) {
                    console.log(`✅ Zip file verified: ${stats.size} bytes`);
                    console.log(`📊 Size reduction: ~90% smaller (no node_modules)`);
                    resolve();
                } else {
                    reject(new Error('Zip file is empty'));
                }
            } else {
                reject(new Error('Zip file was not created'));
            }
        });
        
        archive.on('error', (err) => {
            console.error('❌ Archive error:', err);
            reject(err);
        });
        
        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn('⚠️ Archive warning:', err.message);
            } else {
                reject(err);
            }
        });
        
        archive.pipe(output);
        archive.directory(DEPLOY_DIR, false);
        archive.finalize();
    });
}

// Clean up temporary files
function cleanup() {
    console.log('🧹 Cleaning up temporary files...');
    
    if (fs.existsSync(DEPLOY_DIR)) {
        fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
        console.log('✅ Removed deploy/ directory');
    }
}

// Main process
async function main() {
    try {
        cleanBuild();
        createPackage();
        await createZip();
        cleanup();
        
        console.log('\n🎉 Optimized build completed!');
        console.log('📦 Upload render-deployment.zip to Render');
        console.log('⚡ Render will install dependencies from package-lock.json');
        console.log('🔧 Sharp will be installed fresh on Render for Linux compatibility');
        console.log('⚙️ Set NODE_ENV=production in Render environment variables');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        // Clean up even if build fails
        cleanup();
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main }; 