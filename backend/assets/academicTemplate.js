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
            sizes: { heading: 16, subheading: 14, body: 12, small: 10 }
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
        html: `<article class="resume academic-research" itemscope itemtype="http://schema.org/Person">
            <header class="header">

            {{#if personalInfo.isAddPhoto}}
            <div class="left-column">
                <div class="profile-image-container">
                <img alt="Profile picture of user" class="profile-image" src="{{personalInfo.profilePicture}}"/>
                </div>
                </div>
            {{/if}}
            <div class="right-column">
            <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
            {{#if isFresher}}{{else}}<h2 class="primaryFont" itemprop="title">{{title}}</h2>{{/if}}
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
                <strong class="project-name secondaryFont">{{name}}</strong>
                {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="technologies secondaryFont">
                <strong class="label">Technologies/Tools:</strong>{{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
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
                    <strong class="edu-degree secondaryFont" itemprop="credentialCategory">{{degree}}</strong>
                     <div class="institution-info secondaryFont" itemprop="recognizedBy"><span class="institution">{{institution}}</span>{{#if location}}, <span class="location">{{location}}</span>{{/if}}</div>
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
            <div class="cert-entry">
                <div class="cert-header">
                <strong class="cert-name secondaryFont">{{name}}</strong>
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
        .header { display: flex; justify-content: space-between; align-items: center; text-align: center; justify-content:center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #059669; }
        .left-column { padding-right: 5px; border-right: 2px solid #059669; margin-right: 5px; border-radius: 99999px; margin-bottm:1rem; }
        .name { font-family: 'Georgia', serif; font-weight: 600; color: #059669; margin-bottom: 6px; letter-spacing: 0.5px; text-align: center; }
        .contact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 800px; margin: 0 auto; }
        .contact-item { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2px; margin-bottom: 2px; }
        .contact-item .label { font-weight: 600; color: #6b7280; white-space: nowrap; flex-shrink: 0; }
        .contact-item .value { color: #1f2937; text-align: left; word-wrap: break-word; line-height: 1.2; }
        .contact-item a { color: #1f2937; text-decoration: none; word-wrap: break-word;}
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
        .technologies { margin: 2px 0; }
        .technologies .label { font-weight: 400; color: #6b7280; }
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
    },

    {
        name: 'Professional Academic Research',
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
        html: `<article class="resume professional-academic-research" itemscope itemtype="http://schema.org/Person">
                <main>
                <div class="sidebar">
                {{#if personalInfo.isAddPhoto}}
                <div class="profile-image-container">
                <img alt="Profile picture of user" class="profile-image" src="{{personalInfo.profilePicture}}"/>
                </div>
                {{/if}}
                
                <section class="contact-info">
                {{#if personalInfo.phone}}
                <div class="contact-item secondaryFont">
                <span>{{personalInfo.phone}}</span>
                </div>
                {{/if}}
                {{#if personalInfo.address}}
                <div class="contact-item secondaryFont">
                <span>{{personalInfo.address}}</span>
                </div>
                {{/if}}
                {{#if personalInfo.email}}
                <div class="contact-item secondaryFont">
                <span>{{personalInfo.email}}</span>
                </div>
                {{/if}}
                {{#if personalInfo.website}}
                <div class="contact-item secondaryFont">
                <span><a href="{{personalInfo.website}}" target="_blank">{{personalInfo.website}}</a></span>
                </div>
                {{/if}}
                {{#if personalInfo.linkedin}}
                <div class="contact-item secondaryFont">
                <span><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>
                </div>
                {{/if}}
                {{#if personalInfo.github}}
                <div class="contact-item secondaryFont">
                <span><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>
                </div>
                {{/if}}
                </section>
                {{#if education}}
                <section class="education">
                <h2 class="section-title primaryFont">EDUCATION</h2>
                {{#each education}}
                <div class="education-item {{#if @last}}style="margin-bottom:0;"{{/if}}">
                <strong class="secondaryFont">{{institution}}</strong>
                <p>{{degree}}</p>
                <p class="location secondaryFont">{{location}}</p>
                <time class="date secondaryFont">{{#if startDate}}{{ formatDate startDate}} - {{/if}}{{#if isCurrentlyStudying}}Present{{else}}{{ formatDate endDate}}{{/if}}</time>
                {{#if gpa}}
                <p class="gpa secondaryFont">GPA: {{gpa}}</p>
                {{/if}}
                {{#if description}}
                <p class="description secondaryFont">{{{description}}}</p>
                {{/if}}
                </div>
                {{/each}}
                </section>
                {{/if}}

                {{#if certifications}}
                <section class="certifications">
                <h2 class="section-title primaryFont">CERTIFICATIONS</h2>
                {{#each certifications}}
                <div class="certification-item {{#if @last}}style="margin-bottom:0;"{{/if}}">
                <div class="certification-header">
                <strong class="secondaryFont">{{name}}</strong>
                <span class="certification-date secondaryFont">{{ formatDate date}}</span>
                </div>
                <p class="certification-issuer secondaryFont">{{issuer}}</p>
                {{#if expiryDate}}
                <p class="cert-expiry secondaryFont">Expires: {{ formatDate expiryDate}}</p>
                {{/if}}
                {{#if credentialId}}
                <p class="cert-id secondaryFont">ID: {{credentialId}}</p>
                {{/if}}
                {{#if url}}
                <p class="cert-link secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></p>
                {{/if}}
                <p class="description secondaryFont">{{{description}}}</p>
                </div>
                {{/each}}
                </section>
                {{/if}}
                </div>
                <div class="main-content">
                <div class="header">
                <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
                {{#if isFresher}}{{else}}<h2 class="primaryFont" itemprop="title">{{title}}</h2>{{/if}}
                </div>
                {{#if summary}}
                <section class="summary">
                <h2 class="section-title primaryFont">PROFESSIONAL SUMMARY</h2>
                <p class="summary-text secondaryFont">{{{summary}}}</p>
                </section>
                {{/if}}
                {{#if skills}}
                <section class="skills">
                <h2 class="section-title primaryFont">SKILLS</h2>
                {{#each skills}}
                <div class="skill-category {{#if @last}}style="margin-bottom:0;"{{/if}}">
                <strong class="skill-category-title secondaryFont">{{category}}</strong>
                <ul class="skill-list">
                {{#each items}}
                <li class="secondaryFont">{{name}} <span class="skill-level secondaryFont">({{level}})</span></li>
                {{/each}}
                </ul>
                </div>
                {{/each}}
                </section>
                {{/if}}
                {{#if projects}}
                <section class="projects">
                <h2 class="section-title primaryFont">PROJECTS</h2>
                {{#each projects}}
                <div class="project-item {{#if @last}}style="margin-bottom:0;"{{/if}}">
                <div class="project-header">
                <strong class="project-name secondaryFont">{{name}}</strong>
                </div>
                {{#if technologies}}
                <p class="technologies secondaryFont">Technologies: {{join technologies ", "}}</p>
                {{/if}}
                {{#if url}}
                <p class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></p>
                {{/if}}
                {{#if githubUrl}}
                <p class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></p>
                {{/if}}
                <p class="description secondaryFont">{{{description}}}</p>
                </div>
                {{/each}}
                </section>  
                {{/if}}
                <div>
                {{#if workExperience}}
                <section class="work-experience">
                <h2 class="section-title primaryFont">WORK EXPERIENCE</h2>
                {{#each workExperience}}
                <div class="work-experience-item secondaryFont" {{#if @last}}style="margin-bottom:0;"{{/if}}>
                <div class="work-experience-header">
                <strong class="company secondaryFont">{{company}}</h3>
                <span class="secondaryFont">{{ formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{ formatDate endDate}}{{/if}}</span>
                </div>
                <strong class="job-title secondaryFont">{{jobTitle}}</strong>
                <p class="location secondaryFont">{{location}}</p>
                <p class="description secondaryFont">{{{description}}}</p>
                {{#if achievements}}
                <ul class="experience-list secondaryFont">
                {{#each achievements}}
                <li>{{this}}</li>
                {{/each}}
                </ul>
                {{/if}}
                </div>
                {{/each}}
                </section>  
                {{/if}}

                
                {{#if achievements}}
                <section class="achievements">
                <h2 class="section-title primaryFont" style="margin-bottom: 0rem;">ACHIEVEMENTS</h2>
                {{#each achievements}}
                <div class="achievement-item secondaryFont {{#if @last}}style="margin-bottom:0;"{{/if}}">
                <div class="achievement-header">
                <h3 class="secondaryFont">{{title}}</h3>
                <time class="achievement-date secondaryFont">{{ formatDate date}}</time>
                </div>
                <p class="issuer secondaryFont">{{issuer}}</p>
                <p class="description secondaryFont">{{{description}}}</p>
                </div>
                {{/each}}
                </section>
                {{/if}}

                {{#if languages}}
                <section class="languages">
                <h2 class="section-title primaryFont">LANGUAGES</h2>
                {{#each languages}}
                <div class="language-item secondaryFont {{#if @last}}style="margin-bottom:0;"{{/if}}">
                <h3 class="language-name secondaryFont">{{name}}</h3>
                <p class="proficiency secondaryFont">{{proficiency}}</p>
                </div>
                {{/each}}
                </section>
                {{/if}}

                {{#if customFields}}
                <section class="custom-fields">
                <h2 class="section-title primaryFont">CUSTOM INFORMATION</h2>
                {{#each customFields}}
                <div class="custom-field-item secondaryFont {{#if @last}}style="margin-bottom:0;"{{/if}}">
                <h3 class="custom-field-title secondaryFont">{{title}}</h3>
                {{#if type "===" "list"}}
                <ul class="custom-field-list secondaryFont">
                {{#each split content ", "}}
                <li>{{this}}</li>
                {{/each}}
                </ul>
                {{else if type "===" "date"}}
                <p class="custom-field-date">{{ formatDate content}}</p>
                {{else}}
                <p class="custom-field-content">{{content}}</p>
                {{/if}}
                </div>
                {{/each}}
                </section>
                {{/if}}
                </div>
                </div>
                </main>
        </article>`,
        css: `.resume.professional-academic-research { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.35in 0.35in; background: white; color: #1f2937; line-height: 1.4; }
        :root {
                            --primary-color: #1d4e6d;
                            --background-light: #ffffff;
                            --text-light: #374151;
                            --text-dark-blue-sidebar: #ffffff;
                            --font-family-display: "Lato", sans-serif;
                        }
                        body {
                            font-family: var(--font-family-display);
                            background-color: #ffffff;
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        main {
                            width: 100%;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                        }
                        .sidebar {
                            background-color: var(--primary-color);
                            color: var(--text-dark-blue-sidebar);
                            padding: 1rem;
                        }
                        .main-content {
                            background-color: var(--background-light);
                            padding: 1rem;
                        }
                        .profile-image-container {
                            display: flex;
                            justify-content: center;
                            margin-top: -5rem;
                            margin-bottom: 1rem;
                            }
                        .profile-image {
                            width: 10rem;height: 10rem;border-radius: 9999px;border: 4px solid white;
                            object-fit: cover;
                        }

                        // section.custom-fields, section.languages, section.work-experience, section.projects, section.achievements, section.contact-info, section.summary, section.certifications, section.education {
                        //     margin-bottom: 0rem;
                        //     padding-bottom : 0rem;
                        // }
                        // h2.section-title {
                        //     font-size: 1.25rem;
                        //     font-weight: 700;
                        //     letter-spacing: 0.05em;
                        //     margin-bottom: 0 !important;
                        //     padding-bottom: 0 !important;
                        // }

                        section { margin-bottom: 6px; }
          h2 { font-weight: bold; text-transform: uppercase; margin-bottom: 6px; color: var(--text-light); padding-bottom: 8px; border-bottom: 1px solid #9ca3af; letter-spacing: 0.5px; }

          .sidebar h2 { color: var( --text-dark-blue-sidebar);
                        }
                        .education-item, .skill-category, .certification-item, .work-experience-item, .contact-item, .project-item, .achievement-item, .language-item {
                            margin-bottom: 0.25rem;
                        }
                        .education-item p, .reference-item p {
                            font-size: 0.75rem;color: #e5e7eb;
                            margin: 0;
                        }
                        .education-item .date, .reference-item .sub-text {
                            color: #d1d5db;
                        }
                        hr {
                            border-color: #9ca3af;
                            margin-top: 0.75rem;
                            margin-bottom: 0.5rem;
                            border-top-width: 1px;
                            border-style: solid;
                        }
                        .main-content hr,h2 {
                            border-color: #d1d5db;
                        }

                        .skill-category {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 1rem;
                        }
                        .skill-list, .experience-list {
                            list-style-position: inside;
                            list-style-type: disc;
                            padding-left: 0;
                            font-size: 0.875rem;
                        }
                        .header {
                            text-align: center;
                        }
                        h1 {
                            font-size: 2.25rem;font-weight: 800;
                            letter-spacing: 0.05em;
                            color: var(--text-light);
                            margin: 0;
                        }
                        .job-title {
                            font-size: 1.125rem;color: var(--text-light);
                        }
                        .contact-info {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            font-size: 0.875rem;
                        }

                        .contact-item .material-symbols-outlined {
                            margin-right: 0.75rem;
                            font-size: 16px;
                            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                        }
                        .about-me p {
                            font-size: 0.875rem;
                            color: var(--text-light);
                            line-height: 1.625;
                            margin: 2px;
                        }
                            
                        @media (min-width: 768px) {
                            body {
                            }
                            main {
                                flex-direction: row;
                            }
                            .sidebar {
                                width: 33.333333%;
                            }
                            .main-content {
                                width: 66.666667%;
                            }
                            .profile-image-container {
                                margin-top: 0;
                            }
                            .header {
                                text-align: left;
                            }
                            h1 {
                                font-size: 3rem;}
                            .contact-info {
                                align-items: flex-start;
                            }
                        }
        /* General list styling for HTML content in descriptions */
        ul, ol { margin: 0.15rem 0; padding-left: 0.8rem; }
        ul li, ol li { margin-bottom: 0.1rem; line-height: 1.2; }
        ul { list-style-type: disc; }
        ol { list-style-type: decimal; }
        
        /* Unified classes for consistent styling */
        .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .date { color: #64748b; }
        .language-name, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
        .cert-link a, .contact-item a { color: var(--text-dark-blue-sidebar); text-decoration: none; }
        .project-links a {
        color: var(--text-light); text-decoration: none;
        }
        .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
        },
        creator: null,
        tags: ['academic', 'research', 'education', 'scholarly', 'single-column', 'green']
    }
]