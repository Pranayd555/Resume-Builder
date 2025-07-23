const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');

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
      personalInfo: {
        fullName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        address: 'New York, NY',
        linkedin: 'linkedin.com/in/johnsmith',
        website: 'johnsmith.dev'
      },
      summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers.',
      workExperience: [
        {
          jobTitle: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'New York, NY',
          startDate: '2022-01-01',
          endDate: null,
          isCurrentJob: true,
          description: 'Lead development of microservices architecture serving 1M+ users',
          achievements: [
            'Reduced system latency by 40% through optimization',
            'Mentored 5 junior developers and improved team productivity',
            'Implemented CI/CD pipeline reducing deployment time by 60%'
          ]
        },
        {
          jobTitle: 'Software Engineer',
          company: 'StartupXYZ',
          location: 'San Francisco, CA',
          startDate: '2020-06-01',
          endDate: '2021-12-31',
          isCurrentJob: false,
          description: 'Developed full-stack applications using React, Node.js, and AWS',
          achievements: [
            'Built customer dashboard serving 10K+ users',
            'Integrated payment processing system with 99.9% uptime'
          ]
        }
      ],
      education: [
        {
          degree: 'Master of Science in Computer Science',
          institution: 'Stanford University',
          location: 'Stanford, CA',
          startDate: '2018-09-01',
          endDate: '2020-05-01',
          isCurrentlyStudying: false,
          gpa: '3.8',
          description: 'Specialized in Machine Learning and Distributed Systems'
        },
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'UC Berkeley',
          location: 'Berkeley, CA',
          startDate: '2014-09-01',
          endDate: '2018-05-01',
          isCurrentlyStudying: false,
          gpa: '3.6'
        }
      ],
      skills: [
        {
          category: 'Programming Languages',
          items: [
            { name: 'JavaScript', level: 90 },
            { name: 'Python', level: 85 },
            { name: 'Java', level: 80 },
            { name: 'TypeScript', level: 85 }
          ]
        },
        {
          category: 'Frameworks & Libraries',
          items: [
            { name: 'React', level: 90 },
            { name: 'Node.js', level: 85 },
            { name: 'Express.js', level: 85 },
            { name: 'Django', level: 75 }
          ]
        },
        {
          category: 'Tools & Technologies',
          items: [
            { name: 'AWS', level: 80 },
            { name: 'Docker', level: 75 },
            { name: 'Git', level: 90 },
            { name: 'MongoDB', level: 80 }
          ]
        }
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with React frontend and Node.js backend',
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          url: 'https://github.com/johnsmith/ecommerce',
          startDate: '2023-01-01',
          endDate: '2023-06-01'
        },
        {
          name: 'Real-time Chat Application',
          description: 'WebSocket-based chat application with real-time messaging',
          technologies: ['Socket.io', 'React', 'Express.js', 'Redis'],
          url: 'https://github.com/johnsmith/chatapp',
          startDate: '2022-08-01',
          endDate: '2022-12-01'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-03-01',
          credentialId: 'AWS-SA-2023-001'
        },
        {
          name: 'Google Cloud Professional Developer',
          issuer: 'Google Cloud',
          date: '2022-11-01',
          credentialId: 'GCP-PD-2022-001'
        }
      ],
      achievements: [
        {
          title: 'Employee of the Year',
          description: 'Recognized for outstanding contribution to company growth',
          date: '2023-01-01',
          issuer: 'Tech Corp'
        },
        {
          title: 'Hackathon Winner',
          description: 'First place in company-wide innovation hackathon',
          date: '2022-06-01',
          issuer: 'StartupXYZ'
        }
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Conversational' },
        { name: 'French', proficiency: 'Basic' }
      ]
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
    handlebars.registerHelper('unless', function(conditional, options) {
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
      const htmlTemplate = handlebars.compile(template.templateCode.html);
      const compiledHTML = htmlTemplate(this.sampleData);

      // Create full HTML document
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template.name}</title>
          <style>
            ${template.templateCode.css}
            
            /* Additional styles for better thumbnails */
            body {
              margin: 0;
              padding: 20px;
              font-family: ${template.styling.fonts.primary}, sans-serif;
              background: ${template.styling.colors.background};
              color: ${template.styling.colors.text};
              transform: scale(0.8);
              transform-origin: top left;
              width: 125%;
              height: 125%;
            }
            
            .resume {
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            
            /* Ensure text is readable in thumbnail */
            * {
              font-size: max(8px, 1em) !important;
              line-height: 1.2 !important;
            }
            
            /* Hide very small text elements */
            .small-text,
            .fine-print {
              display: none;
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
      
      // Set viewport
      await page.setViewport({
        width: Math.max(width * 3, 900),
        height: Math.max(height * 3, 1200),
        deviceScaleFactor: 2
      });

      // Load HTML content
      await page.setContent(fullHTML, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      // Generate filename if not provided
      const thumbnailFilename = filename || `${template.name.toLowerCase().replace(/\s+/g, '-')}-thumbnail.${format}`;
      const thumbnailPath = path.join(this.outputDir, thumbnailFilename);

      // Take screenshot
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
          width: Math.max(width * 3, 900),
          height: Math.max(height * 3, 1200)
        }
      };

      await page.screenshot(screenshotOptions);

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

      // Create full HTML document
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template.name}</title>
          <style>
            ${template.templateCode.css}
            body {
              margin: 0;
              padding: 20px;
              font-family: ${template.styling.fonts.primary}, sans-serif;
              background: ${template.styling.colors.background};
              color: ${template.styling.colors.text};
              transform: scale(0.8);
              transform-origin: top left;
              width: 125%;
              height: 125%;
            }
            .resume {
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            * {
              font-size: max(8px, 1em) !important;
              line-height: 1.2 !important;
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
      
      // Set viewport
      await page.setViewport({
        width: Math.max(width * 3, 900),
        height: Math.max(height * 3, 1200),
        deviceScaleFactor: 2
      });

      // Load HTML content
      await page.setContent(fullHTML, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      // Take screenshot as buffer
      const screenshotBuffer = await page.screenshot({
        type: format,
        quality: format === 'jpeg' ? 85 : undefined,
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: Math.max(width * 3, 900),
          height: Math.max(height * 3, 1200)
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