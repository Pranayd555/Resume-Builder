# GitHub Actions Workflows

## 🚀 Deploy to Render & Vercel

**File:** `deploy.yml`

### Purpose
Automated deployment pipeline for both backend (Render) and frontend (Vercel) based on file changes.

### Triggers
- **Push to main branch** → Deploys to production
- **Push to dev branch** → Deploys to staging
- **Manual trigger** via GitHub Actions UI
- **Excludes** deployment files (`*.zip`) to prevent infinite loops

### Smart Deployment Logic
The workflow intelligently detects what has changed and deploys accordingly:

- **🔍 Backend changes only** → Deploy to Render only
- **🎨 Frontend changes only** → Deploy to Vercel only  
- **🔄 Both changed** → Deploy to both platforms
- **📝 No relevant changes** → Skip deployment

### Environment Mapping
- **main branch** → Production environment
- **dev branch** → Staging environment

### What it does

#### 1. **🔍 Detect Changes**
- Compares current commit with previous commit
- Identifies changes in `backend/` and `resume-builder/` directories
- Sets deployment flags for each platform

#### 2. **🚀 Backend Deployment (Render)**
- **🟢 Setup Node.js 22** - Configures environment
- **📦 Install dependencies** - Installs npm packages
- **🏗️ Build package** - Creates `render-deployment.zip`
- **📝 Commit & Push** - Adds zip to repository (with loop prevention)
- **🚀 Deploy to Render** - Triggers Render deployment

#### 3. **🎨 Frontend Deployment (Vercel)**
- **🟢 Setup Node.js 22** - Configures environment
- **📦 Install dependencies** - Installs npm packages
- **🏗️ Build frontend** - Creates production build
- **🚀 Deploy to Vercel** - Deploys to Vercel platform

#### 4. **📊 Summary**
- Reports what was deployed and results
- Shows success/failure status for each platform

### Required Secrets

#### For Backend (Render):
- `RENDER_TOKEN` - Render API token
- `RENDER_SERVICE_ID` - Render service ID

#### For Frontend (Vercel):
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `PROD_API_URL` - Production API URL for frontend
- `STAGING_API_URL` - Staging API URL for frontend

### Benefits
- **Smart detection** - Only deploys what changed
- **Fully automated** - Just push to Git
- **Fast deployments** - Parallel execution when possible
- **Reliable** - Pre-built packages for backend
- **Modern** - Uses Node.js 22+ features
- **Clear reporting** - Summary of all deployments
- **Loop prevention** - Prevents infinite deployment cycles

### Example Scenarios

**Scenario 1: Backend API changes (main branch)**
```
🔍 Backend files changed: backend/routes/auth.js
✅ Backend deployed to Render (production) successfully
⏭️ Frontend deployment skipped (no changes detected)
```

**Scenario 2: Backend API changes (dev branch)**
```
🔍 Backend files changed: backend/routes/auth.js
✅ Backend deployed to Render (staging) successfully
⏭️ Frontend deployment skipped (no changes detected)
```

**Scenario 3: Frontend UI changes (dev branch)**
```
🔍 Frontend files changed: resume-builder/src/components/Header.js
⏭️ Backend deployment skipped (no changes detected)
✅ Frontend deployed to Vercel (staging) successfully
```

**Scenario 4: Full-stack changes (main branch)**
```
🔍 Backend files changed: backend/models/User.js
🔍 Frontend files changed: resume-builder/src/services/api.js
✅ Backend deployed to Render (production) successfully
✅ Frontend deployed to Vercel (production) successfully
```

## 🧹 Cleanup Summary

Removed unnecessary workflows:
- ❌ `main.yml` - Complex multi-job pipeline
- ❌ `ci-shared.yml` - Reusable CI workflow
- ❌ `dependency-check.yml` - Weekly dependency audits
- ❌ `operations.yml` - Manual operations

Kept only the essential:
- ✅ `deploy.yml` - Smart dual deployment pipeline 