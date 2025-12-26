module.exports = [
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
                sectionSpacing: 1,
                fontFamily: 'Arial'
            }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
            html: `<article class="resume minimalist-clean" itemscope itemtype="http://schema.org/Person">
            <header class="header">
            <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
            {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

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
                <section class="summary">
                    <h2 class="primaryFont">Professional Summary</h2>
                    <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
                </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
            <h2 class="primaryFont">Core Competencies</h2>
            <div class="skills-grid">
                {{#each skills}}
                <div class="skill-category">
                <div class="skill-category-title primaryFont">{{category}}</div>
                <div class="skill-items secondaryFont">
                    {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}} {{#if level}} ({{level}}){{/if}}</span>{{/each}}
                </div>
                </div>
                {{/each}}
            </div>
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="experience secondaryFont">
            <h2 class="primaryFont">Professional Experience</h2>
            {{#each workExperience}}
            <div class="experience-item" itemscope itemtype="http://schema.org/JobPosting">
                <div class="item-header">
                <div class="item-title">
                    <h3 class="primaryFont" itemprop="title">{{jobTitle}}</h3>
                    <span class="company secondaryFont" itemprop="hiringOrganization">{{company}}</span>
                    {{#if location}}<span class="location secondaryFont" itemprop="jobLocation"> • {{location}}</span>{{/if}}
                </div>
                <span class="job-dates secondaryFont">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                    {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                </span>
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
                <div class="item-header">
                <div class="item-title">
                    <h3 class="primaryFont">{{name}}</h3>
                    {{#if startDate}}<span class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}
                </div>
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
            
            {{#if education}}
            <section class="education">
            <h2 class="primaryFont">Education</h2>
            {{#each education}}
            <div class="education-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="item-header">
                <div class="item-title">
                    <h3 class="primaryFont" itemprop="credentialCategory">{{degree}}</h3>
                    <span class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</span>
                    {{#if location}}<span class="location secondaryFont"> • {{location}}</span>{{/if}}
                </div>
                <span class="edu-dates secondaryFont">
                    {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                </span>
                </div>
                {{#if gpa}}<div class="gpa secondaryFont">GPA: {{gpa}}</div>{{/if}}
                {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
            </div>
            {{/each}}
            </section>
            {{/if}}
            
            {{#if achievements}}
            <section class="achievements-section secondaryFont">
            <h2 class="primaryFont">Achievements & Awards</h2>
            {{#each achievements}}
            <div class="achievement-item">
                {{#if title}}<div class="achievement-title primaryFont">{{title}}</div>{{/if}}
                {{#if description}}<div class="achievement-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
            </div>
            {{/each}}
            </section>
            {{/if}}
            
            {{#if certifications}}
            <section class="certifications">
            <h2 class="primaryFont">Professional Certifications</h2>
            {{#each certifications}}
            <div class="cert-item">
                <div class="item-header">
                <div class="item-title">
                    <h3 class="primaryFont">{{name}}</h3>
                    <span class="cert-issuer secondaryFont">{{issuer}}</span>
                </div>
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
            <section class="languages">
            <h2 class="primaryFont">Languages</h2>
            <div class="languages-grid">
                {{#each languages}}
                <div class="language-item">
                <span class="language-name secondaryFont">{{name}}</span>
                <span class="language-level secondaryFont">{{proficiency}}</span>
                </div>
                {{/each}}
            </div>
            </section>
            {{/if}}
            
            {{#if customFields}}
            <section class="custom-fields">
            <h2 class="primaryFont">Additional Information</h2>
            {{#each customFields}}
            <div class="custom-field">
                <h3 class="primaryFont">{{title}}</h3>
                <div class="custom-content secondaryFont">{{content}}</div>
            </div>
            {{/each}}
            </section>
            {{/if}}
        </article>`,
            css: `.resume.minimalist-clean { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #374151; font-size: 15px; line-height: 1; }
        .header { margin-bottom: 6px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
        .name { font-weight: 600; color: #1f2937; margin-bottom: 6px; letter-spacing: -0.5px; }
        .contact-info { display: flex; flex-wrap: wrap; gap: 10px; color: #6b7280; }
        .contact-item { display: flex; align-items: center; }
        .contact-item a { color: #6b7280; text-decoration: none; }
        .summary { margin-bottom: 6px; }
        .summary { color: #4b5563; line-height: 1; text-align: justify; }
        section { margin-bottom: 6px; }
        h2 { font-weight: 600; color: #1f2937; margin-bottom: 4px; padding-bottom: 2px; border-bottom: 1px solid #e5e7eb; }
        .experience-item, .education-item, .project-item, .achievement-item, .cert-item { margin-bottom: 2px; padding-bottom: 2px; }
        .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
        .item-title h3, .achievement-item .achievement-title, .custom-field h3 { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
        .company, .institution, .location, .cert-issuer { color: #6b7280; }
        .dates { color: #9ca3af; font-weight: 500; }
        .summary, .job-description, .edu-description, .project-description, .achievement-description, .custom-content { margin: 2px 0; color: #4b5563; line-height: 1; }
        .achievements { margin: 2px 0; }
        .achievements li { margin-bottom: 2px; color: #4b5563; }
        
        /* General list styling for HTML content in descriptions */
        ul, ol { margin: 2px 0; padding-left: 1rem; }
        ul li, ol li { margin-bottom: 2px; color: #4b5563; line-height: 1.3; }
        ul { list-style-type: disc; }
        ol { list-style-type: decimal; }
        .gpa { color: #6b7280; margin-bottom: 2px; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px; }
        .skill-category-title { font-weight: 600; color: #1f2937; margin-bottom: 2px; }
        .skill-items { display: flex; flex-wrap: wrap; gap: 3px; }
        .skill-item { background: #f3f4f6; color: #374151; padding: 2px 4px; border-radius: 2px; font-weight: 500; }
        .technologies { display: flex; flex-wrap: wrap; gap: 3px; margin: 2px 0; }
        .tech-label { font-weight: bold; display: inline; }
        .tech-tag { background: #1f2937; color: white; padding: 1px 3px; border-radius: 2px; }
        .project-links, .cert-link { margin: 2px 0; }
        .project-links a, .cert-link a { color: #1f2937; text-decoration: none; margin-right: 8px; }
        .achievement-date { color: #9ca3af; margin: 2px 0; font-style: italic; }
        .achievement-issuer { color: #6b7280; }
        .cert-expiry, .cert-id { color: #6b7280; margin: 1px 0; }
        .languages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px; }
        .language-item { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .language-name { color: #1f2937; }
        .language-level { color: #6b7280; text-transform: capitalize; }
        .custom-field { margin-bottom: 2px; }
        
        /* Unified classes for consistent styling */
        .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #6b7280; }
        .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
        .project-links a, .cert-link a, .contact-item a { color: #1f2937; text-decoration: none; }
        .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
        },
        creator: null,
        tags: ['minimalist', 'clean', 'simple', 'modern', 'readable', 'single-column']
    },
    {
        name: "Modern Professional Minimal",
        description: 'A clean, minimalist template focusing on content and readability',
        category: 'minimalist',
        preview: {
            thumbnail: {
                url: 'https://via.placeholder.com/300x400/f8fafc/1f2937?text=Modern%20Professional%20Minimal'
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
                headerFontSize: 16,
                fontSize: 13,
                lineSpacing: 1.3,
                sectionSpacing: 1,
                fontFamily: 'Arial'
            }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
            html: ` 
                <body class="modern-professional-minimal">
                <div class="resume-container" itemscope itemtype="http://schema.org/Person">
                <header>
                <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
                {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

                <div class="contact-info secondaryFont" itemprop="contactPoint" itemscope itemtype="http://schema.org/ContactPoint">
                {{#if personalInfo.address}}<span class="contact-item" itemprop="address">{{personalInfo.address}}</span>{{/if}}
                {{#if personalInfo.email}}<span class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</span>{{/if}}
                {{#if personalInfo.website}}<span class="contact-item secondaryFont" itemprop="url">{{personalInfo.website}}</span>{{/if}}
                 {{#if personalInfo.linkedin}}<span class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
                {{#if personalInfo.github}}<span class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
                {{#if personalInfo.phone}}<span class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</span>{{/if}}
                </div>
                </header>
                <main>
                {{#if summary}}
                <section class="summary">
                <h3 class="section-title primaryFont">SUMMARY</h3>
                <p class="summary-text secondaryFont">{{{summary}}}</p>
                </section>
                {{/if}}

                {{#if skills}}
                <section class="skills">
                <h3 class="section-title primaryFont">SKILLS</h3>
                <div class="skills-grid">
                {{#each skills}}
                 <div class="skill-category">
                    <h4 class="skill-category-title secondaryFont"><strong>{{category}}</strong></h4>
                    <div class="skill-items secondaryFont">
                      {{#each items}}<span class="skill-item" data-level="{{level}}">{{name}}</span>{{#unless @last}}, {{/unless}}{{/each}}
                    </div>
                  </div>
                {{/each}}
                </div>
                </section>
                {{/if}}

                {{#if workExperience}}
                <section class="work-experience">
                <h3 class="section-title primaryFont">PROFESSIONAL EXPERIENCE</h3>
                {{#each workExperience}}
                    <div class="job-item" itemscope itemtype="http://schema.org/JobPosting">
                        <div class="job-header">
                            <div class="job-title secondaryFont" itemprop="title"><strong>{{jobTitle}}</strong></div>
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
                <h3 class="section-title primaryFont">PROJECTS</h3>
                {{#each projects}}
                 <div class="project-item">
                    <div class="project-header">
                      <h4 class="project-name secondaryFont"><strong>{{name}}</strong></h4>
                      {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                    </div>
                    {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if technologies}}
                    <div class="technologies">
                      <strong class="technologies secondaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag technologies secondaryFont">{{this}}</span>{{#unless @last}}, {{/unless}}{{/each}}
                    </div>
                    {{/if}}
                    {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                    {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
                  </div>
                {{/each}}
                </section>
                {{/if}}

                {{#if education}}
                <section>
                <h3 class="section-title primaryFont">EDUCATION</h3>
                <div class="education">
                {{#each education}}
                <div class="edu-item" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                    <div class="edu-header">
                        <h4 class="edu-degree secondaryFont" itemprop="credentialCategory"><strong>{{degree}}</strong></h4>
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
                </div>
                </section>
                {{/if}}

                {{#if achievements}}
                <section class="achievements">
                <h3 class="section-title primaryFont">ACHIEVEMENTS</h3>
                <ul class="secondaryFont">
                {{#each achievements}}
               <div class="achievement-item">
                    {{#if title}}<h4 class="achievement-title secondaryFont"><strong>{{title}}</strong></h4>{{/if}}
                    {{#if description}}<div class="achievement-description secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                    {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
                  </div>
                {{/each}}
                </ul>
                </section>
                {{/if}}

                {{#if certifications}}
                <section class="certifications">
                <h3 class="section-title primaryFont">CERTIFICATIONS</h3>
                <ul class="secondaryFont">
                {{#each certifications}}
                <div class="cert-item">
                    <div class="cert-name secondaryFont"><strong>{{name}}</strong></div>
                    <div class="cert-meta">
                      <span class="issuer secondaryFont">{{issuer}}</span>
                      {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}</span>{{/if}}
                    </div>
                    {{#if expiryDate}}<div class="cert-expiry secondaryFont">Expires: {{formatDate expiryDate}}</div>{{/if}}
                    {{#if credentialId}}<div class="cert-id secondaryFont">ID: {{credentialId}}</div>{{/if}}
                    {{#if url}}<div class="cert-link secondaryFont"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
                  </div>
                {{/each}}
                </ul>
                </section>
                {{/if}}

                {{#if languages}}
                <section class="languages-section">
                <h3 class="section-title primaryFont">LANGUAGES</h3>
                <p class="secondaryFont">
                {{#each languages}}
                <div class="language-item">
                    <span class="language-name secondaryFont">{{name}}</span>
                    <span class="language-level secondaryFont">{{proficiency}}</span>
                  </div>
                {{/each}}
                </p>
                </section>
                {{/if}}

                {{#if customFields}}
                <section class="custom-fields">
                <h3 class="section-title primaryFont">ADDITIONAL INFORMATION</h3>
                {{#each customFields}}
                <div class="custom-field-item">
                    <h3 class="custom-field-title primaryFont">{{title}}</h3>
                    <div class="custom-content secondaryFont">{{content}}</div>
                  </div>
                {{/each}}
                </section>
                {{/if}}
                </main>
                </div>
                </body>`,
            css: `
                        :root {
                            --background-light: #ffffff;
                            --background-dark: #111827;
                            --text-light: #1f2937;
                            --text-dark: #d1d5db;
                            --text-secondary-light: #4b5563;
                            --text-secondary-dark: #9ca3af;
                            --border-light: #e5e7eb;
                            --border-dark: #374151;
                            --section-header-bg-light: #e5e7eb;
                            --section-header-text-light: #374151;
                            --section-header-bg-dark: #374151;
                            --section-header-text-dark: #d1d5db;
                        }
                        .primaryFont {
                            font-family: var(--primary-font, sans-serif);
                        }
                        .secondaryFont {
                            font-family: var(--secondary-font, sans-serif);
                        }
                        body.modern-professional-minimal {
                            font-family: 'Lato', sans-serif;
                            background-color: #f3f4f6;
                            color: var(--text-light);
                            margin: 0;
                        }
                        header {
                            text-align: center;
                            margin-bottom: 1rem;
                        }
                        header h1 {
                            font-size: 18px;
                            font-weight: 700;
                            letter-spacing: 0.025em;
                            color: #111827;
                            margin-bottom: 0.2rem;
                        }
                        header h2 {
                            font-size: 16px;
                            font-weight: 700;
                            letter-spacing: 0.05em;
                            color: #374151;
                            margin-top: 0;
                            margin-bottom: 0.4rem;
                        }

                        h4 {
                            font-size: 13px;
                            font-weight: 700;
                            letter-spacing: 0.05em;
                            color: #374151;
                            margin-bottom: 0.2rem;
                        }
                        .contact-info .contact-item:not(:last-child)::after {
                            content: ' | ';
                            margin-left: 0.2rem;
                            margin-right: 0.2rem;
                        }
                        .contact-info .contact-item a {
                            color: inherit;
                            text-decoration: none;
                        }
                        .contact-info {
                            font-size: 13px;
                            color: #4b5563;
                            margin-top: 0;
                            line-height: 1.3;
                        }
                        main > section:not(:last-child) {
                            margin-bottom: 1rem;
                        }
                        .section-title {
                            font-size: 15px;    
                            font-weight: 700;
                            letter-spacing: 0.1em;
                            color: var(--section-header-text-light);
                            background-color: var(--section-header-bg-light);
                            padding: 0.2rem 0.6rem;
                            border-radius: 9999px;
                            display: inline-block;
                            width: 100%;
                        }
                        section p, section ul li {
                            font-size: 13px;
                            line-height: 1.4;
                        }
                        .summary-text {
                            font-size: 13px;
                            line-height: 1.4;
                            margin-top: 0;
                        }
                        .skills-grid {
                            display: grid;
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                            gap: 0.2rem 1rem;
                        }
                        .entry:not(:last-child) {
                            margin-bottom: 0.8rem;
                        }
                        .entry-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: baseline;
                            flex-wrap: wrap;
                            margin-bottom: 0.1rem;
                        }
                        .entry-title {
                            font-weight: 700;
                            font-size: 15px;
                            color: #111827;
                        }
                        .entry-date {
                            font-size: 13px;
                            font-weight: 500;
                            color: #4b5563;
                            flex-shrink: 0;
                            margin-left: 0.8rem;
                        }
                        .entry-subtitle {
                            font-size: 13px;
                            font-style: italic;
                            color: #4b5563;
                            margin: 0;
                        }
                        ul {
                            list-style: disc;
                            padding-left: 1rem;
                            margin-top: 0.2rem;
                            margin-bottom: 0;
                        }
                        ul li {
                            margin-bottom: 0.2rem;
                        }
                        .list-item-title {
                            font-weight: 700;
                        }
                        .custom-field-entry {
                            margin-bottom: 0.4rem;
                        }
                            
                        .item-title h3, .achievement-item .achievement-title, .custom-field skill-category h3 { font-weight: 600; color: #1f2937; margin-bottom: 2px; }

                        .technologies {
                            font-size: 13px;
                            font-weight: 600;
                        }

                        .education {
                        display: flex;
                        flex-direction: row;
                        gap: 1rem;
                        align-items: center;
                        justify-content: flex-start;
                        }

                        .project-links a, .cert-link a, .contact-item a { color: #1f2937; text-decoration: none; }
        .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }

        
                        @media (min-width: 640px) {
                            body {
                                padding: 1.2rem;
                            }
                            .resume-container {
                                padding: 2rem;
                            }
                            header h1 {
                                font-size: 2.2rem;
                            }
                            header h2 {
                                font-size: 1.1rem;
                            }
                            .skills-grid {
                                grid-template-columns: repeat(3, minmax(0, 1fr));
                            }
                        }
                        @media (prefers-color-scheme: dark) {
                            body {
                                background-color: #1f2937;
                                color: var(--text-dark);
                            }
                            .resume-container {
                                background-color: var(--background-dark);
                                border-color: var(--border-dark);
                            }
                            header h1, .entry-title {
                                color: #f9fafb;
                            }
                            header h2, header p, .entry-date, .entry-subtitle {
                                color: var(--text-secondary-dark);
                            }
                            .section-title {
                                background-color: var(--section-header-bg-dark);
                                color: var(--section-header-text-dark);
                            }
                        }
                    `},
        creator: null,
        tags: ['minimalist', 'clean', 'simple', 'modern', 'readable', 'single-column']
    }
]
