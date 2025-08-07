@echo off
REM Windows-compatible build script for local testing
echo 🚀 Starting Windows build test...

REM Set environment variables
set NODE_ENV=production
set NPM_CONFIG_PREFER_OFFLINE=true
set NPM_CONFIG_NO_AUDIT=true
set NPM_CONFIG_NO_OPTIONAL=true
set NPM_CONFIG_PROGRESS=false

echo 📦 Installing dependencies with optimization...

REM Clean existing node_modules
if exist node_modules (
    echo 🧹 Cleaning existing node_modules...
    rmdir /s /q node_modules
)

REM Install dependencies
npm ci --only=production --prefer-offline --no-audit --no-optional --progress=false

REM Clean npm cache
echo 🧹 Cleaning npm cache...
npm cache clean --force

REM Create logs directory
if not exist logs mkdir logs

echo ✅ Windows build test completed successfully!
pause 