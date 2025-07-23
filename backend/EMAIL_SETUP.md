# Email Service Setup Guide

## Overview

The Resume Builder backend includes a comprehensive email service that supports:
- Welcome emails for new users
- Password reset emails
- Email verification
- Subscription confirmation/cancellation emails
- Contact form notifications
- Multiple email providers (Gmail, Outlook, Custom SMTP)

## Email Configuration

### 1. Environment Variables

Add these variables to your `.env` file:

```bash
# Basic Email Configuration
EMAIL_SERVICE=gmail                     # gmail, outlook, hotmail, or smtp
EMAIL_USER=your-email@gmail.com        # Your email address
EMAIL_PASS=your-app-password           # App password (NOT your regular password)

# Optional Configuration
EMAIL_FROM_NAME=Resume Builder         # Display name for emails
EMAIL_HOST=smtp.gmail.com             # SMTP host (for custom SMTP)
EMAIL_PORT=587                        # SMTP port (587 for TLS, 465 for SSL)
EMAIL_SECURE=false                    # true for SSL (port 465), false for TLS (port 587)
SUPPORT_EMAIL=support@resumebuilder.com # Support email address
APP_NAME=Resume Builder               # Application name for emails
```

### 2. Provider-Specific Setup

#### Gmail Setup
1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account Settings → Security → App passwords
   - Select "Mail" and generate a password
   - Use this password as `EMAIL_PASS`

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=yourapp@gmail.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # 16-character app password
```

#### Outlook/Hotmail Setup

**For Personal Outlook.com/Hotmail accounts:**
1. **Enable 2-Factor Authentication** on your Microsoft account
2. **Generate App Password**:
   - Go to [Microsoft Account Security](https://account.microsoft.com/security)
   - Sign in to your account
   - Click "Advanced security options"
   - Under "App passwords" section, click "Create a new app password"
   - Give it a name (e.g., "Resume Builder App")
   - Copy the generated password
   - Use this password as `EMAIL_PASS`

```bash
EMAIL_SERVICE=outlook
EMAIL_USER=yourapp@outlook.com
EMAIL_PASS=your-16-character-app-password
```

**For Office 365/Microsoft 365 accounts:**
1. **Enable 2-Factor Authentication** on your Microsoft account
2. **Generate App Password** (if available):
   - Go to [Microsoft 365 Security](https://mysignins.microsoft.com/security-info)
   - Click "Add sign-in method" → "App password"
   - Follow the prompts to create an app password
   - Use this password as `EMAIL_PASS`

```bash
EMAIL_SERVICE=outlook365
EMAIL_USER=yourapp@company.com
EMAIL_PASS=your-app-password
```

**Important Notes for Outlook:**
- Microsoft is gradually phasing out app passwords in favor of OAuth2
- Some organizations may have app passwords disabled by policy
- If app passwords don't work, contact your IT administrator
- For modern authentication, consider using OAuth2 (see Advanced Configuration)

#### Custom SMTP Setup
For other email providers or custom SMTP servers:

```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-smtp-password
```

## Email Templates

The service uses HTML templates located in `backend/templates/`:
- `welcome.html` - Welcome email for new users
- `password-reset.html` - Password reset instructions
- `email-verification.html` - Email verification
- `subscription-confirmation.html` - Subscription confirmation
- `subscription-cancellation.html` - Subscription cancellation
- `contact-form.html` - Contact form notifications

Templates support variables using `{{variableName}}` syntax.

## Testing Email Service

### 1. Test Connection
```bash
GET /api/email-test/connection
Authorization: Bearer <admin-token>
```

### 2. Send Test Email
```bash
POST /api/email-test/send
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "welcome",
  "email": "test@example.com"
}
```

Available test types:
- `welcome`
- `password-reset`
- `email-verification`
- `subscription-confirmation`
- `subscription-cancellation`
- `contact-form`

## API Endpoints

### Email-Related Endpoints

#### Authentication
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/send-verification` - Send email verification
- `POST /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/contact` - Contact form submission

#### Automatic Emails
- **Registration**: Automatic welcome email
- **Subscription**: Automatic confirmation/cancellation emails via webhooks

## Troubleshooting

### Common Issues

#### 1. "Authentication Failed"
- **Gmail**: Ensure 2FA is enabled and you're using an App Password
- **Outlook Personal**: Ensure 2FA is enabled and you're using an App Password
- **Outlook 365**: Try both `outlook` and `outlook365` services. Check if app passwords are enabled by your organization
- **Custom SMTP**: Verify credentials and server settings

#### 1a. Outlook-Specific Authentication Issues
- **"Invalid login"**: Double-check your app password (16 characters, no spaces)
- **"Access denied"**: Your organization may have disabled app passwords. Contact IT support
- **"Connection timeout"**: Try switching from `outlook` to `outlook365` service or vice versa
- **"Security defaults"**: Microsoft Security Defaults may block app passwords. Use OAuth2 instead

#### 2. "Connection Refused"
- Check `EMAIL_HOST` and `EMAIL_PORT` settings
- Verify firewall/network restrictions
- Try different ports (587 for TLS, 465 for SSL)

#### 3. "Email Not Sent"
- Check email service logs in console
- Verify email templates exist in `backend/templates/`
- Test with simple email providers first (Gmail)

#### 4. "Template Not Found"
- Ensure all template files exist in `backend/templates/`
- Check template file names match service calls
- Verify file permissions

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

### Testing Locally

1. **Use Gmail** for initial testing (easier setup)
2. **Test connection** first using the test endpoint
3. **Send test emails** to verify templates work
4. **Check spam folders** for test emails

## Security Considerations

### Email Security
- **Never commit email passwords** to version control
- **Use environment variables** for all sensitive data
- **Use App Passwords** instead of regular passwords
- **Enable 2FA** on email accounts

### Rate Limiting
- Email endpoints have rate limiting enabled
- Prevent abuse with authentication requirements
- Monitor email sending patterns

## Production Deployment

### Recommended Settings
```bash
# Production email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name
SUPPORT_EMAIL=support@yourdomain.com
APP_NAME=Your App Name
```

### Monitoring
- Monitor email delivery rates
- Set up alerts for failed email deliveries
- Track email performance metrics

## Advanced Configuration

### Custom Templates
1. Create new template files in `backend/templates/`
2. Add corresponding methods in `emailService.js`
3. Use template variables with `{{variableName}}`

### Multiple Email Providers
- Configure different providers for different email types
- Implement failover mechanisms
- Use dedicated transactional email services for high volume

### OAuth2 Support for Outlook (Modern Authentication)

For organizations that have disabled app passwords, you can implement OAuth2 authentication. Add this to your `emailService.js`:

```javascript
// OAuth2 configuration for Outlook
case 'outlook-oauth2':
  return {
    service: 'outlook',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      refreshToken: process.env.OUTLOOK_REFRESH_TOKEN,
      accessToken: process.env.OUTLOOK_ACCESS_TOKEN
    }
  };
```

Required environment variables for OAuth2:
```bash
EMAIL_SERVICE=outlook-oauth2
EMAIL_USER=yourapp@company.com
OUTLOOK_CLIENT_ID=your-client-id
OUTLOOK_CLIENT_SECRET=your-client-secret
OUTLOOK_REFRESH_TOKEN=your-refresh-token
OUTLOOK_ACCESS_TOKEN=your-access-token
```

**Note**: OAuth2 setup requires registering your application with Microsoft Azure AD and obtaining the necessary tokens. This is recommended for production environments with strict security requirements.

## Support

For issues with email setup:
1. Check the console logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with the provided test endpoints
4. Ensure email provider settings are correct

## Example Complete Configuration

```bash
# .env file
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@myresumeapp.com
EMAIL_PASS=abcd-efgh-ijkl-mnop
EMAIL_FROM_NAME=My Resume App
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
SUPPORT_EMAIL=support@myresumeapp.com
APP_NAME=My Resume App
CLIENT_URL=https://myresumeapp.com
```

This configuration will enable all email features with professional branding and proper delivery. 