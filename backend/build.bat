@echo off
REM Windows build script for local development
echo 🚀 Starting Windows build...

REM Set environment variables
set NODE_ENV=production
set NPM_CONFIG_PREFER_OFFLINE=true
set NPM_CONFIG_NO_AUDIT=true
set NPM_CONFIG_NO_OPTIONAL=true
set NPM_CONFIG_PROGRESS=false
set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

echo 📦 Installing production dependencies...

REM Clean existing node_modules
if exist node_modules (
    echo 🧹 Cleaning existing node_modules...
    rmdir /s /q node_modules
)

REM Install dependencies with fallback
echo 🔄 Installing dependencies with optimizations...
npm install --only=production --no-audit --progress=false
if %ERRORLEVEL% neq 0 (
    echo ⚠️ Production-only install failed, trying full install...
    npm install --no-audit --progress=false
)

REM Create logs directory
if not exist logs mkdir logs

echo ✅ Windows build completed successfully!
echo 📊 Build size: 
dir /s node_modules | find "File(s)"
pause 