#!/usr/bin/env node

/**
 * Universal build script for both local and Render environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Check if we're in Render environment
const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';

if (isRender) {
    console.log('📦 Render environment detected - running render build...');
    // In Render, we expect the zip file to be extracted
    require('./render-build.js');
} else {
    console.log('🏠 Local environment detected - creating deployment package...');
    // In local environment, create the deployment package
    require('./local-build-for-render.js');
} 