const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');
const OptimizedTemplateRenderer = require('../utils/templateRenderer');
const sharp = require('sharp');

class PuppeteerThumbnailGenerator {
  constructor() {
    this.browser = null;
    this.outputDir = path.join(__dirname, '../thumbnails');
    this.sampleData = this.generateSampleData();
  }

  async initialize() {
    try {
      // Create output directory if it doesn't exist
      await fs.mkdir(this.outputDir, { recursive: true });

      // Launch browser
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080'
        ]
      });

      console.log('✅ Puppeteer browser initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Puppeteer:', error);
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('✅ Puppeteer browser closed');
    }
  }

  generateSampleData() {
    return {
      title: 'Senior Software Engineer',
      isFresher: false,
      personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        address: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        profilePicture: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        isAddPhoto: true,
      },
      summary: '<p>Experienced software engineer with 5+ years of experience in full-stack development. Passionate about creating scalable applications and leading development teams. Skilled in modern JavaScript frameworks, cloud technologies, and agile methodologies.</p>',
      workExperience: [
        {
          jobTitle: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          startDate: '2021-03-01',
          endDate: null,
          isCurrentJob: true,
          description: 'Lead development of customer-facing web applications using React and Node.js. Mentor junior developers and contribute to architecture decisions.',
          achievements: [
            'Improved application performance by 40% through optimization techniques',
            'Led a team of 4 developers in building a new customer portal',
            'Implemented automated testing that reduced bugs by 60%'
          ]
        },
        {
          jobTitle: 'Software Engineer',
          company: 'StartupCo',
          location: 'San Francisco, CA',
          startDate: '2019-06-01',
          endDate: '2021-02-28',
          isCurrentJob: false,
          description: 'Developed and maintained web applications using modern JavaScript frameworks.',
          achievements: [
            'Built RESTful APIs serving 1M+ requests per day',
            'Collaborated with design team to implement responsive UI components',
            'Reduced deployment time by 50% through CI/CD pipeline improvements'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          startDate: '2015-09-01',
          endDate: '2019-05-30',
          isCurrentlyStudying: false,
          gpa: 3.8,
          description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems'
        },
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          startDate: '2015-09-01',
          endDate: '2019-05-30',
          isCurrentlyStudying: false,
          gpa: 3.8,
          description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems'
        },
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          startDate: '2015-09-01',
          endDate: '2019-05-30',
          isCurrentlyStudying: false,
          gpa: 3.8,
          description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems'
        }
      ],
      skills: [
        {
          category: 'Programming Languages',
          items: [
            { name: 'JavaScript', level: 'expert' },
            { name: 'Python', level: 'advanced' },
            { name: 'Java', level: 'intermediate' },
            { name: 'TypeScript', level: 'advanced' }
          ]
        },
        {
          category: 'Frameworks & Libraries',
          items: [
            { name: 'React', level: 'expert' },
            { name: 'Node.js', level: 'advanced' },
            { name: 'Express.js', level: 'advanced' },
            { name: 'Django', level: 'intermediate' }
          ]
        },
        {
          category: 'Tools & Technologies',
          items: [
            { name: 'Git', level: 'expert' },
            { name: 'Docker', level: 'advanced' },
            { name: 'AWS', level: 'intermediate' },
            { name: 'MongoDB', level: 'advanced' }
          ]
        }
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce application with payment processing and inventory management',
          technologies: ['React', 'Node.js', 'MongoDB', 'Razorpay API'],
          url: 'https://ecommerce-demo.com',
          githubUrl: 'https://github.com/johndoe/ecommerce-platform',
          startDate: '2020-01-01',
          endDate: '2020-06-30'
        },
        {
          name: 'Task Management App',
          description: 'Collaborative task management application with real-time updates',
          technologies: ['React', 'Socket.io', 'PostgreSQL'],
          url: 'https://taskapp-demo.com',
          githubUrl: 'https://github.com/johndoe/task-app',
          startDate: '2019-08-01',
          endDate: '2019-12-31'
        }
      ],
      achievements: [
        {
          title: 'Best Innovation Award',
          description: 'Recognized for developing an innovative solution that improved customer satisfaction by 25%',
          date: '2022-12-01',
          issuer: 'Tech Corp'
        },
        {
          title: 'Outstanding Graduate',
          description: 'Graduated Summa Cum Laude with highest honors in Computer Science',
          date: '2019-05-30',
          issuer: 'UC Berkeley'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2022-03-15',
          expiryDate: '2025-03-15',
          credentialId: 'AWS-CSA-123456',
          url: 'https://aws.amazon.com/certification/'
        },
        {
          name: 'React Developer Certification',
          issuer: 'Meta',
          date: '2021-08-20',
          credentialId: 'META-REACT-789012'
        }
      ],
      languages: [
        { name: 'English', proficiency: 'native' },
        { name: 'Spanish', proficiency: 'conversational' },
        { name: 'French', proficiency: 'basic' }
      ],
      customFields: []
    };
  }

  // Register custom Handlebars helpers
  registerHelpers() {
    handlebars.registerHelper('formatDate', (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    });

    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('unless', function (conditional, options) {
      if (!conditional) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
  }

  async generateThumbnail(template, options = {}) {
    if (!this.browser) {
      throw new Error('Puppeteer browser not initialized. Call initialize() first.');
    }

    const {
      width = 300,
      height = 400,
      quality = 90,
      format = 'png',
      filename = null
    } = options;

    try {
      // Register Handlebars helpers
      this.registerHelpers();

      // Compile template HTML
      // const htmlTemplate = handlebars.compile(template.templateCode.html);
      // const compiledHTML = htmlTemplate(this.sampleData);
      const renderer = new OptimizedTemplateRenderer();

      this.sampleData.styling = {
        ...this.sampleData.styling,
        template: {
            headerLevel: 'h3',
            fontSize: 16,
            lineSpacing: 1.3,
            sectionSpacing: 1,
            fontFamily: 'Arial'
          }
      }

      // Prepare resume data for rendering
      const resumeData = {
        title: this.sampleData.title,
        personalInfo: this.sampleData.personalInfo,
        summary: this.sampleData.summary,
        workExperience: this.sampleData.workExperience,
        education: this.sampleData.education,
        skills: this.sampleData.skills,
        projects: this.sampleData.projects,
        achievements: this.sampleData.achievements,
        certifications: this.sampleData.certifications,
        languages: this.sampleData.languages,
        customFields: this.sampleData.customFields,
        styling: this.sampleData.styling || {} // Include styling data
      };
      const renderResult = renderer.render(template, resumeData);

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/47.0.0/ckeditor5.css" />
          <title>${template.title}</title>
          <style>
              /* Basic reset and page setup */
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              :root { 
                  --template-bg: ${resumeData.styling?.colors?.background || '#ffffff'}; 
              }
              
              body {
                  margin: 0;
                  padding: 0;
                  background: ${resumeData.styling?.colors?.background || '#ffffff'};
              }
              
              /* Template CSS from renderer - HIGHEST PRIORITY */
              ${renderResult.css}
              
              /* Minimal PDF-specific overrides - LOWEST PRIORITY */
              /* Only apply essential PDF optimizations that don't conflict with template design */
              
              /* Print optimizations - minimal and non-conflicting */
              @media print {
                  body {
                      background: ${resumeData.styling?.colors?.background || '#ffffff'} !important;
                  }
                  .resume { 
                      box-shadow: none;
                      background: ${resumeData.styling?.colors?.background || '#ffffff'} !important;
                  }
                  * { 
                      -webkit-print-color-adjust: exact; 
                      color-adjust: exact;
                  }
              }
              
              /* Page margins for PDF generation */
              @page :first {
                  margin: 0in 0in 0.5in 0in;
              }
              
              @page {
                  margin: 0.5in 0in 0.5in 0in;
              }
              
              /* Remove bottom spacing from the last element for PDF */
              .resume > *:last-child,
              .resume section:last-child,
              .resume .section:last-child,
              .resume .work-experience:last-child,
              .resume .education:last-child,
              .resume .skills:last-child,
              .resume .projects:last-child,
              .resume .achievements:last-child,
              .resume .certifications:last-child,
              .resume .languages:last-child,
              .resume .summary:last-child,
              .resume .custom-fields:last-child,
              .resume .main-content > *:last-child,
              .resume .sidebar > *:last-child,
              .resume .content-grid > *:last-child {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
              }

              .profile-image-container {
                            display: flex;
                            justify-content: center;
                            align-items:center;
                            }
                        .profile-image {
                            width: 10rem;height: 10rem;border-radius: 99999px;border: 4px solid white;
                            object-fit: cover;
                        }
          </style>
      </head>
      <body>
          ${renderResult.html}
      </body>
      </html>
    `;

      // Create new page
      const page = await this.browser.newPage();

      // Set viewport to match the template dimensions
      await page.setViewport({
        width: Math.max(width * 2, 800),
        height: Math.max(height * 2, 1000),
        deviceScaleFactor: 2
      });

      // Load HTML content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');
      await page.emulateMediaType('print');

      // Generate filename if not provided
      const thumbnailFilename = filename || `${template.name.toLowerCase().replace(/\s+/g, '-')}-thumbnail.${format}`;
      const thumbnailPath = path.join(this.outputDir, thumbnailFilename);

      // Take screenshot with proper clipping
      const screenshotOptions = {
        path: thumbnailPath,
        width,
        height,
        type: format,
        quality: format === 'jpeg' ? quality : undefined,
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: Math.max(width * 2, 800),
          height: Math.max(height * 2, 1000)
        }
      };

      const screenshotBuffer = await page.screenshot(screenshotOptions);
      const whiteBorderHeight = 60; // in pixels

      // Add white border using sharp
      const finalImage = await sharp(screenshotBuffer).extend({
        top: 0,
        bottom: whiteBorderHeight,
        left: 0,
        right: 0,
        background: 'white'
      })
        .toBuffer();
      await sharp(finalImage).toFile(thumbnailPath);

      // Close page
      await page.close();

      console.log(`✅ Generated thumbnail: ${thumbnailFilename}`);

      return {
        success: true,
        path: thumbnailPath,
        filename: thumbnailFilename,
        url: `/thumbnails/${thumbnailFilename}`,
        width,
        height,
        format
      };

    } catch (error) {
      console.error(`❌ Error generating thumbnail for ${template.name}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateThumbnailsForAllTemplates(templates, options = {}) {
    const results = [];

    console.log(`🔄 Generating thumbnails for ${templates.length} templates...`);

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      console.log(`📸 Processing ${i + 1}/${templates.length}: ${template.name}`);

      const result = await this.generateThumbnail(template, options);
      results.push({
        templateId: template._id,
        templateName: template.name,
        ...result
      });

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Thumbnail generation complete. ${results.filter(r => r.success).length}/${results.length} successful`);

    return results;
  }

  async generateOptimizedThumbnails(templates, options = {}) {
    const defaultOptions = {
      width: 300,
      height: 400,
      quality: 85,
      format: 'webp' // More efficient than PNG/JPEG
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return await this.generateThumbnailsForAllTemplates(templates, mergedOptions);
  }

  // Generate thumbnails in multiple sizes
  async generateMultiSizeThumbnails(template, sizes = []) {
    const defaultSizes = [
      { width: 150, height: 200, suffix: 'small' },
      { width: 300, height: 400, suffix: 'medium' },
      { width: 600, height: 800, suffix: 'large' }
    ];

    const sizesToGenerate = sizes.length > 0 ? sizes : defaultSizes;
    const results = [];

    for (const size of sizesToGenerate) {
      const filename = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${size.suffix}.webp`;
      const result = await this.generateThumbnail(template, {
        width: size.width,
        height: size.height,
        format: 'webp',
        filename
      });

      results.push({
        size: size.suffix,
        ...result
      });
    }

    return results;
  }

  // Generate data URI for inline embedding
  async generateDataURI(template, options = {}) {
    const { width = 300, height = 400, format = 'png' } = options;

    if (!this.browser) {
      throw new Error('Puppeteer browser not initialized. Call initialize() first.');
    }

    try {
      // Register Handlebars helpers
      this.registerHelpers();

      // Compile template HTML
      const htmlTemplate = handlebars.compile(template.templateCode.html);
      const compiledHTML = htmlTemplate(this.sampleData);

      // Create full HTML document with minimal styling to match actual rendering
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template.name}</title>
          <style>
            /* Basic reset and page setup */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            :root { 
              --template-bg: ${template.styling.colors.background || '#ffffff'}; 
            }
            
            body {
              margin: 0;
              padding: 10px;
              background: var(--template-bg);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            /* Template CSS from template - use as-is without modifications */
            ${template.templateCode.css}
            
            /* Minimal thumbnail-specific adjustments for better preview */
            .resume {
              max-width: 8.5in;
              margin: 0 auto;
              background: var(--template-bg);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              border-radius: 4px;
              overflow: hidden;
            }
            
            /* Ensure consistent rendering across templates */
            .resume * {
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          </style>
        </head>
        <body>
          ${compiledHTML}
        </body>
        </html>
      `;

      // Create new page
      const page = await this.browser.newPage();

      // Set viewport to match the template dimensions
      await page.setViewport({
        width: Math.max(width * 2, 800),
        height: Math.max(height * 2, 1000),
        deviceScaleFactor: 2
      });

      // Load HTML content
      await page.setContent(fullHTML, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      // Take screenshot as buffer with proper clipping
      const screenshotBuffer = await page.screenshot({
        type: format,
        quality: format === 'jpeg' ? 85 : undefined,
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: Math.max(width * 2, 800),
          height: Math.max(height * 2, 1000)
        }
      });

      // Close page
      await page.close();

      // Convert to data URI
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataURI = `data:${mimeType};base64,${screenshotBuffer.toString('base64')}`;

      console.log(`✅ Generated data URI for ${template.name}`);

      return {
        success: true,
        dataURI,
        mimeType,
        size: screenshotBuffer.length
      };

    } catch (error) {
      console.error(`❌ Error generating data URI for ${template.name}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PuppeteerThumbnailGenerator;