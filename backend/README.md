# Presmistique API (backend)

Node.js/Express backend for Presmistique - AI Resume Builder, serving both web and mobile clients. Production: `https://api.presmistique.in`.

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

- **Runtime**: Node.js 22 (see `backend/package.json` → `engines`)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose (MongoDB Atlas in production)
- **Authentication**: JWT, Passport.js (Google/LinkedIn OAuth)
- **Payments**: Razorpay
- **AI**: Google Gemini
- **PDF & thumbnails**: Puppeteer + Chromium, Handlebars templates
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston, Morgan
- **Container**: `Dockerfile` (node:22-bookworm-slim + Debian Chromium)
- **Development**: Nodemon

## Quick Start

### 1. Environment

```bash
cd backend
cp env.template .env
```

Fill in the values you need; `env.template` documents every variable. The minimum for a working API is
`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET` and `CLIENT_URL=http://localhost:3000`.

### 2a. Run with Docker (same image as production)

From the repo root:

```bash
docker compose up --build
```

This builds this directory's `Dockerfile` and starts it with a throwaway local MongoDB
(`MONGODB_URI` and `CLIENT_URL` are overridden, so your Atlas database is never touched).

### 2b. Run with Node directly

Requires Node 22 and a reachable MongoDB (local, or a development Atlas cluster in `MONGODB_URI`).

```bash
cd backend
npm install      # Puppeteer downloads its own Chrome for local PDF rendering
npm run dev
```

Either way the API runs on `http://localhost:5000` (health check: `GET /health`).

## API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.presmistique.in/api`

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

Production runs this directory's `Dockerfile` on a VPS behind nginx at `https://api.presmistique.in`.
Merging to `main` builds the image, pushes it to GitHub Container Registry and rolls it out with a health
check and automatic rollback. Production secrets live in `/opt/presmistique/api.env` on the server
(`NODE_ENV=production` and `PORT=5000` are set by the compose file).

See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for the full flow, rollback and server setup.

### Database

Production uses MongoDB Atlas:
1. Create a cluster and a database user
2. Allow the VPS IP in Network Access
3. Put the connection string in `MONGODB_URI` in `api.env`

## Third-Party Integrations

### Google OAuth Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://api.presmistique.in/api/auth/google/callback` (production)
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and, in production, `GOOGLE_CALLBACK_URL`

### LinkedIn OAuth Setup
1. Create LinkedIn app at developer.linkedin.com
2. Add redirect URLs (`http://localhost:5000/api/auth/linkedin/callback`, `https://api.presmistique.in/api/auth/linkedin/callback`)
3. Set `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` and `LINKEDIN_CALLBACK_URL`

See [docs/OAUTH_SETUP.md](../docs/OAUTH_SETUP.md) for details.

### razorpay Setup
1. Create razorpay account
2. Get API keys from dashboard
3. Set webhook endpoint: `/api/subscriptions/webhook`
4. Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`

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
- `npm start` - Start the server (`node server.js`)
- `npm run dev` - Start development server with nodemon
- `npm test` - Run the unit tests (set `TOKEN_TEST_MONGODB_URI` to include the database tests)
- `npm run seed:all-templates` - Seed all resume templates
- `npm run generate-thumbnails` / `npm run update-thumbnails` - Generate template thumbnails with Puppeteer (see [scripts/README.md](scripts/README.md))
- `npm run unlock-account -- <email>` - Unlock a locked user account
- `npm run add-tokens -- <email> <count> --force` - Add tokens to a user (without `--force` it only previews)

In production, run admin scripts inside the container from `/opt/presmistique`:
`docker compose exec api npm run <script>`.

### Project Structure
```
backend/
├── assets/          # Resume template definitions
├── config/          # Configuration (Passport, etc.)
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── scripts/         # Seeding, thumbnails and admin scripts
├── services/        # Service layer
├── templates/       # Email templates
├── thumbnails/      # Generated template thumbnails (served at /thumbnails)
├── utils/           # Utilities (browserManager, tokenCalculator, refundPolicy, emailService, ...)
├── Dockerfile       # Production image
├── env.template     # Environment variable reference
├── server.js        # Main server file
└── package.json     # Dependencies and scripts
```

## Support

For deployment and configuration support (contact: presmistique@gmail.com):
1. Check the logs in `logs/` directory
2. Verify all environment variables are set
3. Ensure database connectivity
4. Check third-party service configurations

## License

MIT License - See LICENSE file for details 