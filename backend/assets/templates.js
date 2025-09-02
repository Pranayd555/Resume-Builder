module.exports = [
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
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume modern-professional" itemscope itemtype="http://schema.org/Person">
        <div class="main-column">
          <header class="header">
            <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
            <div class="contact-info">
              <div class="contact-item" itemprop="email">{{personalInfo.email}}</div>
              {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
              {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
              {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
              {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
              {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
            </div>
          </header>
          
          {{#if summary}}
          <section class="summary">
            <h3>Professional Summary</h3>
            <div itemprop="description">{{{summary}}}</div>
          </section>
          {{/if}}
          
          {{#if skills}}
          <section class="skills">
            <h3>Core Competencies</h3>
            {{#each skills}}
            <div class="skill-category">
              <div class="skill-category-title">{{category}}</div>
              <div class="skill-items">
                {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
              </div>
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if workExperience}}
          <section class="work-experience">
            <h3>Professional Experience</h3>
            {{#each workExperience}}
            <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
              <div class="job-header">
                <div class="job-title" itemprop="title">{{jobTitle}}</div>
                <div class="job-meta">
                  <span class="company" itemprop="hiringOrganization">{{company}}</span>
                  {{#if location}}<span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}
                </div>
                <div class="job-dates">
                  <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                  {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                </div>
              </div>
              {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
              {{#if achievements}}
              <ul class="achievements">
                {{#each achievements}}<li>{{this}}</li>{{/each}}
              </ul>
              {{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if education}}
          <section class="education">
            <h3>Education</h3>
            {{#each education}}
            <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
              <div class="edu-header">
                <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
                <div class="edu-meta">
                  <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                  {{#if location}}<span class="location">{{location}}</span>{{/if}}
                </div>
                <div class="edu-dates">
                  <time>{{formatDate startDate}}</time> - 
                  {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                </div>
              </div>
              {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
              {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
        </div>
        
        <div class="sidebar">
          {{#if projects}}
          <section class="projects">
            <h3>Key Projects</h3>
            {{#each projects}}
            <div class="project-item">
              <div class="project-name">{{name}}</div>
              {{#if description}}<div class="project-description">{{{description}}}</div>{{/if}}
              {{#if technologies}}
              <div class="technologies">
                <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
              </div>
              {{/if}}
              {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
              {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
              {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if certifications}}
          <section class="certifications">
            <h3>Professional Certifications</h3>
            {{#each certifications}}
            <div class="cert-item">
              <div class="cert-name">{{name}}</div>
              <div class="cert-meta">
                <span class="issuer">{{issuer}}</span>
                {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
              </div>
              {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
              {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
              {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if achievements}}
          <section class="achievements">
            <h3>Achievements & Awards</h3>
            {{#each achievements}}
            <div class="achievement-item">
              {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
              {{#if description}}<p class="achievement-description">{{description}}</p>{{/if}}
              {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
              {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if languages}}
          <section class="languages">
            <h3>Languages</h3>
            {{#each languages}}
            <div class="language-item">
              <span class="language-name">{{name}}</span>
              <span class="language-level">{{proficiency}}</span>
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if customFields}}
          <section class="custom-fields">
            {{#each customFields}}
            <div class="custom-field">
              <div class="custom-field-title">{{title}}</div>
              <div class="custom-content">{{content}}</div>
            </div>
            {{/each}}
          </section>
          {{/if}}
        </div>
      </article>`,
      css: `.resume.modern-professional { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; font-size: 12px; line-height: 1; }
      @media print { .resume.modern-professional { max-width: none; margin: 0; padding: 0.5in; } }
      @media (max-width: 768px) { .resume.modern-professional { grid-template-columns: 1fr; gap: 15px; padding: 15px; } }
      
      .header { margin-bottom: 1rem; }
      .name { font-size: 16px; font-weight: 700; color: #2563eb; margin-bottom: 0.5rem; }
      .contact-info { display: flex; flex-wrap: wrap; gap: 12px; font-size: 11px; color: #64748b; }
      .contact-item { display: flex; align-items: center; }
      .contact-item a { color: #64748b; text-decoration: none; }
      .contact-item a:hover { text-decoration: underline; }
      
      section { margin-top: 1rem; }
      h3 { font-size: 16px; font-weight: 600; color: #2563eb; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 2px solid #e5e7eb; }
      
      .job-item, .edu-item, .project-item, .cert-item { margin-bottom: 0.5rem; }
      .job-header, .edu-header { margin-bottom: 0.25rem; }
      .job-title, .edu-degree, .project-name, .cert-name { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .job-meta, .edu-meta, .cert-meta { display: flex; gap: 8px; font-size: 11px; color: #64748b; margin-bottom: 0.25rem; }
      .job-dates, .edu-dates, .project-dates, .cert-dates { font-size: 10px; color: #64748b; font-style: italic; }
      .job-description, .edu-description, .project-description { margin-bottom: 0.25rem; color: #374151; line-height: 1; }
      
      .achievements { margin-bottom: 0.25rem; }
      .achievements li { margin-bottom: 0.125rem; color: #374151; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 0.125rem; color: #374151; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      
      .sidebar { background: #f8fafc; padding: 16px; border-radius: 6px; }
      @media print { .sidebar { background: white; border: 1px solid #e5e7eb; } }
      .sidebar h3 { font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; }
      
      .skill-category { margin-bottom: 0.5rem; }
      .skill-category-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .skill-items { display: flex; flex-wrap: wrap; gap: 4px; }
      .skill-item { background: #2563eb; color: white; padding: 3px 6px; border-radius: 3px; font-size: 10px; }
      .skill-item[data-level="expert"] { background: #059669; }
      .skill-item[data-level="advanced"] { background: #0ea5e9; }
      .skill-item[data-level="intermediate"] { background: #2563eb; }
      .skill-item[data-level="beginner"] { background: #6b7280; }
      
      .technologies { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 0.25rem; }
      .tech-tag { background: #0ea5e9; color: white; padding: 2px 5px; border-radius: 2px; font-size: 9px; }
      
      .project-links { margin-top: 0.25rem; }
      .project-links a { color: #374151; text-decoration: none; font-size: 9px; margin-right: 8px; }
      .project-links a:hover { text-decoration: underline; }
      
      .achievement-item { margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid #e5e7eb; }
      .achievement-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .achievement-description { font-size: 12px; color: #4b5563; margin-bottom: 0.25rem; line-height: 1; }
      .achievement-date { font-size: 9px; color: #6b7280; font-style: italic; }
      .achievement-issuer { font-size: 9px; color: #6b7280; }
      
      .cert-expiry, .cert-id { font-size: 9px; color: #6b7280; margin-top: 0.125rem; }
      .cert-link a { color: #6b7280; text-decoration: none; font-size: 8px; }
      .cert-link a:hover { text-decoration: underline; }
      
      .language-item { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
      .language-name { font-size: 11px; color: #1f2937; }
      .language-level { font-size: 10px; color: #6b7280; text-transform: capitalize; }
      
      .custom-field { margin-bottom: 0.5rem; }
      .custom-field-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .custom-content { font-size: 12px; color: #4b5563; line-height: 1; }`
    },
    creator: null,
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
        primary: 'Calibri',
        secondary: 'Calibri',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume modern-executive" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
          <div class="title-line"></div>
          <div class="contact-info">
            <span itemprop="email">{{personalInfo.email}}</span>
            {{#if personalInfo.phone}}<span itemprop="telephone">{{personalInfo.phone}}</span>{{/if}}
            {{#if personalInfo.address}}<span itemprop="address">{{personalInfo.address}}</span>{{/if}}
            {{#if personalInfo.website}}<span><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span>{{/if}}
            {{#if personalInfo.linkedin}}<span><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
            {{#if personalInfo.github}}<span><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
          </div>
        </header>
        
        {{#if summary}}
        <section class="executive-summary">
          <h3>Executive Summary</h3>
          <div class="summary-text" itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills">
          <h3>Core Competencies</h3>
          {{#each skills}}
          <div class="skill-category">
            <div class="skill-category-title">{{category}}</div>
            <div class="skill-items">
              {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
            </div>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="experience">
          <h3>Professional Experience</h3>
          {{#each workExperience}}
          <div class="position" itemscope itemtype="http://schema.org/JobPosting">
            <div class="position-header">
              <div class="position-title">
                <div class="job-title" itemprop="title">{{jobTitle}}</div>
                <div class="company-info">
                  <span class="company" itemprop="hiringOrganization">{{company}}</span>
                  {{#if location}}<span class="location" itemprop="jobLocation">| {{location}}</span>{{/if}}
                </div>
              </div>
              <div class="dates">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if description}}<div class="description" itemprop="description">{{{description}}}</div>{{/if}}
            {{#if achievements}}
            <ul class="achievements">
              {{#each achievements}}<li>{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="projects">
          <h3>Key Projects</h3>
          {{#each projects}}
          <div class="project-item">
            <div class="project-name">{{name}}</div>
            {{#if description}}<div class="project-description">{{{description}}}</div>{{/if}}
            {{#if technologies}}
            <div class="technologies">
              <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
            </div>
            {{/if}}
            {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
            {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if achievements}}
        <section class="achievements-section">
          <h3>Achievements & Awards</h3>
          {{#each achievements}}
          <div class="achievement-item">
            {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
            {{#if description}}<p class="achievement-description">{{description}}</p>{{/if}}
            {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
            {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education">
          <h3>Education</h3>
          {{#each education}}
          <div class="edu-entry" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="edu-header">
              <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
              <div class="edu-meta">
                <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                {{#if location}}<span class="location">| {{location}}</span>{{/if}}
              </div>
              <div class="dates">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications">
          <h3>Professional Certifications</h3>
          {{#each certifications}}
          <div class="cert-item">
            <div class="cert-name">{{name}}</div>
            <div class="cert-meta">
              <span class="issuer">{{issuer}}</span>
              {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
            {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
            {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages">
          <h3>Languages</h3>
          {{#each languages}}
          <div class="language-item">
            <span class="language-name">{{name}}</span>
            <span class="language-level">{{proficiency}}</span>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if customFields}}
        <section class="custom-fields">
          {{#each customFields}}
          <div class="custom-field">
            <div class="custom-field-title">{{title}}</div>
            <div class="custom-content">{{content}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      css: `.resume.modern-executive { font-family: 'Calibri', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #374151; font-size: 12px; line-height: 1; }
      .header { text-align: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
      .name { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; letter-spacing: 0.5px; }
      .title-line { width: 40px; height: 2px; background: #f59e0b; margin: 0 auto 0.5rem; }
      .contact-info { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; font-size: 11px; color: #6b7280; }
      .contact-info a { color: #6b7280; text-decoration: none; }
      section { margin-top: 1rem; }
      h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; position: relative; padding-bottom: 0.25rem; }
      h3::after { content: ''; position: absolute; bottom: 0; left: 0; width: 30px; height: 2px; background: #f59e0b; }
      .executive-summary .summary-text { font-size: 12px; line-height: 1; color: #4b5563; font-style: italic; text-align: justify; }
      .position, .edu-entry, .project-item, .achievement-item { margin-bottom: 0.5rem; }
      .position-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem; }
      .position-title, .edu-degree, .project-name, .achievement-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .company-info, .edu-meta { display: flex; gap: 8px; font-size: 11px; color: #6b7280; }
      .dates { font-size: 10px; color: #9ca3af; font-weight: 500; }
      .description { margin-bottom: 0.25rem; color: #4b5563; line-height: 1; }
      .achievements { margin-bottom: 0.25rem; }
      .achievements li { margin-bottom: 0.125rem; color: #4b5563; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      .gpa { font-size: 10px; color: #6b7280; margin-bottom: 0.25rem; }
      .skill-category { margin-bottom: 0.5rem; }
      .skill-category-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .skill-items { display: flex; flex-wrap: wrap; gap: 3px; }
      .skill-item { background: #f59e0b; color: white; padding: 2px 4px; border-radius: 2px; font-size: 9px; }
      .skill-item[data-level="expert"] { background: #059669; }
      .skill-item[data-level="advanced"] { background: #0ea5e9; }
      .skill-item[data-level="intermediate"] { background: #f59e0b; }
      .skill-item[data-level="beginner"] { background: #6b7280; }
      .technologies { display: flex; flex-wrap: wrap; gap: 2px; margin-top: 0.25rem; }
      .tech-tag { background: #374151; color: white; padding: 1px 3px; border-radius: 2px; font-size: 8px; }
      .project-links { margin-top: 0.25rem; }
      .project-links a { color: #f59e0b; text-decoration: none; font-size: 9px; margin-right: 8px; }
      .achievement-date { font-size: 9px; color: #6b7280; font-style: italic; margin-top: 0.25rem; }
      .achievement-issuer { font-size: 9px; color: #6b7280; margin-top: 0.125rem; }
      .cert-item { margin-bottom: 0.5rem; }
      .cert-meta { display: flex; gap: 8px; font-size: 10px; color: #6b7280; margin-bottom: 0.25rem; }
      .cert-expiry, .cert-id { font-size: 9px; color: #6b7280; margin-bottom: 0.125rem; }
      .cert-link a { color: #f59e0b; text-decoration: none; font-size: 8px; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
      .language-name { font-size: 11px; color: #1f2937; }
      .language-level { font-size: 10px; color: #6b7280; text-transform: capitalize; }
      .custom-field { margin-bottom: 0.5rem; }
      .custom-field-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .custom-content { font-size: 12px; color: #4b5563; line-height: 1; }`
    },
    creator: null,
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
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume modern-tech" itemscope itemtype="http://schema.org/Person">
        <header class="tech-header">
          <div class="header-left">
            <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
            <div class="contact-info">
              {{#if personalInfo.email}}<div class="contact-item" itemprop="email">{{personalInfo.email}}</div>{{/if}}
              {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
              {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
              {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
              {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
              {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
            </div>
          </div>
        </header>
        
        {{#if summary}}
        <section class="summary-section">
          <h3>Professional Summary</h3>
          <div itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills-section">
          <h3>Technical Skills</h3>
          {{#each skills}}
          <div class="skill-category">
            <div class="skill-category-title">{{category}}</div>
            <div class="skill-items">
              {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
            </div>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="experience-section">
          <h3>Professional Experience</h3>
          {{#each workExperience}}
          <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
            <div class="job-header">
              <div class="job-title" itemprop="title">{{jobTitle}}</div>
              <div class="job-company" itemprop="hiringOrganization">{{company}}</div>
              <div class="job-duration">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if location}}<div class="job-location" itemprop="jobLocation">{{location}}</div>{{/if}}
            {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
            {{#if achievements}}
            <ul class="achievements">
              {{#each achievements}}<li>{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="projects-section">
          <h3>Key Projects</h3>
          {{#each projects}}
          <div class="project-item">
            <div class="project-name">{{name}}</div>
            {{#if description}}<div class="project-description">{{{description}}}</div>{{/if}}
            {{#if technologies}}
            <div class="technologies">
              <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
            </div>
            {{/if}}
            {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
            {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
            {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education-section">
          <h3>Education</h3>
          {{#each education}}
          <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="edu-header">
              <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
              <div class="edu-institution" itemprop="recognizedBy">{{institution}}</div>
              <div class="edu-duration">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if location}}<div class="edu-location">{{location}}</div>{{/if}}
            {{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}
            {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if achievements}}
        <section class="achievements-section">
          <h3>Achievements & Awards</h3>
          {{#each achievements}}
          <div class="achievement-item">
            {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
            {{#if description}}<p class="achievement-description">{{description}}</p>{{/if}}
            {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
            {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications-section">
          <h3>Professional Certifications</h3>
          {{#each certifications}}
          <div class="cert-item">
            <div class="cert-name">{{name}}</div>
            <div class="cert-meta">
              <span class="issuer">{{issuer}}</span>
              {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
            {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
            {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages-section">
          <h3>Languages</h3>
          {{#each languages}}
          <div class="language-item">
            <span class="language-name">{{name}}</span>
            <span class="language-level">{{proficiency}}</span>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if customFields}}
        <section class="custom-fields-section">
          {{#each customFields}}
          <div class="custom-field">
            <div class="custom-field-title">{{title}}</div>
            <div class="custom-content">{{content}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      css: `.resume.modern-tech { font-family: 'Roboto', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; line-height: 1; }
      .tech-header { display: grid; grid-template-columns: 2fr 1fr; gap: 1.2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #06b6d4; }
      .name { font-size: 16px; font-weight: 700; color: #06b6d4; margin-bottom: 0.5rem; }
      .contact-info { display: flex; flex-wrap: wrap; gap: 0.6rem; }
      .contact-item { font-size: 11px; color: #64748b; padding: 0.2rem 0.4rem; background: #f1f5f9; border-radius: 3px; }
      .contact-item a { color: #64748b; text-decoration: none; }
      section { margin-top: 1rem; }
      h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 2px solid #06b6d4; }
      .summary-section p { font-size: 12px; line-height: 1; color: #4b5563; }
      .skill-category { margin-bottom: 0.5rem; }
      .skill-category-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .skill-items { display: flex; flex-wrap: wrap; gap: 0.3rem; }
      .skill-item { background: #06b6d4; color: white; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 9px; }
      .skill-item[data-level="expert"] { background: #059669; }
      .skill-item[data-level="advanced"] { background: #0ea5e9; }
      .skill-item[data-level="intermediate"] { background: #06b6d4; }
      .skill-item[data-level="beginner"] { background: #6b7280; }
      .job-item, .project-item, .edu-item, .achievement-item, .cert-item { margin-bottom: 0.5rem; padding: 0.6rem; background: #f8fafc; border-radius: 6px; border-left: 3px solid #06b6d4; }
      .job-header, .edu-header { display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.6rem; margin-bottom: 0.25rem; }
      .job-title, .edu-degree, .project-name, .achievement-title, .cert-name { font-size: 12px; font-weight: 600; color: #1f2937; }
      .job-company, .edu-institution { font-size: 11px; color: #06b6d4; font-weight: 500; }
      .job-duration, .edu-duration { font-size: 10px; color: #64748b; text-align: right; }
      .job-location, .edu-location { font-size: 10px; color: #6b7280; margin-bottom: 0.25rem; }
      .job-description, .edu-description { font-size: 12px; color: #4b5563; margin-bottom: 0.25rem; }
      .achievements { margin-bottom: 0.25rem;}
      .achievements li { margin-bottom: 0.125rem; color: #4b5563; font-size: 10px; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; font-size: 10px; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      .gpa { font-size: 10px; color: #6b7280; margin-bottom: 0.25rem; }
      .technologies { display: flex; flex-wrap: wrap; gap: 0.2rem; margin-top: 0.25rem; }
      .tech-tag { background: #8b5cf6; color: white; padding: 0.1rem 0.3rem; border-radius: 2px; font-size: 8px; }
      .project-links { margin-top: 0.25rem; }
      .project-links a { color: #06b6d4; text-decoration: none; font-size: 9px; margin-right: 0.6rem; }
      .project-dates { font-size: 9px; color: #6b7280; margin-top: 0.25rem; font-style: italic; }
      .achievement-date { font-size: 9px; color: #6b7280; font-style: italic; margin-top: 0.25rem; }
      .achievement-issuer { font-size: 9px; color: #6b7280; margin-top: 0.125rem; }
      .cert-meta { display: flex; gap: 0.6rem; font-size: 10px; color: #6b7280; margin-bottom: 0.25rem; }
      .cert-expiry, .cert-id { font-size: 9px; color: #6b7280; margin-bottom: 0.125rem; }
      .cert-link a { color: #06b6d4; text-decoration: none; font-size: 8px; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
      .language-name { font-size: 11px; color: #1f2937; }
      .language-level { font-size: 10px; color: #6b7280; text-transform: capitalize; }
      .custom-field { margin-bottom: 0.5rem; }
      .custom-field-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
      .custom-content { font-size: 12px; color: #4b5563; line-height: 1; }`
    },
    creator: null,
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
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<div class="resume creative-designer">
        <div class="sidebar">
          <div class="profile-section">
            <h1 class="name">{{personalInfo.fullName}}</h1>
            <div class="contact-info">
              <div class="contact-item"><span class="icon">📧</span><span>{{personalInfo.email}}</span></div>
              {{#if personalInfo.phone}}<div class="contact-item"><span class="icon">📱</span><span>{{personalInfo.phone}}</span></div>{{/if}}
              {{#if personalInfo.address}}<div class="contact-item"><span class="icon">📍</span><span>{{personalInfo.address}}</span></div>{{/if}}
              {{#if personalInfo.website}}<div class="contact-item"><span class="icon">🌐</span><span><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span></div>{{/if}}
              {{#if personalInfo.linkedin}}<div class="contact-item"><span class="icon">💼</span><span><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span></div>{{/if}}
              {{#if personalInfo.github}}<div class="contact-item"><span class="icon">🐱</span><span><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span></div>{{/if}}
            </div>
          </div>
          {{#if skills}}<section class="skills"><h2>Skills</h2>{{#each skills}}<div class="skill-category"><div class="skill-category-title">{{category}}</div><div class="skill-bars">{{#each items}}<div class="skill-item"><span class="skill-name">{{name}}</span><div class="skill-bar"><div class="skill-progress" data-level="{{level}}"></div></div></div>{{/each}}</div></div>{{/each}}</section>{{/if}}
          {{#if languages}}<section class="languages"><h2>Languages</h2>{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</section>{{/if}}
          {{#if certifications}}<section class="certifications"><h2>Certifications</h2>{{#each certifications}}<div class="cert-item"><div class="cert-title">{{name}}</div><div class="cert-meta"><span class="issuer">{{issuer}}</span>{{#if date}}<span class="date">{{formatDate date}}</span>{{/if}}</div>{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
        </div>
        <div class="main-content">
          {{#if summary}}<section class="about"><h2>About Me</h2><div class="about-text">{{{summary}}}</div></section>{{/if}}
          {{#if workExperience}}<section class="experience"><h2>Experience</h2><div class="timeline">{{#each workExperience}}<div class="timeline-item"><div class="timeline-marker"></div><div class="timeline-content"><h3>{{jobTitle}}</h3><div class="job-meta"><span class="company">{{company}}</span>{{#if location}}<span class="location">{{location}}</span>{{/if}}</div><div class="dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</div>{{#if description}}<div class="description">{{{description}}}</div>{{/if}}{{#if achievements}}<ul class="achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div></div>{{/each}}</div></section>{{/if}}
                          {{#if education}}<section class="education"><h2>Education</h2>{{#each education}}<div class="edu-item"><h3>{{degree}}</h3><div class="edu-meta"><span class="institution">{{institution}}</span>{{#if location}}<span class="location">{{location}}</span>{{/if}}</div><div class="edu-dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{formatDate endDate}}{{/if}}</div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
                          {{#if projects}}<section class="projects"><h2>Projects</h2>{{#each projects}}<div class="project-item"><h3>{{name}}</h3>{{#if description}}<div>{{{description}}}</div>{{/if}}{{#if technologies}}<div class="technologies">{{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}{{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
                          {{#if achievements}}<section class="achievements-section"><h2>Achievements</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}{{#if description}}<div>{{{description}}}</div>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
          {{#if customFields}}<section class="custom-fields">{{#each customFields}}<div class="custom-field"><h3>{{title}}</h3><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
        </div>
      </div>`,
      css: `.resume.creative-designer { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; background: white; color: #1f2937; display: grid; grid-template-columns: 280px 1fr; font-size: 12px; line-height: 1; }
      .sidebar { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 24px 20px; }
      .profile-section { margin-bottom: 6px; }
      .name { font-size: 16px; font-weight: 700; margin-bottom: 8px; line-height: 1; }
      .contact-info { margin-bottom: 6px; }
      .contact-item { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; font-size: 12px; }
      .icon { font-size: 12px; width: 16px; text-align: center; }
      .sidebar h2 { font-size: 16px; font-weight: 600; margin: 0 0 6px 0; position: relative; padding-bottom: 8px; }
      .sidebar h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 25px; height: 2px; background: rgba(255,255,255,0.7); }
      .skill-category { margin-bottom: 2px; }
      .skill-category-title { font-size: 12px; font-weight: 600; margin-bottom: 2px; color: rgba(255,255,255,0.9); }
      .skill-item { margin-bottom: 2px; }
      .skill-name { font-size: 12px; display: block; margin-bottom: 2px; }
      .skill-bar { height: 3px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden; }
      .skill-progress { height: 100%; background: rgba(255,255,255,0.8); border-radius: 2px; width: 75%; }
      .skill-progress[data-level="expert"] { width: 95%; }
      .skill-progress[data-level="advanced"] { width: 80%; }
      .skill-progress[data-level="intermediate"] { width: 65%; }
      .skill-progress[data-level="beginner"] { width: 40%; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .language-name { font-size: 12px; color: rgba(255,255,255,0.9); }
      .language-level { font-size: 12px; color: rgba(255,255,255,0.7); text-transform: capitalize; }
      .cert-item { margin-bottom: 2px; }
      .cert-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 2px; }
      .cert-meta { display: flex; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 2px; }
      .cert-expiry, .cert-id { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 1px; }
      .cert-link a { color: rgba(255,255,255,0.9); text-decoration: none; font-size: 12px; }
      .main-content { padding: 24px; }
      .main-content h2 { font-size: 16px; font-weight: 600; color: #ec4899; margin: 0 0 6px 0; position: relative; padding-bottom: 8px; }
      .main-content h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 30px; height: 2px; background: linear-gradient(90deg, #ec4899, #8b5cf6); }
      .about { margin-bottom: 6px; }
      .about-text { font-size: 12px; line-height: 1; color: #4b5563; text-align: justify; }
      .timeline { position: relative; padding-left: 16px; }
      .timeline::before { content: ''; position: absolute; left: 6px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, #ec4899, #8b5cf6); }
      .timeline-item { position: relative; margin-bottom: 2px; }
      .timeline-marker { position: absolute; left: -10px; top: 4px; width: 6px; height: 6px; background: #ec4899; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #ec4899; }
      .timeline-content h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .job-meta, .edu-meta { display: flex; gap: 8px; font-size: 12px; color: #6b7280; margin-bottom: 2px; }
      .dates, .edu-dates { font-size: 12px; color: #9ca3af; font-style: italic; margin-bottom: 2px; }
      .description, .edu-description { font-size: 12px; color: #4b5563; line-height: 1; }
      .achievements { margin: 2px 0; }
      .achievements li { margin-bottom: 2px; color: #4b5563; font-size: 12px; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 2px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; font-size: 12px; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      .gpa { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
      .edu-item { margin-bottom: 2px; }
      .edu-item h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .project-item { margin-bottom: 2px; }
      .project-item h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .project-item p { font-size: 12px; color: #4b5563; line-height: 1; margin-bottom: 2px; }
      .technologies { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 2px; }
      .tech-tag { background: #8b5cf6; color: white; padding: 2px 5px; border-radius: 2px; font-size: 12px; }
      .project-links { margin-bottom: 2px; }
      .project-links a { color: #ec4899; text-decoration: none; font-size: 12px; margin-right: 12px; }
      .project-dates { font-size: 12px; color: #9ca3af; font-style: italic; }
      .achievement-item { margin-bottom: 2px; }
      .achievement-item .achievement-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .achievement-item p { font-size: 12px; color: #4b5563; line-height: 1; margin-bottom: 2px; }
      .achievement-date { font-size: 12px; color: #9ca3af; font-style: italic; margin-bottom: 2px; }
      .achievement-issuer { font-size: 12px; color: #6b7280; }
      .custom-field { margin-bottom: 2px; }
      .custom-field h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .custom-content { font-size: 12px; color: #4b5563; line-height: 1; }`
    },
    creator: null,
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
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume classic-traditional" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
          <div class="contact-info">
            <span itemprop="email">{{personalInfo.email}}</span>
            {{#if personalInfo.phone}} | <span itemprop="telephone">{{personalInfo.phone}}</span>{{/if}}
            {{#if personalInfo.address}} | <span itemprop="address">{{personalInfo.address}}</span>{{/if}}
            {{#if personalInfo.website}} | <a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a>{{/if}}
            {{#if personalInfo.linkedin}} | <a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a>{{/if}}
            {{#if personalInfo.github}} | <a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a>{{/if}}
          </div>
        </header>
        
        {{#if summary}}
        <section class="objective">
          <h2>PROFESSIONAL OBJECTIVE</h2>
          <div itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills">
          <h2>CORE COMPETENCIES</h2>
          {{#each skills}}
          <div class="skill-category">
            <div class="skill-category-title">{{category}}:</div>
            <div class="skill-items">{{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="experience">
          <h2>PROFESSIONAL EXPERIENCE</h2>
          {{#each workExperience}}
          <div class="job-entry" itemscope itemtype="http://schema.org/JobPosting">
            <div class="job-header">
              <h3 itemprop="title">{{jobTitle}}</h3>
              <span class="dates">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </span>
            </div>
            <div class="company-info">
              <em itemprop="hiringOrganization">{{company}}</em>{{#if location}}, <span itemprop="jobLocation">{{location}}</span>{{/if}}
            </div>
            {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
            {{#if achievements}}
            <ul class="achievements">
              {{#each achievements}}<li>{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education">
          <h2>EDUCATION</h2>
          {{#each education}}
          <div class="edu-entry" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="edu-header">
              <h3 itemprop="credentialCategory">{{degree}}</h3>
              <span class="dates">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </span>
            </div>
            <div class="institution-info">
              <em itemprop="recognizedBy">{{institution}}</em>{{#if location}}, {{location}}{{/if}}
            </div>
            {{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}
            {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="projects">
          <h2>KEY PROJECTS</h2>
          {{#each projects}}
          <div class="project-entry">
            <div class="project-header">
              <h3>{{name}}</h3>
              {{#if startDate}}<span class="dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}
            </div>
            {{#if description}}<div class="project-description">{{{description}}}</div>{{/if}}
            {{#if technologies}}<div class="technologies"><div class="tech-label">Technologies:</div> {{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/if}}
            {{#if url}}<div class="project-url"><div class="url-label">URL:</div> <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
            {{#if githubUrl}}<div class="github-url"><div class="github-label">GitHub:</div> <a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if achievements}}
        <section class="achievements-section">
          <h2>ACHIEVEMENTS & AWARDS</h2>
          {{#each achievements}}
          <div class="achievement-entry">
            {{#if title}}<div class="achievement-header"><h3>{{title}}</h3>{{#if date}}<span class="dates">{{formatDate date}}</span>{{/if}}</div>{{/if}}
            {{#if description}}<div class="achievement-description">{{{description}}}</div>{{/if}}
            {{#if issuer}}<div class="issuer-info"><em>{{issuer}}</em></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications">
          <h2>PROFESSIONAL CERTIFICATIONS</h2>
          {{#each certifications}}
          <div class="cert-entry">
            <div class="cert-header">
              <h3>{{name}}</h3>
              {{#if date}}<span class="dates">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if issuer}}<div class="cert-issuer"><em>{{issuer}}</em></div>{{/if}}
            {{#if expiryDate}}<div class="cert-expiry"><div class="expiry-label">Expires:</div> {{formatDate expiryDate}}</div>{{/if}}
            {{#if credentialId}}<div class="cert-id"><div class="id-label">ID:</div> {{credentialId}}</div>{{/if}}
            {{#if url}}<div class="cert-url"><div class="url-label">URL:</div> <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages">
          <h2>LANGUAGES</h2>
          {{#each languages}}<div class="language-entry"><div class="language-name">{{name}}:</div> {{proficiency}}</div>{{/each}}
        </section>
        {{/if}}
        
        {{#if customFields}}
        <section class="custom-fields">
          {{#each customFields}}
          <div class="custom-field-entry">
            <h2>{{title}}</h2>
            <div class="custom-field-content">{{content}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      css: `.resume.classic-traditional { font-family: 'Times New Roman', 'Georgia', serif; max-width: 8.5in; margin: 0 auto; background: white; color: black; font-size: 12px; line-height: 1; }
      @media print { .resume.classic-traditional { max-width: none; margin: 0; padding: 0.5in; } }
      @media (max-width: 768px) { .resume.classic-traditional { padding: 0.5in; font-size: 11px; } }
      
      .header { text-align: center; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 1px solid black; }
      .name { font-size: 16px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
      .contact-info { font-size: 12px; line-height: 1; }
      .contact-info a { color: black; text-decoration: none; }
      .contact-info a:hover { text-decoration: underline; }
      
      section { margin-bottom: 6px; }
      h2 { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 1px solid black; letter-spacing: 0.5px; }
      .objective p { text-align: justify; margin-bottom: 0; }
      
      .job-entry, .edu-entry, .project-entry, .achievement-entry, .cert-entry { margin-bottom: 2px; }
      .job-header, .edu-header, .project-header, .achievement-header, .cert-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
      .job-header h3, .edu-header h3, .project-header h3, .achievement-header h3, .cert-header h3 { font-size: 16px; font-weight: bold; margin: 0; }
      .dates { font-size: 12px; font-style: italic; }
      
      .company-info, .institution-info, .cert-issuer, .issuer-info { font-size: 12px; margin-bottom: 2px; }
      .job-description, .edu-description, .project-description, .achievement-description { margin: 2px 0; text-align: justify; }
      
      .achievements { margin: 2px 0; }
      .achievements li { margin-bottom: 2px; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 2px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 2px; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      .gpa { font-size: 12px; margin-bottom: 2px; }
      
      .skill-category { margin-bottom: 2px; }
      .skill-category-title { font-size: 12px; font-weight: bold; margin-bottom: 2px; }
      .skill-items { font-size: 12px; }
      
      .technologies, .project-url, .github-url, .cert-expiry, .cert-id, .cert-url { font-size: 12px; margin-bottom: 2px; }
      .tech-label, .url-label, .github-label, .expiry-label, .id-label { font-size: 12px; font-weight: bold; display: inline; }
      .project-url a, .github-url a, .cert-url a { color: black; text-decoration: none; }
      .project-url a:hover, .github-url a:hover, .cert-url a:hover { text-decoration: underline; }
      
      .language-entry { margin-bottom: 2px; font-size: 12px; display: flex; gap: 8px; }
      .language-name { font-size: 12px; font-weight: bold; }
      
      .custom-field-entry { margin-bottom: 2px; }
      .custom-field-entry h2 { font-size: 16px; margin-bottom: 2px; }
      .custom-field-content { font-size: 12px; line-height: 1; text-align: justify; }`
    },
    creator: null,
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
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
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
          {{#if personalInfo.linkedin}}<div class="linkedin">LinkedIn: <a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
        </header>
        {{#if summary}}<section class="summary-section"><h2>PROFESSIONAL SUMMARY</h2><div>{{{summary}}}</div></section>{{/if}}
        {{#if workExperience}}<section class="experience-section"><h2>PROFESSIONAL EXPERIENCE</h2>{{#each workExperience}}<div class="job-entry"><div class="job-title-line"><h3>{{jobTitle}}</h3><span class="job-dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class="company-line">{{company}}{{#if location}}, {{location}}{{/if}}</div>{{#if description}}<div class="job-description">{{{description}}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
        {{#if education}}<section class="education-section"><h2>EDUCATION</h2>{{#each education}}<div class="education-entry"><div class="education-line"><h3>{{degree}}</h3><span class="education-dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div><div class="school-line">{{institution}}{{#if location}}, {{location}}{{/if}}</div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<div class="education-description">{{{description}}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
        {{#if projects}}<section class="projects-section"><h2>KEY PROJECTS</h2>{{#each projects}}<div class="project-entry"><div class="project-line"><h3>{{name}}</h3>{{#if startDate}}<span class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}</div>{{#if description}}<div class="project-description">{{{description}}}</div>{{/if}}{{#if technologies}}<div class="project-technologies">Technologies: {{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
        {{#if skills}}<section class="skills-section"><h2>CORE COMPETENCIES</h2><div class="skills-grid">{{#each skills}}<div class="skill-category"><div class="skill-category-title">{{category}}</div><div class="skill-items">{{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div></div>{{/each}}</div>{{/if}}
        {{#if certifications}}<section class="certifications-section"><h2>CERTIFICATIONS</h2>{{#each certifications}}<div class="cert-entry"><div class="cert-line"><h3>{{name}}</h3>{{#if date}}<span class="cert-date">{{formatDate date}}</span>{{/if}}</div>{{#if issuer}}<div class="cert-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
      </div>`,
      css: `.resume.classic-professional { font-family: 'Georgia', serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: black; line-height: 1; }
      .classic-header { text-align: center; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 2px solid #1f2937; }
      .name { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
      .contact-details { font-size: 12px; color: #4b5563; margin-bottom: 2px; }
      .linkedin { font-size: 12px; color: #6b7280; }
      section { margin-bottom: 6px; }
      section h2 { font-size: 16px; font-weight: bold; color: #1f2937; text-transform: uppercase; margin-bottom: 6px; border-bottom: 1px solid #1f2937; padding-bottom: 8px; letter-spacing: 0.5px; }
      .summary-section p { font-size: 12px; line-height: 1; color: #1f2937; text-align: justify; }
      .job-entry { margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px dotted #6b7280; }
      .job-title-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
      .job-title-line h3 { font-size: 16px; color: #1f2937; font-weight: bold; margin: 0; }
      .job-dates { font-size: 12px; color: #6b7280; font-style: italic; }
      .company-line { font-size: 12px; color: #4b5563; margin-bottom: 2px; font-weight: 500; }
      .job-description { font-size: 12px; color: #1f2937; margin: 2px 0; line-height: 1; }
      .education-entry { margin-bottom: 2px; }
      .education-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
      .education-line h3 { font-size: 16px; color: #1f2937; font-weight: bold; margin: 0; }
      .education-dates { font-size: 12px; color: #6b7280; font-style: italic; }
      .school-line { font-size: 12px; color: #4b5563; margin-bottom: 2px; font-weight: 500; }
      .gpa { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
      .education-description { font-size: 12px; color: #1f2937; line-height: 1; }
      .project-entry { margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px dotted #6b7280; }
      .project-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
      .project-line h3 { font-size: 16px; color: #1f2937; font-weight: bold; margin: 0; }
      .project-dates { font-size: 12px; color: #6b7280; font-style: italic; }
      .project-description { font-size: 12px; color: #1f2937; margin: 2px 0; line-height: 1; }
      .project-technologies { font-size: 12px; color: #4b5563; margin-bottom: 2px; font-weight: 500; }
      .project-links { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
      .project-links a { color: #1f2937; text-decoration: none; }
      .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .skill-category-title { font-size: 12px; font-weight: bold; color: #1f2937; margin-bottom: 2px; }
      .skill-items { font-size: 12px; color: #4b5563; line-height: 1; }
      .cert-entry { margin-bottom: 2px; }
      .cert-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
      .cert-line h3 { font-size: 16px; color: #1f2937; font-weight: bold; margin: 0; }
      .cert-date { font-size: 12px; color: #6b7280; font-style: italic; }
      .cert-issuer { font-size: 12px; color: #4b5563; font-style: italic;
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; font-size: 10px; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; } }
      ul { list-style-type: disc; } ol { list-style-type: decimal; }`
    },
    creator: null,
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
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume minimalist-clean" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
          <div class="contact-info">
            <span class="contact-item" itemprop="email">{{personalInfo.email}}</span>
            {{#if personalInfo.phone}}<span class="contact-item" itemprop="telephone">{{personalInfo.phone}}</span>{{/if}}
            {{#if personalInfo.address}}<span class="contact-item" itemprop="address">{{personalInfo.address}}</span>{{/if}}
            {{#if personalInfo.website}}<span class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span>{{/if}}
            {{#if personalInfo.linkedin}}<span class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
            {{#if personalInfo.github}}<span class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
          </div>
        </header>
        
        {{#if summary}}
        <section class="summary">
          <h2>Professional Summary</h2>
          <div class="summary-text" itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills">
          <h2>Core Competencies</h2>
          <div class="skills-grid">
            {{#each skills}}
            <div class="skill-category">
              <div class="skill-category-title">{{category}}</div>
              <div class="skill-items">
                {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
              </div>
            </div>
            {{/each}}
          </div>
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="experience">
          <h2>Professional Experience</h2>
          {{#each workExperience}}
          <div class="experience-item" itemscope itemtype="http://schema.org/JobPosting">
            <div class="item-header">
              <div class="item-title">
                <h3 itemprop="title">{{jobTitle}}</h3>
                <span class="company" itemprop="hiringOrganization">{{company}}</span>
                {{#if location}}<span class="location" itemprop="jobLocation"> • {{location}}</span>{{/if}}
              </div>
              <span class="dates">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </span>
            </div>
            {{#if description}}<div class="item-description" itemprop="description">{{{description}}}</div>{{/if}}
            {{#if achievements}}
            <ul class="achievements">
              {{#each achievements}}<li>{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="projects">
          <h2>Key Projects</h2>
          {{#each projects}}
          <div class="project-item">
            <div class="item-header">
              <div class="item-title">
                <h3>{{name}}</h3>
                {{#if startDate}}<span class="dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}
              </div>
            </div>
            {{#if description}}<div class="item-description">{{{description}}}</div>{{/if}}
            {{#if technologies}}
            <div class="technologies">
              <div class="tech-label">Technologies:</div> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
            </div>
            {{/if}}
            {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
            {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education">
          <h2>Education</h2>
          {{#each education}}
          <div class="education-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="item-header">
              <div class="item-title">
                <h3 itemprop="credentialCategory">{{degree}}</h3>
                <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                {{#if location}}<span class="location"> • {{location}}</span>{{/if}}
              </div>
              <span class="dates">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </span>
            </div>
            {{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}
            {{#if description}}<div class="item-description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if achievements}}
        <section class="achievements-section">
          <h2>Achievements & Awards</h2>
          {{#each achievements}}
          <div class="achievement-item">
            {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
            {{#if description}}<div class="item-description">{{{description}}}</div>{{/if}}
            {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
            {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications">
          <h2>Professional Certifications</h2>
          {{#each certifications}}
          <div class="cert-item">
            <div class="item-header">
              <div class="item-title">
                <h3>{{name}}</h3>
                <span class="cert-issuer">{{issuer}}</span>
              </div>
              {{#if date}}<span class="dates">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
            {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
            {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages">
          <h2>Languages</h2>
          <div class="languages-grid">
            {{#each languages}}
            <div class="language-item">
              <span class="language-name">{{name}}</span>
              <span class="language-level">{{proficiency}}</span>
            </div>
            {{/each}}
          </div>
        </section>
        {{/if}}
        
        {{#if customFields}}
        <section class="custom-fields">
          <h2>Additional Information</h2>
          {{#each customFields}}
          <div class="custom-field">
            <h3>{{title}}</h3>
            <div class="custom-content">{{content}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      css: `.resume.minimalist-clean { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #374151; font-size: 12px; line-height: 1; }
      .header { margin-bottom: 6px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
      .name { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 6px; letter-spacing: -0.5px; }
      .contact-info { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #6b7280; }
      .contact-item { display: flex; align-items: center; }
      .contact-item a { color: #6b7280; text-decoration: none; }
      .summary { margin-bottom: 6px; }
      .summary-text { font-size: 12px; color: #4b5563; line-height: 1; text-align: justify; }
      section { margin-bottom: 6px; }
      h2 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
      .experience-item, .education-item, .project-item, .achievement-item, .cert-item { margin-bottom: 2px; padding-bottom: 2px; }
      .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
      .item-title h3, .achievement-item .achievement-title, .custom-field h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .company, .institution, .location, .cert-issuer { font-size: 12px; color: #6b7280; }
      .dates { font-size: 12px; color: #9ca3af; font-weight: 500; }
      .item-description, .custom-content { margin: 2px 0; color: #4b5563; line-height: 1; }
      .achievements { margin: 2px 0; }
      .achievements li { margin-bottom: 2px; color: #4b5563; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 2px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      .gpa { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
      .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px; }
      .skill-category-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .skill-items { display: flex; flex-wrap: wrap; gap: 3px; }
      .skill-item { background: #f3f4f6; color: #374151; padding: 2px 4px; border-radius: 2px; font-size: 12px; font-weight: 500; }
      .skill-item[data-level="expert"] { background: #059669; color: white; }
      .skill-item[data-level="advanced"] { background: #0ea5e9; color: white; }
      .skill-item[data-level="intermediate"] { background: #6b7280; color: white; }
      .skill-item[data-level="beginner"] { background: #d1d5db; color: #374151; }
      .technologies { display: flex; flex-wrap: wrap; gap: 3px; margin: 2px 0; }
      .tech-label { font-size: 12px; font-weight: bold; display: inline; }
      .tech-tag { background: #1f2937; color: white; padding: 1px 3px; border-radius: 2px; font-size: 12px; }
      .project-links, .cert-link { margin: 2px 0; }
      .project-links a, .cert-link a { color: #1f2937; text-decoration: none; font-size: 12px; margin-right: 8px; }
      .achievement-date { font-size: 12px; color: #9ca3af; margin: 2px 0; font-style: italic; }
      .achievement-issuer { font-size: 12px; color: #6b7280; }
      .cert-expiry, .cert-id { font-size: 12px; color: #6b7280; margin: 1px 0; }
      .languages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .language-name { font-size: 12px; color: #1f2937; }
      .language-level { font-size: 12px; color: #6b7280; text-transform: capitalize; }
      .custom-field { margin-bottom: 2px; }`
    },
    creator: null,
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
        background: '#ffffff',
        header: '#1e40af',
        sidebar: '#f8fafc'
      },
      fonts: {
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      spacing: {
        section: 12,
        element: 8,
        header: 6
      },
      layout: {
        type: 'two-column',
        sidebarWidth: '1fr',
        mainWidth: '2fr'
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume professional-corporate" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <div class="header-content">
            <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
            <div class="contact-info">
              <div class="contact-row">
                <span class="contact-item" itemprop="email">{{personalInfo.email}}</span>
                {{#if personalInfo.phone}}<span class="contact-item" itemprop="telephone">{{personalInfo.phone}}</span>{{/if}}
              </div>
              <div class="contact-row">
                {{#if personalInfo.address}}<span class="contact-item" itemprop="address">{{personalInfo.address}}</span>{{/if}}
                {{#if personalInfo.website}}<span class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span>{{/if}}
              </div>
              <div class="contact-row">
                {{#if personalInfo.linkedin}}<span class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
                {{#if personalInfo.github}}<span class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
              </div>
            </div>
          </div>
        </header>
        
        <div class="content-grid">
          <div class="main-content">
            {{#if summary}}
            <section class="summary">
              <h2>Professional Summary</h2>
              <div class="summary-text" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
              <h2>Core Competencies</h2>
              {{#each skills}}
              <div class="skill-category">
                <div class="skill-category-title">{{category}}</div>
                <div class="skill-items">
                  {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
                </div>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="experience">
              <h2>Professional Experience</h2>
              {{#each workExperience}}
              <div class="job-entry" itemscope itemtype="http://schema.org/JobPosting">
                <div class="job-header">
                  <div class="job-title-company">
                    <h3 itemprop="title">{{jobTitle}}</h3>
                    <div class="company-location">
                      <span class="company" itemprop="hiringOrganization">{{company}}</span>
                      {{#if location}}<span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}
                    </div>
                  </div>
                  <div class="job-dates">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                    {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
                {{#if achievements}}
                <ul class="achievements">
                  {{#each achievements}}<li>{{this}}</li>{{/each}}
                </ul>
                {{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="projects">
              <h2>Key Projects</h2>
              {{#each projects}}
              <div class="project-entry">
                <div class="project-header">
                  <h3>{{name}}</h3>
                  {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                </div>
                {{#if description}}<div class="project-description">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="technologies">
                  <div class="tech-label">Technologies:</div> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
                </div>
                {{/if}}
                {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
                {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if customFields}}
            <section class="custom-fields">
              <h2>Additional Information</h2>
              {{#each customFields}}
              <div class="custom-field">
                <h3>{{title}}</h3>
                <div class="custom-content">{{content}}</div>
              </div>
              {{/each}}
            </section>
            {{/if}}
          </div>
          
          <div class="sidebar">
            {{#if education}}
            <section class="education">
              <h2>Education</h2>
              {{#each education}}
              <div class="edu-entry" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="edu-title-institution">
                  <h3 itemprop="credentialCategory">{{degree}}</h3>
                  <div class="institution-location">
                    <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                    {{#if location}}<span class="location">{{location}}</span>{{/if}}
                  </div>
                  <div class="edu-dates">
                    <time>{{formatDate startDate}}</time> - 
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
                {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if achievements}}
            <section class="achievements-section">
              <h2>Achievements & Awards</h2>
              {{#each achievements}}
              <div class="achievement-entry">
                {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
                {{#if description}}<div>{{{description}}}</div>{{/if}}
                {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
                {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if certifications}}
            <section class="certifications">
              <h2>Professional Certifications</h2>
              {{#each certifications}}
              <div class="cert-item">
                <h3>{{name}}</h3>
                <div class="cert-details">
                  <span class="issuer">{{issuer}}</span>
                  {{#if date}}<span class="date">{{formatDate date}}</span>{{/if}}
                </div>
                {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
                {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
                {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if languages}}
            <section class="languages">
              <h2>Languages</h2>
              {{#each languages}}
              <div class="language-item">
                <span class="language-name">{{name}}</span>
                <span class="language-level">{{proficiency}}</span>
              </div>
              {{/each}}
            </section>
            {{/if}}
          </div>
        </div>
      </article>`,
      css: `.resume.professional-corporate { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; background: white; color: #1f2937; font-size: 12px; line-height: 1; }
      @media print { .resume.professional-corporate { max-width: none; margin: 0; padding: 0; } }
      @media (max-width: 768px) { .resume.professional-corporate .content-grid { grid-template-columns: 1fr; gap: 12px; } }
      
      .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 16px 20px 10px; margin-bottom: 6px; border-radius: 0 0 6px 6px; box-shadow: 0 2px 6px rgba(30, 64, 175, 0.2); }
      @media print { .header { background: #1e40af !important; border-radius: 0; box-shadow: none; } }
      .header-content { max-width: 100%; }
      .name { font-size: 16px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.5px; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      .contact-info { display: flex; flex-direction: column; gap: 2px; }
      .contact-row { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; }
      .contact-item { font-size: 12px; opacity: 0.95; }
      .contact-item a { color: white; text-decoration: none; }
      .contact-item a:hover { text-decoration: underline; }
      
      .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 6px; padding: 0 20px 6px; }
      section { margin-bottom: 6px; }
      h2 { font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; position: relative; }
      h2::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 18px; height: 2px; background: #1e40af; }
      .summary-text { font-size: 12px; line-height: 1; color: #4b5563; text-align: justify; }
      
      .job-entry, .edu-entry, .project-entry, .achievement-entry { margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px solid #f3f4f6; }
      .job-header, .edu-header, .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
      .job-title-company h3, .edu-title-institution h3, .project-header h3, .achievement-entry .achievement-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .company-location, .institution-location { display: flex; gap: 4px; font-size: 12px; color: #6b7280; }
      .dates { font-size: 12px; color: #9ca3af; font-weight: 500; text-align: right; }
      .description { margin-bottom: 0.25rem; color: #4b5563; line-height: 1; }
      .achievements { margin: 2px 0; }
      .achievements li { margin-bottom: 1px; color: #4b5563; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 2px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 1px; color: #4b5563; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      .gpa { font-size: 12px; color: #6b7280; margin: 2px 0; }
      
      .technologies { display: flex; flex-wrap: wrap; gap: 2px; margin: 2px 0; }
      .tech-label { font-size: 12px; font-weight: bold; display: inline; }
      .tech-tag { background: #1e40af; color: white; padding: 1px 4px; border-radius: 2px; font-size: 12px; }
      
      .project-links { margin: 2px 0; }
      .project-links a { color: #1e40af; text-decoration: none; font-size: 12px; margin-right: 8px; }
      .project-links a:hover { text-decoration: underline; }
      .achievement-date { font-size: 12px; color: #9ca3af; margin: 2px 0; font-style: italic; }
      .achievement-issuer { font-size: 12px; color: #6b7280; }
      
      .custom-field { margin-bottom: 2px; }
      .custom-field h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .custom-content { font-size: 12px; color: #4b5563; line-height: 1; }
      
      .sidebar { background: #f8fafc; padding: 10px; border-radius: 4px; height: fit-content; border: 1px solid #e5e7eb; }
      @media print { .sidebar { background: white; border: 1px solid #e5e7eb; } }
      .sidebar h2 { font-size: 16px; color: #1f2937; border-bottom: 1px solid #e5e7eb; margin-bottom: 6px; }
      .sidebar h2::after { background: #1f2937; }
      .sidebar section { margin-bottom: 6px; }
      
      .skill-category { margin-bottom: 2px; }
      .skill-category-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .skill-items { display: flex; flex-wrap: wrap; gap: 2px; margin-top: 2px; }
      .skill-item { background: #1e40af; color: white; padding: 1px 4px; border-radius: 2px; font-size: 12px; }
      .skill-item[data-level="expert"] { background: #059669; }
      .skill-item[data-level="advanced"] { background: #0ea5e9; }
      .skill-item[data-level="intermediate"] { background: #1e40af; }
      .skill-item[data-level="beginner"] { background: #6b7280; }
      
      .cert-item { margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px solid #f3f4f6; }
      .cert-item h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .cert-details { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
      .cert-expiry, .cert-id { font-size: 12px; color: #6b7280; margin: 1px 0; }
      .cert-link a { color: #1e40af; text-decoration: none; font-size: 12px; }
      .cert-link a:hover { text-decoration: underline; }
      
      .language-item { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .language-name { font-size: 12px; color: #1f2937; }
      .language-level { font-size: 12px; color: #6b7280; text-transform: capitalize; }`
    },
    creator: null,
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
        sizes: { heading: 24, subheading: 20, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 24,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<div class="resume professional-executive">
        <header class="executive-header">
          <h1 class="name">{{personalInfo.fullName}}</h1>
          <div class="contact-bar">
            {{#if personalInfo.email}}<span class="contact-item">{{personalInfo.email}}</span>{{/if}}
            {{#if personalInfo.phone}}<span class="contact-item">{{personalInfo.phone}}</span>{{/if}}
            {{#if personalInfo.address}}<span class="contact-item">{{personalInfo.address}}</span>{{/if}}
            {{#if personalInfo.website}}<span class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span>{{/if}}
            {{#if personalInfo.linkedin}}<span class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
            {{#if personalInfo.github}}<span class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
          </div>
        </header>
        {{#if summary}}<section class="executive-summary"><h2>EXECUTIVE SUMMARY</h2><div>{{{summary}}}</div></section>{{/if}}
        {{#if workExperience}}<section class="leadership-experience"><h2>LEADERSHIP EXPERIENCE</h2>{{#each workExperience}}<div class="executive-role"><div class="role-header"><h3 class="role-title">{{jobTitle}}</h3><div class="role-company">{{company}}</div><div class="role-duration">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</div></div>{{#if location}}<div class="role-location">{{location}}</div>{{/if}}{{#if description}}<div class="description">{{{description}}}</div>{{/if}}{{#if achievements}}<ul class="role-achievements">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
        {{#if projects}}<section class="executive-projects"><h2>KEY INITIATIVES & PROJECTS</h2>{{#each projects}}<div class="project-item"><h3>{{name}}</h3>{{#if description}}<div class="description">{{{description}}}</div>{{/if}}{{#if technologies}}<div class="project-technologies"><div class="tech-label">Technologies/Methods:</div> {{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/if}}{{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}{{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">Repository</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
        {{#if achievements}}<section class="achievements-section"><h2>ACHIEVEMENTS & AWARDS</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}{{#if description}}<div>{{{description}}}</div>{{/if}}{{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
        <div class="executive-bottom">
          {{#if education}}<section class="education-section"><h2>EDUCATION</h2>{{#each education}}<div class="education-item"><h3 class="degree">{{degree}}</h3><div class="institution">{{institution}}</div><div class="education-year">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</div>{{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}{{#if description}}<div class="education-description">{{{description}}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
          {{#if skills}}<section class="executive-skills"><h2>CORE COMPETENCIES</h2><div class="competencies-grid">{{#each skills}}<div class="competency-area"><div class="competency-title">{{category}}</div><div class="competency-items">{{#each items}}{{name}}{{#unless @last}} • {{/unless}}{{/each}}</div></div>{{/each}}</div></section>{{/if}}
          {{#if certifications}}<section class="certifications-section"><h2>PROFESSIONAL CERTIFICATIONS</h2><div class="certifications-grid">{{#each certifications}}<div class="certification-item"><h3 class="cert-name">{{name}}</h3><div class="cert-issuer">{{issuer}}</div>{{#if date}}<div class="cert-date">{{formatDate date}}</div>{{/if}}{{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</div>{{/if}}
        </div>
        {{#if languages}}<section class="languages-section"><h2>LANGUAGES</h2><div class="languages-grid">{{#each languages}}<div class="language-item"><span class="language-name">{{name}}</span><span class="language-level">{{proficiency}}</span></div>{{/each}}</div>{{/if}}
        {{#if customFields}}<section class="custom-fields-section">{{#each customFields}}<div class="custom-field"><h2>{{title}}</h2><div class="custom-content">{{content}}</div></div>{{/each}}</section>{{/if}}
      </div>`,
      css: `.resume.professional-executive { font-family: 'Calibri', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; line-height: 1; }
      .executive-header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 1.5rem; margin: 0 0 6px 0; text-align: center; }
      .name { font-size: 16px; font-weight: 700; margin-bottom: 6px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); letter-spacing: 0.5px; }
      .contact-bar { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
      .contact-item { font-size: 12px; padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.2); border-radius: 16px; backdrop-filter: blur(10px); }
      .contact-item a { color: white; text-decoration: none; }
      section { margin-bottom: 6px; }
      section h2 { font-size: 16px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 2px solid #1e3a8a; letter-spacing: 0.5px; }
      .executive-summary { background: #f8fafc; padding: 1.25rem; border-radius: 6px; border-left: 3px solid #1e3a8a; }
      .executive-summary p { font-size: 12px; line-height: 1; color: #374151; margin: 0; }
      .executive-role { margin-bottom: 2px; padding: 1.25rem; background: #f9fafb; border-radius: 6px; border-top: 2px solid #dc2626; }
      .role-header { display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.75rem; margin-bottom: 2px; }
      .role-title { font-size: 16px; font-weight: 600; color: #1f2937; }
      .role-company { font-size: 12px; color: #1e3a8a; font-weight: 500; }
      .role-duration { font-size: 12px; color: #64748b; text-align: right; font-style: italic; }
      .role-location { font-size: 12px; color: #64748b; margin-bottom: 2px; }
      .role-description { font-size: 12px; line-height: 1; color: #374151; margin-bottom: 2px; }
      .executive-bottom { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 6px; }
      .education-item { margin-bottom: 2px; }
      .degree { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .institution { font-size: 12px; color: #1e3a8a; font-weight: 500; margin-bottom: 2px; }
      .education-year { font-size: 12px; color: #64748b; font-style: italic; }
      .gpa { font-size: 12px; color: #64748b; margin-top: 2px; }
      .competencies-grid { display: flex; flex-direction: column; gap: 2px; }
      .competency-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .competency-items { font-size: 12px; color: #374151; line-height: 1; }
      .certifications-grid { display: flex; flex-direction: column; gap: 2px; }
      .certification-item { padding: 0.6rem; background: #f1f5f9; border-radius: 4px; border-left: 2px solid #1e3a8a; }
      .cert-name { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .cert-issuer { font-size: 12px; color: #1e3a8a; font-weight: 500; }
      .cert-date { font-size: 12px; color: #64748b; margin-top: 2px; }
      .tech-label { font-size: 12px; font-weight: bold; display: inline; }
      .project-links a { color: #64748b; text-decoration: none; font-size: 12px; margin-right: 8px; }
      .cert-link a { color: #64748b; text-decoration: none; font-size: 12px; }
      .achievement-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .achievement-date { font-size: 12px; color: #64748b; margin: 2px 0; font-style: italic; }
      .achievement-issuer { font-size: 12px; color: #64748b; }
      .cert-expiry, .cert-id { font-size: 12px; color: #64748b; margin: 1px 0; }
      .languages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .language-name { font-size: 12px; color: #1f2937; }
      .language-level { font-size: 12px; color: #64748b; text-transform: capitalize; }
      .custom-field { margin-bottom: 2px; }
      .custom-content { font-size: 12px; color: #374151; line-height: 1; 
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; font-size: 10px; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }}
      ul { list-style-type: disc; } ol { list-style-type: decimal; }`
    },
    creator: null,
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
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume academic-research" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
          <div class="contact-info">
            <div class="contact-grid">
              <div class="contact-item"><span class="label">Email:</span><span class="value" itemprop="email">{{personalInfo.email}}</span></div>
              {{#if personalInfo.phone}}<div class="contact-item"><span class="label">Phone:</span><span class="value" itemprop="telephone">{{personalInfo.phone}}</span></div>{{/if}}
              {{#if personalInfo.address}}<div class="contact-item"><span class="label">Address:</span><span class="value" itemprop="address">{{personalInfo.address}}</span></div>{{/if}}
              {{#if personalInfo.website}}<div class="contact-item"><span class="label">Website:</span><span class="value"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span></div>{{/if}}
              {{#if personalInfo.linkedin}}<div class="contact-item"><span class="label">LinkedIn:</span><span class="value"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span></div>{{/if}}
              {{#if personalInfo.github}}<div class="contact-item"><span class="label">GitHub:</span><span class="value"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span></div>{{/if}}
            </div>
          </div>
        </header>
        
        {{#if summary}}
        <section class="research-interests">
          <h2>Research Interests</h2>
          <div itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills">
          <h2>Technical Skills</h2>
          {{#each skills}}
          <div class="skill-category">
            <h3>{{category}}</h3>
            <div class="skill-items">
              {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}
            </div>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="experience">
          <h2>Academic & Professional Experience</h2>
          {{#each workExperience}}
          <div class="position-entry" itemscope itemtype="http://schema.org/JobPosting">
            <div class="position-header">
              <div class="position-info">
                <h3 itemprop="title">{{jobTitle}}</h3>
                <div class="institution-info" itemprop="hiringOrganization">{{company}}{{#if location}}, <span itemprop="jobLocation">{{location}}</span>{{/if}}</div>
              </div>
              <div class="position-dates">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if description}}<div class="position-description" itemprop="description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="publications">
          <h2>Research Projects & Publications</h2>
          {{#each projects}}
          <div class="publication-entry">
            <h3>{{name}}</h3>
            {{#if description}}<div class="publication-description">{{{description}}}</div>{{/if}}
            {{#if technologies}}
            <div class="methodologies">
              <span class="label">Methodologies/Tools:</span>{{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
            </div>
            {{/if}}
            {{#if url}}<div class="publication-links"><a href="{{url}}" target="_blank">View Publication</a></div>{{/if}}
            {{#if startDate}}<div class="publication-date">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education">
          <h2>Education</h2>
          {{#each education}}
          <div class="edu-entry" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="edu-header">
              <div class="degree-info">
                <h3 itemprop="credentialCategory">{{degree}}</h3>
                <div class="institution-info" itemprop="recognizedBy">{{institution}}{{#if location}}, {{location}}{{/if}}</div>
              </div>
              <div class="edu-dates">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}
            {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications">
          <h2>Professional Certifications</h2>
          {{#each certifications}}
          <div class="cert-entry">
            <div class="cert-header">
              <h3>{{name}}</h3>
              {{#if date}}<span class="cert-date">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if issuer}}<div class="cert-issuer">{{issuer}}</div>{{/if}}
            {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      css: `.resume.academic-research { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; font-size: 12px; line-height: 1.4; }
      .header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #059669; }
      .name { font-family: 'Georgia', serif; font-size: 18px; font-weight: 600; color: #059669; margin-bottom: 10px; letter-spacing: 0.5px; }
      .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px; max-width: 600px; margin: 0 auto; }
      .contact-item { display: flex; justify-content: space-between; font-size: 10px; }
      .contact-item .label { font-weight: 600; color: #6b7280; }
      .contact-item .value { color: #1f2937; }
      .contact-item a { color: #1f2937; text-decoration: none; }
      section { margin-bottom: 15px; }
      h2 { font-family: 'Georgia', serif; font-size: 14px; font-weight: 600; color: #059669; margin-bottom: 10px; padding-bottom: 3px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.5px; }
      .interests-text { font-size: 11px; line-height: 1.4; color: #4b5563; text-align: justify; font-style: italic; }
      .edu-entry, .position-entry, .publication-entry, .cert-entry { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
      .edu-header, .position-header, .cert-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .edu-entry h3, .position-entry h3, .publication-entry h3, .cert-entry h3 { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .institution-info { font-size: 10px; color: #6b7280; font-style: italic; }
      .edu-dates, .position-dates, .cert-date { font-size: 9px; color: #9ca3af; font-weight: 500; }
      .gpa { font-size: 9px; color: #6b7280; margin-bottom: 3px; }
      .edu-description, .position-description, .publication-description { margin: 4px 0; color: #4b5563; line-height: 1.4; text-align: justify; }
      .methodologies { margin: 3px 0; font-size: 9px; }
      .methodologies .label { font-weight: 600; color: #6b7280; }
      .publication-entry { border-left: 3px solid #10b981; padding-left: 8px; }
      .skill-category { margin-bottom: 10px; }
      .skill-category h3 { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
      .skill-items { color: #4b5563; line-height: 1.4; }
      .cert-issuer { color: #6b7280; font-style: italic; 
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; font-size: 10px; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      }
      ul { list-style-type: disc; } ol { list-style-type: decimal; }`
    },
    creator: null,
    tags: ['academic', 'research', 'education', 'scholarly', 'single-column', 'green']
  },


  {
    name: 'Sleek Professional',
    description: 'Corporate-friendly two-column layout with clean lines and ATS-optimized formatting.',
    category: 'professional',
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
        { name: 'skills', position: 3, isRequired: false, isVisible: true },
        { name: 'workExperience', position: 4, isRequired: false, isVisible: true },
        { name: 'projects', position: 5, isRequired: false, isVisible: true },
        { name: 'education', position: 6, isRequired: false, isVisible: true },
        { name: 'certifications', position: 7, isRequired: false, isVisible: true },
        { name: 'achievements', position: 8, isRequired: false, isVisible: true },
        { name: 'languages', position: 9, isRequired: false, isVisible: true },
        { name: 'customFields', position: 10, isRequired: false, isVisible: true }
      ]
    },
    styling: {
      colors: {
        primary: '#0f172a',
        secondary: '#475569',
        accent: '#2563eb',
        text: '#1e293b',
        background: '#ffffff'
      },
      fonts: {
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume sleek-professional" itemscope itemtype="http://schema.org/Person">
        <div class="main-column">
          <header class="header">
            <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
            <div class="contact-info">
              <div class="contact-item" itemprop="email">{{personalInfo.email}}</div>
              {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
              {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
              {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
              {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
              {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
            </div>
          </header>
          
          {{#if summary}}
          <section class="summary">
            <h3>Professional Summary</h3>
            <div itemprop="description">{{{summary}}}</div>
          </section>
          {{/if}}
          
          {{#if skills}}
          <section class="skills">
            <h3>Core Competencies</h3>
            {{#each skills}}
            <div class="skill-category">
              <div class="skill-category-title">{{category}}</div>
              <div class="skill-items">
                {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
              </div>
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if workExperience}}
          <section class="work-experience">
            <h3>Professional Experience</h3>
            {{#each workExperience}}
            <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
              <div class="job-header">
                <div class="job-title" itemprop="title">{{jobTitle}}</div>
                <div class="job-meta">
                  <span class="company" itemprop="hiringOrganization">{{company}}</span>
                  {{#if location}}<span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}
                </div>
                <div class="job-dates">
                  <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                  {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                </div>
              </div>
              {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
              {{#if achievements}}
              <ul class="achievements">
                {{#each achievements}}<li>{{this}}</li>{{/each}}
              </ul>
              {{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if education}}
          <section class="education">
            <h3>Education</h3>
            {{#each education}}
            <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
              <div class="edu-header">
                <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
                <div class="edu-meta">
                  <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                  {{#if location}}<span class="location">{{location}}</span>{{/if}}
                </div>
                <div class="edu-dates">
                  <time>{{formatDate startDate}}</time> - 
                  {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                </div>
              </div>
              {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
              {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
        </div>
        
        <div class="sidebar">
          {{#if projects}}
          <section class="projects">
            <h3>Key Projects</h3>
            {{#each projects}}
            <div class="project-item">
              <div class="project-name">{{name}}</div>
              {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
              {{#if technologies}}
              <div class="technologies">
                <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
              </div>
              {{/if}}
              {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
              {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
              {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if certifications}}
          <section class="certifications">
            <h3>Professional Certifications</h3>
            {{#each certifications}}
            <div class="cert-item">
              <div class="cert-name">{{name}}</div>
              <div class="cert-meta">
                <span class="issuer">{{issuer}}</span>
                {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
              </div>
              {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
              {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
              {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if achievements}}
          <section class="achievements">
            <h3>Achievements & Awards</h3>
            {{#each achievements}}
            <div class="achievement-item">
              {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
              {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
              {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
              {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if languages}}
          <section class="languages">
            <h3>Languages</h3>
            {{#each languages}}
            <div class="language-item">
              <span class="language-name">{{name}}</span>
              <span class="language-proficiency">{{proficiency}}</span>
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if customFields}}
          <section class="custom-fields">
            {{#each customFields}}
            <div class="custom-field-item">
              <h3>{{title}}</h3>
              <div class="custom-field-content">{{content}}</div>
            </div>
            {{/each}}
          </section>
          {{/if}}
        </div>
      </article>`,
      css: `.resume.sleek-professional { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1e293b; font-size: 12px; line-height: 1.4; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
      .header { grid-column: 1 / -1; text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #2563eb; }
      .name { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
      .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; font-size: 10px; color: #475569; }
      .contact-item { color: #1e293b; }
      .contact-item a { color: #475569; text-decoration: none; }
      .contact-item a:hover { text-decoration: underline; }
      section { margin-bottom: 15px; }
      h3 { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
      .job-item, .edu-item, .project-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
      .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .job-title, .edu-degree { font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
      .job-meta, .edu-meta { font-size: 10px; color: #475569; }
      .job-dates, .edu-dates { font-size: 9px; color: #64748b; font-weight: 500; }
      .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
      .achievements { margin: 4px 0; }
      .achievements li { margin-bottom: 2px; color: #4b5563; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 4px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      .skill-category { margin-bottom: 8px; }
      .skill-category-title { font-size: 11px; font-weight: 600; color: #1e293b; margin-bottom: 3px; }
      .skill-items { color: #4b5563; line-height: 1.4; }
      .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; }
      .project-name { font-size: 11px; font-weight: 600; color: #1e293b; margin-bottom: 3px; }
      .technologies { margin: 4px 0; font-size: 9px; color: #6b7280; }
      .tech-tag { background: #f1f5f9; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
      .project-links { margin: 3px 0; font-size: 9px; }
      .project-links a { color: #4b5563; text-decoration: none; }
      .project-links a:hover { text-decoration: underline; }
      .project-dates { font-size: 9px; color: #64748b; margin-top: 2px; }
      .cert-name { font-size: 11px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
      .cert-meta { font-size: 9px; color: #475569; margin-bottom: 2px; }
      .cert-expiry, .cert-id { font-size: 8px; color: #64748b; margin: 1px 0; }
      .cert-link a { color: #64748b; text-decoration: none; font-size: 9px; }
      .cert-link a:hover { text-decoration: underline; }
      .achievement-title { font-size: 11px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
      .achievement-date, .achievement-issuer { font-size: 9px; color: #64748b; margin: 1px 0; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
      .language-name { font-size: 10px; color: #1e293b; }
      .language-proficiency { font-size: 9px; color: #64748b; }
      .custom-field-item { margin-bottom: 10px; }
      .custom-field-content { font-size: 10px; color: #4b5563; line-height: 1.4; }
      .gpa { font-size: 9px; color: #6b7280; margin: 2px 0; }`
    },
    creator: null,
    tags: ['professional', 'corporate', 'ats', 'clean', 'two-column', 'blue']
  },
  {
    name: 'Creative Portfolio',
    description: 'Vibrant single-column design with featured projects at the top.',
    category: 'creative',
    preview: {
      thumbnail: {
        url: 'placeholder-will-be-replaced-by-puppeteer'
      }
    },
    layout: {
      type: 'single-column',
      sections: [
        { name: 'personalInfo', position: 1, isRequired: true, isVisible: true },
        { name: 'projects', position: 2, isRequired: false, isVisible: true },
        { name: 'skills', position: 3, isRequired: false, isVisible: true },
        { name: 'summary', position: 4, isRequired: false, isVisible: true },
        { name: 'workExperience', position: 5, isRequired: false, isVisible: true },
        { name: 'education', position: 6, isRequired: false, isVisible: true },
        { name: 'certifications', position: 7, isRequired: false, isVisible: true },
        { name: 'achievements', position: 8, isRequired: false, isVisible: true },
        { name: 'languages', position: 9, isRequired: false, isVisible: true },
        { name: 'customFields', position: 10, isRequired: false, isVisible: true }
      ]
    },
    styling: {
      colors: {
        primary: '#9333ea',
        secondary: '#f472b6',
        accent: '#14b8a6',
        text: '#111827',
        background: '#ffffff'
      },
      fonts: {
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume creative-portfolio" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
          <div class="contact-info">
            <div class="contact-item" itemprop="email">{{personalInfo.email}}</div>
            {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
            {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
            {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
            {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
            {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
          </div>
        </header>
        
        {{#if summary}}
        <section class="summary">
          <h2>Professional Summary</h2>
          <div itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="projects">
          <h2>Featured Projects</h2>
          {{#each projects}}
          <div class="project-item">
            <div class="project-header">
              <div class="project-name">{{name}}</div>
              {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
            </div>
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
            {{#if technologies}}
            <div class="technologies">
              <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
            </div>
            {{/if}}
            {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
            {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills">
          <h2>Skills & Expertise</h2>
          {{#each skills}}
          <div class="skill-category">
            <div class="skill-category-title">{{category}}</div>
            <div class="skill-items">
              {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
            </div>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="work-experience">
          <h2>Professional Experience</h2>
          {{#each workExperience}}
          <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
            <div class="job-header">
              <div class="job-title" itemprop="title">{{jobTitle}}</div>
              <div class="job-meta">
                <span class="company" itemprop="hiringOrganization">{{company}}</span>
                {{#if location}}<span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}
              </div>
              <div class="job-dates">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
            {{#if achievements}}
            <ul class="achievements">
              {{#each achievements}}<li>{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education">
          <h2>Education</h2>
          {{#each education}}
          <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="edu-header">
              <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
              <div class="edu-meta">
                <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                {{#if location}}<span class="location">{{location}}</span>{{/if}}
              </div>
              <div class="edu-dates">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
            {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications">
          <h2>Professional Certifications</h2>
          {{#each certifications}}
          <div class="cert-item">
            <div class="cert-name">{{name}}</div>
            <div class="cert-meta">
              <span class="issuer">{{issuer}}</span>
              {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
            {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
            {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if achievements}}
        <section class="achievements">
          <h2>Achievements & Awards</h2>
          {{#each achievements}}
          <div class="achievement-item">
            {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
            {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
            {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages">
          <h2>Languages</h2>
          {{#each languages}}
          <div class="language-item">
            <span class="language-name">{{name}}</span>
            <span class="language-proficiency">{{proficiency}}</span>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if customFields}}
        <section class="custom-fields">
          {{#each customFields}}
          <div class="custom-field-item">
            <h2>{{title}}</h2>
            <div class="custom-field-content">{{content}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      css: `.resume.creative-portfolio { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #111827; font-size: 12px; line-height: 1.4; }
      .header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 3px solid #9333ea; }
      .name { font-size: 18px; font-weight: 600; color: #9333ea; margin-bottom: 10px; letter-spacing: 0.5px; }
      .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; font-size: 10px; color: #f472b6; }
      .contact-item { color: #111827; }
      .contact-item a { color: #9333ea; text-decoration: none; }
      .contact-item a:hover { text-decoration: underline; }
      section { margin-bottom: 15px; }
      h2 { font-size: 14px; font-weight: 600; color: #9333ea; margin-bottom: 10px; padding-bottom: 3px; border-bottom: 1px solid #f3e8ff; text-transform: uppercase; letter-spacing: 0.5px; }
      .project-item { border-left: 4px solid #f472b6; padding-left: 12px; margin-bottom: 12px; }
      .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .project-name { font-size: 12px; font-weight: 600; color: #111827; margin-bottom: 2px; }
      .project-dates { font-size: 9px; color: #64748b; font-weight: 500; }
      .project-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
      .technologies { margin: 4px 0; font-size: 9px; color: #6b7280; }
      .tech-tag { background: #fef3c7; color: #92400e; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
      .project-links { margin: 3px 0; font-size: 9px; }
      .project-links a { color: #9333ea; text-decoration: none; }
      .project-links a:hover { text-decoration: underline; }
      .job-item, .edu-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
      .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .job-title, .edu-degree { font-size: 12px; font-weight: 600; color: #111827; margin-bottom: 2px; }
      .job-meta, .edu-meta { font-size: 10px; color: #6b7280; }
      .job-dates, .edu-dates { font-size: 9px; color: #9ca3af; font-weight: 500; }
      .job-description, .edu-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
      .achievements { margin: 4px 0; }
      .achievements li { margin-bottom: 2px; color: #4b5563; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 4px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      .skill-category { margin-bottom: 8px; }
      .skill-category-title { font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 3px; }
      .skill-items { color: #4b5563; line-height: 1.4; }
      .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; background: #f3e8ff; color: #7c3aed; padding: 1px 4px; border-radius: 2px; }
      .cert-name { font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 2px; }
      .cert-meta { font-size: 9px; color: #6b7280; margin-bottom: 2px; }
      .cert-expiry, .cert-id { font-size: 8px; color: #9ca3af; margin: 1px 0; }
      .cert-link a { color: #9333ea; text-decoration: none; font-size: 9px; }
      .cert-link a:hover { text-decoration: underline; }
      .achievement-title { font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 2px; }
      .achievement-date, .achievement-issuer { font-size: 9px; color: #9ca3af; margin: 1px 0; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
      .language-name { font-size: 10px; color: #111827; }
      .language-proficiency { font-size: 9px; color: #9ca3af; }
      .custom-field-item { margin-bottom: 10px; }
      .custom-field-content { font-size: 10px; color: #4b5563; line-height: 1.4; }
      .gpa { font-size: 9px; color: #6b7280; margin: 2px 0; }`
    },
    creator: null,
    tags: ['creative', 'portfolio', 'designer', 'colorful', 'single-column', 'purple']
  },

  {
    name: 'Dark Mode Developer',
    description: 'Bold dark-themed design with monospace accents and neon highlights.',
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
        { name: 'skills', position: 3, isRequired: false, isVisible: true },
        { name: 'workExperience', position: 4, isRequired: false, isVisible: true },
        { name: 'projects', position: 5, isRequired: false, isVisible: true },
        { name: 'education', position: 6, isRequired: false, isVisible: true },
        { name: 'certifications', position: 7, isRequired: false, isVisible: true },
        { name: 'achievements', position: 8, isRequired: false, isVisible: true },
        { name: 'languages', position: 9, isRequired: false, isVisible: true },
        { name: 'customFields', position: 10, isRequired: false, isVisible: true }
      ]
    },
    styling: {
      colors: {
        primary: '#38bdf8',
        secondary: '#0ea5e9',
        accent: '#a855f7',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume dark-mode-dev" itemscope itemtype="http://schema.org/Person">
        <div class="main-column">
          <header class="header">
            <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
            <div class="contact-info">
              <div class="contact-item" itemprop="email">{{personalInfo.email}}</div>
              {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
              {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
              {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
              {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
              {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
            </div>
          </header>
          
          {{#if summary}}
          <section class="summary">
            <h3>Professional Summary</h3>
            <div itemprop="description">{{{summary}}}</div>
          </section>
          {{/if}}
          
          {{#if skills}}
          <section class="skills">
            <h3>Technical Skills</h3>
            {{#each skills}}
            <div class="skill-category">
              <div class="skill-category-title">{{category}}</div>
              <div class="skill-items">
                {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
              </div>
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if workExperience}}
          <section class="work-experience">
            <h3>Professional Experience</h3>
            {{#each workExperience}}
            <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
              <div class="job-header">
                <div class="job-title" itemprop="title">{{jobTitle}}</div>
                <div class="job-meta">
                  <span class="company" itemprop="hiringOrganization">{{company}}</span>
                  {{#if location}}<span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}
                </div>
                <div class="job-dates">
                  <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                  {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                </div>
              </div>
              {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
              {{#if achievements}}
              <ul class="achievements">
                {{#each achievements}}<li>{{this}}</li>{{/each}}
              </ul>
              {{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if education}}
          <section class="education">
            <h3>Education</h3>
            {{#each education}}
            <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
              <div class="edu-header">
                <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
                <div class="edu-meta">
                  <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                  {{#if location}}<span class="location">{{location}}</span>{{/if}}
                </div>
                <div class="edu-dates">
                  <time>{{formatDate startDate}}</time> - 
                  {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                </div>
              </div>
              {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
              {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
        </div>
        
        <div class="sidebar">
          {{#if projects}}
          <section class="projects">
            <h3>Key Projects</h3>
            {{#each projects}}
            <div class="project-item">
              <div class="project-name">{{name}}</div>
              {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
              {{#if technologies}}
              <div class="technologies">
                <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
              </div>
              {{/if}}
              {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
              {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
              {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if certifications}}
          <section class="certifications">
            <h3>Professional Certifications</h3>
            {{#each certifications}}
            <div class="cert-item">
              <div class="cert-name">{{name}}</div>
              <div class="cert-meta">
                <span class="issuer">{{issuer}}</span>
                {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
              </div>
              {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
              {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
              {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if achievements}}
          <section class="achievements">
            <h3>Achievements & Awards</h3>
            {{#each achievements}}
            <div class="achievement-item">
              {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
              {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
              {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
              {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if languages}}
          <section class="languages">
            <h3>Languages</h3>
            {{#each languages}}
            <div class="language-item">
              <span class="language-name">{{name}}</span>
              <span class="language-proficiency">{{proficiency}}</span>
            </div>
            {{/each}}
          </section>
          {{/if}}
          
          {{#if customFields}}
          <section class="custom-fields">
            {{#each customFields}}
            <div class="custom-field-item">
              <h3>{{title}}</h3>
              <div class="custom-field-content">{{content}}</div>
            </div>
            {{/each}}
          </section>
          {{/if}}
        </div>
      </article>`,
      css: `.resume.dark-mode-dev { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; font-size: 12px; line-height: 1.4; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
      .header { grid-column: 1 / -1; text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #38bdf8; }
      .name { font-size: 18px; font-weight: 600; color: #38bdf8; margin-bottom: 8px; text-shadow: 0 0 10px rgba(56, 189, 248, 0.3); }
      .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; font-size: 10px; color: #a855f7; }
      .contact-item { color: #1f2937; }
      .contact-item a { color: #38bdf8; text-decoration: none; }
      .contact-item a:hover { text-decoration: underline; text-shadow: 0 0 5px rgba(56, 189, 248, 0.5); }
      section { margin-bottom: 15px; }
      h3 { font-size: 14px; font-weight: 600; color: #38bdf8; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
      .job-item, .edu-item, .project-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
      .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .job-title, .edu-degree { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .job-meta, .edu-meta { font-size: 10px; color: #6b7280; }
      .job-dates, .edu-dates { font-size: 9px; color: #64748b; font-weight: 500; }
      .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
      .achievements { margin: 4px 0; }
      .achievements li { margin-bottom: 2px; color: #4b5563; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 4px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      
      .skill-category { margin-bottom: 8px; }
      .skill-category-title { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
      .skill-items { color: #4b5563; line-height: 1.4; }
      .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; background: #0ea5e9; color: white; padding: 1px 4px; border-radius: 2px; }
      .project-name { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
      .technologies { margin: 4px 0; font-size: 9px; color: #6b7280; }
      .tech-tag { background: #a855f7; color: white; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
      .project-links { margin: 3px 0; font-size: 9px; }
      .project-links a { color: #38bdf8; text-decoration: none; }
      .project-links a:hover { text-decoration: underline; }
      .project-dates { font-size: 9px; color: #64748b; margin-top: 2px; }
      .cert-name { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .cert-meta { font-size: 9px; color: #6b7280; margin-bottom: 2px; }
      .cert-expiry, .cert-id { font-size: 8px; color: #64748b; margin: 1px 0; }
      .cert-link a { color: #38bdf8; text-decoration: none; font-size: 9px; }
      .cert-link a:hover { text-decoration: underline; }
      .achievement-title { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .achievement-date, .achievement-issuer { font-size: 9px; color: #64748b; margin: 1px 0; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
      .language-name { font-size: 10px; color: #1f2937; }
      .language-proficiency { font-size: 9px; color: #64748b; }
      .custom-field-item { margin-bottom: 10px; }
      .custom-field-content { font-size: 10px; color: #4b5563; line-height: 1.4; }
      .gpa { font-size: 9px; color: #6b7280; margin: 2px 0; }`
    },
    creator: null,
    tags: ['dark', 'developer', 'tech', 'modern', 'two-column', 'blue']
  },
  {
    name: 'Elegant Minimal',
    description: 'Minimalist single-column layout with soft colors and elegant typography.',
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
        { name: 'certifications', position: 7, isRequired: false, isVisible: true },
        { name: 'achievements', position: 8, isRequired: false, isVisible: true },
        { name: 'languages', position: 9, isRequired: false, isVisible: true },
        { name: 'customFields', position: 10, isRequired: false, isVisible: true }
      ]
    },
    styling: {
      colors: {
        primary: '#374151',
        secondary: '#9ca3af',
        accent: '#10b981',
        text: '#111827',
        background: '#ffffff'
      },
      fonts: {
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume elegant-minimal" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
          <div class="contact-info">
            <div class="contact-item" itemprop="email">{{personalInfo.email}}</div>
            {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
            {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
            {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
            {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
            {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
          </div>
        </header>
        
        {{#if summary}}
        <section class="summary">
          <h2>Professional Summary</h2>
          <div itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills">
          <h2>Skills & Expertise</h2>
          {{#each skills}}
          <div class="skill-category">
            <div class="skill-category-title">{{category}}</div>
            <div class="skill-items">
              {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
            </div>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="work-experience">
          <h2>Professional Experience</h2>
          {{#each workExperience}}
          <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
            <div class="job-header">
              <div class="job-title" itemprop="title">{{jobTitle}}</div>
              <div class="job-meta">
                <span class="company" itemprop="hiringOrganization">{{company}}</span>
                {{#if location}}<span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}
              </div>
              <div class="job-dates">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
            {{#if achievements}}
            <ul class="achievements">
              {{#each achievements}}<li>{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="projects">
          <h2>Key Projects</h2>
          {{#each projects}}
          <div class="project-item">
            <div class="project-header">
              <div class="project-name">{{name}}</div>
              {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
            </div>
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
            {{#if technologies}}
            <div class="technologies">
              <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
            </div>
            {{/if}}
            {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
            {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education">
          <h2>Education</h2>
          {{#each education}}
          <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="edu-header">
              <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
              <div class="edu-meta">
                <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                {{#if location}}<span class="location">{{location}}</span>{{/if}}
              </div>
              <div class="edu-dates">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
            {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications">
          <h2>Professional Certifications</h2>
          {{#each certifications}}
          <div class="cert-item">
            <div class="cert-name">{{name}}</div>
            <div class="cert-meta">
              <span class="issuer">{{issuer}}</span>
              {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
            {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
            {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if achievements}}
        <section class="achievements">
          <h2>Achievements & Awards</h2>
          {{#each achievements}}
          <div class="achievement-item">
            {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
            {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
            {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages">
          <h2>Languages</h2>
          {{#each languages}}
          <div class="language-item">
            <span class="language-name">{{name}}</span>
            <span class="language-proficiency">{{proficiency}}</span>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if customFields}}
        <section class="custom-fields">
          {{#each customFields}}
          <div class="custom-field-item">
            <h2>{{title}}</h2>
            <div class="custom-field-content">{{content}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      css: `.resume.elegant-minimal { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #111827; font-size: 12px; line-height: 1.4; }
      .header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
      .name { font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px; }
      .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; font-size: 10px; color: #9ca3af; }
      .contact-item { color: #111827; }
      .contact-item a { color: #10b981; text-decoration: none; }
      .contact-item a:hover { text-decoration: underline; }
      section { margin-bottom: 15px; }
      h2 { font-size: 14px; font-weight: 600; color: #10b981; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.4px; }
      .job-item, .edu-item, .project-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
      .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .job-title, .edu-degree { font-size: 12px; font-weight: 600; color: #111827; margin-bottom: 2px; }
      .job-meta, .edu-meta { font-size: 10px; color: #6b7280; }
      .job-dates, .edu-dates { font-size: 9px; color: #9ca3af; font-weight: 500; }
      .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
      .achievements { margin: 4px 0; }
      .achievements li { margin-bottom: 2px; color: #4b5563; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 4px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      
      .skill-category { margin-bottom: 8px; }
      .skill-category-title { font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 3px; }
      .skill-items { color: #4b5563; line-height: 1.4; }
      .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; }
      .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .project-name { font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 2px; }
      .project-dates { font-size: 9px; color: #9ca3af; font-weight: 500; }
      .technologies { margin: 4px 0; font-size: 9px; color: #6b7280; }
      .tech-tag { background: #f3f4f6; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
      .project-links { margin: 3px 0; font-size: 9px; }
      .project-links a { color: #10b981; text-decoration: none; }
      .project-links a:hover { text-decoration: underline; }
      .cert-name { font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 2px; }
      .cert-meta { font-size: 9px; color: #6b7280; margin-bottom: 2px; }
      .cert-expiry, .cert-id { font-size: 8px; color: #9ca3af; margin: 1px 0; }
      .cert-link a { color: #10b981; text-decoration: none; font-size: 9px; }
      .cert-link a:hover { text-decoration: underline; }
      .achievement-title { font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 2px; }
      .achievement-date, .achievement-issuer { font-size: 9px; color: #9ca3af; margin: 1px 0; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
      .language-name { font-size: 10px; color: #111827; }
      .language-proficiency { font-size: 9px; color: #9ca3af; }
      .custom-field-item { margin-bottom: 10px; }
      .custom-field-content { font-size: 10px; color: #4b5563; line-height: 1.4; }
      .gpa { font-size: 9px; color: #6b7280; margin: 2px 0; }`
    },
    creator: null,
    tags: ['minimal', 'modern', 'clean', 'professional', 'single-column', 'green']
  },
  {
    name: 'Bold Accent',
    description: 'Single-column resume with strong header bar and bold accent color for headings.',
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
        { name: 'certifications', position: 7, isRequired: false, isVisible: true },
        { name: 'achievements', position: 8, isRequired: false, isVisible: true },
        { name: 'languages', position: 9, isRequired: false, isVisible: true },
        { name: 'customFields', position: 10, isRequired: false, isVisible: true }
      ]
    },
    styling: {
      colors: {
        primary: '#2563eb',
        secondary: '#93c5fd',
        accent: '#2563eb',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        primary: 'Arial',
        secondary: 'Arial',
        sizes: { heading: 18, subheading: 16, body: 12, small: 10 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 12,
        lineSpacing: 1.3,
        sectionSpacing: 1
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume bold-accent" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
          <div class="contact-info">
            <div class="contact-item" itemprop="email">{{personalInfo.email}}</div>
            {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
            {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
            {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
            {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
            {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
          </div>
        </header>
        
        {{#if summary}}
        <section class="summary">
          <h2>Professional Summary</h2>
          <div itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills">
          <h2>Core Skills</h2>
          {{#each skills}}
          <div class="skill-category">
            <div class="skill-category-title">{{category}}</div>
            <div class="skill-items">
              {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
            </div>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="work-experience">
          <h2>Professional Experience</h2>
          {{#each workExperience}}
          <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
            <div class="job-header">
              <div class="job-title" itemprop="title">{{jobTitle}}</div>
              <div class="job-meta">
                <span class="company" itemprop="hiringOrganization">{{company}}</span>
                {{#if location}}<span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}
              </div>
              <div class="job-dates">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
            {{#if achievements}}
            <ul class="achievements">
              {{#each achievements}}<li>{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="projects">
          <h2>Key Projects</h2>
          {{#each projects}}
          <div class="project-item">
            <div class="project-header">
              <div class="project-name">{{name}}</div>
              {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
            </div>
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
            {{#if technologies}}
            <div class="technologies">
              <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
            </div>
            {{/if}}
            {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
            {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education">
          <h2>Education</h2>
          {{#each education}}
          <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="edu-header">
              <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
              <div class="edu-meta">
                <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                {{#if location}}<span class="location">{{location}}</span>{{/if}}
              </div>
              <div class="edu-dates">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
            {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications">
          <h2>Professional Certifications</h2>
          {{#each certifications}}
          <div class="cert-item">
            <div class="cert-name">{{name}}</div>
            <div class="cert-meta">
              <span class="issuer">{{issuer}}</span>
              {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
            {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
            {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if achievements}}
        <section class="achievements">
          <h2>Achievements & Awards</h2>
          {{#each achievements}}
          <div class="achievement-item">
            {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
            {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
            {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages">
          <h2>Languages</h2>
          {{#each languages}}
          <div class="language-item">
            <span class="language-name">{{name}}</span>
            <span class="language-proficiency">{{proficiency}}</span>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if customFields}}
        <section class="custom-fields">
          {{#each customFields}}
          <div class="custom-field-item">
            <h3>{{title}}</h3>
            <div class="custom-field-content">{{content}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      css: `.resume.bold-accent { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; background: white; color: #1f2937; font-size: 12px; line-height: 1.4; padding: 0; }
      .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 16px 20px; margin-bottom: 12px; }
      .name { font-size: 18px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.5px; color: white; }
      .contact-info { display: flex; flex-wrap: wrap; gap: 12px; font-size: 10px; color: rgba(255, 255, 255, 0.9); line-height: 1.4; }
      .contact-item { color: rgba(255, 255, 255, 0.9); }
      .contact-item a { color: white; text-decoration: none; }
      .contact-item a:hover { text-decoration: underline; }
      section { margin-bottom: 12px; padding: 0 20px; }
      h2 { font-size: 14px; font-weight: 600; color: #2563eb; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; position: relative; }
      h2::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 20px; height: 2px; background: #2563eb; }
      .job-item, .edu-item, .project-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
      .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .job-title, .edu-degree { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .job-meta, .edu-meta { font-size: 10px; color: #6b7280; font-weight: 500; margin-bottom: 2px; }
      .job-dates, .edu-dates { font-size: 9px; color: #9ca3af; font-weight: 500; text-align: right; }
      .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
      .achievements { margin: 4px 0;}
      .achievements li { margin-bottom: 2px; color: #4b5563; }
      
      /* General list styling for HTML content in descriptions */
      ul, ol { margin: 4px 0; padding-left: 1rem; }
      ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      
      .skill-category { margin-bottom: 8px; }
      .skill-category-title { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 3px; }
      .skill-items { color: #4b5563; line-height: 1.4; }
      .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; }
      .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
      .project-name { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .project-dates { font-size: 9px; color: #9ca3af; font-weight: 500; }
      .technologies { margin: 4px 0; font-size: 9px; color: #6b7280; }
      .tech-tag { background: #f3f4f6; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
      .project-links { margin: 3px 0; font-size: 9px; }
      .project-links a { color: #4b5563; text-decoration: none; }
      .project-links a:hover { text-decoration: underline; }
      .cert-name { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .cert-meta { font-size: 9px; color: #6b7280; margin-bottom: 2px; }
      .cert-expiry, .cert-id { font-size: 8px; color: #6b7280; margin: 2px 0; }
      .cert-link a { color: #6b7280; text-decoration: none; font-size: 9px; }
      .cert-link a:hover { text-decoration: underline; }
      .achievement-title { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
      .achievement-date, .achievement-issuer { font-size: 9px; color: #9ca3af; margin: 1px 0; }
      .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
      .language-name { font-size: 10px; color: #1f2937; }
      .language-proficiency { font-size: 9px; color: #9ca3af; }
      .custom-field-item { margin-bottom: 10px; }
      .custom-field-content { font-size: 10px; color: #4b5563; line-height: 1.4; }
      .gpa { font-size: 9px; color: #6b7280; margin: 4px 0; }`
    },
    creator: null,
    tags: ['bold', 'modern', 'accent', 'colorful', 'single-column', 'blue']
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
        { "name": "skills", "position": 5, "isRequired": false, "isVisible": true },
        { "name": "certifications", "position": 6, "isRequired": false, "isVisible": true },
        { "name": "achievements", "position": 7, "isRequired": false, "isVisible": true },
        { "name": "languages", "position": 8, "isRequired": false, "isVisible": true },
        { "name": "customFields", "position": 9, "isRequired": false, "isVisible": true }
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
        "secondary": "Times New Roman",
        "sizes": { "heading": 18, "subheading": 16, "body": 12, "small": 10 }
      },
      "template": {
        "headerLevel": "h3",
        "headerFontSize": 18,
        "fontSize": 12,
        "lineSpacing": 1.3,
        "sectionSpacing": 1
      }
    },
    "availability": { "tier": "free", "isPublic": true, "isActive": true },
    "templateCode": {
      "html": `<article class="resume classic-serif" itemscope itemtype="http://schema.org/Person">
        <header class="header">
          <h1 class="name" itemprop="name">{{personalInfo.fullName}}</h1>
          <div class="contact-info">
            <div class="contact-item" itemprop="email">{{personalInfo.email}}</div>
            {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
            {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
            {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
            {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
            {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
          </div>
        </header>
        
        {{#if summary}}
        <section class="summary">
          <h2>Professional Summary</h2>
          <div itemprop="description">{{{summary}}}</div>
        </section>
        {{/if}}
        
        {{#if education}}
        <section class="education">
          <h2>Education</h2>
          {{#each education}}
          <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
            <div class="edu-header">
              <div class="edu-degree" itemprop="credentialCategory">{{degree}}</div>
              <div class="edu-meta">
                <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                {{#if location}}<span class="location">{{location}}</span>{{/if}}
              </div>
              <div class="edu-dates">
                <time>{{formatDate startDate}}</time> - 
                {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if gpa}}<p class="gpa">GPA: {{gpa}}</p>{{/if}}
            {{#if description}}<div class="edu-description">{{{description}}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if workExperience}}
        <section class="work-experience">
          <h2>Professional Experience</h2>
          {{#each workExperience}}
          <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
            <div class="job-header">
              <div class="job-title" itemprop="title">{{jobTitle}}</div>
              <div class="job-meta">
                <span class="company" itemprop="hiringOrganization">{{company}}</span>
                {{#if location}}<span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}
              </div>
              <div class="job-dates">
                <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
              </div>
            </div>
            {{#if description}}<div class="job-description" itemprop="description">{{{description}}}</div>{{/if}}
            {{#if achievements}}
            <ul class="achievements">
              {{#each achievements}}<li>{{this}}</li>{{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if skills}}
        <section class="skills">
          <h2>Core Competencies</h2>
          {{#each skills}}
          <div class="skill-category">
            <div class="skill-category-title">{{category}}</div>
            <div class="skill-items">
              {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
            </div>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if projects}}
        <section class="projects">
          <h2>Key Projects</h2>
          {{#each projects}}
          <div class="project-item">
            <div class="project-header">
              <div class="project-name">{{name}}</div>
              {{#if startDate}}<div class="project-dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
            </div>
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
            {{#if technologies}}
            <div class="technologies">
              <strong>Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
            </div>
            {{/if}}
            {{#if url}}<div class="project-links"><a href="{{url}}" target="_blank">View Project</a></div>{{/if}}
            {{#if githubUrl}}<div class="project-links"><a href="{{githubUrl}}" target="_blank">GitHub</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications}}
        <section class="certifications">
          <h2>Professional Certifications</h2>
          {{#each certifications}}
          <div class="cert-item">
            <div class="cert-name">{{name}}</div>
            <div class="cert-meta">
              <span class="issuer">{{issuer}}</span>
              {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
            </div>
            {{#if expiryDate}}<div class="cert-expiry">Expires: {{formatDate expiryDate}}</div>{{/if}}
            {{#if credentialId}}<div class="cert-id">ID: {{credentialId}}</div>{{/if}}
            {{#if url}}<div class="cert-link"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if achievements}}
        <section class="achievements">
          <h2>Achievements & Awards</h2>
          {{#each achievements}}
          <div class="achievement-item">
            {{#if title}}<div class="achievement-title">{{title}}</div>{{/if}}
            {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
            {{#if date}}<div class="achievement-date">{{formatDate date}}</div>{{/if}}
            {{#if issuer}}<div class="achievement-issuer">{{issuer}}</div>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if languages}}
        <section class="languages">
          <h2>Languages</h2>
          {{#each languages}}
          <div class="language-item">
            <span class="language-name">{{name}}</span>
            <span class="language-proficiency">{{proficiency}}</span>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if customFields}}
        <section class="custom-fields">
          <h2>Additional Information</h2>
          {{#each customFields}}
          <div class="custom-field-item">
            <h3>{{title}}</h3>
            <div class="custom-field-content">{{content}}</div>
          </div>
          {{/each}}
        </section>
        {{/if}}
      </article>`,
      "css": ".resume.classic-serif { font-family: 'Times New Roman', serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #111827; font-size: 12px; line-height: 1.4; } .resume.classic-serif .header { text-align: left !important; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #d1d5db; } .resume.classic-serif .name { font-size: 18px; line-height: 1.2; letter-spacing: 0.5px; margin: 0 0 3px; font-variant: small-caps; text-align: left !important; font-weight: bold; } .resume.classic-serif .contact { font-size: 11px; color: #4b5563; line-height: 1.3; } .resume.classic-serif .contact a { color: #4b5563; text-decoration: none; } .resume.classic-serif section { margin-top: 8px; } .resume.classic-serif h2 { text-transform: uppercase; font-size: 14px; margin: 6px 0 3px; letter-spacing: 0.5px; color: #1f2937; border-left: 3px solid #4b5563; padding-left: 4px; font-weight: bold; } .resume.classic-serif h3 { font-size: 12px; font-weight: bold; margin: 3px 0 2px; color: #374151; } .resume.classic-serif .job-header, .resume.classic-serif .edu-header, .resume.classic-serif .project-header, .resume.classic-serif .achievement-header, .resume.classic-serif .cert-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; } .resume.classic-serif .dates { font-size: 10px; color: #6b7280; } .resume.classic-serif .gpa { font-size: 10px; color: #374151; margin: 2px 0; } .resume.classic-serif .company, .resume.classic-serif .institution, .resume.classic-serif .issuer { font-size: 10px; color: #4b5563; margin: 2px 0; } .resume.classic-serif .job-description, .resume.classic-serif .project-description, .resume.classic-serif .edu-description { margin: 3px 0; color: #374151; line-height: 1.4; } .resume.classic-serif .achievements { margin: 3px 0;} .resume.classic-serif .achievements li { margin-bottom: 2px; color: #374151; } .resume.classic-serif .skill-category { margin-bottom: 4px; } .resume.classic-serif .skill-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; } .resume.classic-serif .skill-item { background: #f3f4f6; padding: 2px 4px; border-radius: 2px; font-size: 9px; color: #374151; } .resume.classic-serif .technologies { margin: 3px 0; } .resume.classic-serif .tech-tag { background: #e5e7eb; padding: 1px 3px; border-radius: 2px; font-size: 8px; margin-right: 3px; } .resume.classic-serif .project-links { margin: 2px 0; } .resume.classic-serif .project-links a { color: #374151; text-decoration: none; font-size: 9px; } .resume.classic-serif .cert-expiry, .resume.classic-serif .cert-id { font-size: 9px; color: #6b7280; margin: 1px 0; } .resume.classic-serif .cert-link a { color: #374151; text-decoration: none; font-size: 9px; } .resume.classic-serif .issuer-info { font-size: 9px; color: #6b7280; margin: 2px 0; } .resume.classic-serif .language-item { margin: 2px 0; font-size: 10px; } .resume.classic-serif .custom-field { margin-bottom: 4px; } .resume.classic-serif .custom-content { margin: 2px 0; } .resume.classic-serif p { margin: 2px 0; } .resume.classic-serif .job, .resume.classic-serif .edu, .resume.classic-serif .project, .resume.classic-serif .cert, .resume.classic-serif .achievement { margin-bottom: 6px; ul, ol { margin: 0.25rem 0; padding-left: 1rem; }   ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; font-size: 10px; } ul { list-style-type: disc; } ol { list-style-type: decimal; } } ul { list-style-type: disc; } ol { list-style-type: decimal; }"
    },
    creator: null,
    "tags": ["classic", "serif", "traditional", "academic", "single-column", "gray"]
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
        { "name": "education", "position": 6, "isRequired": false, "isVisible": true },
        { "name": "certifications", "position": 7, "isRequired": false, "isVisible": true },
        { "name": "achievements", "position": 8, "isRequired": false, "isVisible": true },
        { "name": "languages", "position": 9, "isRequired": false, "isVisible": true },
        { "name": "customFields", "position": 10, "isRequired": false, "isVisible": true }
      ]
    },
    "styling": {
      "colors": {
        "primary": "#3b82f6",
        "secondary": "#9333ea",
        "accent": "#14b8a6",
        "text": "#111827",
        "background": "#ffffff"
      },
      "fonts": {
        "primary": "Arial",
        "secondary": "Arial",
        "sizes": { "heading": 18, "subheading": 16, "body": 12, "small": 10 }
      },
      "template": {
        "headerLevel": "h3",
        "headerFontSize": 18,
        "fontSize": 12,
        "lineSpacing": 1.3,
        "sectionSpacing": 1
      }
    },
    "availability": { "tier": "free", "isPublic": true, "isActive": true },
    "templateCode": {
      "html": `
        <div class="resume fresh-gradient">
          <header class="header">
            <h1 class="name">{{personalInfo.fullName}}</h1>
            <div class="contact-info">
              <div class="contact-item" itemprop="email">{{personalInfo.email}}</div>
              {{#if personalInfo.phone}}<div class="contact-item" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
              {{#if personalInfo.address}}<div class="contact-item" itemprop="address">{{personalInfo.address}}</div>{{/if}}
              {{#if personalInfo.website}}<div class="contact-item"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
              {{#if personalInfo.linkedin}}<div class="contact-item"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
              {{#if personalInfo.github}}<div class="contact-item"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
            </div>
          </header>
          
          {{#if summary}}
            <section>
              <h2>SUMMARY</h2>
              <div>{{{summary}}}</div>
            </section>
          {{/if}}
          {{#if skills}}
            <section>
              <h2>SKILLS</h2>
              {{#each skills}}<div><strong>{{category}}:</strong> {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/each}}
            </section>
          {{/if}}
          {{#if workExperience}}
            <section>
              <h2>EXPERIENCE</h2>
              {{#each workExperience}}
                <div class="job">
                  <div class="job-header"><strong>{{jobTitle}}</strong><span class="dates">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div>
                  <div class="company">{{company}}{{#if location}}, {{location}}{{/if}}</div>
                  {{#if description}}<div>{{{description}}}</div>{{/if}}
                  {{#if achievements}}<ul>{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}
                </div>
              {{/each}}
            </section>
          {{/if}}
          {{#if projects}}
            <section>
              <h2>PROJECTS</h2>
              {{#each projects}}
                <div class="project">
                  <div class="project-header"><strong>{{name}}</strong>{{#if startDate}}<span class="dates">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}</div>
                  {{#if description}}<div class="description">{{{description}}}</div>{{/if}}
                  {{#if technologies}}<div class="tech">{{#each technologies}}<span class="tag">{{this}}</span>{{/each}}</div>{{/if}}
                  {{#if url}}<div class="project-url"><strong>URL:</strong> {{url}}</div>{{/if}}
                  {{#if githubUrl}}<div class="github-url"><strong>GitHub:</strong> {{githubUrl}}</div>{{/if}}
                </div>
              {{/each}}
            </section>
          {{/if}}
          {{#if education}}
            <section>
              <h2>EDUCATION</h2>
              {{#each education}}
                <div class="edu">
                  <div class="edu-header"><strong>{{degree}}</strong><span class="dates">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</span></div>
                  <div class="institution">{{institution}}{{#if location}}, {{location}}{{/if}}</div>
                  {{#if gpa}}<div class="gpa">GPA: {{gpa}}</div>{{/if}}
                  {{#if description}}<div>{{{description}}}</div>{{/if}}
                </div>
              {{/each}}
            </section>
          {{/if}}
          {{#if certifications}}
            <section>
              <h2>CERTIFICATIONS</h2>
              {{#each certifications}}
                <div class="cert">
                  <div class="cert-header"><strong>{{name}}</strong>{{#if date}}<span class="dates">{{formatDate date}}</span>{{/if}}</div>
                  {{#if issuer}}<div class="cert-issuer"><em>{{issuer}}</em></div>{{/if}}
                  {{#if expiryDate}}<div class="cert-expiry"><strong>Expires:</strong> {{formatDate expiryDate}}</div>{{/if}}
                  {{#if credentialId}}<div class="cert-id"><strong>ID:</strong> {{credentialId}}</div>{{/if}}
                  {{#if url}}<div class="cert-url"><strong>URL:</strong> {{url}}</div>{{/if}}
                </div>
              {{/each}}
            </section>
          {{/if}}
          {{#if achievements}}
            <section>
              <h2>ACHIEVEMENTS</h2>
              {{#each achievements}}
                <div>
                  {{#if title}}<div class="achievement-header"><strong>{{title}}</strong>{{#if date}}<span class="dates">{{formatDate date}}</span>{{/if}}</div>{{/if}}
                  {{#if description}}<div>{{{description}}}</div>{{/if}}
                  {{#if issuer}}<div class="issuer-info"><em>{{issuer}}</em></div>{{/if}}
                </div>
              {{/each}}
            </section>
          {{/if}}
          {{#if languages}}
            <section>
              <h2>LANGUAGES</h2>
              {{#each languages}}<div>{{name}} - {{proficiency}}</div>{{/each}}
            </section>
          {{/if}}
        </div>
      `,
      "css": ".resume.fresh-gradient { font-family: 'Arial', sans-serif; background: #ffffff; color: #111827; padding: 0.5in 0.35in; line-height: 1.4; font-size: 12px; } .header { margin-bottom: 8px; } .name { font-size: 18px; margin: 0 0 6px; color: #3b82f6; } .contact { display: flex; gap: 10px; color: #3b82f6; font-size: 11px; } .contact-item a { color: #111827; text-decoration: none; } section { margin-top: 10px; background: transparent; } .job, .edu, .project { background: transparent; } h2 { color: #3b82f6; font-size: 14px; margin: 10px 0 6px; } .section-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; } .project-header { display: flex; justify-content: space-between; font-size: 11px; } .tag { background: linear-gradient(90deg, #3b82f6, #9333ea); color: white; padding: 2px 5px; border-radius: 6px; margin-right: 3px; font-size: 9px; } ul, ol { margin: 4px 0; padding-left: 1rem; } ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; } ul { list-style-type: disc; } ol { list-style-type: decimal; }"
    },
    creator: null,
    "tags": ["modern", "gradient", "colorful", "rounded"]
  }
]