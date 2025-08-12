@echo off
REM Quick deployment script for Render - Windows
echo 🚀 Starting deployment to Render...

REM Build the deployment package
echo 📦 Building deployment package...
npm run build:render

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

REM Add and commit the zip file
echo 📝 Committing deployment package...
git add render-deployment.zip
git commit -m "Deploy: %date% %time%"

REM Push to trigger Render deployment
echo 🚀 Pushing to Git to trigger Render deployment...
git push origin main

echo ✅ Deployment triggered!
echo 📊 Check Render dashboard for deployment status
pause 