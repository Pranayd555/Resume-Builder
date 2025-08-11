# CI/CD Pipeline Setup Guide

## GitHub Actions Setup

### 1. Repository Secrets

Add these secrets in your GitHub repository:

**Go to:** `Settings` → `Secrets and variables` → `Actions`

#### Required Secrets:

**For Backend (Render):**
- `RENDER_TOKEN`
  1. Go to [Render Dashboard](https://dashboard.render.com)
  2. Click on your profile → `Account Settings`
  3. Go to `API Keys` tab
  4. Click `Create API Key`
  5. Copy the token and add as `RENDER_TOKEN`

- `RENDER_SERVICE_ID`
  1. Go to your Render service dashboard
  2. Copy the service ID from the URL: `https://dashboard.render.com/web/[SERVICE_ID]`
  3. Add as `RENDER_SERVICE_ID`

**For Frontend (Vercel):**
- `VERCEL_TOKEN`
  1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
  2. Click `Create Token`
  3. Give it a name (e.g., "GitHub Actions")
  4. Copy the token and add as `VERCEL_TOKEN`

- `VERCEL_ORG_ID`
  1. Go to [Vercel Dashboard](https://vercel.com/account)
  2. Click on your organization
  3. Copy the Organization ID from the URL or settings
  4. Add as `VERCEL_ORG_ID`

- `VERCEL_PROJECT_ID`
  1. Go to your Vercel project dashboard
  2. Copy the Project ID from the URL or settings
  3. Add as `VERCEL_PROJECT_ID`

- `PROD_API_URL`
  1. Your production backend URL (e.g., `https://your-app.onrender.com`)
  2. Add as `PROD_API_URL`

- `STAGING_API_URL`
  1. Your staging backend URL (e.g., `https://your-app-staging.onrender.com`)
  2. Add as `STAGING_API_URL`

### 2. Workflow File

The `.github/workflows/deploy.yml` file is configured with:
- Node.js 22
- npm caching
- Smart change detection
- Dual platform deployment
- Automatic deployment triggers

### 3. Trigger Deployment

**Automatic:**
- Push to `main` branch → Deploys to production
- Push to `dev` branch → Deploys to staging
- Workflow detects changes in `backend/` or `resume-builder/`
- Deploys only what changed

**Manual:**
- Go to `Actions` tab
- Select `🚀 Deploy to Render & Vercel` workflow
- Click `Run workflow`

## Platform Configuration

### Render Configuration

**Build Settings:**
```
Build Command: npm run render:build
Start Command: npm start
```

**Environment Variables:**
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Vercel Configuration

**Build Settings:**
```
Framework Preset: Create React App
Build Command: npm run build
Output Directory: build
Install Command: npm ci
```

**Environment Variables:**
```
REACT_APP_API_URL=https://your-backend.onrender.com
CI=false
```

**For Staging (dev branch):**
```
REACT_APP_API_URL=https://your-backend-staging.onrender.com
CI=false
```

## Deployment Flow

1. **Push to Git** → GitHub Actions triggers
2. **Detect Changes** → Identifies what files changed
3. **Deploy Backend** (if backend changed):
   - Build deployment package
   - Commit zip to repository
   - Trigger Render deployment
4. **Deploy Frontend** (if frontend changed):
   - Build React app
   - Deploy to Vercel
5. **Summary** → Report deployment results

## Smart Deployment Examples

### Backend Only Changes (Production)
```
🔍 Backend files changed: backend/routes/auth.js
✅ Backend deployed to Render (production) successfully
⏭️ Frontend deployment skipped
```

### Frontend Only Changes (Staging)
```
🔍 Frontend files changed: resume-builder/src/components/Header.js
⏭️ Backend deployment skipped
✅ Frontend deployed to Vercel (staging) successfully
```

### Full-Stack Changes (Production)
```
🔍 Backend files changed: backend/models/User.js
🔍 Frontend files changed: resume-builder/src/services/api.js
✅ Backend deployed to Render (production) successfully
✅ Frontend deployed to Vercel (production) successfully
```

## Benefits

- **Smart Detection**: Only deploys what changed
- **Zero Manual Work**: Just push to Git
- **Fast Deployments**: Parallel execution when possible
- **Reliable**: Pre-built packages for backend
- **Version Control**: Track all deployments
- **Modern Stack**: Node.js 22+ features
- **Clear Reporting**: Summary of all deployments 