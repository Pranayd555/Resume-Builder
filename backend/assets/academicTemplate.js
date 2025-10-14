module.exports = [
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
            { name: 'certifications', position: 8, isRequired: false, isVisible: true },
            { name: 'languages', position: 9, isRequired: false, isVisible: true },
            { name: 'customFields', position: 10, isRequired: false, isVisible: true },
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
            sectionSpacing: 1,
            fontFamily: 'Arial'
        }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
        html: `<article class="resume academic-research" itemscope itemtype="http://schema.org/Person">
            <header class="header">
            <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
            <div class="contact-info secondaryFont">
                <div class="contact-grid">
                 <div class="contact-item secondaryFont"><span class="label">Email:</span><span class="value" itemprop="email">{{personalInfo.email}}</span></div>
                 {{#if personalInfo.address}}<div class="contact-item secondaryFont"><span class="label">Address:</span><span class="value" itemprop="address">{{personalInfo.address}}</span></div>{{/if}}
                 {{#if personalInfo.phone}}<div class="contact-item secondaryFont"><span class="label">Phone:</span><span class="value" itemprop="telephone">{{personalInfo.phone}}</span></div>{{/if}}
                 {{#if personalInfo.website}}<div class="contact-item secondaryFont"><span class="label">Website:</span><span class="value"><a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a></span></div>{{/if}}
                 {{#if personalInfo.linkedin}}<div class="contact-item secondaryFont"><span class="label">LinkedIn:</span><span class="value"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span></div>{{/if}}
                 {{#if personalInfo.github}}<div class="contact-item secondaryFont"><span class="label">GitHub:</span><span class="value"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span></div>{{/if}}
                </div>
            </div>
            </header>
            
            {{#if summary}}
            <section class="research-interests">
            <h2 class="primaryFont">Research Interests</h2>
            <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
            <h2 class="primaryFont">Technical Skills</h2>
            {{#each skills}}
            <div class="skill-category">
                <h3 class="skill-category-title primaryFont">{{category}}</h3>
                <div class="skill-items secondaryFont">
                {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}
                </div>
            </div>
            {{/each}}
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="experience secondaryFont">
            <h2 class="primaryFont">Academic & Professional Experience</h2>
            {{#each workExperience}}
            <div class="position-entry" itemscope itemtype="http://schema.org/JobPosting">
                <div class="position-header">
                <div class="position-info">
                    <h3 class="job-title primaryFont" itemprop="title">{{jobTitle}}</h3>
                     <div class="institution-info secondaryFont" itemprop="hiringOrganization"><span class="company">{{company}}</span>{{#if location}}, <span class="location" itemprop="jobLocation">{{location}}</span>{{/if}}</div>
                 </div>
                 <div class="job-dates secondaryFont">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                    {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                </div>
                </div>
                {{#if description}}<div class="job-description secondaryFont" itemprop="description">{{{description}}}</div>{{/if}}
            </div>
            {{/each}}
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="publications">
            <h2 class="primaryFont">Research Projects & Publications</h2>
            {{#each projects}}
            <div class="publication-entry">
                <strong class="project-name primaryFont">{{name}}</strong>
                {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="methodologies secondaryFont">
                <span class="label">Methodologies/Tools:</span>{{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
                </div>
                {{/if}}
                {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">View Publication</a></div>{{/if}}
                {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
            </div>
            {{/each}}
            </section>
            {{/if}}
            
            {{#if education}}
            <section class="education">
            <h2 class="primaryFont">Education</h2>
            {{#each education}}
            <div class="edu-entry" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="edu-header">
                <div class="degree-info">
                    <strong class="edu-degree primaryFont" itemprop="credentialCategory">{{degree}}</strong>
                     <div class="institution-info secondaryFont" itemprop="recognizedBy"><span class="institution">{{institution}}</span>{{#if location}}, <span class="location">{{location}}</span>{{/if}}</div>
                 </div>
                 <div class="edu-dates secondaryFont">
                    <time>{{formatDate startDate}}</time> - 
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
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
            <div class="cert-entry">
                <div class="cert-header">
                <strong class="cert-name primaryFont">{{name}}</strong>
                 {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}</span>{{/if}}
                 </div>
                 {{#if issuer}}<div class="cert-issuer secondaryFont"><span class="issuer">{{issuer}}</span></div>{{/if}}
                 {{#if url}}<div class="cert-link secondaryFont"><a href="{{url}}" target="_blank">Verify</a></div>{{/if}}
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
            <div class="languages-grid">
                {{#each languages}}
                <div class="language-entry">
                 <span class="language-name primaryFont">{{name}}</span>
                 <span class="language-level secondaryFont">{{proficiency}}</span>
                </div>
                {{/each}}
            </div>
            </section>
            {{/if}}
        </article>`,
        css: `.resume.academic-research { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #1f2937; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #059669; }
        .name { font-family: 'Georgia', serif; font-weight: 600; color: #059669; margin-bottom: 6px; letter-spacing: 0.5px; text-align: center; }
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 4px; max-width: 500px; margin: 0 auto; }
        .contact-item { display: flex; align-items: flex-start; gap: 2px; margin-bottom: 2px; }
        .contact-item .label { font-weight: 600; color: #6b7280; white-space: nowrap; flex-shrink: 0; }
        .contact-item .value { color: #1f2937; text-align: left; word-wrap: break-word; line-height: 1.2; }
        .contact-item a { color: #1f2937; text-decoration: none; }
        section { margin-bottom: 10px; }
        h2 { font-family: 'Georgia', serif; font-weight: 600; color: #059669; padding-bottom: 2px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.5px; }
        .interests-text { line-height: 1.4; color: #4b5563; text-align: justify; font-style: italic; }
        .edu-entry, .position-entry, .publication-entry, .cert-entry, .achievement-entry { margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f3f4f6; }
        .edu-header, .position-header, .cert-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
        .edu-degree, .job-title, .project-name, .cert-name, .achievement-title { font-weight: 400; color: #1f2937; margin-bottom: 1px; }
        .institution-info { color: #6b7280; font-style: italic; }
        .edu-dates, .job-dates, .project-dates, .cert-dates, .achievement-date { color: #9ca3af; font-weight: 500; }
        .gpa { color: #6b7280; margin-bottom: 2px; }
        .summary, .job-description, .edu-description, .project-description, .achievement-description { margin: 2px 0; color: #4b5563; line-height: 1.3; text-align: justify; }
        .methodologies { margin: 2px 0; }
        .methodologies .label { font-weight: 400; color: #6b7280; }
        .publication-entry { border-left: 3px solid #10b981; padding-left: 8px; }
        .skill-category { margin-bottom: 6px; }
        .skill-category-title { font-weight: 400; color: #1f2937; margin-bottom: 2px; }
        .skill-items { color: #4b5563; line-height: 1.4; }
        .cert-issuer, .achievement-issuer { color: #6b7280; font-style: italic; }
        .achievement-date { font-style: italic; }
        .languages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-top: 4px; }
        .language-entry { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; padding: 2px 0; }
        .language-name { color: #1f2937; font-weight: 600; }
        .language-level { color: #6b7280; text-transform: capitalize; font-style: italic; }
        /* General list styling for HTML content in descriptions */
        ul, ol { margin: 0.15rem 0; padding-left: 0.8rem; }
        ul li, ol li { margin-bottom: 0.1rem; color: #4b5563; line-height: 1.2; }
        ul { list-style-type: disc; }
        ol { list-style-type: decimal; }
        
        /* Unified classes for consistent styling */
        .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #64748b; }
        .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
        .project-links a, .cert-link a, .contact-item a { color: #64748b; text-decoration: none; }
        .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
        },
        creator: null,
        tags: ['academic', 'research', 'education', 'scholarly', 'single-column', 'green']
    }
]