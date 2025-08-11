# Render Deployment Guide

## Automated Git Deployment

### 1. Build Locally
```bash
cd backend
npm run build:render
```

This creates `render-deployment.zip` with all dependencies pre-built.

### 2. Commit and Push to Git
```bash
git add render-deployment.zip
git commit -m "Deploy: Updated backend"
git push origin main
```

### 3. Render Automatically Deploys
- Render detects the new commit
- Runs the build script to extract the zip
- Starts the application

## Render Configuration

### Build & Deploy Settings:
- **Build Command**: `npm run render:build`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```
  NODE_ENV=production
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
  ```

### Git Repository Setup:
1. Connect your Git repository to Render
2. Set up automatic deployments
3. Render will run `npm run render:build` on each push

## What Happens on Render

1. **Git Push** → Render detects changes
2. **Build Phase** → `npm run render:build`
   - Extracts `render-deployment.zip`
   - Verifies essential files
   - Removes zip to save space
3. **Deploy Phase** → `npm start`
   - Starts the application

## Benefits
- **Fully Automated**: Push to Git → Auto-deploy
- **Fast**: No dependency downloads on Render
- **Reliable**: Pre-built packages eliminate build issues
- **Version Control**: Track deployment history in Git

## Troubleshooting
- If build fails: Check if `render-deployment.zip` exists in repository
- If deployment fails: Check Render logs and environment variables
- Always run `npm run build:render` locally before pushing 