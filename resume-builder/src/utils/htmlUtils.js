// Utility functions for handling HTML content from Quill editor

/**
 * Converts plain text to HTML if it's not already HTML
 * @param {string} content - The content to convert
 * @returns {string} - HTML content
 */
export const ensureHtmlContent = (content) => {
  if (!content) return '';
  
  // Check if content is already HTML
  if (content.includes('<') && content.includes('>')) {
    return content;
  }
  
  // Convert plain text to HTML with line breaks
  return content.replace(/\n/g, '<br>');
};

/**
 * Converts HTML content to plain text for display
 * @param {string} htmlContent - The HTML content to convert
 * @returns {string} - Plain text content
 */
export const htmlToText = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Strips HTML tags but preserves line breaks
 * @param {string} htmlContent - The HTML content to strip
 * @returns {string} - Content with HTML tags removed but line breaks preserved
 */
export const stripHtmlTags = (htmlContent) => {
  if (!htmlContent) return '';
  
  return htmlContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

/**
 * Safely renders HTML content
 * @param {string} htmlContent - The HTML content to render
 * @returns {object} - React dangerouslySetInnerHTML object
 */
export const safeHtml = (htmlContent) => {
  return { __html: htmlContent || '' };
};
