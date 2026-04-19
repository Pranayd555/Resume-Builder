module.exports = [
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
        sectionSpacing: 1,
        fontFamily: 'Arial'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume modern-professional" itemscope itemtype="http://schema.org/Person">
            <div class="main-column">
              <header class="header">
                <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
                {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

                <div class="contact-info secondaryFont">
                  <div class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</div>
                  {{#if personalInfo.phone}}<div class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
                  {{#if personalInfo.address}}<div class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</div>{{/if}}
                  {{#if personalInfo.website}}<div class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
                  {{#if personalInfo.linkedin}}<div class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
                  {{#if personalInfo.github}}<div class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
                </div>
              </header>
              
              {{#if summary}}
              <section class="summary secondaryFont">
                <h3 class="primaryFont">Summary</h3>
                <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
              </section>
              {{/if}}
              
              {{#if skills}}
              <section class="skills secondaryFont">
                <h3 class="primaryFont">Core Competencies</h3>
                {{#each skills}}
                <div class="skill-category">
                  <div class="skill-category-title primaryFont">{{category}}</div>
                  <div class="skill-items secondaryFont">
                    {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
                  </div>
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if workExperience}}
              <section class="work-experience secondaryFont">
                <h3 class="primaryFont">Professional Experience</h3>
                {{#each workExperience}}
                <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
                  <div class="job-header">
                    <div class="job-title primaryFont" itemprop="title">{{jobTitle}}</div>
                    <div class="job-meta">
                      <span class="company secondaryFont" itemprop="hiringOrganization">{{company}}</span>
                      {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">{{location}}</span>{{/if}}
                    </div>
                    <div class="job-dates secondaryFont">
                      <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                      {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                    </div>
                  </div>
                  {{#if description}}<div class="job-description secondaryFont" itemprop="description">{{{description}}}</div>{{/if}}
                  {{#if achievements}}
                  <ul class="achievements secondaryFont">
                    {{#each achievements}}<li>{{this}}</li>{{/each}}
                  </ul>
                  {{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if projects}}
              <section class="projects secondaryFont">
                <h3 class="primaryFont">Key Projects</h3>
                {{#each projects}}
                <div class="project-item">
                  <div class="project-name primaryFont">{{name}}</div>
                  {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                  {{#if technologies}}
                  <div class="technologies">
                    <strong class="primaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag secondaryFont">{{this}}</span>{{/each}}
                  </div>
                  {{/if}}
                  {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                  {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
                  {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
            </div>
            
            <div class="sidebar">
              {{#if education}}
              <section class="education secondaryFont">
                <h3 class="primaryFont">Education</h3>
                {{#each education}}
                <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                  <div class="edu-header">
                    <div class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</div>
                    <div class="edu-meta">
                      <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                      {{#if location}}<span class="location secondaryFont">{{location}}</span>{{/if}}
                    </div>
                    <div class="edu-dates secondaryFont">
                      {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                      {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                    </div>
                  </div>
                  {{#if gpa}}<p class="gpa secondaryFont">GPA: {{gpa}}</p>{{/if}}
                  {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if certifications}}
              <section class="certifications secondaryFont">
                <h3 class="primaryFont">Professional Certifications</h3>
                {{#each certifications}}
                <div class="cert-item">
                  <div class="cert-name primaryFont">{{name}}</div>
                  <div class="cert-meta">
                    <span class="issuer secondaryFont">{{issuer}}</span>
                  </div>
                  {{#if date}}<div class="cert-dates secondaryFont">{{formatDate date}}
                  {{#if expiryDate}}<span class="cert-expiry secondaryFont"> - {{formatDate expiryDate}}</span>{{/if}}
                  </div>{{/if}}
                  {{#if credentialId}}<div class="cert-id secondaryFont">Credential ID: {{credentialId}}</div>{{/if}}
                  {{#if url}}<div class="cert-link secondaryFont">Credential URL: <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if achievements}}
              <section class="achievements secondaryFont">
                <h3 class="primaryFont">Achievements & Awards</h3>
                {{#each achievements}}
                <div class="achievement-item">
                  {{#if title}}<div class="achievement-title primaryFont">{{title}}</div>{{/if}}
                  {{#if description}}<p class="achievement-description secondaryFont">{{{description}}}</p>{{/if}}
                  {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                  {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if languages}}
              <section class="languages secondaryFont">
                <h3 class="primaryFont">Languages</h3>
                {{#each languages}}
                <div class="language-item">
                  <span class="language-name secondaryFont">{{name}}</span>
                  <span class="language-level secondaryFont">{{proficiency}}</span>
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if customFields}}
              <section class="custom-fields">
                {{#each customFields}}
                <div class="custom-field">
                  <div class="custom-field-title primaryFont">{{title}}</div>
                  <div class="custom-content secondaryFont">{{content}}</div>
                </div>
                {{/each}}
              </section>
              {{/if}}
            </div>
          </article>`,
      css: `.resume.modern-professional { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; font-size: 15px; line-height: 1; }
          @media print { .resume.modern-professional { max-width: none; margin: 0; padding: 0.5in; } }
          @media (max-width: 768px) { .resume.modern-professional { grid-template-columns: 1fr; gap: 15px; padding: 15px; } }
          
          .header { margin-bottom: 0.5rem; }
          .name { font-size: 18px; font-weight: 700; color: #2563eb; margin-bottom: 0.25rem; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 8px; font-size: 15px; color: #64748b; }
          .contact-item { display: flex; align-items: center; }
          .contact-item a { color: #64748b; text-decoration: none; }
          .contact-item a:hover { text-decoration: underline; }
          
          section { margin-top: 0.5rem; }
          h3 { font-size: 18px; font-weight: 600; color: #2563eb; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 2px solid #e5e7eb; }
          
          .job-item, .edu-item, .project-item, .cert-item { margin-bottom: 0.75rem; }
          .job-header, .edu-header { margin-bottom: 0.25rem; }
          .job-title, .edu-degree, .project-name, .cert-name { font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .job-meta, .edu-meta, .cert-meta { display: flex; gap: 8px; font-size: 13px; color: #64748b; margin-bottom: 0.25rem; }
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
          .sidebar h3 { font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb; }
          
          .skill-category { margin-bottom: 0.5rem; }
          .skill-category-title { font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .skill-items { display: flex; flex-wrap: wrap; gap: 4px; }
          .skill-item { background: #2563eb; color: white; padding: 3px 6px; border-radius: 3px; font-size: 10px; }
          .skill-item[data-level="expert"] { background: rgb(1, 27, 111); }
          .skill-item[data-level="advanced"] { background: rgb(15, 50, 165); }
          .skill-item[data-level="intermediate"] { background: rgb(40, 78, 218); }
          .skill-item[data-level="beginner"] { background: rgb(78, 117, 246); }
          
          .technologies { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 0.25rem; }
          .tech-tag { background: #0ea5e9; color: white; padding: 2px 5px; border-radius: 2px; font-size: 9px; }
          
          .project-links { margin-top: 0.25rem; }
          .project-links a { color: #374151; text-decoration: none; font-size: 9px; margin-right: 8px; }
          .project-links a:hover { text-decoration: underline; }
          
          .achievement-item { margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid #e5e7eb; }
          .achievement-title { font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .achievement-description { font-size: 15px; color: #4b5563; margin-bottom: 0.25rem; line-height: 1; }
          .achievement-date { font-size: 9px; color: #6b7280; font-style: italic; }
          .achievement-issuer { font-size: 9px; color: #6b7280; }
          
          .cert-expiry, .cert-id { font-size: 9px; color: #6b7280; margin-top: 0.125rem; }
          .cert-link a { color: #6b7280; text-decoration: none; font-size: 8px; word-break: break-all; }
          .cert-link a:hover { text-decoration: underline; }
          
          .language-item { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
          .language-name { font-size: 13px; color: #1f2937; }
          .language-level { font-size: 10px; color: #6b7280; text-transform: capitalize; }
          
          /* Additional unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { font-size: 10px; color: #6b7280; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-size: 12px; font-weight: 600; color: #1f2937; }
          .project-links a, .cert-link a, .contact-item a { color: #64748b; text-decoration: none; font-size: 10px; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }
          
          .custom-field { margin-bottom: 0.5rem; }
          .custom-field-title { font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .custom-content { font-size: 15px; color: #4b5563; line-height: 1; }`
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
        sectionSpacing: 1,
        fontFamily: 'Arial'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume modern-executive" itemscope itemtype="http://schema.org/Person">
            <header class="header">
              <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
              {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

              <div class="title-line"></div>
               <div class="contact-info secondaryFont">
                 <span class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</span>
                 {{#if personalInfo.phone}}<span class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</span>{{/if}}
                 {{#if personalInfo.address}}<span class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</span>{{/if}}
                 {{#if personalInfo.website}}<span class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span>{{/if}}
                 {{#if personalInfo.linkedin}}<span class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
                 {{#if personalInfo.github}}<span class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
               </div>
            </header>
            
            {{#if summary}}
            <section class="executive-summary secondaryFont">
              <h3 class="primaryFont">Executive Summary</h3>
              <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
              <h3 class="primaryFont">Core Competencies</h3>
              {{#each skills}}
              <div class="skill-category">
                <div class="skill-category-title primaryFont">{{category}}</div>
                <div class="skill-items">
                  {{#each items}}<span class="skill-item secondaryFont" data-level="{{level}}">{{name}}</span>{{/each}}
                </div>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="experience secondaryFont">
              <h3 class="primaryFont">Professional Experience</h3>
              {{#each workExperience}}
              <div class="position" itemscope itemtype="http://schema.org/JobPosting">
                <div class="position-header">
                  <div class="position-title">
                    <div class="job-title primaryFont" itemprop="title">{{jobTitle}}</div>
                     <div class="company-info">
                       <span class="company secondaryFont" itemprop="hiringOrganization">{{company}}</span>
                       {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">| {{location}}</span>{{/if}}
                     </div>
                  </div>
                   <div class="job-dates secondaryFont">
                     <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                     {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                   </div>
                </div>
                {{#if description}}<div class="description secondaryFont" itemprop="description">{{{description}}}</div>{{/if}}
                {{#if achievements}}
                <ul class="achievements secondaryFont">
                  {{#each achievements}}<li>{{this}}</li>{{/each}}
                </ul>
                {{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="projects">
              <h3 class="primaryFont">Key Projects</h3>
              {{#each projects}}
              <div class="project-item">
                <div class="project-name primaryFont">{{name}}</div>
                {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="technologies secondaryFont">
                  <strong class="primaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag secondaryFont">{{this}}</span>{{/each}}
                </div>
                {{/if}}
                 {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                 {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if achievements}}
            <section class="achievements-section secondaryFont">
              <h3 class="primaryFont">Achievements & Awards</h3>
              {{#each achievements}}
              <div class="achievement-item">
                {{#if title}}<div class="achievement-title primaryFont">{{title}}</div>{{/if}}
                {{#if description}}<p class="achievement-description secondaryFont">{{description}}</p>{{/if}}
                 {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                 {{#if issuer}}<div class="achievement-issuer secondaryFont"><span class="issuer">{{issuer}}</span></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if education}}
            <section class="education">
              <h3 class="primaryFont">Education</h3>
              {{#each education}}
              <div class="edu-entry" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="edu-header">
                    <div class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</div>
                   <div class="edu-meta">
                     <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                     {{#if location}}<span class="location secondaryFont">| {{location}}</span>{{/if}}
                   </div>
                   <div class="edu-dates secondaryFont">
                     {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                     {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                   </div>
                </div>
                {{#if gpa}}<p class="gpa secondaryFont">GPA: {{gpa}}</p>{{/if}}
                {{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if certifications}}
            <section class="certifications">
              <h3 class="primaryFont">Professional Certifications</h3>
              {{#each certifications}}
              <div class="cert-item">
                 <span class="cert-meta">
                   <strong class="cert-name secondaryFont">{{name}}</strong>
                   <span class="issuer secondaryFont">{{issuer}}</span>
                   {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}
                   
                 {{#if expiryDate}}<span class="cert-expiry secondaryFont"> - {{formatDate expiryDate}}</span>{{/if}}
                   </span>{{/if}}
                 </span>
                 {{#if credentialId}}<div class="cert-id secondaryFont">Credential ID: {{credentialId}}</div>{{/if}}
                 {{#if url}}<div class="cert-link secondaryFont">Credential URL: <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if languages}}
            <section class="languages">
              <h3 class="primaryFont">Languages</h3>
              {{#each languages}}
               <div class="language-item">
                 <span class="language-name secondaryFont">{{name}}</span>
                 <span class="language-level secondaryFont">{{proficiency}}</span>
               </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if customFields}}
            <section class="custom-fields">
              {{#each customFields}}
               <div class="custom-field">
                 <div class="custom-field-title primaryFont">{{title}}</div>
                 <div class="custom-content secondaryFont">{{content}}</div>
               </div>
              {{/each}}
            </section>
            {{/if}}
          </article>`,
      css: `.resume.modern-executive { font-family: 'Calibri', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #374151; font-size: 15px; line-height: 1; }
          .header { text-align: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
          .name { font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; letter-spacing: 0.5px; }
          .title-line { width: 40px; height: 2px; background: #f59e0b; margin: 0 auto 0.5rem; }
           .contact-info { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; color: #6b7280; }
           .contact-info a { color: #6b7280; text-decoration: none; }
           section { margin-top: 1rem; }
           h3 { font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; position: relative; padding-bottom: 0.25rem; }
           h3::after { content: ''; position: absolute; bottom: 0; left: 0; width: 30px; height: 2px; background: #f59e0b; }
           .executive-summary .summary { line-height: 1; color: #4b5563; font-style: italic; text-align: justify; }
          .position, .edu-entry, .project-item, .achievement-item { margin-bottom: 0.5rem; }
          .position-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem; }
          .position-title, .edu-degree, .project-name, .achievement-title { font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .company-info, .edu-meta { display: flex; gap: 8px; color: #6b7280; }
          .dates { color: #9ca3af; font-weight: 500; }
          .description { margin-bottom: 0.25rem; color: #4b5563; line-height: 1; }
          .achievements { margin-bottom: 0.25rem; }
          .achievements li { margin-bottom: 0.125rem; color: #4b5563; }
          
          /* General list styling for HTML content in descriptions */
          ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
          ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; }
          ul { list-style-type: disc; }
          ol { list-style-type: decimal; }
          .gpa { color: #6b7280; margin-bottom: 0.25rem; }
          .skill-category { margin-bottom: 0.5rem; }
          .skill-category-title { font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .skill-items { display: flex; flex-wrap: wrap; gap: 3px; }
          .skill-item { background: #f59e0b; color: white; padding: 2px 4px; border-radius: 2px; }
          .skill-item[data-level="expert"] { background: #374151; }
          .skill-item[data-level="advanced"] { background: #374151; }
          .skill-item[data-level="intermediate"] { background: #374151; }
          .skill-item[data-level="beginner"] { background: #374151; }
          .technologies { display: flex; flex-wrap: wrap; gap: 2px; margin-top: 0.25rem; }
          .tech-tag { background: #374151; color: white; padding: 1px 3px; border-radius: 2px; }
          .project-links { margin-top: 0.25rem; }
          .project-links a { color: #f59e0b; text-decoration: none; margin-right: 8px; }
          .achievement-date { color: #6b7280; font-style: italic; margin-top: 0.25rem; }
          .achievement-issuer { color: #6b7280; margin-top: 0.125rem; }
          .cert-item { margin-bottom: 0.5rem; }
          .cert-meta { display: flex; gap: 8px; color: #6b7280; margin-bottom: 0.25rem; }
          .cert-expiry, .cert-id { color: #6b7280; margin-bottom: 0.125rem; }
          .cert-link a { color: #f59e0b; text-decoration: none; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
          .language-name { color: #1f2937; }
          .language-level { color: #6b7280; text-transform: capitalize; }
          .custom-field { margin-bottom: 0.5rem; }
          .custom-field-title { font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .custom-content { color: #4b5563; line-height: 1; }
          
          /* Additional unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #6b7280; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: 600; color: #1f2937; }
          .project-links a, .cert-link a, .contact-item a { color: #f59e0b; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
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
        sectionSpacing: 1,
        fontFamily: 'Arial'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume modern-tech" itemscope itemtype="http://schema.org/Person">
            <header class="tech-header">
              <div class="header-left">
                <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
                {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

                <div class="contact-info secondaryFont">
                  {{#if personalInfo.email}}<div class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</div>{{/if}}
                  {{#if personalInfo.phone}}<div class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
                  {{#if personalInfo.address}}<div class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</div>{{/if}}
                  {{#if personalInfo.website}}<div class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
                  {{#if personalInfo.linkedin}}<div class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
                  {{#if personalInfo.github}}<div class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
                </div>
              </div>
            </header>
            
            {{#if summary}}
            <section class="summary-section">
              <h3 class="primaryFont">Summary</h3>
              <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills-section">
              <h3 class="primaryFont">Technical Skills</h3>
              {{#each skills}}
              <div class="skill-category">
                <div class="skill-category-title primaryFont">{{category}}</div>
                <div class="skill-items">
                  {{#each items}}<span class="skill-item secondaryFont" data-level="{{level}}">{{name}}</span>{{/each}}
                </div>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="experience-section">
              <h3 class="primaryFont">Professional Experience</h3>
              {{#each workExperience}}
              <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
                <div class="job-header">
                  <div class="job-title primaryFont" itemprop="title">{{jobTitle}}</div>
                  <div class="company secondaryFont" itemprop="hiringOrganization">{{company}}</div>
                  <div class="job-dates secondaryFont">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                    {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if location}}<div class="location secondaryFont" itemprop="jobLocation">{{location}}</div>{{/if}}
                {{#if description}}<div class="job-description secondaryFont" itemprop="description">{{{description}}}</div>{{/if}}
                {{#if achievements}}
                <ul class="achievements secondaryFont">
                  {{#each achievements}}<li>{{this}}</li>{{/each}}
                </ul>
                {{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="projects-section">
              <h3 class="primaryFont">Key Projects</h3>
              {{#each projects}}
              <div class="project-item">
                <div class="project-name primaryFont">{{name}}</div>
                {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="technologies">
                  <strong class="primaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag secondaryFont">{{this}}</span>{{/each}}
                </div>
                {{/if}}
                {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
                {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if education}}
            <section class="education-section">
              <h3 class="primaryFont">Education</h3>
              {{#each education}}
              <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="edu-header">
                    <div class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</div>
                  <div class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</div>
                  <div class="edu-dates secondaryFont">
                    {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if location}}<div class="location secondaryFont">{{location}}</div>{{/if}}
                {{#if gpa}}<div class="gpa secondaryFont">GPA: {{gpa}}</div>{{/if}}
                {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if achievements}}
            <section class="achievements-section secondaryFont">
              <h3 class="primaryFont">Achievements & Awards</h3>
              {{#each achievements}}
              <div class="achievement-item">
                {{#if title}}<div class="achievement-title primaryFont">{{title}}</div>{{/if}}
                {{#if description}}<p class="achievement-description secondaryFont">{{{description}}}</p>{{/if}}
                {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if certifications}}
            <section class="certifications-section">
              <h3 class="primaryFont">Professional Certifications</h3>
              {{#each certifications}}
              <div class="cert-item">
                
                <span class="cert-meta">
                <span class="cert-name secondaryFont">{{name}}</span>
                  <span class="issuer secondaryFont">{{issuer}}</span>
                  {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}
                  {{#if expiryDate}}<span class="cert-expiry secondaryFont"> - {{formatDate expiryDate}}</span>{{/if}}</span>{{/if}}
                </span>
                {{#if credentialId}}<div class="cert-id secondaryFont">Credential ID: {{credentialId}}</div>{{/if}}
                {{#if url}}<div class="cert-link secondaryFont">Credential Link: <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if languages}}
            <section class="languages-section">
              <h3 class="primaryFont">Languages</h3>
              {{#each languages}}
              <div class="language-item">
                <span class="language-name secondaryFont">{{name}}</span>
                <span class="language-level secondaryFont">{{proficiency}}</span>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if customFields}}
            <section class="custom-fields-section">
              {{#each customFields}}
              <div class="custom-field">
                <div class="custom-field-title primaryFont">{{title}}</div>
                <div class="custom-content secondaryFont">{{content}}</div>
              </div>
              {{/each}}
            </section>
            {{/if}}
          </article>`,
      css: `.resume.modern-tech { font-family: 'Roboto', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; line-height: 1; }
          .tech-header { display: grid; grid-template-columns: 2fr 1fr; gap: 1.2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3BC1A8; }
          .name { font-size: 18px; font-weight: 700; color: #3BC1A8; margin-bottom: 0.5rem; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 0.6rem; }
          .contact-item { color: #64748b; padding: 0.2rem 0.4rem; background: #f1f5f9; border-radius: 3px; }
          .contact-item a { color: #64748b; text-decoration: none; }
          section { margin-top: 1rem; }
          h3 { font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 2px solid #3BC1A8; }
          .summary-section p { line-height: 1; color: #4b5563; }
          .skill-category { margin-bottom: 0.5rem; }
          .skill-category-title { font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .skill-items { display: flex; flex-wrap: wrap; gap: 0.3rem; }
          .skill-item { background: #3BC1A8; color: white; padding: 0.2rem 0.4rem; border-radius: 3px; }
          .skill-item[data-level="expert"] { background: #005461; }
          .skill-item[data-level="advanced"] { background: #0C7779; }
          .skill-item[data-level="intermediate"] { background: #249E94; }
          .skill-item[data-level="beginner"] { background: #3BC1A8; }
          .job-item, .project-item, .edu-item, .achievement-item, .cert-item { margin-bottom: 0.5rem; padding: 0.6rem; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3BC1A8; }
          .job-header, .edu-header { display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.6rem; margin-bottom: 0.25rem; }
          .job-title, .edu-degree, .project-name, .achievement-title, .cert-name { font-weight: 600; color: #1f2937; }
          .company, .institution { color: #3BC1A8; font-weight: 500; }
          .job-dates, .edu-dates { color: #64748b; text-align: right; }
          .location { color: #6b7280; margin-bottom: 0.25rem; }
          .job-description, .edu-description { color: #4b5563; margin-bottom: 0.25rem; }
          .achievements { margin-bottom: 0.25rem;}
          .achievements li { margin-bottom: 0.125rem; color: #4b5563; }
          .achievement-description { color: #4b5563; margin-bottom: 0.25rem; line-height: 1.3; }
          
          /* General list styling for HTML content in descriptions */
          ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
          ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; }
          ul { list-style-type: disc; }
          ol { list-style-type: decimal; }
          .gpa { color: #6b7280; margin-bottom: 0.25rem; }
          .technologies { display: flex; flex-wrap: wrap; gap: 0.2rem; margin-top: 0.25rem; }
          .tech-tag { background: #0C7779; color: white; padding: 0.1rem 0.3rem; border-radius: 2px; }
          .project-links { margin-top: 0.25rem; margin-bottom: 0.25rem; }
          .project-links a { color: #249E94; text-decoration: none; margin-right: 0.6rem; }
          .project-dates { color: #6b7280; margin-top: 0.25rem; margin-bottom: 0.25rem; font-style: italic; }
          .achievement-date { color: #6b7280; font-style: italic; margin-top: 0.25rem; margin-bottom: 0.25rem; }
          .achievement-issuer { color: #6b7280; margin-top: 0.125rem; margin-bottom: 0.25rem; }
          .cert-meta { display: flex; gap: 0.6rem; color: #6b7280; margin-bottom: 0.25rem; }
          .cert-expiry, .cert-id { color: #6b7280; margin-bottom: 0.25rem; }
          .cert-link a { color: #249E94; text-decoration: none; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
          .language-name { color: #1f2937; }
          .language-level { color: #6b7280; text-transform: capitalize; }
          .custom-field { margin-bottom: 0.5rem; }
          .custom-field-title { font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; }
          .custom-content { color: #4b5563; line-height: 1; }
          
          /* Additional unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #6b7280; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: 600; color: #1f2937; }
          .project-links a, .cert-link a, .contact-item a { color: #249E94; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
    },
    creator: null,
    tags: ['modern', 'tech', 'developer', 'clean']
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
        sectionSpacing: 1,
        fontFamily: 'Arial'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume dark-mode-dev" itemscope itemtype="http://schema.org/Person">
            <div class="main-column">
              <header class="header">
                <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
                {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

                <div class="contact-info secondaryFont">
                  <div class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</div>
                  {{#if personalInfo.phone}}<div class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
                  {{#if personalInfo.address}}<div class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</div>{{/if}}
                  {{#if personalInfo.website}}<div class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
                  {{#if personalInfo.linkedin}}<div class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
                  {{#if personalInfo.github}}<div class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
                </div>
              </header>
              
              {{#if summary}}
              <section class="summary secondaryFont">
                <h3 class="primaryFont">Summary</h3>
                <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
              </section>
              {{/if}}
              
              {{#if skills}}
              <section class="skills secondaryFont">
                <h3 class="primaryFont">Technical Skills</h3>
                {{#each skills}}
                <div class="skill-category">
                  <strong class="skill-category-title secondaryFont">{{category}}</strong>
                  <div class="skill-items secondaryFont">
                    {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
                  </div>
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if workExperience}}
              <section class="work-experience secondaryFont">
                <h3 class="primaryFont">Professional Experience</h3>
                {{#each workExperience}}
                <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
                  <div class="job-header">
                    <strong class="job-title secondaryFont" itemprop="title">{{jobTitle}}</strong>
                    <div class="job-meta">
                      <strong class="company secondaryFont" itemprop="hiringOrganization">{{company}}</strong>
                      {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">{{location}}</span>{{/if}}
                    </div>
                    <div class="job-dates secondaryFont">
                      <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                      {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                    </div>
                  </div>
                  {{#if description}}<div class="job-description secondaryFont" itemprop="description">{{{description}}}</div>{{/if}}
                  {{#if achievements}}
                  <ul class="achievements secondaryFont">
                    {{#each achievements}}<li>{{this}}</li>{{/each}}
                  </ul>
                  {{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if projects}}
              <section class="projects secondaryFont">
                <h3 class="primaryFont">Key Projects</h3>
                {{#each projects}}
                <div class="project-item">
                  <strong class="project-name secondaryFont">{{name}}</strong>
                  {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                  {{#if technologies}}
                  <div class="technologies">
                    <strong class="secondaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag secondaryFont">{{this}}</span>{{/each}}
                  </div>
                  {{/if}}
                  {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                  {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
                  {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
            </div>
            
            <div class="sidebar">
            {{#if personalInfo.isAddPhoto}} 
                {{#if personalInfo.profilePicture}}
                <div class="profile-image-container">
                <img alt="Profile picture of user" class="profile-image" src="{{personalInfo.profilePicture}}"/>
                </div>
                {{/if}}
                {{/if}}
                
              {{#if education}}
              <section class="education secondaryFont">
                <h3 class="primaryFont">Education</h3>
                {{#each education}}
                <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                  <div class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</div>
                  <div class="edu-meta">
                    <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                    {{#if location}}<span class="location secondaryFont"> • {{location}}</span>{{/if}}
                    <span class="edu-dates secondaryFont">
                      • {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                      {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                    </span>
                    {{#if gpa}}<span class="gpa secondaryFont"> • GPA: {{gpa}}</span>{{/if}}
                  </div>
                  {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if certifications}}
              <section class="certifications secondaryFont">
                <h3 class="primaryFont">Certifications</h3>
                {{#each certifications}}
                <div class="cert-item">
                  <strong class="cert-name secondaryFont">{{name}}</strong>
                  <div class="cert-meta">
                    <span class="issuer secondaryFont">{{issuer}}</span>
                    {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}
                  {{#if expiryDate}}<span class="cert-expiry secondaryFont"> -  {{formatDate expiryDate}}</span>{{/if}}
                  </span>{{/if}}
                  </div>
                  {{#if credentialId}}<div class="cert-id secondaryFont">Credential ID: {{credentialId}}</div>{{/if}}
                  {{#if url}}<div class="cert-link secondaryFont">Credential URL: <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if achievements}}
              <section class="achievements secondaryFont">
                <h3 class="primaryFont">Achievements & Awards</h3>
                {{#each achievements}}
                <div class="achievement-item">
                  {{#if title}}<strong class="achievement-title secondaryFont">{{title}}</strong>{{/if}}
                  {{#if description}}<div class="achievement-description secondaryFont">{{{description}}}</div>{{/if}}
                  {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                  {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if languages}}
              <section class="languages secondaryFont">
                <h3 class="primaryFont">Languages</h3>
                {{#each languages}}
                <div class="language-item">
                  <span class="language-name secondaryFont">{{name}}</span>
                  <span class="language-level secondaryFont">{{proficiency}}</span>
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if customFields}}
              <section class="custom-fields">
                {{#each customFields}}
                <div class="custom-field-item">
                  <h3 class="custom-field-title primaryFont">{{title}}</h3>
                  <div class="custom-content secondaryFont">{{content}}</div>
                </div>
                {{/each}}
              </section>
              {{/if}}
            </div>
          </article>`,
      css: `.resume.dark-mode-dev { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; line-height: 1.4; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; width: 100%; overflow: hidden; box-sizing: border-box; }
          .header { grid-column: 1 / -1; text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #38bdf8; width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; }
          .main-column { width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; }
          .sidebar { width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; }
          .name { font-weight: 600; color: #38bdf8; margin-bottom: 8px; text-shadow: 0 0 10px rgba(56, 189, 248, 0.3); }
          .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; color: #a855f7; width: 100%; max-width: 100%; overflow: hidden; }
          .contact-item { color: #1f2937; flex: 0 1 auto; min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .contact-item a { color: #38bdf8; text-decoration: none; }
          .contact-item a:hover { text-decoration: underline; text-shadow: 0 0 5px rgba(56, 189, 248, 0.5); }
          section { margin-bottom: 15px; }
          .sidebar { padding-left: 15px; padding-right: 10px; width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; }
          .sidebar section { margin-bottom: 12px; }
          .sidebar h3 { margin-bottom: 4px; padding-bottom: 2px; }
          h3 { font-weight: 600; color: #38bdf8; margin-bottom: 2px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
          .job-item, .edu-item, .project-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
          .job-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
          .job-title, .edu-degree { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
          .job-meta, .edu-meta { color: #6b7280; }
          .job-dates, .edu-dates { color: #64748b; font-weight: 500; }
          .edu-item { margin-bottom: 8px; }
          .edu-degree { margin-bottom: 3px; }
          .edu-meta { line-height: 1.3; }
          .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; }
          .achievements { margin: 4px 0; }
          .achievements li { margin-bottom: 2px; color: #4b5563; }
          
          /* General list styling for HTML content in descriptions */
          ul, ol { margin: 4px 0; padding-left: 1rem; }
          ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
          ul { list-style-type: disc; }
          ol { list-style-type: decimal; }
          
          .skill-category { margin-bottom: 8px; }
          .skill-category-title { font-weight: 600; color: #1f2937; margin-bottom: 3px; }
          .skill-items { color: #4b5563; line-height: 1.4; }
          .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; background: #0ea5e9; color: white; padding: 1px 4px; border-radius: 2px; }
          .project-name { font-weight: 600; color: #1f2937; margin-bottom: 3px; }
          .technologies { margin: 4px 0; color: #6b7280; }
          .tech-tag { background: #a855f7; color: white !important; 
            padding: 2px 6px !important; 
            border-radius: 4px !important; 
            margin-right: 4px !important; 
            margin-bottom: 2px !important; 
            display: inline-block !important; 
            font-size: 10px !important; 
            font-weight: 500 !important; 
            text-decoration: none !important; }
          .project-links { margin: 3px 0; }
          .project-links a { color: #38bdf8; text-decoration: none; }
          .project-links a:hover { text-decoration: underline; }
          .project-dates { color: #64748b; margin-top: 2px; }
          .cert-name { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
          .cert-meta { color: #6b7280; margin-bottom: 2px; }
          .cert-expiry, .cert-id { color: #64748b; margin: 1px 0; }
          .cert-link a { color: #38bdf8; text-decoration: none; }
          .cert-link a:hover { text-decoration: underline; }
          .achievement-title { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
          .achievement-date, .achievement-issuer { color: #64748b; margin: 1px 0; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .language-name { color: #1f2937; }
          .language-level { color: #64748b; }
          .custom-field-item { margin-bottom: 10px; }
          .custom-content { color: #4b5563; line-height: 1.4; }
          .gpa { color: #6b7280; margin: 2px 0; }
          
          /* Sidebar specific padding and text wrapping */
          .sidebar .edu-item, .sidebar .cert-item, .sidebar .achievement-item, .sidebar .language-item, .sidebar .custom-field-item {
            padding-right: 5px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .sidebar .institution, .sidebar .issuer, .sidebar .achievement-issuer {
            word-wrap: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
          }
          .sidebar .edu-dates, .sidebar .cert-dates, .sidebar .achievement-date {
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #64748b; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
          .project-links a, .cert-link a, .contact-item a { color: #38bdf8; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }

          
          
                        .profile-image-container {
                            display: flex;
                            justify-content: center;
                            margin-bottom: 1rem;
                            }
                        .profile-image {
                            width: 10rem;height: 10rem;border-radius: 9999px;border: 4px solid white;
            object-fit: cover;
          }
          
          /* A4 Page Constraints - Ensure all content fits within A4 boundaries */
          * { box-sizing: border-box; }
          .resume.dark-mode-dev * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }
          .sidebar * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }
          .main-column * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }`
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
        sectionSpacing: 1,
        fontFamily: 'Arial'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume elegant-minimal" itemscope itemtype="http://schema.org/Person">
            <header class="header">
              <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
              {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

              <div class="contact-info secondaryFont">
                <div class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</div>
                {{#if personalInfo.phone}}<div class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
                {{#if personalInfo.address}}<div class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</div>{{/if}}
                {{#if personalInfo.website}}<div class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
                {{#if personalInfo.linkedin}}<div class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
                {{#if personalInfo.github}}<div class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
              </div>
            </header>
            
            {{#if summary}}
            <section class="summary">
              <h2 class="primaryFont">Summary</h2>
              <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
              <h2 class="primaryFont">Skills & Expertise</h2>
              {{#each skills}}
              <div class="skill-category">
                <div class="skill-category-title primaryFont">{{category}}</div>
                <div class="skill-items secondaryFont">
                  {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
                </div>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="work-experience">
              <h2 class="primaryFont">Professional Experience</h2>
              {{#each workExperience}}
              <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
                <div class="job-header">
                    <div class="job-title primaryFont" itemprop="title">{{jobTitle}}</div>
                  <div class="job-meta">
                    <span class="company secondaryFont" itemprop="hiringOrganization">{{company}}</span>
                    {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">{{location}}</span>{{/if}}
                  </div>
                  <div class="job-dates secondaryFont">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                    {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if description}}<div class="job-description secondaryFont" itemprop="description">{{{description}}}</div>{{/if}}
                {{#if achievements}}
                <ul class="achievements secondaryFont">
                  {{#each achievements}}<li>{{this}}</li>{{/each}}
                </ul>
                {{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="projects">
              <h2 class="primaryFont">Key Projects</h2>
              {{#each projects}}
              <div class="project-item">
                <div class="project-header">
                  <div class="project-name primaryFont">{{name}}</div>
                  {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                </div>
                {{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="technologies">
                  <strong class="primaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag secondaryFont">{{this}}</span>{{/each}}
                </div>
                {{/if}}
                {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if education}}
            <section class="education">
              <h2 class="primaryFont">Education</h2>
              {{#each education}}
              <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="edu-header">
                    <div class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</div>
                  <div class="edu-meta">
                    <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                    {{#if location}}<span class="location secondaryFont">{{location}}</span>{{/if}}
                  </div>
                  <div class="edu-dates secondaryFont">
                    {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if gpa}}<p class="gpa secondaryFont">GPA: {{gpa}}</p>{{/if}}
                {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if certifications}}
            <section class="certifications">
              <h2 class="primaryFont">Professional Certifications</h2>
              {{#each certifications}}
              <div class="cert-item">
                <div class="cert-meta">
                  <strong class="cert-name secondaryFont">{{name}}</strong>
                  <span class="issuer secondaryFont">{{issuer}}</span>
                  {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}
                  {{#if expiryDate}}<span class="cert-expiry secondaryFont"> -  {{formatDate expiryDate}}</span>{{/if}}
                  </span>{{/if}}
                </div>
                {{#if credentialId}}<div class="cert-id secondaryFont">CredentialID: {{credentialId}}</div>{{/if}}
                {{#if url}}<div class="cert-link secondaryFont">Credential URL: <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if achievements}}
            <section class="achievements">
              <h2 class="primaryFont">Achievements & Awards</h2>
              {{#each achievements}}
              <div class="achievement-item">
                {{#if title}}<div class="achievement-title primaryFont">{{title}}</div>{{/if}}
                {{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if languages}}
            <section class="languages">
              <h2 class="primaryFont">Languages</h2>
              {{#each languages}}
              <div class="language-item">
                <span class="language-name secondaryFont">{{name}}</span>
                <span class="language-level secondaryFont">{{proficiency}}</span>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if customFields}}
            <section class="custom-fields">
              {{#each customFields}}
              <div class="custom-field-item">
                <h2 class="custom-field-title primaryFont">{{title}}</h2>
                <div class="custom-content secondaryFont">{{content}}</div>
              </div>
              {{/each}}
            </section>
            {{/if}}
          </article>`,
      css: `.resume.elegant-minimal { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #111827; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
          .name { font-weight: 600; color: #374151; margin-bottom: 8px;}
          .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; color: #9ca3af; }
          .contact-item { color: #111827; }
          .contact-item a { color: #10b981; text-decoration: none; }
          .contact-item a:hover { text-decoration: underline; }
          section { margin-bottom: 15px; }
          h2 { font-weight: 600; color: #10b981; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.4px; }
          .job-item, .edu-item, .project-item, .cert-item, .achievement-item { margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #f3f4f6; }
          .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
          .job-title, .edu-degree { font-weight: 600; color: #111827; margin-bottom: 2px; }
          .job-meta, .edu-meta { color: #6b7280; }
          .job-dates, .edu-dates { color: #9ca3af; font-weight: 500; }
          .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
          .achievements { margin: 4px 0; }
          .achievements li { margin-bottom: 2px; color: #4b5563; }
          
          /* General list styling for HTML content in descriptions */
          ul, ol { margin: 4px 0; padding-left: 1rem; }
          ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
          ul { list-style-type: disc; }
          ol { list-style-type: decimal; }
          
          .skill-category { margin-bottom: 8px; }
          .skill-category-title { font-weight: 600; color: #111827; margin-bottom: 3px; }
          .skill-items { color: #4b5563; line-height: 1.4; }
          .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; }
          .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
          .project-name { font-weight: 600; color: #111827; margin-bottom: 2px; }
          .project-dates { color: #9ca3af; font-weight: 500; }
          .technologies { margin: 4px 0; color: #6b7280; }
          .tech-tag { background: #f3f4f6; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
          .project-links { margin: 3px 0; }
          .project-links a { color: #10b981; text-decoration: none; }
          .project-links a:hover { text-decoration: underline; }
          .cert-name { font-weight: 600; color: #111827; margin-bottom: 2px; }
          .cert-meta { color: #6b7280; margin-bottom: 2px; }
          .cert-expiry, .cert-id { color: #9ca3af; margin: 1px 0; }
          .cert-link a { color: #10b981; text-decoration: none; }
          .cert-link a:hover { text-decoration: underline; }
          .achievement-title { font-weight: 600; color: #111827; margin-bottom: 2px; }
          .achievement-date, .achievement-issuer { color: #9ca3af; margin: 1px 0; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .language-name { color: #111827; }
          .language-level { color: #9ca3af; }
          .custom-field-item { margin-bottom: 10px; }
          .custom-content { color: #4b5563; line-height: 1.4; }
          .gpa { color: #6b7280; margin: 2px 0; }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #9ca3af; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #111827; }
          .project-links a, .cert-link a, .contact-item a { color: #10b981; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
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
        text: '#000000',
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
        sectionSpacing: 1,
        fontFamily: 'Arial'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume bold-accent" itemscope itemtype="http://schema.org/Person">
            <header class="header">
              <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
              {{#unless isFresher}}
  <h2 class="name primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

              <div class="contact-info secondaryFont">
                <div class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</div>
                {{#if personalInfo.phone}}<div class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
                {{#if personalInfo.address}}<div class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</div>{{/if}}
                {{#if personalInfo.website}}<div class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
                {{#if personalInfo.linkedin}}<div class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
                {{#if personalInfo.github}}<div class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
              </div>
            </header>
            
            {{#if summary}}
            <section class="summary">
              <h2 class="primaryFont">Profile Summary</h2>
              <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
              <h2 class="primaryFont">Core Skills</h2>
              {{#each skills}}
              <div class="skill-category">
                <div class="skill-category-title primaryFont">{{category}}</div>
                <div class="skill-items secondaryFont">
                  {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
                </div>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="work-experience">
              <h2 class="primaryFont">Professional Experience</h2>
              {{#each workExperience}}
              <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
                <div class="job-header">
                    <div class="job-title primaryFont" itemprop="title">{{jobTitle}}</div>
                  <div class="job-meta">
                    <span class="company secondaryFont" itemprop="hiringOrganization">{{company}}</span>
                    {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">{{location}}</span>{{/if}}
                  </div>
                  <div class="job-dates secondaryFont">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                    {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if description}}<div class="job-description secondaryFont" itemprop="description">{{{description}}}</div>{{/if}}
                {{#if achievements}}
                <ul class="achievements secondaryFont">
                  {{#each achievements}}<li>{{this}}</li>{{/each}}
                </ul>
                {{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="projects">
              <h2 class="primaryFont">Key Projects</h2>
              {{#each projects}}
              <div class="project-item">
                <div class="project-header">
                  <div class="project-name primaryFont">{{name}}</div>
                  {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                </div>
                {{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="technologies">
                  <strong class="primaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag secondaryFont">{{this}}</span>{{/each}}
                </div>
                {{/if}}
                {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if education}}
            <section class="education">
              <h2 class="primaryFont">Education</h2>
              {{#each education}}
              <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="edu-header">
                    <div class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</div>
                  <div class="edu-meta">
                    <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                    {{#if location}}<span class="location secondaryFont">{{location}}</span>{{/if}}
                  </div>
                  <div class="edu-dates secondaryFont">
                    {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if gpa}}<p class="gpa secondaryFont">GPA: {{gpa}}</p>{{/if}}
                {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if certifications}}
            <section class="certifications">
              <h2 class="primaryFont">Professional Certifications</h2>
              {{#each certifications}}
              <div class="cert-item">
                <span class="cert-name secondaryFont">{{name}}</span>
                <span class="cert-meta">
                  <span class="issuer secondaryFont">{{issuer}}</span>
                  {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}
                  
                {{#if expiryDate}}<span class="cert-expiry secondaryFont"> - {{formatDate expiryDate}}</span>{{/if}}
                </span>{{/if}}
                </span>
                {{#if credentialId}}<div class="cert-id secondaryFont">Credential ID: {{credentialId}}</div>{{/if}}
                {{#if url}}<div class="cert-link secondaryFont">Credential URL: <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if achievements}}
            <section class="achievements">
              <h2 class="primaryFont">Achievements & Awards</h2>
              {{#each achievements}}
              <div class="achievement-item">
                {{#if title}}<div class="achievement-title primaryFont">{{title}}</div>{{/if}}
                {{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if languages}}
            <section class="languages">
              <h2 class="primaryFont">Languages</h2>
              {{#each languages}}
              <div class="language-item">
                <span class="language-name secondaryFont">{{name}}</span>
                <span class="language-level secondaryFont">{{proficiency}}</span>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if customFields}}
            <section class="custom-fields">
              {{#each customFields}}
              <div class="custom-field-item">
                <h3 class="custom-field-title primaryFont">{{title}}</h3>
                <div class="custom-content secondaryFont">{{content}}</div>
              </div>
              {{/each}}
            </section>
            {{/if}}
          </article>`,
      css: `.resume.bold-accent { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 5px; background: white; color: #1f2937; line-height: 1.4; padding: 0; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 16px 20px; margin-bottom: 12px; }
          .name { font-weight: 700; margin-bottom: 6px; letter-spacing: -0.5px; color: white; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 12px; color: rgba(255, 255, 255, 0.9); line-height: 1.4; }
          .contact-item { color: rgba(255, 255, 255, 0.9); }
          .contact-item a { color: white; text-decoration: none; }
          .contact-item a:hover { text-decoration: underline; }
          section { margin-bottom: 12px; padding: 0 20px; }
          h2 { font-weight: 600; color: #2563eb; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; position: relative; }
          h2::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 20px; height: 2px; background: #2563eb; }
          .job-item, .edu-item, .project-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
          .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
          .job-title, .edu-degree { font-weight: 600; color: #1f2937; margin-bottom: 2px; font-size: 12px; }
          .job-meta, .edu-meta { color: #6b7280; font-weight: 500; margin-bottom: 2px; }
          .job-dates, .edu-dates { color: #9ca3af; font-weight: 500; text-align: right; }
          .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
          .achievements { margin: 4px 0;}
          .achievements li { margin-bottom: 2px; color: #4b5563; }
          
          /* General list styling for HTML content in descriptions */
          ul, ol { margin: 4px 0; padding-left: 1rem; }
          ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
          ul { list-style-type: disc; }
          ol { list-style-type: decimal; }
          
          .skill-category { margin-bottom: 8px; }
          .skill-category-title { font-weight: 600; color: #1f2937; margin-bottom: 3px; }
          .skill-items { color: #4b5563; line-height: 1.4; }
          .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; }
          .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
          .project-name { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
          .project-dates { color: #9ca3af; font-weight: 500; }
          .technologies { margin: 4px 0; color: #6b7280; }
          .tech-tag { background: #f3f4f6; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
          .project-links { margin: 3px 0; }
          .project-links a { color: #4b5563; text-decoration: none; }
          .project-links a:hover { text-decoration: none; }
          .cert-name { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
          .cert-meta { color: #6b7280; margin-bottom: 2px; }
          .cert-expiry, .cert-id { color: #6b7280; margin: 2px 0; }
          .cert-link a { color: #6b7280; text-decoration: none; }
          .cert-link a:hover { text-decoration: underline; }
          .achievement-title { font-weight: 600; color: #1f2937; margin-bottom: 2px; font-size: 12px; }
          .achievement-date, .achievement-issuer { color: #9ca3af; margin: 1px 0; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .language-name { color: #1f2937; }
          .language-level { color: #9ca3af; }
          .custom-field-item { margin-bottom: 10px; }
          .custom-content { color: #4b5563; line-height: 1.4; }
          .gpa { color: #6b7280; margin: 4px 0; }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #9ca3af; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
          .project-links a, .cert-link a { color: #4b5563; text-decoration: none; }
          .header .contact-item a { color: white; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: none; }`
    },
    creator: null,
    tags: ['bold', 'modern', 'accent', 'colorful', 'single-column', 'blue']
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
      "html": `<article class="resume fresh-gradient" itemscope itemtype="http://schema.org/Person">
            <header class="header">
            {{#if personalInfo.isAddPhoto}}
            {{#if personalInfo.profilePicture}}
            <div class="left-column">
                <div class="profile-image-container">
                <img alt="Profile picture of user" class="profile-image" src="{{personalInfo.profilePicture}}"/>
                </div>
                </div>
                {{/if}}
            {{/if}}
            <div class="right-column">
              <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
              {{#unless isFresher}}
  <h2 class="name primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

              <div class="contact-info secondaryFont">
              <div class="contact-grid">
                <div class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</div>
                {{#if personalInfo.phone}}<div class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
                {{#if personalInfo.address}}<div class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</div>{{/if}}
                {{#if personalInfo.website}}<div class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></div>{{/if}}
                {{#if personalInfo.linkedin}}<div class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
                {{#if personalInfo.github}}<div class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
              </div>
              </div>
            </header>
            
            {{#if summary}}
            <section class="summary">
              <h2 class="primaryFont">Profile Summary</h2>
              <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
              <h2 class="primaryFont">Core Skills</h2>
              {{#each skills}}
              <div class="skill-category">
                <strong class="skill-category-title secondaryFont">{{category}}</strong>
                <div class="skill-items secondaryFont">
                  {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{/each}}
                </div>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="work-experience">
              <h2 class="primaryFont">Professional Experience</h2>
              {{#each workExperience}}
              <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
                <div class="job-header">
                  <strong class="job-title secondaryFont" itemprop="title">{{jobTitle}}</strong>
                  <div class="job-meta">
                    <span class="company secondaryFont" itemprop="hiringOrganization">{{company}}</span>
                    {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">{{location}}</span>{{/if}}
                  </div>
                  <div class="job-dates secondaryFont">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                    {{#if isCurrentJob}}<span>Present</span>{{else}}{{#if endDate}}<time>{{formatDate endDate}}</time>{{/if}}{{/if}}
                  </div>
                </div>
                {{#if description}}<div class="job-description secondaryFont" itemprop="description">{{{description}}}</div>{{/if}}
                {{#if achievements}}
                <ul class="achievements secondaryFont">
                  {{#each achievements}}<li>{{this}}</li>{{/each}}
                </ul>
                {{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="projects">
              <h2 class="primaryFont">Key Projects</h2>
              {{#each projects}}
              <div class="project-item">
                <div class="project-header">
                  <strong class="project-name secondaryFont">{{name}}</strong>
                  {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                </div>
                {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="technologies">
                  <strong class="secondaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag secondaryFont">{{this}}</span>{{/each}}
                </div>
                {{/if}}
                {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if education}}
            <section class="education">
              <h2 class="primaryFont">Education</h2>
              {{#each education}}
              <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="edu-header">
                  <strong class="edu-degree secondaryFont" itemprop="credentialCategory">{{degree}}</strong>
                  <div class="edu-meta">
                    <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                    {{#if location}}<span class="location secondaryFont">{{location}}</span>{{/if}}
                  </div>
                  <div class="edu-dates secondaryFont">
                    {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                  </div>
                </div>
                {{#if gpa}}<div class="gpa secondaryFont">GPA: {{gpa}}</div>{{/if}}
                {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if certifications}}
            <section class="certifications">
              <h2 class="primaryFont">Professional Certifications</h2>
              {{#each certifications}}
              <div class="cert-item">
                <strong class="cert-name secondaryFont">{{name}}</strong>
                <span class="cert-meta">
                  <span class="issuer secondaryFont">{{issuer}}</span>
                  {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}
                  
                {{#if expiryDate}}<span class="cert-expiry secondaryFont">Expires: {{formatDate expiryDate}}</span>{{/if}}</span>{{/if}}
                </span>
                {{#if credentialId}}<div class="cert-id secondaryFont">Credential ID: {{credentialId}}</div>{{/if}}
                {{#if url}}<div class="cert-link secondaryFont">Credential URL: <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if achievements}}
            <section class="achievements">
              <h2 class="primaryFont">Achievements & Awards</h2>
              {{#each achievements}}
              <div class="achievement-item">
                {{#if title}}<strong class="achievement-title secondaryFont">{{title}}</strong>{{/if}}
                {{#if description}}<div class="achievement-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if languages}}
            <section class="languages">
              <h2 class="primaryFont">Languages</h2>
              {{#each languages}}
              <div class="language-item">
                <span class="language-name secondaryFont">{{name}}</span>
                <span class="language-level secondaryFont">{{proficiency}}</span>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if customFields}}
            <section class="custom-fields">
              {{#each customFields}}
              <div class="custom-field-item">
                <h2 class="custom-field-title primaryFont">{{title}}</h2>
                <div class="custom-content secondaryFont">{{content}}</div>
              </div>
              {{/each}}
            </section>
            {{/if}}
          </article>`,
      "css": `.resume.fresh-gradient { 
            font-family: 'Arial', sans-serif; 
            max-width: 8.5in; 
            margin: 0 auto; 
            padding: 0.5in 0.35in; 
            background: #ffffff; 
            color: #111827; 
            line-height: 1.4; 
          }

          .left-column { padding-right: 5px; border-right: 2px solid #ffffff; margin-right: 5px; border-radius: 99999px; margin-bottm:1rem; }

          .contact-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 5px 5px; 
            margin: 0 auto; 
            align-items: start;
        }
        .contact-item { display: flex; flex-wrap: wrap; align-items: flex-start; padding-top:5px; text-align: left; }
        .contact-item { font-weight: 600; color: #6b7280; word-wrap: break-word; line-height: 1.2; align-self: flex-start }
          
          .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #9333ea 50%, #14b8a6 100%); 
            color: white; 
            padding: 20px; 
            margin-bottom: 20px; 
            border-radius: 12px; 
             display: flex; justify-content: space-between; align-items: center;
             gap:12px;
          }
          
          .name { 
            font-size: 24px; 
            font-weight: 700; 
            margin-bottom: 8px; 
            color: white; 
          }
          
          .contact-info { 
            display: flex; 
            flex-wrap: wrap; 
            justify-content: center; 
            gap: 12px; 
            color: rgba(255, 255, 255, 0.9); 
          }
          
          .contact-item { 
            color: rgba(255, 255, 255, 0.9); 
            font-size: 14px; 
          }
          
          .contact-item a { 
            color: white !important; 
            text-decoration: none; 
            font-weight: 500; 
          }
          
          .contact-item a:hover { 
            text-decoration: underline; 
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.5); 
          }
          
          section { 
            margin-bottom: 20px;
          }
          
          h2 { 
            color: #3b82f6; 
            font-size: 18px; 
            font-weight: 600; 
            margin-bottom: 12px; 
            padding-bottom: 6px; 
            border-bottom: 2px solid #e2e8f0; 
            position: relative; 
          }
          
          h2::after { 
            content: ''; 
            position: absolute; 
            bottom: -2px; 
            left: 0; 
            width: 30px; 
            height: 2px; 
            background: linear-gradient(90deg, #3b82f6, #9333ea); 
          }
          
          .job-item, .edu-item, .project-item, .cert-item, .achievement-item { 
            margin-bottom: 16px; 
            padding: 12px; 
            background: #f8fafc; 
            border-radius: 6px; 
            border-left: 4px solid #3b82f6; 
            transition: all 0.2s ease; 
          }
          
          .job-item:hover, .edu-item:hover, .project-item:hover, .cert-item:hover, .achievement-item:hover { 
            transform: translateY(-1px); 
          }
          
          .job-header, .edu-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 6px; 
          }
          
          .job-title, .edu-degree, .project-name, .achievement-title, .cert-name { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 4px; 
            font-size: 14px; 
          }
          
          .job-meta, .edu-meta { 
            color: #6b7280; 
            margin-bottom: 4px; 
          }
          
          .company, .institution { 
            color: #3b82f6; 
            font-weight: 500; 
          }
          
          .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates { 
            color: #9ca3af; 
            font-weight: 500; 
            font-size: 12px; 
          }
          
          .job-description, .edu-description, .project-description, .achievement-description { 
            margin: 6px 0; 
            color: #4b5563; 
            line-height: 1.5; 
          }
          
          .achievements { 
            margin: 6px 0; 
          }
          
          .achievements li { 
            margin-bottom: 3px; 
            color: #4b5563; 
            line-height: 1.4; 
          }
          
          /* General list styling for HTML content in descriptions */
          ul, ol { 
            margin: 6px 0; 
            padding-left: 1.2rem; 
          }
          
          ul li, ol li { 
            margin-bottom: 3px; 
            color: #4b5563; 
            line-height: 1.4; 
          }
          
          ul { 
            list-style-type: disc; 
          }
          
          ol { 
            list-style-type: decimal; 
          }
          
          .skill-category { 
            margin-bottom: 12px; 
          }
          
          .skill-category-title { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 6px; 
            font-size: 14px; 
          }
          
          .skill-items { 
            margin-top: 6px;
            color: #4b5563; 
            line-height: 1.2; 
          }
          
          .skill-item { 
            display: inline-block; 
            margin-right: 8px; 
            margin-bottom: 4px; 
            background: rgb(40, 78, 218); 
            color: white; 
            padding: 3px 8px; 
            border-radius: 12px; 
            font-size: 12px; 
            font-weight: 500; 
          }
          
          .skill-item[data-level="expert"] { 
            background: rgb(1, 27, 111); 
          }
          
          .skill-item[data-level="advanced"] { 
            background: rgb(15, 50, 165); 
          }
          
          .skill-item[data-level="intermediate"] { 
            background: rgb(40, 78, 218); 
          }
          
          .skill-item[data-level="beginner"] { 
            background: rgb(78, 117, 246); 
          }
          
          .project-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 6px; 
          }
          
          .technologies { 
            margin: 6px 0; 
            color: #6b7280; 
          }
          
          .tech-tag { 
            background: linear-gradient(90deg, #3b82f6, #9333ea); 
            color: white !important; 
            padding: 2px 6px !important; 
            border-radius: 4px !important; 
            margin-right: 4px !important; 
            margin-bottom: 2px !important; 
            display: inline-block !important; 
            font-size: 10px !important; 
            font-weight: 500 !important; 
            text-decoration: none !important;
          }
          
          .project-links { 
            margin: 6px 0; 
          }
          
          .project-links a { 
            color: #3b82f6; 
            text-decoration: none; 
            font-weight: 500; 
          }
          
          .project-links a:hover { 
            text-decoration: underline; 
            color: #9333ea; 
          }
          
          .cert-meta { 
            color: #6b7280; 
            margin-bottom: 4px; 
          }
          
          .cert-expiry, .cert-id { 
            color: #9ca3af; 
            margin: 2px 0; 
            font-size: 12px; 
          }
          
          .cert-link a { 
            color: #3b82f6; 
            text-decoration: none; 
            font-weight: 500; 
          }
          
          .cert-link a:hover { 
            text-decoration: underline; 
            color: #9333ea; 
          }
          
          .achievement-date, .achievement-issuer { 
            color: #9ca3af; 
            margin: 2px 0; 
            font-size: 12px; 
          }
          
          .language-item { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 6px; 
            padding: 4px 0; 
          }
          
          .language-name { 
            color: #1f2937; 
            font-weight: 500; 
          }
          
          .language-level { 
            color: #6b7280; 
            font-size: 12px; 
          }
          
          .custom-field-item { 
            margin-bottom: 12px; 
          }
          
          .custom-content { 
            color: #4b5563; 
            line-height: 1.5; 
          }
          
          .gpa { 
            color: #6b7280; 
            margin: 4px 0; 
            font-size: 12px; 
          }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { 
            color: #6b7280; 
          }
          
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { 
            font-weight: 600; 
            color: #1f2937; 
          }
          
          .project-links a, .cert-link a, .contact-item a { 
            color: #3b82f6; 
            text-decoration: none; 
          }
          
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { 
            text-decoration: underline; 
            color: #9333ea; 
          }
          
          /* Responsive design for better mobile experience */
          @media (max-width: 768px) {
            .resume.fresh-gradient { 
              padding: 0.3in 0.2in; 
            }
            
            .header { 
              padding: 16px; 
              margin-bottom: 16px; 
            }
            
            .name { 
              font-size: 20px; 
            }
            
            .contact-info { 
              gap: 8px; 
            }
            
            section { 
              padding: 12px; 
              margin-bottom: 16px; 
            }
          }`
    },
    creator: null,
    "tags": ["modern", "gradient", "colorful", "rounded"]
  },

  {
    name: 'Modern Glassmorphism',
    description: 'A cutting-edge template featuring glassmorphism design with frosted glass effects and modern aesthetics',
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
        { name: 'projects', position: 4, isRequired: false, isVisible: true },
        { name: 'education', position: 5, isRequired: false, isVisible: true },
        { name: 'skills', position: 6, isRequired: false, isVisible: true },
        { name: 'achievements', position: 7, isRequired: false, isVisible: true },
        { name: 'certifications', position: 8, isRequired: false, isVisible: true },
        { name: 'languages', position: 9, isRequired: false, isVisible: true },
        { name: 'customFields', position: 10, isRequired: false, isVisible: true }
      ]
    },
    styling: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        text: '#1e293b',
        background: '#f8fafc'
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Inter',
        sizes: { heading: 20, subheading: 16, body: 14, small: 12 }
      },
      template: {
        headerLevel: 'h3',
        headerFontSize: 18,
        fontSize: 14,
        lineSpacing: 1.5,
        sectionSpacing: 1.2,
        fontFamily: 'Inter'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume modern-glassmorphism" itemscope itemtype="http://schema.org/Person">
            <header class="header">
            <div class="header-content">
              <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
              {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

            </div>
            </header>
            
            <div class="content-wrapper">
              <div class="sidebar">
                {{#if personalInfo.email}}
                <section class="contact">
                  <h3 class="section-title primaryFont">CONTACT</h3>
                  <div class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</div>
                  {{#if personalInfo.phone}}<div class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</div>{{/if}}
                  {{#if personalInfo.address}}<div class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</div>{{/if}}
                  {{#if personalInfo.linkedin}}<div class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></div>{{/if}}
                  {{#if personalInfo.github}}<div class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></div>{{/if}}
                </section>
                {{/if}}
                
                {{#if education}}
                <section class="education">
                  <h3 class="section-title primaryFont">EDUCATION</h3>
                  {{#each education}}
                  <div class="edu-item">
                    <div class="edu-degree secondaryFont">{{degree}}</div>
                    <div class="edu-field secondaryFont">{{field}}</div>
                    <div class="institution secondaryFont">{{institution}}</div>
                    <div class="edu-dates secondaryFont">
                    {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}</div>
                    {{#if location}}<div class="location secondaryFont">{{location}}</div>{{/if}}
                  </div>
                  {{/each}}
                </section>
                {{/if}}
                
                {{#if skills}}
                <section class="skills">
                  <h3 class="section-title primaryFont">SKILLS</h3>
                  {{#each skills}}
                  <div class="skill-category">
                    <div class="skill-category-title secondaryFont">{{category}}</div>
                    <div class="skill-items secondaryFont">
                      {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}
                    </div>
                  </div>
                  {{/each}}
                </section>
                {{/if}}
                
                {{#if certifications}}
                <section class="certifications">
                  <h3 class="section-title primaryFont">CERTIFICATIONS</h3>
                  {{#each certifications}}
                  <div class="cert-item">
                    <div class="cert-name secondaryFont">{{name}}</div>
                    {{#if issuer}}<div class="issuer secondaryFont">{{issuer}}</div>{{/if}}
                    {{#if date}}<div class="cert-dates secondaryFont">{{formatDate date}}</div>{{/if}}
                    {{#if expiryDate}}<div class="cert-expiry secondaryFont">Expires: {{formatDate expiryDate}}</div>{{/if}}
                    {{#if credentialId}}<div class="cert-id secondaryFont">ID: {{credentialId}}</div>{{/if}}
                    {{#if url}}<div class="cert-link secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                  </div>
                  {{/each}}
                </section>
                {{/if}}
                
                {{#if achievements}}
                <section class="achievements">
                  <h3 class="section-title primaryFont">ACHIEVEMENTS</h3>
                  {{#each achievements}}
                  <div class="achievement-item">
                    {{#if title}}<div class="achievement-title secondaryFont">{{title}}</div>{{/if}}
                    {{#if description}}<div class="achievement-description secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                    {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
                  </div>
                  {{/each}}
                </section>
                {{/if}}
                
                {{#if languages}}
                <section class="languages">
                  <h3 class="section-title primaryFont">LANGUAGES</h3>
                  {{#each languages}}
                  <div class="language-item">
                    <span class="language-name secondaryFont">{{name}}</span>
                    <span class="language-level secondaryFont">{{proficiency}}</span>
                  </div>
                  {{/each}}
                </section>
                {{/if}}
              </div>
              
              <div class="main-content">
                {{#if workExperience}}
                <section class="work-experience">
                  <h3 class="section-title primaryFont">WORK EXPERIENCE</h3>
                  {{#each workExperience}}
                  <div class="job-item">
                    <div class="job-title secondaryFont">{{jobTitle}}</div>
                    <div class="company secondaryFont">{{company}}</div>
                    <div class="job-dates secondaryFont">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}</div>
                    {{#if location}}<div class="location secondaryFont">{{location}}</div>{{/if}}
                    {{#if description}}<div class="job-description secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if achievements}}
                    <ul class="achievements secondaryFont">
                      {{#each achievements}}<li>{{this}}</li>{{/each}}
                    </ul>
                    {{/if}}
                  </div>
                  {{/each}}
                </section>
                {{/if}}
                
                {{#if projects}}
                <section class="projects">
                  <h3 class="section-title primaryFont">PROJECTS</h3>
                  {{#each projects}}
                  <div class="project-item">
                    <div class="project-name secondaryFont">{{name}}</div>
                    {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if technologies}}
                    <div class="technologies">
                      <strong class="secondaryFont">Technologies:</strong> 
                      {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
                    </div>
                    {{/if}}
                    {{#if url}}<div class="project-links secondaryFont"><strong class="secondaryFont">URL:</strong> <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                    {{#if githubUrl}}<div class="project-links secondaryFont"><strong class="secondaryFont">GitHub:</strong> <a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
                    {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                  </div>
                  {{/each}}
                </section>
                {{/if}}
                
                {{#if customFields}}
                <section class="custom-fields">
                  {{#each customFields}}
                  <div class="custom-field-item">
                    <h3 class="custom-field-title primaryFont">{{title}}</h3>
                    <div class="custom-content secondaryFont">{{{content}}}</div>
                  </div>
                  {{/each}}
                </section>
                {{/if}}
              </div>
            </div>
          </article>`,
      css: `.resume.modern-glassmorphism { 
            font-family: 'Arial', sans-serif; 
            max-width: 8.5in; 
            margin: 0 auto; 
            padding: 0; 
            background: white; 
            color: #1f2937; 
            line-height: 1.4; 
            display: flex; 
            flex-direction: column;
            width: 100%; 
            overflow: hidden; 
            box-sizing: border-box; 
          }
          
          .header { 
            background: #0d9488; 
            color: white; 
            padding: 0.5rem;
            text-align: center; 
            font-size: 18px;
            font-weight: 700;
          }

          h1{
          font-size:2rem !important;
          }
          h2{
          font-size:1.5rem !important;
          }
          
          .title { 
            font-size: 16px; 
            font-weight: 600; 
            margin: 0; 
            color: white; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
          }
          
          .content-wrapper { 
            display: grid; 
            grid-template-columns: 1fr 2fr; 
            gap: 0; 
            min-height: 0;
          }
          
          .sidebar { 
            background: #f8fafc; 
            padding: 1.5rem; 
            border-right: 1px solid #e2e8f0; 
            width: 100%; 
            max-width: 100%; 
            overflow: hidden; 
            box-sizing: border-box; 
          }
          
          .main-content { 
            padding: 1.5rem; 
            width: 100%; 
            max-width: 100%; 
            overflow: hidden; 
            box-sizing: border-box; 
          }
          
          .section-title { 
            font-size: 12px; 
            font-weight: 600; 
            color: #0d9488; 
            margin-bottom: 8px; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            border-bottom: 1px solid #0d9488; 
            padding-bottom: 2px; 
          }
          
          .contact-item { 
            margin-bottom: 8px; 
            color: #374151; 
            font-size: 12px; 
          }
          
          .contact-item a { 
            color: #0d9488; 
            text-decoration: none; 
          }
          
          .contact-item a:hover { 
            text-decoration: underline; 
          }
          
          .edu-item { 
            margin-bottom: 16px; 
          }
          
          .edu-degree { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 4px; 
            font-size: 13px; 
          }
          
          .edu-field { 
            color: #6b7280; 
            font-size: 11px; 
            margin-bottom: 2px; 
          }
          
          .institution { 
            color: #374151; 
            font-size: 11px; 
            margin-bottom: 2px; 
          }
          
          .edu-dates { 
            color: #6b7280; 
            font-size: 10px; 
            margin-bottom: 2px; 
          }
          
          .location { 
            color: #6b7280; 
            font-size: 10px; 
          }
          
          .skill-category { 
            margin-bottom: 12px; 
          }
          
          .skill-category-title { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 4px; 
            font-size: 12px; 
          }
          
          .skill-items { 
            color: #374151; 
            font-size: 11px; 
            line-height: 1.3; 
          }
          
          .job-item { 
            margin-bottom: 20px; 
            padding-bottom: 16px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          
          .job-item:last-child { 
            border-bottom: none; 
          }
          
          .job-title { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 4px; 
            font-size: 14px; 
          }
          
          .company { 
            color: #0d9488; 
            font-weight: 500; 
            margin-bottom: 2px; 
            font-size: 12px; 
          }
          
          .job-dates { 
            color: #6b7280; 
            font-size: 11px; 
            margin-bottom: 2px; 
          }
          
          .job-description { 
            color: #374151; 
            margin: 8px 0; 
            font-size: 11px; 
            line-height: 1.4; 
          }
          
          .achievements { 
            margin: 8px 0;
          }
          
          .achievements li { 
            margin-bottom: 4px; 
            color: #374151; 
            font-size: 11px; 
            line-height: 1.3; 
          }
          
          /* Certifications styling */
          .cert-item { 
            margin-bottom: 12px; 
            padding-bottom: 8px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          
          .cert-item:last-child { 
            border-bottom: none; 
          }
          
          .cert-name { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 2px; 
            font-size: 12px; 
          }
          
          .issuer { 
            color: #6b7280; 
            font-size: 10px; 
            margin-bottom: 2px; 
          }
          
          .cert-dates { 
            color: #6b7280; 
            font-size: 10px; 
            margin-bottom: 2px; 
          }
          
          .cert-expiry { 
            color: #6b7280; 
            font-size: 10px; 
            margin-bottom: 2px; 
          }
          
          .cert-id { 
            color: #6b7280; 
            font-size: 10px; 
            margin-bottom: 2px; 
          }
          
          .cert-link a { 
            color: #0d9488; 
            text-decoration: none; 
            font-size: 10px; 
          }
          
          .cert-link a:hover { 
            text-decoration: underline; 
          }
          
          /* Achievements styling */
          .achievement-item { 
            margin-bottom: 12px; 
            padding-bottom: 8px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          
          .achievement-item:last-child { 
            border-bottom: none; 
          }
          
          .achievement-title { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 2px; 
            font-size: 12px; 
          }
          
          .achievement-description { 
            color: #374151; 
            margin: 4px 0; 
            font-size: 10px; 
            line-height: 1.3; 
          }
          
          .achievement-date { 
            color: #6b7280; 
            font-size: 10px; 
            margin-bottom: 2px; 
          }
          
          .achievement-issuer { 
            color: #6b7280; 
            font-size: 10px; 
          }
          
          /* Languages styling */
          .language-item { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 6px; 
            padding-bottom: 4px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          
          .language-item:last-child { 
            border-bottom: none; 
          }
          
          .language-name { 
            color: #1f2937; 
            font-size: 11px; 
            font-weight: 500; 
          }
          
          .language-level { 
            color: #6b7280; 
            font-size: 10px; 
            text-transform: capitalize; 
          }
          
          /* Projects styling */
          .project-item { 
            margin-bottom: 16px; 
            padding-bottom: 12px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          
          .project-item:last-child { 
            border-bottom: none; 
          }
          
          .project-name { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 4px; 
            font-size: 14px; 
          }
          
          .project-description { 
            color: #374151; 
            margin: 6px 0; 
            font-size: 11px; 
            line-height: 1.4; 
          }
          
          .technologies { 
            margin: 6px 0; 
            color: #374151; 
            font-size: 11px; 
          }
          
          .tech-tag { 
            background: #0d9488 !important; 
            color: white !important; 
            padding: 2px 6px !important; 
            border-radius: 4px !important; 
            margin-right: 4px !important; 
            margin-bottom: 2px !important; 
            display: inline-block !important; 
            font-size: 10px !important; 
            font-weight: 500 !important; 
            text-decoration: none !important;
          }
          
          .project-links { 
            margin: 4px 0; 
            font-size: 11px; 
          }
          
          .project-links a { 
            color: #0d9488; 
            text-decoration: none; 
          }
          
          .project-links a:hover { 
            text-decoration: underline; 
          }
          
          .project-dates { 
            color: #6b7280; 
            font-size: 10px; 
            margin-top: 4px; 
          }
          
          /* Custom fields styling */
          .custom-field-item { 
            margin-bottom: 16px; 
            padding-bottom: 12px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          
          .custom-field-item:last-child { 
            border-bottom: none; 
          }
          
          .custom-field-title { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 6px; 
            font-size: 14px; 
          }
          
          .custom-content { 
            color: #374151; 
            font-size: 11px; 
            line-height: 1.4; 
          }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { 
            color: #6b7280; 
          }
          
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { 
            font-weight: bold; 
            color: #1f2937; 
          }
          
          .project-links a, .cert-link a, .contact-item a { 
            color: #0d9488; 
            text-decoration: none; 
          }
          
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { 
            text-decoration: underline; 
          }
          
          /* A4 Page Constraints - Ensure all content fits within A4 boundaries */
          * { box-sizing: border-box; }
          .resume.modern-glassmorphism * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }
          .sidebar * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }
          .main-content * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }`
    },
    creator: null,
    tags: ['modern', 'glassmorphism', 'gradient', 'contemporary', 'two-column', 'purple']
  }


]