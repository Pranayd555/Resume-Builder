#!/usr/bin/env node

/**
 * Simplified local build script for Render deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('🚀 Building for Render deployment...');

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

// Clean and install
async function build() {
    console.log('🧹 Cleaning previous builds...');
    
    // Clean deploy directory
    if (fs.existsSync(DEPLOY_DIR)) {
        fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
    }
    
    console.log('📦 Installing dependencies...');
    
    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.NPM_CONFIG_PREFER_OFFLINE = 'true';
    process.env.NPM_CONFIG_NO_AUDIT = 'true';
    process.env.NPM_CONFIG_NO_OPTIONAL = 'true';
    
    try {
        execSync('npm install --only=production --no-audit --progress=false', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 300000
        });
    } catch (error) {
        console.log('⚠️ Production install failed, trying full install...');
        execSync('npm install --no-audit --progress=false', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 300000
        });
    }
}

// Create deployment package
function createPackage() {
    console.log('📦 Creating deployment package...');
    
    fs.mkdirSync(DEPLOY_DIR, { recursive: true });
    
    // Copy essential files and directories
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
        console.log('⚠️ .npmrc file not found, creating default one...');
        // Create a default .npmrc file
        const defaultNpmrc = `# Optimized npm configuration for Render
prefer-offline=true
no-audit=true
no-optional=true
progress=false
production=true
registry=https://registry.npmjs.org/
fetch-retries=3
fetch-retry-mintimeout=5000
fetch-retry-maxtimeout=60000`;
        fs.writeFileSync(npmrcDest, defaultNpmrc);
        console.log('✅ Created default .npmrc');
    }
    
    // Copy node_modules
    const nodeModulesSrc = path.join(__dirname, '..', 'node_modules');
    const nodeModulesDest = path.join(DEPLOY_DIR, 'node_modules');
    if (fs.existsSync(nodeModulesSrc)) {
        copyDirectory(nodeModulesSrc, nodeModulesDest);
        console.log('✅ Copied node_modules/');
        
        // Remove sharp module from deployment package (will be installed fresh on Render)
        const sharpPath = path.join(nodeModulesDest, 'sharp');
        if (fs.existsSync(sharpPath)) {
            fs.rmSync(sharpPath, { recursive: true, force: true });
            console.log('🗑️ Removed sharp module (will be installed fresh on Render)');
        }
    }
    
    // Create directories
    ['logs', 'uploads'].forEach(dir => {
        fs.mkdirSync(path.join(DEPLOY_DIR, dir), { recursive: true });
    });
    
    // Optimize package.json
    const packagePath = path.join(DEPLOY_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    delete packageJson.devDependencies;
    packageJson.scripts = {
        "start": "node server.js",
        "build": "echo 'Pre-built locally'"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}

// Create zip
function createZip() {
    console.log('🗜️ Creating deployment zip...');
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(path.join(__dirname, '..', PACKAGE_NAME));
        const archive = archiver('zip', { 
            zlib: { level: 9 },
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
        await build();
        createPackage();
        await createZip();
        cleanup();
        
        console.log('\n🎉 Build completed!');
        console.log('📦 Upload render-deployment.zip to Render');
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