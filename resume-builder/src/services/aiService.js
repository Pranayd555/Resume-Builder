import { apiHelpers } from "./api";

class AIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL;
  }

  async _makeRequest(endpoint, data, method = 'POST') {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Please log in to use AI features');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

     const responseData = await response.json();
     
     // Update token balance if present in response
     if (responseData && responseData.data && responseData.data.tokens !== undefined) {
       apiHelpers.updateTokenBalance(responseData.data.tokens);
     }
     
     // Also check for tokens at root level
     if (responseData && responseData.tokens !== undefined) {
       apiHelpers.updateTokenBalance(responseData.tokens);
     }

     return responseData;
  }

  /**
   * Polish/rewrite content using AI
   * @param {string} content - The content to polish
   * @param {string} tone - The tone to use (professional, casual, formal, creative)
   * @param {string} style - The style to use (concise, detailed, action-oriented, achievement-focused)
   * @returns {Promise<Object>} - The polished content
   */
  async polishContent(content, tone = 'professional', style = 'action-oriented') {
    if (!content || content.trim().length < 100) {
      throw new Error('Content must be at least 100 characters long');
    }

    const response = await this._makeRequest('/ai/rewrite', {
      content: content.trim(),
      tone,
      style
    });

    // Backend returns { success: true, data: { rewrittenContent, ... } }
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
   * Summarize content using AI
   * @param {string} content - The content to summarize
   * @param {number} maxLength - Maximum length of summary (optional)
   * @returns {Promise<Object>} - The summarized content
   */
  async summarizeContent(content, maxLength = 150) {
    if (!content || content.trim().length < 20) {
      throw new Error('Content must be at least 20 characters long');
    }

    const response = await this._makeRequest('/ai/summarize', {
      content: content.trim(),
      maxLength
    });

    // Backend returns { success: true, data: { summary, ... } }
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

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Please log in to use AI features');
    }

    const response = await fetch(`${this.baseURL}/ai/ats-score`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate ATS score');
    }

     const result = await response.json();
     
     // Update token balance if present in response
     if (result && result.data && result.data.tokens !== undefined) {
       apiHelpers.updateTokenBalance(result.data.tokens);
     }
     
     // Also check for tokens at root level
     if (result && result.tokens !== undefined) {
       apiHelpers.updateTokenBalance(result.tokens);
     }
     
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
