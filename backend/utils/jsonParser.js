/**
 * Utility functions for parsing AI-generated JSON responses
 */

/**
 * Safely parse JSON from AI responses with fallback handling
 * @param {string} text - Raw AI response text
 * @param {string} context - Context for logging (e.g., 'enhance-keywords')
 * @returns {Object} Parsed JSON object or fallback structure
 */
function parseAIResponse(text, context = 'ai-response') {
  try {
    // Clean the response to extract JSON with better parsing
    let jsonString = text.trim();
    
    // Remove any markdown code blocks if present
    jsonString = jsonString.replace(/```json\s*|\s*```/g, '');
    
    // Find the JSON object boundaries more accurately
    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
      throw new Error('No valid JSON object found in response');
    }
    
    // Extract the JSON string
    jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
    
    // Clean up common issues in AI responses
    jsonString = cleanJSONString(jsonString);
    
    // Try to parse the cleaned JSON
    return JSON.parse(jsonString);
    
  } catch (parseError) {
    console.error(`Failed to parse ${context} response:`, parseError);
    console.error('Raw response:', text);
    console.error('Cleaned JSON string:', jsonString);
    
    // Return fallback structure based on context
    return getFallbackStructure(context);
  }
}

/**
 * Clean JSON string to fix common AI response issues
 * @param {string} jsonString - Raw JSON string
 * @returns {string} Cleaned JSON string
 */
function cleanJSONString(jsonString) {
  return jsonString
    .replace(/\n\s*/g, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ')    // Collapse multiple spaces
    .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
    .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
    .replace(/:\s*([^",{\[\s][^,}\]\]]*?)(\s*[,}\]])/g, ': "$1"$2')  // Quote unquoted string values
    .replace(/: "null"/g, ': null')  // Fix null values
    .replace(/: "true"/g, ': true')  // Fix boolean true
    .replace(/: "false"/g, ': false')  // Fix boolean false
    .replace(/: "(\d+)"/g, ': $1');  // Fix numeric values
}

/**
 * Get fallback structure based on context
 * @param {string} context - The context/endpoint name
 * @returns {Object} Fallback structure
 */
function getFallbackStructure(context) {
  const fallbackStructures = {
    'enhance-keywords': {
      skills: [],
      workExperience: [],
      projects: []
    },
    'adjust-tone': {
      summary: '',
      workExperience: [],
      projects: []
    },
    'parse-resume': {
      personalInfo: {},
      skills: [],
      workExperience: [],
      education: [],
      projects: []
    },
    'analyze-resume': {
      overall_score: 0,
      category_scores: {
        keyword_skill_match: 0,
        experience_alignment: 0,
        section_completeness: 0,
        project_impact: 0,
        formatting: 0,
        bonus_skills: 0
      },
      missing_keywords: [],
      strengths: [],
      weaknesses: [],
      ats_warnings: [],
      recommendations: []
    },
    'generate-content': {
      content: '',
      suggestions: []
    }
  };
  
  return fallbackStructures[context] || {};
}

/**
 * Extract JSON from text using multiple strategies
 * @param {string} text - Raw text containing JSON
 * @returns {Object|null} Extracted JSON object or null
 */
function extractJSONFromText(text) {
  // Strategy 1: Look for complete JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Continue to next strategy
    }
  }
  
  // Strategy 2: Look for JSON array
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (e) {
      // Continue to next strategy
    }
  }
  
  // Strategy 3: Try to find JSON between code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      // Continue to next strategy
    }
  }
  
  return null;
}

/**
 * Validate JSON structure for resume data
 * @param {Object} data - Parsed JSON data
 * @param {string} context - Context for validation
 * @returns {boolean} Whether the data is valid
 */
function validateResumeJSON(data, context = 'resume') {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Basic validation based on context
  switch (context) {
    case 'enhance-keywords':
      return Array.isArray(data.skills) || 
             Array.isArray(data.workExperience) || 
             Array.isArray(data.projects);
    
    case 'adjust-tone':
      return data.summary || 
             Array.isArray(data.workExperience) || 
             Array.isArray(data.projects);
    
    case 'parse-resume':
      return data.personalInfo || 
             Array.isArray(data.skills) || 
             Array.isArray(data.workExperience);
    
    case 'analyze-resume':
      return data.overall_score !== undefined && 
             data.category_scores !== undefined;
    
    default:
      return true;
  }
}

module.exports = {
  parseAIResponse,
  cleanJSONString,
  getFallbackStructure,
  extractJSONFromText,
  validateResumeJSON
};
