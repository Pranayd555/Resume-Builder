const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const logger = require('./logger');

/**
 * Common document parsing service for PDF and DOC files
 * Extracts text content from various document formats
 */
class DocumentParser {
  /**
   * Parse document and extract text content
   * @param {Buffer} buffer - File buffer
   * @param {string} mimetype - MIME type of the file
   * @param {string} originalname - Original filename
   * @returns {Promise<string>} Extracted text content
   */
  static async parseDocument(buffer, mimetype, originalname) {
    try {
      let extractedText = '';

      if (mimetype === 'application/pdf') {
        logger.info('Extracting text from PDF using pdf-parse');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
        logger.info(`PDF text extracted successfully: ${originalname}`);
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 mimetype === 'application/msword') {
        logger.info('Extracting text from Word document using mammoth');
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        logger.info(`Word document text extracted successfully: ${originalname}`);
      } else {
        throw new Error(`Unsupported file type: ${mimetype}`);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the file. Please ensure the document contains readable text.');
      }

      return extractedText.trim();
    } catch (error) {
      logger.error('Document parsing error:', error);
      throw new Error(`Failed to extract text from the file: ${error.message}`);
    }
  }

  /**
   * Validate file type for document parsing
   * @param {string} mimetype - MIME type to validate
   * @returns {boolean} Whether the file type is supported
   */
  static isValidDocumentType(mimetype) {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    return allowedTypes.includes(mimetype);
  }

  /**
   * Get file extension from mimetype
   * @param {string} mimetype - MIME type
   * @returns {string} File extension
   */
  static getFileExtension(mimetype) {
    const extensions = {
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/msword': '.doc'
    };
    return extensions[mimetype] || '';
  }
}

module.exports = DocumentParser;
