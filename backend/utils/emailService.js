const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = null;
    // Await this promise in sendEmail so OAuth/registration never race ahead of SMTP init
    this._initPromise = this.initialize();
  }

  async initialize() {
    try {
      const config = this.getEmailConfig();
      this.transporter = nodemailer.createTransport(config);

      // Verify connection
      await this.transporter.verify();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      // Don't throw error to prevent app from crashing
      // Email functionality will be disabled
    }
  }

  getEmailConfig() {
    const service = process.env.EMAIL_SERVICE?.toLowerCase();

    switch (service) {
      case 'gmail':
        return {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        };

      case 'outlook':
      case 'hotmail':
        return {
          service: 'hotmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        };

      case 'outlook365':
        return {
          host: 'smtp-mail.outlook.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            ciphers: 'SSLv3'
          }
        };

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

      case 'smtp':
      default:
        return {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        };
    }
  }

  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf-8');

      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key]);
      });

      return template;
    } catch (error) {
      logger.error(`Failed to load email template ${templateName}:`, error);
      throw new Error(`Email template ${templateName} not found`);
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    await this._initPromise;
    if (!this.transporter) {
      logger.error('Email service not initialized');
      return { success: false, error: 'Email service not available' };
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Presmistique - AI Resume Builder',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId, info };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(email, name, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      const htmlContent = await this.loadTemplate('password-reset', {
        name,
        resetUrl,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder',
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      await this.sendEmail(
        email,
        'Password Reset Request',
        htmlContent
      );

      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, name) {
    const displayName =
      (name && String(name).trim()) || (email && email.split('@')[0]) || 'there';
    try {
      const htmlContent = await this.loadTemplate('welcome', {
        name: displayName,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder',
        loginUrl: `${process.env.CLIENT_URL}/login`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      const result = await this.sendEmail(
        email,
        'Welcome to Presmistique - AI Resume Builder!',
        htmlContent
      );

      if (!result || result.success === false) {
        const err = new Error(result?.error || 'Welcome email was not sent');
        logger.error(`Failed to send welcome email to ${email}:`, err.message);
        throw err;
      }

      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  async sendEmailVerification(email, name, verificationToken) {
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
      const htmlContent = await this.loadTemplate('email-verification', {
        name,
        verificationUrl,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder',
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      await this.sendEmail(
        email,
        'Please verify your email address',
        htmlContent
      );

      logger.info(`Email verification sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send email verification to ${email}:`, error);
      throw error;
    }
  }

  async sendSubscriptionConfirmation(email, name, planName, amount) {
    try {
      const htmlContent = await this.loadTemplate('subscription-confirmation', {
        name,
        planName,
        amount,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder',
        accountUrl: `${process.env.CLIENT_URL}/profile`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      await this.sendEmail(
        email,
        `Subscription Confirmed - ${planName}`,
        htmlContent
      );

      logger.info(`Subscription confirmation email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send subscription confirmation email to ${email}:`, error);
      throw error;
    }
  }

  async sendSubscriptionCancellation(email, name, planName) {
    try {
      const htmlContent = await this.loadTemplate('subscription-cancellation', {
        name,
        planName,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder',
        accountUrl: `${process.env.CLIENT_URL}/profile`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      await this.sendEmail(
        email,
        `Subscription Cancelled - ${planName}`,
        htmlContent
      );

      logger.info(`Subscription cancellation email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send subscription cancellation email to ${email}:`, error);
      throw error;
    }
  }

  async sendContactFormEmail(fromEmail, fromName, subject, message) {
    try {
      const htmlContent = await this.loadTemplate('contact-form', {
        fromName,
        fromEmail,
        subject,
        message,
        timestamp: new Date().toLocaleString(),
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder'
      });

      await this.sendEmail(
        process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
        `Contact Form: ${subject}`,
        htmlContent
      );

      logger.info(`Contact form email sent from ${fromEmail}`);
    } catch (error) {
      logger.error(`Failed to send contact form email from ${fromEmail}:`, error);
      throw error;
    }
  }

  async sendFeedbackNotification(feedbackData) {
    try {
      const { name, email, subject, message, rating, ipAddress, _id } = feedbackData;

      // Generate star rating display
      const filledStars = '★'.repeat(rating);
      const emptyStars = '☆'.repeat(5 - rating);
      const ratingStars = filledStars + emptyStars;

      // Determine priority class based on rating
      let priorityClass = 'priority-low';
      if (rating <= 2) {
        priorityClass = 'priority-high';
      } else if (rating <= 3) {
        priorityClass = 'priority-medium';
      }

      const htmlContent = await this.loadTemplate('feedback-notification', {
        name,
        email,
        subject,
        message,
        rating,
        ratingStars,
        timestamp: new Date().toLocaleString(),
        ipAddress: ipAddress || 'N/A',
        feedbackId: _id?.toString() || 'N/A',
        priorityClass,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder'
      });

      const notificationEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

      await this.sendEmail(
        notificationEmail,
        `New Feedback: ${subject} (${rating}★)`,
        htmlContent
      );

      logger.info(`Feedback notification email sent for feedback from ${email}`);
    } catch (error) {
      logger.error(`Failed to send feedback notification email:`, error);
      throw error;
    }
  }

  // Contact form email methods
  async sendContactNotification({ contactId, name, email, subject, message, category, createdAt }) {
    try {
      const htmlContent = await this.loadTemplate('contact-notification', {
        contactId,
        name,
        email,
        subject,
        message,
        category: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
        createdAt: new Date(createdAt).toLocaleString(),
        adminUrl: `${process.env.CLIENT_URL}/admin/contacts/${contactId}`
      });

      const notificationEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

      await this.sendEmail(
        notificationEmail,
        `New Contact Form Submission: ${subject}`,
        htmlContent
      );

      logger.info(`Contact notification email sent for contact from ${email}`);
    } catch (error) {
      logger.error(`Failed to send contact notification email:`, error);
      throw error;
    }
  }

  async sendContactAutoReply({ name, email, subject, category }) {
    try {
      const htmlContent = await this.loadTemplate('contact-auto-reply', {
        name,
        subject,
        category: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
        websiteUrl: process.env.CLIENT_URL
      });

      await this.sendEmail(
        email,
        'We received your message - Presmistique - AI Resume Builder',
        htmlContent
      );

      logger.info(`Contact auto-reply sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send contact auto-reply:`, error);
      throw error;
    }
  }

  async sendContactResponse({ name, email, subject, response, adminName }) {
    try {
      const htmlContent = await this.loadTemplate('contact-response', {
        name,
        subject,
        response,
        adminName,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
        websiteUrl: process.env.CLIENT_URL
      });

      await this.sendEmail(
        email,
        `Re: ${subject}`,
        htmlContent
      );

      logger.info(`Contact response sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send contact response:`, error);
      throw error;
    }
  }

  async sendErrorNotification({ type, userEmail, userId, error, requestData, timestamp }) {
    try {
      // Check if email service is initialized
      if (!this.transporter) {
        logger.error('Email service not initialized - cannot send error notification');
        return { success: false, error: 'Email service not initialized' };
      }

      const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

      // Validate email addresses
      if (!adminEmail) {
        logger.error('No admin email configured - cannot send error notification');
        return { success: false, error: 'No admin email configured' };
      }

      logger.info(`Attempting to send error notification to: ${adminEmail}`);

      const errorDetails = {
        type,
        userEmail,
        userId,
        error: error.message || error,
        requestData,
        timestamp: timestamp || new Date(),
        serverTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
            🚨 Payment Processing Error
          </h2>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">Error Type: ${type}</h3>
            <p style="color: #721c24; margin-bottom: 0;"><strong>Error Message:</strong> ${error}</p>
          </div>
          
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">User Information</h3>
            <p><strong>User Email:</strong> ${userEmail}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
          </div>
          
          <div style="background-color: #e2e3e5; border: 1px solid #d6d8db; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #383d41; margin-top: 0;">Request Data</h3>
            <pre style="background-color: #ffffff; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px;">${JSON.stringify(requestData, null, 2)}</pre>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">Action Required</h3>
            <p style="color: #0c5460; margin-bottom: 0;">
              Please manually verify the payment and add tokens to the user account if payment was successful.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px;">
              This is an automated error notification from Presmistique - AI Resume Builder System
            </p>
          </div>
        </div>
      `;

      const emailResult = await this.sendEmail(
        adminEmail,
        `🚨 Payment Error: ${type} - ${userEmail}`,
        htmlContent
      );

      if (emailResult.success) {
        logger.info(`Error notification sent successfully to admin for ${type} - User: ${userEmail}`);
        return { success: true, message: 'Error notification sent successfully' };
      } else {
        logger.error(`Failed to send error notification: ${emailResult.error}`);
        return { success: false, error: emailResult.error };
      }
    } catch (emailError) {
      logger.error(`Failed to send error notification email:`, emailError);
      return { success: false, error: emailError.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '');
  }

  // Test email connection
  async testConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      await this.transporter.verify();
      return { success: true, message: 'Email service is working' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Send resume deletion notification
  async sendResumeDeletionNotification({ userEmail, userName, deletedResumes, totalDeleted }) {
    try {
      const upgradeUrl = `${process.env.CLIENT_URL}/subscription`;
      const htmlContent = await this.loadTemplate('resume-deletion-notification', {
        userName,
        totalDeleted,
        deletedResumes,
        upgradeUrl,
        year: new Date().getFullYear()
      });

      const textContent = `
Hello ${userName},

We're writing to inform you that ${totalDeleted} resume(s) have been automatically deleted from your account due to subscription expiration.

Your subscription has expired, and you're now on the free plan which allows only 2 resumes. We kept your most important resumes and removed the excess ones after a 2-day grace period.

Deleted Resumes:
${deletedResumes.map(r => `- ${r.title} (${r.status})`).join('\n')}

Want to restore your resumes? Simply upgrade your subscription and we'll restore all your deleted resumes automatically!

Upgrade now: ${upgradeUrl}

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
Resume Builder Team
      `;

      return await this.sendEmail(
        userEmail,
        'Resume Deletion Notification - Action Required',
        htmlContent,
        textContent
      );
    } catch (error) {
      logger.error('Failed to send resume deletion notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send cron job notification
  async sendCronJobNotification({ jobName, status, details = null, error = null }) {
    try {
      const htmlContent = await this.loadTemplate('cron-notification', {
        jobName,
        status,
        details: details ? JSON.stringify(details, null, 2) : 'N/A',
        error: error ? JSON.stringify(error, null, 2) : 'N/A',
        timestamp: new Date().toLocaleString(),
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder'
      });

      const notificationEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

      if (!notificationEmail) {
        logger.warn(`No admin/support email configured for cron job notification for ${jobName}. Skipping.`);
        return { success: false, error: 'No notification email configured' };
      }

      await this.sendEmail(
        notificationEmail,
        `Cron Job Status: ${jobName} - ${status}`,
        htmlContent
      );

      logger.info(`Cron job notification sent for ${jobName} with status ${status}`);
      return { success: true, message: 'Cron job notification sent' };
    } catch (err) {
      logger.error(`Failed to send cron job notification for ${jobName}:`, err);
      return { success: false, error: err.message };
    }
  }

  // Send payment invoice email
  async sendPaymentInvoice({
    email,
    name,
    transactionId,
    paymentId,
    amount,
    tokensAdded,
    paymentMethod = 'Razorpay',
    paymentDate = null
  }) {
    try {
      const formattedDate = paymentDate || new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const htmlContent = await this.loadTemplate('payment-invoice', {
        name,
        transactionId,
        paymentId,
        amount: amount.toLocaleString('en-IN'),
        tokensAdded: tokensAdded.toLocaleString('en-IN'),
        paymentMethod,
        paymentDate: formattedDate,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder',
        dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      const textContent = `
Hello ${name},

Thank you for your purchase! Your payment has been processed successfully.

PAYMENT DETAILS:
- Transaction ID: ${transactionId}
- Payment ID: ${paymentId}
- Amount Paid: ₹${amount.toLocaleString('en-IN')}
- Payment Method: ${paymentMethod}
- Date & Time: ${formattedDate}
- Status: ✅ Completed

TOKENS ADDED:
🎉 ${tokensAdded.toLocaleString('en-IN')} AI Tokens have been added to your account!

You can now use these tokens for AI-powered resume features like:
- Resume parsing and auto-population
- Content enhancement and optimization
- ATS score analysis
- Professional tone adjustment

Next Steps:
1. Your tokens are now available in your account
2. Use AI features from your dashboard
3. Each AI action typically costs 1 token
4. Purchase more tokens anytime from your dashboard

Dashboard: ${process.env.CLIENT_URL}/dashboard

Need Help?
If you have any questions about your purchase or need assistance with AI features, 
please contact our support team at ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}

Thank you for choosing ${process.env.APP_NAME || 'Presmistique - AI Resume Builder'}!

Best regards,
The Presmistique - AI Resume Builder Team
      `;

      await this.sendEmail(
        email,
        `Payment Successful - ${tokensAdded} AI Tokens Added`,
        htmlContent,
        textContent
      );

      logger.info(`Payment invoice sent to ${email} for transaction ${transactionId}`);
      return { success: true, message: 'Payment invoice sent successfully' };
    } catch (error) {
      logger.error(`Failed to send payment invoice to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send refund request confirmation email
   * @param {Object} params - Email parameters
   * @returns {Promise<Object>} - Result object
   */
  async sendRefundRequestEmail({ email, name, transactionId, orderId, amount, reason, requestDate }) {
    try {
      const htmlContent = await this.loadTemplate('refund-request-confirmation', {
        name,
        transactionId,
        orderId,
        amount: amount.toLocaleString('en-IN'),
        reason,
        requestDate,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder',
        dashboardUrl: `${process.env.CLIENT_URL}/analytics`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      const textContent = `
Hello ${name},

We've received your refund request for Transaction ID: ${transactionId}. Our team will review it shortly.

REFUND REQUEST DETAILS:
- Transaction ID: ${transactionId}
- Order ID: ${orderId}
- Refund Amount: ₹${amount.toLocaleString('en-IN')}
- Reason: ${reason}
- Request Date: ${requestDate}
- Status: ⏳ Under Review

PROCESSING TIMELINE:
We will process your refund within 3-5 business days. You will receive an email confirmation once the refund is processed.

WHAT HAPPENS NEXT:
1. Our team will review your refund request
2. If approved, the refund will be processed to your original payment method
3. You will receive an email confirmation when the refund is completed
4. The refunded amount will appear in your account within 5-7 business days

Questions? Contact our support team anytime at ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}

Thank you for your patience!

Best regards,
The ${process.env.APP_NAME || 'Presmistique - AI Resume Builder'} Team
      `;

      await this.sendEmail(
        email,
        'Refund Request Submitted - Presmistique - AI Resume Builder',
        htmlContent,
        textContent
      );

      logger.info(`Refund request confirmation email sent to ${email} for transaction ${transactionId}`);
      return { success: true, message: 'Refund request confirmation email sent successfully' };
    } catch (error) {
      logger.error(`Failed to send refund request confirmation email to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send refund completion email
   * @param {Object} params - Email parameters
   * @returns {Promise<Object>} - Result object
   */
  async sendRefundCompletionEmail({ email, name, transactionId, orderId, refundAmount, refundId, processedDate }) {
    try {
      const htmlContent = await this.loadTemplate('refund-completion', {
        name,
        transactionId,
        orderId,
        refundAmount: refundAmount.toLocaleString('en-IN'),
        refundId,
        processedDate,
        appName: process.env.APP_NAME || 'Presmistique - AI Resume Builder',
        dashboardUrl: `${process.env.CLIENT_URL}/analytics`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      const textContent = `
Hello ${name},

Your refund has been successfully processed!

REFUND DETAILS:
- Transaction ID: ${transactionId}
- Order ID: ${orderId}
- Refund Amount: ₹${refundAmount.toLocaleString('en-IN')}
- Refund ID: ${refundId}
- Processed Date: ${processedDate}

The refund amount will be credited to your original payment method within 5-7 business days. You will receive a confirmation from your bank/card provider once the amount is credited.

If you have any questions about this refund, please contact our support team at ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}

Thank you for using ${process.env.APP_NAME || 'Presmistique - AI Resume Builder'}!

Best regards,
The ${process.env.APP_NAME || 'Presmistique - AI Resume Builder'} Team
      `;

      await this.sendEmail(
        email,
        'Refund Processed Successfully - Presmistique - AI Resume Builder',
        htmlContent,
        textContent
      );

      logger.info(`Refund completion email sent to ${email} for transaction ${transactionId}`);
      return { success: true, message: 'Refund completion email sent successfully' };
    } catch (error) {
      logger.error(`Failed to send refund completion email to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send refund rejection email
   * @param {Object} params - Email parameters
   * @returns {Promise<Object>} - Result object
   */
  async sendRefundRejectionEmail({ email, name, transactionId, orderId, amount, rejectionReason, rejectedDate }) {
    try {
      const htmlContent = await this.loadTemplate('refund-rejection', {
        name,
        transactionId,
        orderId,
        amount: amount.toLocaleString('en-IN'),
        rejectionReason: rejectionReason || 'No specific reason provided',
        rejectedDate,
        appName: process.env.APP_NAME || 'Resume Builder',
        dashboardUrl: `${process.env.CLIENT_URL}/analytics`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      const textContent = `
Hello ${name},

We regret to inform you that your refund request has been declined.

REFUND REQUEST DETAILS:
- Transaction ID: ${transactionId}
- Order ID: ${orderId}
- Amount: ₹${amount.toLocaleString('en-IN')}
- Rejected Date: ${rejectedDate}

REASON FOR REJECTION:
${rejectionReason || 'No specific reason provided'}

If you believe this decision was made in error or would like to discuss this further, please contact our support team at ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER} with your transaction details.

We appreciate your understanding.

Best regards,
The ${process.env.APP_NAME || 'Resume Builder'} Team
      `;

      await this.sendEmail(
        email,
        'Refund Request Declined - Resume Builder',
        htmlContent,
        textContent
      );

      logger.info(`Refund rejection email sent to ${email} for transaction ${transactionId}`);
      return { success: true, message: 'Refund rejection email sent successfully' };
    } catch (error) {
      logger.error(`Failed to send refund rejection email to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bonus tokens email notification
   * @param {Object} params - Email parameters
   * @returns {Promise<Object>} - Result object
   */
  async sendBonusTokensEmail({ email, name, tokensAdded, newTokenBalance, givenBy, reason, dateAdded }) {
    try {
      const htmlContent = await this.loadTemplate('bonus-tokens', {
        name,
        tokensAdded: tokensAdded.toLocaleString('en-IN'),
        newTokenBalance: newTokenBalance.toLocaleString('en-IN'),
        givenBy,
        reason: reason || '',
        reasonDisplay: reason ? 'block' : 'none',
        dateAdded,
        appName: process.env.APP_NAME || 'Resume Builder',
        dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
        supportUrl: `${process.env.CLIENT_URL}/contact`,
        year: new Date().getFullYear()
      });

      const textContent = `
Hello ${name},

Great news! 🎉 You've received bonus tokens in your account!

BONUS DETAILS:
- Tokens Added: ${tokensAdded.toLocaleString('en-IN')} AI Tokens
- New Total Balance: ${newTokenBalance.toLocaleString('en-IN')} Tokens
- Given By: ${givenBy}
- Date Added: ${dateAdded}${reason ? `
- Reason: ${reason}` : ''}

What can you do with these bonus tokens?
- Generate AI-powered resume content
- Parse and analyze existing resumes
- Get ATS compatibility scores
- Enhance your resume with professional suggestions

Your bonus tokens are now ready to use! Head over to your dashboard to start leveraging AI features.

Dashboard: ${process.env.CLIENT_URL}/dashboard

Questions? Contact our support team anytime.

Thank you for being an awesome user!

Best regards,
The ${process.env.APP_NAME || 'Resume Builder'} Team
      `;

      await this.sendEmail(
        email,
        `🎉 ${tokensAdded} Bonus AI Tokens Added to Your Account!`,
        htmlContent,
        textContent
      );

      logger.info(`Bonus tokens email sent to ${email} for ${tokensAdded} tokens`);
      return { success: true, message: 'Bonus tokens email sent successfully' };
    } catch (error) {
      logger.error(`Failed to send bonus tokens email to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send refund not eligible email notification
   * @param {Object} params - Email parameters
   * @returns {Promise<Object>} - Result object
   */
  async sendRefundNotEligibleEmail({ email, name, transactionId, orderId, amountPaid, refundReason, boughtTokens, bonusTokensAdded, currentTokenBalance, totalAvailable }) {
    try {
      const requestDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const htmlContent = await this.loadTemplate('refund-not-eligible', {
        name,
        transactionId,
        orderId,
        amountPaid: (amountPaid / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        requestDate,
        refundReason,
        boughtTokens,
        bonusTokensAdded,
        currentTokenBalance,
        totalAvailable,
        appName: process.env.APP_NAME || 'Resume Builder',
        dashboardUrl: `${process.env.CLIENT_URL}/analytics`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      const textContent = `
Hello ${name},

Thank you for contacting us regarding your refund request. After reviewing your account and token usage, we regret to inform you that your refund request cannot be processed under our current refund policy.

REQUEST SUMMARY:
- Transaction ID: ${transactionId}
- Order ID: ${orderId}
- Amount Paid: ₹${(amountPaid / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Request Date: ${requestDate}

WHY YOUR REFUND CANNOT BE PROCESSED:
${refundReason}

TOKEN USAGE BREAKDOWN:
- Tokens Purchased: ${boughtTokens} tokens
- Bonus Tokens Provided: ${bonusTokensAdded} tokens
- Current Token Balance: ${currentTokenBalance} tokens
- Total Available Now: ${totalAvailable} tokens (Below threshold)

OUR REFUND POLICY:
1. Full Refund: Available when purchased tokens remain completely unused
2. Partial Refund: Available when sufficient tokens remain unused (calculated based on usage)
3. No Refund: When tokens have been used beyond the refundable threshold (less than 1 token equivalent value remaining)
4. Bonus Tokens: Bonus tokens count towards the refund eligibility calculation
5. Time Limit: Refund requests must be made within 7 days of purchase

QUESTIONS?
If you believe this decision was made in error or have any questions about our refund policy, please contact our support team at ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER} with your transaction details.

You can continue using your purchased tokens for all AI features on ${process.env.APP_NAME || 'Resume Builder'}.

Best regards,
The ${process.env.APP_NAME || 'Resume Builder'} Team
      `;

      await this.sendEmail(
        email,
        'Refund Request - Not Eligible',
        htmlContent,
        textContent
      );

      logger.info(`Refund not eligible email sent to ${email} for transaction ${transactionId}`);
      return { success: true, message: 'Refund not eligible notification email sent successfully' };
    } catch (error) {
      logger.error(`Failed to send refund not eligible email to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetOtp(email, name, otp) {
    try {
      const html = await this.loadTemplate('forgot-password-template', {
        name,
        otp,
        appName: process.env.APP_NAME || 'Resume Builder',
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
        year: new Date().getFullYear()
      });

      await this.sendEmail(
        email,
        'Password Reset OTP',
        html
      );
      logger.info(`Password reset OTP email sent to ${email}`);
    } catch (error) {
      logger.error(`Error sending password reset OTP email to ${email}:`, error);
      throw new Error('Failed to send password reset OTP email');
    }
  }
}

module.exports = new EmailService();