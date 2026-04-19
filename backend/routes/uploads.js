const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { protect, checkAIActionLimit, checkTokenLimit, trackUsage, refundTokenOnError, skipIfBYOK } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');
const DocumentParser = require('../utils/documentParser');
const { parseResumeText } = require('../services/geminiservice');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and Word files are allowed!'), false);
    }
  },
});

// Ensure uploads directory exists
const ensureUploadDirs = async () => {
  const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
  const resumeDir = path.join(__dirname, '..', 'uploads', 'resumes');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(resumeDir, { recursive: true });
  } catch (error) {
    logger.error('Failed to create upload directories:', error);
  }
};

// Initialize upload directories
ensureUploadDirs();

// Multer error handler middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'UNEXPECTED_FIELD') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field. Please send the file with field name "file".'
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message || 'File upload error'
    });
  }
  
  if (error.message === 'Only image, PDF, and Word files are allowed!') {
    return res.status(400).json({
      success: false,
      error: 'Only image, PDF, and Word files are allowed'
    });
  }

  next(error);
};

// @desc    Upload and parse resume (PDF/Word)
// @route   POST /api/uploads/parse-resume
// @access  Private
router.post('/parse-resume', [
  protect,
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  }
], trackUsage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { originalname, mimetype, buffer } = req.file;
    logger.info(`Resume upload request: ${originalname} (${mimetype}) by user ${req.user.email}`);

    // Validate file type using DocumentParser
    if (!DocumentParser.isValidDocumentType(mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type. Please upload a PDF or Word document.'
      });
    }

    // Extract text using DocumentParser service
    let extractedText = '';
    try {
      extractedText = await DocumentParser.parseDocument(buffer, mimetype, originalname);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: parseError.message
      });
    }

    // Parse the extracted text using Gemini AI service
    let parsedData = null;
    let aiError = null;
    
    try {
      logger.info('Calling Gemini AI service to parse resume text');
      parsedData = await parseResumeText(extractedText);
      logger.info('Resume text parsed successfully with AI');
      
      // Set usage type for tracking AI action usage
      req.usageType = 'aiAction';
    } catch (error) {
      aiError = error;
      logger.error('AI parsing failed, returning original text only:', error);
      // Continue with original text if AI parsing fails
      // Don't set usageType since AI parsing failed
    }

    // Get current user to include token balance
    const currentUser = await User.findById(req.user.id);
    
    // If AI parsing failed, return error response to trigger token refund
    if (aiError) {
      return res.status(500).json({
        success: false,
        error: 'AI parsing failed. Please try again later.',
        data: {
          originalText: extractedText,
          parsedData: null,
          fileName: originalname,
          message: 'Resume text extracted successfully (AI parsing failed)',
          tokens: req.tokens || 0
        },
      });
    }
    
    res.json({
      success: true,
      data: {
        originalText: extractedText,
        parsedData: parsedData,
        fileName: originalname,
        message: 'Resume text extracted and parsed successfully',
        tokens: req.tokens || 0
      },
    });

  } catch (error) {
    logger.error('Resume parsing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during resume parsing'
    });
  }
});

// @desc    Upload profile picture
// @route   POST /api/uploads/profile-picture
// @access  Private
router.post('/profile-picture', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const timestamp = Date.now();
    const fileExtension = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const baseFileName = `user_${userId}_${timestamp}`;
    
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
    
    // Generate file paths
    const originalPath = path.join(uploadDir, `${baseFileName}${fileExtension}`);
    const thumbnailPath = path.join(uploadDir, `${baseFileName}_thumb${fileExtension}`);
    const avatarPath = path.join(uploadDir, `${baseFileName}_avatar${fileExtension}`);

    // Delete old profile pictures if they exist
    const user = await User.findById(userId);
    if (user.profilePicture?.uploadedPhoto?.originalPath) {
      try {
        await fs.unlink(user.profilePicture.uploadedPhoto.originalPath);
        await fs.unlink(user.profilePicture.uploadedPhoto.thumbnailPath);
        await fs.unlink(user.profilePicture.uploadedPhoto.avatarPath);
      } catch (error) {
        logger.warn('Failed to delete old profile pictures:', error);
      }
    }

    // Process and save images with Sharp
    const sharpInstance = sharp(req.file.buffer);
    
    // Save original (400x400)
    await sharpInstance
      .resize(400, 400, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(originalPath);

    // Save thumbnail (150x150)
    await sharpInstance
      .resize(150, 150, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);

    // Save avatar (50x50)
    await sharpInstance
      .resize(50, 50, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(avatarPath);

    // Generate URLs for frontend
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    // Fallback to request host if CLIENT_URL is not set (e.g., in development)
    const urls = {
      url: `${baseUrl}/uploads/profile-pictures/${baseFileName}${fileExtension}`,
      thumbnailUrl: `${baseUrl}/uploads/profile-pictures/${baseFileName}_thumb${fileExtension}`,
      avatarUrl: `${baseUrl}/uploads/profile-pictures/${baseFileName}_avatar${fileExtension}`
    };

    // Update user profile picture - clear any existing avatar and set uploaded photo
    user.profilePicture = {
      type: 'uploaded',
      avatarUrl: undefined, // Clear any existing avatar URL
      uploadedPhoto: {
        url: urls.url,
        thumbnailUrl: urls.thumbnailUrl,
        avatarUrl: urls.avatarUrl,
        originalPath: originalPath,
        thumbnailPath: thumbnailPath,
        avatarPath: avatarPath,
        fileName: baseFileName
      }
    };
    await user.save();

    logger.info(`Profile picture updated for user: ${user.email}`);

    res.json({
      success: true,
      data: urls
    });
  } catch (error) {
    logger.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Error uploading profile picture'
    });
  }
});

// @desc    Delete profile picture
// @route   DELETE /api/uploads/profile-picture
// @access  Private
router.delete('/profile-picture', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.profilePicture?.uploadedPhoto?.originalPath) {
      return res.status(400).json({
        success: false,
        error: 'No profile picture to delete'
      });
    }

    // Delete files from filesystem
    try {
      await fs.unlink(user.profilePicture.uploadedPhoto.originalPath);
      await fs.unlink(user.profilePicture.uploadedPhoto.thumbnailPath);
      await fs.unlink(user.profilePicture.uploadedPhoto.avatarPath);
    } catch (error) {
      logger.warn('Failed to delete profile picture files:', error);
    }

    // Remove profile picture from user
    user.profilePicture = {
      type: null,
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
    await user.save();

    logger.info(`Profile picture deleted for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    logger.error('Profile picture deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting profile picture'
    });
  }
});

module.exports = router;