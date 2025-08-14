const mongoose = require('mongoose');
const Template = require('../models/Template');
const User = require('../models/User');
const PuppeteerThumbnailGenerator = require('../utils/puppeteerThumbnailGenerator');
require('dotenv').config();

class ThumbnailGenerationManager {
  constructor() {
    this.generator = new PuppeteerThumbnailGenerator();
    this.baseURL = process.env.BASE_URL || 'http://localhost:5000';
  }

  async initialize() {
    try {
      await this.generator.initialize();
      console.log('✅ Puppeteer initialized for thumbnail generation');
    } catch (error) {
      console.error('❌ Puppeteer initialization failed:', error);
      throw error;
    }
  }

  async generateThumbnailsForTemplates(templates, options = {}) {
    const defaultOptions = {
      width: 300,
      height: 400,
      format: 'webp',
      quality: 85,
      updateDatabase: true
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const results = [];

    console.log(`\n📸 Generating thumbnails for ${templates.length} templates...`);

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      console.log(`🖼️  Processing ${i + 1}/${templates.length}: ${template.name}`);

      try {
        const result = await this.generator.generateThumbnail(template, mergedOptions);

        if (result.success && mergedOptions.updateDatabase) {
          await Template.findByIdAndUpdate(template._id, {
            'preview.thumbnail.url': `${this.baseURL}${result.url}`,
            'preview.thumbnail.filename': result.filename,
            'preview.thumbnail.format': result.format,
            'preview.thumbnail.width': result.width,
            'preview.thumbnail.height': result.height,
            'preview.thumbnail.generated': new Date(),
            'preview.thumbnail.method': 'puppeteer'
          });

          console.log(`   ✅ Generated and updated thumbnail for ${template.name}`);
        }

        results.push({
          templateId: template._id,
          templateName: template.name,
          success: result.success,
          url: result.url
        });

      } catch (error) {
        console.error(`   ❌ Error generating thumbnail for ${template.name}:`, error.message);
        results.push({
          templateId: template._id,
          templateName: template.name,
          success: false,
          error: error.message
        });
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return results;
  }

  async cleanup() {
    try {
      await this.generator.close();
      console.log('✅ Puppeteer cleanup completed');
    } catch (error) {
      console.error('❌ Puppeteer cleanup failed:', error);
    }
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resumebuilder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAllTemplates = async () => {
  let thumbnailManager = null;
  
  try {
    console.log('🚀 Starting comprehensive template seeding with thumbnail generation...');
    
    // Find an admin user or create one
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@resumebuilder.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      });
      console.log('✅ Created admin user');
    }

    // Clear existing templates
    await Template.deleteMany({});
    console.log('🧹 Cleared existing templates');

    const templates = [
      // MODERN CATEGORY
      {
        name: 'Modern Professional',
        description: 'A clean, modern template perfect for professionals in any field',
        category: 'modern',
        preview: {
          thumbnail: {
            url: 'placeholder-will-be-replaced-by-puppeteer'
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
            { name: 'projects', position: 6, isRequired: false, isVisible: true },
            { name: 'achievements', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#0ea5e9',
            text: '#1f2937',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            sizes: { heading: 24, subheading: 18, body: 12, small: 10 }
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume modern-professional">
            <div class="main-column">
              <header class="header">
                <h1 class="name">{{personalInfo.fullName}}</h1>
                <div class="contact-info">
                  <div class="contact-item">{{personalInfo.email}}</div>
                  {{#if personalInfo.phone}}<div class="contact-item">{{personalInfo.phone}}</div>{{/if}}
                  {{#if personalInfo.address}}<div class="contact-item">{{personalInfo.address}}</div>{{/if}}
                  {{#if personalInfo.website}}<div class="contact-item">{{personalInfo.website}}</div>{{/if}}
                  {{#if personalInfo.linkedin}}<div class="contact-item">{{personalInfo.linkedin}}</div>{{/if}}
                  {{#if personalInfo.github}}<div class="contact-item">{{personalInfo.github}}</div>{{/if}}
                </div>
              </header>
              {{#if summary}}<section class="summary"><h2>Professional Summary</h2><p>{{summary}}</p></section>{{/if}}
              {{#if workExperience}}<section class="work-experience"><h2>Work Experience</h2>{{#each workExperience}}<div class="job-item"><div class="job-header"><h3>{{jobTitle}}</h3><div class="job-meta"><span class="company">{{company}}</span>{{#if location}}<span class="location">{{location}}</span>{{/if}}</div><div class="job-dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if description}}<p class="job-description">{{description}}</p>{{/if}}{{#if achievements}}<ul class="achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if education}}<section class="education"><h2>Education</h2>{{#each education}}<div class="edu-item"><div class="edu-header"><h3>{{degree}}</h3><div class="edu-meta"><span class="institution">{{institution}}</span>{{#if location}}<span class="location">{{location}}</span>{{/if}}</div><div class="edu-dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}{{#if description}}<p class="edu-description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
            </div>
            <div class="sidebar">
              {{#if skills}}<section class="skills"><h2>Skills</h2>{{#each skills}}<div class="skill-category"><h3>{{category}}</h3><div class="skill-items">{{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}</div></div>{{/each}}</section>{{/if}}
              {{#if projects}}<section class="projects"><h2>Projects</h2>{{#each projects}}<div class="project-item"><h3>{{name}}</h3>{{#if description}}<p>{{description}}</p>{{/if}}{{#if technologies}}<div class="technologies">{{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}{{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if achievements}}<section class="achievements"><h2>Achievements</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<h3>{{title}}</h3>{{/if}}{{#if description}}<p>{{description}}</p>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if certifications}}<section class="certifications"><h2>Certifications</h2>{{#each certifications}}<div class="cert-item"><h3>{{name}}</h3><div class="cert-meta"><span class="issuer">{{issuer}}</span>{{#if date}}<span class="date">{{formatDate date}}</span>{{/if}}</div>{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if languages}}<section class="languages"><h2>Languages</h2>{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</section>{{/if}}
              {{#if customFields}}<section class="custom-fields">{{#each customFields}}<div class="custom-field"><h3>{{title}}</h3><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
            </div>
          </div>`,
          css: `.resume.modern-professional { font-family: 'Inter', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 20px; background: white; color: #1f2937; display: grid; grid-template-columns: 2fr 1fr; gap: 30px; font-size: 12px; line-height: 1.4; }
          .header { margin-bottom: 25px; }
          .name { font-size: 24px; font-weight: 700; color: #2563eb; margin-bottom: 10px; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 15px; font-size: 11px; color: #64748b; }
          .contact-item { display: flex; align-items: center; }
          section { margin-bottom: 25px; }
          h2 { font-size: 18px; font-weight: 600; color: #2563eb; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb; }
          h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .job-item, .edu-item, .project-item, .cert-item { margin-bottom: 18px; padding-bottom: 15px; }
          .job-header, .edu-header { margin-bottom: 8px; }
          .job-meta, .edu-meta, .cert-meta { display: flex; gap: 10px; font-size: 11px; color: #64748b; margin-bottom: 3px; }
          .job-dates, .edu-dates { font-size: 11px; color: #64748b; font-style: italic; }
          .job-description, .edu-description { margin: 8px 0; color: #374151; line-height: 1.5; }
          .achievements { margin: 8px 0; padding-left: 20px; }
          .achievements li { margin-bottom: 3px; color: #374151; }
          .sidebar { background: #f8fafc; padding: 20px; border-radius: 8px; }
          .sidebar h2 { font-size: 16px; color: #1f2937; border-bottom: 1px solid #e5e7eb; }
          .skill-category { margin-bottom: 15px; }
          .skill-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
          .skill-item { background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; }
          .skill-item[data-level="expert"] { background: #059669; }
          .skill-item[data-level="advanced"] { background: #0ea5e9; }
          .skill-item[data-level="intermediate"] { background: #2563eb; }
          .skill-item[data-level="beginner"] { background: #6b7280; }
          .technologies { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
          .tech-tag { background: #0ea5e9; color: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; }
          .project-links { margin-top: 5px; }
          .project-links a { color: #2563eb; text-decoration: none; font-size: 9px; margin-right: 10px; }
          .project-dates { font-size: 9px; color: #6b7280; margin-top: 5px; font-style: italic; }
          .achievement-item { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
          .achievement-item h3 { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
          .achievement-item p { font-size: 9px; color: #4b5563; margin-bottom: 3px; }
          .achievement-date { font-size: 8px; color: #6b7280; font-style: italic; }
          .achievement-issuer { font-size: 8px; color: #6b7280; }
          .cert-expiry, .cert-id { font-size: 8px; color: #6b7280; margin-top: 2px; }
          .cert-link a { color: #2563eb; text-decoration: none; font-size: 8px; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .language-name { font-size: 10px; color: #1f2937; }
          .language-level { font-size: 9px; color: #6b7280; text-transform: capitalize; }
          .custom-field { margin-bottom: 10px; }
          .custom-field h3 { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
          .custom-content { font-size: 9px; color: #4b5563; }`
        },
        creator: adminUser._id,
        tags: ['professional', 'modern', 'clean', 'two-column', 'blue']
      },

      {
        name: 'Modern Executive',
        description: 'A sophisticated template for executives and senior professionals',
        category: 'modern',
        preview: {
          thumbnail: {
            url: 'placeholder-will-be-replaced-by-puppeteer'
          }
        },
        layout: {
          type: 'single-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 3, isRequired: false, isVisible: true },
            { name: 'education', position: 4, isRequired: false, isVisible: true },
            { name: 'skills', position: 5, isRequired: false, isVisible: true },
            { name: 'projects', position: 6, isRequired: false, isVisible: true },
            { name: 'achievements', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
            accent: '#f59e0b',
            text: '#374151',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Playfair Display',
            secondary: 'Inter',
            sizes: { heading: 28, subheading: 20, body: 12, small: 10 }
          }
        },
        availability: { tier: 'pro', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume modern-executive">
            <header class="header">
              <h1 class="name">{{personalInfo.fullName}}</h1>
              <div class="title-line"></div>
              <div class="contact-info">
                <span>{{personalInfo.email}}</span>
                {{#if personalInfo.phone}}<span>{{personalInfo.phone}}</span>{{/if}}
                {{#if personalInfo.address}}<span>{{personalInfo.address}}</span>{{/if}}
                {{#if personalInfo.website}}<span>{{personalInfo.website}}</span>{{/if}}
                {{#if personalInfo.linkedin}}<span>{{personalInfo.linkedin}}</span>{{/if}}
                {{#if personalInfo.github}}<span>{{personalInfo.github}}</span>{{/if}}
              </div>
            </header>
            {{#if summary}}<section class="executive-summary"><h2>Executive Summary</h2><p class="summary-text">{{summary}}</p></section>{{/if}}
            {{#if workExperience}}<section class="experience"><h2>Professional Experience</h2>{{#each workExperience}}<div class="position"><div class="position-header"><div class="position-title"><h3>{{jobTitle}}</h3><div class="company-info"><span class="company">{{company}}</span>{{#if location}}<span class="location">| {{location}}</span>{{/if}}</div></div><div class="dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if description}}<p class="description">{{description}}</p>{{/if}}{{#if achievements}}<ul class="achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if education}}<section class="education"><h2>Education</h2>{{#each education}}<div class="edu-entry"><div class="edu-header"><h3>{{degree}}</h3><div class="edu-meta"><span class="institution">{{institution}}</span>{{#if location}}<span class="location">| {{location}}</span>{{/if}}</div><div class="dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}{{#if description}}<p class="description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if skills}}<section class="skills"><h2>Core Competencies</h2>{{#each skills}}<div class="skill-category"><h3>{{category}}</h3><div class="skill-items">{{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}</div></div>{{/each}}</section>{{/if}}
            {{#if projects}}<section class="projects"><h2>Key Projects</h2>{{#each projects}}<div class="project-item"><h3>{{name}}</h3>{{#if description}}<p>{{description}}</p>{{/if}}{{#if technologies}}<div class="technologies">{{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if achievements}}<section class="achievements-section"><h2>Achievements & Awards</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<h3>{{title}}</h3>{{/if}}{{#if description}}<p>{{description}}</p>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if certifications}}<section class="certifications"><h2>Certifications</h2>{{#each certifications}}<div class="cert-item"><h3>{{name}}</h3><div class="cert-meta"><span class="issuer">{{issuer}}</span>{{#if date}}<span class="date">{{formatDate date}}</span>{{/if}}</div>{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if languages}}<section class="languages"><h2>Languages</h2>{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</section>{{/if}}
            {{#if customFields}}<section class="custom-fields">{{#each customFields}}<div class="custom-field"><h3>{{title}}</h3><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
          </div>`,
          css: `.resume.modern-executive { font-family: 'Inter', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 30px; background: white; color: #374151; font-size: 12px; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 35px; padding-bottom: 25px; border-bottom: 1px solid #e5e7eb; }
          .name { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1f2937; margin-bottom: 8px; letter-spacing: 1px; }
          .title-line { width: 60px; height: 3px; background: #f59e0b; margin: 0 auto 15px; }
          .contact-info { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 11px; color: #6b7280; }
          section { margin-bottom: 30px; }
          h2 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 20px; position: relative; padding-bottom: 8px; }
          h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 50px; height: 2px; background: #f59e0b; }
          .executive-summary .summary-text { font-size: 13px; line-height: 1.6; color: #4b5563; font-style: italic; text-align: justify; }
          .position, .edu-entry, .project-item, .achievement-item { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f3f4f6; }
          .position-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
          .position-title h3, .edu-entry h3, .project-item h3, .achievement-item h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
          .company-info, .edu-meta { font-size: 12px; color: #6b7280; }
          .dates { font-size: 11px; color: #9ca3af; font-weight: 500; }
          .description { margin: 10px 0; color: #4b5563; line-height: 1.5; }
          .achievements { margin: 10px 0; padding-left: 20px; }
          .achievements li { margin-bottom: 5px; color: #4b5563; }
          .gpa { font-size: 11px; color: #6b7280; margin-bottom: 5px; }
          .skill-category { margin-bottom: 15px; }
          .skill-category h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
          .skill-items { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
          .skill-item { background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; }
          .skill-item[data-level="expert"] { background: #059669; }
          .skill-item[data-level="advanced"] { background: #0ea5e9; }
          .skill-item[data-level="intermediate"] { background: #f59e0b; }
          .skill-item[data-level="beginner"] { background: #6b7280; }
          .technologies { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
          .tech-tag { background: #374151; color: white; padding: 3px 6px; border-radius: 3px; font-size: 9px; }
          .project-links { margin-top: 8px; }
          .project-links a { color: #f59e0b; text-decoration: none; font-size: 11px; margin-right: 15px; }
          .achievement-date { font-size: 10px; color: #6b7280; font-style: italic; margin-top: 5px; }
          .achievement-issuer { font-size: 10px; color: #6b7280; margin-top: 3px; }
          .cert-item { margin-bottom: 15px; }
          .cert-meta { display: flex; gap: 15px; font-size: 11px; color: #6b7280; margin-bottom: 5px; }
          .cert-expiry, .cert-id { font-size: 10px; color: #6b7280; margin-bottom: 3px; }
          .cert-link a { color: #f59e0b; text-decoration: none; font-size: 10px; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .language-name { font-size: 11px; color: #1f2937; }
          .language-level { font-size: 10px; color: #6b7280; text-transform: capitalize; }
          .custom-field { margin-bottom: 15px; }
          .custom-field h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .custom-content { font-size: 11px; color: #4b5563; line-height: 1.5; }`
        },
        creator: adminUser._id,
        tags: ['executive', 'modern', 'sophisticated', 'single-column', 'gold']
      },

      {
        name: 'Modern Tech',
        description: 'Tech-focused modern design with clean lines and bold accents',
        category: 'modern',
        preview: {
          thumbnail: {
            url: 'placeholder-will-be-replaced-by-puppeteer'
          }
        },
        layout: {
          type: 'single-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'skills', position: 3, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 4, isRequired: false, isVisible: true },
            { name: 'projects', position: 5, isRequired: false, isVisible: true },
            { name: 'education', position: 6, isRequired: false, isVisible: true },
            { name: 'achievements', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#06b6d4',
            secondary: '#64748b',
            accent: '#8b5cf6',
            text: '#1f2937',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Roboto',
            secondary: 'Roboto',
            sizes: { heading: 24, subheading: 18, body: 11, small: 10 }
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume modern-tech">
            <header class="tech-header">
              <div class="header-left">
                <h1 class="name">{{personalInfo.fullName}}</h1>
                <div class="contact-info">
                  {{#if personalInfo.email}}<div class="contact-item">{{personalInfo.email}}</div>{{/if}}
                  {{#if personalInfo.phone}}<div class="contact-item">{{personalInfo.phone}}</div>{{/if}}
                  {{#if personalInfo.address}}<div class="contact-item">{{personalInfo.address}}</div>{{/if}}
                  {{#if personalInfo.website}}<div class="contact-item">{{personalInfo.website}}</div>{{/if}}
                  {{#if personalInfo.linkedin}}<div class="contact-item">{{personalInfo.linkedin}}</div>{{/if}}
                  {{#if personalInfo.github}}<div class="contact-item">{{personalInfo.github}}</div>{{/if}}
                </div>
              </div>
            </header>
            {{#if summary}}<section class="summary-section"><h2>Summary</h2><p>{{summary}}</p></section>{{/if}}
            {{#if skills}}<section class="skills-section"><h2>Technical Skills</h2>{{#each skills}}<div class="skill-category"><h3>{{category}}</h3><div class="skill-items">{{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}</div></div>{{/each}}</section>{{/if}}
            {{#if workExperience}}<section class="experience-section"><h2>Experience</h2>{{#each workExperience}}<div class="job-item"><div class="job-header"><div class="job-title">{{jobTitle}}</div><div class="job-company">{{company}}</div><div class="job-duration">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</div></div>{{#if location}}<div class="job-location">{{location}}</div>{{/if}}{{#if description}}<p class="job-description">{{description}}</p>{{/if}}{{#if achievements}}<ul class="achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if projects}}<section class="projects-section"><h2>Projects</h2>{{#each projects}}<div class="project-item"><h3>{{name}}</h3>{{#if description}}<p>{{description}}</p>{{/if}}{{#if technologies}}<div class="technologies">{{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}{{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if education}}<section class="education-section"><h2>Education</h2>{{#each education}}<div class="edu-item"><div class="edu-header"><h3>{{degree}}</h3><div class="edu-institution">{{institution}}</div><div class="edu-duration">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if location}}<div class="edu-location">{{location}}</div>{{/if}}{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<p class="edu-description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if achievements}}<section class="achievements-section"><h2>Achievements</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<h3>{{title}}</h3>{{/if}}{{#if description}}<p>{{description}}</p>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if certifications}}<section class="certifications-section"><h2>Certifications</h2>{{#each certifications}}<div class="cert-item"><h3>{{name}}</h3><div class="cert-meta"><span class="issuer">{{issuer}}</span>{{#if date}}<span class="date">{{formatDate date}}</span>{{/if}}</div>{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if languages}}<section class="languages-section"><h2>Languages</h2>{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</section>{{/if}}
            {{#if customFields}}<section class="custom-fields-section">{{#each customFields}}<div class="custom-field"><h3>{{title}}</h3><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
          </div>`,
          css: `.resume.modern-tech { font-family: 'Roboto', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; color: #1f2937; line-height: 1.5; }
          .tech-header { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 3px solid #06b6d4; }
          .name { font-size: 24px; font-weight: 700; color: #06b6d4; margin-bottom: 0.5rem; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 1rem; }
          .contact-item { font-size: 10px; color: #64748b; padding: 0.25rem 0.5rem; background: #f1f5f9; border-radius: 4px; }
          section { margin-bottom: 1.5rem; }
          section h2 { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #06b6d4; }
          .summary-section p { font-size: 11px; line-height: 1.6; color: #4b5563; }
          .skill-category { margin-bottom: 1rem; }
          .skill-category h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; }
          .skill-items { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
          .skill-item { background: #06b6d4; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 10px; }
          .skill-item[data-level="expert"] { background: #059669; }
          .skill-item[data-level="advanced"] { background: #0ea5e9; }
          .skill-item[data-level="intermediate"] { background: #06b6d4; }
          .skill-item[data-level="beginner"] { background: #6b7280; }
          .job-item, .project-item, .edu-item, .achievement-item, .cert-item { margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #06b6d4; }
          .job-header, .edu-header { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; margin-bottom: 0.5rem; }
          .job-title, .edu-item h3, .project-item h3, .achievement-item h3, .cert-item h3 { font-size: 14px; font-weight: 600; color: #1f2937; }
          .job-company, .edu-institution { font-size: 12px; color: #06b6d4; font-weight: 500; }
          .job-duration, .edu-duration { font-size: 10px; color: #64748b; text-align: right; }
          .job-location, .edu-location { font-size: 10px; color: #6b7280; margin-bottom: 0.5rem; }
          .job-description, .edu-description { font-size: 11px; color: #4b5563; margin-bottom: 0.5rem; }
          .achievements { margin: 0.5rem 0; padding-left: 1rem; }
          .achievements li { margin-bottom: 0.25rem; color: #4b5563; font-size: 10px; }
          .gpa { font-size: 10px; color: #6b7280; margin-bottom: 0.5rem; }
          .technologies { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem; }
          .tech-tag { background: #8b5cf6; color: white; padding: 0.125rem 0.375rem; border-radius: 3px; font-size: 9px; }
          .project-links { margin-top: 0.5rem; }
          .project-links a { color: #06b6d4; text-decoration: none; font-size: 10px; margin-right: 1rem; }
          .project-dates { font-size: 9px; color: #6b7280; margin-top: 0.5rem; font-style: italic; }
          .achievement-date { font-size: 9px; color: #6b7280; font-style: italic; margin-top: 0.5rem; }
          .achievement-issuer { font-size: 9px; color: #6b7280; margin-top: 0.25rem; }
          .cert-meta { display: flex; gap: 1rem; font-size: 11px; color: #6b7280; margin-bottom: 0.5rem; }
          .cert-expiry, .cert-id { font-size: 9px; color: #6b7280; margin-bottom: 0.25rem; }
          .cert-link a { color: #06b6d4; text-decoration: none; font-size: 9px; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
          .language-name { font-size: 11px; color: #1f2937; }
          .language-level { font-size: 10px; color: #6b7280; text-transform: capitalize; }
          .custom-field { margin-bottom: 1rem; }
          .custom-field h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; }
          .custom-content { font-size: 11px; color: #4b5563; line-height: 1.5; }`
        },
        creator: adminUser._id,
        tags: ['modern', 'tech', 'developer', 'clean']
      },

      // CREATIVE CATEGORY
      {
        name: 'Creative Designer',
        description: 'A vibrant template perfect for designers and creative professionals',
        category: 'creative',
        preview: {
          thumbnail: {
            url: 'https://via.placeholder.com/300x400/ec4899/ffffff?text=Creative%20Designer'
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
            { name: 'projects', position: 6, isRequired: false, isVisible: true },
            { name: 'achievements', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#ec4899',
            secondary: '#8b5cf6',
            accent: '#06b6d4',
            text: '#1f2937',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Poppins',
            secondary: 'Inter',
            sizes: { heading: 26, subheading: 18, body: 11, small: 9 }
          }
        },
        availability: { tier: 'pro', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume creative-designer">
            <div class="sidebar">
              <div class="profile-section">
                <h1 class="name">{{personalInfo.fullName}}</h1>
                <div class="contact-info">
                  <div class="contact-item"><span class="icon">📧</span><span>{{personalInfo.email}}</span></div>
                  {{#if personalInfo.phone}}<div class="contact-item"><span class="icon">📱</span><span>{{personalInfo.phone}}</span></div>{{/if}}
                  {{#if personalInfo.address}}<div class="contact-item"><span class="icon">📍</span><span>{{personalInfo.address}}</span></div>{{/if}}
                  {{#if personalInfo.website}}<div class="contact-item"><span class="icon">🌐</span><span>{{personalInfo.website}}</span></div>{{/if}}
                  {{#if personalInfo.linkedin}}<div class="contact-item"><span class="icon">💼</span><span>{{personalInfo.linkedin}}</span></div>{{/if}}
                  {{#if personalInfo.github}}<div class="contact-item"><span class="icon">🐱</span><span>{{personalInfo.github}}</span></div>{{/if}}
                </div>
              </div>
              {{#if skills}}<section class="skills"><h2>Skills</h2>{{#each skills}}<div class="skill-category"><h3>{{category}}</h3><div class="skill-bars">{{#each items}}<div class="skill-item"><span class="skill-name">{{name}}</span><div class="skill-bar"><div class="skill-progress" data-level="{{level}}"></div></div></div>{{/each}}</div></div>{{/each}}</section>{{/if}}
              {{#if languages}}<section class="languages"><h2>Languages</h2>{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</section>{{/if}}
              {{#if certifications}}<section class="certifications"><h2>Certifications</h2>{{#each certifications}}<div class="cert-item"><h3>{{name}}</h3><div class="cert-meta"><span class="issuer">{{issuer}}</span>{{#if date}}<span class="date">{{formatDate date}}</span>{{/if}}</div>{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
            </div>
            <div class="main-content">
              {{#if summary}}<section class="about"><h2>About Me</h2><p class="about-text">{{summary}}</p></section>{{/if}}
              {{#if workExperience}}<section class="experience"><h2>Experience</h2><div class="timeline">{{#each workExperience}}<div class="timeline-item"><div class="timeline-marker"></div><div class="timeline-content"><h3>{{jobTitle}}</h3><div class="job-meta"><span class="company">{{company}}</span>{{#if location}}<span class="location">{{location}}</span>{{/if}}</div><div class="dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</div>{{#if description}}<p class="description">{{description}}</p>{{/if}}{{#if achievements}}<ul class="achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div></div>{{/each}}</div></section>{{/if}}
              {{#if education}}<section class="education"><h2>Education</h2>{{#each education}}<div class="edu-item"><h3>{{degree}}</h3><div class="edu-meta"><span class="institution">{{institution}}</span>{{#if location}}<span class="location">{{location}}</span>{{/if}}</div><div class="edu-dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<p class="edu-description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if projects}}<section class="projects"><h2>Projects</h2>{{#each projects}}<div class="project-item"><h3>{{name}}</h3>{{#if description}}<p>{{description}}</p>{{/if}}{{#if technologies}}<div class="technologies">{{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}{{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if achievements}}<section class="achievements-section"><h2>Achievements</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<h3>{{title}}</h3>{{/if}}{{#if description}}<p>{{description}}</p>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if customFields}}<section class="custom-fields">{{#each customFields}}<div class="custom-field"><h3>{{title}}</h3><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
            </div>
          </div>`,
          css: `.resume.creative-designer { font-family: 'Inter', sans-serif; max-width: 8.5in; margin: 0 auto; background: white; color: #1f2937; display: grid; grid-template-columns: 280px 1fr; font-size: 11px; line-height: 1.4; }
          .sidebar { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px 25px; }
          .profile-section { margin-bottom: 30px; }
          .name { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 700; margin-bottom: 20px; line-height: 1.2; }
          .contact-info { margin-bottom: 25px; }
          .contact-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 10px; }
          .icon { font-size: 14px; width: 20px; text-align: center; }
          .sidebar h2 { font-size: 16px; font-weight: 600; margin-bottom: 15px; position: relative; padding-bottom: 8px; }
          .sidebar h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 30px; height: 2px; background: rgba(255,255,255,0.7); }
          .skill-category { margin-bottom: 20px; }
          .skill-category h3 { font-size: 12px; font-weight: 600; margin-bottom: 10px; color: rgba(255,255,255,0.9); }
          .skill-item { margin-bottom: 8px; }
          .skill-name { font-size: 9px; display: block; margin-bottom: 3px; }
          .skill-bar { height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden; }
          .skill-progress { height: 100%; background: rgba(255,255,255,0.8); border-radius: 2px; width: 75%; }
          .skill-progress[data-level="expert"] { width: 95%; }
          .skill-progress[data-level="advanced"] { width: 80%; }
          .skill-progress[data-level="intermediate"] { width: 65%; }
          .skill-progress[data-level="beginner"] { width: 40%; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .language-name { font-size: 10px; color: rgba(255,255,255,0.9); }
          .language-level { font-size: 9px; color: rgba(255,255,255,0.7); text-transform: capitalize; }
          .cert-item { margin-bottom: 15px; }
          .cert-item h3 { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 3px; }
          .cert-meta { display: flex; gap: 10px; font-size: 9px; color: rgba(255,255,255,0.7); margin-bottom: 3px; }
          .cert-expiry, .cert-id { font-size: 8px; color: rgba(255,255,255,0.6); margin-bottom: 2px; }
          .cert-link a { color: rgba(255,255,255,0.9); text-decoration: none; font-size: 8px; }
          .main-content { padding: 30px; }
          .main-content h2 { font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 600; color: #ec4899; margin-bottom: 20px; position: relative; padding-bottom: 8px; }
          .main-content h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background: linear-gradient(90deg, #ec4899, #8b5cf6); }
          .about { margin-bottom: 30px; }
          .about-text { font-size: 12px; line-height: 1.6; color: #4b5563; text-align: justify; }
          .timeline { position: relative; padding-left: 20px; }
          .timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, #ec4899, #8b5cf6); }
          .timeline-item { position: relative; margin-bottom: 25px; }
          .timeline-marker { position: absolute; left: -12px; top: 5px; width: 8px; height: 8px; background: #ec4899; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #ec4899; }
          .timeline-content h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .job-meta, .edu-meta { display: flex; gap: 10px; font-size: 10px; color: #6b7280; margin-bottom: 3px; }
          .dates, .edu-dates { font-size: 10px; color: #9ca3af; font-style: italic; margin-bottom: 8px; }
          .description, .edu-description { font-size: 11px; color: #4b5563; line-height: 1.5; }
          .achievements { margin: 8px 0; padding-left: 20px; }
          .achievements li { margin-bottom: 3px; color: #4b5563; font-size: 10px; }
          .gpa { font-size: 10px; color: #6b7280; margin-bottom: 5px; }
          .edu-item { margin-bottom: 20px; }
          .edu-item h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .project-item { margin-bottom: 20px; }
          .project-item h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .project-item p { font-size: 11px; color: #4b5563; line-height: 1.5; margin-bottom: 8px; }
          .technologies { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
          .tech-tag { background: #8b5cf6; color: white; padding: 3px 6px; border-radius: 3px; font-size: 9px; }
          .project-links { margin-bottom: 5px; }
          .project-links a { color: #ec4899; text-decoration: none; font-size: 10px; margin-right: 15px; }
          .project-dates { font-size: 9px; color: #9ca3af; font-style: italic; }
          .achievement-item { margin-bottom: 20px; }
          .achievement-item h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .achievement-item p { font-size: 11px; color: #4b5563; line-height: 1.5; margin-bottom: 5px; }
          .achievement-date { font-size: 9px; color: #9ca3af; font-style: italic; margin-bottom: 3px; }
          .achievement-issuer { font-size: 9px; color: #6b7280; }
          .custom-field { margin-bottom: 20px; }
          .custom-field h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .custom-content { font-size: 11px; color: #4b5563; line-height: 1.5; }`
        },
        creator: adminUser._id,
        tags: ['creative', 'designer', 'portfolio', 'sidebar', 'colorful', 'gradient']
      },

      // CLASSIC CATEGORY
      {
        name: 'Classic Traditional',
        description: 'A timeless, traditional resume template perfect for conservative industries',
        category: 'classic',
        preview: {
          thumbnail: {
            url: 'placeholder-will-be-replaced-by-puppeteer'
          }
        },
        layout: {
          type: 'single-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 3, isRequired: false, isVisible: true },
            { name: 'education', position: 4, isRequired: false, isVisible: true },
            { name: 'skills', position: 5, isRequired: false, isVisible: true },
            { name: 'projects', position: 6, isRequired: false, isVisible: true },
            { name: 'achievements', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#666666',
            text: '#000000',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Times New Roman',
            secondary: 'Times New Roman',
            sizes: { heading: 20, subheading: 16, body: 11, small: 10 }
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume classic-traditional">
            <header class="header">
              <h1 class="name">{{personalInfo.fullName}}</h1>
              <div class="contact-info">
                {{personalInfo.email}}
                {{#if personalInfo.phone}} | {{personalInfo.phone}}{{/if}}
                {{#if personalInfo.address}} | {{personalInfo.address}}{{/if}}
                {{#if personalInfo.website}} | {{personalInfo.website}}{{/if}}
                {{#if personalInfo.linkedin}} | {{personalInfo.linkedin}}{{/if}}
                {{#if personalInfo.github}} | {{personalInfo.github}}{{/if}}
              </div>
            </header>
            {{#if summary}}<section class="objective"><h2>OBJECTIVE</h2><p>{{summary}}</p></section>{{/if}}
            {{#if workExperience}}<section class="experience"><h2>EXPERIENCE</h2>{{#each workExperience}}<div class="job-entry"><div class="job-header"><strong>{{jobTitle}}</strong><span class="dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</span></div><div class="company-info"><em>{{company}}</em>{{#if location}}, {{location}}{{/if}}</div>{{#if description}}<p class="job-description">{{description}}</p>{{/if}}{{#if achievements}}<ul class="achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if education}}<section class="education"><h2>EDUCATION</h2>{{#each education}}<div class="edu-entry"><div class="edu-header"><strong>{{degree}}</strong><span class="dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</span></div><div class="institution-info"><em>{{institution}}</em>{{#if location}}, {{location}}{{/if}}</div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<p class="edu-description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if skills}}<section class="skills"><h2>SKILLS</h2>{{#each skills}}<div class="skill-category"><strong>{{category}}:</strong> {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/each}}</section>{{/if}}
            {{#if projects}}<section class="projects"><h2>PROJECTS</h2>{{#each projects}}<div class="project-entry"><div class="project-header"><strong>{{name}}</strong>{{#if startDate}}<span class="dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}</div>{{#if description}}<p class="project-description">{{description}}</p>{{/if}}{{#if technologies}}<div class="technologies"><strong>Technologies:</strong> {{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/if}}{{#if url}}<div class="project-url"><strong>URL:</strong> {{url}}</div>{{/if}}{{#if githubUrl}}<div class="github-url"><strong>GitHub:</strong> {{githubUrl}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if achievements}}<section class="achievements-section"><h2>ACHIEVEMENTS</h2>{{#each achievements}}<div class="achievement-entry">{{#if title}}<div class="achievement-header"><strong>{{title}}</strong>{{#if date}}<span class="dates">{{formatDate date}}</span>{{/if}}</div>{{/if}}{{#if description}}<p class="achievement-description">{{description}}</p>{{/if}}{{#if issuer}}<div class="issuer-info"><em>{{issuer}}</em></div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if certifications}}<section class="certifications"><h2>CERTIFICATIONS</h2>{{#each certifications}}<div class="cert-entry"><div class="cert-header"><strong>{{name}}</strong>{{#if date}}<span class="dates">{{formatDate date}}</span>{{/if}}</div>{{#if issuer}}<div class="cert-issuer"><em>{{issuer}}</em></div>{{/if}}{{#if expiryDate}}<div class="cert-expiry"><strong>Expires:</strong> {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id"><strong>ID:</strong> {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-url"><strong>URL:</strong> {{url}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if languages}}<section class="languages"><h2>LANGUAGES</h2>{{#each languages}}<div class="language-entry"><strong>{{name}}:</strong> {{proficiency}}</div>{{/each}}</section>{{/if}}
            {{#if customFields}}<section class="custom-fields">{{#each customFields}}<div class="custom-field-entry"><h2>{{title}}</h2><div class="custom-field-content">{{content}}</div></div>{{/each}}</section>{{/if}}
          </div>`,
          css: `.resume.classic-traditional { font-family: 'Times New Roman', serif; max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; color: black; font-size: 11px; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid black; }
          .name { font-size: 20px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
          .contact-info { font-size: 10px; line-height: 1.3; }
          section { margin-bottom: 18px; }
          h2 { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; padding-bottom: 3px; border-bottom: 1px solid black; letter-spacing: 0.5px; }
          .objective p { text-align: justify; margin-bottom: 0; }
          .job-entry, .edu-entry, .project-entry, .achievement-entry, .cert-entry { margin-bottom: 15px; }
          .job-header, .edu-header, .project-header, .achievement-header, .cert-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
          .job-header strong, .edu-header strong, .project-header strong, .achievement-header strong, .cert-header strong { font-size: 12px; }
          .dates { font-size: 10px; font-style: italic; }
          .company-info, .institution-info, .cert-issuer, .issuer-info { font-size: 10px; margin-bottom: 5px; }
          .job-description, .edu-description, .project-description, .achievement-description { margin: 5px 0; text-align: justify; }
          .achievements { margin: 5px 0; padding-left: 20px; }
          .achievements li { margin-bottom: 2px; }
          .gpa { font-size: 10px; margin-bottom: 5px; }
          .skill-category { margin-bottom: 8px; }
          .skill-category strong { font-size: 11px; }
          .technologies, .project-url, .github-url, .cert-expiry, .cert-id, .cert-url { font-size: 10px; margin-bottom: 3px; }
          .technologies strong, .project-url strong, .github-url strong, .cert-expiry strong, .cert-id strong, .cert-url strong { font-size: 10px; }
          .language-entry { margin-bottom: 5px; font-size: 11px; }
          .language-entry strong { font-size: 11px; }
          .custom-field-entry { margin-bottom: 15px; }
          .custom-field-entry h2 { font-size: 14px; margin-bottom: 8px; }
          .custom-field-content { font-size: 11px; line-height: 1.4; text-align: justify; }`
        },
        creator: adminUser._id,
        tags: ['classic', 'traditional', 'formal', 'conservative', 'single-column', 'black']
      },

      {
        name: 'Classic Professional',
        description: 'Traditional professional template with conservative styling',
        category: 'classic',
        preview: {
          thumbnail: {
            url: 'https://via.placeholder.com/300x400/1f2937/ffffff?text=Classic%20Professional'
          }
        },
        layout: {
          type: 'single-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 3, isRequired: false, isVisible: true },
            { name: 'education', position: 4, isRequired: false, isVisible: true },
            { name: 'skills', position: 5, isRequired: false, isVisible: true },
            { name: 'projects', position: 6, isRequired: false, isVisible: true },
            { name: 'achievements', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
            accent: '#4b5563',
            text: '#000000',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Georgia',
            secondary: 'Georgia',
            sizes: { heading: 22, subheading: 16, body: 12, small: 10 }
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume classic-professional">
            <header class="classic-header">
              <h1 class="name">{{personalInfo.fullName}}</h1>
              <div class="contact-details">
                {{#if personalInfo.address}}{{personalInfo.address}}{{/if}}
                {{#if personalInfo.phone}}{{#if personalInfo.address}} | {{/if}}{{personalInfo.phone}}{{/if}}
                {{#if personalInfo.email}}{{#if personalInfo.phone}} | {{/if}}{{personalInfo.email}}{{/if}}
              </div>
              {{#if personalInfo.linkedin}}<div class="linkedin">LinkedIn: {{personalInfo.linkedin}}</div>{{/if}}
            </header>
            {{#if summary}}<section class="summary-section"><h2>PROFESSIONAL SUMMARY</h2><p>{{summary}}</p></section>{{/if}}
            {{#if workExperience}}<section class="experience-section"><h2>PROFESSIONAL EXPERIENCE</h2>{{#each workExperience}}<div class="job-entry"><div class="job-title-line"><strong>{{jobTitle}}</strong><span class="job-dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class="company-line">{{company}}{{#if location}}, {{location}}{{/if}}</div>{{#if description}}<p class="job-description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if education}}<section class="education-section"><h2>EDUCATION</h2>{{#each education}}<div class="education-entry"><div class="education-line"><strong>{{degree}}</strong><span class="education-dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class="school-line">{{institution}}{{#if location}}, {{location}}{{/if}}</div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<p class="education-description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if skills}}<section class="skills-section"><h2>CORE COMPETENCIES</h2><div class="skills-grid">{{#each skills}}<div class="skill-category"><h3>{{category}}</h3><div class="skill-items">{{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div></div>{{/each}}</div>{{/if}}
            {{#if certifications}}<section class="certifications-section"><h2>CERTIFICATIONS</h2>{{#each certifications}}<div class="cert-entry"><div class="cert-line"><strong>{{name}}</strong>{{#if date}}<span class="cert-date">{{formatDate date}}</span>{{/if}}</div>{{#if issuer}}<div class="cert-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
          </div>`,
          css: `.resume.classic-professional { font-family: 'Georgia', serif; max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; color: black; line-height: 1.4; }
          .classic-header { text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #1f2937; }
          .name { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
          .contact-details { font-size: 12px; color: #4b5563; margin-bottom: 0.25rem; }
          .linkedin { font-size: 11px; color: #6b7280; }
          section { margin-bottom: 1.5rem; }
          section h2 { font-size: 14px; font-weight: bold; color: #1f2937; text-transform: uppercase; margin-bottom: 1rem; border-bottom: 1px solid #1f2937; padding-bottom: 0.25rem; letter-spacing: 0.5px; }
          .summary-section p { font-size: 12px; line-height: 1.5; color: #1f2937; text-align: justify; }
          .job-entry { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px dotted #6b7280; }
          .job-title-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; }
          .job-title-line strong { font-size: 13px; color: #1f2937; }
          .job-dates { font-size: 11px; color: #6b7280; font-style: italic; }
          .company-line { font-size: 12px; color: #4b5563; margin-bottom: 0.5rem; font-weight: 500; }
          .job-description { font-size: 11px; color: #1f2937; margin: 0.5rem 0; line-height: 1.4; }
          .education-entry { margin-bottom: 1.25rem; }
          .education-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; }
          .education-line strong { font-size: 13px; color: #1f2937; }
          .education-dates { font-size: 11px; color: #6b7280; font-style: italic; }
          .school-line { font-size: 12px; color: #4b5563; margin-bottom: 0.25rem; font-weight: 500; }
          .gpa { font-size: 11px; color: #6b7280; margin-bottom: 0.25rem; }
          .education-description { font-size: 11px; color: #1f2937; line-height: 1.4; }
          .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .skill-category h3 { font-size: 12px; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem; }
          .skill-items { font-size: 11px; color: #4b5563; line-height: 1.4; }
          .cert-entry { margin-bottom: 1rem; }
          .cert-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; }
          .cert-line strong { font-size: 12px; color: #1f2937; }
          .cert-date { font-size: 10px; color: #6b7280; font-style: italic; }
          .cert-issuer { font-size: 11px; color: #4b5563; font-style: italic; }`
        },
        creator: adminUser._id,
        tags: ['classic', 'professional', 'conservative', 'formal']
      },

      // MINIMALIST CATEGORY
      {
        name: 'Minimalist Clean',
        description: 'A clean, minimalist template focusing on content and readability',
        category: 'minimalist',
        preview: {
          thumbnail: {
            url: 'https://via.placeholder.com/300x400/f8fafc/1f2937?text=Minimalist%20Clean'
          }
        },
        layout: {
          type: 'single-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 3, isRequired: false, isVisible: true },
            { name: 'education', position: 4, isRequired: false, isVisible: true },
            { name: 'skills', position: 5, isRequired: false, isVisible: true },
            { name: 'projects', position: 6, isRequired: false, isVisible: true },
            { name: 'achievements', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
            accent: '#e5e7eb',
            text: '#374151',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            sizes: { heading: 22, subheading: 16, body: 11, small: 10 }
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume minimalist-clean">
            <header class="header">
              <h1 class="name">{{personalInfo.fullName}}</h1>
              <div class="contact-info">
                <span class="contact-item">{{personalInfo.email}}</span>
                {{#if personalInfo.phone}}<span class="contact-item">{{personalInfo.phone}}</span>{{/if}}
                {{#if personalInfo.address}}<span class="contact-item">{{personalInfo.address}}</span>{{/if}}
                {{#if personalInfo.website}}<span class="contact-item">{{personalInfo.website}}</span>{{/if}}
                {{#if personalInfo.linkedin}}<span class="contact-item">{{personalInfo.linkedin}}</span>{{/if}}
                {{#if personalInfo.github}}<span class="contact-item">{{personalInfo.github}}</span>{{/if}}
              </div>
            </header>
            {{#if summary}}<section class="summary"><p class="summary-text">{{summary}}</p></section>{{/if}}
            {{#if workExperience}}<section class="experience"><h2 class="section-title">Experience</h2>{{#each workExperience}}<div class="experience-item"><div class="item-header"><div class="item-title"><h3>{{jobTitle}}</h3><span class="company">{{company}}</span>{{#if location}}<span class="location"> • {{location}}</span>{{/if}}</div><span class="dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</span></div>{{#if description}}<p class="item-description">{{description}}</p>{{/if}}{{#if achievements}}<ul class="achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if education}}<section class="education"><h2 class="section-title">Education</h2>{{#each education}}<div class="education-item"><div class="item-header"><div class="item-title"><h3>{{degree}}</h3><span class="institution">{{institution}}</span>{{#if location}}<span class="location"> • {{location}}</span>{{/if}}</div><span class="dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</span></div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<p class="item-description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if skills}}<section class="skills"><h2 class="section-title">Skills</h2><div class="skills-grid">{{#each skills}}<div class="skill-category"><h3 class="skill-category-title">{{category}}</h3><div class="skill-items">{{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}</div></div>{{/each}}</div>{{/if}}
            {{#if projects}}<section class="projects"><h2 class="section-title">Projects</h2>{{#each projects}}<div class="project-item"><div class="item-header"><div class="item-title"><h3>{{name}}</h3>{{#if startDate}}<span class="dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}</div></div>{{#if description}}<p class="item-description">{{description}}</p>{{/if}}{{#if technologies}}<div class="technologies">{{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if achievements}}<section class="achievements-section"><h2 class="section-title">Achievements</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<h3>{{title}}</h3>{{/if}}{{#if description}}<p class="item-description">{{description}}</p>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if certifications}}<section class="certifications"><h2 class="section-title">Certifications</h2>{{#each certifications}}<div class="cert-item"><div class="item-header"><div class="item-title"><h3>{{name}}</h3><span class="cert-issuer">{{issuer}}</span></div>{{#if date}}<span class="dates">{{formatDate date}}</span>{{/if}}</div>{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if languages}}<section class="languages"><h2 class="section-title">Languages</h2><div class="languages-grid">{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</div>{{/if}}
            {{#if customFields}}<section class="custom-fields"><h2 class="section-title">Additional Information</h2>{{#each customFields}}<div class="custom-field"><h3>{{title}}</h3><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
          </div>`,
          css: `.resume.minimalist-clean { font-family: 'Inter', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 40px; background: white; color: #374151; font-size: 11px; line-height: 1.5; }
          .header { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
          .name { font-size: 22px; font-weight: 600; color: #1f2937; margin-bottom: 8px; letter-spacing: -0.5px; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 20px; font-size: 10px; color: #6b7280; }
          .contact-item { display: flex; align-items: center; }
          .summary { margin-bottom: 25px; }
          .summary-text { font-size: 12px; color: #4b5563; line-height: 1.6; text-align: justify; }
          section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; }
          .experience-item, .education-item, .project-item, .achievement-item, .cert-item { margin-bottom: 20px; padding-bottom: 15px; }
          .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
          .item-title h3, .achievement-item h3, .custom-field h3 { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
          .company, .institution, .location, .cert-issuer { font-size: 11px; color: #6b7280; }
          .dates { font-size: 10px; color: #9ca3af; font-weight: 500; }
          .item-description, .custom-content { margin: 8px 0; color: #4b5563; line-height: 1.5; }
          .achievements { margin: 8px 0; padding-left: 18px; }
          .achievements li { margin-bottom: 3px; color: #4b5563; }
          .gpa { font-size: 10px; color: #6b7280; margin-bottom: 5px; }
          .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
          .skill-category-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
          .skill-items { display: flex; flex-wrap: wrap; gap: 8px; }
          .skill-item { background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; }
          .skill-item[data-level="expert"] { background: #059669; color: white; }
          .skill-item[data-level="advanced"] { background: #0ea5e9; color: white; }
          .skill-item[data-level="intermediate"] { background: #6b7280; color: white; }
          .skill-item[data-level="beginner"] { background: #d1d5db; color: #374151; }
          .technologies { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
          .tech-tag { background: #1f2937; color: white; padding: 3px 6px; border-radius: 3px; font-size: 9px; }
          .project-links, .cert-link { margin: 5px 0; }
          .project-links a, .cert-link a { color: #1f2937; text-decoration: none; font-size: 10px; margin-right: 15px; }
          .achievement-date { font-size: 10px; color: #9ca3af; margin: 5px 0; font-style: italic; }
          .achievement-issuer { font-size: 10px; color: #6b7280; }
          .cert-expiry, .cert-id { font-size: 9px; color: #6b7280; margin: 3px 0; }
          .languages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .language-name { font-size: 11px; color: #1f2937; }
          .language-level { font-size: 10px; color: #6b7280; text-transform: capitalize; }
          .custom-field { margin-bottom: 15px; }`
        },
        creator: adminUser._id,
        tags: ['minimalist', 'clean', 'simple', 'modern', 'readable', 'single-column']
      },

      // PROFESSIONAL CATEGORY
      {
        name: 'Professional Corporate',
        description: 'A sophisticated template designed for corporate environments',
        category: 'professional',
        preview: {
          thumbnail: {
            url: 'https://via.placeholder.com/300x400/1e40af/ffffff?text=Professional%20Corporate'
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
            { name: 'projects', position: 6, isRequired: false, isVisible: true },
            { name: 'achievements', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#1e40af',
            secondary: '#64748b',
            accent: '#3b82f6',
            text: '#1f2937',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            sizes: { heading: 24, subheading: 18, body: 11, small: 10 }
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume professional-corporate">
            <header class="header">
              <div class="header-content">
                <h1 class="name">{{personalInfo.fullName}}</h1>
                <div class="contact-info">
                  <div class="contact-row">
                    <span class="contact-item">{{personalInfo.email}}</span>
                    {{#if personalInfo.phone}}<span class="contact-item">{{personalInfo.phone}}</span>{{/if}}
                    {{#if personalInfo.website}}<span class="contact-item">{{personalInfo.website}}</span>{{/if}}
                  </div>
                  <div class="contact-row">
                    {{#if personalInfo.address}}<span class="contact-item">{{personalInfo.address}}</span>{{/if}}
                    {{#if personalInfo.linkedin}}<span class="contact-item">{{personalInfo.linkedin}}</span>{{/if}}
                    {{#if personalInfo.github}}<span class="contact-item">{{personalInfo.github}}</span>{{/if}}
                  </div>
                </div>
              </div>
            </header>
            <div class="content-grid">
              <div class="main-content">
                {{#if summary}}<section class="summary"><h2>Professional Summary</h2><p class="summary-text">{{summary}}</p></section>{{/if}}
                {{#if workExperience}}<section class="experience"><h2>Professional Experience</h2>{{#each workExperience}}<div class="job-entry"><div class="job-header"><div class="job-title-company"><h3>{{jobTitle}}</h3><div class="company-location"><span class="company">{{company}}</span>{{#if location}}<span class="location">{{location}}</span>{{/if}}</div></div><div class="job-dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if description}}<p class="job-description">{{description}}</p>{{/if}}{{#if achievements}}<ul class="achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
                {{#if education}}<section class="education"><h2>Education</h2>{{#each education}}<div class="edu-entry"><div class="edu-header"><div class="edu-title-institution"><h3>{{degree}}</h3><div class="institution-location"><span class="institution">{{institution}}</span>{{#if location}}<span class="location">{{location}}</span>{{/if}}</div></div><div class="edu-dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}{{#if description}}<p class="edu-description">{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}
                {{#if projects}}<section class="projects"><h2>Key Projects</h2>{{#each projects}}<div class="project-entry"><div class="project-header"><h3>{{name}}</h3>{{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}</div>{{#if description}}<p class="project-description">{{description}}</p>{{/if}}{{#if technologies}}<div class="technologies">{{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
                {{#if achievements}}<section class="achievements-section"><h2>Achievements</h2>{{#each achievements}}<div class="achievement-entry">{{#if title}}<h3>{{title}}</h3>{{/if}}{{#if description}}<p>{{description}}</p>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
                {{#if customFields}}<section class="custom-fields"><h2>Additional Information</h2>{{#each customFields}}<div class="custom-field"><h3>{{title}}</h3><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
              </div>
              <div class="sidebar">
                {{#if skills}}<section class="skills"><h2>Core Skills</h2>{{#each skills}}<div class="skill-category"><h3>{{category}}</h3><div class="skill-list">{{#each items}}<div class="skill-item"><span class="skill-name">{{name}}</span><div class="skill-level"><div class="skill-bar" data-level="{{level}}"></div></div></div>{{/each}}</div></div>{{/each}}</section>{{/if}}
                {{#if certifications}}<section class="certifications"><h2>Certifications</h2>{{#each certifications}}<div class="cert-item"><h3>{{name}}</h3><div class="cert-details"><span class="issuer">{{issuer}}</span>{{#if date}}<span class="date">{{formatDate date}}</span>{{/if}}</div>{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
                {{#if languages}}<section class="languages"><h2>Languages</h2>{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</section>{{/if}}
              </div>
            </div>
          </div>`,
          css: `.resume.professional-corporate { font-family: 'Inter', sans-serif; max-width: 8.5in; margin: 0 auto; background: white; color: #1f2937; font-size: 11px; line-height: 1.4; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 25px 30px; margin-bottom: 25px; }
          .header-content { max-width: 100%; }
          .name { font-size: 24px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.5px; }
          .contact-info { display: flex; flex-direction: column; gap: 5px; }
          .contact-row { display: flex; gap: 25px; flex-wrap: wrap; }
          .contact-item { font-size: 11px; opacity: 0.95; }
          .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; padding: 0 30px 30px; }
          section { margin-bottom: 25px; }
          h2 { font-size: 18px; font-weight: 600; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; position: relative; }
          h2::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 30px; height: 2px; background: #1e40af; }
          .summary-text { font-size: 12px; line-height: 1.6; color: #4b5563; text-align: justify; }
          .job-entry, .edu-entry, .project-entry, .achievement-entry { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f3f4f6; }
          .job-header, .edu-header, .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
          .job-title-company h3, .edu-title-institution h3, .project-header h3, .achievement-entry h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
          .company-location, .institution-location { display: flex; gap: 8px; font-size: 11px; color: #6b7280; }
          .job-dates, .edu-dates, .project-dates { font-size: 10px; color: #9ca3af; font-weight: 500; text-align: right; }
          .job-description, .edu-description, .project-description { margin: 8px 0; color: #4b5563; line-height: 1.5; }
          .achievements { margin: 8px 0; padding-left: 18px; }
          .achievements li { margin-bottom: 3px; color: #4b5563; }
          .gpa { font-size: 10px; color: #6b7280; margin: 5px 0; }
          .technologies { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
          .tech-tag { background: #1e40af; color: white; padding: 3px 8px; border-radius: 4px; font-size: 9px; }
          .project-links { margin: 5px 0; }
          .project-links a { color: #1e40af; text-decoration: none; font-size: 10px; margin-right: 15px; }
          .achievement-date { font-size: 10px; color: #9ca3af; margin: 5px 0; font-style: italic; }
          .achievement-issuer { font-size: 10px; color: #6b7280; }
          .custom-field { margin-bottom: 15px; }
          .custom-field h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .custom-content { font-size: 11px; color: #4b5563; line-height: 1.5; }
          .sidebar { background: #f8fafc; padding: 20px; border-radius: 8px; height: fit-content; }
          .sidebar h2 { font-size: 16px; color: #1f2937; border-bottom: 1px solid #e5e7eb; }
          .sidebar h2::after { background: #1f2937; }
          .skill-category { margin-bottom: 20px; }
          .skill-category h3 { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 10px; }
          .skill-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
          .skill-name { font-size: 10px; color: #4b5563; }
          .skill-level { width: 80px; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden; }
          .skill-bar { height: 100%; background: linear-gradient(90deg, #1e40af, #3b82f6); border-radius: 2px; width: 75%; }
          .skill-bar[data-level="expert"] { width: 95%; }
          .skill-bar[data-level="advanced"] { width: 80%; }
          .skill-bar[data-level="intermediate"] { width: 65%; }
          .skill-bar[data-level="beginner"] { width: 40%; }
          .cert-item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
          .cert-item h3 { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .cert-details { display: flex; justify-content: space-between; font-size: 10px; color: #6b7280; }
          .cert-expiry, .cert-id { font-size: 9px; color: #6b7280; margin: 3px 0; }
          .cert-link a { color: #1e40af; text-decoration: none; font-size: 9px; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .language-name { font-size: 10px; color: #1f2937; }
          .language-level { font-size: 9px; color: #6b7280; text-transform: capitalize; }`
        },
        creator: adminUser._id,
        tags: ['professional', 'corporate', 'business', 'two-column', 'blue', 'executive']
      },

      {
        name: 'Professional Executive',
        description: 'Executive-level professional template with sophisticated design',
        category: 'professional',
        preview: {
          thumbnail: {
            url: 'https://via.placeholder.com/300x400/1e3a8a/ffffff?text=Professional%20Executive'
          }
        },
        layout: {
          type: 'single-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 3, isRequired: false, isVisible: true },
            { name: 'projects', position: 4, isRequired: false, isVisible: true },
            { name: 'achievements', position: 5, isRequired: false, isVisible: true },
            { name: 'education', position: 6, isRequired: false, isVisible: true },
            { name: 'skills', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#1e3a8a',
            secondary: '#64748b',
            accent: '#dc2626',
            text: '#1f2937',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Calibri',
            secondary: 'Calibri',
            sizes: { heading: 28, subheading: 20, body: 12, small: 10 }
          }
        },
        availability: { tier: 'pro', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume professional-executive">
            <header class="executive-header">
              <h1 class="name">{{personalInfo.fullName}}</h1>
              <div class="contact-bar">
                {{#if personalInfo.email}}<span class="contact-item">{{personalInfo.email}}</span>{{/if}}
                {{#if personalInfo.phone}}<span class="contact-item">{{personalInfo.phone}}</span>{{/if}}
                {{#if personalInfo.address}}<span class="contact-item">{{personalInfo.address}}</span>{{/if}}
                {{#if personalInfo.website}}<span class="contact-item">{{personalInfo.website}}</span>{{/if}}
                {{#if personalInfo.linkedin}}<span class="contact-item">{{personalInfo.linkedin}}</span>{{/if}}
                {{#if personalInfo.github}}<span class="contact-item">{{personalInfo.github}}</span>{{/if}}
              </div>
            </header>
            {{#if summary}}<section class="executive-summary"><h2>EXECUTIVE SUMMARY</h2><p>{{summary}}</p></section>{{/if}}
            {{#if workExperience}}<section class="leadership-experience"><h2>LEADERSHIP EXPERIENCE</h2>{{#each workExperience}}<div class="executive-role"><div class="role-header"><div class="role-title">{{jobTitle}}</div><div class="role-company">{{company}}</div><div class="role-duration">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</div></div>{{#if location}}<div class="role-location">{{location}}</div>{{/if}}{{#if description}}<p class="role-description">{{description}}</p>{{/if}}{{#if achievements}}<ul class="role-achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if projects}}<section class="executive-projects"><h2>KEY INITIATIVES & PROJECTS</h2>{{#each projects}}<div class="project-item"><h3>{{name}}</h3>{{#if description}}<p class="project-description">{{description}}</p>{{/if}}{{#if technologies}}<div class="project-technologies"><strong>Technologies/Methods:</strong> {{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">Repository</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if achievements}}<section class="achievements-section"><h2>ACHIEVEMENTS & AWARDS</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<h3>{{title}}</h3>{{/if}}{{#if description}}<p>{{description}}</p>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            <div class="executive-bottom">
              {{#if education}}<section class="education-section"><h2>EDUCATION</h2>{{#each education}}<div class="education-item"><div class="degree">{{degree}}</div><div class="institution">{{institution}}</div><div class="education-year">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<div class="education-description">{{description}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if skills}}<section class="executive-skills"><h2>CORE COMPETENCIES</h2><div class="competencies-grid">{{#each skills}}<div class="competency-area"><h3>{{category}}</h3><div class="competency-items">{{#each items}}{{name}}{{#unless @last}} • {{/unless}}{{/each}}</div></div>{{/each}}</div></section>{{/if}}
              {{#if certifications}}<section class="certifications-section"><h2>PROFESSIONAL CERTIFICATIONS</h2><div class="certifications-grid">{{#each certifications}}<div class="certification-item"><div class="cert-name">{{name}}</div><div class="cert-issuer">{{issuer}}</div>{{#if date}}<div class="cert-date">{{formatDate date}}</div>{{/if}}{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</div>{{/if}}
            </div>
            {{#if languages}}<section class="languages-section"><h2>LANGUAGES</h2><div class="languages-grid">{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</div>{{/if}}
            {{#if customFields}}<section class="custom-fields-section">{{#each customFields}}<div class="custom-field"><h2>{{title}}</h2><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
          </div>`,
          css: `.resume.professional-executive { font-family: 'Calibri', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; color: #1f2937; line-height: 1.5; }
          .executive-header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 2rem; margin: -1in -1in 2rem -1in; text-align: center; }
          .name { font-size: 28px; font-weight: 700; margin-bottom: 1rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); letter-spacing: 0.5px; }
          .contact-bar { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; }
          .contact-item { font-size: 11px; padding: 0.5rem 1rem; background: rgba(255,255,255,0.2); border-radius: 20px; backdrop-filter: blur(10px); }
          section { margin-bottom: 2rem; }
          section h2 { font-size: 18px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #1e3a8a; letter-spacing: 0.5px; }
          .executive-summary { background: #f8fafc; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #1e3a8a; }
          .executive-summary p { font-size: 12px; line-height: 1.6; color: #374151; margin: 0; }
          .executive-role { margin-bottom: 2rem; padding: 1.5rem; background: #f9fafb; border-radius: 8px; border-top: 3px solid #dc2626; }
          .role-header { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; margin-bottom: 0.5rem; }
          .role-title { font-size: 16px; font-weight: 600; color: #1f2937; }
          .role-company { font-size: 14px; color: #1e3a8a; font-weight: 500; }
          .role-duration { font-size: 11px; color: #64748b; text-align: right; font-style: italic; }
          .role-location { font-size: 11px; color: #64748b; margin-bottom: 0.5rem; }
          .role-description { font-size: 12px; line-height: 1.5; color: #374151; margin-bottom: 1rem; }
          .executive-bottom { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-top: 2rem; }
          .education-item { margin-bottom: 1.5rem; }
          .degree { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .institution { font-size: 12px; color: #1e3a8a; font-weight: 500; margin-bottom: 0.25rem; }
          .education-year { font-size: 10px; color: #64748b; font-style: italic; }
          .gpa { font-size: 10px; color: #64748b; margin-top: 0.25rem; }
          .competencies-grid { display: flex; flex-direction: column; gap: 1rem; }
          .competency-area h3 { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; }
          .competency-items { font-size: 10px; color: #374151; line-height: 1.4; }
          .certifications-grid { display: flex; flex-direction: column; gap: 1rem; }
          .certification-item { padding: 0.75rem; background: #f1f5f9; border-radius: 6px; border-left: 3px solid #1e3a8a; }
          .cert-name { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .cert-issuer { font-size: 10px; color: #1e3a8a; font-weight: 500; }
          .cert-date { font-size: 9px; color: #64748b; margin-top: 0.25rem; }`
        },
        creator: adminUser._id,
        tags: ['professional', 'executive', 'leadership', 'corporate']
      },

      // ACADEMIC CATEGORY
      {
        name: 'Academic Research',
        description: 'A comprehensive template designed for academic and research positions',
        category: 'academic',
        preview: {
          thumbnail: {
            url: 'placeholder-will-be-replaced-by-puppeteer'
          }
        },
        layout: {
          type: 'single-column',
          sections: [
            { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
            { name: 'summary', position: 2, isRequired: false, isVisible: true },
            { name: 'education', position: 3, isRequired: false, isVisible: true },
            { name: 'workExperience', position: 4, isRequired: false, isVisible: true },
            { name: 'projects', position: 5, isRequired: false, isVisible: true },
            { name: 'achievements', position: 6, isRequired: false, isVisible: true },
            { name: 'skills', position: 7, isRequired: false, isVisible: true },
            { name: 'certifications', position: 8, isRequired: false, isVisible: true }
          ]
        },
        styling: {
          colors: {
            primary: '#059669',
            secondary: '#6b7280',
            accent: '#10b981',
            text: '#1f2937',
            background: '#ffffff'
          },
          fonts: {
            primary: 'Georgia',
            secondary: 'Inter',
            sizes: { heading: 20, subheading: 16, body: 11, small: 10 }
          }
        },
        availability: { tier: 'pro', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume academic-research">
            <header class="header">
              <h1 class="name">{{personalInfo.fullName}}</h1>
              <div class="contact-info">
                <div class="contact-grid">
                  <div class="contact-item"><span class="label">Email:</span><span class="value">{{personalInfo.email}}</span></div>
                  {{#if personalInfo.phone}}<div class="contact-item"><span class="label">Phone:</span><span class="value">{{personalInfo.phone}}</span></div>{{/if}}
                  {{#if personalInfo.address}}<div class="contact-item"><span class="label">Address:</span><span class="value">{{personalInfo.address}}</span></div>{{/if}}
                  {{#if personalInfo.website}}<div class="contact-item"><span class="label">Website:</span><span class="value">{{personalInfo.website}}</span></div>{{/if}}
                </div>
              </div>
            </header>
            {{#if summary}}<section class="research-interests"><h2>Research Interests</h2><p class="interests-text">{{summary}}</p></section>{{/if}}
            {{#if education}}<section class="education"><h2>Education</h2>{{#each education}}<div class="edu-entry"><div class="edu-header"><div class="degree-info"><h3>{{degree}}</h3><div class="institution-info">{{institution}}{{#if location}}, {{location}}{{/if}}</div></div><div class="edu-dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<div class="edu-description">{{description}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if workExperience}}<section class="experience"><h2>Academic & Professional Experience</h2>{{#each workExperience}}<div class="position-entry"><div class="position-header"><div class="position-info"><h3>{{jobTitle}}</h3><div class="institution-info">{{company}}{{#if location}}, {{location}}{{/if}}</div></div><div class="position-dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</div></div>{{#if description}}<div class="position-description">{{description}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if projects}}<section class="publications"><h2>Research Projects & Publications</h2>{{#each projects}}<div class="publication-entry"><h3>{{name}}</h3>{{#if description}}<div class="publication-description">{{description}}</div>{{/if}}{{#if technologies}}<div class="methodologies"><span class="label">Methodologies/Tools:</span>{{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if skills}}<section class="skills"><h2>Technical Skills</h2>{{#each skills}}<div class="skill-category"><h3>{{category}}</h3><div class="skill-items">{{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div></div>{{/each}}</section>{{/if}}
            {{#if certifications}}<section class="certifications"><h2>Professional Certifications</h2>{{#each certifications}}<div class="cert-entry"><div class="cert-header"><h3>{{name}}</h3>{{#if date}}<span class="cert-date">{{formatDate date}}</span>{{/if}}</div>{{#if issuer}}<div class="cert-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
          </div>`,
          css: `.resume.academic-research { font-family: 'Inter', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 30px; background: white; color: #1f2937; font-size: 11px; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #059669; }
          .name { font-family: 'Georgia', serif; font-size: 20px; font-weight: 600; color: #059669; margin-bottom: 15px; letter-spacing: 0.5px; }
          .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; max-width: 600px; margin: 0 auto; }
          .contact-item { display: flex; justify-content: space-between; font-size: 10px; }
          .contact-item .label { font-weight: 600; color: #6b7280; }
          .contact-item .value { color: #1f2937; }
          section { margin-bottom: 25px; }
          h2 { font-family: 'Georgia', serif; font-size: 16px; font-weight: 600; color: #059669; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.5px; }
          .interests-text { font-size: 11px; line-height: 1.6; color: #4b5563; text-align: justify; font-style: italic; }
          .edu-entry, .position-entry, .publication-entry, .cert-entry { margin-bottom: 18px; padding-bottom: 15px; border-bottom: 1px solid #f3f4f6; }
          .edu-header, .position-header, .cert-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
          .edu-entry h3, .position-entry h3, .publication-entry h3, .cert-entry h3 { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
          .institution-info { font-size: 11px; color: #6b7280; font-style: italic; }
          .edu-dates, .position-dates, .cert-date { font-size: 10px; color: #9ca3af; font-weight: 500; }
          .gpa { font-size: 10px; color: #6b7280; margin-bottom: 5px; }
          .edu-description, .position-description, .publication-description { margin: 8px 0; color: #4b5563; line-height: 1.5; text-align: justify; }
          .methodologies { margin: 5px 0; font-size: 10px; }
          .methodologies .label { font-weight: 600; color: #6b7280; }
          .publication-entry { border-left: 3px solid #10b981; padding-left: 12px; }
          .skill-category { margin-bottom: 15px; }
          .skill-category h3 { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
          .skill-items { color: #4b5563; line-height: 1.4; }
          .cert-issuer { color: #6b7280; font-style: italic; }`
        },
        creator: adminUser._id,
        tags: ['academic', 'research', 'education', 'scholarly', 'single-column', 'green']
      },


      {
        "name": "Sleek Professional",
        "description": "Corporate-friendly two-column layout with clean lines and ATS-optimized formatting.",
        "category": "professional",
        "preview": { "thumbnail": { "url": "placeholder-will-be-replaced-by-puppeteer" } },
        "layout": {
          "type": "two-column",
          "sections": [
            { "name": "personalInfo", "position": 1, "isRequired": true, "isVisible": true },
            { "name": "skills", "position": 2, "isRequired": false, "isVisible": true },
            { "name": "summary", "position": 3, "isRequired": false, "isVisible": true },
            { "name": "workExperience", "position": 4, "isRequired": false, "isVisible": true },
            { "name": "education", "position": 5, "isRequired": false, "isVisible": true },
            { "name": "certifications", "position": 6, "isRequired": false, "isVisible": true },
            { "name": "languages", "position": 7, "isRequired": false, "isVisible": true }
          ]
        },
        "styling": {
          "colors": {
            "primary": "#0f172a",
            "secondary": "#475569",
            "accent": "#2563eb",
            "text": "#1e293b",
            "background": "#ffffff"
          },
          "fonts": {
            "primary": "Lato",
            "secondary": "Lato",
            "sizes": { "heading": 22, "subheading": 16, "body": 11, "small": 10 }
          }
        },
        "availability": { "tier": "free", "isPublic": true, "isActive": true },
        "templateCode": {
          "html": "<div class=\"resume sleek-professional\"><header class=\"header\"><h1 class=\"name\">{{personalInfo.fullName}}</h1><div class=\"contact-info\"><span>{{personalInfo.email}}</span>{{#if personalInfo.phone}}<span>{{personalInfo.phone}}</span>{{/if}}{{#if personalInfo.address}}<span>{{personalInfo.address}}</span>{{/if}}{{#if personalInfo.website}}<span>{{personalInfo.website}}</span>{{/if}}</div></header>{{#if summary}}<section class=\"summary\"><h2>Summary</h2><p>{{summary}}</p></section>{{/if}}{{#if skills}}<section class=\"skills\"><h2>Skills</h2>{{#each skills}}<div class=\"skill-category\"><strong>{{category}}:</strong> {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/each}}</section>{{/if}}{{#if workExperience}}<section class=\"experience\"><h2>Experience</h2>{{#each workExperience}}<div class=\"job\"><div class=\"job-header\"><strong>{{jobTitle}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"company\">{{company}}{{#if location}} • {{location}}{{/if}}</div>{{#if description}}<p>{{description}}</p>{{/if}}{{#if achievements}}<ul>{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}{{#if education}}<section class=\"education\"><h2>Education</h2>{{#each education}}<div class=\"edu\"><div class=\"edu-header\"><strong>{{degree}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"institution\">{{institution}}{{#if location}} • {{location}}{{/if}}</div>{{#if gpa}}<div class=\"gpa\">GPA: {{gpa}}</div>{{/if}}{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if certifications}}<section class=\"certifications\"><h2>Certifications</h2>{{#each certifications}}<div class=\"cert\"><strong>{{name}}</strong>{{#if issuer}}<span> • {{issuer}}</span>{{/if}}{{#if date}}<div class=\"dates\">{{formatDate date}}</div>{{/if}}</div>{{/each}}</section>{{/if}}{{#if languages}}<section class=\"languages\"><h2>Languages</h2>{{#each languages}}<div class=\"lang\"><span>{{name}}</span> - <span>{{proficiency}}</span></div>{{/each}}</section>{{/if}}</div>",
          "css": ".resume.sleek-professional { font-family: 'Lato', sans-serif; background: #ffffff; color: #1e293b; padding: 24px; } .header { margin-bottom: 12px; } .name { font-size: 22px; margin: 0 0 6px; } .contact-info { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: #475569; } section { margin-top: 12px; } h2 { font-size: 14px; margin: 0 0 8px; color: #2563eb; } .job-header, .edu-header { display: flex; justify-content: space-between; font-size: 12px; color: #334155; } .company, .institution { font-size: 12px; color: #475569; } .dates { font-size: 11px; color: #64748b; }"
        },
        creator: adminUser._id,
        "tags": ["professional", "corporate", "ats", "clean"]
      },
      {
        "name": "Creative Portfolio",
        "description": "Vibrant single-column design with featured projects at the top.",
        "category": "creative",
        "preview": { "thumbnail": { "url": "placeholder-will-be-replaced-by-puppeteer" } },
        "layout": {
          "type": "single-column",
          "sections": [
            { "name": "personalInfo", "position": 1, "isRequired": true, "isVisible": true },
            { "name": "projects", "position": 2, "isRequired": false, "isVisible": true },
            { "name": "skills", "position": 3, "isRequired": false, "isVisible": true },
            { "name": "summary", "position": 4, "isRequired": false, "isVisible": true },
            { "name": "workExperience", "position": 5, "isRequired": false, "isVisible": true },
            { "name": "education", "position": 6, "isRequired": false, "isVisible": true },
            { "name": "customFields", "position": 7, "isRequired": false, "isVisible": true }
          ]
        },
        "styling": {
          "colors": {
            "primary": "#9333ea",
            "secondary": "#f472b6",
            "accent": "#14b8a6",
            "text": "#111827",
            "background": "#fdf4ff"
          },
          "fonts": {
            "primary": "Poppins",
            "secondary": "Open Sans",
            "sizes": { "heading": 26, "subheading": 18, "body": 12, "small": 10 }
          }
        },
        "availability": { "tier": "pro", "isPublic": true, "isActive": true },
        "templateCode": {
          "html": "<div class=\"resume creative-portfolio\"><header class=\"header\"><h1 class=\"name\">{{personalInfo.fullName}}</h1><div class=\"contact\"><span>{{personalInfo.email}}</span>{{#if personalInfo.website}}<span>{{personalInfo.website}}</span>{{/if}}</div></header>{{#if summary}}<section class=\"summary\"><h2>Summary</h2><p>{{summary}}</p></section>{{/if}}{{#if projects}}<section class=\"projects\"><h2>Featured Projects</h2>{{#each projects}}<div class=\"project\"><h3>{{name}}</h3>{{#if description}}<p>{{description}}</p>{{/if}}{{#if technologies}}<div class=\"tech\">{{#each technologies}}<span>{{this}}</span>{{/each}}</div>{{/if}}{{#if url}}<div class=\"links\"><a href=\"{{url}}\">View</a></div>{{/if}}</div>{{/each}}</section>{{/if}}{{#if skills}}<section class=\"skills\"><h2>Skills</h2>{{#each skills}}<div><strong>{{category}}:</strong> {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/each}}</section>{{/if}}{{#if workExperience}}<section class=\"experience\"><h2>Experience</h2>{{#each workExperience}}<div class=\"job\"><div class=\"job-header\"><strong>{{jobTitle}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"company\">{{company}}{{#if location}} • {{location}}{{/if}}</div>{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if education}}<section class=\"education\"><h2>Education</h2>{{#each education}}<div class=\"edu\"><div class=\"edu-header\"><strong>{{degree}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"institution\">{{institution}}{{#if location}} • {{location}}{{/if}}</div></div>{{/each}}</section>{{/if}}{{#if customFields}}<section class=\"custom-fields\"><h2>Additional</h2>{{#each customFields}}<div class=\"field\"><h3>{{title}}</h3><div>{{content}}</div></div>{{/each}}</section>{{/if}}</div>",
          "css": ".resume.creative-portfolio { font-family: 'Poppins', sans-serif; background: #fdf4ff; color: #111827; padding: 24px; } .header { margin-bottom: 12px; } .name { font-size: 24px; margin: 0 0 6px; color: #9333ea; } .contact { display: flex; gap: 12px; color: #6b21a8; font-size: 12px; } h2 { color: #9333ea; font-size: 14px; margin: 12px 0 6px; } .project h3 { margin: 0 0 4px; font-size: 13px; } .tech span { background: #f472b6; color: white; padding: 2px 6px; border-radius: 10px; margin-right: 4px; font-size: 10px; }"
        },
        creator: adminUser._id,
        "tags": ["creative", "portfolio", "designer", "colorful"]
      },
      {
        "name": "Dark Mode Developer",
        "description": "Bold dark-themed design with monospace accents and neon highlights.",
        "category": "modern",
        "preview": { "thumbnail": { "url": "placeholder-will-be-replaced-by-puppeteer" } },
        "layout": {
          "type": "two-column",
          "sections": [
            { "name": "personalInfo", "position": 1, "isRequired": true, "isVisible": true },
            { "name": "skills", "position": 2, "isRequired": false, "isVisible": true },
            { "name": "summary", "position": 3, "isRequired": false, "isVisible": true },
            { "name": "workExperience", "position": 4, "isRequired": false, "isVisible": true },
            { "name": "projects", "position": 5, "isRequired": false, "isVisible": true },
            { "name": "education", "position": 6, "isRequired": false, "isVisible": true },
            { "name": "languages", "position": 7, "isRequired": false, "isVisible": true }
          ]
        },
        "styling": {
          "colors": {
            "primary": "#38bdf8",
            "secondary": "#0ea5e9",
            "accent": "#a855f7",
            "text": "#f8fafc",
            "background": "#0f172a"
          },
          "fonts": {
            "primary": "Inter",
            "secondary": "JetBrains Mono",
            "sizes": { "heading": 24, "subheading": 16, "body": 11, "small": 10 }
          }
        },
        "availability": { "tier": "free", "isPublic": true, "isActive": true },
        "templateCode": {
          "html": "<div class=\"resume dark-mode-dev\"><header class=\"header\"><h1 class=\"name\">{{personalInfo.fullName}}</h1><div class=\"contact\"><span>{{personalInfo.email}}</span>{{#if personalInfo.linkedin}}<span>{{personalInfo.linkedin}}</span>{{/if}}</div></header>{{#if summary}}<section><h2>Summary</h2><p>{{summary}}</p></section>{{/if}}{{#if skills}}<section><h2>Technical Skills</h2>{{#each skills}}<div><strong>{{category}}:</strong> {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/each}}</section>{{/if}}{{#if workExperience}}<section><h2>Experience</h2>{{#each workExperience}}<div class=\"job\"><div class=\"job-header\"><strong>{{jobTitle}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"company\">{{company}}{{#if location}} • {{location}}{{/if}}</div>{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if projects}}<section><h2>Projects</h2>{{#each projects}}<div class=\"project\"><strong>{{name}}</strong>{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if education}}<section><h2>Education</h2>{{#each education}}<div class=\"edu\"><div class=\"edu-header\"><strong>{{degree}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"institution\">{{institution}}</div></div>{{/each}}</section>{{/if}}{{#if languages}}<section><h2>Languages</h2>{{#each languages}}<div>{{name}} - {{proficiency}}</div>{{/each}}</section>{{/if}}</div>",
          "css": ".resume.dark-mode-dev { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; } .name { color: #38bdf8; margin: 0 0 6px; } .contact { display: flex; gap: 12px; color: #a855f7; font-size: 12px; } h2 { color: #38bdf8; font-size: 14px; margin: 12px 0 6px; }"
        },
        creator: adminUser._id,
        "tags": ["dark", "developer", "tech", "modern"]
      },
      {
        "name": "Elegant Minimal",
        "description": "Minimalist single-column layout with soft colors and elegant typography.",
        "category": "modern",
        "preview": { "thumbnail": { "url": "placeholder-will-be-replaced-by-puppeteer" } },
        "layout": {
          "type": "single-column",
          "sections": [
            { "name": "personalInfo", "position": 1, "isRequired": true, "isVisible": true },
            { "name": "summary", "position": 2, "isRequired": false, "isVisible": true },
            { "name": "workExperience", "position": 3, "isRequired": false, "isVisible": true },
            { "name": "education", "position": 4, "isRequired": false, "isVisible": true },
            { "name": "skills", "position": 5, "isRequired": false, "isVisible": true },
            { "name": "languages", "position": 6, "isRequired": false, "isVisible": true }
          ]
        },
        "styling": {
          "colors": {
            "primary": "#374151",
            "secondary": "#9ca3af",
            "accent": "#10b981",
            "text": "#111827",
            "background": "#ffffff"
          },
          "fonts": {
            "primary": "Merriweather",
            "secondary": "Open Sans",
            "sizes": { "heading": 24, "subheading": 18, "body": 12, "small": 10 }
          }
        },
        "availability": { "tier": "free", "isPublic": true, "isActive": true },
        "templateCode": {
          "html": "<div class=\"resume elegant-minimal\"><header class=\"header\"><h1 class=\"name\">{{personalInfo.fullName}}</h1><div class=\"contact\"><span>{{personalInfo.email}}</span>{{#if personalInfo.phone}}<span>{{personalInfo.phone}}</span>{{/if}}</div></header>{{#if summary}}<section><h2>Summary</h2><p>{{summary}}</p></section>{{/if}}{{#if workExperience}}<section><h2>Experience</h2>{{#each workExperience}}<div class=\"job\"><div class=\"job-header\"><strong>{{jobTitle}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"company\">{{company}}{{#if location}} • {{location}}{{/if}}</div>{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if education}}<section><h2>Education</h2>{{#each education}}<div class=\"edu\"><div class=\"edu-header\"><strong>{{degree}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"institution\">{{institution}}</div></div>{{/each}}</section>{{/if}}{{#if skills}}<section><h2>Skills</h2>{{#each skills}}<div><strong>{{category}}:</strong> {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/each}}</section>{{/if}}{{#if languages}}<section><h2>Languages</h2>{{#each languages}}<div>{{name}} - {{proficiency}}</div>{{/each}}</section>{{/if}}</div>",
          "css": ".resume.elegant-minimal { font-family: 'Merriweather', serif; background: #ffffff; color: #111827; padding: 24px; } .name { font-size: 24px; margin: 0 0 6px; } .contact { display: flex; gap: 12px; color: #6b7280; font-size: 12px; } h2 { font-size: 14px; margin: 12px 0 6px; color: #10b981; } .dates { font-size: 11px; color: #6b7280; }"
        },
        creator: adminUser._id,
        "tags": ["minimal", "modern", "clean", "professional"]
      },
      {
        "name": "Bold Accent",
        "description": "Single-column resume with strong header bar and bold accent color for headings.",
        "category": "modern",
        "preview": { "thumbnail": { "url": "placeholder-will-be-replaced-by-puppeteer" } },
        "layout": {
          "type": "single-column",
          "sections": [
            { "name": "personalInfo", "position": 1, "isRequired": true, "isVisible": true },
            { "name": "summary", "position": 2, "isRequired": false, "isVisible": true },
            { "name": "skills", "position": 3, "isRequired": false, "isVisible": true },
            { "name": "workExperience", "position": 4, "isRequired": false, "isVisible": true },
            { "name": "projects", "position": 5, "isRequired": false, "isVisible": true },
            { "name": "education", "position": 6, "isRequired": false, "isVisible": true }
          ]
        },
        "styling": {
          "colors": {
            "primary": "#ef4444",
            "secondary": "#fca5a5",
            "accent": "#ef4444",
            "text": "#1f2937",
            "background": "#ffffff"
          },
          "fonts": {
            "primary": "Montserrat",
            "secondary": "Open Sans",
            "sizes": { "heading": 26, "subheading": 18, "body": 12, "small": 10 }
          }
        },
        "availability": { "tier": "pro", "isPublic": true, "isActive": true },
        "templateCode": {
          "html": "<div class=\"resume bold-accent\"><header class=\"header\"><h1 class=\"name\">{{personalInfo.fullName}}</h1><div class=\"contact\"><span>{{personalInfo.email}}</span>{{#if personalInfo.phone}}<span>{{personalInfo.phone}}</span>{{/if}}</div></header>{{#if summary}}<section><h2>Professional Summary</h2><p>{{summary}}</p></section>{{/if}}{{#if skills}}<section><h2>Core Skills</h2>{{#each skills}}<div><strong>{{category}}:</strong> {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/each}}</section>{{/if}}{{#if workExperience}}<section><h2>Experience</h2>{{#each workExperience}}<div class=\"job\"><div class=\"job-header\"><strong>{{jobTitle}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"company\">{{company}}{{#if location}} • {{location}}{{/if}}</div>{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if projects}}<section><h2>Projects</h2>{{#each projects}}<div class=\"project\"><strong>{{name}}</strong>{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if education}}<section><h2>Education</h2>{{#each education}}<div class=\"edu\"><div class=\"edu-header\"><strong>{{degree}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"institution\">{{institution}}</div></div>{{/each}}</section>{{/if}}</div>",
          "css": ".resume.bold-accent { font-family: 'Montserrat', sans-serif; background: #ffffff; color: #1f2937; padding: 24px; } .name { font-size: 24px; margin: 0 0 6px; color: #ef4444; } .contact { display: flex; gap: 12px; color: #ef4444; font-size: 12px; } h2 { color: #ef4444; font-size: 14px; margin: 12px 0 6px; }"
        },
        creator: adminUser._id,
        "tags": ["bold", "modern", "accent", "colorful"]
      },
      {
        "name": "Classic Serif",
        "description": "Traditional serif design for academic or formal applications.",
        "category": "classic",
        "preview": { "thumbnail": { "url": "placeholder-will-be-replaced-by-puppeteer" } },
        "layout": {
          "type": "single-column",
          "sections": [
            { "name": "personalInfo", "position": 1, "isRequired": true, "isVisible": true },
            { "name": "summary", "position": 2, "isRequired": false, "isVisible": true },
            { "name": "education", "position": 3, "isRequired": false, "isVisible": true },
            { "name": "workExperience", "position": 4, "isRequired": false, "isVisible": true },
            { "name": "achievements", "position": 5, "isRequired": false, "isVisible": true },
            { "name": "languages", "position": 6, "isRequired": false, "isVisible": true }
          ]
        },
        "styling": {
          "colors": {
            "primary": "#1f2937",
            "secondary": "#6b7280",
            "accent": "#4b5563",
            "text": "#111827",
            "background": "#ffffff"
          },
          "fonts": {
            "primary": "Times New Roman",
            "secondary": "Georgia",
            "sizes": { "heading": 24, "subheading": 18, "body": 12, "small": 10 }
          }
        },
        "availability": { "tier": "free", "isPublic": true, "isActive": true },
        "templateCode": {
          "html": "<div class=\"resume classic-serif\"><header class=\"header\"><h1 class=\"name\">{{personalInfo.fullName}}</h1><div class=\"contact\">{{personalInfo.email}}{{#if personalInfo.phone}} | {{personalInfo.phone}}{{/if}}</div></header>{{#if summary}}<section><h2>Objective</h2><p>{{summary}}</p></section>{{/if}}{{#if education}}<section><h2>Education</h2>{{#each education}}<div class=\"edu\"><div class=\"edu-header\"><strong>{{degree}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"institution\">{{institution}}{{#if location}} • {{location}}{{/if}}</div></div>{{/each}}</section>{{/if}}{{#if workExperience}}<section><h2>Experience</h2>{{#each workExperience}}<div class=\"job\"><div class=\"job-header\"><strong>{{jobTitle}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"company\">{{company}}</div>{{#if description}}<p>{{description}}</p>{{/if}}{{#if achievements}}<ul>{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}{{#if achievements}}<section><h2>Achievements</h2>{{#each achievements}}<div><strong>{{title}}</strong>{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if languages}}<section><h2>Languages</h2>{{#each languages}}<div>{{name}} - {{proficiency}}</div>{{/each}}</section>{{/if}}</div>",
          "css": ".resume.classic-serif { font-family: 'Times New Roman', serif; background: #ffffff; color: #111827; padding: 24px; } .name { font-size: 22px; margin: 0 0 6px; } .contact { font-size: 12px; color: #4b5563; } h2 { text-transform: uppercase; font-size: 14px; margin: 12px 0 6px; } .dates { font-size: 11px; color: #6b7280; }"
        },
        creator: adminUser._id,
        "tags": ["classic", "serif", "academic", "formal"]
      },
      {
        "name": "Fresh Gradient",
        "description": "Modern design with gradient header bar and rounded section cards.",
        "category": "modern",
        "preview": { "thumbnail": { "url": "placeholder-will-be-replaced-by-puppeteer" } },
        "layout": {
          "type": "two-column",
          "sections": [
            { "name": "personalInfo", "position": 1, "isRequired": true, "isVisible": true },
            { "name": "skills", "position": 2, "isRequired": false, "isVisible": true },
            { "name": "summary", "position": 3, "isRequired": false, "isVisible": true },
            { "name": "workExperience", "position": 4, "isRequired": false, "isVisible": true },
            { "name": "projects", "position": 5, "isRequired": false, "isVisible": true },
            { "name": "education", "position": 6, "isRequired": false, "isVisible": true }
          ]
        },
        "styling": {
          "colors": {
            "primary": "#3b82f6",
            "secondary": "#9333ea",
            "accent": "#14b8a6",
            "text": "#111827",
            "background": "#f9fafb"
          },
          "fonts": {
            "primary": "Inter",
            "secondary": "Inter",
            "sizes": { "heading": 24, "subheading": 18, "body": 12, "small": 10 }
          }
        },
        "availability": { "tier": "pro", "isPublic": true, "isActive": true },
        "templateCode": {
          "html": "<div class=\"resume fresh-gradient\"><header class=\"header\"><h1 class=\"name\">{{personalInfo.fullName}}</h1><div class=\"contact\"><span>{{personalInfo.email}}</span>{{#if personalInfo.website}}<span>{{personalInfo.website}}</span>{{/if}}</div></header>{{#if summary}}<section><h2>Summary</h2><p>{{summary}}</p></section>{{/if}}{{#if skills}}<section><h2>Skills</h2>{{#each skills}}<div><strong>{{category}}:</strong> {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/each}}</section>{{/if}}{{#if workExperience}}<section><h2>Experience</h2>{{#each workExperience}}<div class=\"job\"><div class=\"job-header\"><strong>{{jobTitle}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"company\">{{company}}{{#if location}} • {{location}}{{/if}}</div>{{#if description}}<p>{{description}}</p>{{/if}}</div>{{/each}}</section>{{/if}}{{#if projects}}<section><h2>Projects</h2>{{#each projects}}<div class=\"project\"><div class=\"project-header\"><strong>{{name}}</strong>{{#if startDate}}<span class=\"dates\">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}</div>{{#if technologies}}<div class=\"tech\">{{#each technologies}}<span class=\"tag\">{{this}}</span>{{/each}}</div>{{/if}}</div>{{/each}}</section>{{/if}}{{#if education}}<section><h2>Education</h2>{{#each education}}<div class=\"edu\"><div class=\"edu-header\"><strong>{{degree}}</strong><span class=\"dates\">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class=\"institution\">{{institution}}</div></div>{{/each}}</section>{{/if}}</div>",
          "css": ".resume.fresh-gradient { font-family: 'Inter', sans-serif; background: #f9fafb; color: #111827; padding: 24px; } .name { font-size: 24px; margin: 0 0 6px; color: #3b82f6; } .contact { display: flex; gap: 12px; color: #3b82f6; font-size: 12px; } h2 { color: #3b82f6; font-size: 14px; margin: 12px 0 6px; } .project-header { display: flex; justify-content: space-between; font-size: 12px; } .tag { background: #9333ea; color: white; padding: 2px 6px; border-radius: 8px; margin-right: 4px; font-size: 10px; }"
        },
        creator: adminUser._id,
        "tags": ["modern", "gradient", "colorful", "rounded"]
      }
    ];

    console.log('📝 Processing templates...');
    
    // Create templates in chunks to avoid memory issues
    const chunkSize = 3;
    const createdTemplates = [];
    
    for (let i = 0; i < templates.length; i += chunkSize) {
      const chunk = templates.slice(i, i + chunkSize);
      const created = await Template.insertMany(chunk);
      createdTemplates.push(...created);
      console.log(`✅ Created ${created.length} templates (${i + 1}-${Math.min(i + chunkSize, templates.length)} of ${templates.length})`);
    }

    // Initialize thumbnail generation manager
    console.log('\n🚀 Initializing thumbnail generation...');
    thumbnailManager = new ThumbnailGenerationManager();
    await thumbnailManager.initialize();

    // Generate thumbnails for all created templates
    const thumbnailResults = await thumbnailManager.generateThumbnailsForTemplates(createdTemplates, {
      width: 300,
      height: 400,
      format: 'webp',
      quality: 85,
      updateDatabase: true
    });

    // Clean up thumbnail manager
    await thumbnailManager.cleanup();

    // Generate summary
    const successfulThumbnails = thumbnailResults.filter(r => r.success).length;
    const failedThumbnails = thumbnailResults.filter(r => !r.success).length;
    
    console.log(`\n🎉 Successfully created ${createdTemplates.length} templates:`);
    createdTemplates.forEach((template, index) => {
      const thumbnailResult = thumbnailResults.find(r => r.templateId.toString() === template._id.toString());
      const thumbnailStatus = thumbnailResult?.success ? '✅' : '❌';
      console.log(`   ${index + 1}. ${template.name} (${template.category}) - ${template.availability.tier} ${thumbnailStatus}`);
    });

    console.log(`\n📸 Thumbnail Generation Summary:`);
    console.log(`   ✅ Successful: ${successfulThumbnails}/${thumbnailResults.length}`);
    console.log(`   ❌ Failed: ${failedThumbnails}/${thumbnailResults.length}`);

    if (failedThumbnails > 0) {
      console.log('\n❌ Failed thumbnail generation:');
      thumbnailResults.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.templateName}: ${r.error || 'Unknown error'}`);
      });
    }
    
    console.log('\n✨ Template seeding with thumbnail generation completed successfully!');
    console.log(`\n🔗 Templates are now accessible at:`);
    console.log(`   - API: ${process.env.BASE_URL || 'http://localhost:5000'}/api/templates`);
    console.log(`   - Thumbnails: ${process.env.BASE_URL || 'http://localhost:5000'}/thumbnails/`);
    
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    
    // Clean up thumbnail manager if it was initialized
    if (thumbnailManager) {
      try {
        await thumbnailManager.cleanup();
      } catch (cleanupError) {
        console.error('❌ Error during cleanup:', cleanupError);
      }
    }
    
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (disconnectError) {
      console.error('❌ Error disconnecting from MongoDB:', disconnectError);
    }
  }
};

// Run the seeder
if (require.main === module) {
  seedAllTemplates()
    .then(() => {
      console.log('🎉 Seeding process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = seedAllTemplates; 