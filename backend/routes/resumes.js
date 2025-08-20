const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, checkResumeLimit, checkTemplateAccess, checkExportFormat, trackUsage } = require('../middleware/auth');
const Resume = require('../models/Resume');
const Template = require('../models/Template');
const Subscription = require('../models/Subscription');
const TemplateRenderer = require('../utils/templateRenderer');
const logger = require('../utils/logger');
const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');
const { withPage } = require('../utils/browserManager');
const officegen = require('officegen');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const router = express.Router();

// @desc    Save resume form data (Step 1: Form submission)
// @route   POST /api/resumes/form-data
// @access  Private
router.post('/form-data', [
  protect,
  checkResumeLimit,
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('personalInfo.fullName').trim().isLength({ min: 1, max: 100 }).withMessage('Full name is required'),
  body('personalInfo.email').isEmail().withMessage('Valid email is required')
], trackUsage, async (req, res) => {
  try {
    logger.info('Form data request received:', { user: req.user.id, body: req.body });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'resume';

    const resumeData = {
      user: req.user.id,
      title: req.body.title,
      // template will be set when user selects one in the next step
      personalInfo: req.body.personalInfo,
      summary: req.body.summary || '',
      workExperience: req.body.workExperience || [],
      education: req.body.education || [],
      skills: req.body.skills || [],
      projects: req.body.projects || [],
      achievements: req.body.achievements || [],
      certifications: req.body.certifications || [],
      languages: req.body.languages || [],
      customFields: req.body.customFields || [],
      status: 'draft' // Keep as draft until template is selected
    };

    const resume = new Resume(resumeData);
    await resume.save();

    logger.info(`Resume form data saved: ${resume.title} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: {
        resumeId: resume._id,
        message: 'Resume form data saved successfully'
      }
    });
  } catch (error) {
    logger.error('Save resume form data error:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Auto-save resume draft
// @route   POST /api/resumes/auto-save
// @access  Private
router.post('/auto-save', [
  protect,
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('personalInfo.fullName').optional().trim().isLength({ min: 1, max: 100 }),
  body('personalInfo.email').optional().isEmail()
], async (req, res) => {
  try {
    logger.info('Auto-save request received:', { user: req.user.id, body: req.body });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Auto-save validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if we're updating an existing resume or creating a new one
    const { resumeId } = req.body;
    let resume;

    if (resumeId) {
      // Update existing resume
      resume = await Resume.findOne({
        _id: resumeId,
        user: req.user.id
      });

      if (!resume) {
        return res.status(404).json({
          success: false,
          error: 'Resume not found'
        });
      }

      // Update allowed fields
      const allowedFields = [
        'title', 'personalInfo', 'summary', 'workExperience', 
        'education', 'skills', 'projects', 'achievements', 
        'certifications', 'languages', 'customFields'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          resume[field] = req.body[field];
        }
      });

      resume.status = 'draft'; // Keep as draft during auto-save
    } else {
      // Create new draft resume - check limits
      const subscription = await Subscription.findOne({ user: req.user.id });
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          error: 'No active subscription found. Please subscribe to create resumes.',
          limitReached: true
        });
      }

      if (!subscription.canCreateResume()) {
        const currentUsage = subscription.usage.resumesCreatedThisWeek || 0;
        const limit = (subscription.plan === 'pro' || subscription.isTrialActive()) ? 7 : 3;
        const planName = subscription.plan === 'free' ? 'Free' : 'Pro';
        return res.status(403).json({
          success: false,
          error: `Weekly resume creation limit reached. You have created ${currentUsage}/${limit} resumes this week on your ${planName} plan.`,
          limitReached: true,
          currentUsage,
          limit,
          plan: subscription.plan
        });
      }

      const resumeData = {
        user: req.user.id,
        title: req.body.title || 'Untitled Resume',
        personalInfo: req.body.personalInfo || {},
        summary: req.body.summary || '',
        workExperience: req.body.workExperience || [],
        education: req.body.education || [],
        skills: req.body.skills || [],
        projects: req.body.projects || [],
        achievements: req.body.achievements || [],
        certifications: req.body.certifications || [],
        languages: req.body.languages || [],
        customFields: req.body.customFields || [],
        status: 'draft'
      };

      resume = new Resume(resumeData);
    }

    await resume.save();

    logger.info(`Resume auto-saved: ${resume.title} by user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        resumeId: resume._id,
        message: 'Resume auto-saved successfully'
      }
    });
  } catch (error) {
    logger.error('Auto-save resume error:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Mark resume as completed
// @route   PUT /api/resumes/:id/complete
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Check if this is a draft being published (first time completion)
    const isFirstTimePublishing = resume.status === 'draft';

    // If this is first time publishing, check subscription limits
    if (isFirstTimePublishing) {
      const subscription = await Subscription.findOne({ user: req.user.id });
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          error: 'No active subscription found. Please subscribe to create resumes.'
        });
      }

      if (!subscription.canCreateResume()) {
        const currentUsage = subscription.usage.resumesCreated;
        const limit = subscription.isTrialActive() ? 50 : subscription.features.resumeLimit;
        const planName = subscription.plan === 'free' ? 'Free' : 'Pro';
        
        return res.status(403).json({
          success: false,
          error: `Resume creation limit reached. You have created ${currentUsage}/${limit} resumes on your ${planName} plan. Please upgrade your subscription to create more resumes.`,
          limitReached: true,
          currentUsage,
          limit,
          plan: subscription.plan
        });
      }
    }

    // Mark as completed (published)
    resume.status = 'published';
    await resume.save();

    // Update user analytics and subscription usage if this is the first time publishing
    if (isFirstTimePublishing) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $inc: { 'usage.resumesCreated': 1 }
        }
      );
      
      // Also update subscription usage
      const subscription = await Subscription.findOne({ user: req.user.id });
      if (subscription) {
        await subscription.incrementUsage('resume');
      }
      
      logger.info(`Resume created and published: ${resume.title} by user ${req.user.email} (resumesCreated: +1)`);
    } else {
      logger.info(`Resume updated and republished: ${resume.title} by user ${req.user.email}`);
    }

    res.json({
      success: true,
      data: {
        resume,
        message: 'Resume marked as completed successfully'
      }
    });
  } catch (error) {
    logger.error('Mark resume as completed error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update resume with selected template (Step 2: Template selection)
// @route   PUT /api/resumes/:id/template
// @access  Private
router.put('/:id/template', [
  protect,
  body('templateId').isMongoId().withMessage('Valid template ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Verify template exists and user has access
    const template = await Template.findById(req.body.templateId);
    if (!template || !template.availability.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive template'
      });
    }

    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription.canAccessTemplate(template.availability.tier)) {
      return res.status(403).json({
        success: false,
        error: 'Template not available in your subscription plan'
      });
    }

    // Update resume with selected template
    resume.template = req.body.templateId;
    
    // Initialize styling with template defaults and proper template styling structure
    resume.styling = {
      ...template.styling, // Template's default styling (colors, fonts, etc.)
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 14,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    };
    
    // Override with any provided styling from request
    if (req.body.styling) {
      resume.styling = { ...resume.styling, ...req.body.styling };
    }
    
    await resume.save();

    await resume.populate('template', 'name category preview styling templateCode');

    logger.info(`Template selected for resume: ${resume.title} by user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        resume,
        message: 'Template selected successfully'
      }
    });
  } catch (error) {
    logger.error('Update resume template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update resume template styling
// @route   PUT /api/resumes/:id/template-styling
// @access  Private
router.put('/:id/template-styling', [
  protect,
  body('template.headerLevel').optional().isIn(['h1', 'h2', 'h3', 'h4', 'h5']).withMessage('Invalid header level'),
  body('template.headerFontSize').optional().isInt({ min: 12, max: 24 }).withMessage('Header font size must be between 12 and 24'),
  body('template.fontSize').optional().isInt({ min: 12, max: 18 }).withMessage('Font size must be between 12 and 18'),
  body('template.lineSpacing').optional().isFloat({ min: 1, max: 3 }).withMessage('Line spacing must be between 1 and 3'),
  body('template.sectionSpacing').optional().isFloat({ min: 1, max: 5 }).withMessage('Section spacing must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Update template styling options
    if (req.body.template) {
      if (!resume.styling) {
        resume.styling = {};
      }
      if (!resume.styling.template) {
        resume.styling.template = {};
      }
      
      // Update only the provided fields
      Object.keys(req.body.template).forEach(key => {
        if (req.body.template[key] !== undefined) {
          resume.styling.template[key] = req.body.template[key];
        }
      });
    }

    await resume.save();

    logger.info(`Template styling updated for resume: ${resume.title} by user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        resume,
        message: 'Template styling updated successfully'
      }
    });
  } catch (error) {
    logger.error('Update template styling error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Generate resume preview
// @route   GET /api/resumes/:id/preview
// @access  Private
router.get('/:id/preview', protect, async (req, res) => {
  try {
    let resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('template');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Handle missing template case - automatically assign Classic Traditional template
    let templateAssigned = false;
    if (!resume.template) {
      console.log('Resume has no template, assigning Classic Traditional template as default');
      
      // Find the Classic Traditional template
      const classicTemplate = await Template.findOne({
        name: 'Classic Traditional',
        'availability.isActive': true,
        'availability.isPublic': true
      });

      if (classicTemplate) {
        // Assign the template to the resume
        resume.template = classicTemplate._id;
        resume.styling = {
          ...classicTemplate.styling,
          template: {
            headerLevel: 'h3',
            fontSize: 16,
            lineSpacing: 1.5,
            sectionSpacing: 1
          }
        };
        await resume.save();
        
        // Re-populate the template for rendering
        await resume.populate('template');
        
        templateAssigned = true;
        console.log('Classic Traditional template assigned successfully');
      } else {
        console.log('Classic Traditional template not found, returning placeholder');
        
        // Fallback to placeholder if template doesn't exist
        const placeholderHtml = `
          <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
            <h2 style="color: #6b7280;">No Template Available</h2>
            <p style="color: #9ca3af; margin: 20px 0;">
              No default template found. Please contact support.
            </p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-bottom: 10px;">Your Resume Data:</h3>
              <p style="color: #6b7280; font-size: 14px;">
                • Title: ${resume.title}<br/>
                • Work Experience: ${resume.workExperience ? resume.workExperience.length : 0} items<br/>
                • Education: ${resume.education ? resume.education.length : 0} items<br/>
                • Skills: ${resume.skills ? resume.skills.length : 0} categories
              </p>
            </div>
          </div>
        `;
        
        return res.json({
          success: true,
          data: {
            html: placeholderHtml,
            css: `
              body { margin: 0; padding: 0; }
              .placeholder { background: #f9fafb; min-height: 400px; }
            `,
            resumeData: resume,
            template: null,
            noTemplate: true
          }
        });
      }
    }

    // Ensure template styling is initialized for existing resumes
    if (resume.template && (!resume.styling || !resume.styling.template)) {
      console.log('Resume has template but no template styling, initializing defaults');
      if (!resume.styling) {
        resume.styling = {};
      }
      resume.styling.template = {
        headerLevel: 'h3',
        fontSize: 16,
        lineSpacing: 1.5,
        sectionSpacing: 1
      };
      await resume.save();
    }

    // Initialize template renderer
    const renderer = new TemplateRenderer();
    
    // Prepare resume data for rendering
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
      styling: resume.styling || {} // Include styling data
    };



    // Render template with user data
    const renderResult = renderer.render(resume.template, resumeData);



    if (!renderResult.success) {
      console.error('❌ Template rendering failed:', renderResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to render template: ' + renderResult.error
      });
    }

    // Check if HTML contains raw Handlebars
    const hasHandlebars = renderResult.html.includes('{{') || renderResult.html.includes('}}');
    
    if (hasHandlebars) {
      console.error('❌ WARNING: Rendered HTML still contains Handlebars syntax!');
    }

    res.json({
      success: true,
      data: {
        html: renderResult.html,
        css: renderResult.css,
        resumeData: resume,
        template: resume.template,
        noTemplate: false,
        templateAssigned: templateAssigned
      }
    });
  } catch (error) {
    logger.error('Generate preview error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Generate page-wise images from the exact PDF output (for mobile preview)
// @route   GET /api/resumes/:id/preview/pdf-images
// @access  Private
router.get('/:id/preview/pdf-images', protect, async (req, res) => {
  try {
    let resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('template');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // If a template is missing, align with the preview behavior by assigning default
    if (!resume.template) {
      const classicTemplate = await Template.findOne({
        name: 'Classic Traditional',
        'availability.isActive': true,
        'availability.isPublic': true
      });

      if (classicTemplate) {
        resume.template = classicTemplate._id;
        resume.styling = {
          ...classicTemplate.styling,
          template: {
            headerLevel: 'h3',
            fontSize: 16,
            lineSpacing: 1.5,
            sectionSpacing: 1
          }
        };
        await resume.save();
        await resume.populate('template');
      }
    }

    const renderer = new TemplateRenderer();
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
      styling: resume.styling || {}
    };

    const renderResult = renderer.render(resume.template, resumeData);
    if (!renderResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to render template: ' + renderResult.error
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${resume.title}</title>
          <style>
              /* Basic reset and page setup */
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              :root { 
                  --template-bg: ${resume.template?.styling?.colors?.background || '#ffffff'}; 
              }
              
              body {
                  margin: 0;
                  padding: 0;
                  background: var(--template-bg);
                  min-height: 100vh;
              }
              
              /* Template CSS from renderer - HIGHEST PRIORITY */
              ${renderResult.css}
              
              /* Minimal PDF-specific overrides - LOWEST PRIORITY */
              /* Only apply essential PDF optimizations that don't conflict with template design */
              
              /* Print optimizations - minimal and non-conflicting */
              @media print {
                  .resume {
                      -webkit-box-decoration-break: clone;
                      box-decoration-break: clone;
                  }
              }
              
              /* Page margins for PDF generation - minimal */
              @page :first {
                  size: A4;
                  margin: 0in 0in 0.5in 0in;
              }
              
              @page {
                  size: A4;
                  margin: 0.5in 0in 0.5in 0in;
              }
              }
          </style>
      </head>
      <body>
          ${renderResult.html}
      </body>
      </html>
    `;

    // Launch headless Chromium (Sparticuz on Linux, Puppeteer locally)
    const isLinux = process.platform === 'linux';
    let executablePath;
    let launchArgs;
    let defaultViewport;
    let headlessOption;

    if (isLinux) {
      try {
        executablePath = await chromium.executablePath();
        launchArgs = chromium.args;
        defaultViewport = chromium.defaultViewport;
        headlessOption = chromium.headless;
      } catch (e) {}
    }

    if (!executablePath) {
      executablePath = typeof puppeteer.executablePath === 'function' ? puppeteer.executablePath() : undefined;
      launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ];
      defaultViewport = null;
      headlessOption = 'new';
    }

    // Use shared browser and a managed page to avoid cold starts per request on Render
    const result = await withPage(async (page) => {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.evaluateHandle('document.fonts.ready');
      await page.emulateMediaType('print');

    // Target A4 dimensions in CSS pixels at 96 DPI
    const a4WidthCssPx = Math.ceil(8.27 * 96);
    const a4HeightCssPx = Math.ceil(11.69 * 96);
    const deviceScaleFactor = 2; // improve sharpness

    await page.setViewport({
      width: a4WidthCssPx,
      height: a4HeightCssPx,
      deviceScaleFactor
    });

    // Measure resume container
    const rect = await page.evaluate(() => {
      const el = document.querySelector('.resume') || document.querySelector('.resume-isolated-container .resume') || document.body;
      const r = el.getBoundingClientRect();
      return { x: Math.floor(r.left), y: Math.floor(r.top), width: Math.ceil(r.width), height: Math.ceil(r.height) };
    });

      const pages = [];
    const totalHeight = rect.height;
    const pageHeight = a4HeightCssPx; // full page height in CSS px
    const contentAreaCssPx = Math.max(1, pageHeight - 2 * Math.round(0.5 * 96));
    const pageWidth = Math.min(a4WidthCssPx, rect.width);
    let y = rect.y;
    let index = 0;
    const marginCssPx = Math.round(0.5 * 96); // 0.5in in CSS px at 96 DPI
    const marginDevicePx = marginCssPx * deviceScaleFactor;

      while (y < rect.y + totalHeight) {
      const remainingCss = rect.y + totalHeight - y;
      const clipHeightCss = Math.floor(Math.min(contentAreaCssPx, remainingCss));
      const buffer = await page.screenshot({
        type: 'webp',
        quality: 85,
        clip: {
          x: Math.max(0, rect.x),
          y: Math.max(0, Math.floor(y)),
          width: Math.floor(pageWidth),
          height: clipHeightCss
        }
      });
      // Add a white top and bottom margin to each page image for preview
      let finalBuffer = buffer;
      try {
        const clipHeightDevicePx = clipHeightCss * deviceScaleFactor;
        const totalTargetHeightDevicePx = pageHeight * deviceScaleFactor;
        const bottomExtendDevicePx = Math.max(0, totalTargetHeightDevicePx - (marginDevicePx + clipHeightDevicePx));
        // Use template background instead of white for top/bottom padding so page color is continuous
        const bg = (resume?.template?.styling?.colors?.background || '#ffffff').replace('#','');
        const r = parseInt(bg.substring(0,2), 16) || 255;
        const g = parseInt(bg.substring(2,4), 16) || 255;
        const b = parseInt(bg.substring(4,6), 16) || 255;
        finalBuffer = await sharp(buffer)
          .extend({ top: marginDevicePx, bottom: bottomExtendDevicePx, background: { r, g, b, alpha: 1 } })
          .webp({ quality: 85 })
          .toBuffer();
      } catch (e) {
        // If sharp fails, fallback to original buffer
      }
      const base64 = finalBuffer.toString('base64');
        pages.push({ index, mimeType: 'image/webp', dataUri: `data:image/webp;base64,${base64}` });
      index += 1;
      y += clipHeightCss;
      }

      return pages;
    });

    // Basic resume metadata for client UI
    const meta = {
      title: resume?.title || '',
      template: resume?.template ? {
        id: String(resume.template._id || ''),
        name: resume.template.name || '',
        category: resume.template.category || '',
        tier: resume.template.availability?.tier || ''
      } : null
    };

    return res.json({ success: true, data: { pageCount: result.length, pages: result, meta } });
  } catch (error) {
    logger.error('Generate PDF images error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Download resume as PDF
// @route   GET /api/resumes/:id/download/pdf
// @access  Private
router.get('/:id/download/pdf', protect, async (req, res) => {
  try {
    // Check subscription and export limits
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Subscription not found. Please contact support.'
      });
    }

  // Check if user can export PDF (format access based on tier)
    if (!subscription.canExportFormat('pdf')) {
      return res.status(403).json({
        success: false,
        error: 'PDF export not available in your subscription plan. Please upgrade to Pro.'
      });
    }

  // Unlimited exports for both tiers per requirements (no weekly export limit)

    let resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('template');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Handle missing template - automatically assign Classic Traditional template
    if (!resume.template) {
      console.log('Resume has no template for PDF download, assigning Classic Traditional template as default');
      
      // Find the Classic Traditional template
      const classicTemplate = await Template.findOne({
        name: 'Classic Traditional',
        'availability.isActive': true,
        'availability.isPublic': true
      });

      if (classicTemplate) {
        // Assign the template to the resume
        resume.template = classicTemplate._id;
        resume.styling = {
          ...classicTemplate.styling,
          template: {
            headerLevel: 'h3',
            fontSize: 16,
            lineSpacing: 1.5,
            sectionSpacing: 1
          }
        };
        await resume.save();
        
        // Re-populate the template for rendering
        await resume.populate('template');
        
        console.log('Classic Traditional template assigned successfully for PDF download');
      } else {
        return res.status(400).json({
          success: false,
          error: 'No default template available for PDF generation'
        });
      }
    }

    // Initialize template renderer
    const renderer = new TemplateRenderer();
    
    // Prepare resume data for rendering
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
      styling: resume.styling || {} // Include styling data
    };

    // Render template with user data
    const renderResult = renderer.render(resume.template, resumeData);

    if (!renderResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to render template: ' + renderResult.error
      });
    }

    // Create complete HTML for PDF with template-first styling approach
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${resume.title}</title>
          <style>
              /* Basic reset and page setup */
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              :root { 
                  --template-bg: ${resume.template?.styling?.colors?.background || '#ffffff'}; 
              }
              
              body {
                  margin: 0;
                  padding: 0;
                  background: var(--template-bg);
              }
              
              /* Template CSS from renderer - HIGHEST PRIORITY */
              ${renderResult.css}
              
              /* Minimal PDF-specific overrides - LOWEST PRIORITY */
              /* Only apply essential PDF optimizations that don't conflict with template design */
              
              /* Print optimizations - minimal and non-conflicting */
              @media print {
                  body { 
                      margin: 0; 
                      padding: 0;
                  }
                  .resume { 
                      box-shadow: none;
                      margin: 0;
                      min-height: 100vh;
                      background: var(--template-bg);
                  }
                  * { 
                      -webkit-print-color-adjust: exact; 
                      color-adjust: exact;
                  }
              }
              
              /* Page margins for PDF generation with background color */
              @page :first {
                  margin: 0in 0in 0.5in 0in;
                  background-color: var(--template-bg);
              }
              
              @page {
                  margin: 0.5in 0in 0.5in 0in;
                  background-color: var(--template-bg);
              }
          </style>
      </head>
      <body>
          ${renderResult.html}
      </body>
      </html>
    `;

    // Create PDF using Puppeteer. Use Sparticuz Chromium on Linux (Render), fallback locally
    const isLinux = process.platform === 'linux';
    let executablePath;
    let launchArgs;
    let defaultViewport;
    let headlessOption;

    if (isLinux) {
      try {
        executablePath = await chromium.executablePath();
        launchArgs = chromium.args;
        defaultViewport = chromium.defaultViewport;
        headlessOption = chromium.headless;
      } catch (e) {
        // Fall through to default Puppeteer on failure
      }
    }

    if (!executablePath) {
      executablePath = typeof puppeteer.executablePath === 'function' ? puppeteer.executablePath() : undefined;
      launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ];
      defaultViewport = null;
      headlessOption = 'new';
    }

    // Use shared browser
    const pdfBuffer = await withPage(async (page) => {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      // Wait for fonts to load to ensure consistent rendering
      await page.evaluateHandle('document.fonts.ready');
      
      return await page.pdf({
      format: 'A4',
        margin: '0in', // Let CSS @page rules handle margins
      printBackground: true
      });
    });

    // Update resume export statistics
    const exportRecord = {
      format: 'pdf',
      exportedAt: new Date(),
      downloadCount: 1
    };
    resume.exports.push(exportRecord);
    
    // Update resume analytics
    if (!resume.analytics.downloads) {
      resume.analytics.downloads = 0;
    }
    resume.analytics.downloads += 1;
    resume.analytics.lastDownloaded = new Date();
    
    await resume.save();

    // Track export usage weekly (for analytics; not enforcing limits)
    await subscription.incrementUsage('export');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resume.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);

    logger.info(`Resume downloaded as PDF: ${resume.title} by user ${req.user.email} (Subscription: ${subscription.plan}, Status: ${subscription.status})`);
  } catch (error) {
    logger.error('Download PDF error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Error details:', {
      resumeId: req.params.id,
      userId: req.user?.id,
      userEmail: req.user?.email,
      errorName: error.name,
      errorMessage: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Download resume as DOCX
// @route   GET /api/resumes/:id/download/docx
// @access  Private
router.get('/:id/download/docx', protect, async (req, res) => {
  try {
    // Check subscription and export limits
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Subscription not found. Please contact support.'
      });
    }

    // Check if user can export DOCX
    if (!subscription.canExportFormat('docx')) {
      return res.status(403).json({
        success: false,
        error: 'DOCX export not available in your subscription plan. Please upgrade to Pro.'
      });
    }

    // Check export limits for non-unlimited plans
    if (!subscription.features.unlimitedExports && subscription.usage.exportsThisMonth >= 10) {
      return res.status(403).json({
        success: false,
        error: 'Export limit reached for this month. Please upgrade to Pro for unlimited exports.'
      });
    }

    let resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('template');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Handle missing template - automatically assign Classic Traditional template
    if (!resume.template) {
      console.log('Resume has no template for DOCX download, assigning Classic Traditional template as default');
      
      // Find the Classic Traditional template
      const classicTemplate = await Template.findOne({
        name: 'Classic Traditional',
        'availability.isActive': true,
        'availability.isPublic': true
      });

      if (classicTemplate) {
        // Assign the template to the resume
        resume.template = classicTemplate._id;
        resume.styling = {
          ...classicTemplate.styling,
          template: {
            headerLevel: 'h3',
            fontSize: 16,
            lineSpacing: 1.5,
            sectionSpacing: 1
          }
        };
        await resume.save();
        
        // Re-populate the template for rendering
        await resume.populate('template');
        
        console.log('Classic Traditional template assigned successfully for DOCX download');
      } else {
        return res.status(400).json({
          success: false,
          error: 'No default template available for DOCX generation'
        });
      }
    }

    // Ensure template styling is initialized for existing resumes
    if (resume.template && (!resume.styling || !resume.styling.template)) {
      console.log('Resume has template but no template styling, initializing defaults');
      if (!resume.styling) {
        resume.styling = {};
      }
      resume.styling.template = {
        headerLevel: 'h3',
        fontSize: 16,
        lineSpacing: 1.5,
        sectionSpacing: 1
      };
      await resume.save();
    }

    // Initialize template renderer
    const renderer = new TemplateRenderer();
    
    // Prepare resume data for rendering
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
      styling: resume.styling || {} // Include styling data
    };

    // Render template with user data
    const renderResult = renderer.render(resume.template, resumeData);

    if (!renderResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to render template: ' + renderResult.error
      });
    }

    // Create complete HTML for DOCX conversion with template-first approach
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${resume.title}</title>
          <style>
              /* Basic reset and DOCX setup */
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  margin: 0;
                  padding: 0;
                  line-height: 1.6;
              }
              
              /* Template CSS from renderer - HIGHEST PRIORITY */
              ${renderResult.css}
              
              /* Minimal DOCX-specific overrides - LOWEST PRIORITY */
              /* Only apply essential DOCX optimizations that don't conflict with template design */
              
              /* DOCX spacing optimizations */
              h1, h2, h3, h4, h5, h6 {
                  margin-top: 12pt;
                  margin-bottom: 6pt;
                  page-break-after: avoid;
              }
              
              p {
                  margin-bottom: 6pt;
                  page-break-inside: avoid;
              }
              
              table {
                  border-collapse: collapse;
                  width: 100%;
                  margin-bottom: 12pt;
              }
              
              td, th {
                  border: 1px solid #ddd;
                  padding: 8pt;
                  text-align: left;
              }
              
              ul, ol {
                  margin-left: 20pt;
                  margin-bottom: 6pt;
              }
              
              li {
                  margin-bottom: 3pt;
              }
          </style>
      </head>
      <body>
          <div class="resume">
              ${renderResult.html}
          </div>
      </body>
      </html>
    `;

    // Convert HTML to DOCX using puppeteer and a custom approach
    const isLinuxDocx = process.platform === 'linux';
    let docxExecutablePath;
    let docxArgs;
    let docxViewport;
    let docxHeadless;

    if (isLinuxDocx) {
      try {
        docxExecutablePath = await chromium.executablePath();
        docxArgs = chromium.args;
        docxViewport = chromium.defaultViewport;
        docxHeadless = chromium.headless;
      } catch (e) {}
    }

    if (!docxExecutablePath) {
      docxExecutablePath = typeof puppeteer.executablePath === 'function' ? puppeteer.executablePath() : undefined;
      docxArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
      docxViewport = null;
      docxHeadless = 'new';
    }

    const browser = await puppeteer.launch({
      headless: docxHeadless,
      executablePath: docxExecutablePath,
      args: docxArgs,
      defaultViewport: docxViewport
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    // For now, we'll generate a PDF and inform the user that DOCX is being worked on
    // This is a temporary solution while we implement proper HTML-to-DOCX conversion
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    });

    await browser.close();

    // Update resume export statistics
    const exportRecord = {
      format: 'docx',
      exportedAt: new Date(),
      downloadCount: 1
    };
    resume.exports.push(exportRecord);
    
    // Update resume analytics
    if (!resume.analytics.downloads) {
      resume.analytics.downloads = 0;
    }
    resume.analytics.downloads += 1;
    resume.analytics.lastDownloaded = new Date();
    
    await resume.save();

    // Update subscription usage
    await subscription.incrementUsage('export');

    const filename = `${resume.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

    // For now, return PDF instead of DOCX with a note
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
    
    logger.info(`Resume downloaded as PDF (DOCX conversion in progress): ${resume.title} by user ${req.user.email} (Subscription: ${subscription.plan}, Status: ${subscription.status})`);
  } catch (error) {
    logger.error('Download DOCX error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});





// Helper function to generate DOCX content
function generateDocxContent(docx, resume) {
  const template = resume.template;
  const templateStyling = template.styling || {};
  const resumeStyling = resume.styling || {};
  
  // Get template-specific styling
  const colors = templateStyling.colors || {};
  const fonts = templateStyling.fonts || {};
  const fontSizes = fonts.sizes || {};
  
  // Get user's custom styling options
  const userStyling = resumeStyling.template || {};
  
  // Set document default font
  const primaryFont = fonts.primary || 'Inter';
  const secondaryFont = fonts.secondary || 'Inter';
  
  // Apply user's font size if specified
  const baseFontSize = userStyling.fontSize || fontSizes.body || 11;
  const headerFontSize = userStyling.headerFontSize || (userStyling.fontSize ? userStyling.fontSize * 1.8 : fontSizes.heading || 20);
  const subheadingFontSize = userStyling.fontSize ? userStyling.fontSize * 1.3 : fontSizes.subheading || 14;
  
  // Apply user's line spacing if specified
  const lineSpacing = userStyling.lineSpacing || 1.5;
  
  // Apply user's section spacing if specified
  const sectionSpacing = userStyling.sectionSpacing || 5;
  
  // Convert color hex to RGB for officegen
  const hexToRgb = (hex) => {
    if (!hex) return '000000';
    return hex.replace('#', '').toUpperCase();
  };
  
  // Template-specific section titles based on template category
  const getSectionTitle = (section, templateCategory) => {
    const sectionTitles = {
      'classic': {
        summary: 'OBJECTIVE',
        workExperience: 'EXPERIENCE',
        education: 'EDUCATION',
        skills: 'SKILLS',
        projects: 'PROJECTS',
        certifications: 'CERTIFICATIONS',
        achievements: 'ACHIEVEMENTS'
      },
      'creative': {
        summary: 'About Me',
        workExperience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Portfolio Projects',
        certifications: 'Certifications',
        achievements: 'Achievements'
      },
      'academic': {
        summary: 'Research Interests',
        workExperience: 'Academic & Professional Experience',
        education: 'Education',
        skills: 'Technical Skills',
        projects: 'Research Projects & Publications',
        certifications: 'Professional Certifications',
        achievements: 'Awards & Honors'
      },
      'professional': {
        summary: 'Professional Summary',
        workExperience: 'Professional Experience',
        education: 'Education',
        skills: 'Core Skills',
        projects: 'Projects',
        certifications: 'Certifications',
        achievements: 'Key Achievements'
      },
      'modern': {
        summary: 'Professional Summary',
        workExperience: 'Work Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Projects',
        certifications: 'Certifications',
        achievements: 'Achievements'
      },
      'minimalist': {
        summary: '',
        workExperience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Projects',
        certifications: 'Certifications',
        achievements: 'Achievements'
      }
    };
    
    return sectionTitles[templateCategory]?.[section] || section;
  };

  // Helper function to add section title with underline
  const addSectionTitle = (title, isClassic = false) => {
    const titleParagraph = docx.createP();
    titleParagraph.addText(title, {
      font_face: primaryFont,
      font_size: subheadingFontSize, // Use subheadingFontSize for section titles
      font_weight: 'bold',
      color: hexToRgb(colors.primary || '#000000'),
      underline: isClassic // Add underline for classic template
    });
    
    // Add a line break after section titles
    docx.createP().addText('');
    
    return titleParagraph;
  };

  // Helper function to add section spacing
  const addSectionSpacing = () => {
    for (let i = 0; i < sectionSpacing; i++) {
      docx.createP().addText('');
    }
  };

  const isClassicTemplate = template.category === 'classic';

  // Add title with template styling
  const titleParagraph = docx.createP();
  titleParagraph.addText(resume.personalInfo.fullName, {
    font_face: primaryFont,
    font_size: headerFontSize, // Use headerFontSize for title
    font_weight: 'bold',
    color: hexToRgb(colors.primary || '#000000'),
    align: isClassicTemplate ? 'center' : 'left'
  });

  // Add spacing after title
  docx.createP().addText('');

  // Add contact info with template styling
  const contactParagraph = docx.createP();
  const contactInfo = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.address,
    resume.personalInfo.website
  ].filter(Boolean);
  
  contactParagraph.addText(contactInfo.join(' | '), {
    font_face: secondaryFont,
    font_size: baseFontSize, // Use baseFontSize for contact info
    color: hexToRgb(colors.secondary || '#333333'),
    align: isClassicTemplate ? 'center' : 'left'
  });

  // Add spacing
  docx.createP().addText('');

  // Add summary with template-specific title
  if (resume.summary) {
    const summaryTitle = getSectionTitle('summary', template.category);
    
    if (summaryTitle) {
      addSectionTitle(summaryTitle, isClassicTemplate);
    }
    
    const summaryContent = docx.createP();
    summaryContent.addText(resume.summary, {
      font_face: secondaryFont,
      font_size: baseFontSize, // Use baseFontSize for summary
      color: hexToRgb(colors.text || '#000000')
    });
    
    addSectionSpacing(); // Use user's section spacing
  }

  // Add work experience with template styling
  if (resume.workExperience && resume.workExperience.length > 0) {
    addSectionTitle(getSectionTitle('workExperience', template.category), isClassicTemplate);

    resume.workExperience.forEach(job => {
      const jobTitle = docx.createP();
      jobTitle.addText(`${job.jobTitle} at ${job.company}`, {
        font_face: secondaryFont,
        font_size: baseFontSize, // Use baseFontSize for job title
        font_weight: 'bold',
        color: hexToRgb(colors.text || '#000000')
      });

      const jobDates = docx.createP();
      const startDate = job.startDate ? new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      const endDate = job.isCurrentJob ? 'Present' : (job.endDate ? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
      const dateRange = endDate ? `${startDate} - ${endDate}` : startDate;
      jobDates.addText(dateRange, {
        font_face: secondaryFont,
        font_size: fontSizes.small || 10, // Use fontSizes.small for date
        color: hexToRgb(colors.secondary || '#666666')
      });

      if (job.location) {
        const locationP = docx.createP();
        locationP.addText(job.location, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for location
          color: hexToRgb(colors.secondary || '#666666')
        });
      }

      if (job.description) {
        const jobDesc = docx.createP();
        jobDesc.addText(job.description, {
          font_face: secondaryFont,
          font_size: baseFontSize, // Use baseFontSize for job description
          color: hexToRgb(colors.text || '#000000')
        });
      }

      // Add job-specific achievements if they exist
      if (job.achievements && job.achievements.length > 0) {
        job.achievements.forEach(achievement => {
          const achievementP = docx.createP();
          achievementP.addText(`• ${achievement}`, {
            font_face: secondaryFont,
            font_size: baseFontSize, // Use baseFontSize for achievement
            color: hexToRgb(colors.text || '#000000')
          });
        });
      }

      docx.createP().addText(''); // Spacing between jobs
    });
    
    addSectionSpacing(); // Use user's section spacing after work experience
  }

  // Add education with template styling
  if (resume.education && resume.education.length > 0) {
    addSectionTitle(getSectionTitle('education', template.category), isClassicTemplate);

    resume.education.forEach(edu => {
      const degree = docx.createP();
      degree.addText(`${edu.degree} - ${edu.institution}`, {
        font_face: secondaryFont,
        font_size: baseFontSize, // Use baseFontSize for education
        font_weight: 'bold',
        color: hexToRgb(colors.text || '#000000')
      });

      const eduDates = docx.createP();
      const eduStartDate = edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      const eduEndDate = edu.isCurrentlyStudying ? 'Present' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
      const eduDateRange = eduEndDate ? `${eduStartDate} - ${eduEndDate}` : eduStartDate;
      eduDates.addText(eduDateRange, {
        font_face: secondaryFont,
        font_size: fontSizes.small || 10, // Use fontSizes.small for date
        color: hexToRgb(colors.secondary || '#666666')
      });

      if (edu.location) {
        const locationP = docx.createP();
        locationP.addText(edu.location, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for location
          color: hexToRgb(colors.secondary || '#666666')
        });
      }

      if (edu.gpa) {
        const gpaP = docx.createP();
        gpaP.addText(`GPA: ${edu.gpa}`, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for GPA
          color: hexToRgb(colors.secondary || '#666666')
        });
      }

      if (edu.description) {
        const eduDesc = docx.createP();
        eduDesc.addText(edu.description, {
          font_face: secondaryFont,
          font_size: baseFontSize, // Use baseFontSize for education description
          color: hexToRgb(colors.text || '#000000')
        });
      }

      docx.createP().addText(''); // Spacing between education entries
    });
    
    addSectionSpacing(); // Use user's section spacing after education
  }

  // Add skills with template styling
  if (resume.skills && resume.skills.length > 0) {
    addSectionTitle(getSectionTitle('skills', template.category), isClassicTemplate);

    resume.skills.forEach(skillCategory => {
      const categoryParagraph = docx.createP();
      const skillNames = skillCategory.items.map(skill => skill.name).join(', ');
      categoryParagraph.addText(`${skillCategory.category}: ${skillNames}`, {
        font_face: secondaryFont,
        font_size: baseFontSize, // Use baseFontSize for skill category
        color: hexToRgb(colors.text || '#000000')
      });
    });
    
    addSectionSpacing(); // Use user's section spacing after skills
  }

  // Add projects if available
  if (resume.projects && resume.projects.length > 0) {
    addSectionTitle(getSectionTitle('projects', template.category), isClassicTemplate);

    resume.projects.forEach(project => {
      const projectTitle = docx.createP();
      projectTitle.addText(project.name, {
        font_face: secondaryFont,
        font_size: baseFontSize, // Use baseFontSize for project title
        font_weight: 'bold',
        color: hexToRgb(colors.text || '#000000')
      });

      if (project.description) {
        const projectDesc = docx.createP();
        projectDesc.addText(project.description, {
          font_face: secondaryFont,
          font_size: baseFontSize, // Use baseFontSize for project description
          color: hexToRgb(colors.text || '#000000')
        });
      }

      if (project.technologies && project.technologies.length > 0) {
        const techP = docx.createP();
        techP.addText(`Technologies: ${project.technologies.join(', ')}`, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for technologies
          color: hexToRgb(colors.secondary || '#666666')
        });
      }

      if (project.url) {
        const urlP = docx.createP();
        urlP.addText(`URL: ${project.url}`, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for URL
          color: hexToRgb(colors.accent || '#0000FF')
        });
      }

      docx.createP().addText(''); // Spacing between projects
    });
    
    addSectionSpacing(); // Use user's section spacing after projects
  }

  // Add certifications if available
  if (resume.certifications && resume.certifications.length > 0) {
    addSectionTitle(getSectionTitle('certifications', template.category), isClassicTemplate);

    resume.certifications.forEach(cert => {
      const certTitle = docx.createP();
      certTitle.addText(cert.name, {
        font_face: secondaryFont,
        font_size: baseFontSize, // Use baseFontSize for certification
        font_weight: 'bold',
        color: hexToRgb(colors.text || '#000000')
      });

      if (cert.issuer) {
        const issuerP = docx.createP();
        issuerP.addText(`Issued by: ${cert.issuer}`, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for issuer
          color: hexToRgb(colors.secondary || '#666666')
        });
      }

      if (cert.date) {
        const dateP = docx.createP();
        const certDate = new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        dateP.addText(`Date: ${certDate}`, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for date
          color: hexToRgb(colors.secondary || '#666666')
        });
      }

      docx.createP().addText(''); // Spacing between certifications
    });
    
    addSectionSpacing(); // Use user's section spacing after certifications
  }

  // Add GLOBAL ACHIEVEMENTS if available
  if (resume.achievements && resume.achievements.length > 0) {
    addSectionTitle(getSectionTitle('achievements', template.category), isClassicTemplate);

    resume.achievements.forEach(achievement => {
      const achievementTitle = docx.createP();
      achievementTitle.addText(achievement.title, {
        font_face: secondaryFont,
        font_size: baseFontSize, // Use baseFontSize for achievement title
        font_weight: 'bold',
        color: hexToRgb(colors.text || '#000000')
      });

      if (achievement.description) {
        const achievementDesc = docx.createP();
        achievementDesc.addText(achievement.description, {
          font_face: secondaryFont,
          font_size: baseFontSize, // Use baseFontSize for achievement description
          color: hexToRgb(colors.text || '#000000')
        });
      }

      if (achievement.date) {
        const dateP = docx.createP();
        const achievementDate = new Date(achievement.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        dateP.addText(`Date: ${achievementDate}`, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for date
          color: hexToRgb(colors.secondary || '#666666')
        });
      }

      if (achievement.issuer) {
        const issuerP = docx.createP();
        issuerP.addText(`Awarded by: ${achievement.issuer}`, {
          font_face: secondaryFont,
          font_size: fontSizes.small || 10, // Use fontSizes.small for issuer
          color: hexToRgb(colors.secondary || '#666666')
        });
      }

      docx.createP().addText(''); // Spacing between achievements
    });
    
    addSectionSpacing(); // Use user's section spacing after achievements
  }

  // Add languages if available
  if (resume.languages && resume.languages.length > 0) {
    addSectionTitle('Languages', isClassicTemplate);

    resume.languages.forEach(lang => {
      const langP = docx.createP();
      langP.addText(`${lang.name}: ${lang.proficiency}`, {
        font_face: secondaryFont,
        font_size: baseFontSize, // Use baseFontSize for language
        color: hexToRgb(colors.text || '#000000')
      });
    });
    
    addSectionSpacing(); // Use user's section spacing after languages
  }
}

// @desc    Get all user resumes
// @route   GET /api/resumes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { user: req.user.id };
    if (status) {
      if (status === 'active') {
        // For 'active' filter, we want resumes that are both published and isActive = true
        query.status = 'published';
        query.isActive = true;
      } else {
        query.status = status;
      }
    }

    const resumes = await Resume.find(query)
      .populate('template', 'name category preview')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Map status for frontend compatibility
    const mappedResumes = resumes.map(resume => {
      const resumeObj = resume.toObject();
      // Ensure isActive field is included
      resumeObj.isActive = resumeObj.isActive || false;
      return resumeObj;
    });

    const total = await Resume.countDocuments();

    res.json({
      success: true,
      data: {
        resumes: mappedResumes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('template', 'name category styling templateCode');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Increment view count
    resume.analytics.views += 1;
    await resume.save();



    res.json({
      success: true,
      data: {
        resume
      }
    });
  } catch (error) {
    logger.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
router.post('/', [
  protect,
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('templateId').isMongoId().withMessage('Valid template ID is required'),
  body('personalInfo.fullName').trim().isLength({ min: 1, max: 100 }).withMessage('Full name is required'),
  body('personalInfo.email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription || !subscription.canCreateResume()) {
      return res.status(403).json({
        success: false,
        error: `Weekly resume creation limit reached (${subscription.plan === 'pro' || subscription.isTrialActive() ? 7 : 3}/week).`
      });
    }

    // Verify template exists and user has access
    const template = await Template.findById(req.body.templateId);
    if (!template || !template.availability.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive template'
      });
    }

    if (!subscription.canAccessTemplate(template.availability.tier)) {
      return res.status(403).json({
        success: false,
        error: 'Template not available in your subscription plan'
      });
    }

    const resumeData = {
      user: req.user.id,
      title: req.body.title,
      template: req.body.templateId,
      personalInfo: req.body.personalInfo,
      summary: req.body.summary || '',
      workExperience: req.body.workExperience || [],
      education: req.body.education || [],
      skills: req.body.skills || [],
      projects: req.body.projects || [],
      achievements: req.body.achievements || [],
      certifications: req.body.certifications || [],
      languages: req.body.languages || [],
      customFields: req.body.customFields || [],
      styling: req.body.styling || {}
    };

    const resume = new Resume(resumeData);
    await resume.save();

    // Update subscription usage
    await subscription.incrementUsage('resume');

    // Increment template usage
    await template.incrementUsage(req.user.id);

    await resume.populate('template', 'name category preview');

    logger.info(`Resume created: ${resume.title} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: {
        resume
      }
    });
  } catch (error) {
    logger.error('Create resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
router.put('/:id', [
  protect,
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('personalInfo.fullName').optional().trim().isLength({ min: 1, max: 100 }),
  body('personalInfo.email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'personalInfo', 'summary', 'workExperience', 
      'education', 'skills', 'projects', 'achievements', 
      'certifications', 'languages', 'customFields', 'styling'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        resume[field] = req.body[field];
      }
    });

    await resume.save();
    await resume.populate('template', 'name category preview');

    res.json({
      success: true,
      data: {
        resume
      }
    });
  } catch (error) {
    logger.error('Update resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    await resume.deleteOne();

    logger.info(`Resume deleted: ${resume.title} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    logger.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Duplicate resume
// @route   POST /api/resumes/:id/duplicate
// @access  Private
router.post('/:id/duplicate', protect, async (req, res) => {
  try {
    const originalResume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!originalResume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription || !subscription.canCreateResume()) {
      return res.status(403).json({
        success: false,
        error: 'Resume creation limit reached. Please upgrade your subscription.'
      });
    }

    // Create duplicate
    const duplicateData = originalResume.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.analytics;
    delete duplicateData.exports;

    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.status = 'draft';
    duplicateData.analytics = { views: 0, shares: 0 };
    duplicateData.exports = [];

    const duplicateResume = new Resume(duplicateData);
    await duplicateResume.save();

    // Update subscription usage
    await subscription.incrementUsage('resume');

    await duplicateResume.populate('template', 'name category preview');

    res.status(201).json({
      success: true,
      data: {
        resume: duplicateResume
      }
    });
  } catch (error) {
    logger.error('Duplicate resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});



// @desc    Export resume
// @route   POST /api/resumes/:id/export
// @access  Private
router.post('/:id/export', [
  protect,
  body('format').isIn(['pdf', 'docx', 'html']).withMessage('Valid format is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('template');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const { format } = req.body;

    // Check if user can export in this format
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription.canExportFormat(format)) {
      return res.status(403).json({
        success: false,
        error: `${format.toUpperCase()} export not available in your subscription plan`
      });
    }

    // Add to export history
    const exportRecord = {
      format,
      exportedAt: new Date(),
      downloadCount: 0
    };

    resume.exports.push(exportRecord);
    await resume.save();

    // Update subscription usage
    await subscription.incrementUsage('export');

    // In a real implementation, you would generate the actual file here
    // For now, we'll return a success response
    res.json({
      success: true,
      data: {
        message: `Resume exported in ${format.toUpperCase()} format`,
        exportId: exportRecord._id,
        downloadUrl: `/api/resumes/${resume._id}/download/${exportRecord._id}`
      }
    });
  } catch (error) {
    logger.error('Export resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Share resume
// @route   POST /api/resumes/:id/share
// @access  Private
router.post('/:id/share', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Generate shareable link
    const shareToken = require('crypto').randomBytes(32).toString('hex');
    resume.shareToken = shareToken;
    resume.isPublic = true;
    resume.analytics.shares += 1;
    
    await resume.save();

    const shareUrl = `${process.env.CLIENT_URL}/resume/shared/${shareToken}`;

    res.json({
      success: true,
      data: {
        shareUrl,
        message: 'Resume shared successfully'
      }
    });
  } catch (error) {
    logger.error('Share resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get shared resume (public)
// @route   GET /api/resumes/shared/:token
// @access  Public
router.get('/shared/:token', async (req, res) => {
  try {
    const resume = await Resume.findOne({
      shareToken: req.params.token,
      isPublic: true
    }).populate('template', 'name category styling templateCode');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found or not public'
      });
    }

    // Increment view count
    resume.analytics.views += 1;
    await resume.save();

    // Remove sensitive information
    const publicResume = resume.toObject();
    delete publicResume.user;
    delete publicResume.shareToken;

    res.json({
      success: true,
      data: {
        resume: publicResume
      }
    });
  } catch (error) {
    logger.error('Get shared resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get resume analytics
// @route   GET /api/resumes/:id/analytics
// @access  Private
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const analytics = {
      views: resume.analytics.views,
      downloads: resume.analytics.downloads || 0,
      shares: resume.analytics.shares,
      lastViewed: resume.analytics.lastViewed,
      lastDownloaded: resume.analytics.lastDownloaded,
      exports: resume.exports.length,
      exportsByFormat: resume.exports.reduce((acc, exp) => {
        acc[exp.format] = (acc[exp.format] || 0) + 1;
        return acc;
      }, {}),
      totalDownloadCount: resume.exports.reduce((total, exp) => total + (exp.downloadCount || 0), 0),
      completionPercentage: resume.completionPercentage,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    };

    res.json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    logger.error('Get resume analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Toggle resume active status
// @route   PUT /api/resumes/:id/toggle-active
// @access  Private
router.put('/:id/toggle-active', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Only allow toggling for published resumes
    if (resume.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: 'Only published resumes can be activated/deactivated'
      });
    }

    // If making active, deactivate all other resumes first
    if (!resume.isActive) {
      await Resume.updateMany(
        { user: req.user.id, _id: { $ne: resume._id } },
        { isActive: false }
      );
    }

    // Toggle the active status
    resume.isActive = !resume.isActive;
    await resume.save();

    logger.info(`Resume active status toggled: ${resume.title} (${resume.isActive ? 'active' : 'inactive'}) by user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        resume,
        message: `Resume ${resume.isActive ? 'activated' : 'deactivated'} successfully`
      }
    });
  } catch (error) {
    logger.error('Toggle resume active status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 