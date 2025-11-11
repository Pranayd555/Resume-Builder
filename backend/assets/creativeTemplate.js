module.exports = [
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
            sectionSpacing: 1,
            fontFamily: 'Arial'
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<div class="resume creative-designer">
            <div class="sidebar">
              <div class="profile-section">
                <h1 class="name primaryFont">{{personalInfo.fullName}}</h1>{{#if isFresher}}{{else}}<h2 class="primaryFont" itemprop="title">{{title}}</h2>{{/if}}
                <div class="contact-info secondaryFont">
                  <div class="contact-item secondaryFont">
                    <span class="icon">📧</span>
                    <span>{{personalInfo.email}}</span>
                  </div>
                  {{#if personalInfo.phone}}
                    <div class="contact-item secondaryFont">
                      <span class="icon">📱</span>
                      <span>{{personalInfo.phone}}</span>
                    </div>
                  {{/if}}
                  {{#if personalInfo.address}}
                    <div class="contact-item secondaryFont">
                      <span class="icon">📍</span>
                      <span>{{personalInfo.address}}</span>
                    </div>
                  {{/if}}
                  {{#if personalInfo.website}}
                    <div class="contact-item secondaryFont">
                      <span class="icon">🌐</span>
                      <span>
                        <a href="{{personalInfo.website}}" target="_blank" itemprop="url">{{personalInfo.website}}</a>
                      </span>
                    </div>
                  {{/if}}
                  {{#if personalInfo.linkedin}}
                    <div class="contact-item secondaryFont">
                      <span class="icon">💼</span>
                      <span>
                        <a href="{{personalInfo.linkedin}}" target="_blank">{{personalInfo.linkedin}}</a>
                      </span>
                    </div>
                  {{/if}}
                  {{#if personalInfo.github}}
                    <div class="contact-item secondaryFont">
                      <span class="icon">🐱</span>
                      <span>
                        <a href="{{personalInfo.github}}" target="_blank">{{personalInfo.github}}</a>
                      </span>
                    </div>
                  {{/if}}
                </div>
              </div>
              
              {{#if skills}}
                <section class="skills">
                  <h2 class="primaryFont">Skills</h2>
                  {{#each skills}}
                    <div class="skill-category">
                      <div class="skill-category-title primaryFont">{{category}}</div>
                      <div class="skill-bars">
                        {{#each items}}
                          <div class="skill-item">
                            <span class="skill-name secondaryFont">{{name}}</span>
                            <div class="skill-bar">
                              <div class="skill-progress" data-level="{{level}}"></div>
                            </div>
                          </div>
                        {{/each}}
                      </div>
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
              
              {{#if certifications}}
                <section class="certifications">
                  <h2 class="primaryFont">Certifications</h2>
                  {{#each certifications}}
                    <div class="cert-item">
                      <div class="cert-title secondaryFont">{{name}}</div>
                      <div class="cert-meta">
                        <span class="issuer secondaryFont">{{issuer}}</span>
                        {{#if date}}
                          <span class="cert-dates secondaryFont">{{formatDate date}}</span>
                        {{/if}}
                      </div>
                      {{#if expiryDate}}
                        <div class="cert-expiry secondaryFont">Expires: {{formatDate expiryDate}}</div>
                      {{/if}}
                      {{#if credentialId}}
                        <div class="cert-id secondaryFont">ID: {{credentialId}}</div>
                      {{/if}}
                      {{#if url}}
                        <div class="cert-link secondaryFont">
                          <a href="{{url}}" target="_blank">{{url}}</a>
                        </div>
                      {{/if}}
                    </div>
                  {{/each}}
                </section>
              {{/if}}
            </div>
            
            <div class="main-content">
              {{#if summary}}
                <section class="about">
                  <h2 class="primaryFont">About Me</h2>
                  <div class="about-text secondaryFont">{{{summary}}}</div>
                </section>
              {{/if}}
              
              {{#if workExperience}}
                <section class="experience">
                  <h2 class="primaryFont">Experience</h2>
                  <div class="timeline">
                    {{#each workExperience}}
                      <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                          <h3 class="primaryFont">{{jobTitle}}</h3>
                          <div class="job-meta">
                            <span class="company secondaryFont">{{company}}</span>
                            {{#if location}}
                              <span class="location secondaryFont">{{location}}</span>
                            {{/if}}
                          </div>
                          <div class="job-dates secondaryFont">
                            {{formatDate startDate}} - {{#if isCurrentJob}}Present{{else}}{{formatDate endDate}}{{/if}}
                          </div>
                          {{#if description}}
                            <div class="job-description secondaryFont">{{{description}}}</div>
                          {{/if}}
                          {{#if achievements}}
                            <ul class="achievements secondaryFont">
                              {{#each achievements}}
                                <li>{{this}}</li>
                              {{/each}}
                            </ul>
                          {{/if}}
                        </div>
                      </div>
                    {{/each}}
                  </div>
                </section>
              {{/if}}
              
              {{#if education}}
                <section class="education">
                  <h2 class="primaryFont">Education</h2>
                  {{#each education}}
                    <div class="edu-item">
                      <h3 class="primaryFont">{{degree}}</h3>
                      <div class="edu-meta">
                        <span class="institution secondaryFont">{{institution}}</span>
                        {{#if location}}
                          <span class="location secondaryFont">{{location}}</span>
                        {{/if}}
                      </div>
                      <div class="edu-dates secondaryFont">
                        {{#if startDate}}<time itemprop="startDate">{{formatDate startDate}}</time> - {{/if}}
                        {{#if isCurrentlyStudying}}<span>Present</span>{{else}}<time itemprop="endDate">{{formatDate endDate}}</time>{{/if}}
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
                <section class="projects">
                  <h2 class="primaryFont">Projects</h2>
                  {{#each projects}}
                    <div class="project-item">
                      <h3 class="primaryFont">{{name}}</h3>
                      {{#if description}}
                        <p class="secondaryFont">{{{description}}}</p>
                      {{/if}}
                      {{#if technologies}}
                        <div class="technologies">
                          {{#each technologies}}
                            <span class="tech-tag secondaryFont">{{this}}</span>
                          {{/each}}
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
                      {{#if startDate}}
                        <div class="project-dates secondaryFont">
                          {{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}
                        </div>
                      {{/if}}
                    </div>
                  {{/each}}
                </section>
              {{/if}}
              
              {{#if achievements}}
                <section class="achievements-section">
                  <h2 class="primaryFont">Achievements</h2>
                  {{#each achievements}}
                    <div class="achievement-item">
                      {{#if title}}
                        <div class="achievement-title primaryFont">{{title}}</div>
                      {{/if}}
                      {{#if description}}
                        <div class="secondaryFont">{{{description}}}</div>
                      {{/if}}
                      {{#if date}}
                        <div class="achievement-date secondaryFont">{{formatDate date}}</div>
                      {{/if}}
                      {{#if issuer}}
                        <div class="achievement-issuer secondaryFont">{{issuer}}</div>
                      {{/if}}
                    </div>
                  {{/each}}
                </section>
              {{/if}}
              
              {{#if customFields}}
                <section class="custom-fields">
                  {{#each customFields}}
                    <div class="custom-field">
                      <h3 class="primaryFont">{{title}}</h3>
                      <div class="custom-content secondaryFont">{{content}}</div>
                    </div>
                  {{/each}}
                </section>
              {{/if}}
            </div>
          </div>`,
          css: `.resume.creative-designer {
            font-family: 'Arial', sans-serif;
            max-width: 8.5in;
            margin: 0 auto;            
            padding: 0.35in 0.35in;
            background: white;
            color: #1f2937;
            display: grid;
            grid-template-columns: 280px 1fr;
            font-size: 15px;
            line-height: 1;
          }
          
          .sidebar {
            background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
            color: white;
            padding: 0.20in 0.20in;
          }
          
          .profile-section {
            margin-bottom: 6px;
          }

          .span a {
            color: rgba(255,255,255,0.9);
            text-decoration:none;
            }
          
          .name {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
            line-height: 1;
          }
          
          .contact-info {
            margin-bottom: 6px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 2px;
          }
          
          .icon {
            width: 16px;
            text-align: center;
          }
          
          .sidebar h2 {
            font-weight: 600;
            margin: 6px 0;
            position: relative;
            padding-bottom: 8px;
          }
          
          .sidebar h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 25px;
            height: 2px;
            background: rgba(255,255,255,0.7);
          }
          
          .skill-category {
            margin-bottom: 2px;
          }
          
          .skill-category-title {
            font-weight: 600;
            margin-bottom: 2px;
            color: rgba(255,255,255,0.9);
          }
          
          .skill-item {
            margin-bottom: 2px;
          }
          
          .skill-name {
            display: block;
            margin-bottom: 2px;
          }
          
          .skill-bar {
            height: 3px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            overflow: hidden;
          }
          
          .skill-progress {
            height: 100%;
            background: rgba(255,255,255,0.8);
            border-radius: 2px;
            width: 75%;
          }
          
          .skill-progress[data-level="expert"] {
            width: 95%;
          }
          
          .skill-progress[data-level="advanced"] {
            width: 80%;
          }
          
          .skill-progress[data-level="intermediate"] {
            width: 65%;
          }
          
          .skill-progress[data-level="beginner"] {
            width: 40%;
          }
          
          .language-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          
          .language-name {
            color: rgba(255,255,255,0.9);
          }
          
          .language-level {
            color: rgba(255,255,255,0.7);
            text-transform: capitalize;
          }
          
          .cert-item {
            margin-bottom: 2px;
          }
          
          .cert-title {
            font-weight: 600;
            color: rgba(255,255,255,0.9);
            margin-bottom: 2px;
          }
          
          .cert-meta {
            display: flex;
            gap: 8px;
            color: rgba(255,255,255,0.9);
            margin-bottom: 2px;
          }
          
          .cert-expiry,
          .cert-id {
            color: rgba(255,255,255,0.9);
            margin-bottom: 1px;
          }
          
          .cert-link a {
            color: rgba(255,255,255,0.9);
            text-decoration: none;
          }
          
          .main-content {
            padding: 24px;
          }
          
          .main-content h2 {
            font-weight: 600;
            color: #ec4899;
            margin: 0 0 6px 0;
            position: relative;
            padding-bottom: 8px;
          }
          
          .main-content h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 30px;
            height: 2px;
            background: linear-gradient(90deg, #ec4899, #8b5cf6);
          }
          
          .about {
            margin-bottom: 6px;
          }
          
          .about-text {
            line-height: 1;
            color: #4b5563;
            text-align: justify;
          }
          
          .timeline {
            position: relative;
            padding-left: 16px;
          }
          
          .timeline::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(180deg, #ec4899, #8b5cf6);
          }
          
          .timeline-item {
            position: relative;
            margin-bottom: 2px;
          }
          
          .timeline-marker {
            position: absolute;
            left: -10px;
            top: 4px;
            width: 6px;
            height: 6px;
            background: #ec4899;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 0 2px #ec4899;
          }
          
          .timeline-content h3 {
            font-weight: 600;
            color: #1f2937;
          }
          
          .job-meta,
          .edu-meta {
            display: flex;
            gap: 8px;
            color: #6b7280;
            margin-bottom: 2px;
          }
          
          .dates,
          .edu-dates {
            color: #9ca3af;
            font-style: italic;
            margin-bottom: 2px;
          }
          
          .description,
          .edu-description {
            color: #4b5563;
            line-height: 1;
          }
          
          .achievements {
            margin: 2px 0;
          }
          
          .achievements li {
            margin-bottom: 2px;
            color: #4b5563;
          }
          
          /* General list styling for HTML content in descriptions */
          ul,
          ol {
            margin: 2px 0;
            padding-left: 1rem;
          }
          
          ul li,
          ol li {
            margin-bottom: 2px;
            color: #4b5563;
            line-height: 1.3;
          }
          
          ul {
            list-style-type: disc;
          }
          
          ol {
            list-style-type: decimal;
          }
          
          .gpa {
            color: #6b7280;
            margin-bottom: 2px;
          }
          
          .edu-item {
            margin-bottom: 2px;
          }
          
          .edu-item h3 {
            font-weight: 600;
            color: #1f2937;
          }
          
          .project-item {
            margin-bottom: 2px;
          }
          
          .project-item h3 {
            font-weight: 600;
            color: #1f2937;
          }
          
          .project-item p {
            color: #4b5563;
            line-height: 1;
            margin-bottom: 2px;
          }
          
          .technologies {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 2px;
          }
          
          .tech-tag {
            background: #8b5cf6;
            color: white;
            padding: 2px 5px;
            border-radius: 2px;
          }
          
          .project-links {
            margin-bottom: 2px;
          }
          
          .project-links a {
            color: #ec4899;
            text-decoration: none;
            margin-right: 12px;
          }
          
          .project-dates {
            color: #9ca3af;
            font-style: italic;
          }
          
          .achievement-item {
            margin-bottom: 2px;
          }
          
          .achievement-item .achievement-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
          }
          
          .achievement-item p {
            color: #4b5563;
            line-height: 1;
            margin-bottom: 2px;
          }
          
          .achievement-date {
            color: #9ca3af;
            font-style: italic;
            margin-bottom: 2px;
          }
          
          .achievement-issuer {
            color: #6b7280;
          }
          
          .custom-field {
            margin-bottom: 2px;
          }
          
          .custom-field h3 {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
          }
          
          .custom-content {
            color: #4b5563;
            line-height: 1;
          }
          
          .contact-item a {
            color: rgba(255,255,255,0.9);
            text-decoration: none;
          }
          
          /* Unified classes for consistent styling */
          .institution, .location, .company, .issuer, .gpa, .dates, .job-dates, .edu-dates, .project-dates, .achievement-date, .achievement-issuer, { color: #6b7280; }
          .language-name, .skill-category-title, .job-title, .edu-degree, .project-name, .achievement-title, .cert-name, .custom-field-title { font-weight: 600; color: #1f2937; }
          .project-links a, .cert-link a, { color: #ec4899; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
        },
        creator: null,
        tags: ['creative', 'designer', 'portfolio', 'sidebar', 'colorful', 'gradient']
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
            sectionSpacing: 1,
            fontFamily: 'Arial'
          }
        },
        availability: { tier: 'free', isPublic: true, isActive: true },
        templateCode: {
          html: `<article class="resume creative-portfolio" itemscope itemtype="http://schema.org/Person">
            <header class="header">
              <h1 class="name primaryFont" itemprop="name">{{personalInfo.fullName}}</h1>
              {{#if isFresher}}{{else}}<h2 class="primaryFont" itemprop="title">{{title}}</h2>{{/if}}
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
              <h2 class="primaryFont">Professional Summary</h2>
              <div class="summary secondaryFont" itemprop="description">{{{summary}}}</div>
            </section>
            {{/if}}
            
            {{#if projects}}
            <section class="projects">
              <h2 class="primaryFont">Featured Projects</h2>
              {{#each projects}}
              <div class="project-item">
                <div class="project-header">
                  <div class="project-name primaryFont">{{name}}</div>
                  {{#if startDate}}<div class="project-dates secondaryFont">{{formatDate startDate}} - {{#if endDate}}{{formatDate endDate}}{{else}}Present{{/if}}</div>{{/if}}
                </div>
                {{#if description}}<div class="project-description secondaryFont">{{{description}}}</div>{{/if}}
                {{#if technologies}}
                <div class="technologies secondaryFont">
                  <strong class="primaryFont">Technologies:</strong> {{#each technologies}}<span class="tech-tag">{{this}}</span>{{/each}}
                </div>
                {{/if}}
                {{#if url}}<div class="project-links secondaryFont"><a href="{{url}}" target="_blank">{{url}}</a></div>{{/if}}
                {{#if githubUrl}}<div class="project-links secondaryFont"><a href="{{githubUrl}}" target="_blank">{{githubUrl}}</a></div>{{/if}}
              </div>
              {{/each}}
            </section>
            {{/if}}
            
            {{#if skills}}
            <section class="skills">
              <h2 class="primaryFont">Skills & Expertise</h2>
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
              {{#each customFields}}
              <div class="custom-field-item">
                <h2 class="custom-field-title primaryFont">{{title}}</h2>
                <div class="custom-content secondaryFont">{{content}}</div>
              </div>
              {{/each}}
            </section>
            {{/if}}
          </article>`,
          css: `.resume.creative-portfolio { font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.35in; background: white; color: #111827; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 3px solid #9333ea; }
          .name { font-weight: 600; color: #9333ea; margin-bottom: 10px; letter-spacing: 0.5px; }
          .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #f472b6; }
          .contact-item { color: #111827; }
          .contact-item a { color: #9333ea; text-decoration: none; }
          .contact-item a:hover { text-decoration: underline; }
          section { margin-bottom: 15px; }
          h2 { font-weight: 600; color: #9333ea; margin-bottom: 2px; padding-bottom: 3px; border-bottom: 1px solid #f3e8ff; text-transform: uppercase; letter-spacing: 0.5px; }
          .project-item { border-left: 4px solid #f472b6; padding-left: 12px; margin-bottom: 12px; }
          .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
          .project-name { font-weight: 600; color: #111827; margin-bottom: 2px; }
          .project-dates { color: #64748b; font-weight: 500; }
          .project-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
          .technologies { margin: 4px 0; color: #6b7280; }
          .tech-tag { background: #fef3c7; color: #92400e; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
          .project-links { margin: 3px 0; }
          .project-links a { color: #9333ea; text-decoration: none; }
          .project-links a:hover { text-decoration: underline; }
          .job-item, .edu-item, .cert-item, .achievement-item { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
          .job-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
          .job-title, .edu-degree { font-weight: 600; color: #111827; margin-bottom: 2px; }
          .job-meta, .edu-meta { color: #6b7280; }
          .job-dates, .edu-dates { color: #9ca3af; font-weight: 500; }
          .summary, .job-description, .edu-description, .project-description, .achievement-description { margin: 4px 0; color: #4b5563; line-height: 1.4; }
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
          .skill-item { display: inline-block; margin-right: 8px; margin-bottom: 2px; background: #f3e8ff; color: #7c3aed; padding: 1px 4px; border-radius: 2px; }
          .cert-name { font-weight: 600; color: #111827; margin-bottom: 2px; }
          .cert-meta { color: #6b7280; margin-bottom: 2px; }
          .cert-expiry, .cert-id { color: #9ca3af; margin: 1px 0; }
          .cert-link a { color: #9333ea; text-decoration: none; }
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
          .project-links a, .cert-link a, .contact-item a { color: #9333ea; text-decoration: none; }
          .project-links a:hover, .cert-link a:hover, .contact-item a:hover { text-decoration: underline; }`
        },
        creator: null,
        tags: ['creative', 'portfolio', 'designer', 'colorful', 'single-column', 'purple']
      },
]