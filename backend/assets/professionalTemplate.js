module.exports = [

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
            sectionSpacing: 1,
            fontFamily: 'Arial'
        }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
        html: `<article class="resume professional-corporate" itemscope itemtype="http://schema.org/Person">
            <header class="header">
            <div class="header-content">
                <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
                <div class="contact-info secondaryFont">
                <div class="contact-row">
                    <span class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</span>
                    {{#if personalInfo.phone}}<span class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</span>{{/if}}
                </div>
                <div class="contact-row">
                    {{#if personalInfo.address}}<span class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</span>{{/if}}
                    {{#if personalInfo.website}}<span class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span>{{/if}}
                </div>
                <div class="contact-row">
                    {{#if personalInfo.linkedin}}<span class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
                    {{#if personalInfo.github}}<span class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
                </div>
                </div>
            </div>
            </header>
            
            <div class="content-grid">
            <div class="main-content">
                {{#if summary}}
                <section class="summary secondaryFont">
                <h2 class="primaryFont">Professional Summary</h2>
                <div class="summary-text secondaryFont" itemprop="description">{{{summary}}}</div>
                </section>
                {{/if}}
                
                {{#if skills}}
                <section class="skills secondaryFont">
                <h2 class="primaryFont">Core Competencies</h2>
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
                <section class="experience secondaryFont">
                <h2 class="primaryFont">Professional Experience</h2>
                {{#each workExperience}}
                <div class="job-entry" itemscope itemtype="http://schema.org/JobPosting">
                    <div class="job-header">
                    <div class="job-title-company">
                        <strong class="primaryFont" itemprop="title">{{jobTitle}}</strong>
                        <div class="company-location">
                        <span class="company secondaryFont" itemprop="hiringOrganization">{{company}}</span>
                        {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">{{location}}</span>{{/if}}
                        </div>
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
                <h2 class="primaryFont">Key Projects</h2>
                {{#each projects}}
                <div class="project-entry">
                    <div class="project-header">
                    <strong class="primaryFont">{{name}}</strong>
                    {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                    </div>
                    {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if technologies}}
                    <div class="technologies secondaryFont">
                    <div class="tech-label primaryFont">Technologies:</div> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
                    </div>
                    {{/if}}
                    {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                    {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
                </div>
                {{/each}}
                </section>
                {{/if}}
                
                {{#if customFields}}
                <section class="custom-fields">
                <h2 class="primaryFont">Additional Information</h2>
                {{#each customFields}}
                <div class="custom-field">
                    <strong class="primaryFont">{{title}}</strong>
                    <div class="custom-content secondaryFont">{{content}}</div>
                </div>
                {{/each}}
                </section>
                {{/if}}
            </div>
            
            <div class="sidebar">
                {{#if education}}
                <section class="education secondaryFont">
                <h2 class="primaryFont">Education</h2>
                {{#each education}}
                <div class="edu-entry" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                    <div class="edu-title-institution">
                    <strong class="primaryFont" itemprop="credentialCategory">{{degree}}</strong>
                    <div class="institution-location">
                        <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                        {{#if location}}<span class="location secondaryFont">{{location}}</span>{{/if}}
                    </div>
                    <div class="edu-dates secondaryFont">
                        <time>{{formatDate startDate}}</time> - 
                        {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                    </div>
                    </div>
                    {{#if gpa}}<p class="gpa secondaryFont">GPA: {{gpa}}</p>{{/if}}
                    {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
                </div>
                {{/each}}
                </section>
                {{/if}}
                
                {{#if achievements}}
                <section class="achievements-section secondaryFont">
                <h2 class="primaryFont">Achievements & Awards</h2>
                {{#each achievements}}
                <div class="achievement-entry">
                    {{#if title}}<div class="achievement-title primaryFont">{{title}}</div>{{/if}}
                    {{#if description}}<div class="secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                    {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
                </div>
                {{/each}}
                </section>
                {{/if}}
                
                {{#if certifications}}
                <section class="certifications secondaryFont">
                <h2 class="primaryFont">Professional Certifications</h2>
                {{#each certifications}}
                <div class="cert-item">
                    <strong class="primaryFont">{{name}}</strong>
                    <div class="cert-details secondaryFont">
                    <span class="issuer secondaryFont">{{issuer}}</span>
                    {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}</span>{{/if}}
                    </div>
                    {{#if expiryDate}}<div class="cert-expiry secondaryFont">Expires: {{formatDate expiryDate}}</div>{{/if}}
                    {{#if credentialId}}<div class="cert-id secondaryFont">ID: {{credentialId}}</div>{{/if}}
                    {{#if url}}<div class="cert-link secondaryFont"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
                </div>
                {{/each}}
                </section>
                {{/if}}
                
                {{#if languages}}
                <section class="languages secondaryFont">
                <h2 class="primaryFont">Languages</h2>
                {{#each languages}}
                <div class="language-item">
                    <span class="language-name secondaryFont">{{name}}</span>
                    <span class="language-level secondaryFont">{{proficiency}}</span>
                </div>
                {{/each}}
                </section>
                {{/if}}
            </div>
            </div>
        </article>`,
        css: `.resume.professional-corporate { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; background: white; color: #1f2937; line-height: 1; }
        @media print { .resume.professional-corporate { max-width: none; margin: 0; padding: 0; } }
        @media (max-width: 768px) { .resume.professional-corporate .content-grid { grid-template-columns: 1fr; gap: 12px; } }
        
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 16px 20px 10px; margin-bottom: 6px; border-radius: 0 0 6px 6px; box-shadow: 0 2px 6px rgba(30, 64, 175, 0.2); }
        @media print { .header { background: #1e40af !important; border-radius: 0; box-shadow: none; } }
        .header-content { max-width: 100%; }
        .name { font-weight: 700; margin-bottom: 6px; letter-spacing: -0.5px; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .contact-info { display: flex; flex-direction: column; gap: 2px; }
        .contact-row { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; }
        .contact-item { opacity: 0.95; }
        .contact-item a { color: white; text-decoration: none; }
        .contact-item a:hover { text-decoration: underline; }
        
        .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 6px; padding: 0 20px 6px; }
        section { margin-bottom: 6px; }
        h2 { font-weight: 600; color: #1e40af; margin-bottom: 2px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; position: relative; }
        h2::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 18px; height: 2px; background: #1e40af; }
        .summary-text { line-height: 1; color: #4b5563; text-align: justify; }
        
        .job-entry, .edu-entry, .project-entry, .achievement-entry { margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px solid #f3f4f6; }
        .job-header, .edu-header, .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
        .job-title-company h3, .edu-title-institution h3, .project-header h3, .achievement-entry .achievement-title { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
        .company-location, .institution-location { display: flex; gap: 4px; color: #6b7280; }
        .dates { color: #9ca3af; font-weight: 500; text-align: right; }
        .description { margin-bottom: 0.25rem; color: #4b5563; line-height: 1; }
        .achievements { margin: 2px 0; }
        .achievements li { margin-bottom: 1px; color: #4b5563; }
        
        /* General list styling for HTML content in descriptions */
        ul, ol { margin: 2px 0; padding-left: 1rem; }
        ul li, ol li { margin-bottom: 1px; color: #4b5563; line-height: 1.3; }
        ul { list-style-type: disc; }
        ol { list-style-type: decimal; }
        .gpa { color: #6b7280; margin: 2px 0; }
        
        .technologies { display: flex; flex-wrap: wrap; gap: 2px; margin: 2px 0; }
        .tech-label { font-weight: bold; display: inline; }
        .tech-tag { background: #1e40af; color: white; padding: 1px 4px; border-radius: 2px; }
        
        .project-links { margin: 2px 0; }
        .project-links a { color: #1e40af; text-decoration: none; margin-right: 8px; }
        .project-links a:hover { text-decoration: underline; }
        .achievement-date { color: #9ca3af; margin: 2px 0; font-style: italic; }
        .achievement-issuer { color: #6b7280; }
        
        .custom-field { margin-bottom: 2px; }
        .custom-field h3 { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
        .custom-content { color: #4b5563; line-height: 1; }
        
        .sidebar { background: #f8fafc; padding: 10px; border-radius: 4px; height: fit-content; border: 1px solid #e5e7eb; }
        @media print { .sidebar { background: white; border: 1px solid #e5e7eb; } }
        .sidebar h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; margin-bottom: 2px; }
        .sidebar h2::after { background: #1f2937; }
        .sidebar section { margin-bottom: 6px; }
        
        .skill-category { margin-bottom: 2px; }
        .skill-category-title { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
        .skill-items { display: flex; flex-wrap: wrap; gap: 2px; margin-top: 2px; }
        .skill-item { background: #1e40af; color: white; padding: 1px 4px; border-radius: 2px; }
        .skill-item[data-level="expert"] { background: #059669; }
        .skill-item[data-level="advanced"] { background: #0ea5e9; }
        .skill-item[data-level="intermediate"] { background: #1e40af; }
        .skill-item[data-level="beginner"] { background: #6b7280; }
        
        .cert-item { margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px solid #f3f4f6; }
        .cert-item h3 { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
        .cert-details { display: flex; justify-content: space-between; color: #6b7280; }
        .cert-expiry, .cert-id { color: #6b7280; margin: 1px 0; }
        .cert-link a { color: #1e40af; text-decoration: none; }
        .cert-link a:hover { text-decoration: underline; }
        
        .language-item { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .language-name { color: #1f2937; }
        .language-level { color: #6b7280; text-transform: capitalize; }
        
        /* Unified classes for consistent styling */
        .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #6b7280; }
        .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
        .project-links a, .cert-link a, .contact-item a { color: #1e40af; text-decoration: none; }
        .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
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
            sectionSpacing: 1,
            fontFamily: 'Arial'
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume professional-executive">
            <header class="executive-header">
              <h1 class="name primaryFont">{{personalInfo.fullName}}</h1>
               <div class="contact-bar secondaryFont">
                 {{#if personalInfo.email}}<span class="contact-item secondaryFont">{{personalInfo.email}}</span>{{/if}}
                 {{#if personalInfo.phone}}<span class="contact-item secondaryFont">{{personalInfo.phone}}</span>{{/if}}
                 {{#if personalInfo.address}}<span class="contact-item secondaryFont">{{personalInfo.address}}</span>{{/if}}
                 {{#if personalInfo.website}}<span class="contact-item secondaryFont"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span>{{/if}}
                 {{#if personalInfo.linkedin}}<span class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
                 {{#if personalInfo.github}}<span class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
               </div>
            </header>
            {{#if summary}}<section class="executive-summary"><h2 class="primaryFont">EXECUTIVE SUMMARY</h2><div class="secondaryFont">{{{summary}}}</div></section>{{/if}}
            {{#if workExperience}}<section class="leadership-experience"><h2 class="primaryFont">LEADERSHIP EXPERIENCE</h2>{{#each workExperience}}<div class="executive-role"><div class="role-header"><h3 class="job-title primaryFont">{{jobTitle}}</h3><div class="company secondaryFont">{{company}}</div><div class="job-dates secondaryFont">{{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</div></div>{{#if location}}<div class="location secondaryFont">{{location}}</div>{{/if}}{{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}{{#if achievements}}<ul class="role-achievements secondaryFont">{{#each achievements}}<li>{{this}}</li>{{/each}}</ul>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if projects}}<section class="executive-projects"><h2 class="primaryFont">KEY INITIATIVES & PROJECTS</h2>{{#each projects}}<div class="project-item"><h3 class="primaryFont">{{name}}</h3>{{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}{{#if technologies}}<div class="project-technologies secondaryFont"><div class="tech-label">Technologies/Methods:</div> {{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/if}}{{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}{{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">Repository</a></div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if education}}<section class="education-section"><h2 class="primaryFont">EDUCATION</h2>{{#each education}}<div class="education-item"><h3 class="edu-degree primaryFont">{{degree}}</h3><div class="institution secondaryFont">{{institution}}</div><div class="edu-dates secondaryFont">{{formatDate startDate}} - {{#if isCurrentlyStudying}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}</div>{{#if gpa}}<div class="gpa secondaryFont">GPA: {{gpa}}</div>{{/if}}{{#if description}}<div class="education-description secondaryFont">{{{description}}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
            {{#if skills}}<section class="executive-skills"><h2 class="primaryFont">CORE COMPETENCIES</h2><div class="competencies-grid">{{#each skills}}<div class="competency-area"><div class="skill-category-title primaryFont">{{category}}</div><div class="skill-items secondaryFont">{{#each items}}{{name}}{{#unless @last}} • {{/unless}}{{/each}}</div></div>{{/each}}</div></section>{{/if}}
            <div class="executive-bottom">
              {{#if achievements}}<section class="achievements-section"><h2 class="primaryFont">ACHIEVEMENTS & AWARDS</h2>{{#each achievements}}<div class="achievement-item">{{#if title}}<div class="achievement-title primaryFont">{{title}}</div>{{/if}}{{#if description}}<div class="secondaryFont">{{{description}}}</div>{{/if}}{{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}{{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}</div>{{/each}}</section>{{/if}}
              {{#if certifications}}<section class="certifications-section"><h2 class="primaryFont">PROFESSIONAL CERTIFICATIONS</h2><div class="certifications-grid">{{#each certifications}}<div class="certification-item"><h3 class="cert-name primaryFont">{{name}}</h3><div class="issuer secondaryFont">{{issuer}}</div>{{#if date}}<div class="cert-dates secondaryFont">{{formatDate date}}</div>{{/if}}{{#if expiryDate}}<div class="cert-expiry secondaryFont">Expires: {{formatDate expiryDate}}</div>{{/if}}{{#if credentialId}}<div class="cert-id secondaryFont">ID: {{credentialId}}</div>{{/if}}{{#if url}}<div class="cert-link secondaryFont"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}</div>{{/each}}</div>{{/if}}
            </div>
            {{#if languages}}<section class="languages-section"><h2 class="primaryFont">LANGUAGES</h2><div class="languages-grid">{{#each languages}}<div class="language-item"><span class="language-name secondaryFont">{{name}}</span><span class="language-level secondaryFont">{{proficiency}}</span></div>{{/each}}</div>{{/if}}
            {{#if customFields}}<section class="custom-fields-section">{{#each customFields}}<div class="custom-field"><h2 class="custom-field-title primaryFont">{{title}}</h2><div class="custom-content secondaryFont">{{content}}</div></div>{{/each}}</section>{{/if}}
          </div>`,
          css: `.resume.professional-executive { font-family: 'Calibri', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; line-height: 1; }
          .executive-header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 1.5rem; margin: 0 0 6px 0; text-align: center; }
           .name { font-weight: 700; margin-bottom: 6px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); letter-spacing: 0.5px; }
           .contact-bar { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; align-items: center; }
           .contact-item { padding: 0.3rem 0.6rem; background: rgba(255,255,255,0.2); border-radius: 12px; backdrop-filter: blur(10px); white-space: nowrap; min-width: fit-content; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
          .contact-item a { color: white; text-decoration: none; }
          section { margin-bottom: 6px; }
          section h2 { font-weight: 700; color: #1e3a8a; text-transform: uppercase; margin-bottom: 2px; padding-bottom: 4px; border-bottom: 2px solid #1e3a8a; letter-spacing: 0.5px; }
          .executive-summary { background: #f8fafc; padding: 1.25rem; border-radius: 6px; border-left: 3px solid #1e3a8a; }
          .executive-summary p, .executive-summary div { line-height: 1.3; color: #374151; margin: 0; }
          .executive-role { margin-bottom: 2px; padding: 1.25rem; background: #f9fafb; border-radius: 6px; border-top: 2px solid #dc2626; }
          .role-header { display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.75rem; margin-bottom: 2px; }
          .role-title { font-weight: 600; color: #1f2937; }
          .role-company { color: #1e3a8a; font-weight: 500; }
          .role-duration { color: #64748b; text-align: right; font-style: italic; }
          .role-location { color: #64748b; margin-bottom: 2px; }
          .role-description { line-height: 1; color: #374151; margin-bottom: 2px; }
          .executive-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px; }
          .education-item { margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f3f4f6; }
          .degree { font-weight: 500; color: #1f2937; margin-bottom: 2px; }
          .institution { color: #1e3a8a; font-weight: 400; margin-bottom: 2px; }
          .edu-dates { color: #64748b; font-style: italic; }
          .gpa { color: #64748b; margin-top: 2px; font-weight: 400;}
          .education-description { line-height: 1.3; color: #374151; margin: 2px 0; }
          .competencies-grid { display: flex; flex-direction: column; gap: 2px; }
          .competency-title { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
          .competency-items { color: #374151; line-height: 1; }
          .certifications-grid { display: flex; flex-direction: column; gap: 2px; }
          .certification-item { padding: 0.6rem; background: #f1f5f9; border-radius: 4px; border-left: 2px solid #1e3a8a; margin-bottom: 6px; }
          .cert-name { font-weight: 500; color: #1f2937; margin-bottom: 2px; }
          .cert-issuer { color: #1e3a8a; font-weight: 500; }
          .cert-dates { color: #64748b; margin-top: 2px; }
          .tech-label { font-weight: bold; display: inline; }
          .project-links a { color: #64748b; text-decoration: none; margin-right: 8px; }
          .cert-link a { color: #64748b; text-decoration: none; }
          .achievement-title { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
          .achievement-item div:not(.achievement-title):not(.achievement-date):not(.achievement-issuer) { line-height: 1.3; color: #374151; margin: 2px 0; }
          .achievement-date { color: #64748b; margin: 2px 0; font-style: italic; }
          .achievement-issuer { color: #64748b; }
          .project-item .description { line-height: 1.3; color: #374151; margin: 2px 0; }
          .cert-expiry, .cert-id { color: #64748b; margin: 1px 0; }
          .languages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px; }
          .language-item { display: flex; justify-content: flex-start; gap: 8px; margin-bottom: 2px; }
          .language-name { color: #1f2937; }
          .language-level { color: #64748b; text-transform: capitalize; }
          .custom-field { margin-bottom: 2px; }
          .custom-content { color: #374151; line-height: 1; 
          /* General list styling for HTML content in descriptions */
          ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
          ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; }
          ul { list-style-type: disc; }
          ol { list-style-type: decimal; }}
          ul { list-style-type: disc; } ol { list-style-type: decimal; }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #64748b; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
          .project-links a, .cert-link a, .contact-item a { color: #64748b; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
        },
        creator: null,
        tags: ['professional', 'executive', 'leadership', 'corporate']
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
            sectionSpacing: 1,
            fontFamily: 'Arial'
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<article class="resume sleek-professional" itemscope itemtype="http://schema.org/Person">
            <div class="main-column">
              <header class="header">
                <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
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
                <h3 class="primaryFont">Professional Summary</h3>
                <div class="summary-text secondaryFont" itemprop="description">{{{summary}}}</div>
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
                  {{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}
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
                  <div class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</div>
                  <div class="edu-meta">
                    <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                    {{#if location}}<span class="location secondaryFont"> • {{location}}</span>{{/if}}
                    <span class="edu-dates secondaryFont">
                      • <time>{{formatDate startDate}}</time> - 
                      {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
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
                <h3 class="primaryFont">Professional Certifications</h3>
                {{#each certifications}}
                <div class="cert-item">
                  <div class="cert-name secondaryFont">{{name}}</div>
                   <div class="cert-meta">
                     <span class="issuer secondaryFont">{{issuer}}</span>
                     {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}</span>{{/if}}
                   </div>
                   {{#if expiryDate}}<div class="cert-expiry secondaryFont">Expires: {{formatDate expiryDate}}</div>{{/if}}
                   {{#if credentialId}}<div class="cert-id secondaryFont">ID: {{credentialId}}</div>{{/if}}
                   {{#if url}}<div class="cert-link secondaryFont"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
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
                  {{#if description}}<div class="description secondaryFont">{{{description}}}</div>{{/if}}
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
          css: `.resume.sleek-professional { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1e293b; line-height: 1.4; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; width: 100%; overflow: hidden; box-sizing: border-box; }
          .header { grid-column: 1 / -1; text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #2563eb; width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; }
          .main-column { width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; }
          .sidebar { width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; }
          .name { font-weight: 600; color: #0f172a; margin-bottom: 8px; }
          .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #475569; width: 100%; max-width: 100%; overflow: hidden; }
          .contact-item { color: #1e293b; flex: 0 1 auto; min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .contact-item a { color: #475569; text-decoration: none; }
          .contact-item a:hover { text-decoration: underline; }
          section { margin-bottom: 15px; }
          h3 { font-weight: 600; color: #0f172a; margin-bottom: 3px; padding-bottom: 2px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
          .job-item, .edu-item, .project-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
          .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
          .job-title, .edu-degree { font-weight: 600; color: #1e293b; margin-bottom: 2px; }
          .job-meta, .edu-meta { color: #475569; }
          .job-dates, .edu-dates { color: #64748b; font-weight: 500; }
          .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; }
          .achievements { margin: 4px 0; }
          .achievements li { margin-bottom: 2px; color: #4b5563; }
          
          /* General list styling for HTML content in descriptions */
          ul, ol { margin: 4px 0; padding-left: 1rem; }
          ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
          ul { list-style-type: disc; }
          ol { list-style-type: decimal; }
          .skill-category { margin-bottom: 8px; }
          .skill-category-title { font-weight: 600; color: #1e293b; margin-bottom: 3px; }
          .skill-items { color: #4b5563; line-height: 1.4; }
          .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; }
          .project-name { font-weight: 600; color: #1e293b; }
          .technologies { margin: 4px 0; color: #6b7280; }
          .tech-tag { background: #f1f5f9; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
          .project-links { margin: 3px 0; }
          .project-links a { color: #4b5563; text-decoration: none; }
          .project-links a:hover { text-decoration: underline; }
          .project-dates { color: #64748b; margin-top: 2px; }
          .cert-name { font-weight: 600; color: #1e293b; margin-bottom: 2px; }
          .cert-meta { color: #475569; margin-bottom: 2px; }
          .cert-expiry, .cert-id { color: #64748b; margin: 1px 0; }
          .cert-link a { color: #64748b; text-decoration: none; }
          .cert-link a:hover { text-decoration: underline; }
          .achievement-title { font-weight: 600; color: #1e293b; margin-bottom: 2px; }
          .achievement-date, .achievement-issuer { color: #64748b; margin: 1px 0; }
          .language-item { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .language-name { color: #1e293b; }
          .language-level { color: #64748b; }
          .custom-field-item { margin-bottom: 10px; }
          .custom-content { color: #4b5563; line-height: 1.4; }
          .gpa { color: #6b7280; margin: 2px 0; }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #64748b; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
          .project-links a, .cert-link a, .contact-item a { color: #64748b; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }
          
          /* A4 Page Constraints - Ensure all content fits within A4 boundaries */
          * { box-sizing: border-box; }
          .resume.sleek-professional * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }
          .sidebar * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }
          .main-column * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }`
        },
        creator: null,
        tags: ['professional', 'corporate', 'ats', 'clean', 'two-column', 'blue']
      },

      {
        name: 'Professional Executive pro',
        description: 'An executive-level template with sophisticated styling and modern layout',
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
            primary: '#1e3a8a',
            secondary: '#64748b',
            accent: '#3b82f6',
            text: '#1f2937',
            background: '#ffffff',
            header: '#1e3a8a',
            sidebar: '#f8fafc'
          },
          fonts: {
            primary: 'Georgia',
            secondary: 'Arial',
            sizes: { heading: 18, subheading: 14, body: 12, small: 10 }
          },
          template: {
            headerLevel: 'h3',
            headerFontSize: 18,
            fontSize: 12,
            lineSpacing: 1.4,
            sectionSpacing: 1.2,
            fontFamily: 'Georgia'
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<article class="resume professional-executive-pro" itemscope itemtype="http://schema.org/Person">
            <div class="main-content">
              <header class="executive-header">
                <div class="header-content">
                  <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
                  <div class="title-role primaryFont">{{personalInfo.title}}</div>
                  <div class="contact-grid secondaryFont">
                    <div class="contact-item" itemprop="email">
                      <span class="contact-icon">📧</span>
                      {{personalInfo.email}}
                    </div>
                    {{#if personalInfo.phone}}
                    <div class="contact-item" itemprop="telephone">
                      <span class="contact-icon">📱</span>
                      {{personalInfo.phone}}
                    </div>
                    {{/if}}
                    {{#if personalInfo.location}}
                    <div class="contact-item" itemprop="address">
                      <span class="contact-icon">📍</span>
                      {{personalInfo.location}}
                    </div>
                    {{/if}}
                    {{#if personalInfo.website}}
                    <div class="contact-item">
                      <span class="contact-icon">🌐</span>
                      <a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a>
                    </div>
                    {{/if}}
                    {{#if personalInfo.linkedin}}
                    <div class="contact-item">
                      <span class="contact-icon">💼</span>
                      <a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a>
                    </div>
                    {{/if}}
                    {{#if personalInfo.github}}
                    <div class="contact-item">
                      <span class="contact-icon">💻</span>
                      <a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a>
                    </div>
                    {{/if}}
                  </div>
                </div>
              </header>
              
              {{#if summary}}
              <section class="executive-summary secondaryFont">
                <h2 class="section-title primaryFont">Executive Summary</h2>
                <div class="summary-content secondaryFont" itemprop="description">{{{summary}}}</div>
              </section>
              {{/if}}
              
              {{#if workExperience}}
              <section class="executive-experience secondaryFont">
                <h2 class="section-title primaryFont">Professional Experience</h2>
                {{#each workExperience}}
                <div class="experience-item" itemscope itemtype="http://schema.org/JobPosting">
                  <div class="experience-header">
                    <div class="job-info">
                      <div class="job-title primaryFont" itemprop="title">{{jobTitle}}</div>
                      <div class="company-info">
                        <span class="company secondaryFont" itemprop="hiringOrganization">{{company}}</span>
                        {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">• {{location}}</span>{{/if}}
                      </div>
                    </div>
                    <div class="job-dates secondaryFont">
                      <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                      {{#if isCurrentJob}}<span class="current-badge">Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                    </div>
                  </div>
                  {{#if description}}
                  <div class="job-description secondaryFont" itemprop="description">{{{description}}}</div>
                  {{/if}}
                  {{#if achievements}}
                  <ul class="achievements-list secondaryFont">
                    {{#each achievements}}<li>{{this}}</li>{{/each}}
                  </ul>
                  {{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if projects}}
              <section class="executive-projects secondaryFont">
                <h2 class="section-title primaryFont">Key Projects & Initiatives</h2>
                {{#each projects}}
                <div class="project-item">
                  <div class="project-header">
                    <div class="project-name primaryFont">{{name}}</div>
                    <div class="project-links">
                      {{#if url}}<a href="{{url}}" target="_blank" class="project-link">{{url}}</a>{{/if}}
                      {{#if githubUrl}}<a href="{{githubUrl}}" target="_blank" class="project-link">{{githubUrl}}</a>{{/if}}
                    </div>
                  </div>
                  {{#if description}}
                  <div class="project-description secondaryFont">{{{description}}}</div>
                  {{/if}}
                  {{#if technologies}}
                  <div class="technologies secondaryFont">
                    <span class="tech-label primaryFont">Technologies:</span>
                    {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
                  </div>
                  {{/if}}
                  {{#if startDate}}
                  <div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>
                  {{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
            </div>
            
            <div class="executive-sidebar">
              {{#if education}}
              <section class="education secondaryFont">
                <h2 class="sidebar-title primaryFont">Education</h2>
                {{#each education}}
                <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                  <div class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</div>
                  <div class="edu-meta secondaryFont">
                    <span class="institution" itemprop="recognizedBy">{{institution}}</span>
                    {{#if location}}<span class="location">{{location}}</span>{{/if}}
                  </div>
                  <div class="edu-dates secondaryFont">
                    <time>{{formatDate startDate}}</time> - 
                    {{#if isCurrentlyStudying}}<span class="current-badge">Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                  </div>
                  {{#if gpa}}<div class="gpa secondaryFont">GPA: {{gpa}}</div>{{/if}}
                  {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if skills}}
              <section class="skills secondaryFont">
                <h2 class="sidebar-title primaryFont">Core Competencies</h2>
                {{#each skills}}
                <div class="skill-category">
                  <h3 class="skill-category-title primaryFont">{{category}}</h3>
                  <div class="skill-items secondaryFont">
                    {{#each items}}
                    <span class="skill-item" data-level="{{level}}">{{name}}</span>
                    {{/each}}
                  </div>
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if achievements}}
              <section class="achievements secondaryFont">
                <h2 class="sidebar-title primaryFont">Achievements & Awards</h2>
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
              <section class="certifications secondaryFont">
                <h2 class="sidebar-title primaryFont">Certifications</h2>
                {{#each certifications}}
                <div class="cert-item">
                  <div class="cert-name primaryFont">{{name}}</div>
                  <div class="cert-meta secondaryFont">
                    <span class="issuer">{{issuer}}</span>
                    {{#if date}}<span class="cert-dates">{{formatDate date}}</span>{{/if}}
                  </div>
                  {{#if credentialId}}<div class="cert-id secondaryFont">ID: {{credentialId}}</div>{{/if}}
                  {{#if url}}<a href="{{url}}" target="_blank" class="cert-link secondaryFont">Verify</a>{{/if}}
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if languages}}
              <section class="languages secondaryFont">
                <h2 class="sidebar-title primaryFont">Languages</h2>
                {{#each languages}}
                <div class="language-item">
                  <span class="language-name secondaryFont">{{name}}</span>
                  <span class="language-level secondaryFont">{{proficiency}}</span>
                </div>
                {{/each}}
              </section>
              {{/if}}
              
              {{#if customFields}}
              <section class="custom-fields secondaryFont">
                {{#each customFields}}
                <div class="custom-field">
                  <h3 class="custom-field-title primaryFont">{{title}}</h3>
                  <div class="custom-content secondaryFont">{{content}}</div>
                </div>
                {{/each}}
              </section>
              {{/if}}
            </div>
          </article>`,
          css: `          .resume.professional-executive-pro {
            font-family: 'Georgia', serif;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.5in 0.35in;
            background: white;
            color: #1f2937;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
            line-height: 1.4;
          }
          
          @media print {
            .resume.professional-executive {
              max-width: none;
              margin: 0;
              padding: 0.5in;
            }
          }
          
          @media (max-width: 768px) {
            .resume.professional-executive {
              grid-template-columns: 1fr;
              gap: 16px;
              padding: 16px;
            }
          }
          
          .executive-header {
            grid-column: 1 / -1;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 3px solid #1e3a8a;
            text-align: center;
          }
          
          .name {
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .title-role {
            color: #64748b;
            margin-bottom: 16px;
            font-style: italic;
          }
          
          .contact-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 16px;
            justify-content: center;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
          }
          
          .contact-icon {
            opacity: 0.8;
          }
          
          .contact-item a {
            color: #64748b;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          
          .contact-item a:hover {
            color: #1e3a8a;
            text-decoration: underline;
          }
          
          .section-title {
            font-weight: 600;
            color: #1e3a8a;
            margin-bottom: 2px;
            padding-bottom: 2px;
            border-bottom: 2px solid #e5e7eb;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .sidebar-title {
            font-weight: 600;
            color: #1e3a8a;
            margin-bottom: 2px;
            padding-bottom: 2px;
            border-bottom: 1px solid #e5e7eb;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .experience-item, .project-item, .edu-item, .achievement-item, .cert-item {
            margin-bottom: 1px;
            padding-bottom: 1px;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .experience-item:last-child, .project-item:last-child, .edu-item:last-child, .achievement-item:last-child, .cert-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          
          .experience-header, .project-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2px;
          }
          
          .job-title, .project-name, .edu-degree, .achievement-title, .cert-name {
            font-weight: 600;
            color: #1f2937;
            font-size: 12px;
          }
          
          .company-info, .edu-meta, .cert-meta {
            display: flex;
            gap: 8px;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 2px;
          }
          
          .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-date {
            font-size: 10px;
            color: #64748b;
            font-weight: 500;
            white-space: nowrap;
          }
          
          .current-badge {
            background: #1e3a8a;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .job-description, .project-description, .edu-description, .achievement-description {
            color: #475569;
            line-height: 1.4;
            margin-bottom: 4px;
          }
          
          .achievements-list {
            margin: 4px 0;
            padding-left: 16px;
          }
          
          .achievements-list li {
            color: #475569;
            margin-bottom: 2px;
            line-height: 1.3;
          }
          
          .project-links {
            display: flex;
            gap: 8px;
            margin-top: 4px;
          }
          
          .project-link, .cert-link {
            color: #1e3a8a;
            text-decoration: none;
            font-size: 10px;
            font-weight: 400;
            transition: color 0.3s ease;
          }
          
          .project-link:hover, .cert-link:hover {
            color: #1e40af;
          }
          
          .technologies {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
            align-items: center;
          }
          
          .tech-label {
            font-size: 11px;
            font-weight: 600;
            color: #1f2937;
            margin-right: 8px;
          }
          
          .tech-tag {
            background: #64748b;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 500;
          }
          
          .skill-category {
            margin-bottom: 8px;
          }
          
          .skill-category-title {
            font-size: 12px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          }
          
          .skill-items {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .skill-item {
            background: #1e3a8a;
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 500;
            transition: background-color 0.3s ease;
          }
          
          .skill-item[data-level="expert"] {
            background: #059669;
          }
          
          .skill-item[data-level="advanced"] {
            background: #0ea5e9;
          }
          
          .skill-item[data-level="intermediate"] {
            background: #1e3a8a;
          }
          
          .skill-item[data-level="beginner"] {
            background: #6b7280;
          }
          
          .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3px;
            padding: 4px 6px;
            background: #f8fafc;
            border-radius: 4px;
          }
          
          .language-name {
            font-weight: 500;
            color: #1f2937;
          }
          
          .language-level {
            font-size: 10px;
            color: #64748b;
            text-transform: capitalize;
            background: #e5e7eb;
            padding: 2px 6px;
            border-radius: 3px;
          }
          
          .gpa, .cert-id {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
          }
          
          .custom-field {
            margin-bottom: 6px;
          }
          
          .custom-field-title {
            font-size: 12px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 3px;
          }
          
          .custom-content {
            color: #475569;
            line-height: 1.4;
          }
          
          .executive-sidebar {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #1e3a8a;
          }
          
          @media print {
            .executive-sidebar {
              background: white;
              border: 1px solid #e5e7eb;
            }
          }
          
          /* Print optimizations */
          @media print {
            .experience-item, .project-item, .edu-item {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }`
        },
        creator: null,
        tags: ['professional', 'executive', 'corporate', 'sophisticated', 'two-column', 'blue']
      }
      
      
    ]