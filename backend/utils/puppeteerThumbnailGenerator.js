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
      "personalInfo": {
        "fullName": "John Doe",
        "email": "John@yopmail.com",
        "phone": "+91 7689878934",
        "address": "DN-53, Salt Lake, Sector-v",
        "website": "",
        "linkedin": "https://linkedin.com/john",
        "github": "https://github.com/john"
    },
    "styling": {
        "template": {
            "headerLevel": "h3",
            "headerFontSize": 18,
            "fontSize": 12,
            "lineSpacing": 1.3,
            "sectionSpacing": 1
        },
        "header": {
            "labelSize": "medium",
            "size": "medium",
            "spacing": "normal",
            "textSize": "medium"
        },
        "fontFamily": "Inter",
        "fontSize": 12,
        "primaryColor": "#2563eb",
        "secondaryColor": "#64748b"
    },
    "analytics": {
        "views": 52,
        "shares": 0,
        "lastViewed": "2025-08-29T16:01:43.307Z",
        "downloads": 6,
        "lastDownloaded": "2025-08-29T16:00:48.195Z"
    },
    "title": "aaaBBDJSd",
    "summary": "<p>A Senior Software Developer is a highly experienced professional responsible for designing, defveloping, testing, and maintaining complex software applications. They lead development teams, make architectural decisions, mentor junior developers, and ensure high-quality code through best practices and efficient workflows.ffcvvcvcvcv</p><p>fdfd</p>",
    "workExperience": [
        {
            "jobTitle": "trainee",
            "company": "TCS",
            "location": "Kolkata",
            "startDate": "2018-01-04T00:00:00.000Z",
            "endDate": null,
            "isCurrentJob": true,
            "description": "<ul><li>A Senior Software Developer is a highly experienced professional responsible for designing, developing, testing, and maintaining complex software applications.&nbsp;</li><li>They lead development teams, make architectural decisions, mentor junior developers, and ensure high-quality code through best practices and efficient workflows.</li></ul>",
            "achievements": [],
            "_id": "68b1be4539fdbe1114618348",
            "id": "68b1be4539fdbe1114618348"
        },
        {
            "jobTitle": "Software developer",
            "company": "ITC",
            "location": "Kolkata",
            "startDate": "2022-07-19T00:00:00.000Z",
            "endDate": null,
            "isCurrentJob": true,
            "description": "<ol><li>A Senior Software Developer is a highly experienced professional responsible for designing, developing, testing, and maintaining complex software applications.&nbsp;</li><li>They lead development teams, make architectural decisions, mentor junior developers, and ensure high-quality code through best practices and efficient workflows.</li></ol>",
            "achievements": [],
            "_id": "68b1be4539fdbe1114618349",
            "id": "68b1be4539fdbe1114618349"
        }
    ],
    "education": [
        {
            "degree": "Btech",
            "institution": "MAKAUT",
            "location": "Kolkata",
            "startDate": "2013-02-05T00:00:00.000Z",
            "endDate": "2018-05-31T00:00:00.000Z",
            "isCurrentlyStudying": false,
            "gpa": 7.6,
            "description": "",
            "_id": "68b1be4539fdbe111461834a",
            "id": "68b1be4539fdbe111461834a"
        },
        {
            "degree": "12th",
            "institution": "A B C High School",
            "location": "Kolkata",
            "startDate": "2013-02-05T00:00:00.000Z",
            "endDate": "2018-05-31T00:00:00.000Z",
            "isCurrentlyStudying": false,
            "gpa": 7.6,
            "description": "",
            "_id": "68b1be4539fdbe111461834a",
            "id": "68b1be4539fdbe111461834a"
        },
        {
            "degree": "10th",
            "institution": "D A V Public School",
            "location": "Kolkata",
            "startDate": "2013-02-05T00:00:00.000Z",
            "endDate": "2018-05-31T00:00:00.000Z",
            "isCurrentlyStudying": false,
            "gpa": 7.6,
            "description": "",
            "_id": "68b1be4539fdbe111461834a",
            "id": "68b1be4539fdbe111461834a"
        }
    ],
    "skills": [
        {
            "category": "Technical",
            "items": [
                {
                    "name": "Angular",
                    "level": "intermediate",
                    "_id": "68b1be4539fdbe111461834c",
                    "id": "68b1be4539fdbe111461834c"
                },
                {
                    "name": "Javascript",
                    "level": "intermediate",
                    "_id": "68b1be4539fdbe111461834d",
                    "id": "68b1be4539fdbe111461834d"
                },
                {
                    "name": "HTML",
                    "level": "intermediate",
                    "_id": "68b1be4539fdbe111461834e",
                    "id": "68b1be4539fdbe111461834e"
                },
                {
                    "name": "CSS",
                    "level": "intermediate",
                    "_id": "68b1be4539fdbe111461834f",
                    "id": "68b1be4539fdbe111461834f"
                },
                {
                    "name": "React",
                    "level": "intermediate",
                    "_id": "68b1be4539fdbe1114618350",
                    "id": "68b1be4539fdbe1114618350"
                }
            ],
            "_id": "68b1be4539fdbe111461834b",
            "id": "68b1be4539fdbe111461834b"
        },
        {
            "category": "Management skills",
            "items": [
                {
                    "name": "Jira",
                    "level": "intermediate",
                    "_id": "68b1be4539fdbe1114618352",
                    "id": "68b1be4539fdbe1114618352"
                },
                {
                    "name": "Azure",
                    "level": "intermediate",
                    "_id": "68b1be4539fdbe1114618353",
                    "id": "68b1be4539fdbe1114618353"
                },
                {
                    "name": "Github",
                    "level": "intermediate",
                    "_id": "68b1be4539fdbe1114618354",
                    "id": "68b1be4539fdbe1114618354"
                }
            ],
            "_id": "68b1be4539fdbe1114618351",
            "id": "68b1be4539fdbe1114618351"
        }
    ],
    "projects": [
        {
            "name": "OMSA",
            "description": "It was a development project",
            "technologies": [
                "Angular",
                "Nodejs",
                "Jqurey",
                "Rxjs"
            ],
            "url": "",
            "githubUrl": "",
            "startDate": null,
            "endDate": null,
            "_id": "68b1be4539fdbe1114618355",
            "id": "68b1be4539fdbe1114618355"
        },
        {
            "name": "Mondee",
            "description": "It was an enhancement project",
            "technologies": [
                "Angular",
                "Nodejs",
                "Jqurey",
                "Rxjs"
            ],
            "url": "",
            "githubUrl": "",
            "startDate": null,
            "endDate": null,
            "_id": "68b1be4539fdbe1114618356",
            "id": "68b1be4539fdbe1114618356"
        }
    ],
    "achievements": [
        {
            "title": "On the spot team award",
            "description": "",
            "date": null,
            "issuer": "TCS",
            "_id": "68b1be4539fdbe1114618357",
            "id": "68b1be4539fdbe1114618357"
        },
        {
            "title": "Best team award",
            "description": "",
            "date": null,
            "issuer": "TCS",
            "_id": "68b1be4539fdbe1114618358",
            "id": "68b1be4539fdbe1114618358"
        }
    ],
    "certifications": [
        {
            "name": "Javascript fundamentals",
            "issuer": "Meta",
            "date": null,
            "expiryDate": null,
            "credentialId": "",
            "url": "",
            "_id": "68b1be4539fdbe1114618359",
            "id": "68b1be4539fdbe1114618359"
        },
        {
            "name": "Angular Intermediate",
            "issuer": "Jobsschool",
            "date": null,
            "expiryDate": null,
            "credentialId": "",
            "url": "",
            "_id": "68b1be4539fdbe111461835a",
            "id": "68b1be4539fdbe111461835a"
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
      // const htmlTemplate = handlebars.compile(template.templateCode.html);
      // const compiledHTML = htmlTemplate(this.sampleData);
      const renderer = new OptimizedTemplateRenderer();
    
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
                  padding: 0;
                  background: ${template.styling.colors.background || '#ffffff'};
              }
              
              /* Template CSS from renderer - HIGHEST PRIORITY */
              ${renderResult.css}
              
              /* Minimal PDF-specific overrides - LOWEST PRIORITY */
              /* Only apply essential PDF optimizations that don't conflict with template design */
              
              /* Print optimizations - minimal and non-conflicting */
              @media print {
                  body {
                      background: ${template?.styling?.colors?.background || '#ffffff'} !important;
                  }
                  .resume { 
                      box-shadow: none;
                      background: ${template?.styling?.colors?.background || '#ffffff'} !important;
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
              
              /* Also remove bottom spacing from last items within sections */
              .resume .job-item:last-child,
              .resume .edu-item:last-child,
              .resume .project-item:last-child,
              .resume .cert-item:last-child,
              .resume .achievement-item:last-child,
              .resume .skill-category:last-child,
              .resume .language-item:last-child,
              .resume .custom-field:last-child {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
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
      const whiteBorderHeight = 50; // in pixels

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