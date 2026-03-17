# OAuth Setup Guide

This guide explains how to enable Google and LinkedIn OAuth authentication for the Resume Builder application.

## Current Status

The OAuth functionality is currently **disabled** because the required environment variables are not configured. The OAuth buttons will appear grayed out and show a tooltip indicating they're not configured.

## Prerequisites

1. **Google OAuth Setup**:
   - Google Cloud Console account
   - A Google Cloud project
   - OAuth 2.0 credentials

2. **LinkedIn OAuth Setup**:
   - LinkedIn Developer account
   - A LinkedIn application
   - OAuth 2.0 credentials

## Backend Configuration

### 1. Create Environment File

Create a `.env` file in the `backend` directory with the following variables:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Other required variables (see env.template for full list)
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:3000
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set the authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret to your `.env` file

### 3. LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Configure the OAuth 2.0 settings
4. Set the authorized redirect URIs:
   - `http://localhost:5000/api/auth/linkedin/callback` (for development)
   - `https://yourdomain.com/api/auth/linkedin/callback` (for production)
5. Copy the Client ID and Client Secret to your `.env` file

## Frontend Configuration

### 1. Create Environment File

Create a `.env` file in the `resume-builder` directory:

```env
# Backend API base URL (used by frontend to initiate OAuth redirects)
REACT_APP_API_URL=http://localhost:5000
```

**Note**: The frontend does not need Google/LinkedIn client IDs because OAuth is handled by the backend. The UI simply redirects the browser to the backend OAuth endpoints.

## How It Works

### OAuth Flow

1. **User clicks OAuth button** → Redirects to `/api/auth/google` or `/api/auth/linkedin`
2. **Backend initiates OAuth** → Redirects user to Google/LinkedIn for authentication
3. **User authenticates** → Google/LinkedIn redirects back to callback URL
4. **Backend processes callback** → Creates/updates user account and generates JWT token
5. **Frontend receives token** → Redirects to `/auth/callback?token=...`
6. **AuthCallback component** → Stores token and redirects to main app

### User Account Creation

- **New users**: Creates account with OAuth profile data
- **Existing users**: Links OAuth account to existing email
- **Email verification**: Automatically verified for OAuth users
- **Profile picture**: Automatically imported from OAuth provider

## Security Features

- **JWT tokens**: Secure authentication without sessions
- **Email linking**: Prevents duplicate accounts
- **Profile data validation**: Sanitizes OAuth profile data
- **Error handling**: Graceful fallback for OAuth failures

## Testing

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd resume-builder
   npm start
   ```

3. **Test OAuth flow**:
   - Go to login/register page
   - Click Google or LinkedIn button
   - Complete OAuth authentication
   - Verify successful login and account creation

## Troubleshooting

### Common Issues

1. **"OAuth not configured" message**:
   - Check that environment variables are set correctly
   - Restart both frontend and backend servers

2. **"Invalid redirect URI" error**:
   - Verify redirect URIs match exactly in OAuth provider settings
   - Check for trailing slashes or protocol mismatches

3. **"Authentication failed" error**:
   - Check backend logs for detailed error messages
   - Verify OAuth credentials are correct
   - Ensure required APIs are enabled in Google Cloud Console

4. **Frontend buttons remain disabled**:
   - Check that `REACT_APP_` prefixed variables are set
   - Restart the React development server

### Debug Mode

To enable debug logging, set in backend `.env`:
```env
LOG_LEVEL=debug
```

## Production Deployment

1. **Update redirect URIs** in OAuth provider settings
2. **Set production environment variables**
3. **Configure HTTPS** (required for OAuth in production)
4. **Update CLIENT_URL** to your production domain

## Support

If you encounter issues:
1. Check the backend logs for error messages
2. Verify all environment variables are set correctly
3. Test with a fresh OAuth application
4. Contact support with specific error messages 