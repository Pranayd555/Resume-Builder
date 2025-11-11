const handlebars = require('handlebars');
const moment = require('moment');
const crypto = require('crypto');

// Register Handlebars helpers
handlebars.registerHelper('formatDate', function(date) {
  return moment(date).format('MMM YYYY');
});

handlebars.registerHelper('formatDateRange', function(startDate, endDate, isCurrent) {
  const start = moment(startDate).format('MMM YYYY');
  const end = isCurrent ? 'Present' : moment(endDate).format('MMM YYYY');
  return `${start} - ${end}`;
});

handlebars.registerHelper('calculateDuration', function(startDate, endDate, isCurrent) {
  const start = moment(startDate);
  const end = isCurrent ? moment() : moment(endDate);
  const years = end.diff(start, 'years');
  const months = end.diff(start, 'months') % 12;
  
  if (years > 0 && months > 0) {
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  } else if (years > 0) {
    return `${years} yr${years > 1 ? 's' : ''}`;
  } else {
    return `${months} mo${months > 1 ? 's' : ''}`;
  }
});

handlebars.registerHelper('isCurrentlyStudying', function(education) {
  return education && education.some(edu => edu.isCurrentlyStudying);
});

handlebars.registerHelper('join', function(array, separator) {
  if (!array || !Array.isArray(array)) return '';
  return array.join(separator || ', ');
});

/**
 * Optimized Template Renderer with CSS Caching
 * Replaces inefficient string concatenation with template-based CSS generation
 */
class OptimizedTemplateRenderer {
  constructor() {
    this.handlebars = handlebars;
    this.cssTemplates = new Map();
    this.styleCache = new Map();
    this.cssTemplateCache = new Map();
    this.maxCacheSize = 1000; // Prevent memory leaks
  }

  /**
   * Generate a hash for styling configuration to enable caching
   * @param {Object} styling - Template styling object
   * @param {Object} dataStyling - User data styling object
   * @returns {string} - Hash string for caching
   */
  generateStylingHash(styling, dataStyling) {
    const hashData = {
      colors: styling?.colors || {},
      fonts: styling?.fonts || {},
      template: dataStyling?.template || {}
    };
    return crypto.createHash('md5').update(JSON.stringify(hashData)).digest('hex');
  }

  /**
   * Get cached CSS if available
   * @param {string} stylingHash - Hash of styling configuration
   * @param {string} templateId - Template identifier
   * @returns {string|null} - Cached CSS or null if not found
   */
  getCachedStyles(stylingHash, templateId) {
    const cacheKey = `${templateId}-${stylingHash}`;
    return this.styleCache.get(cacheKey);
  }

  /**
   * Set cached CSS
   * @param {string} stylingHash - Hash of styling configuration
   * @param {string} templateId - Template identifier
   * @param {string} css - Generated CSS
   */
  setCachedStyles(stylingHash, templateId, css) {
    const cacheKey = `${templateId}-${stylingHash}`;
    
    // Implement LRU-like cache eviction
    if (this.styleCache.size >= this.maxCacheSize) {
      const firstKey = this.styleCache.keys().next().value;
      this.styleCache.delete(firstKey);
    }
    
    this.styleCache.set(cacheKey, css);
  }

  /**
   * Get or compile CSS template for a template type
   * @param {Object} template - Template object
   * @returns {Function} - Compiled CSS template function
   */
  getCssTemplate(template) {
    const templateKey = template._id?.toString() || template.name || 'default';
    
    if (!this.cssTemplates.has(templateKey)) {
      this.cssTemplates.set(templateKey, this.compileCssTemplate(template));
    }
    
    return this.cssTemplates.get(templateKey);
  }

  /**
   * Compile CSS template for efficient rendering
   * @param {Object} template - Template object
   * @returns {Function} - Compiled CSS template function
   */
  compileCssTemplate(template) {
    const baseCss = template.templateCode.css;
    
    return (styling, dataStyling, uniqueId) => {
      let css = baseCss;
      const colors = styling?.colors || {};
      const fonts = styling?.fonts || {};

      // Pre-compile regex patterns for better performance
      const colorPatterns = Object.keys(colors).map(key => ({
        pattern: new RegExp(`var\\(--color-${key}\\)`, 'g'),
        replacement: colors[key]
      }));

      const fontPatterns = Object.keys(fonts)
        .filter(key => key !== 'sizes')
        .map(key => ({
          pattern: new RegExp(`var\\(--font-${key}\\)`, 'g'),
          replacement: fonts[key]
        }));

      const fontSizePatterns = fonts.sizes ? 
        Object.keys(fonts.sizes).map(size => ({
          pattern: new RegExp(`var\\(--font-size-${size}\\)`, 'g'),
          replacement: `${fonts.sizes[size]}px`
        })) : [];

      // Apply all replacements efficiently
      [...colorPatterns, ...fontPatterns, ...fontSizePatterns].forEach(({ pattern, replacement }) => {
        css = css.replace(pattern, replacement);
      });

      // Apply template styling options if available
      if (dataStyling?.template) {
        css += this.generateTemplateStyling(dataStyling.template, uniqueId, styling);
      }

      // Apply user color overrides if available
      if (dataStyling?.template?.colors) {
        css += this.generateColorOverrides(dataStyling.template.colors, uniqueId);
      }

      // Add final spacing rules
      css += this.generateSpacingRules(uniqueId);

      return css;
    };
  }

  /**
   * Generate template-specific styling CSS
   * @param {Object} templateStyling - Template styling configuration
   * @param {string} uniqueId - Unique CSS identifier
   * @param {Object} styling - Template styling object
   * @returns {string} - Generated CSS
   */
  generateTemplateStyling(templateStyling, uniqueId, styling) {
    let css = '';

    // Add CSS variables for user-selected colors
    if (templateStyling?.colors) {
      css += `
        .${uniqueId} {
          --user-color-primary: ${templateStyling.colors.primary || 'var(--color-primary)'};
          --user-color-secondary: ${templateStyling.colors.secondary || 'var(--color-secondary)'};
          --user-color-accent: ${templateStyling.colors.accent || 'var(--color-accent)'};
          --user-color-text: ${templateStyling.colors.text || 'var(--color-text)'};
          --user-color-background: ${templateStyling.colors.background || 'var(--color-background)'};
        }
      `;
    }

    // Header level mapping
    const headerLevels = {
      'h1': { fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.25rem' },
      'h2': { fontSize: '2rem', fontWeight: '700', marginBottom: '0.125rem' },
      'h3': { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.125rem' },
      'h4': { fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.125rem' },
      'h5': { fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.125rem' }
    };

    // Apply header font size
    if (templateStyling.headerFontSize) {
      css += `
        .${uniqueId} h1,
        .${uniqueId} h2,
        .${uniqueId} h3,
        .${uniqueId} h4,
        .${uniqueId} h5 { 
          font-size: ${templateStyling.headerFontSize}px !important; 
          font-weight: 600 !important; 
          margin-bottom: 0.125rem !important; 
        }
        .${uniqueId} .name {
          font-size: ${templateStyling.headerFontSize + 2}px !important;  
          font-weight: 600 !important; 
          margin-bottom: 0.25rem !important; 
        }
          
        
        /* Medium text elements */
        .${uniqueId} .language-name,
        .${uniqueId} .skill-category-title,
        .${uniqueId} .job-title,
        .${uniqueId} .edu-degree,
        .${uniqueId} .project-name,
        .${uniqueId} .achievement-title,
        .${uniqueId} .cert-name,
        .${uniqueId} .custom-field-title { 
          font-size: ${templateStyling.headerFontSize - 2}px !important; 
        }
      `;
    }
    // Apply header level (fallback if headerFontSize not set)
    // else if (templateStyling.headerLevel && headerLevels[templateStyling.headerLevel]) {
    //   const level = headerLevels[templateStyling.headerLevel];
    //   css += `
    //     .${uniqueId} .name,
    //     .${uniqueId} h1,
    //     .${uniqueId} h2,
    //     .${uniqueId} h3,
    //     .${uniqueId} h4,
    //     .${uniqueId} h5 { 
    //       font-size: ${level.fontSize} !important; 
    //       font-weight: ${level.fontWeight} !important; 
    //     }
    //   `;
    // }

    // Apply content font size with unified logic
    if (templateStyling.fontSize) {
      const baseSize = templateStyling.fontSize;
      let smallSize, mediumSize;
      
      // Unified font size logic: <14 = 10px, 14-18 = 12px, >18 = 13px
      if (baseSize <= 14) {
        smallSize = 10;
        mediumSize = baseSize + 1;
      } else if (baseSize > 14 && baseSize <= 18) {
        smallSize = 12;
        mediumSize = baseSize + 1;
      } else {
        smallSize = 14;
        mediumSize = baseSize + 1;
      }
      
      css += `
        /* Main content font size */
        .${uniqueId} p,
        .${uniqueId} .secondaryFont,
        .${uniqueId} .contact-info,
        .${uniqueId} .job-description,
        .${uniqueId} .edu-description,
        .${uniqueId} .achievements li,
        .${uniqueId} .skill-items,
        .${uniqueId} .technologies,
        .${uniqueId} .project-links,
        .${uniqueId} .custom-content,
        .${uniqueId} .summary-text,
        .${uniqueId} .project-description,
        .${uniqueId} .achievement-description,
        .${uniqueId} .edu-description
        .${uniqueId} .achievements { 
          font-size: ${baseSize}px !important; 
        }
        
        /* Small text elements (dates, meta info, etc.) */
        .${uniqueId} .job-dates,
        .${uniqueId} .edu-dates,
        .${uniqueId} .project-dates,
        .${uniqueId} .achievement-date,
        .${uniqueId} .cert-dates,
        .${uniqueId} .cert-expiry,
        .${uniqueId} .cert-id,
        .${uniqueId} .language-level,
        .${uniqueId} .language-proficiency,
        .${uniqueId} .achievement-issuer,
        .${uniqueId} .cert-issuer,
        .${uniqueId} .gpa,
        .${uniqueId} .company,
        .${uniqueId} .institution,
        .${uniqueId} .location,
        .${uniqueId} .issuer,
        .${uniqueId} .dates,
        .${uniqueId} .tech-tag,
        .${uniqueId} .skill-item, { 
          font-size: ${smallSize}px !important; 
        }

        
        .${uniqueId} .project-links a,
        .${uniqueId} .cert-link a, {
        font-size: ${mediumSize}px !important;
        }

        .${uniqueId} .primaryFont strong {
          font-size: ${smallSize}px !important; 
        }
      `;
    }

    // Apply line spacing
    if (templateStyling.lineSpacing) {
      css += `
        .${uniqueId} p,
        .${uniqueId} .job-description,
        .${uniqueId} .edu-description,
        .${uniqueId} .achievements li,
        .${uniqueId} .summary,
        .${uniqueId} .custom-content { 
          line-height: ${templateStyling.lineSpacing} !important; 
        }
      `;
    }

    // Apply section spacing
    if (templateStyling.sectionSpacing) {
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
          margin-bottom: ${templateStyling.sectionSpacing * 0.25}rem !important; 
          padding-bottom: ${templateStyling.sectionSpacing * 0.125}rem !important; 
        }
        .${uniqueId} .job-item,
        .${uniqueId} .edu-item,
        .${uniqueId} .project-item,
        .${uniqueId} .cert-item,
        .${uniqueId} .achievement-item,
        .${uniqueId} .skill-category { 
          margin-bottom: ${templateStyling.sectionSpacing * 0.25}rem !important; 
          padding-bottom: ${templateStyling.sectionSpacing * 0.125}rem !important; 
        }
      `;
    }

    // Apply primary and secondary font classes with appropriate sizes
    // Use user-selected fonts if available, otherwise use template defaults
    const primaryFont = templateStyling?.primaryFont || styling?.fonts?.primary || 'Arial';
    const secondaryFont = templateStyling?.secondaryFont || styling?.fonts?.secondary || 'Arial';
    
    // Get font sizes from template styling (prioritize user settings over template defaults)
    const headingSize = templateStyling?.headerFontSize || styling?.fonts?.sizes?.heading || 18;
    const subheadingSize = templateStyling?.headerFontSize || styling?.fonts?.sizes?.subheading || 16;
    const bodySize = templateStyling?.fontSize || styling?.fonts?.sizes?.body || 12;
    const smallSize = styling?.fonts?.sizes?.small || 10;
    
    css += `
      /* Primary and Secondary Font Classes - High Specificity */
      .${uniqueId} .primaryFont,
      .${uniqueId} .primaryFont * {
        font-family: '${primaryFont}', sans-serif !important;
        font-size: ${headingSize}px !important;
        font-weight: ${templateStyling.headerLevel == 'h1' ? '800' : templateStyling.headerLevel == 'h2' ? '700' : templateStyling.headerLevel == 'h3' ? '600' : templateStyling.headerLevel == 'h4' ? '500' : templateStyling.headerLevel == 'h5' ? '400' : '600'} !important;
      }
      .${uniqueId} .secondaryFont,
      .${uniqueId} .secondaryFont * {
        font-family: '${secondaryFont}', sans-serif !important;
        font-size: ${bodySize}px !important;
        font-weight: 400 !important;
      }
      
      /* Specific heading sizes for primaryFont */
      .${uniqueId} .primaryFont h1,
      .${uniqueId} h1.primaryFont,
      .${uniqueId} .name.primaryFont {
        font-size: ${headingSize + 2}px !important;
        font-weight: ${templateStyling.headerLevel == 'h1' ? '800' : templateStyling.headerLevel == 'h2' ? '700' : templateStyling.headerLevel == 'h3' ? '600' : templateStyling.headerLevel == 'h4' ? '500' : templateStyling.headerLevel == 'h5' ? '400' : '600'} !important;
      }
      .${uniqueId} .primaryFont h2,
      .${uniqueId} h2.primaryFont {
        font-size: ${headingSize}px !important;
        font-weight: ${templateStyling.headerLevel == 'h1' ? '800' : templateStyling.headerLevel == 'h2' ? '700' : templateStyling.headerLevel == 'h3' ? '600' : templateStyling.headerLevel == 'h4' ? '500' : templateStyling.headerLevel == 'h5' ? '400' : '600'} !important;
      }
      .${uniqueId} .primaryFont h3,
      .${uniqueId} h3.primaryFont {
        font-size: ${subheadingSize}px !important;
        font-weight: ${templateStyling.headerLevel == 'h1' ? '800' : templateStyling.headerLevel == 'h2' ? '700' : templateStyling.headerLevel == 'h3' ? '600' : templateStyling.headerLevel == 'h4' ? '500' : templateStyling.headerLevel == 'h5' ? '400' : '600'} !important;
      }
      
      /* Small text for secondaryFont */
      .${uniqueId} .secondaryFont small,
      .${uniqueId} small.secondaryFont,
      .${uniqueId} .secondaryFont .dates {
        font-size: ${smallSize}px !important;
      }

      .${uniqueId} strong.secondaryFont, 
      .${uniqueId} .secondaryFont strong {
        font-weight: 600 !important;
      }
      
      /* Override any existing font rules for these classes */
      .${uniqueId} .primaryFont,
      .${uniqueId} .primaryFont * {
        font-family: '${primaryFont}', sans-serif !important;
      }
      .${uniqueId} .secondaryFont,
      .${uniqueId} .secondaryFont * {
        font-family: '${secondaryFont}', sans-serif !important;
      }
    `;

    return css;
  }

  /**
   * Get effective colors - only apply colors that user has explicitly set
   * @param {Object} resumeColors - Colors from resume styling
   * @param {Object} templateColors - Colors from template styling
   * @returns {Object} - Effective colors (only user-selected colors)
   */
  getEffectiveColors(resumeColors, templateColors) {
    const effectiveColors = {};

    // Only apply colors that the user has explicitly set in their resume
    if (resumeColors) {
      Object.keys(resumeColors).forEach(key => {
        if (resumeColors[key] && resumeColors[key] !== null) {
          effectiveColors[key] = resumeColors[key];
        }
      });
    }

    // If no user colors, return empty object (no colors applied)
    return effectiveColors;
  }

  /**
   * Generate color override CSS for user-selected colors
   * @param {Object} userColors - User-selected color configuration
   * @param {string} uniqueId - Unique CSS identifier
   * @returns {string} - Generated CSS
   */
  generateColorOverrides(userColors, uniqueId) {
    if (!userColors) return '';

    let css = '';
    
    // Override primary colors
    if (userColors.primary) {
      css += `
        .${uniqueId} .name,
        .${uniqueId} h1,
        .${uniqueId} h2,
        .${uniqueId} h3,
        .${uniqueId} h4,
        .${uniqueId} h5,
        .${uniqueId} .primaryFont,
        .${uniqueId} .contact-info,
        .${uniqueId} .skill-category-title,
        .${uniqueId} .job-title,
        .${uniqueId} .edu-degree,
        .${uniqueId} .project-name,
        .${uniqueId} .achievement-title,
        .${uniqueId} .cert-name {
          color: ${userColors.primary} !important;
        }
        .${uniqueId} .skill-item,
        .${uniqueId} .tech-tag,
        .${uniqueId} h2,
        .${uniqueId} h3 {
          border-bottom-color: ${userColors.primary} !important;
        }
      `;
    }

    // Override secondary colors
    if (userColors.secondary) {
      css += `
        .${uniqueId} .job-description,
        .${uniqueId} .edu-description,
        .${uniqueId} .achievements li,
        .${uniqueId} .skill-items,
        .${uniqueId} .project-links,
        .${uniqueId} .cert-expiry,
        .${uniqueId} .cert-id,
        .${uniqueId} .language-level,
        .${uniqueId} .language-proficiency,
        .${uniqueId} .tech-tag,
        .${uniqueId} .custom-content,
        .${uniqueId} .summary-text,
        .${uniqueId} .project-description,
        .${uniqueId} .achievement-description,
        .${uniqueId} .secondaryFont,
        .${uniqueId} .skill-item {
          color: ${userColors.secondary} !important;
        }
      `;
    }

    // Override accent colors
    if (userColors.accent) {
      css += `
        .${uniqueId} .company,
        .${uniqueId} .institution,
        .${uniqueId} .issuer,
        .${uniqueId} .location,
        .${uniqueId} .dates,
        .${uniqueId} .job-dates,
        .${uniqueId} .edu-dates,
        .${uniqueId} .project-dates,
        .${uniqueId} .achievement-date,
        .${uniqueId} .cert-dates,
        .${uniqueId} .cert-expiry,
        .${uniqueId} .cert-id,
        .${uniqueId} .achievement-issuer,
        .${uniqueId} .cert-issuer,
        .${uniqueId} .gpa {
          color: ${userColors.accent} !important;
        }
        .${uniqueId} .project-links a,
        .${uniqueId} .cert-link a,
        .${uniqueId} .contact-item a {
          color: ${userColors.accent} !important;
        }
      `;
    }

    // Override text colors
    if (userColors.text) {
      css += `
        .${uniqueId} p,
        .${uniqueId} .summary,
        .${uniqueId} .about-text,
        .${uniqueId} .description,
        .${uniqueId} .achievement-description,
        .${uniqueId} .custom-content,
        .${uniqueId} ul li,
        .${uniqueId} ol li {
          color: ${userColors.text} !important;
        }
      `;
    }


    return css;
  }

  /**
   * Generate spacing rules CSS
   * @param {string} uniqueId - Unique CSS identifier
   * @returns {string} - Generated CSS
   */
  generateSpacingRules(uniqueId) {
    return `
      /* Add more bottom spacing for main section titles */
      .${uniqueId} h2,
      .${uniqueId} .section-title,
      .${uniqueId} .sidebar-title {
        margin-bottom: 0.5rem !important;
        padding-bottom: 0.25rem !important;
      }
      
      /* Specific spacing for work experience and projects sections */
      .${uniqueId} .work-experience h2,
      .${uniqueId} .projects h2,
      .${uniqueId} .education h2,
      .${uniqueId} .skills h2,
      .${uniqueId} .achievements h2,
      .${uniqueId} .certifications h2,
      .${uniqueId} .languages h2,
      .${uniqueId} .summary h2 {
        margin-bottom: 0.75rem !important;
        padding-bottom: 0.375rem !important;
      }
      
      /* Remove bottom spacing from the last element */
      .${uniqueId} > *:last-child,
      .${uniqueId} section:last-child,
      .${uniqueId} .section:last-child,
      .${uniqueId} .work-experience:last-child,
      .${uniqueId} .education:last-child,
      .${uniqueId} .skills:last-child,
      .${uniqueId} .projects:last-child,
      .${uniqueId} .achievements:last-child,
      .${uniqueId} .certifications:last-child,
      .${uniqueId} .languages:last-child,
      .${uniqueId} .summary:last-child,
      .${uniqueId} .custom-fields:last-child,
      .${uniqueId} .main-column > *:last-child,
      .${uniqueId} .sidebar > *:last-child,
      .${uniqueId} .content-grid > *:last-child {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }
      
      /* General list styling for HTML content in descriptions */
      .${uniqueId} ul, .${uniqueId} ol { 
        margin: 0.25rem 0; 
        padding-left: 1rem; 
      }
      .${uniqueId} ul li, .${uniqueId} ol li { 
        margin-bottom: 0.125rem; 
        line-height: 1.3; 
      }
      .${uniqueId} ul { 
        list-style-type: disc; 
      }
      .${uniqueId} ol { 
        list-style-type: decimal; 
      }
      
      /* Preserve CKEditor formatting in all description fields */
      .${uniqueId} .summary-text,
      .${uniqueId} .about-text,
      .${uniqueId} .executive-summary,
      .${uniqueId} .summary-section,
      .${uniqueId} .summary,
      .${uniqueId} .project-description,
      .${uniqueId} .job-description,
      .${uniqueId} .edu-description,
      .${uniqueId} .achievement-description,
      .${uniqueId} .custom-content {
        /* Don't override CKEditor styles */
      }
      
      /* Preserve all CKEditor inline styles */
      .${uniqueId} .summary-text span[style],
      .${uniqueId} .about-text span[style],
      .${uniqueId} .executive-summary span[style],
      .${uniqueId} .summary-section span[style],
      .${uniqueId} .summary span[style],
      .${uniqueId} .project-description span[style],
      .${uniqueId} .job-description span[style],
      .${uniqueId} .edu-description span[style],
      .${uniqueId} .achievement-description span[style],
      .${uniqueId} .custom-content span[style] {
        /* Let inline styles take precedence */
      }
      
      /* Ensure CKEditor bold formatting is preserved */
      .${uniqueId} .summary-text strong, .${uniqueId} .summary-text b,
      .${uniqueId} .about-text strong, .${uniqueId} .about-text b,
      .${uniqueId} .executive-summary strong, .${uniqueId} .executive-summary b,
      .${uniqueId} .summary-section strong, .${uniqueId} .summary-section b,
      .${uniqueId} .summary strong, .${uniqueId} .summary b,
      .${uniqueId} .project-description strong, .${uniqueId} .project-description b,
      .${uniqueId} .job-description strong, .${uniqueId} .job-description b,
      .${uniqueId} .edu-description strong, .${uniqueId} .edu-description b,
      .${uniqueId} .achievement-description strong, .${uniqueId} .achievement-description b,
      .${uniqueId} .custom-content strong, .${uniqueId} .custom-content b {
        font-weight: 700 !important;
      }
      
      /* Ensure CKEditor italic formatting is preserved */
      .${uniqueId} .summary-text em, .${uniqueId} .summary-text i,
      .${uniqueId} .about-text em, .${uniqueId} .about-text i,
      .${uniqueId} .executive-summary em, .${uniqueId} .executive-summary i,
      .${uniqueId} .summary-section em, .${uniqueId} .summary-section i,
      .${uniqueId} .summary em, .${uniqueId} .summary i,
      .${uniqueId} .project-description em, .${uniqueId} .project-description i,
      .${uniqueId} .job-description em, .${uniqueId} .job-description i,
      .${uniqueId} .edu-description em, .${uniqueId} .edu-description i,
      .${uniqueId} .achievement-description em, .${uniqueId} .achievement-description i,
      .${uniqueId} .custom-content em, .${uniqueId} .custom-content i {
        font-style: italic !important;
      }
      
      /* Ensure CKEditor underline formatting is preserved */
      .${uniqueId} .summary-text u,
      .${uniqueId} .about-text u,
      .${uniqueId} .executive-summary u,
      .${uniqueId} .summary-section u,
      .${uniqueId} .summary u,
      .${uniqueId} .project-description u,
      .${uniqueId} .job-description u,
      .${uniqueId} .edu-description u,
      .${uniqueId} .achievement-description u,
      .${uniqueId} .custom-content u {
        text-decoration: underline !important;
      }
      
      /* Preserve CKEditor list formatting */
      .${uniqueId} .summary-text ol, .${uniqueId} .summary-text ul,
      .${uniqueId} .about-text ol, .${uniqueId} .about-text ul,
      .${uniqueId} .executive-summary ol, .${uniqueId} .executive-summary ul,
      .${uniqueId} .summary-section ol, .${uniqueId} .summary-section ul,
      .${uniqueId} .summary ol, .${uniqueId} .summary ul,
      .${uniqueId} .project-description ol, .${uniqueId} .project-description ul,
      .${uniqueId} .job-description ol, .${uniqueId} .job-description ul,
      .${uniqueId} .edu-description ol, .${uniqueId} .edu-description ul,
      .${uniqueId} .achievement-description ol, .${uniqueId} .achievement-description ul,
      .${uniqueId} .custom-content ol, .${uniqueId} .custom-content ul {
        margin: 0.25rem 0;
        padding-left: 1rem;
      }
      
      .${uniqueId} .summary-text li, .${uniqueId} .summary-text li,
      .${uniqueId} .about-text li, .${uniqueId} .about-text li,
      .${uniqueId} .executive-summary li, .${uniqueId} .executive-summary li,
      .${uniqueId} .summary-section li, .${uniqueId} .summary-section li,
      .${uniqueId} .summary li, .${uniqueId} .summary li,
      .${uniqueId} .project-description li, .${uniqueId} .project-description li,
      .${uniqueId} .job-description li, .${uniqueId} .job-description li,
      .${uniqueId} .edu-description li, .${uniqueId} .edu-description li,
      .${uniqueId} .achievement-description li, .${uniqueId} .achievement-description li,
      .${uniqueId} .custom-content li, .${uniqueId} .custom-content li {
        margin-bottom: 0.125rem;
        line-height: 1.3;
      }
      
      /* Also remove bottom spacing from last items within sections 
      .${uniqueId} .job-item:last-child,
      .${uniqueId} .edu-item:last-child,
      .${uniqueId} .project-item:last-child,
      .${uniqueId} .cert-item:last-child,
      .${uniqueId} .achievement-item:last-child,
      .${uniqueId} .skill-category:last-child,
      .${uniqueId} .language-item:last-child,
      .${uniqueId} .custom-field:last-child {
        margin-bottom: 2px !important;
        padding-bottom: 0 !important;
      } */
    `;
  }

  /**
   * Optimized CSS rendering with caching
   * @param {Object} template - Template object
   * @param {Object} data - Template data
   * @param {string} uniqueId - Unique identifier for CSS scoping
   * @returns {string} - Rendered CSS
   */
  renderCss(template, data, uniqueId) {
    const templateId = template._id?.toString() || template.name || 'default';
    const styling = template.styling;
    const dataStyling = data.styling;
    
    // Generate hash for caching
    const stylingHash = this.generateStylingHash(styling, dataStyling);
    
    // Check cache first
    const cachedCss = this.getCachedStyles(stylingHash, templateId);
    if (cachedCss) {
      return cachedCss;
    }
    
    // Get or compile CSS template
    const cssTemplate = this.getCssTemplate(template);
    
    // Generate CSS using template
    const css = cssTemplate(styling, dataStyling, uniqueId);
    
    // Cache the result
    this.setCachedStyles(stylingHash, templateId, css);
    
    return css;
  }

  /**
   * Clear CSS cache (useful for development or memory management)
   */
  clearCache() {
    this.styleCache.clear();
    this.cssTemplates.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getCacheStats() {
    return {
      styleCacheSize: this.styleCache.size,
      cssTemplatesSize: this.cssTemplates.size,
      maxCacheSize: this.maxCacheSize
    };
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
        colors: this.getEffectiveColors(plainData.styling?.template?.colors, template.styling?.colors),
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
      isFresher: false,
      personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        address: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        profilePicture: 'https://cdn-icons-png.flaticon.com/512/3135/3135823.png',
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
          technologies: ['React', 'Node.js', 'MongoDB', 'Razorpay API'],
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

module.exports = OptimizedTemplateRenderer; 