const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { protect, checkAIActionLimit, trackUsage } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Resume = require('../models/Resume');
const Template = require('../models/Template');
const logger = require('../utils/logger');
const DocumentParser = require('../utils/documentParser');
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const router = express.Router();

// Configure multer for file uploads (for job description files)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF and Word documents for job descriptions
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for job description!'), false);
    }
  },
});

// @desc    Rewrite resume content with AI
// @route   POST /api/ai/rewrite
// @access  Private
router.post('/rewrite', [
  protect,
  checkAIActionLimit,
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('tone').optional().isIn(['professional', 'casual', 'formal', 'creative']).withMessage('Invalid tone'),
  body('style').optional().isIn(['concise', 'detailed', 'action-oriented', 'achievement-focused']).withMessage('Invalid style')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { content, tone = 'professional', style = 'action-oriented' } = req.body;

    // TODO: Implement actual AI rewriting logic here
    // For now, return a mock response
    const rewrittenContent = `[AI Rewritten] ${content} - Enhanced with ${tone} tone and ${style} style.`;

    logger.info(`AI rewrite request processed for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        originalContent: content,
        rewrittenContent,
        tone,
        style,
        message: 'Content rewritten successfully'
      }
    });
  } catch (error) {
    logger.error('AI rewrite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Summarize resume section with AI
// @route   POST /api/ai/summarize
// @access  Private
router.post('/summarize', [
  protect,
  checkAIActionLimit,
  body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  body('maxLength').optional().isInt({ min: 50, max: 500 }).withMessage('Max length must be between 50 and 500 characters')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { content, maxLength = 150 } = req.body;

    // TODO: Implement actual AI summarization logic here
    // For now, return a mock response
    const summary = `[AI Summary] ${content.substring(0, maxLength)}...`;

    logger.info(`AI summarize request processed for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        originalContent: content,
        summary,
        maxLength,
        message: 'Content summarized successfully'
      }
    });
  } catch (error) {
    logger.error('AI summarize error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Enhance keywords with AI
// @route   POST /api/ai/enhance-keywords
// @access  Private
router.post('/enhance-keywords', [
  protect,
  checkAIActionLimit,
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('industry').optional().trim().isLength({ min: 2 }).withMessage('Industry must be at least 2 characters')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { content, industry = 'general' } = req.body;

    // TODO: Implement actual AI keyword enhancement logic here
    // For now, return a mock response
    const enhancedContent = `[AI Enhanced] ${content} - Optimized with industry-specific keywords for ${industry}.`;

    logger.info(`AI keyword enhancement request processed for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        originalContent: content,
        enhancedContent,
        industry,
        message: 'Keywords enhanced successfully'
      }
    });
  } catch (error) {
    logger.error('AI enhance keywords error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Adjust tone with AI
// @route   POST /api/ai/adjust-tone
// @access  Private
router.post('/adjust-tone', [
  protect,
  checkAIActionLimit,
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('targetTone').isIn(['professional', 'casual', 'formal', 'confident', 'friendly']).withMessage('Invalid target tone')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { content, targetTone } = req.body;

    // TODO: Implement actual AI tone adjustment logic here
    // For now, return a mock response
    const adjustedContent = `[AI Tone Adjusted] ${content} - Adjusted to ${targetTone} tone.`;

    logger.info(`AI tone adjustment request processed for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        originalContent: content,
        adjustedContent,
        targetTone,
        message: 'Tone adjusted successfully'
      }
    });
  } catch (error) {
    logger.error('AI adjust tone error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get AI usage statistics
// @route   GET /api/ai/usage
// @access  Private
router.get('/usage', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    const usage = subscription.usage || {};
    
    res.json({
      success: true,
      data: {
        aiActionsUsed: usage.aiActionsThisCycle || 0,
        aiActionsLimit: subscription.features?.aiActionsLimit || 10,
        plan: subscription.plan,
        remainingActions: Math.max(0, (subscription.features?.aiActionsLimit || 10) - (usage.aiActionsThisCycle || 0)),
        cycleStartDate: usage.cycleStartDate || subscription.startDate,
        nextBillingDate: subscription.billing?.nextBillingDate || null,
        billingCycle: subscription.billing?.cycle || 'monthly',
        daysUntilReset: subscription.billing?.nextBillingDate ? 
          Math.ceil((new Date(subscription.billing.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
      }
    });
  } catch (error) {
    logger.error('Get AI usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Generate ATS Score for resume against job description
// @route   POST /api/ai/ats-score
// @access  Private
router.post('/ats-score', [
  protect,
  checkAIActionLimit,
  upload.single('jobDescriptionFile'), // Handle file upload for job description
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('jobDescription').optional().trim().isLength({ min: 10 }).withMessage('Job description must be at least 10 characters'),
  body('inputType').isIn(['text', 'file']).withMessage('Input type must be either text or file')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { resumeId, jobDescription, inputType } = req.body;

    // Get resume data with template
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id
    }).populate('template', 'name category styling templateCode');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    let jobDescriptionText = '';

    // Handle job description input
    if (inputType === 'text') {
      if (!jobDescription || jobDescription.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Job description text is required'
        });
      }
      jobDescriptionText = jobDescription.trim();
    } else if (inputType === 'file') {
      // Handle file upload for job description
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Job description file is required'
        });
      }

      const { buffer, mimetype, originalname } = req.file;

      // Validate file type
      if (!DocumentParser.isValidDocumentType(mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Only PDF, DOC, and DOCX files are allowed for job description'
        });
      }

      try {
        jobDescriptionText = await DocumentParser.parseDocument(buffer, mimetype, originalname);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: parseError.message
        });
      }
    }


    // Prepare resume data for ATS analysis
    const resumeData = {
      title: resume.title,
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      workExperience: resume.workExperience,
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects,
      achievements: resume.achievements,
      certifications: resume.certifications,
      languages: resume.languages,
      customFields: resume.customFields,
      template: resume.template ? {
        name: resume.template.name,
        category: resume.template.category
      } : null
    };

    // Generate ATS score using Gemini
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
    
    const atsPrompt = `
You are an ATS (Applicant Tracking System) expert. Analyze the following resume against the job description and provide a comprehensive ATS compatibility score.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescriptionText}

Please analyze and provide your response in the following EXACT JSON format. Return ONLY valid JSON without any additional text or explanations:

{
  "overall_score": <number between 0-100>,
  "category_scores": {
    "keyword_skill_match": <number between 0-40>,
    "experience_alignment": <number between 0-20>,
    "section_completeness": <number between 0-15>,
    "project_impact": <number between 0-10>,
    "formatting": <number between 0-10>,
    "bonus_skills": <number between 0-5>
  },
  "missing_keywords": [<array of missing keywords from job description>],
  "strengths": [<array of resume strengths>],
  "weaknesses": [<array of resume weaknesses>],
  "ats_warnings": [<array of ATS compatibility warnings>],
  "recommendations": [<array of actionable improvement recommendations>]
}

SCORING CRITERIA:
- keyword_skill_match (0-40): How well resume keywords match job requirements
- experience_alignment (0-20): Relevance of work experience to job role
- section_completeness (0-15): Completeness of resume sections (contact, summary, experience, education, skills)
- project_impact (0-10): Quality and impact of projects/achievements
- formatting (0-10): ATS-friendly formatting and structure
- bonus_skills (0-5): Additional valuable skills beyond requirements

IMPORTANT: Return ONLY the JSON object. Do not include any explanatory text, markdown formatting, or code blocks.
`;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: atsPrompt,
      });

      const rawResponse = response.text;
      
      // Parse the JSON response from Gemini
      let atsAnalysis;
      try {
        // Clean the response to extract JSON
        const cleanedResponse = rawResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        atsAnalysis = JSON.parse(cleanedResponse);
        
        // Validate the response structure
        if (!atsAnalysis.overall_score || !atsAnalysis.category_scores) {
          throw new Error('Invalid response structure from Gemini');
        }
        
      } catch (parseError) {
        logger.error('Failed to parse Gemini response:', parseError);
        logger.error('Raw response:', rawResponse);
        
        // Fallback to raw response if JSON parsing fails
        atsAnalysis = {
          overall_score: 0,
          category_scores: {
            keyword_skill_match: 0,
            experience_alignment: 0,
            section_completeness: 0,
            project_impact: 0,
            formatting: 0,
            bonus_skills: 0
          },
          missing_keywords: [],
          strengths: [],
          weaknesses: [],
          ats_warnings: ['Failed to parse AI response'],
          recommendations: ['Please try again or contact support'],
          raw_response: rawResponse
        };
      }

      // Save ATS analysis to resume
      const crypto = require('crypto');
      const jobDescriptionHash = crypto.createHash('md5').update(jobDescriptionText).digest('hex');
      
      resume.atsAnalysis = {
        ...atsAnalysis,
        job_description_hash: jobDescriptionHash,
        analyzed_at: new Date()
      };
      
      await resume.save();

      logger.info(`ATS score generated and saved for resume ${resume.title} by user ${req.user.email}`);

      res.json({
        success: true,
        data: {
          resumeId: resumeId,
          resumeTitle: resume.title,
          templateName: resume.template?.name || 'No template',
          jobDescriptionLength: jobDescriptionText.length,
          inputType: inputType,
          atsAnalysis: atsAnalysis,
          message: 'ATS score analysis completed and saved successfully'
        }
      });

    } catch (geminiError) {
      logger.error('Gemini ATS analysis error:', geminiError);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate ATS score analysis'
      });
    }

  } catch (error) {
    logger.error('ATS score error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get saved ATS analysis for a resume
// @route   GET /api/ai/ats-score/:resumeId
// @access  Private
router.get('/ats-score/:resumeId', protect, async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Get resume with ATS analysis
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id
    }).select('title atsAnalysis template');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    if (!resume.atsAnalysis || !resume.atsAnalysis.overall_score) {
      return res.status(404).json({
        success: false,
        error: 'No ATS analysis found for this resume'
      });
    }

    res.json({
      success: true,
      data: {
        resumeId: resumeId,
        resumeTitle: resume.title,
        templateName: resume.template?.name || 'No template',
        atsAnalysis: resume.atsAnalysis,
        message: 'ATS analysis retrieved successfully'
      }
    });

  } catch (error) {
    logger.error('Get ATS analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
