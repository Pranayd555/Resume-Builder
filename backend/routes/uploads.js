const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { protect, chargeAIToken, trackUsage, skipIfBYOK } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');
const { extractResumeText, isSupportedResumeType } = require('../utils/resumeTextExtractor');
const { normalizeParsedResume, heuristicParse } = require('../utils/resumeImport');
const { parseResumeText, resolveGeminiModel, createGoogleGenAI } = require('../services/geminiservice');
const { logSafe } = require('../utils/logSafe');
const { sendAIError } = require('../utils/aiError');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Profile pictures (resume files use resumeUpload below)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
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
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed'
    });
  }

  next(error);
};

// Resume files: PDF or DOCX only. Some browsers send DOCX as octet-stream, so
// the extension is checked too.
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const resumeMimeType = (file) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === DOCX_MIME) return file.mimetype;
  const name = String(file.originalname || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.docx')) return DOCX_MIME;
  return file.mimetype;
};

const resumeUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (isSupportedResumeType(resumeMimeType(file))) return cb(null, true);
    const legacyDoc = file.mimetype === 'application/msword' || String(file.originalname || '').toLowerCase().endsWith('.doc');
    return cb(new Error(legacyDoc
      ? 'Old Word (.doc) files are not supported. Save the file as .docx or PDF and try again.'
      : 'Please upload a PDF or Word (.docx) file.'), false);
  },
});

const receiveResumeFile = (req, res, next) => {
  resumeUpload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) return handleMulterError(err, req, res, next);
    return res.status(400).json({ success: false, error: err.message });
  });
};

// Read the text before any token is charged: an unreadable file costs nothing.
const extractUploadedResume = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  try {
    req.resumeExtract = await extractResumeText(req.file.buffer, resumeMimeType(req.file));
    return next();
  } catch (error) {
    logger.warn(`Resume text extraction failed for user ${logSafe(req.user?.id)}: ${logSafe(error.message)}`);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// No-AI result, so the user still gets contact details and every section's text.
const fallbackImport = (text, links) => normalizeParsedResume(heuristicParse(text, links), { sourceText: text, links, parsedBy: 'fallback' });

const importSummary = (formData, report) => [
  `work=${formData.workExperience.length}`,
  `edu=${formData.education.length}`,
  `skills=${formData.skills.length}`,
  `projects=${formData.projects.length}`,
  `extra=${report.additionalSections.length}`,
  `unplaced=${report.unplacedLines.length}`,
].join(' ');

const parseUploadedResume = async (req, res) => {
  const { text, links } = req.resumeExtract;
  const fileName = req.file.originalname;
  const model = resolveGeminiModel(req);
  const client = createGoogleGenAI(req, res);
  if (!client) return undefined; // response already sent

  let raw;
  try {
    raw = await parseResumeText(text, client, model);
  } catch (error) {
    // success:false refunds the token; the fallback result still fills what it can.
    const fallback = fallbackImport(text, links);
    return sendAIError(res, error, { isOwnApiKey: req.user?.isOwnApiKey, model }, {
      extra: {
        data: { originalText: text, parsedData: fallback.formData, importReport: fallback.report, fileName },
      },
    });
  }

  let result;
  try {
    result = normalizeParsedResume(raw, { sourceText: text, links, parsedBy: 'ai' });
  } catch (error) {
    logger.error('Resume import normalisation failed', { message: error.message });
    result = fallbackImport(text, links);
  }
  req.usageType = 'aiAction';
  logger.info(`Resume parsed for user ${logSafe(req.user.id)}: ${importSummary(result.formData, result.report)}`);
  return res.json({
    success: true,
    data: {
      originalText: text,
      parsedData: result.formData,
      importReport: result.report,
      fileName,
      message: 'Resume text extracted and parsed successfully',
      tokens: req.tokens,
    },
  });
};

// @desc    Upload and parse resume (PDF/DOCX)
// @route   POST /api/uploads/parse-resume
// @access  Private
router.post('/parse-resume', protect, receiveResumeFile, extractUploadedResume, skipIfBYOK(chargeAIToken), trackUsage, async (req, res) => {
  try {
    await parseUploadedResume(req, res);
  } catch (error) {
    logger.error('Resume parsing error', { message: error.message });
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Something went wrong while reading your resume. Please try again.' });
    }
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