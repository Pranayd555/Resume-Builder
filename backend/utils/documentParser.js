const { extractResumeText, isSupportedResumeType } = require('./resumeTextExtractor');

/**
 * Text extraction for uploaded documents (job descriptions for the ATS check).
 * Uses the same layout-aware extractor as resume import, so words on one line
 * stay apart and two-column files read in order.
 *
 * Legacy .doc files are not supported (the DOCX reader can't open them); the
 * error tells the user to save as .docx or PDF.
 */
class DocumentParser {
  /**
   * @param {Buffer} buffer
   * @param {string} mimetype
   * @returns {Promise<string>} extracted text
   * @throws {Error} with a user-facing message
   */
  static async parseDocument(buffer, mimetype) {
    const { text } = await extractResumeText(buffer, mimetype);
    return text;
  }

  static isValidDocumentType(mimetype) {
    return isSupportedResumeType(mimetype);
  }
}

module.exports = DocumentParser;
