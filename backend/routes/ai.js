const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { protect, checkAIActionLimit, checkTokenLimit, trackUsage, refundTokenOnError, skipIfBYOK } = require('../middleware/auth');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');
const DocumentParser = require('../utils/documentParser');
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const router = express.Router();

// Utility function to strip HTML tags from text
const stripHtmlTags = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/<[^>]*>/g, '').trim();
};

// Utility function to clean resume data by removing HTML tags
const cleanResumeData = (resumeData) => {
  const cleaned = { ...resumeData };

  // Clean string fields
  if (cleaned.title) cleaned.title = stripHtmlTags(cleaned.title);
  if (cleaned.summary) cleaned.summary = stripHtmlTags(cleaned.summary);

  // Clean personal info
  if (cleaned.personalInfo) {
    Object.keys(cleaned.personalInfo).forEach(key => {
      if (typeof cleaned.personalInfo[key] === 'string') {
        cleaned.personalInfo[key] = stripHtmlTags(cleaned.personalInfo[key]);
      }
    });
  }

  // Clean work experience
  if (cleaned.workExperience && Array.isArray(cleaned.workExperience)) {
    cleaned.workExperience = cleaned.workExperience.map(exp => ({
      ...exp,
      company: stripHtmlTags(exp.company),
      position: stripHtmlTags(exp.position),
      description: stripHtmlTags(exp.description),
      location: stripHtmlTags(exp.location)
    }));
  }

  // Clean education
  if (cleaned.education && Array.isArray(cleaned.education)) {
    cleaned.education = cleaned.education.map(edu => ({
      ...edu,
      institution: stripHtmlTags(edu.institution),
      degree: stripHtmlTags(edu.degree),
      field: stripHtmlTags(edu.field),
      description: stripHtmlTags(edu.description),
      location: stripHtmlTags(edu.location)
    }));
  }

  // Clean skills array
  if (cleaned.skills && Array.isArray(cleaned.skills)) {
    cleaned.skills = cleaned.skills.map(skill => stripHtmlTags(skill));
  }

  // Clean projects
  if (cleaned.projects && Array.isArray(cleaned.projects)) {
    cleaned.projects = cleaned.projects.map(project => ({
      ...project,
      name: stripHtmlTags(project.name),
      description: stripHtmlTags(project.description),
      technologies: stripHtmlTags(project.technologies),
      url: stripHtmlTags(project.url)
    }));
  }

  // Clean achievements
  if (cleaned.achievements && Array.isArray(cleaned.achievements)) {
    cleaned.achievements = cleaned.achievements.map(achievement => stripHtmlTags(achievement));
  }

  // Clean certifications
  if (cleaned.certifications && Array.isArray(cleaned.certifications)) {
    cleaned.certifications = cleaned.certifications.map(cert => ({
      ...cert,
      name: stripHtmlTags(cert.name),
      issuer: stripHtmlTags(cert.issuer),
      description: stripHtmlTags(cert.description)
    }));
  }

  // Clean languages
  if (cleaned.languages && Array.isArray(cleaned.languages)) {
    cleaned.languages = cleaned.languages.map(lang => ({
      ...lang,
      language: stripHtmlTags(lang.language),
      proficiency: stripHtmlTags(lang.proficiency)
    }));
  }

  // Clean custom fields
  if (cleaned.customFields && Array.isArray(cleaned.customFields)) {
    cleaned.customFields = cleaned.customFields.map(field => ({
      ...field,
      label: stripHtmlTags(field.label),
      value: stripHtmlTags(field.value)
    }));
  }

  return cleaned;
};

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
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
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

    // Initialize Gemini AI
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Create prompt for ATS-friendly professional enhancement
    const prompt = `
You are an expert resume writing assistant specializing in ATS-optimized, professional, and achievement-driven content.

Task:
Enhance the following text to be ATS-friendly, keyword-rich, and professionally polished while maintaining its original meaning.

Guidelines:
- Use strong action verbs (Developed, Led, Implemented, Optimized, Managed, Created, etc.)
- Include relevant industry keywords and technical terms naturally
- Quantify achievements with numbers, percentages, and metrics where possible
- Use bullet points for better ATS parsing and readability
- Start sentences with action verbs to demonstrate impact
- Avoid generic phrases like "responsible for" or "worked on"
- Include specific technologies, tools, and methodologies
- Keep content concise but impactful
- Use professional terminology appropriate for the industry
- Structure content for easy ATS scanning and human reading

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY clean HTML without any markdown formatting
- Do NOT include code blocks - return clean html code
- Do NOT include any markdown syntax
- Return pure HTML that can be directly inserted into a CKEditor
- Use proper HTML tags like <ul>, <li>, <p>, <strong>, etc.
- Ensure the HTML is valid and well-formed

User Input:
"${content}"

Return the final ATS-optimized, keyword-rich text as clean HTML only.
    `;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let rewrittenContent = response.text;

      // Clean the response to remove markdown formatting
      rewrittenContent = rewrittenContent
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      logger.info(`AI rewrite request processed for user ${req.user.email}`);

      res.json({
        success: true,
        data: {
          originalContent: content,
          rewrittenContent,
          tone,
          style,
          message: 'Content enhanced successfully',
          tokens: req.tokens || 0
        }
      });

    } catch (geminiError) {
      logger.error('Gemini rewrite error:', geminiError);
      return res.status(500).json({
        success: false,
        error: 'Failed to enhance content with AI'
      });
    }
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
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
  body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters')
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

    const { content } = req.body;

    // Initialize Gemini AI
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Create prompt for ATS-friendly text enhancement
    const prompt = `
You are an expert resume writing assistant specializing in ATS-optimized, professional, and achievement-driven content.

Task:
Enhance the following text to be ATS-friendly, keyword-rich, and professionally polished while maintaining its original meaning.

Guidelines:
- Use strong action verbs (Developed, Led, Implemented, Optimized, Managed, Created, etc.)
- Include relevant industry keywords and technical terms naturally
- Quantify achievements with numbers, percentages, and metrics where possible
- Start sentences with action verbs to demonstrate impact
- Avoid generic phrases like "responsible for" or "worked on"
- Include specific technologies, tools, and methodologies
- Keep content concise but impactful
- Use professional terminology appropriate for the industry
- Structure content for easy ATS scanning and human reading
- Format as flowing paragraphs, not bullet points or lists

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY clean HTML without any markdown formatting
- Do NOT include code blocks - return clean html code
- Do NOT include any markdown syntax
- Return pure HTML that can be directly inserted into a CKEditor
- Use paragraph tags <p> for content structure
- Do NOT use bullet points <ul> or <li> tags
- Ensure the HTML is valid and well-formed
- Format as continuous, flowing text in paragraph form

User Input:
"${content}"

Return the final summarized text as clean HTML paragraphs only.
    `;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let enhancedText = response.text;

      // Clean the response to remove markdown formatting
      enhancedText = enhancedText
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      logger.info(`AI summarize request processed for user ${req.user.email}`);

      res.json({
        success: true,
        data: {
          originalContent: content,
          summary: enhancedText,
          message: 'Content enhanced successfully',
          tokens: req.tokens || 0
        }
      });

    } catch (geminiError) {
      logger.error('Gemini summarization error:', geminiError);
      return res.status(500).json({
        success: false,
        error: 'Failed to enhance content with AI'
      });
    }
  } catch (error) {
    logger.error('AI summarize error:', error);
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
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        tokensAvailable: user.tokens || 0,
        plan: 'free',
        remainingActions: user.tokens || 0,
        cycleStartDate: user.createdAt,
        nextBillingDate: null,
        billingCycle: 'token-based',
        daysUntilReset: null
      }
    });
  } catch (error) {
    logger.error('Get AI usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting AI usage'
    });
  }
});

// @desc    Generate ATS Score for resume against job description
// @route   POST /api/ai/ats-score
// @access  Private
router.post('/ats-score', [
  protect,
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
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
    const rawResumeData = {
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

    // Clean HTML tags from resume data
    const resumeData = cleanResumeData(rawResumeData);

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

        IMPORTANT: Return ONLY the JSON object. Do not include any explanatory text, markdown formatting, or code blocks. Ignore the HTML tags in the fields those are intentional for template. Ignore any HTML related issue regarding ATS score.
        `;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: atsPrompt,
      });

      const rawResponse = response.text;

      // Parse the JSON response from Gemini using robust parsing
      const { parseAIResponse, validateResumeJSON } = require('../utils/jsonParser');

      let atsAnalysis = parseAIResponse(rawResponse, 'analyze-resume');

      // Validate the response structure
      if (!atsAnalysis.overall_score || !atsAnalysis.category_scores) {
        logger.warn('ATS analysis structure validation failed, using fallback');
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
          message: 'ATS score analysis completed and saved successfully',
          tokens: req.tokens || 0
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

// @desc    Adjust resume tone based on ATS analysis
// @route   POST /api/ai/adjust-tone
// @access  Private
router.post('/adjust-tone', [
  protect,
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('resume_json').isObject().withMessage('Resume JSON is required'),
  body('ats_analysis').isObject().withMessage('ATS analysis is required'),
  body('focus').isArray().withMessage('Focus areas must be an array')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { resumeId, resume_json, ats_analysis, focus } = req.body;

    // Set usage type for tracking
    req.usageType = 'aiAction';

    // Verify resume ownership
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Clean HTML tags from resume data
    const cleanedResumeData = cleanResumeData(resume_json);

    // Create prompt for tone adjustment
    const prompt = `
        You are an expert resume writing assistant specializing in ATS-optimized, professional, and achievement-driven resumes.

        Your task is to rewrite the provided resume sections to improve tone, clarity, and professionalism while keeping them concise and impactful. 

         ### Rules for rewriting:
         - Use professional, confident, and achievement-oriented tone.
         - Start sentences with strong action verbs (e.g., "Developed", "Led", "Implemented", "Optimized").
         - Replace generic job duties with quantifiable accomplishments wherever possible (use metrics like %, $, time saved, performance improved if available).
         - Eliminate repetitive or filler phrases such as "responsible for", "worked on", "involved in".
         - Ensure chronological consistency and logical flow in experience.
         - Avoid generic buzzwords like "hardworking", "team player", unless backed with evidence.
         - Keep sentences clear and direct (avoid long, wordy sentences).
         - Maintain technical depth by highlighting tools, technologies, and methods used.
         - Do NOT invent fake companies, roles, or projects — only rewrite what is provided.
         - Do NOT include explanatory text or commentary outside the required JSON format.
         
         ### HTML Formatting Requirements (CKEditor Compatible):
         - Use HTML tags for better structure and readability
         - For work experience descriptions: Convert into bulleted lists using <ul><li> tags
         - For project descriptions: Use numbered lists <ol><li> for sequential steps or <ul><li> for features/achievements
         - Use <strong> tags for emphasis on key achievements or technologies
         - Use <br> tags for line breaks when needed
         - Keep HTML simple and clean - avoid complex nested structures
         - Example format for experience: "<ul><li>Developed and maintained web applications using React and Node.js</li><li>Improved application performance by 40% through code optimization</li></ul>"
         - Example format for projects: "<ol><li>Designed and implemented user authentication system</li><li>Integrated third-party APIs for data processing</li></ol>"

        ### Input:
        - Resume JSON (with summary, experience, projects) : 
        ${JSON.stringify(resume_json, null, 2)}
        - ATS analysis (with weaknesses/recommendations) for guidance :
        ${JSON.stringify(ats_analysis, null, 2)}
        - Focus Areas: ${JSON.stringify(focus, null, 2)}

        ### Output:
        Rewrite only the summary, workExperience.description, and projects.description fields with improved tone.

        ### Response format (strict JSON only):
        {
          "summary": "updated summary text",
          "workExperience": [
            {
              "jobTitle": "position title",
              "company": "company name",
              "location": "location",
              "startDate": "start date",
              "endDate": "end date or null",
              "isCurrentJob": true/false,
              "description": "updated description with improved tone",
              "achievements": []
            }
          ],
          "projects": [
            {
              "name": "project name",
              "description": "updated description with improved tone",
              "technologies": ["tech1", "tech2"],
              "url": "project url or empty string",
              "githubUrl": "github url or empty string",
              "startDate": "start date or null",
              "endDate": "end date or null"
            }
          ]
        }

        `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    // Parse the response using robust JSON parsing utility
    const { parseAIResponse, validateResumeJSON } = require('../utils/jsonParser');

    const updatedResumeData = parseAIResponse(text, 'adjust-tone');

    // Validate the parsed data
    if (!validateResumeJSON(updatedResumeData, 'adjust-tone')) {
      logger.warn('Parsed data failed validation, using fallback structure');
      // The parseAIResponse function already provides a fallback structure
    }

    res.json({
      success: true,
      data: updatedResumeData,
      message: 'Resume tone adjusted successfully',
      tokens: req.tokens || 0
    });

  } catch (error) {
    logger.error('Adjust tone error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to adjust resume tone'
    });
  }
});

// @desc    Enhance resume keywords based on ATS analysis
// @route   POST /api/ai/enhance-keywords
// @access  Private
router.post('/enhance-keywords', [
  protect,
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('resume_json').isObject().withMessage('Resume JSON is required'),
  body('ats_analysis').isObject().withMessage('ATS analysis is required'),
  body('target_sections').isArray().withMessage('Target sections must be an array')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { resumeId, resume_json, ats_analysis, target_sections } = req.body;

    // Set usage type for tracking
    req.usageType = 'aiAction';

    // Verify resume ownership
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Clean HTML tags from resume data
    const cleanedResumeData = cleanResumeData(resume_json);

    // Create prompt for keyword enhancement
    const prompt = `
        You are an expert resume writer and ATS optimization specialist. Based on the missing keywords from the ATS analysis, enhance the resume by naturally integrating these keywords into the specified sections.

        Resume Data: ${JSON.stringify(cleanedResumeData, null, 2)}
        ATS Analysis: ${JSON.stringify(ats_analysis, null, 2)}
        Target Sections: ${JSON.stringify(target_sections, null, 2)}

          Instructions:
          1. Analyze the missing keywords from the ATS analysis
          2. Naturally integrate these keywords into the target sections (skills, workExperience, projects)
          3. Ensure the keywords are contextually relevant and don't feel forced
          4. PRESERVE the original structure and format of the resume - if it's a list, keep it as a list; if it's a paragraph, keep it as a paragraph
          5. Only add missing keywords to appropriate positions - do NOT change grammar, structure, or other content
          6. Make sure the enhanced content still reads naturally and professionally
          7. Prioritize keywords that are most relevant to the job requirements
          8. For skills: Add missing keywords to appropriate skill categories
          9. For workExperience: Add missing keywords to job descriptions where contextually appropriate
          10. For projects: Add missing keywords to project descriptions where contextually appropriate
          
          ### CRITICAL: Preserve Original Formatting
          - If the original description is a paragraph, keep it as a paragraph and only add keywords
          - If the original description is a list, keep it as a list and only add keywords to relevant points
          - Do NOT restructure or reformat the content
          - Do NOT fix grammar or improve writing - only add missing keywords
          - Maintain the exact same HTML structure if present

          Return the updated resume JSON with the complete structure. The response should be valid JSON that can be directly used to update the resume.

          Response format:
          {
            "skills": [
              {
                "category": "Technical Skills",
                "items": [
                  {
                    "name": "JavaScript",
                    "level": "intermediate"
                  },
                  {
                    "name": "React",
                    "level": "intermediate"
                  }
                ]
              }
            ],
            "workExperience": [
              {
                "jobTitle": "Software Developer",
                "company": "Company Name",
                "location": "Location",
                "startDate": "2020-01-01",
                "endDate": null,
                "isCurrentJob": true,
                "description": "Original description with added keywords",
                "achievements": []
              }
            ],
            "projects": [
              {
                "name": "Project Name",
                "description": "Original description with added keywords",
                "technologies": ["tech1", "tech2"],
                "url": "",
                "githubUrl": "",
                "startDate": null,
                "endDate": null
              }
            ]
          }
          `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    // Parse the response using robust JSON parsing utility
    const { parseAIResponse, validateResumeJSON } = require('../utils/jsonParser');

    const updatedResumeData = parseAIResponse(text, 'enhance-keywords');

    // Validate the parsed data
    if (!validateResumeJSON(updatedResumeData, 'enhance-keywords')) {
      logger.warn('Parsed data failed validation, using fallback structure');
      // The parseAIResponse function already provides a fallback structure
    }

    res.json({
      success: true,
      data: updatedResumeData,
      message: 'Keywords enhanced successfully',
      tokens: req.tokens || 0
    });

  } catch (error) {
    logger.error('Enhance keywords error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enhance keywords'
    });
  }
});

// @desc    Generate PDF template from basic details using AI
// @route   POST /api/ai/generate-pdf-template
// @access  Private
router.post('/generate-pdf-template', [
  protect,
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
  body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters')
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

    const { content } = req.body;

    // Initialize Gemini AI
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Create prompt for PDF template generation
    const prompt = `
      You are an expert resume template designer specializing in creating professional, ATS-optimized resume templates.

      Task:
      Generate a complete, professional resume template from the provided basic details. Create a well-structured, visually appealing, modern. professional template that can be used as a PDF template.

      Guidelines:
      - Create a complete resume structure with all essential sections
      - Use professional formatting and layout
      - Include proper HTML structure for PDF generation
      - Make it ATS-friendly with clear sections and formatting
      - Use modern, professional, visually appealing design principles
      - Include proper spacing and typography
      - Ensure the template is comprehensive and ready to use
      - Structure content logically with clear hierarchy

      CRITICAL OUTPUT REQUIREMENTS:
      - Return ONLY clean HTML without any markdown formatting
      - Do NOT include code blocks - return clean html code
      - Do NOT include any markdown syntax
      - Return pure HTML that can be directly inserted into a CKEditor
      - Use proper HTML tags for structure: <div>, <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
      - Do not border content with A4 size, ensure it fits within the page
      - Include inline CSS styling for professional appearance
      - Ensure the HTML is valid and well-formed
      - Make it suitable for PDF generation
      - Acceptable classes, styles and HTML structure for google chromium pdf generation

      User Input:
      "${content}"

      Return a complete, professional resume template as clean HTML only.
    `;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let templateContent = response.text;

      // Clean the response to remove markdown formatting
      templateContent = templateContent
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      logger.info(`AI PDF template generation request processed for user ${req.user.email}`);

      res.json({
        success: true,
        data: {
          originalContent: content,
          templateContent,
          templateType: 'PDF Template',
          message: 'PDF template generated successfully',
          tokens: req.tokens || 0
        }
      });

    } catch (geminiError) {
      logger.error('Gemini PDF template generation error:', geminiError);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate PDF template with AI'
      });
    }
  } catch (error) {
    logger.error('AI PDF template generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Restructure current template using AI (structured template required)
// @route   POST /api/ai/restructure-template
// @access  Private
router.post('/restructure-template', [
  protect,
  skipIfBYOK(checkAIActionLimit),
  skipIfBYOK(checkTokenLimit),
  skipIfBYOK(refundTokenOnError),
  body('content').trim().isLength({ min: 50 }).withMessage('Content must be at least 50 characters for restructuring')
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

    const { content } = req.body;

    // Initialize Gemini AI
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Create prompt for template restructuring
    const prompt = `
You are an expert resume template designer and ATS optimization specialist.

Task:
Restructure and improve the provided resume template to make it more professional, ATS-friendly, and visually appealing while maintaining all the original content.

Guidelines:
- Analyze the current template structure and identify areas for improvement
- Reorganize content for better flow and readability
- Improve formatting and visual hierarchy
- Enhance ATS compatibility
- Maintain all original content but improve presentation
- Use modern design principles
- Ensure proper spacing and typography
- Create clear section divisions
- Optimize for both human readers and ATS systems

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY clean HTML without any markdown formatting
- Do NOT include code blocks - return clean html code
- Do NOT include any markdown syntax
- Return pure HTML that can be directly inserted into a CKEditor
- Use proper HTML tags for structure: <div>, <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Include inline CSS styling for professional appearance
- Ensure the HTML is valid and well-formed
- Preserve all original content but improve structure and presentation

User Input:
"${content}"

Return the restructured and improved template as clean HTML only.
    `;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let restructuredContent = response.text;

      // Clean the response to remove markdown formatting
      restructuredContent = restructuredContent
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      logger.info(`AI template restructuring request processed for user ${req.user.email}`);

      res.json({
        success: true,
        data: {
          originalContent: content,
          restructuredContent,
          structureType: 'Restructured Template',
          improvements: ['Enhanced formatting', 'Improved ATS compatibility', 'Better visual hierarchy', 'Professional styling'],
          message: 'Template restructured successfully',
          tokens: req.tokens || 0
        }
      });

    } catch (geminiError) {
      logger.error('Gemini template restructuring error:', geminiError);
      return res.status(500).json({
        success: false,
        error: 'Failed to restructure template with AI'
      });
    }
  } catch (error) {
    logger.error('AI template restructuring error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
