/**
 * Thumbnail Generator Utility
 * 
 * This module provides functions to automatically generate thumbnail URLs
 * for resume templates based on their styling and metadata.
 */

/**
 * Generates a placeholder thumbnail URL using via.placeholder.com
 * @param {string} templateName - The name of the template
 * @param {string} primaryColor - The primary color (with or without #)
 * @param {object} options - Optional configuration
 * @returns {string} The generated thumbnail URL
 */
function generatePlaceholderThumbnail(templateName, primaryColor, options = {}) {
  const {
    width = 300,
    height = 400,
    textColor = 'ffffff',
    service = 'placeholder.com'
  } = options;

  // Clean the color (remove # if present)
  const cleanColor = primaryColor.replace('#', '');
  
  // Encode the template name for URL safety
  const encodedName = encodeURIComponent(templateName);
  
  // Generate URL based on service
  switch (service) {
    case 'placeholder.com':
    default:
      return `https://via.placeholder.com/${width}x${height}/${cleanColor}/${textColor}?text=${encodedName}`;
  }
}

/**
 * Generates an SVG data URI thumbnail
 * @param {string} templateName - The name of the template
 * @param {object} styling - The template's styling object
 * @param {object} options - Optional configuration
 * @returns {string} SVG data URI
 */
function generateSvgThumbnail(templateName, styling, options = {}) {
  const {
    width = 300,
    height = 400,
    fontSize = 16,
    fontFamily = 'Arial, sans-serif'
  } = options;

  const primaryColor = styling.colors?.primary || '#2563eb';
  const textColor = getContrastColor(primaryColor);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${primaryColor}"/>
      <text x="${width/2}" y="${height/2}" text-anchor="middle" dominant-baseline="middle" 
            fill="${textColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="600">
        ${templateName}
      </text>
      <text x="${width/2}" y="${height/2 + 25}" text-anchor="middle" dominant-baseline="middle" 
            fill="${textColor}" font-family="${fontFamily}" font-size="12" opacity="0.8">
        Template Preview
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generates a more detailed SVG preview showing template layout
 * @param {object} template - The complete template object
 * @param {object} options - Optional configuration
 * @returns {string} SVG data URI
 */
function generateLayoutPreview(template, options = {}) {
  const {
    width = 300,
    height = 400
  } = options;

  const colors = template.styling?.colors || {};
  const layout = template.layout?.type || 'single-column';
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Background
  svg += `<rect width="${width}" height="${height}" fill="${colors.background || '#ffffff'}" stroke="${colors.primary || '#2563eb'}" stroke-width="2"/>`;
  
  // Header section
  svg += `<rect x="10" y="10" width="${width-20}" height="60" fill="${colors.primary || '#2563eb'}" rx="4"/>`;
  svg += `<text x="${width/2}" y="45" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="600">${template.name}</text>`;
  
  // Layout-specific sections
  if (layout === 'two-column') {
    // Main content column
    svg += `<rect x="10" y="80" width="${width*0.6-15}" height="${height-100}" fill="${colors.secondary || '#f8f9fa'}" rx="2"/>`;
    // Sidebar column
    svg += `<rect x="${width*0.6+5}" y="80" width="${width*0.4-15}" height="${height-100}" fill="${colors.accent || '#e9ecef'}" rx="2"/>`;
  } else {
    // Single column
    svg += `<rect x="10" y="80" width="${width-20}" height="${height-100}" fill="${colors.secondary || '#f8f9fa'}" rx="2"/>`;
  }
  
  // Category indicator
  svg += `<circle cx="${width-30}" cy="30" r="12" fill="${getCategoryColor(template.category)}"/>`;
  svg += `<text x="${width-30}" y="35" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="600">${template.category?.charAt(0).toUpperCase() || 'T'}</text>`;
  
  svg += `</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Automatically generates thumbnail URL from template object
 * @param {object} template - The template object
 * @param {string} method - Generation method ('placeholder', 'svg', 'layout')
 * @returns {string} Generated thumbnail URL
 */
function generateThumbnailFromTemplate(template, method = 'placeholder') {
  const templateName = template.name;
  const primaryColor = template.styling?.colors?.primary || '#2563eb';

  switch (method) {
    case 'svg':
      return generateSvgThumbnail(templateName, template.styling);
    case 'layout':
      return generateLayoutPreview(template);
    case 'placeholder':
    default:
      return generatePlaceholderThumbnail(templateName, primaryColor);
  }
}

/**
 * Updates all templates with auto-generated thumbnails
 * @param {Array} templates - Array of template objects
 * @param {string} method - Generation method
 * @returns {Array} Updated templates with thumbnail URLs
 */
function updateTemplatesWithThumbnails(templates, method = 'placeholder') {
  return templates.map(template => ({
    ...template,
    preview: {
      ...template.preview,
      thumbnail: {
        ...template.preview?.thumbnail,
        url: generateThumbnailFromTemplate(template, method)
      }
    }
  }));
}

/**
 * Helper function to determine contrasting text color
 * @param {string} hexColor - Hex color code
 * @returns {string} 'ffffff' for white or '000000' for black
 */
function getContrastColor(hexColor) {
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '000000' : 'ffffff';
}

/**
 * Get category-specific color
 * @param {string} category - Template category
 * @returns {string} Hex color for the category
 */
function getCategoryColor(category) {
  const categoryColors = {
    modern: '#2563eb',
    classic: '#000000',
    creative: '#ec4899',
    minimalist: '#10b981',
    professional: '#1e40af',
    academic: '#059669'
  };
  return categoryColors[category] || '#6b7280';
}

module.exports = {
  generatePlaceholderThumbnail,
  generateSvgThumbnail,
  generateLayoutPreview,
  generateThumbnailFromTemplate,
  updateTemplatesWithThumbnails,
  getContrastColor,
  getCategoryColor
}; 