# 🔧 Environment Setup Guide

## 🚨 Critical Security Issue Addressed

Your original `env.template` contained **real production credentials**. I've cleaned this up, but you need to take immediate action to secure your application.

## 🎯 What's Been Fixed

### ✅ **Template File Secured**
- Removed all real credentials from `env.template`
- Added proper structure and documentation
- Added environment-specific examples

### ✅ **Missing Configurations Added**
- `CORS_ORIGIN` for proper CORS handling
- Stripe configuration for payments
- Cloudinary for file uploads
- Improved security settings

## 🚀 How to Set Up Your Environments

### **1. Development Environment (Local)**

Create a `.env` file in your `backend/` directory:

```bash
# Copy template and fill with your values
cp backend/env.template backend/.env
```

Fill in your **development/local** values:
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://your-dev-user:your-dev-password@your-dev-cluster.mongodb.net/resume_builder_dev
JWT_SECRET=your-local-jwt-secret-64-characters
JWT_REFRESH_SECRET=your-local-refresh-secret-64-characters
GOOGLE_CLIENT_ID=your-dev-google-client-id
GOOGLE_CLIENT_SECRET=your-dev-google-client-secret
EMAIL_USER=your-dev-email@gmail.com
EMAIL_PASS=your-dev-app-password
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### **2. Production Environment (Render Dashboard)**

Go to **Render Dashboard** → **resume-builder-backend-prod** → **Environment**:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://prod-user:STRONG-PROD-PASSWORD@prod-cluster.mongodb.net/resume_builder_prod
JWT_SECRET=GENERATED-64-CHAR-PRODUCTION-SECRET
JWT_REFRESH_SECRET=DIFFERENT-64-CHAR-PRODUCTION-SECRET
GOOGLE_CLIENT_ID=production-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=production-google-client-secret
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=production-app-password
CLIENT_URL=https://your-production-frontend.vercel.app
CORS_ORIGIN=https://your-production-frontend.vercel.app
ADMIN_EMAIL=admin@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
LOG_LEVEL=error
BCRYPT_SALT_ROUNDS=14
RATE_LIMIT_MAX_REQUESTS=50
```

### **3. Staging Environment (Render Dashboard)**

Go to **Render Dashboard** → **resume-builder-backend-staging** → **Environment**:

```bash
NODE_ENV=staging
PORT=10000
MONGODB_URI=mongodb+srv://staging-user:STRONG-STAGING-PASSWORD@staging-cluster.mongodb.net/resume_builder_staging
JWT_SECRET=GENERATED-64-CHAR-STAGING-SECRET
JWT_REFRESH_SECRET=DIFFERENT-64-CHAR-STAGING-SECRET
GOOGLE_CLIENT_ID=staging-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=staging-google-client-secret
EMAIL_USER=staging@yourdomain.com
EMAIL_PASS=staging-app-password
CLIENT_URL=https://your-staging-frontend.vercel.app
CORS_ORIGIN=https://your-staging-frontend.vercel.app
ADMIN_EMAIL=staging-admin@yourdomain.com
SUPPORT_EMAIL=staging-support@yourdomain.com
LOG_LEVEL=debug
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔐 Generate Secure Secrets

### **JWT Secrets (Run these commands)**
```bash
# For JWT_SECRET
node -p "require('crypto').randomBytes(64).toString('hex')"

# For JWT_REFRESH_SECRET (run again for different secret)
node -p "require('crypto').randomBytes(64).toString('hex')"
```

### **Strong Passwords**
Use a password manager to generate:
- 32+ character passwords for databases
- Unique passwords for each environment
- Enable 2FA where possible

## 🌐 Service-Specific Setup

### **MongoDB Atlas**
1. **Create separate clusters/databases**:
   - `resume_builder_dev` (development)
   - `resume_builder_staging` (staging)
   - `resume_builder_prod` (production)

2. **Create separate users**:
   - `dev-user` with read/write to dev database
   - `staging-user` with read/write to staging database
   - `prod-user` with read/write to prod database

3. **Network Security**:
   - Whitelist specific IPs for production
   - Allow all IPs for development (0.0.0.0/0)

### **Google OAuth**
1. **Go to [Google Cloud Console](https://console.developers.google.com/)**
2. **Create separate OAuth applications**:
   - `Resume Builder (Development)`
   - `Resume Builder (Staging)`
   - `Resume Builder (Production)`

3. **Configure redirect URIs**:
   - Dev: `http://localhost:3000/auth/google/callback`
   - Staging: `https://your-staging-frontend.vercel.app/auth/google/callback`
   - Prod: `https://your-production-frontend.vercel.app/auth/google/callback`

### **Gmail App Passwords**
1. **Go to [Google Account Security](https://myaccount.google.com/security)**
2. **Enable 2-Step Verification** (required)
3. **Generate App Passwords**:
   - One for development
   - One for staging
   - One for production
4. **Use different Gmail accounts** for each environment if possible

### **LinkedIn OAuth (Optional)**
1. **Go to [LinkedIn Developers](https://www.linkedin.com/developers/)**
2. **Create separate applications** for each environment
3. **Configure redirect URIs** similar to Google OAuth

## 📋 Verification Checklist

### ✅ **Security**
- [ ] All real credentials removed from repository
- [ ] Strong, unique passwords for each environment
- [ ] Separate databases for each environment
- [ ] Different OAuth apps for each environment
- [ ] JWT secrets are 64+ characters and unique

### ✅ **Functionality**
- [ ] Database connections work
- [ ] OAuth login works
- [ ] Email sending works
- [ ] API endpoints respond correctly
- [ ] Frontend can connect to backend

### ✅ **Environment Variables**
- [ ] Production variables set in Render Dashboard
- [ ] Staging variables set in Render Dashboard
- [ ] Development variables in local `.env` file
- [ ] No `.env` files committed to repository

## 🚨 Final Security Steps

### **1. Revoke Exposed Credentials**
Since your credentials were exposed, you MUST:

1. **MongoDB**: Change database user password
2. **Google OAuth**: Delete and recreate OAuth client
3. **Gmail**: Revoke and regenerate app password
4. **Check logs** for any unauthorized access

### **2. Update GitHub Secrets**
Update these in **GitHub Repository Settings** → **Secrets**:

```bash
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-render-service-id
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
PROD_API_URL=https://resume-builder-backend-prod.onrender.com
STAGING_API_URL=https://resume-builder-backend-staging.onrender.com
FRONTEND_URL_PROD=https://your-production-frontend.vercel.app
FRONTEND_URL_STAGING=https://your-staging-frontend.vercel.app
```

### **3. Test Deployments**
After setting up all environment variables:

```bash
# Test staging
git push origin dev

# Test production (after staging works)
git push origin main
```

## 📞 Need Help?

If you encounter issues:

1. **Check the logs** in Render Dashboard
2. **Verify environment variables** are set correctly
3. **Test database connections** using MongoDB Compass
4. **Check OAuth redirect URIs** match exactly
5. **Ensure app passwords** are correct (not regular passwords)

## 🎉 Success!

Once everything is configured:
- Your development environment will work locally
- Staging deployments will work when pushing to `dev` branch
- Production deployments will work when pushing to `main` branch
- All environments will be properly secured and separated

Remember: **Never commit real credentials to your repository again!** 