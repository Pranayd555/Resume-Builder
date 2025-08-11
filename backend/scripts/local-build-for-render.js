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
    process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
    
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
        'package.json', 'package-lock.json', 'server.js', 'Dockerfile', '.npmrc',
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
    
    // Copy node_modules
    const nodeModulesSrc = path.join(__dirname, '..', 'node_modules');
    const nodeModulesDest = path.join(DEPLOY_DIR, 'node_modules');
    if (fs.existsSync(nodeModulesSrc)) {
        copyDirectory(nodeModulesSrc, nodeModulesDest);
        console.log('✅ Copied node_modules/');
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
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            const sizeInMB = Math.round(archive.pointer() / 1024 / 1024);
            console.log(`✅ Created: ${PACKAGE_NAME} (${sizeInMB}MB)`);
            resolve();
        });
        
        archive.on('error', reject);
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