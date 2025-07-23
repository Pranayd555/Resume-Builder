# Quick Setup Guide

This guide will get your Resume Builder backend running quickly for both development and Play Store deployment.

## 🚀 Immediate Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create Environment File
```bash
cp env.template .env
```

### 3. Configure Minimum Required Variables
Edit `.env` and set these required variables:

```env
# Required for basic functionality
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters-long
MONGODB_URI=mongodb://localhost:27017/resumebuilder

# Required for frontend connection
CLIENT_URL=http://localhost:3000

# Port (optional, defaults to 5000)
PORT=5000
```

### 4. Start MongoDB
- **Local**: Install and start MongoDB locally
- **Cloud**: Sign up for MongoDB Atlas (free) and update `MONGODB_URI`

### 5. Start the Server
```bash
npm run dev
```

✅ **Your backend is now running at `http://localhost:5000`**

## 📱 Mobile/Play Store Configuration

### CORS Configuration
The backend is pre-configured for mobile apps with these CORS settings:
- `capacitor://localhost` (for Ionic/Capacitor)
- `ionic://localhost` (for Ionic)
- Custom mobile URL schemes

### API Base URL
For your mobile app, use:
- Development: `http://localhost:5000/api`
- Production: `https://your-deployed-domain.com/api`

## 🔧 Optional Integrations

### Google OAuth (for social login)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add to `.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Stripe (for subscriptions)
1. Create [Stripe account](https://stripe.com)
2. Get API keys from dashboard
3. Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
```

### Cloudinary (for file uploads)
1. Create [Cloudinary account](https://cloudinary.com)
2. Get credentials from dashboard
3. Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🌐 Frontend Integration

### Update Frontend API Calls
Replace your frontend API calls to use:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Example: Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password })
});

// Example: Authenticated request
const response = await fetch(`${API_BASE_URL}/resumes`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {
    "user": { /* user data */ },
    "token": "jwt-token"
  }
}
```

## 🚀 Quick Deployment

### 1. Railway (Recommended - Free)
1. Push to GitHub
2. Connect to [Railway](https://railway.app)
3. Set environment variables
4. Deploy automatically

### 2. Heroku
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongo-uri
git push heroku main
```

### 3. MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in environment

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## 📚 Available Endpoints

Key endpoints for your frontend:

**Authentication:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Resumes:**
- `GET /api/resumes` - Get user resumes
- `POST /api/resumes` - Create resume
- `PUT /api/resumes/:id` - Update resume
- `POST /api/resumes/:id/export` - Export resume

**Templates:**
- `GET /api/templates` - Get available templates
- `GET /api/templates/:id` - Get template details

**Subscriptions:**
- `GET /api/subscriptions/plans` - Get pricing plans
- `POST /api/subscriptions/create-checkout-session` - Start subscription

## 🔍 Troubleshooting

### Common Issues

1. **CORS Error**: Update `CLIENT_URL` in `.env`
2. **Database Connection**: Check MongoDB is running or Atlas URI is correct
3. **JWT Error**: Ensure `JWT_SECRET` is set and long enough
4. **Port Conflict**: Change `PORT` in `.env` if 5000 is in use

### Logs
Check logs in `logs/` directory for detailed error information.

### Health Check
Visit `http://localhost:5000/health` to verify server is running.

## 🎯 Next Steps

1. ✅ Set up basic backend
2. ✅ Connect frontend to API
3. 🔄 Add OAuth providers (optional)
4. 🔄 Set up Stripe for payments (optional)
5. 🔄 Configure file uploads (optional)
6. 🚀 Deploy to production

Your backend is now ready for both web and mobile deployment! 🎉 