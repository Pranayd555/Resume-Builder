#!/usr/bin/env node

/**
 * Cross-platform start script for Render and local development
 * Works on both Windows and Linux
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting application...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

// Create logs directory
const logsPath = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, { recursive: true });
}

console.log(`📍 Starting server on port ${process.env.PORT}...`);

// Start the application
const serverPath = path.join(__dirname, '..', 'server.js');
if (!fs.existsSync(serverPath)) {
    console.error('❌ server.js not found!');
    process.exit(1);
}

// Load and start the server
require(serverPath); 