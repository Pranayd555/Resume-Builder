const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
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
    if (!this.transporter) {
      logger.error('Email service not initialized');
      throw new Error('Email service not available');
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Resume Builder',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, name, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      const htmlContent = await this.loadTemplate('password-reset', {
        name,
        resetUrl,
        appName: process.env.APP_NAME || 'Resume Builder',
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
    try {
      const htmlContent = await this.loadTemplate('welcome', {
        name,
        appName: process.env.APP_NAME || 'Resume Builder',
        loginUrl: `${process.env.CLIENT_URL}/login`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      await this.sendEmail(
        email,
        'Welcome to Resume Builder!',
        htmlContent
      );
      
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
        appName: process.env.APP_NAME || 'Resume Builder',
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
        appName: process.env.APP_NAME || 'Resume Builder',
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
        appName: process.env.APP_NAME || 'Resume Builder',
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
        appName: process.env.APP_NAME || 'Resume Builder'
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
        appName: process.env.APP_NAME || 'Resume Builder'
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
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService; 