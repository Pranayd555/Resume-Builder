module.exports = [
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
        sectionSpacing: 1,
        fontFamily: 'Arial'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<article class="resume classic-traditional" itemscope itemtype="http://schema.org/Person">
            <header class="header">
              <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
              {{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

              <div class="contact-info secondaryFont">
                <span class="contact-item secondaryFont" itemprop="email">{{personalInfo.email}}</span>
                {{#if personalInfo.phone}} | <span class="contact-item secondaryFont" itemprop="telephone">{{personalInfo.phone}}</span>{{/if}}
                {{#if personalInfo.address}} | <span class="contact-item secondaryFont" itemprop="address">{{personalInfo.address}}</span>{{/if}}
                {{#if personalInfo.website}} | <a class="contact-item secondaryFont" href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a>{{/if}}
                {{#if personalInfo.linkedin}} | <a class="contact-item secondaryFont" href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a>{{/if}}
                {{#if personalInfo.github}} | <a class="contact-item secondaryFont" href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a>{{/if}}
              </div>
            </header>
            
            {{#if summary}}
            <section class="objective secondaryFont">
              <h2 class="primaryFont">PROFESSIONAL OBJECTIVE</h2>
              <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
              <h2 class="primaryFont">CORE COMPETENCIES</h2>
              {{#each skills}}
              <div class="skill-category">
                <div class="skill-category-title primaryFont">{{category}}:</div>
                <div class="skill-items secondaryFont">{{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</div>
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if workExperience}}
            <section class="experience secondaryFont">
              <h2 class="primaryFont">PROFESSIONAL EXPERIENCE</h2>
              {{#each workExperience}}
              <div class="job-entry" itemscope itemtype="http://schema.org/JobPosting">
                <div class="job-header">
                  <h3 class="primaryFont" itemprop="title">{{jobTitle}}</h3>
                  <span class="job-dates secondaryFont">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                    {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                  </span>
                </div>
                <div class="company-info secondaryFont">
                  <em class="company secondaryFont" itemprop="hiringOrganization">{{company}}</em>{{#if location}}, <span class="location secondaryFont" itemprop="jobLocation">{{location}}</span>{{/if}}
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
            
            {{#if education}}
            <section class="education">
              <h2 class="primaryFont">EDUCATION</h2>
              {{#each education}}
              <div class="edu-entry" itemscope itemtype="http://schema.org/EducationalOccupationalCredential">
                <div class="edu-header">
                  <h3 class="primaryFont" itemprop="credentialCategory">{{degree}}</h3>
                  <span class="edu-dates secondaryFont">
                    {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                    {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                  </span>
                </div>
                <div class="institution-info secondaryFont">
                  <em class="institution secondaryFont" itemprop="recognizedBy">{{institution}}</em>{{#if location}}, <span class="location secondaryFont">{{location}}</span>{{/if}}
                </div>
                {{#if gpa}}<div class="gpa secondaryFont">GPA: {{gpa}}</div>{{/if}}
                {{#if description}}<div class="edu-description secondaryFont">{{{description}}}</div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="projects">
              <h2 class="primaryFont">KEY PROJECTS</h2>
              {{#each projects}}
              <div class="project-entry">
                <div class="project-header">
                  <h3 class="primaryFont">{{name}}</h3>
                  {{#if startDate}}<span class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</span>{{/if}}
                </div>
                {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}<div class="technologies secondaryFont"><div class="tech-label primaryFont">Technologies:</div> {{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</div>{{/if}}
                {{#if url}}<div class="project-links secondaryFont"><div class="url-label">URL:</div> <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if achievements}}
            <section class="achievements-section secondaryFont">
              <h2 class="primaryFont">ACHIEVEMENTS & AWARDS</h2>
              {{#each achievements}}
              <div class="achievement-entry">
                {{#if title}}<div class="achievement-header"><h3 class="primaryFont">{{title}}</h3>{{#if date}}<span class="achievement-date secondaryFont">{{formatDate date}}</span>{{/if}}</div>{{/if}}
                {{#if description}}<div class="achievement-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if issuer}}<div class="achievement-issuer secondaryFont"><em>{{issuer}}</em></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if certifications}}
            <section class="certifications">
              <h2 class="primaryFont">PROFESSIONAL CERTIFICATIONS</h2>
              {{#each certifications}}
              <div class="cert-entry">
                <div class="cert-header">
                  <h3 class="primaryFont">{{name}}</h3>
                  {{#if date}}<span class="cert-dates secondaryFont">{{formatDate date}}</span>{{/if}}
                </div>
                {{#if issuer}}<div class="cert-issuer secondaryFont"><em class="issuer secondaryFont">{{issuer}}</em></div>{{/if}}
                {{#if expiryDate}}<div class="cert-expiry secondaryFont"><div class="expiry-label">Expires:</div> {{formatDate expiryDate}}</div>{{/if}}
                {{#if credentialId}}<div class="cert-id secondaryFont"><div class="id-label">ID:</div> {{credentialId}}</div>{{/if}}
                {{#if url}}<div class="cert-link secondaryFont"><div class="url-label">URL:</div> <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if languages}}
            <section class="languages">
              <h2 class="primaryFont">LANGUAGES</h2>
              {{#each languages}}<div class="language-entry"><div class="language-name secondaryFont">{{name}}:</div> <span class="language-level secondaryFont">{{proficiency}}</span></div>{{/each}}
            </section>
            {{/if}}
            
            {{#if customFields}}
            <section class="custom-fields">
              {{#each customFields}}
              <div class="custom-field-entry">
                <h2 class="primaryFont">{{title}}</h2>
                <div class="custom-field-content secondaryFont">{{content}}</div>
              </div>
              {{/each}}
            </section>
            {{/if}}
          </article>`,
      css: `.resume.classic-traditional { font-family: 'Times New Roman', 'Georgia', serif; max-width: 8.5in; margin: 0 auto; background: white; color: black; font-size: 15px; line-height: 1; }
          @media print { .resume.classic-traditional { max-width: none; margin: 0; padding: 0.5in; } }
          @media (max-width: 768px) { .resume.classic-traditional { padding: 0.5in; font-size: 13px; } }
          
          .header { text-align: center; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 1px solid black; }
          .name { font-weight: bold; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
          .contact-info { line-height: 1; }
          .contact-info a { color: black; text-decoration: none; }
          .contact-info a:hover { text-decoration: underline; }
          
          section { margin-bottom: 6px; }
          h2 { font-weight: bold; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 1px solid black; letter-spacing: 0.5px; }
          .objective p { text-align: justify; margin-bottom: 0; }
          
          .job-entry, .edu-entry, .project-entry, .achievement-entry, .cert-entry { margin-bottom: 2px; }
          .job-header, .edu-header, .project-header, .achievement-header, .cert-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
          .job-header h3, .edu-header h3, .project-header h3, .achievement-header h3, .cert-header h3 { font-weight: bold; margin-bottom: 2px; }
          .dates { font-style: italic; }
          
          .company-info, .institution-info, .cert-issuer, .issuer-info { margin-bottom: 2px; }
          .summary, .job-description, .edu-description, .project-description, .achievement-description { margin: 2px 0; text-align: justify; }
          
          .achievements { margin: 2px 0; }
          .achievements li { margin-bottom: 2px; }
          
          /* General list styling for HTML content in descriptions */
          ul, ol { margin: 2px 0; padding-left: 1rem; }
          ul li, ol li { margin-bottom: 2px; line-height: 1.3; }
          ul { list-style-type: disc; }
          ol { list-style-type: decimal; }
          .gpa { margin-bottom: 2px; }
          
          .skill-category { margin-bottom: 2px; }
          .skill-category-title { font-weight: bold; margin-bottom: 2px; }
          .skill-items { }
          
          .technologies, .project-links, .cert-expiry, .cert-id, .cert-link { margin-bottom: 2px; }
          .tech-label, .url-label, .github-label, .expiry-label, .id-label { font-weight: bold; display: inline; }
          .project-links a, .cert-link a { color: black; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover { text-decoration: underline; }
          
          .language-entry { margin-bottom: 2px; display: flex; gap: 8px; }
          .language-name { font-weight: bold; }
          
          .custom-field-entry { margin-bottom: 2px; }
          .custom-field-entry h2 { margin-bottom: 2px; }
          .custom-field-content { line-height: 1; text-align: justify; }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #666666; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #000000; }
          .project-links a, .cert-link a, .contact-item a { color: #000000; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
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
        sectionSpacing: 1,
        fontFamily: 'Arial'
      }
    },
    availability: { tier: 'free', isPublic: true, isActive: true },
    templateCode: {
      html: `<div class="resume classic-professional">
              <header class="header">
               <div class="right-column">
                <h1 class="name primaryFont">{{personalInfo.fullName}}</h1>{{#unless isFresher}}
  <h2 class="primaryFont" itemprop="title">{{title}}</h2>
{{/unless}}

                <div class="contact-details secondaryFont">
                  {{#if personalInfo.address}}<span class="contact-item secondaryFont">{{personalInfo.address}}</span>{{/if}}
                  {{#if personalInfo.phone}}{{#if personalInfo.address}} | {{/if}}<span class="contact-item secondaryFont">{{personalInfo.phone}}</span>{{/if}}
                  {{#if personalInfo.email}}{{#if personalInfo.phone}} | {{/if}}<span class="contact-item secondaryFont">{{personalInfo.email}}</span>{{/if}}
                </div>
                {{#if personalInfo.linkedin}}
                  <div class="linkedin secondaryFont">
                    LinkedIn: <a class="contact-item secondaryFont" href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a>
                  </div>
                {{/if}}
                {{#if personalInfo.github}}
                  <div class="github secondaryFont">
                    GitHub: <a class="contact-item secondaryFont" href="{{personalInfo.github}}" target="_blank" itemprop="url">{{personalInfo.github}}</a>
                  </div>
                {{/if}}
                {{#if personalInfo.website}}
                  <div class="website secondaryFont">
                    Website: <a class="contact-item secondaryFont" href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a>
                  </div>
                {{/if}}
                </div>
              {{#if personalInfo.isAddPhoto}} 
              {{#if personalInfo.profilePicture}}
              <div class="header=left">
                <div class="profile-image-container">
                <img alt="Profile picture of user" class="profile-image" src="{{personalInfo.profilePicture}}"/>
                </div>
                </div>
                {{/if}}
              {{/if}}
              </header>
              
              {{#if summary}}
                <section class="summary-section">
                  <h2 class="primaryFont">PROFESSIONAL SUMMARY</h2>
                  <div class="summary secondaryFont">{{{summary}}}</div>
                </section>
              {{/if}}
              
              {{#if workExperience}}
                <section class="experience-section">
                  <h2 class="primaryFont">PROFESSIONAL EXPERIENCE</h2>
                  {{#each workExperience}}
                    <div class="job-entry">
                      <div class="job-title-line">
                        <h3 class="primaryFont">{{jobTitle}}</h3>
                        <span class="job-dates secondaryFont">
                          {{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{#if endDate}}{{formatDate endDate}}{{/if}}{{/if}}
                        </span>
                      </div>
                      <div class="company-line secondaryFont">
                        <span class="company secondaryFont">{{company}}</span>{{#if location}}, <span class="location secondaryFont">{{location}}</span>{{/if}}
                      </div>
                      {{#if description}}
                        <div class="job-description secondaryFont">{{{description}}}</div>
                      {{/if}}
                    </div>
                  {{/each}}
                </section>
              {{/if}}
              
              {{#if education}}
                <section class="education-section">
                  <h2 class="primaryFont">EDUCATION</h2>
                  {{#each education}}
                    <div class="education-entry">
                      <div class="education-line">
                        <h3 class="primaryFont">{{degree}}</h3>
                        <span class="edu-dates secondaryFont">
                          {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                          {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
                        </span>
                      </div>
                      <div class="school-line secondaryFont">
                        <span class="institution secondaryFont">{{institution}}</span>{{#if location}}, <span class="location secondaryFont">{{location}}</span>{{/if}}
                      </div>
                      {{#if gpa}}
                        <div class="gpa secondaryFont">GPA: {{gpa}}</div>
                      {{/if}}
                      {{#if description}}
                        <div class="edu-description secondaryFont">{{{description}}}</div>
                      {{/if}}
                    </div>
                  {{/each}}
                </section>
              {{/if}}
              
              {{#if projects}}
                <section class="projects-section">
                  <h2 class="primaryFont">KEY PROJECTS</h2>
                  {{#each projects}}
                    <div class="project-entry">
                      <div class="project-line">
                        <h3 class="primaryFont">{{name}}</h3>
                        {{#if startDate}}
                          <span class="project-dates secondaryFont">
                            {{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}
                          </span>
                        {{/if}}
                      </div>
                      {{#if description}}
                        <div class="project-description secondaryFont">{{{description}}}</div>
                      {{/if}}
                      {{#if technologies}}
                        <div class="project-technologies primaryFont">
                          Technologies: <span class="secondaryFont">{{#each technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</span>
                        </div>
                      {{/if}}
                      {{#if url}}
                        <div class="project-links secondaryFont">
                          <a href="{{url}}" target="_blank">{{url}}</a>
                        </div>
                      {{/if}}
                      {{#if githubUrl}}
                        <div class="project-links secondaryFont">
                          <a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a>
                        </div>
                      {{/if}}
                    </div>
                  {{/each}}
                </section>
              {{/if}}
              
              {{#if skills}}
                <section class="skills-section">
                  <h2 class="primaryFont">CORE COMPETENCIES</h2>
                  <div class="skills-grid">
                    {{#each skills}}
                      <div class="skill-category">
                        <div class="skill-category-title primaryFont">{{category}}</div>
                        <div class="skill-items secondaryFont">
                          {{#each items}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}
                        </div>
                      </div>
                    {{/each}}
                  </div>
                </section>
              {{/if}}
              
              {{#if certifications}}
                <section class="certifications-section">
                  <h2 class="primaryFont">CERTIFICATIONS</h2>
                  {{#each certifications}}
                    <div class="cert-entry">
                      <div class="cert-line">
                        <h3 class="primaryFont">{{name}}</h3>
                        {{#if date}}
                          <span class="cert-dates secondaryFont">{{formatDate date}}</span>
                        {{/if}}
                      </div>
                      {{#if issuer}}
                        <div class="cert-issuer secondaryFont"><span class="issuer secondaryFont">{{issuer}}</span></div>
                      {{/if}}
                    </div>
                  {{/each}}
                </section>
              {{/if}}
            </div>`,
      css: `.resume.classic-professional { font-family: 'Georgia', serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: black; line-height: 1; }
            .header {  display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 2px solid #1f2937; }
            .name { font-weight: bold; color: #1f2937; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
            .contact-details { color: #4b5563; margin-bottom: 2px; }
            .linkedin { color: #6b7280;} .linkedin a { color: #6b7280; text-decoration: none; }
            .github { color: #6b7280;} .github a { color: #6b7280;text-decoration: none; }
            .website { color: #6b7280;} .website a { color: #6b7280; text-decoration: none; }
            section { margin-bottom: 6px; }
            section h2 { font-weight: bold; color: #1f2937; text-transform: uppercase; margin-bottom: 6px; border-bottom: 1px solid #1f2937; padding-bottom: 2px; letter-spacing: 0.5px; }
            .summary { line-height: 1; color: #1f2937; text-align: justify; }
            .job-entry { margin-top: 2px; margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px dotted #6b7280; }
            .job-title-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
            .job-title-line h3 { color: #1f2937; font-weight: bold; margin: 0; }
            .job-dates { color: #6b7280; font-style: italic; }
            .company-line { color: #4b5563; margin-bottom: 2px; font-weight: 500; }
            .job-description { color: #1f2937; margin: 2px 0; line-height: 1; }
            .education-entry { margin-bottom: 2px; }
            .education-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
            .education-line h3 { color: #1f2937; font-weight: bold; margin: 0; }
            .edu-dates { color: #6b7280; font-style: italic; }
            .school-line { color: #4b5563; margin-bottom: 2px; font-weight: 500; }
            .gpa { color: #6b7280; margin-bottom: 2px; }
            .edu-description { color: #1f2937; line-height: 1; }
            .project-entry { margin-top: 2px; margin-bottom: 2px; padding-bottom: 2px; border-bottom: 1px dotted #6b7280; }
            .project-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
            .project-line h3 { color: #1f2937; font-weight: bold; margin: 0; }
            .project-dates { color: #6b7280; font-style: italic; }
            .project-description { color: #1f2937; margin: 2px 0; line-height: 1; }
            .project-technologies { color: #4b5563; margin-bottom: 2px; font-weight: 500; }
            .project-links { color: #6b7280; margin-bottom: 2px; }
            .project-links a { color: #1f2937; text-decoration: none; }
            .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
            .skill-category-title { font-weight: bold; color: #1f2937; margin-bottom: 2px; }
            .skill-items { color: #4b5563; line-height: 1; }
            .cert-entry { margin-bottom: 2px; }
            .cert-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
            .cert-line h3 { color: #1f2937; font-weight: bold; margin: 0; }
            .cert-dates { color: #6b7280; font-style: italic; }
            .cert-issuer { color: #4b5563; font-style: italic; }
            
            /* General list styling for HTML content in descriptions */
            ul, ol { margin: 0.25rem 0; padding-left: 1rem; }
            ul li, ol li { margin-bottom: 0.125rem; color: #4b5563; line-height: 1.3; }
            ul { list-style-type: disc; }
            ol { list-style-type: decimal; }
            
            /* Unified classes for consistent styling */
            .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #6b7280; }
            .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
            .project-links a, .cert-link a, .contact-item a { color: #1f2937; text-decoration: none; }
            .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
    },
    creator: null,
    tags: ['classic', 'professional', 'conservative', 'formal']
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
        { "name": "projects", "position": 6, "isRequired": false, "isVisible": true },
        { "name": "certifications", "position": 7, "isRequired": false, "isVisible": true },
        { "name": "achievements", "position": 8, "isRequired": false, "isVisible": true },
        { "name": "languages", "position": 9, "isRequired": false, "isVisible": true },
        { "name": "customFields", "position": 10, "isRequired": false, "isVisible": true }
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
                
                {{#if skills}}
                <section class="skills">
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
                
                {{#if projects}}
                <section class="projects">
                  <h2 class="primaryFont">Key Projects</h2>
                  {{#each projects}}
                  <div class="project-item">
                    <div class="project-header">
                      <div class="project-name primaryFont">{{name}}</div>
                      {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                    </div>
                    {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
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
                
                {{#if certifications}}
                <section class="certifications">
                  <h2 class="primaryFont">Professional Certifications</h2>
                  {{#each certifications}}
                  <div class="cert-item">
                    <span class="cert-name secondaryFont">{{name}}</span>
                    <span class="cert-meta">
                      <span class="issuer secondaryFont">{{issuer}}</span>
                      {{#if date}}<span class="cert-dates secondaryFont">({{formatDate date}} {{#if expiryDate}}<span class="cert-expiry secondaryFont">- {{formatDate expiryDate}}</span>{{/if}})</span>{{/if}}
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
                  <h2 class="primaryFont">Additional Information</h2>
                  {{#each customFields}}
                  <div class="custom-field-item">
                    <h3 class="custom-field-title primaryFont">{{title}}</h3>
                    <div class="custom-content secondaryFont">{{content}}</div>
                  </div>
                  {{/each}}
                </section>
                {{/if}}
              </article>`,
      "css": `.resume.classic-serif {
                font-family: 'Times New Roman', serif;
                max-width: 8.5in;
                margin: 0 auto;
                padding: 0.5in 0.35in;
                background: white;
                color: #111827;
                line-height: 1.4;
              }
              
              .header {
                text-align: left !important;
                margin-bottom: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #d1d5db;
              }
              
              .name {
                line-height: 1.2;
                letter-spacing: 0.5px;
                margin: 0 0 3px;
                font-variant: small-caps;
                text-align: left !important;
                font-weight: bold;
              }
              
              .contact-item {
                color: #4b5563;
                line-height: 1.3;
              }
              
              .contact-item a {
                color: #4b5563;
                text-decoration: none;
              }
              
              section {
                margin-top: 8px;
              }
              
              h2 {
                text-transform: uppercase;
                margin: 6px 0 3px;
                letter-spacing: 0.5px;
                color: #1f2937;
                border-left: 3px solid #4b5563;
                padding-left: 4px;
                font-weight: bold;
              }
              
              h3 {
                font-weight: bold;
                margin: 3px 0 2px;
                color: #374151;
              }
              
              .job-header,
              .edu-header,
              .project-header,
              .achievement-header,
              .cert-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                margin-bottom: 2px;
              }
              
              .dates {
                color: #6b7280;
              }
              
              .gpa {
                color: #374151;
                margin: 2px 0;
              }
              
              .company,
              .institution,
              .issuer {
                color: #4b5563;
                margin: 2px 0;
              }
              
              .summary,
              .job-description,
              .project-description,
              .edu-description,
              .achievement-description {
                margin: 3px 0;
                color: #374151;
                line-height: 1.4;
              }
              
              .achievements {
                margin: 3px 0;
              }
              
              .achievements li {
                margin-bottom: 2px;
                color: #374151;
              }
              
              .skill-category {
                margin-bottom: 4px;
              }
              
              .skill-items {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 2px;
              }
              
              .skill-item {
                background: #f3f4f6;
                padding: 2px 4px;
                border-radius: 2px;
                color: #374151;
              }
              
              .technologies {
                margin: 3px 0;
              }
              
              .tech-tag {
                background: #e5e7eb;
                padding: 1px 3px;
                border-radius: 2px;
                margin-right: 3px;
              }
              
              .project-links {
                margin: 2px 0;
              }
              
              .project-links a {
                color: #374151;
                text-decoration: none;
              }
              
              .project-links a:hover {
                text-decoration: underline;
              }
              
              .cert-link a {
                color: #374151;
                text-decoration: none;
              }
              
              .cert-link a:hover {
                text-decoration: underline;
              }
              
              .cert-expiry,
              .cert-id {
                color: #6b7280;
                margin: 1px 0;
              }
              
              .issuer-info {
                color: #6b7280;
                margin: 2px 0;
              }
              
              .language-item {
                margin: 2px 0;
              }
              
              .custom-field {
                margin-bottom: 4px;
              }
              
              .custom-content {
                margin: 2px 0;
              }
              
              p {
                margin: 2px 0;
              }
              
              .job,
              .edu,
              .project,
              .cert,
              .achievement {
                margin-bottom: 6px;
              }
              
              ul,
              ol {
                margin: 0.25rem 0;
                padding-left: 1rem;
              }
              
              ul li,
              ol li {
                margin-bottom: 0.125rem;
                color: #4b5563;
                line-height: 1.3;
              }
              
              ul {
                list-style-type: disc;
              }
              
              ol {
                list-style-type: decimal;
              }
              
              /* Unified classes for consistent styling */
              .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .cert-dates, .cert-expiry, .cert-id, .achievement-issuer, .cert-issuer { color: #6b7280; }
              .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
              .project-links a, .cert-link a, .contact-item a { color: #374151; text-decoration: none; }
              .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
    },
    creator: null,
    "tags": ["classic", "serif", "traditional", "academic", "single-column", "gray"]
  },

  {
    "name": "Classic two column",
    "description": "A classic serif template with a two-column layout, white background, and serif font.",
    "category": "classic",
    "preview": { "thumbnail": { "url": "placeholder-will-be-replaced-by-puppeteer" } },
    "layout": {
      "type": "two-column",
      "sections": [
        { "name": "personalInfo", "position": 1, "isRequired": true, "isVisible": true },
        { "name": "summary", "position": 2, "isRequired": false, "isVisible": true },
        { "name": "education", "position": 3, "isRequired": false, "isVisible": true },
        { "name": "workExperience", "position": 4, "isRequired": false, "isVisible": true },
        { "name": "skills", "position": 5, "isRequired": false, "isVisible": true },
        { "name": "projects", "position": 6, "isRequired": false, "isVisible": true },
        { "name": "certifications", "position": 7, "isRequired": false, "isVisible": true },
        { "name": "achievements", "position": 8, "isRequired": false, "isVisible": true },
        { "name": "languages", "position": 9, "isRequired": false, "isVisible": true },
        { "name": "customFields", "position": 10, "isRequired": false, "isVisible": true }
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
        "primary": "classic-serif",
        "secondary": "classic-serif",
        "sizes": { "heading": 16, "subheading": 14, "body": 12, "small": 10 }
      },
      "template": {
        "headerLevel": "h3",
        "headerFontSize": 16,
        "fontSize": 13,
        "lineSpacing": 1.3,
        "sectionSpacing": 1
      }
    },
    "availability": { "tier": "free", "isPublic": true, "isActive": true },
    "templateCode": {
      "html": `
                    <body class="classic-two-column">
                    <div class="resume-container">
                    <header>
                    <h1 class="name primaryFont">{{personalInfo.fullName}}</h1>
                    {{#unless isFresher}}
  <h2 class="primaryFont fresher" itemprop="title">{{title}}</h2>
{{/unless}}

                    </header>
                    <section class="contact-info secondaryFont">
                    {{#if personalInfo.address}}
                    <div class="contact-item secondaryFont">
                    <span>{{personalInfo.address}}</span>
                    </div>
                    {{/if}}
                    {{#if personalInfo.website}}
                    <div class="contact-item secondaryFont">
                    <a href="{{personalInfo.website}}" target="_blank">{{personalInfo.website}}</a>
                    </div>
                    {{/if}}
                     {{#if personalInfo.linkedin}}<span class="contact-item secondaryFont"><a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a></span>{{/if}}
                {{#if personalInfo.github}}<span class="contact-item secondaryFont"><a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a></span>{{/if}}
                    {{#if personalInfo.email}}
                    <div class="contact-item secondaryFont">
                    <span>{{personalInfo.email}}</span>
                    </div>
                    {{/if}}
                    {{#if personalInfo.phone}}
                    <div class="contact-item secondaryFont">
                    <span>{{personalInfo.phone}}</span>
                    </div>
                    {{/if}}
                    </section>
                    {{#if summary}}
                    <section class="section summary">
                    <h3 class="primaryFont">PROFILE SUMMARY</h3>
                    <hr class="separator"/>
                    <span class="summary-text">{{{summary}}}</span>
                    </section>
                    {{/if}}
                    <main class="main-content">
                    <div class="left-column">

                    {{#if skills.length}}
                    <section class="section skills">
                    <h3 class="primaryFont">SKILLS</h3>
                    <hr class="separator"/>
                    {{#each skills}}
                    <span class="skill-category-title"><strong>{{category}}:</strong></span>
                    <ul class="list">
                    {{#each items}}
                    <li class="skill-items">{{name}}</li>
                    {{/each}}
                    </ul>
                    {{/each}}
                    </section>
                    {{/if}}
                    
                    {{#if education.length}}
                    <section class="section">
                    <h3 class="primaryFont">EDUCATION</h3>
                    <hr class="separator"/>
                    {{#each education}}
                    <div class="education-item secondaryFont">
                    <p class="date edu-dates">{{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                        {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}</p>
                    <p class="university secondaryFont">{{institution}}</p>
                    <p class="edu-degree secondaryFont">{{degree}}</p>
                    {{#if gpa}}
                    <p class="edu-gpa secondaryFont">GPA: {{gpa}}</p>
                    {{/if}}
                    {{#if location}}
                    <p class="location secondaryFont">{{location}}</p>
                    {{/if}}
                    {{#if description}}
                    <p class="edu-description secondaryFont">{{{description}}}</p>
                    {{/if}}
                    </div>
                    {{/each}}
                    </section>
                    {{/if}}
                    
                    {{#if languages.length}}
                    <section class="section">
                    <h3 class="primaryFont">LANGUAGES</h3>
                    <hr class="separator"/>
                    <ul class="list">
                    {{#each languages}}
                    <li class="language-item">{{this.name}} <span class="language-proficiency secondaryFont">({{this.proficiency}})</span></li>
                    {{/each}}
                    </ul>
                    </section>
                    {{/if}}
                    
                    </div>
                    <div class="right-column">
                    {{#if workExperience.length}}
                    <section class="section">
                    <h3 class="primaryFont">WORK EXPERIENCE</h3>
                    <hr class="separator"/>
                    {{#each workExperience}}
                    <div class="experience-item">
                    <div class="experience-header secondaryFont">
                    <h4 class="job-title">{{jobTitle}} - {{company}}</h4>
                    <div class="job-items">
                    {{#if location}}<span class="location secondaryFont" itemprop="jobLocation">{{location}}</span>{{/if}}
                    <span class="job-dates secondaryFont">
                    <time itemprop="datePosted">{{formatDate startDate}}</time> - 
                            {{#if isCurrentJob}}<span>Present</span>{{else}}<time>{{formatDate endDate}}</time>{{/if}}
                    </div>
                    </span>
                    </div>
            {{#if description}}<p class="job-description">{{{description}}}</p>{{/if}}
                    </div>
                    {{/each}}
                    </section>
                    {{/if}}
                    {{#if projects.length}}
                    <section class="section">
                    <h3 class="primaryFont">PROJECTS</h3>
                    <hr class="separator"/>
                    {{#each projects}}
                    <div class="project-item">
                    <div class="project-header">
                    <h4 class="project-name">{{name}}</h4>
                    {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                    </div>
                    {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if technologies}}
                    <div class="technologies">
                      <strong class="primaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag technologies secondaryFont">{{this}}</span>{{#unless @last}}, {{/unless}}{{/each}}
                    </div>
                    {{/if}}
                    {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                    {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
                    </div>
                    {{/each}}
                    </section>
                    {{/if}}
                    {{#if achievements.length}}
                    <section class="achievements section">
                    <h3 class="primaryFont">ACHIEVEMENTS</h3>
                    <hr class="separator"/>
                    {{#each achievements}}
                    {{#if title}}<span class="achievement-title secondaryFont"><strong>{{title}}</strong></span>{{/if}}
                    {{#if description}}<div class="achievement-description secondaryFont">{{{description}}}</div>{{/if}}
                    {{#if date}}<div class="achievement-date secondaryFont">{{formatDate date}}</div>{{/if}}
                    {{#if issuer}}<div class="achievement-issuer secondaryFont">{{issuer}}</div>{{/if}}
                    {{/each}}
                    </section>
                    {{/if}}
                    {{#if certifications.length}}
                    <section class="section">
                    <h3 class="primaryFont">CERTIFICATIONS</h3>
                    <hr class="separator"/>
                    <ul class="list">
                    {{#each certifications}}
                    <li class="secondaryFont"><span class="cert-name">{{name}}</span> {{#if issuer}}<span class="cert-issuer secondaryFont"> - {{issuer}}</span>{{/if}}
                    {{#if date}}<span class="cert-dates secondaryFont">({{formatDate date}}
                    {{#if expiryDate}}<span class="cert-expiry secondaryFont"> - {{formatDate expiryDate}}</span>{{/if}}
                    )</span>{{/if}}
                    {{#if credentialId}}<div class="cert-id secondaryFont">Credential ID: {{credentialId}}</div>{{/if}}
                    {{#if url}}<div class="cert-link secondaryFont">Credential URL: <a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                    </li>
                    {{/each}}
                    </ul>
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
                    
                    </div>
                    </main>
                    </div>

                    </body>`
      ,
      "css": `:root {
                                --primary-color: #4B5563;
                                --background-light: #F9FAFB;
                                --text-color-light: #374151;
                                --text-color-secondary-light: #6B7285;
                                --border-color-light: #D1D5DB;
                            }
                            body.classic-two-column {
                                font-family: 'Montserrat', sans-serif;
                                background-color: var(--background-light);
                                color: var(--text-color-light);
                                margin: 0;
                                padding: 0;
                                line-height: 1.3;
                                -webkit-font-smoothing: antialiased;
                                -moz-osx-font-smoothing: grayscale;
                            }
                            .resume-container {
                                padding: 3rem;background-color: transparent;
                            }
                            header {
                                text-align: center;
                            }
                            header h1 {
                                font-size: 2.5rem;font-weight: 700;
                                letter-spacing: 0.1em;
                                color: var(--primary-color);
                            }
                            header h2 {
                                font-size: 1.25rem;font-weight: 600;
                                letter-spacing: 0.15em;
                                color: var(--text-color-secondary-light);
                            }

                            h3.primaryFont {
                                margin-top: 2px;
                                font-size: 1.5rem;font-weight: 600;
                            }
                                .fresher {
                                border-bottom: 1px solid var(--border-color-light);
                                }
                            .contact-info {
                                border-bottom: 1px solid var(--border-color-light);
                                padding-top: 2px;
                                padding-bottom: 5px;
                                margin-bottom: 2px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                flex-wrap: wrap;
                                gap: 0.25rem;
                            }
                            .contact-item {
                                display: flex;
                                align-items: center;
                                font-size: 0.875rem;}
                            .contact-item .material-symbols-outlined {
                                color: var(--primary-color);
                                font-size: 1.25rem;
                                margin-right: 0.5rem;
                            }
                            .section {
                            margin-bottom: 0px;
                            padding-bottom: 0px;
                            }
                            .separator {
                                border: 0;
                                height: 1px;
                                background-color: var(--border-color-light);
                                margin-bottom: 2px;
                            }
                            .summary {
                                font-size: 0.875rem;
                                line-height: 1.6;
                                margin-top: 0.5rem;
                            }
                            .main-content {
                                display: grid;
                                grid-template-columns: 1fr 2fr; /* Changed to 1:2 ratio */
                                gap: 0 0.5rem;
                                margin-top: 2px;
                            }
                            .left-column, .right-column {
                                display: flex;
                                flex-direction: column;
                                gap: 2px;
                            }
                            ul.list, ol.list {
                                list-style-position: inside;
                                list-style-type: disc;
                                padding-left: 0;
                                font-size: 0.875rem;
                                display: flex;
                                flex-direction: column;
                                gap: 0.25rem;
                            }
                              span strong {
                                    font-weight: 700;
                                }
                            .education-item {
                                margin-bottom: 0.25rem;
                                font-size: 0.875rem;
                            }
                            .education-item p { margin: 0; }
                            .education-item .date { font-weight: 600; }
                            .education-item .university { font-weight: 700; color: #4B5563; }
                            .education-item ul { margin-top: 0.25rem; font-size: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; list-style-position: inside; }
                            .experience-item, .project-item, .achievement-item, .certification-item {
                                margin-bottom: 0.5rem;
                                font-size: 0.875rem;
                            }
                            .experience-header, .project-header, .achievement-header, .certification-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: baseline;
                                margin-bottom: 0.25rem;
                            }

                            .experience-header {
                                flex-direction:column;
                                }
                            .job-items{
                            display:flex;
                            justify-content: space-between;
                            align-items: baseline;
                                width: 100%;
                            }

                            .experience-header h4, .project-header h4, .achievement-header h4, .certification-header h4 {
                                font-size: 1rem;
                                font-weight: 700;
                                color: #1F2937;
                                margin: 0;
                            }
                            .experience-header p, .project-header p, .achievement-header p, .certification-header p {
                                font-size: 0.75rem;
                                font-weight: 600;
                                margin: 0;
                            }
                            .experience-item .job-description {
                                font-weight: 600;
                                color: var(--text-color-secondary-light);
                                margin-bottom: 0.5rem;
                            }
                            .experience-item ul, .experience-item ol, .project-item ul, .project-item ol, .achievement-item ul, .certification-item ul {
                                font-size: 0.75rem;
                                line-height: 1.6;
                                display: flex;
                                flex-direction: column;
                            }
                            .project-item .project-description {
                                font-size: 0.75rem;
                                line-height: 1.6;
                                margin-bottom: 0.5rem;
                            }
                            .project-item .project-url a {
                                font-size: 0.75rem;
                                color: var(--primary-color);
                                text-decoration: none;
                            }
                            .project-item .project-url a:hover {
                                text-decoration: underline;
                            }
                                 .project-links a, .cert-link a, .contact-item a { color: #000000; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }

          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: bold; color: #1f2937; }
                           
                            }`
    },
    "creator": null,
    "tags": ["classic", "serif", "traditional", "academic", "single-column", "gray"]
  }
]