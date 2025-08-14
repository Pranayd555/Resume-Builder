const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, requireSubscription } = require('../middleware/auth');
const Template = require('../models/Template');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Seed default templates (Development only)
// @route   POST /api/templates/seed
// @access  Private/Admin
router.post('/seed', protect, authorize('admin'), async (req, res) => {
  try {
    // Check if templates already exist
    const existingTemplates = await Template.countDocuments();
    if (existingTemplates > 0) {
      return res.status(400).json({
        success: false,
        error: 'Templates already exist. Use individual create endpoint to add more.'
      });
    }

    const defaultTemplates = [
      {
        name: 'Modern Professional',
        description: 'A clean, modern template perfect for professionals',
        category: 'modern',
        preview: {
          thumbnail: {
            url: 'https://via.placeholder.com/300x400/2563eb/ffffff?text=Modern+Professional'
          }
        },
        layout: {
          type: 'two-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 3, isRequired: false, isVisible: true },
            { name: 'education', position: 4, isRequired: false, isVisible: true },
            { name: 'skills', position: 5, isRequired: false, isVisible: true },
            { name: 'projects', position: 6, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            text: '#1f2937',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            sizes: {
              heading: 24,
              subheading: 18,
              body: 12
            }
          },
          spacing: {
            section: 16,
            item: 8
          }
        },
        availability: {
          tier: 'free',
          isPublic: true,
          isActive: true
        },
        templateCode: {
          html: `
            <div class="resume modern-professional">
              <header class="header">
                <h1>{{personalInfo.fullName}}</h1>
                <div class="contact-info">
                  <span>{{personalInfo.email}}</span>
                  <span>{{personalInfo.phone}}</span>
                  <span>{{personalInfo.address}}</span>
                </div>
              </header>
              <main class="content">
                {{#if summary}}
                <section class="summary">
                  <h2>Professional Summary</h2>
                  <p>{{summary}}</p>
                </section>
                {{/if}}
                <!-- Add more sections as needed -->
              </main>
            </div>
          `,
          css: `
            .resume.modern-professional {
              font-family: Inter, sans-serif;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 1in;
              background: white;
              color: #1f2937;
            }
            .header h1 {
              font-size: 24px;
              color: #2563eb;
              margin-bottom: 8px;
            }
            .contact-info {
              display: flex;
              gap: 16px;
              flex-wrap: wrap;
            }
            section {
              margin: 16px 0;
            }
            h2 {
              font-size: 18px;
              color: #2563eb;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 4px;
            }
          `
        },
        creator: req.user.id,
        tags: ['professional', 'modern', 'clean', 'two-column']
      },
      {
        name: 'Classic Traditional',
        description: 'A timeless, traditional resume template',
        category: 'classic',
        preview: {
          thumbnail: {
            url: 'https://via.placeholder.com/300x400/64748b/ffffff?text=Classic+Traditional'
          }
        },
        layout: {
          type: 'single-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 3, isRequired: false, isVisible: true },
            { name: 'education', position: 4, isRequired: false, isVisible: true },
            { name: 'skills', position: 5, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#000000',
            secondary: '#64748b',
            text: '#000000',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Times New Roman',
            secondary: 'Times New Roman',
            sizes: {
              heading: 20,
              subheading: 16,
              body: 11
            }
          },
          spacing: {
            section: 12,
            item: 6
          }
        },
        availability: {
          tier: 'free',
          isPublic: true,
          isActive: true
        },
        templateCode: {
          html: `
            <div class="resume classic-traditional">
              <header class="header">
                <h1>{{personalInfo.fullName}}</h1>
                <div class="contact-info">
                  {{personalInfo.email}} | {{personalInfo.phone}} | {{personalInfo.address}}
                </div>
              </header>
              <main class="content">
                {{#if summary}}
                <section class="summary">
                  <h2>OBJECTIVE</h2>
                  <p>{{summary}}</p>
                </section>
                {{/if}}
                <!-- Add more sections as needed -->
              </main>
            </div>
          `,
          css: `
            .resume.classic-traditional {
              font-family: 'Times New Roman', serif;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 1in;
              background: white;
              color: black;
            }
            .header h1 {
              font-size: 20px;
              text-align: center;
              margin-bottom: 6px;
              text-transform: uppercase;
            }
            .contact-info {
              text-align: center;
              margin-bottom: 12px;
            }
            section {
              margin: 12px 0;
            }
            h2 {
              font-size: 16px;
              text-transform: uppercase;
              border-bottom: 1px solid black;
              padding-bottom: 2px;
            }
          `
        },
        creator: req.user.id,
        tags: ['classic', 'traditional', 'formal', 'single-column']
      },
      {
        name: 'Creative Designer',
        description: 'A creative template for designers and creative professionals',
        category: 'creative',
        preview: {
          thumbnail: {
            url: 'https://via.placeholder.com/300x400/ec4899/ffffff?text=Creative+Designer'
          }
        },
        layout: {
          type: 'sidebar',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 3, isRequired: false, isVisible: true },
            { name: 'education', position: 4, isRequired: false, isVisible: true },
            { name: 'skills', position: 5, isRequired: false, isVisible: true },
            { name: 'projects', position: 6, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#ec4899',
            secondary: '#8b5cf6',
            text: '#1f2937',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Montserrat',
            secondary: 'Open Sans',
            sizes: {
              heading: 26,
              subheading: 16,
              body: 11
            }
          },
          spacing: {
            section: 20,
            item: 10
          }
        },
        availability: {
          tier: 'pro',
          isPublic: true,
          isActive: true
        },
        templateCode: {
          html: `
            <div class="resume creative-designer">
              <aside class="sidebar">
                <div class="profile">
                  <h1>{{personalInfo.fullName}}</h1>
                  <div class="contact">
                    <p>{{personalInfo.email}}</p>
                    <p>{{personalInfo.phone}}</p>
                    <p>{{personalInfo.address}}</p>
                  </div>
                </div>
              </aside>
              <main class="main-content">
                {{#if summary}}
                <section class="summary">
                  <h2>About Me</h2>
                  <p>{{summary}}</p>
                </section>
                {{/if}}
                <!-- Add more sections as needed -->
              </main>
            </div>
          `,
          css: `
            .resume.creative-designer {
              font-family: 'Open Sans', sans-serif;
              max-width: 8.5in;
              margin: 0 auto;
              display: grid;
              grid-template-columns: 250px 1fr;
              background: white;
              color: #1f2937;
            }
            .sidebar {
              background: linear-gradient(135deg, #ec4899, #8b5cf6);
              color: white;
              padding: 30px 20px;
            }
            .sidebar h1 {
              font-family: 'Montserrat', sans-serif;
              font-size: 26px;
              margin-bottom: 20px;
            }
            .main-content {
              padding: 30px;
            }
            h2 {
              font-size: 16px;
              color: #ec4899;
              margin-bottom: 10px;
            }
          `
        },
        creator: req.user.id,
        tags: ['creative', 'designer', 'colorful', 'sidebar']
      }
    ];

    // Create all templates
    const createdTemplates = await Template.insertMany(defaultTemplates);

    logger.info(`${createdTemplates.length} default templates created by admin ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: {
        message: `${createdTemplates.length} default templates created successfully`,
        templates: createdTemplates.map(t => ({
          id: t._id,
          name: t.name,
          category: t.category,
          tier: t.availability.tier
        }))
      }
    });
  } catch (error) {
    logger.error('Seed templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const tier = req.query.tier;
    const search = req.query.search;

    let query = {
      'availability.isPublic': true,
      'availability.isActive': true
    };

    if (category) {
      query.category = category;
    }

    if (tier) {
      query['availability.tier'] = tier;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const templates = await Template.find(query)
      .select('name description category preview availability usage tags version')
      .sort({ 'usage.totalUses': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Template.countDocuments(query);

    // Get categories for filtering
    const categories = await Template.distinct('category', {
      'availability.isPublic': true,
      'availability.isActive': true
    });

    res.json({
      success: true,
      data: {
        templates,
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      'availability.isPublic': true,
      'availability.isActive': true
    }).populate('creator', 'firstName lastName');

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: {
        template
      }
    });
  } catch (error) {
    logger.error('Get template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get template code (requires access)
// @route   GET /api/templates/:id/code
// @access  Private
router.get('/:id/code', protect, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      'availability.isActive': true
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check if user has access to this template
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription.canAccessTemplate(template.availability.tier)) {
      return res.status(403).json({
        success: false,
        error: 'Template not available in your subscription plan'
      });
    }

    res.json({
      success: true,
      data: {
        templateCode: template.templateCode,
        styling: template.styling,
        layout: template.layout
      }
    });
  } catch (error) {
    logger.error('Get template code error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create template (Admin only)
// @route   POST /api/templates
// @access  Private/Admin
router.post('/', [
  protect,
  authorize('admin'),
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('category').isIn(['modern', 'classic', 'creative', 'minimalist', 'professional', 'academic']),
  body('templateCode.html').notEmpty().withMessage('HTML template code is required'),
  body('templateCode.css').notEmpty().withMessage('CSS template code is required'),
  body('preview.thumbnail.url').isURL().withMessage('Valid thumbnail URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const templateData = {
      ...req.body,
      creator: req.user.id
    };

    const template = new Template(templateData);
    await template.save();

    logger.info(`Template created: ${template.name} by admin ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: {
        template
      }
    });
  } catch (error) {
    logger.error('Create template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update template (Admin only)
// @route   PUT /api/templates/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  authorize('admin'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('category').optional().isIn(['modern', 'classic', 'creative', 'minimalist', 'professional', 'academic'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const template = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: {
        template
      }
    });
  } catch (error) {
    logger.error('Update template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete template (Admin only)
// @route   DELETE /api/templates/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check if template is being used
    const Resume = require('../models/Resume');
    const usageCount = await Resume.countDocuments({ template: req.params.id });

    if (usageCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Template is being used by ${usageCount} resume(s). Cannot delete.`
      });
    }

    await template.deleteOne();

    logger.info(`Template deleted: ${template.name} by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    logger.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Rate template
// @route   POST /api/templates/:id/rate
// @access  Private
router.post('/:id/rate', [
  protect,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    const { rating, comment } = req.body;

    await template.addReview(req.user.id, rating, comment);

    res.json({
      success: true,
      data: {
        message: 'Template rated successfully',
        averageRating: template.averageRating
      }
    });
  } catch (error) {
    logger.error('Rate template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get template reviews
// @route   GET /api/templates/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const template = await Template.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'firstName lastName',
        options: {
          skip,
          limit,
          sort: { 'reviews.createdAt': -1 }
        }
      });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    const reviews = template.reviews
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: template.averageRating,
        totalReviews: template.reviews.length,
        pagination: {
          page,
          limit,
          total: template.reviews.length,
          pages: Math.ceil(template.reviews.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get template reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get popular templates
// @route   GET /api/templates/popular
// @access  Public
router.get('/featured/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const popularTemplates = await Template.find({
      'availability.isPublic': true,
      'availability.isActive': true
    })
      .select('name description category preview availability usage tags')
      .sort({ 'usage.totalUses': -1 })
      .limit(limit);

    res.json({
      success: true,
      data: {
        templates: popularTemplates
      }
    });
  } catch (error) {
    logger.error('Get popular templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get new templates
// @route   GET /api/templates/featured/new
// @access  Public
router.get('/featured/new', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const newTemplates = await Template.find({
      'availability.isPublic': true,
      'availability.isActive': true
    })
      .select('name description category preview availability usage tags')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: {
        templates: newTemplates
      }
    });
  } catch (error) {
    logger.error('Get new templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get template usage statistics (Admin only)
// @route   GET /api/templates/:id/stats
// @access  Private/Admin
router.get('/:id/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    const Resume = require('../models/Resume');
    
    // Get usage over time
    const usageOverTime = await Resume.aggregate([
      { $match: { template: template._id } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get user demographics
    const userDemographics = await Resume.aggregate([
      { $match: { template: template._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$userInfo.subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalUses: template.usage.totalUses,
      uniqueUsers: template.usage.uniqueUsers,
      averageRating: template.averageRating,
      totalReviews: template.reviews.length,
      usageOverTime,
      userDemographics,
      createdAt: template.createdAt
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    logger.error('Get template stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 