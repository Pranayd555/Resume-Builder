import { apiHelpers } from "./api";
import { extractBalance } from "../utils/tokenBalance";
import { API_TIMEOUTS } from "../config/timeouts";

const INSUFFICIENT_TOKENS = 'You have no AI tokens left. Buy more tokens to keep using AI features.';
const MIN_AI_TEXT_CHARS = 20;

/** Visible text length of an HTML fragment (what the server checks). */
export const plainTextLength = (html) => String(html || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim().length;

/** One readable message from an AI error response. */
export const aiErrorMessage = (status, body) => {
  if (status === 403 && body?.limitReached) return INSUFFICIENT_TOKENS;
  if (body?.error) return body.error;
  if (Array.isArray(body?.errors) && body.errors.length) return body.errors.map((e) => e.msg || e.message).join(', ');
  if (status === 504) return 'The AI took too long to respond. Please try again.';
  if (status === 429) return 'Too many AI requests right now. Please wait a moment and try again.';
  return `AI request failed (${status}). Please try again.`;
};

/**
 * fetch with a time limit. The server gives up on the model first and sends a
 * clear error; this only catches a dropped connection or a hung request.
 */
const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('The AI took too long to respond. Please try again.');
    throw new Error('Could not reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
};

/** Parse an AI response; sync the token balance; throw a readable error on failure. */
const readAIResponse = async (response) => {
  const body = await response.json().catch(() => ({}));
  // Success and error bodies can both carry the balance (a refunded token, or "not enough tokens").
  apiHelpers.updateTokenData(extractBalance(body));
  if (!response.ok || body?.success === false) {
    const error = new Error(aiErrorMessage(response.status, body));
    error.status = response.status;
    error.data = body;
    throw error;
  }
  return body;
};

class AIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL;
  }

  _token() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Please log in to use AI features');
    return token;
  }

  async _makeRequest(endpoint, data, method = 'POST', timeoutMs = API_TIMEOUTS.AI) {
    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this._token()}`
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    }, timeoutMs);
    return readAIResponse(response);
  }

  _checkLength(content) {
    if (plainTextLength(content) < MIN_AI_TEXT_CHARS) {
      throw new Error(`Add at least ${MIN_AI_TEXT_CHARS} characters of text before using AI.`);
    }
  }

  /**
   * Rewrite one field for impact and ATS keywords.
   * @param {string} content - HTML from the editor
   * @param {string} field - summary | workExperience | projects | education | achievements | general
   */
  async polishContent(content, field = 'general', tone = 'professional', style = 'achievement-focused') {
    this._checkLength(content);
    const response = await this._makeRequest('/ai/rewrite', { content: content.trim(), field, tone, style });
    return {
      success: true,
      data: {
        rewrittenContent: response.data.rewrittenContent,
        originalContent: response.data.originalContent,
        tone: response.data.tone,
        style: response.data.style,
        message: response.data.message
      }
    };
  }

  /**
   * Shorten one field.
   * @param {string} content - HTML from the editor
   * @param {string} field - see polishContent
   */
  async summarizeContent(content, field = 'general') {
    this._checkLength(content);
    const response = await this._makeRequest('/ai/summarize', { content: content.trim(), field });
    return {
      success: true,
      data: {
        summary: response.data.summary,
        originalContent: response.data.originalContent,
        message: response.data.message
      }
    };
  }

  /**
   * Get AI usage statistics
   * @returns {Promise<Object>} - Usage statistics
   */
  async getUsageStats() {
    return await this._makeRequest('/ai/usage', {}, 'GET');
  }

  /**
   * Generate ATS score for resume
   * @param {string} resumeId - The resume ID
   * @param {string} inputType - Either 'text' or 'file'
   * @param {string} jobDescription - The job description text (for text input)
   * @param {File} jobDescriptionFile - Optional file for job description (for file input)
   * @returns {Promise<Object>} - ATS analysis results
   */
  async generateATSScore(resumeId, inputType, jobDescription = null, jobDescriptionFile = null) {
    if (!resumeId) {
      throw new Error('Resume ID is required');
    }

    if (inputType === 'text' && (!jobDescription || jobDescription.trim().length < 10)) {
      throw new Error('Job description must be at least 10 characters long');
    }

    if (inputType === 'file' && !jobDescriptionFile) {
      throw new Error('Job description file is required');
    }

    const formData = new FormData();
    formData.append('resumeId', resumeId);
    formData.append('inputType', inputType);
    
    if (inputType === 'text' && jobDescription) {
      formData.append('jobDescription', jobDescription);
    } else if (inputType === 'file' && jobDescriptionFile) {
      formData.append('jobDescriptionFile', jobDescriptionFile);
    }

    const response = await fetchWithTimeout(`${this.baseURL}/ai/ats-score`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this._token()}` },
      body: formData
    }, API_TIMEOUTS.AI_PARSING);
    const result = await readAIResponse(response);

     // Backend returns { success: true, data: { atsAnalysis, ... } }
     return {
       success: true,
       data: {
         resumeId: result.data.resumeId,
         resumeTitle: result.data.resumeTitle,
         templateName: result.data.templateName,
         jobDescriptionLength: result.data.jobDescriptionLength,
         inputType: result.data.inputType,
         atsAnalysis: result.data.atsAnalysis,
         message: result.data.message
       }
     };
  }

  /**
   * Get saved ATS analysis for a resume
   * @param {string} resumeId - The resume ID
   * @returns {Promise<Object>} - ATS analysis results
   */
  async getATSAnalysis(resumeId) {
    if (!resumeId) {
      throw new Error('Resume ID is required');
    }

    const response = await this._makeRequest(`/ai/ats-score/${resumeId}`, {}, 'GET');
    
    // Backend returns { success: true, data: { atsAnalysis, ... } }
    return {
      success: true,
      data: {
        resumeId: response.data.resumeId,
        resumeTitle: response.data.resumeTitle,
        templateName: response.data.templateName,
        atsAnalysis: response.data.atsAnalysis,
        message: response.data.message
      }
    };
  }

  /**
   * Adjust resume tone based on ATS analysis
   * @param {string} resumeId - The resume ID
   * @param {Object} resumeJson - The resume data
   * @param {Object} atsAnalysis - The ATS analysis
   * @param {Array} focus - Focus areas for improvement
   * @returns {Promise<Object>} - Updated resume data
   */
  async adjustTone(resumeId, resumeJson, atsAnalysis, focus) {
    if (!resumeId || !resumeJson || !atsAnalysis || !focus) {
      throw new Error('All parameters are required');
    }

    const response = await this._makeRequest('/ai/adjust-tone', {
      resumeId,
      resume_json: resumeJson,
      ats_analysis: atsAnalysis,
      focus
    });

    // Backend returns { success: true, data: { updatedResumeData, ... } }
    return {
      success: true,
      data: response.data,
      message: response.message || 'Resume tone adjusted successfully'
    };
  }

  /**
   * Enhance resume keywords based on ATS analysis
   * @param {string} resumeId - The resume ID
   * @param {Object} resumeJson - The resume data
   * @param {Object} atsAnalysis - The ATS analysis
   * @param {Array} targetSections - Target sections to enhance
   * @returns {Promise<Object>} - Updated resume data with enhanced keywords
   */
  async enhanceKeywords(resumeId, resumeJson, atsAnalysis, targetSections) {
    if (!resumeId || !resumeJson || !atsAnalysis || !targetSections) {
      throw new Error('All parameters are required');
    }

    const response = await this._makeRequest('/ai/enhance-keywords', {
      resumeId,
      resume_json: resumeJson,
      ats_analysis: atsAnalysis,
      target_sections: targetSections
    });

    // Backend returns { success: true, data: { updatedResumeData, ... } }
    return {
      success: true,
      data: response.data,
      message: response.message || 'Keywords enhanced successfully'
    };
  }

  /**
   * Generate PDF template from basic details using AI
   * @param {string} content - The basic details content
   * @returns {Promise<Object>} - Generated PDF template content
   */
  async generatePDFTemplate(content) {
    if (!content || content.trim().length < 20) {
      throw new Error('Content must be at least 20 characters long');
    }

    const response = await this._makeRequest('/ai/generate-pdf-template', {
      content: content.trim()
    });

    // Backend returns { success: true, data: { templateContent, ... } }
    return {
      success: true,
      data: {
        templateContent: response.data.templateContent,
        originalContent: response.data.originalContent,
        templateType: response.data.templateType,
        message: response.data.message || 'PDF template generated successfully'
      }
    };
  }

  /**
   * Restructure current template using AI (structured template required)
   * @param {string} content - The current template content
   * @returns {Promise<Object>} - Restructured template content
   */
  async restructureTemplate(content) {
    if (!content || content.trim().length < 50) {
      throw new Error('Content must be at least 50 characters long for restructuring');
    }

    const response = await this._makeRequest('/ai/restructure-template', {
      content: content.trim()
    });

    // Backend returns { success: true, data: { restructuredContent, ... } }
    return {
      success: true,
      data: {
        restructuredContent: response.data.restructuredContent,
        originalContent: response.data.originalContent,
        structureType: response.data.structureType,
        improvements: response.data.improvements,
        message: response.data.message || 'Template restructured successfully'
      }
    };
  }
}

const aiServiceInstance = new AIService();
export default aiServiceInstance;
