const handlebars = require('handlebars');
const moment = require('moment');

// Register Handlebars helpers
handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  try {
    return moment(date).format('MMM YYYY');
  } catch (error) {
    return '';
  }
});

handlebars.registerHelper('formatDateFull', function(date) {
  if (!date) return '';
  try {
    return moment(date).format('MMMM D, YYYY');
  } catch (error) {
    return '';
  }
});

// Helper for date ranges with proper formatting
handlebars.registerHelper('formatDateRange', function(startDate, endDate, isCurrentJob, isCurrentlyStudying) {
  if (!startDate) return '';
  
  try {
    const start = moment(startDate).format('MMM YYYY');
    const isCurrent = isCurrentJob || isCurrentlyStudying;
    
    if (isCurrent) {
      return `${start} - Present`;
    } else if (endDate) {
      const end = moment(endDate).format('MMM YYYY');
      return `${start} - ${end}`;
    } else {
      return start;
    }
  } catch (error) {
    return '';
  }
});

handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

handlebars.registerHelper('ne', function(a, b) {
  return a !== b;
});

handlebars.registerHelper('gt', function(a, b) {
  return a > b;
});

handlebars.registerHelper('lt', function(a, b) {
  return a < b;
});

handlebars.registerHelper('or', function(a, b) {
  return a || b;
});

handlebars.registerHelper('and', function(a, b) {
  return a && b;
});

handlebars.registerHelper('capitalize', function(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
});

handlebars.registerHelper('uppercase', function(str) {
  if (!str) return '';
  return str.toUpperCase();
});

handlebars.registerHelper('lowercase', function(str) {
  if (!str) return '';
  return str.toLowerCase();
});

handlebars.registerHelper('truncate', function(str, length) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
});

handlebars.registerHelper('join', function(array, separator) {
  if (!array || !Array.isArray(array)) return '';
  return array.join(separator || ', ');
});

handlebars.registerHelper('length', function(array) {
  if (!array || !Array.isArray(array)) return 0;
  return array.length;
});

handlebars.registerHelper('getSkillLevel', function(level) {
  const levels = {
    'beginner': 25,
    'intermediate': 50,
    'advanced': 75,
    'expert': 100
  };
  return levels[level] || 50;
});

handlebars.registerHelper('getProficiencyLevel', function(proficiency) {
  const levels = {
    'basic': 25,
    'conversational': 50,
    'fluent': 75,
    'native': 100
  };
  return levels[proficiency] || 50;
});

handlebars.registerHelper('formatPhoneNumber', function(phone) {
  if (!phone) return '';
  // Simple phone number formatting - can be enhanced
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
});

handlebars.registerHelper('formatUrl', function(url) {
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
});

handlebars.registerHelper('getInitials', function(name) {
  if (!name) return '';
  return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
});

handlebars.registerHelper('yearsOfExperience', function(workExperience) {
  if (!workExperience || !Array.isArray(workExperience)) return 0;
  
  let totalMonths = 0;
  workExperience.forEach(job => {
    if (job.startDate) {
      const startDate = moment(job.startDate);
      const endDate = job.isCurrentJob ? moment() : moment(job.endDate);
      totalMonths += endDate.diff(startDate, 'months');
    }
  });
  
  return Math.floor(totalMonths / 12);
});

handlebars.registerHelper('getEducationLevel', function(education) {
  if (!education || !Array.isArray(education)) return '';
  
  const levels = {
    'high school': 1,
    'diploma': 2,
    'associate': 3,
    'bachelor': 4,
    'master': 5,
    'doctorate': 6,
    'phd': 6
  };
  
  let highestLevel = 0;
  let highestDegree = '';
  
  education.forEach(edu => {
    if (edu.degree) {
      const degree = edu.degree.toLowerCase();
      for (const [key, level] of Object.entries(levels)) {
        if (degree.includes(key) && level > highestLevel) {
          highestLevel = level;
          highestDegree = edu.degree;
        }
      }
    }
  });
  
  return highestDegree;
});

handlebars.registerHelper('hasContent', function(obj) {
  if (!obj) return false;
  if (Array.isArray(obj)) return obj.length > 0;
  if (typeof obj === 'string') return obj.trim().length > 0;
  if (typeof obj === 'object') return Object.keys(obj).length > 0;
  return Boolean(obj);
});

handlebars.registerHelper('isCurrentPosition', function(workExperience) {
  return workExperience && workExperience.some(job => job.isCurrentJob);
});

handlebars.registerHelper('isCurrentlyStudying', function(education) {
  return education && education.some(edu => edu.isCurrentlyStudying);
});

class TemplateRenderer {
  constructor() {
    this.handlebars = handlebars;
  }

  /**
   * Render template with user data
   * @param {Object} template - Template object with html and css
   * @param {Object} resumeData - User resume data
   * @returns {Object} - Rendered HTML and CSS
   */
  render(template, resumeData) {
    try {
      // Compile HTML template with runtime options
      const htmlTemplate = this.handlebars.compile(template.templateCode.html, {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
      });
      
      // Prepare data for template and convert to plain objects
      const templateData = this.prepareTemplateData(resumeData, template);
      
      // Render HTML
      let renderedHtml = htmlTemplate(templateData, {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
      });
      
      // Wrap the HTML in a unique container to prevent global styling
      const uniqueId = `resume-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      renderedHtml = `<div class="resume-isolated-container ${uniqueId}">${renderedHtml}</div>`;
      
      // Process CSS with template styling
      const renderedCss = this.renderCss(template, templateData, uniqueId);
      
      return {
        html: renderedHtml,
        css: renderedCss,
        success: true
      };
    } catch (error) {
      console.error('❌ Template rendering error:', error);
      return {
        html: '',
        css: '',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Prepare resume data for template rendering
   * @param {Object} resumeData - Raw resume data
   * @param {Object} template - Template object
   * @returns {Object} - Processed template data
   */
  prepareTemplateData(resumeData, template) {
    // Convert MongoDB objects to plain JavaScript objects
    const plainData = JSON.parse(JSON.stringify(resumeData));
    

    
    const data = {
      ...plainData,
      // Add computed fields
      computed: {
        yearsOfExperience: this.calculateYearsOfExperience(plainData.workExperience),
        totalProjects: plainData.projects ? plainData.projects.length : 0,
        totalCertifications: plainData.certifications ? plainData.certifications.length : 0,
        highestEducation: this.getHighestEducation(plainData.education),
        skillsCount: this.getSkillsCount(plainData.skills),
        languagesCount: plainData.languages ? plainData.languages.length : 0
      },
      // Add template-specific settings
      template: {
        colors: template.styling?.colors || {},
        fonts: template.styling?.fonts || {},
        layout: template.layout?.type || 'single-column',
        category: template.category || 'modern'
      },
      // Add resume styling data
      styling: plainData.styling || {}
    };



    // Ensure arrays exist and are plain objects
    data.workExperience = Array.isArray(data.workExperience) ? data.workExperience : [];
    data.education = Array.isArray(data.education) ? data.education : [];
    data.skills = Array.isArray(data.skills) ? data.skills : [];
    data.projects = Array.isArray(data.projects) ? data.projects : [];
    data.achievements = Array.isArray(data.achievements) ? data.achievements : [];
    data.certifications = Array.isArray(data.certifications) ? data.certifications : [];
    data.languages = Array.isArray(data.languages) ? data.languages : [];
    data.customFields = Array.isArray(data.customFields) ? data.customFields : [];

    // Process dates and add duration calculations
    data.workExperience = data.workExperience.map(job => ({
      ...job,
      startDate: job.startDate,
      endDate: job.endDate,
      duration: this.calculateDuration(job.startDate, job.endDate, job.isCurrentJob)
    }));

    data.education = data.education.map(edu => ({
      ...edu,
      startDate: edu.startDate,
      endDate: edu.endDate,
      duration: this.calculateDuration(edu.startDate, edu.endDate, edu.isCurrentlyStudying)
    }));

    return data;
  }

  /**
   * Render CSS with template variables
   * @param {Object} template - Template object
   * @param {Object} data - Template data
   * @param {string} uniqueId - Unique identifier for CSS scoping
   * @returns {string} - Rendered CSS
   */
  renderCss(template, data, uniqueId) {
    let css = template.templateCode.css;

    // Replace CSS variables with template styling
    const styling = template.styling;
    const colors = styling.colors || {};
    const fonts = styling.fonts || {};
    const spacing = styling.spacing || {};

    // Replace color variables
    Object.keys(colors).forEach(key => {
      const pattern = new RegExp(`var\\(--color-${key}\\)`, 'g');
      css = css.replace(pattern, colors[key]);
    });

    // Replace font variables
    Object.keys(fonts).forEach(key => {
      if (key !== 'sizes') {
        const pattern = new RegExp(`var\\(--font-${key}\\)`, 'g');
        css = css.replace(pattern, fonts[key]);
      }
    });

    // Replace font size variables
    if (fonts.sizes) {
      Object.keys(fonts.sizes).forEach(size => {
        const pattern = new RegExp(`var\\(--font-size-${size}\\)`, 'g');
        css = css.replace(pattern, `${fonts.sizes[size]}px`);
      });
    }

    // Replace spacing variables
    if (spacing.margins) {
      Object.keys(spacing.margins).forEach(side => {
        const pattern = new RegExp(`var\\(--margin-${side}\\)`, 'g');
        css = css.replace(pattern, `${spacing.margins[side]}px`);
      });
    }

    if (spacing.padding) {
      Object.keys(spacing.padding).forEach(type => {
        const pattern = new RegExp(`var\\(--padding-${type}\\)`, 'g');
        css = css.replace(pattern, `${spacing.padding[type]}px`);
      });
    }

    // Apply template styling options if available (new format)
    if (data.styling && data.styling.template) {
      const templateStyling = data.styling.template;
      

      
      // Header level mapping
      const headerLevels = {
        'h1': { fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' },
        'h2': { fontSize: '2rem', fontWeight: '600', marginBottom: '0.875rem' },
        'h3': { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' },
        'h4': { fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.625rem' },
        'h5': { fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }
      };

      // Apply header font size (new field)
      if (templateStyling.headerFontSize) {
        const headerFontSize = templateStyling.headerFontSize;
        css += `
          .${uniqueId} .name,
          .${uniqueId} h1,
          .${uniqueId} h2,
          .${uniqueId} h3,
          .${uniqueId} h4,
          .${uniqueId} h5 { 
            font-size: ${headerFontSize}px !important; 
            font-weight: 600 !important; 
            margin-bottom: 0.75rem !important; 
          }
        `;
      }
      // Apply header level (fallback if headerFontSize not set)
      else if (templateStyling.headerLevel && headerLevels[templateStyling.headerLevel]) {
        const level = headerLevels[templateStyling.headerLevel];
        css += `
          .${uniqueId} .name,
          .${uniqueId} h1,
          .${uniqueId} h2,
          .${uniqueId} h3,
          .${uniqueId} h4,
          .${uniqueId} h5 { 
            font-size: ${level.fontSize} !important; 
            font-weight: ${level.fontWeight} !important; 
            margin-bottom: ${level.marginBottom} !important; 
          }
        `;
      }

      // Apply content font size
      if (templateStyling.fontSize) {
        const fontSize = templateStyling.fontSize;
        css += `
          .${uniqueId} p,
          .${uniqueId} .contact-info,
          .${uniqueId} .job-description,
          .${uniqueId} .edu-description,
          .${uniqueId} .achievements li,
          .${uniqueId} .skill-items,
          .${uniqueId} .technologies,
          .${uniqueId} .project-links,
          .${uniqueId} .cert-expiry,
          .${uniqueId} .cert-id,
          .${uniqueId} .language-level,
          .${uniqueId} .custom-content { 
            font-size: ${fontSize}px !important; 
          }
        `;
      }

      // Apply line spacing
      if (templateStyling.lineSpacing) {
        const lineSpacing = templateStyling.lineSpacing;
        css += `
          .${uniqueId} p,
          .${uniqueId} .job-description,
          .${uniqueId} .edu-description,
          .${uniqueId} .achievements li,
          .${uniqueId} .summary,
          .${uniqueId} .custom-content { 
            line-height: ${lineSpacing} !important; 
          }
        `;
      }

      // Apply section spacing
      if (templateStyling.sectionSpacing) {
        const sectionSpacing = templateStyling.sectionSpacing;
        css += `
          .${uniqueId} section,
          .${uniqueId} .section,
          .${uniqueId} .work-experience,
          .${uniqueId} .education,
          .${uniqueId} .skills,
          .${uniqueId} .projects,
          .${uniqueId} .achievements,
          .${uniqueId} .certifications,
          .${uniqueId} .languages,
          .${uniqueId} .summary { 
            margin-bottom: ${sectionSpacing * 0.5}rem !important; 
            padding-bottom: ${sectionSpacing * 0.25}rem !important; 
          }
          .${uniqueId} .job-item,
          .${uniqueId} .edu-item,
          .${uniqueId} .project-item,
          .${uniqueId} .cert-item,
          .${uniqueId} .achievement-item,
          .${uniqueId} .skill-category { 
            margin-bottom: ${sectionSpacing * 0.25}rem !important; 
            padding-bottom: ${sectionSpacing * 0.125}rem !important; 
          }
        `;
      }
    }
    // Apply header styling options if available (old format - for backward compatibility)
    else if (data.styling && data.styling.header) {
      const headerStyling = data.styling.header;
      

      
      // Header size mapping
      const headerSizes = {
        'small': { padding: '15px', margin: '5px 0' },
        'medium': { padding: '20px', margin: '10px 0' },
        'large': { padding: '25px', margin: '15px 0' },
        'extra-large': { padding: '30px', margin: '20px 0' }
      };

      // Text size mapping
      const textSizes = {
        'small': { fontSize: '14px', lineHeight: '1.3' },
        'medium': { fontSize: '16px', lineHeight: '1.4' },
        'large': { fontSize: '18px', lineHeight: '1.5' }
      };

      // Label size mapping
      const labelSizes = {
        'small': { fontSize: '10px', lineHeight: '1.2' },
        'medium': { fontSize: '12px', lineHeight: '1.3' },
        'large': { fontSize: '14px', lineHeight: '1.4' }
      };

      // Spacing mapping
      const spacingOptions = {
        'compact': { gap: '8px', marginBottom: '5px' },
        'normal': { gap: '12px', marginBottom: '10px' },
        'spacious': { gap: '16px', marginBottom: '15px' }
      };

      // Apply header size
      if (headerStyling.size && headerSizes[headerStyling.size]) {
        const size = headerSizes[headerStyling.size];
        css += `
          .${uniqueId} .header,
          .${uniqueId} .tech-header,
          .${uniqueId} .classic-header,
          .${uniqueId} .executive-header { 
            padding: ${size.padding} !important; 
            margin: ${size.margin} !important; 
          }
        `;

      }

      // Apply text size
      if (headerStyling.textSize && textSizes[headerStyling.textSize]) {
        const textSize = textSizes[headerStyling.textSize];
        css += `
          .${uniqueId} .header .name,
          .${uniqueId} .tech-header .name,
          .${uniqueId} .classic-header .name,
          .${uniqueId} .executive-header .name,
          .${uniqueId} .name { 
            font-size: ${textSize.fontSize} !important; 
            line-height: ${textSize.lineHeight} !important; 
          }
        `;

      }

      // Apply label size
      if (headerStyling.labelSize && labelSizes[headerStyling.labelSize]) {
        const labelSize = labelSizes[headerStyling.labelSize];
        css += `
          .${uniqueId} .header .contact-info,
          .${uniqueId} .header .contact-item,
          .${uniqueId} .header .contact-details,
          .${uniqueId} .tech-header .contact-info,
          .${uniqueId} .tech-header .contact-item,
          .${uniqueId} .classic-header .contact-info,
          .${uniqueId} .classic-header .contact-item,
          .${uniqueId} .classic-header .contact-details,
          .${uniqueId} .executive-header .contact-info,
          .${uniqueId} .executive-header .contact-item { 
            font-size: ${labelSize.fontSize} !important; 
            line-height: ${labelSize.lineHeight} !important; 
          }
        `;

      }

      // Apply spacing
      if (headerStyling.spacing && spacingOptions[headerStyling.spacing]) {
        const spacing = spacingOptions[headerStyling.spacing];
        css += `
          .${uniqueId} .header .contact-info,
          .${uniqueId} .tech-header .contact-info,
          .${uniqueId} .classic-header .contact-info,
          .${uniqueId} .executive-header .contact-info { 
            gap: ${spacing.gap} !important; 
            margin-bottom: ${spacing.marginBottom} !important; 
          }
          .${uniqueId} .header .contact-item,
          .${uniqueId} .tech-header .contact-item,
          .${uniqueId} .classic-header .contact-item,
          .${uniqueId} .executive-header .contact-item { 
            margin-bottom: ${spacing.gap} !important; 
          }
        `;

      }
    } else {

    }



    return css;
  }

  /**
   * Calculate years of experience
   * @param {Array} workExperience - Array of work experience
   * @returns {number} - Years of experience
   */
  calculateYearsOfExperience(workExperience) {
    if (!workExperience || !Array.isArray(workExperience)) return 0;
    
    let totalMonths = 0;
    workExperience.forEach(job => {
      if (job.startDate) {
        const startDate = moment(job.startDate);
        const endDate = job.isCurrentJob ? moment() : moment(job.endDate);
        if (endDate.isValid()) {
          totalMonths += endDate.diff(startDate, 'months');
        }
      }
    });
    
    return Math.floor(totalMonths / 12);
  }

  /**
   * Get highest education level
   * @param {Array} education - Array of education
   * @returns {string} - Highest education degree
   */
  getHighestEducation(education) {
    if (!education || !Array.isArray(education)) return '';
    
    const levels = {
      'high school': 1,
      'diploma': 2,
      'associate': 3,
      'bachelor': 4,
      'master': 5,
      'doctorate': 6,
      'phd': 6
    };
    
    let highestLevel = 0;
    let highestDegree = '';
    
    education.forEach(edu => {
      if (edu.degree) {
        const degree = edu.degree.toLowerCase();
        for (const [key, level] of Object.entries(levels)) {
          if (degree.includes(key) && level > highestLevel) {
            highestLevel = level;
            highestDegree = edu.degree;
          }
        }
      }
    });
    
    return highestDegree;
  }

  /**
   * Get total number of skills
   * @param {Array} skills - Array of skill categories
   * @returns {number} - Total number of skills
   */
  getSkillsCount(skills) {
    if (!skills || !Array.isArray(skills)) return 0;
    
    return skills.reduce((total, category) => {
      return total + (category.items ? category.items.length : 0);
    }, 0);
  }

  /**
   * Calculate duration between two dates
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {boolean} isCurrent - Whether it's current position/education
   * @returns {string} - Duration string
   */
  calculateDuration(startDate, endDate, isCurrent) {
    if (!startDate) return '';
    
    const start = moment(startDate);
    const end = isCurrent ? moment() : moment(endDate);
    
    if (!end.isValid()) return '';
    
    const duration = moment.duration(end.diff(start));
    const years = duration.years();
    const months = duration.months();
    
    if (years > 0 && months > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return 'Less than a month';
    }
  }

  /**
   * Generate sample resume data for testing
   * @returns {Object} - Sample resume data
   */
  generateSampleData() {
    return {
      title: 'Software Engineer Resume',
      personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        address: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe'
      },
      summary: 'Experienced software engineer with 5+ years of experience in full-stack development. Passionate about creating scalable applications and leading development teams. Skilled in modern JavaScript frameworks, cloud technologies, and agile methodologies.',
      workExperience: [
        {
          jobTitle: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          startDate: '2021-03-01',
          endDate: null,
          isCurrentJob: true,
          description: 'Lead development of customer-facing web applications using React and Node.js. Mentor junior developers and contribute to architecture decisions.',
          achievements: [
            'Improved application performance by 40% through optimization techniques',
            'Led a team of 4 developers in building a new customer portal',
            'Implemented automated testing that reduced bugs by 60%'
          ]
        },
        {
          jobTitle: 'Software Engineer',
          company: 'StartupCo',
          location: 'San Francisco, CA',
          startDate: '2019-06-01',
          endDate: '2021-02-28',
          isCurrentJob: false,
          description: 'Developed and maintained web applications using modern JavaScript frameworks.',
          achievements: [
            'Built RESTful APIs serving 1M+ requests per day',
            'Collaborated with design team to implement responsive UI components',
            'Reduced deployment time by 50% through CI/CD pipeline improvements'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          startDate: '2015-09-01',
          endDate: '2019-05-30',
          isCurrentlyStudying: false,
          gpa: 3.8,
          description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems'
        }
      ],
      skills: [
        {
          category: 'Programming Languages',
          items: [
            { name: 'JavaScript', level: 'expert' },
            { name: 'Python', level: 'advanced' },
            { name: 'Java', level: 'intermediate' },
            { name: 'TypeScript', level: 'advanced' }
          ]
        },
        {
          category: 'Frameworks & Libraries',
          items: [
            { name: 'React', level: 'expert' },
            { name: 'Node.js', level: 'advanced' },
            { name: 'Express.js', level: 'advanced' },
            { name: 'Django', level: 'intermediate' }
          ]
        },
        {
          category: 'Tools & Technologies',
          items: [
            { name: 'Git', level: 'expert' },
            { name: 'Docker', level: 'advanced' },
            { name: 'AWS', level: 'intermediate' },
            { name: 'MongoDB', level: 'advanced' }
          ]
        }
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce application with payment processing and inventory management',
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
          url: 'https://ecommerce-demo.com',
          githubUrl: 'https://github.com/johndoe/ecommerce-platform',
          startDate: '2020-01-01',
          endDate: '2020-06-30'
        },
        {
          name: 'Task Management App',
          description: 'Collaborative task management application with real-time updates',
          technologies: ['React', 'Socket.io', 'PostgreSQL'],
          url: 'https://taskapp-demo.com',
          githubUrl: 'https://github.com/johndoe/task-app',
          startDate: '2019-08-01',
          endDate: '2019-12-31'
        }
      ],
      achievements: [
        {
          title: 'Best Innovation Award',
          description: 'Recognized for developing an innovative solution that improved customer satisfaction by 25%',
          date: '2022-12-01',
          issuer: 'Tech Corp'
        },
        {
          title: 'Outstanding Graduate',
          description: 'Graduated Summa Cum Laude with highest honors in Computer Science',
          date: '2019-05-30',
          issuer: 'UC Berkeley'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2022-03-15',
          expiryDate: '2025-03-15',
          credentialId: 'AWS-CSA-123456',
          url: 'https://aws.amazon.com/certification/'
        },
        {
          name: 'React Developer Certification',
          issuer: 'Meta',
          date: '2021-08-20',
          credentialId: 'META-REACT-789012'
        }
      ],
      languages: [
        { name: 'English', proficiency: 'native' },
        { name: 'Spanish', proficiency: 'conversational' },
        { name: 'French', proficiency: 'basic' }
      ],
      customFields: []
    };
  }
}

module.exports = TemplateRenderer; 