# Resume Builder Backend API

A comprehensive Node.js/Express backend for the Resume Builder application, designed to serve both web and mobile clients with support for Play Store deployment.

## Features

- **Authentication & Authorization**: JWT-based auth with Google/LinkedIn OAuth
- **User Management**: Profile management, preferences, activity tracking
- **Resume Builder**: CRUD operations, templates, export functionality
- **Subscription System**: razorpay integration with multiple plans
- **File Upload**: Cloudinary integration for profile pictures
- **Mobile Ready**: CORS configured for mobile app deployment
- **Security**: Rate limiting, input validation, sanitization
- **Logging**: Comprehensive logging with Winston
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js (Google/LinkedIn OAuth)
- **Payments**: razorpay
- **File Storage**: Cloudinary
- **Validation**: express-validator, Joi
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston
- **Development**: Nodemon

## Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure:

```bash
cp env.template .env
```

Required environment variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/resumebuilder

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-here

# OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# razorpay Configuration (optional)
razorpay_SECRET_KEY=sk_test_your-razorpay-secret-key
razorpay_WEBHOOK_SECRET=whsec_your-webhook-secret
razorpay_PUBLISHABLE_KEY=pk_test_your-publishable-key

# File Upload Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Client URLs
CLIENT_URL=http://localhost:3000
MOBILE_APP_URL_SCHEME=resumebuilder
```

### 3. Database Setup

Make sure MongoDB is running locally or update `MONGODB_URI` with your cloud database connection string.

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

### Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `PUT /auth/password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password
- `GET /auth/google` - Google OAuth
- `GET /auth/linkedin` - LinkedIn OAuth

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/dashboard` - Dashboard stats
- `GET /users/activity` - User activity
- `PUT /users/preferences` - Update preferences
- `GET /users/export` - Export user data

#### Resumes
- `GET /resumes` - Get user resumes
- `POST /resumes` - Create resume
- `GET /resumes/:id` - Get resume by ID
- `PUT /resumes/:id` - Update resume
- `DELETE /resumes/:id` - Delete resume
- `POST /resumes/:id/duplicate` - Duplicate resume
- `PUT /resumes/:id/template` - Change template
- `POST /resumes/:id/export` - Export resume
- `POST /resumes/:id/share` - Share resume
- `GET /resumes/shared/:token` - Get shared resume (public)
- `GET /resumes/:id/analytics` - Resume analytics

#### Templates
- `GET /templates` - Get all templates
- `GET /templates/:id` - Get template by ID
- `GET /templates/:id/code` - Get template code (auth required)
- `GET /templates/featured/popular` - Popular templates
- `GET /templates/featured/new` - New templates
- `POST /templates/:id/rate` - Rate template
- `GET /templates/:id/reviews` - Template reviews

#### Subscriptions
- `GET /subscriptions/plans` - Get subscription plans
- `GET /subscriptions/current` - Get current subscription
- `POST /subscriptions/create-checkout-session` - Create razorpay session
- `POST /subscriptions/success` - Handle successful payment
- `POST /subscriptions/cancel` - Cancel subscription
- `POST /subscriptions/reactivate` - Reactivate subscription
- `GET /subscriptions/billing-history` - Billing history
- `POST /subscriptions/update-payment-method` - Update payment method
- `POST /subscriptions/webhook` - razorpay webhook (public)

#### File Uploads
- `POST /uploads/profile-picture` - Upload profile picture
- `DELETE /uploads/profile-picture` - Delete profile picture

### Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "data": {
    // Response data
  },
  "error": "Error message (if success: false)",
  "errors": [
    // Validation errors array (if applicable)
  ]
}
```

## Mobile App Configuration

The backend is configured to work with mobile applications:

### CORS Settings
- Supports `capacitor://localhost` for Ionic/Capacitor apps
- Allows all HTTP methods needed for mobile
- Credentials support enabled

### Security Considerations
- Rate limiting per IP
- JWT tokens for stateless authentication
- Input validation and sanitization
- Helmet for security headers

## Deployment

### Environment Variables for Production

Update these for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resumebuilder
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-production-jwt-secret-very-long-and-random
```

### Deployment Platforms

#### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy:
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

#### AWS/Digital Ocean
1. Set up server with Node.js
2. Clone repository
3. Install dependencies
4. Configure environment
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name "resume-builder-api"
pm2 startup
pm2 save
```

### Database Deployment

#### MongoDB Atlas (Recommended)
1. Create cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses
4. Update `MONGODB_URI` in environment

## Third-Party Integrations

### Google OAuth Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-api-domain.com/api/auth/google/callback` (production)
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### LinkedIn OAuth Setup
1. Create LinkedIn app at developer.linkedin.com
2. Add redirect URLs
3. Set `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`

### razorpay Setup
1. Create razorpay account
2. Get API keys from dashboard
3. Set webhook endpoint: `/api/subscriptions/webhook`
4. Configure `razorpay_SECRET_KEY` and `razorpay_WEBHOOK_SECRET`

### Cloudinary Setup
1. Create Cloudinary account
2. Get cloud name, API key, and secret
3. Configure environment variables

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use long, random strings for production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Configured for auth endpoints
5. **Input Validation**: All inputs are validated and sanitized
6. **CORS**: Properly configured for your domains
7. **Database Security**: Use MongoDB Atlas with authentication

## Monitoring and Logging

### Logs
- Console logs in development
- File logs in production (`logs/` directory)
- Error tracking with stack traces
- Request logging with Morgan

### Health Check
- `GET /health` endpoint for monitoring
- Returns server status and uptime

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data

### Project Structure
```
backend/
├── config/           # Configuration files
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── logs/            # Log files
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Support

For deployment and configuration support:
1. Check the logs in `logs/` directory
2. Verify all environment variables are set
3. Ensure database connectivity
4. Check third-party service configurations

## License

MIT License - See LICENSE file for details 