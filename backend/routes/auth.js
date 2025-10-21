const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');
const { calculateTotalTokens } = require('../utils/tokenCalculator');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  authLimiter,
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create user (unverified by default)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      isEmailVerified: false
    });

    // Generate OTP for email verification
    const otp = user.generateEmailOtp();
    await user.save();

    // Create default subscription
    const subscription = new Subscription({
      user: user._id,
      plan: 'free'
    });

    await subscription.save();

    // Send OTP email (non-blocking)
    try {
      const OtpService = require('../services/otpService');
      await OtpService.sendOtpEmail(email, otp, 'registration', `${firstName} ${lastName}`);
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError);
      // Don't block registration if email fails
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Remove password and sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailOtp;
    delete userResponse.emailOtpExpire;

    logger.info(`New user registered: ${email} (unverified)`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      data: {
        user: userResponse,
        token,
        requiresEmailVerification: true
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  loginLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // If user has no local password (e.g., registered via OAuth), always fail local auth
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: 'Account temporarily locked due to too many failed login attempts. Please try again in 10 minutes.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account has been deactivated'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update login statistics
    user.usage.loginCount += 1;
    user.usage.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Private
router.post('/verify-email', [
  protect,
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Verify OTP
    const isValidOtp = user.verifyEmailOtp(otp);
    
    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    await user.save();

    // Send welcome email after successful verification
    try {
      await emailService.sendWelcomeEmail(user.email, user.fullName);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Don't block verification if welcome email fails
    }

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during email verification'
    });
  }
});

// @desc    Resend OTP for email verification
// @route   POST /api/auth/resend-otp
// @access  Private
router.post('/resend-otp', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Check if OTP was sent recently (prevent spam)
    if (user.emailOtpExpire && Date.now() < user.emailOtpExpire.getTime() - 1 * 60 * 1000) {
      return res.status(429).json({
        success: false,
        error: 'Please wait before requesting a new OTP. You can request a new one in 1 minute.'
      });
    }

    // Generate new OTP
    const otp = user.generateEmailOtp();
    await user.save();

    // Send OTP email
    try {
      const OtpService = require('../services/otpService');
      await OtpService.sendOtpEmail(user.email, otp, 'registration', user.fullName);
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again.'
      });
    }

    logger.info(`OTP resent for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Verification code sent to your email address.'
    });
  } catch (error) {
    logger.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while resending verification code'
    });
  }
});

// @desc    Check email verification status
// @route   GET /api/auth/email-status
// @access  Private
router.get('/email-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email isEmailVerified emailOtpExpire');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        hasPendingOtp: !!(user.emailOtpExpire && user.emailOtpExpire > new Date())
      }
    });
  } catch (error) {
    logger.error('Email status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking email status'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let subscription = await Subscription.findOne({ user: req.user.id });

    // Apply same subscription processing logic as /current endpoint
    if (!subscription) {
      // Create default free subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active'
      });
      await subscription.save();
    } else {
      // Check if trial has expired and update if necessary
      if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
        await subscription.expireTrial();
        // Refresh the subscription data after expiration
        subscription = await Subscription.findOne({ user: req.user.id });
      }
      
      // Recalculate actual resume count since subscription started
      await subscription.recalculateResumeCount();
    }
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          totalTokenBalance: tokenData.totalTokenBalance,
          purchasedTokens: tokenData.purchasedTokens,
          remainingFreeTokens: tokenData.remainingFreeTokens,
          subscription
        }
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', [
  protect,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('profilePicture').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty values for clearing profile picture
    }
    
    // Check if it's a localhost URL
    if (value.includes('localhost') || value.includes('127.0.0.1')) {
      // For localhost URLs, just check if it has a valid URL structure
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (error) {
        return false;
      }
    }
    
    // For non-localhost URLs, use the validator
    return validator.isURL(value);
  }).withMessage('Profile picture must be a valid URL or empty to clear'),
  body('profilePictureType').optional().isIn(['uploaded', 'avatar']).withMessage('Profile picture type must be either "uploaded" or "avatar"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, location, bio, profilePicture, profilePictureType } = req.body;

    const user = await User.findById(req.user.id);

    // Update basic profile fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    
    // Handle email update with validation
    if (email !== undefined) {
      // Check if email is different from current email
      if (email !== user.email) {
        // Check if new email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'Email already exists. Please use a different email address.'
          });
        }
        
        // Update email and require re-verification
        user.email = email;
        user.isEmailVerified = false;
        
        // Clear any existing email verification tokens and OTP
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        user.emailOtp = undefined;
        user.emailOtpExpire = undefined;
        
        logger.info(`Email changed for user ${user._id}: ${user.email} -> ${email} (unverified)`);
      }
    }

    // Handle profile picture updates
    if (profilePicture !== undefined) {
      if (profilePictureType === 'avatar') {
        // Clear any existing uploaded photo and set avatar URL
        if (user.profilePicture?.uploadedPhoto?.originalPath) {
          // Delete old uploaded files
          try {
            const fs = require('fs').promises;
            await fs.unlink(user.profilePicture.uploadedPhoto.originalPath);
            await fs.unlink(user.profilePicture.uploadedPhoto.thumbnailPath);
            await fs.unlink(user.profilePicture.uploadedPhoto.avatarPath);
          } catch (error) {
            logger.warn('Failed to delete old uploaded files:', error);
          }
        }
        
        user.profilePicture = {
          type: 'avatar',
          avatarUrl: profilePicture,
          uploadedPhoto: {
            url: undefined,
            thumbnailUrl: undefined,
            avatarUrl: undefined,
            originalPath: undefined,
            thumbnailPath: undefined,
            avatarPath: undefined,
            fileName: undefined
          }
        };
      } else if (profilePictureType === 'uploaded') {
        // This case is handled by the upload route
        // Just clear any existing avatar
        user.profilePicture = {
          type: 'uploaded',
          avatarUrl: undefined,
          uploadedPhoto: user.profilePicture?.uploadedPhoto || {}
        };
      } else if (profilePicture === '' || profilePicture === null || profilePictureType === null) {
        // Clear profile picture completely
        if (user.profilePicture?.uploadedPhoto?.originalPath) {
          // Delete old uploaded files
          try {
            const fs = require('fs').promises;
            await fs.unlink(user.profilePicture.uploadedPhoto.originalPath);
            await fs.unlink(user.profilePicture.uploadedPhoto.thumbnailPath);
            await fs.unlink(user.profilePicture.uploadedPhoto.avatarPath);
          } catch (error) {
            logger.warn('Failed to delete old uploaded files:', error);
          }
        }
        
        user.profilePicture = {
          type: undefined,
          avatarUrl: undefined,
          uploadedPhoto: {
            url: undefined,
            thumbnailUrl: undefined,
            avatarUrl: undefined,
            originalPath: undefined,
            thumbnailPath: undefined,
            avatarPath: undefined,
            fileName: undefined
          }
        };
      }
    }

    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailOtp;
    delete userResponse.emailOtpExpire;

    res.json({
      success: true,
      message: email !== undefined && email !== user.email ? 
        'Profile updated! Please verify your new email address.' : 
        'Profile updated successfully!',
      data: {
        user: userResponse,
        requiresEmailVerification: email !== undefined && email !== user.email
      }
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during profile update'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', [
  protect,
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password change'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  authLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, `${user.firstName} ${user.lastName}`, resetToken);
      logger.info(`Password reset email sent to ${email}`);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      // Reset the token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        error: 'Email could not be sent. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
router.post('/send-verification', [
  protect,
  authLimiter
], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    try {
      await emailService.sendEmailVerification(user.email, `${user.firstName} ${user.lastName}`, verificationToken);
      logger.info(`Email verification sent to ${user.email}`);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Reset the token fields if email fails
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        error: 'Email could not be sent. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    logger.error('Send verification email error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email/:token
// @access  Public
router.post('/verify-email/:token', [
  authLimiter
], async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during email verification'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', [
  authLimiter,
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { password } = req.body;
    const { token } = req.params;

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    logger.info(`Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password reset'
    });
  }
});

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = user.getSignedJwtToken();

      // Redirect to frontend with token
      // Handle multiple CLIENT_URLs if needed
      let clientUrl = process.env.CLIENT_URL;
      
      // Fallback to production URL if CLIENT_URL is not set
      if (!clientUrl) {
        clientUrl = 'https://resume-builder-pranay-das-projects.vercel.app';
      }
      
      const redirectUrl = `${clientUrl}/auth/callback?token=${token}`;
      
      // Debug logging
      logger.info(`Google OAuth redirect - Original CLIENT_URL: ${process.env.CLIENT_URL}`);
      logger.info(`Google OAuth redirect - Using URL: ${clientUrl}`);
      logger.info(`Google OAuth redirect - Full URL: ${redirectUrl}`);
      
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
    }
  }
);

// @desc    LinkedIn OAuth
// @route   GET /api/auth/linkedin
// @access  Public
router.get('/linkedin', passport.authenticate('linkedin'));

// @desc    LinkedIn OAuth callback
// @route   GET /api/auth/linkedin/callback
// @access  Public
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = user.getSignedJwtToken();

      // Redirect to frontend with token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('LinkedIn OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
    }
  }
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // For JWT, we don't need to do anything server-side
    // The client should remove the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
});

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    // Delete user's subscription
    await Subscription.findOneAndDelete({ user: req.user.id });

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    logger.info(`Account deleted for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during account deletion'
    });
  }
});

// @desc    Contact form submission
// @route   POST /api/auth/contact
// @access  Public
router.post('/contact', [
  authLimiter,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Send contact form email
    try {
      await emailService.sendContactFormEmail(email, name, subject, message);
      logger.info(`Contact form submitted by ${email}`);
    } catch (emailError) {
      logger.error('Failed to send contact form email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Your message could not be sent. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!'
    });
  } catch (error) {
    logger.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 