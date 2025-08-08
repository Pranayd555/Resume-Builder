#!/usr/bin/env node

/**
 * Cross-platform build script for Render and local development
 * Works on both Windows and Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting cross-platform build...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.NPM_CONFIG_PREFER_OFFLINE = 'true';
process.env.NPM_CONFIG_NO_AUDIT = 'true';
process.env.NPM_CONFIG_NO_OPTIONAL = 'true';
process.env.NPM_CONFIG_PROGRESS = 'false';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

console.log('📦 Installing production dependencies...');

// Clean existing node_modules
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('🧹 Cleaning existing node_modules...');
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
}

try {
    // Install dependencies with better error handling
    console.log('🔄 Installing dependencies with optimizations...');
    
    // First try with production only
    try {
        execSync('npm install --only=production --no-audit --progress=false', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 300000 // 5 minutes timeout
        });
    } catch (error) {
        console.log('⚠️ Production-only install failed, trying full install...');
        execSync('npm install --no-audit --progress=false', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            timeout: 300000 // 5 minutes timeout
        });
    }

    // Create logs directory
    const logsPath = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsPath)) {
        fs.mkdirSync(logsPath, { recursive: true });
    }

    // Verify installation
    if (!fs.existsSync(nodeModulesPath)) {
        throw new Error('node_modules directory not found!');
    }

    const expressPath = path.join(nodeModulesPath, 'express');
    if (!fs.existsSync(expressPath)) {
        throw new Error('Express not found in node_modules!');
    }

    // Check for heavy dependencies
    const puppeteerPath = path.join(nodeModulesPath, 'puppeteer');
    const sharpPath = path.join(nodeModulesPath, 'sharp');
    const officegenPath = path.join(nodeModulesPath, 'officegen');

    if (fs.existsSync(puppeteerPath)) {
        console.log('✅ Puppeteer installed');
    } else {
        console.log('⚠️ Puppeteer not found (may be in devDependencies)');
    }

    if (fs.existsSync(sharpPath)) {
        console.log('✅ Sharp installed');
    } else {
        console.log('⚠️ Sharp not found (may be in devDependencies)');
    }

    if (fs.existsSync(officegenPath)) {
        console.log('✅ OfficeGen installed');
    } else {
        console.log('⚠️ OfficeGen not found (may be in devDependencies)');
    }

    console.log('✅ Build completed successfully!');
    console.log(`📊 Node version: ${process.version}`);
    console.log(`📊 npm version: ${execSync('npm --version', { encoding: 'utf8' }).trim()}`);
    
    // Get build size
    const stats = fs.statSync(nodeModulesPath);
    const sizeInMB = Math.round(stats.size / 1024 / 1024);
    console.log(`📊 Build size: ${sizeInMB}MB`);

} catch (error) {
    console.error('❌ Build failed:', error.message);
    if (error.stdout) console.error('STDOUT:', error.stdout.toString());
    if (error.stderr) console.error('STDERR:', error.stderr.toString());
    process.exit(1);
} 