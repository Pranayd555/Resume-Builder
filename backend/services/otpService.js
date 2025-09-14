const emailService = require('../utils/emailService');
const logger = require('../utils/logger');

class OtpService {
  /**
   * Send OTP via email
   * @param {string} email - User's email address
   * @param {string} otp - The OTP code
   * @param {string} type - Type of OTP (registration, email-change)
   * @param {string} name - User's name (optional)
   */
  static async sendOtpEmail(email, otp, type = 'registration', name = null) {
    try {
      let subject, template;
      
      switch (type) {
        case 'registration':
          subject = 'Verify Your Email - Resume Builder';
          template = 'email-verification-otp';
          break;
        case 'email-change':
          subject = 'Verify Your New Email - Resume Builder';
          template = 'email-change-otp';
          break;
        default:
          subject = 'Email Verification Code - Resume Builder';
          template = 'email-verification-otp';
      }

      const htmlContent = await emailService.loadTemplate(template, {
        name: name || 'User',
        otp,
        type,
        expiryMinutes: 10,
        appName: process.env.APP_NAME || 'Resume Builder',
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
      });

      await emailService.sendEmail(email, subject, htmlContent);

      logger.info(`OTP email sent to ${email} for ${type}`);
      return true;
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Generate a 6-digit OTP
   * @returns {string} - 6-digit OTP
   */
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Check if OTP is valid format
   * @param {string} otp - OTP to validate
   * @returns {boolean} - True if valid format
   */
  static isValidOtpFormat(otp) {
    return /^\d{6}$/.test(otp);
  }

  /**
   * Check if OTP has expired
   * @param {Date} expiryDate - OTP expiry date
   * @returns {boolean} - True if expired
   */
  static isOtpExpired(expiryDate) {
    return Date.now() > expiryDate.getTime();
  }
}

module.exports = OtpService;
