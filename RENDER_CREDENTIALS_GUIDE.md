# 🔑 How to Get Your Render API Key and Service ID

## 📋 From Your Example URL

From your example: `https://api.render.com/deploy/srv-d21kvgefdfd3jp1c738069s0?key=djdZJHJW5BrSoc`

- **Service ID**: `srv-d21kvgefdfd3jp1c738069s0` (the part after `/deploy/`)
- **Deploy Key**: `djdZJHJW5BrSoc` (the part after `?key=`)

⚠️ **Note**: The `key` in the URL is a **Deploy Hook key**, not your API key. You need both pieces of information from your dashboard.

## 🎯 Step-by-Step Guide

### **1. Get Your Render API Key**

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click on your profile/avatar** (top right corner)
3. **Select "Account Settings"**
4. **Go to "API Keys" tab**
5. **Click "Create API Key"** (if you don't have one)
6. **Copy the API Key** - it looks like: `rnd_abcdefghijklmnopqrstuvwxyz123456`

### **2. Get Your Service ID**

#### **For Production Service:**
1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click on your production backend service** (resume-builder-backend-prod)
3. **Go to "Settings" tab**
4. **Look for "Service ID"** in the service details
5. **Copy the Service ID** - it looks like: `srv-abc123def456ghi789`

#### **For Staging Service:**
1. **Click on your staging backend service** (resume-builder-backend-staging)
2. **Follow the same steps** to get the staging Service ID

## 🔧 What You Need for GitHub Secrets

Based on your deployment setup, you need to add these to **GitHub Repository Settings** → **Secrets and variables** → **Actions**:

### **Required Secrets:**

```bash
# Render Configuration
RENDER_API_KEY=rnd_your_actual_api_key_here
RENDER_SERVICE_ID=srv_your_production_service_id_here

# If you have separate staging service
RENDER_STAGING_SERVICE_ID=srv_your_staging_service_id_here
```

## 📍 Finding Your Specific Information

### **Step 1: Login to Render**
Go to: https://dashboard.render.com/

### **Step 2: Find Your Services**
Look for services named:
- `resume-builder-backend-prod` (production)
- `resume-builder-backend-staging` (staging)
- Or similar names you chose

### **Step 3: Get Service IDs**
For each service:
1. Click on the service name
2. Go to **Settings** tab
3. Copy the **Service ID** (starts with `srv-`)

### **Step 4: Get API Key**
1. Click your **profile picture** (top right)
2. **Account Settings**
3. **API Keys** tab
4. **Create API Key** or copy existing one

## 🖼️ Visual Guide

```
Render Dashboard Layout:
┌─────────────────────────────────────┐
│ [Logo] Services  [Profile Picture] │ ← Click profile for API key
├─────────────────────────────────────┤
│ Services:                           │
│ • resume-builder-backend-prod       │ ← Click for Service ID
│ • resume-builder-backend-staging    │ ← Click for Service ID
│ • Other services...                 │
└─────────────────────────────────────┘
```

## 🔐 Example Values (Your Actual Values Will Be Different)

```bash
# Your actual values will look like this:
RENDER_API_KEY=rnd_ABCDEfghIJKLmnopQRSTuvwxYZ123456789
RENDER_SERVICE_ID=srv-d21kvgefdfd3jp1c7380g9s0  # Production
RENDER_STAGING_SERVICE_ID=srv-e32lwghgefe4kq2d849170t1  # Staging
```

## ⚙️ Adding to GitHub Secrets

### **Step 1: Go to GitHub**
Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

### **Step 2: Add New Secret**
1. Click **"New repository secret"**
2. **Name**: `RENDER_API_KEY`
3. **Secret**: Your copied API key (starts with `rnd_`)
4. Click **"Add secret"**

### **Step 3: Add Service ID**
1. Click **"New repository secret"**
2. **Name**: `RENDER_SERVICE_ID`
3. **Secret**: Your production service ID (starts with `srv-`)
4. Click **"Add secret"**

## 🧪 Testing Your Configuration

After adding the secrets, you can test by:

1. **Go to GitHub Actions**
2. **Select "🚀 Continuous Deployment"**
3. **Click "Run workflow"**
4. **Choose environment and run**

## 🚨 Security Notes

- **Never share your API key** publicly
- **API keys have full account access** - keep them secure
- **Service IDs are less sensitive** but still shouldn't be public
- **Use different API keys** for different purposes if needed

## ❓ Troubleshooting

### **Can't Find API Key Tab?**
- Make sure you're logged into the correct account
- Check if you have necessary permissions
- Try refreshing the page

### **Can't Find Service ID?**
- Make sure the service is deployed
- Check the "Settings" or "Environment" tab
- Look for "Service Details" section

### **GitHub Actions Failing?**
- Verify API key is correct (starts with `rnd_`)
- Verify Service ID is correct (starts with `srv-`)
- Check if the service exists and is active

## 🎯 Next Steps

Once you have both values:
1. ✅ Add `RENDER_API_KEY` to GitHub Secrets
2. ✅ Add `RENDER_SERVICE_ID` to GitHub Secrets  
3. ✅ Test deployment with GitHub Actions
4. ✅ Verify your app deploys successfully

Your continuous deployment pipeline will then be fully functional! 🚀 