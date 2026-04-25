const express = require('express');
const { protect, checkTokenLimit, trackUsage, refundTokenOnError, skipIfBYOK, checkAIActionLimit } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { parseResumeText, parsePortfolioText } = require('../services/geminiservice');
const DocumentParser = require('../utils/documentParser');
const logger = require('../utils/logger');
const { sendAIError } = require('../utils/aiError');
const { validationResult } = require('express-validator');

const router = express.Router();

// Middleware to check portfolio ownership
const checkPortfolioOwnership = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    if (portfolio.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this portfolio'
      });
    }

    req.portfolio = portfolio;
    next();
  } catch (error) {
    logger.error('Portfolio ownership check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// @desc    Get user's portfolio
// @route   GET /api/portfolios
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id })
      .populate('resumeUsed', 'title personalInfo');

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found. Please create one.',
        data: null
      });
    }

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    logger.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @desc    Get portfolio by ID
// @route   GET /api/portfolios/:id
// @access  Private
router.get('/:id', protect, checkPortfolioOwnership, async (req, res) => {
  res.json({
    success: true,
    data: req.portfolio
  });
});

// @desc    Create new portfolio
// @route   POST /api/portfolios
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Check if user already has a portfolio
    const existingPortfolio = await Portfolio.findOne({ user: req.user.id });
    if (existingPortfolio) {
      return res.status(400).json({
        success: false,
        error: 'You already have a portfolio. Use update to modify it.'
      });
    }

    const {
      title,
      personalInfo,
      summary,
      workExperience,
      projects,
      skills,
      certifications,
      languages,
      customSections,
      template,
      customization,
      resumeUsed
    } = req.body;

    // Validate required fields
    if (!title || !personalInfo || !personalInfo.fullName || !personalInfo.email) {
      return res.status(400).json({
        success: false,
        error: 'Title, full name, and email are required'
      });
    }

    // Create new portfolio
    const portfolio = new Portfolio({
      user: req.user.id,
      title,
      personalInfo,
      summary,
      workExperience: workExperience || [],
      projects: projects || [],
      skills: skills || [],
      certifications: certifications || [],
      languages: languages || [],
      customSections: customSections || [],
      template: template || 'modern-interactive',
      customization: customization || {},
      resumeUsed: resumeUsed || null,
      status: 'draft'
    });

    await portfolio.save();
    await portfolio.populate('resumeUsed', 'title personalInfo');

    res.status(201).json({
      success: true,
      data: portfolio,
      message: 'Portfolio created successfully'
    });
  } catch (error) {
    logger.error('Create portfolio error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @desc    Update portfolio
// @route   PUT /api/portfolios/:id
// @access  Private
router.put('/:id', protect, checkPortfolioOwnership, async (req, res) => {
  try {
    const allowedFields = [
      'title',
      'personalInfo',
      'summary',
      'workExperience',
      'projects',
      'skills',
      'certifications',
      'languages',
      'customSections',
      'template',
      'customization'
    ];

    // Update allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'personalInfo' && typeof req.body.personalInfo === 'object') {
          Object.assign(req.portfolio.personalInfo, req.body.personalInfo);
        } else {
          req.portfolio[field] = req.body[field];
        }
      }
    });

    req.portfolio.status = 'draft';
    await req.portfolio.save();
    await req.portfolio.populate('resumeUsed', 'title personalInfo');

    res.json({
      success: true,
      data: req.portfolio,
      message: 'Portfolio updated successfully'
    });
  } catch (error) {
    logger.error('Update portfolio error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @desc    Publish portfolio (make it live)
// @route   PUT /api/portfolios/:id/publish
// @access  Private
router.put('/:id/publish', protect, checkPortfolioOwnership, async (req, res) => {
  try {
    const { isLive } = req.body;

    if (typeof isLive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isLive must be a boolean value'
      });
    }

    req.portfolio.isLive = isLive;
    req.portfolio.status = isLive ? 'published' : 'draft';

    if (isLive) {
      // Validate essential fields before publishing
      if (!req.portfolio.personalInfo.fullName || !req.portfolio.personalInfo.email) {
        return res.status(400).json({
          success: false,
          error: 'Cannot publish portfolio: full name and email are required'
        });
      }

      // Generate live link if not exists
      if (!req.portfolio.liveLink) {
        const slug = `${req.portfolio._id.toString().slice(-8)}`;
        req.portfolio.liveLink = `/portfolio/${slug}`;
      }
    } else {
      // Clear live link when unpublishing
      req.portfolio.liveLink = null;
    }

    await req.portfolio.save();

    res.json({
      success: true,
      data: req.portfolio,
      message: isLive ? 'Portfolio published successfully' : 'Portfolio unpublished successfully'
    });
  } catch (error) {
    logger.error('Publish portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @desc    Delete portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private
router.delete('/:id', protect, checkPortfolioOwnership, async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    logger.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @desc    Parse resume into portfolio data
// @route   POST /api/portfolios/parse-resume/:resumeId
// @access  Private
router.post('/parse-resume/:resumeId', [
  protect,
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            errors: errors.array()
          });
        }

    // Check if user already has a portfolio
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    const resumeText = JSON.stringify({...req.body});
    let portfolioData = await parsePortfolioText(resumeText, req.user.id);

    // Get user for username generation
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Transform portfolioData to match schema
    portfolioData = {
      ...portfolioData,
      username: portfolioData.username || `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}-${Date.now()}`,
      certifications: Array.isArray(portfolioData.certifications) 
        ? portfolioData.certifications.map(cert => 
            typeof cert === 'string' ? cert : `${cert.name} - ${cert.issuer}`.trim()
          )
        : []
    };

    if (portfolio) {
      // Update existing portfolio
      Object.assign(portfolio, portfolioData);
      await portfolio.save();
    } else {
      // Create new portfolio
      portfolio = new Portfolio({
        user: req.user.id,
        ...portfolioData
      });
      await portfolio.save();
    }

    await portfolio.populate('resumeUsed', 'title personalInfo');


    res.json({
      success: true,
      data: portfolio,
      message: 'Resume parsed into portfolio successfully',
      tokens: req.tokens || 0
    });
  } catch (error) {
    logger.error('Parse resume to portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// @desc    Get portfolio stats
// @route   GET /api/portfolios/:id/stats
// @access  Private
router.get('/:id/stats', protect, checkPortfolioOwnership, async (req, res) => {
  try {
    const stats = {
      completionPercentage: req.portfolio.getCompletionPercentage(),
      isLive: req.portfolio.isLive,
      liveLink: req.portfolio.liveLink,
      analytics: req.portfolio.analytics,
      status: req.portfolio.status,
      template: req.portfolio.template
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get portfolio stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Public route for viewing live portfolio
// This will be handled in a separate public routes file
// @desc    Get public portfolio by link
// @route   GET /api/public/portfolio/:slug
// @access  Public
// This route should be in a separate public router

module.exports = router;
