@echo off
REM Windows start script for local development
echo 🚀 Starting application on Windows...

REM Set environment variables
set NODE_ENV=production
set PORT=5000

REM Create logs directory
if not exist logs mkdir logs

REM Start the application
echo 📍 Starting server on port %PORT%...
node server.js 