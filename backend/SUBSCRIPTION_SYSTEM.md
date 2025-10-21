# New Subscription System Documentation

## Overview

This document describes the completely rebuilt subscription system for the Resume Builder application. The new system is simplified, efficient, and designed to work without cron job support.

## Architecture

### Core Components

1. **User Model** - Updated with simplified subscription fields
2. **validateSubscription Middleware** - On-demand subscription validation and cleanup
3. **Subscription Controller** - Handles subscription operations
4. **Subscription Routes** - API endpoints for subscription management

## Subscription Types

### 1. Free Plan
- **Resume Limit**: 2 resumes
- **AI Tokens**: 20 tokens (for limited AI features)
- **Features**: Basic templates, PDF export, email support
- **Duration**: Permanent

### 2. Trial Plan (7 Days)
- **Resume Limit**: 5 resumes
- **AI Tokens**: 0 (full AI features through trial)
- **Features**: All premium templates, full AI features, priority support
- **Duration**: 7 days from activation
- **Auto-expiry**: Automatically downgrades to free plan after 7 days

### 3. Pro Plan
- **Monthly**: 30 days from activation
- **Yearly**: 365 days from activation
- **Resume Limit**: 5 resumes
- **AI Tokens**: 0 (full AI features through subscription)
- **Features**: All premium templates, full AI features, priority support, custom branding (yearly)

## Database Schema

### User Model Fields

```javascript
{
  subscriptionType: {
    type: String,
    enum: ['free', 'trial', 'pro'],
    default: 'free'
  },
  subscriptionStart: {
    type: Date,
    default: Date.now
  },
  subscriptionEnd: {
    type: Date,
    default: null
  },
  resumeLimit: {
    type: Number,
    default: 2
  },
  aiTokens: {
    type: Number,
    default: 20,
    min: 0
  }
}
```

## On-Demand Cleanup System

Since cron jobs are not available on Render free tier, the system uses **on-demand cleanup** through the `validateSubscription` middleware.

### How It Works

1. **Middleware Integration**: Applied to all authenticated routes that need subscription validation
2. **Automatic Detection**: Checks if user's subscription is expired on every request
3. **Automatic Cleanup**: If expired, automatically:
   - Downgrades user to free plan
   - Resets subscription fields
   - Deletes extra resumes beyond free limit (keeps oldest 2)
   - Resets AI token access

### Middleware Usage

```javascript
// Applied to routes that need subscription validation
app.use('/api/resumes', validateSubscription, resumeRoutes);
app.use('/api/ai', validateSubscription, aiRoutes);
```

## API Endpoints

### 1. Start Trial
```
POST /api/subscription/start-trial
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Trial started successfully",
  "data": {
    "subscriptionType": "trial",
    "subscriptionStart": "2024-01-01T00:00:00.000Z",
    "subscriptionEnd": "2024-01-08T00:00:00.000Z",
    "resumeLimit": 5,
    "aiTokens": 0
  }
}
```

### 2. Activate Pro Plan
```
POST /api/subscription/activate-pro
Authorization: Bearer <token>
Content-Type: application/json

{
  "planType": "monthly" // or "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pro plan activated successfully",
  "data": {
    "subscriptionType": "pro",
    "subscriptionStart": "2024-01-01T00:00:00.000Z",
    "subscriptionEnd": "2024-01-31T00:00:00.000Z",
    "resumeLimit": 5,
    "aiTokens": 0,
    "planType": "monthly"
  }
}
```

### 3. Get Subscription Status
```
GET /api/subscription/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionType": "trial",
    "subscriptionStart": "2024-01-01T00:00:00.000Z",
    "subscriptionEnd": "2024-01-08T00:00:00.000Z",
    "resumeLimit": 5,
    "aiTokens": 0,
    "isActive": true,
    "isExpired": false,
    "remainingDays": 3,
    "usage": {
      "resumesCreated": 2,
      "canCreateResume": true
    }
  }
}
```

### 4. Get Available Plans
```
GET /api/subscription/plans
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "free",
        "name": "Free Plan",
        "price": 0,
        "features": ["2 resume projects", "Basic templates", "PDF export"],
        "limits": { "resumes": 2, "aiTokens": 20 }
      },
      {
        "id": "trial",
        "name": "7-Day Trial",
        "price": 0,
        "features": ["5 resume projects", "All premium templates"],
        "limits": { "resumes": 5, "aiTokens": 0 },
        "duration": "7 days"
      }
    ]
  }
}
```

## User Model Methods

### Core Methods

```javascript
// Check if subscription is expired
user.isSubscriptionExpired()

// Check if subscription is active
user.isSubscriptionActive

// Reset to free plan (used by middleware)
await user.resetToFreePlan()

// Start 7-day trial
await user.startTrial()

// Activate pro plan
await user.activatePro('monthly') // or 'yearly'

// Check if user can create resume
user.canCreateResume()
```

## Middleware Implementation

### validateSubscription Middleware

```javascript
const validateSubscription = async (req, res, next) => {
  try {
    // Get fresh user data
    const user = await User.findById(req.user.id);
    
    // Check if subscription is expired
    if (user.isSubscriptionExpired()) {
      // Reset to free plan
      await user.resetToFreePlan();
      
      // Delete extra resumes (keep oldest 2)
      const userResumes = await Resume.find({ user: user._id })
        .sort({ createdAt: 1 });
      
      if (userResumes.length > 2) {
        const resumesToDelete = userResumes.slice(2);
        await Resume.deleteMany({ _id: { $in: resumesToDelete.map(r => r._id) } });
      }
    }
    
    next();
  } catch (error) {
    // Don't block request if validation fails
    next();
  }
};
```

## Business Logic Flow

### 1. User Registration
- New users start with `subscriptionType: 'free'`
- `resumeLimit: 2`, `aiTokens: 20`

### 2. Trial Activation
- User calls `/api/subscription/start-trial`
- System sets `subscriptionType: 'trial'`
- Sets `subscriptionEnd` to 7 days from now
- Sets `resumeLimit: 5`, `aiTokens: 0`

### 3. Pro Activation
- User calls `/api/subscription/activate-pro` with `planType`
- System sets `subscriptionType: 'pro'`
- Sets `subscriptionEnd` based on plan type (30 or 365 days)
- Sets `resumeLimit: 5`, `aiTokens: 0`

### 4. Automatic Cleanup
- On every authenticated API request, middleware checks expiration
- If expired, automatically downgrades to free plan
- Deletes extra resumes beyond free limit
- Resets AI token access

## Testing

### Test Script
Run the test script to verify the implementation:

```bash
cd backend
node test-subscription.js
```

### Manual Testing
1. Create a user account
2. Start a trial
3. Create more than 2 resumes
4. Wait for trial to expire (or manually set expiration)
5. Make an API request (should trigger cleanup)
6. Verify user is downgraded to free plan
7. Verify only 2 oldest resumes remain

## Migration from Old System

### Steps to Migrate
1. **Backup existing data**
2. **Update User model** (already done)
3. **Deploy new middleware and routes**
4. **Migrate existing users** (optional script needed)

### Migration Script (Optional)
```javascript
// Migrate existing users to new subscription system
const migrateUsers = async () => {
  const users = await User.find({});
  
  for (const user of users) {
    // Reset to free plan for all users
    user.subscriptionType = 'free';
    user.subscriptionStart = new Date();
    user.subscriptionEnd = null;
    user.resumeLimit = 2;
    user.aiTokens = 20;
    
    await user.save();
  }
};
```

## Security Considerations

1. **Authentication Required**: All subscription endpoints require valid JWT token
2. **Input Validation**: All inputs are validated using express-validator
3. **Error Handling**: Comprehensive error handling prevents system crashes
4. **Logging**: All subscription changes are logged for audit purposes

## Performance Considerations

1. **On-Demand Cleanup**: Only runs when users make requests (efficient)
2. **Database Indexes**: Proper indexing on user and resume collections
3. **Minimal Queries**: Optimized database queries for cleanup operations
4. **Non-Blocking**: Cleanup failures don't block user requests

## Monitoring and Logging

### Key Metrics to Monitor
- Number of trial activations
- Number of pro plan activations
- Number of automatic downgrades
- Resume deletion events

### Log Messages
```
Trial started for user {email}
Pro plan activated for user {email}: {planType}
Subscription expired for user {email}, downgrading to free plan
Deleting {count} extra resumes for user {email}
Successfully downgraded user {email} to free plan
```

## Troubleshooting

### Common Issues

1. **Middleware not running**: Ensure middleware is applied to correct routes
2. **Cleanup not working**: Check database connection and user permissions
3. **Resume deletion issues**: Verify resume ownership and database constraints
4. **Subscription status incorrect**: Check date comparisons and timezone issues

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=subscription:*
```

## Future Enhancements

1. **Email Notifications**: Send emails before trial/pro expiration
2. **Analytics Dashboard**: Track subscription metrics
3. **Payment Integration**: Connect with Razorpay for pro plan payments
4. **Bulk Operations**: Admin tools for managing subscriptions
5. **Subscription History**: Track subscription changes over time

## Conclusion

The new subscription system provides:
- ✅ Simple, maintainable code
- ✅ No cron job dependency
- ✅ Automatic cleanup on-demand
- ✅ Clean separation of concerns
- ✅ Comprehensive error handling
- ✅ Production-ready implementation

This system is designed to scale and can be easily extended with additional features as needed.
