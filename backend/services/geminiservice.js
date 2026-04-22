// resume-ai-backend/geminiService.js
const { GoogleGenAI } = require("@google/genai");
const { getPromt } = require('../utils/aiPrompts');
require('dotenv').config();

const PARSE_RESUME = {
  "type": "OBJECT",
  "properties": {
    "personalInfo": {
      "type": "OBJECT",
      "properties": {
        "fullName": { "type": "STRING" },
        "email": { "type": "STRING" },
        "phone": { "type": "STRING" },
        "address": { "type": "STRING" },
        "website": { "type": "STRING" },
        "linkedin": { "type": "STRING" },
        "github": { "type": "STRING" }
      },
      "required": ["fullName", "email"]
    },
    "summary": { "type": "STRING" },
    "workExperience": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "jobTitle": { "type": "STRING" },
          "company": { "type": "STRING" },
          "location": { "type": "STRING" },
          "startDate": { "type": "STRING" },
          "endDate": { "type": "STRING", "nullable": true },
          "isCurrentJob": { "type": "BOOLEAN" },
          "description": { "type": "STRING" },
          "achievements": { "type": "ARRAY", "items": { "type": "STRING" } }
        },
        "required": ["jobTitle", "company", "startDate", "isCurrentJob"]
      }
    },
    "education": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "degree": { "type": "STRING" },
          "institution": { "type": "STRING" },
          "location": { "type": "STRING" },
          "startDate": { "type": "STRING" },
          "endDate": { "type": "STRING", "nullable": true },
          "isCurrentlyStudying": { "type": "BOOLEAN" },
          "gpa": { "type": "NUMBER", "nullable": true },
          "description": { "type": "STRING" }
        },
        "required": ["degree", "institution", "isCurrentlyStudying"]
      }
    },
    "skills": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "category": { "type": "STRING" },
          "items": {
            "type": "ARRAY",
            "items": {
              "type": "OBJECT",
              "properties": {
                "name": { "type": "STRING" },
                "level": { 
                  "type": "STRING", 
                  "enum": ["beginner", "intermediate", "advanced", "expert"] 
                }
              },
              "required": ["name", "level"]
            }
          }
        },
        "required": ["category", "items"]
      }
    },
    "projects": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "name": { "type": "STRING" },
          "description": { "type": "STRING" },
          "technologies": { "type": "ARRAY", "items": { "type": "STRING" } },
          "url": { "type": "STRING" },
          "githubUrl": { "type": "STRING" },
          "startDate": { "type": "STRING", "nullable": true },
          "endDate": { "type": "STRING", "nullable": true }
        },
        "required": ["name", "description", "technologies"]
      }
    },
    "achievements": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "title": { "type": "STRING" },
          "description": { "type": "STRING" },
          "date": { "type": "STRING", "nullable": true },
          "issuer": { "type": "STRING" }
        },
        "required": ["title"]
      }
    },
    "certifications": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "name": { "type": "STRING" },
          "issuer": { "type": "STRING" },
          "date": { "type": "STRING", "nullable": true },
          "expiryDate": { "type": "STRING", "nullable": true },
          "credentialId": { "type": "STRING" },
          "url": { "type": "STRING" }
        },
        "required": ["name", "issuer"]
      }
    },
    "languages": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "name": { "type": "STRING" },
          "proficiency": { 
            "type": "STRING", 
            "enum": ["basic", "conversational", "fluent", "native"] 
          }
        },
        "required": ["name", "proficiency"]
      }
    }
  },
  "required": [
    "personalInfo", 
    "summary", 
    "workExperience", 
    "education", 
    "skills", 
    "projects", 
    "achievements", 
    "certifications", 
    "languages"
  ]
};

// Initialize Google Gen AI client using options object (required by @google/genai v1.16+)
const genAI = (apiKey) => new GoogleGenAI({
  apiKey: apiKey ?? process.env.GEMINI_API_KEY,
});

async function generateResumeSuggestion(prompt, apiKey = '') {
  const client = genAI(apiKey);
  const response = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    contents: prompt,
  });
  return response.text;
}

async function parseResumeText(extractedText, apiKey = '') {

  const prompt = getPromt('parseResume', extractedText);

  try {
    const client = genAI(apiKey);
    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
      contents: prompt,
      config:{
        responseMimeType: "application/json",
        responseJsonSchema : PARSE_RESUME
    }
    });
    
    let jsonText = response.text;
    
    // Extract JSON using regex pattern (similar to AI routes)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    let cleaned = jsonMatch[0];
    
    // Clean up common JSON formatting issues from Gemini
    try {
      // First, try to parse as-is
      JSON.parse(cleaned);
    } catch (firstError) {
      
      // Fix common Gemini JSON issues
      cleaned = cleaned
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/(\w+):/g, '"$1":') // Add quotes around unquoted property names
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/:\s*([^",{\[\s][^",}\]\s]*)\s*([,}])/g, ': "$1"$2') // Quote unquoted string values
        .replace(/:\s*([^",{\[\s][^",}\]\s]*)\s*([,}])/g, ': "$1"$2'); // Second pass for nested cases
      
    }
    
    
    // Parse the JSON response with fallback
    let parsedData;
    try {
      parsedData = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON parsing failed even after cleaning:', parseError);
      console.error('Problematic JSON:', cleaned.substring(parseError.message.match(/position (\d+)/)?.[1] - 50 || 0, parseError.message.match(/position (\d+)/)?.[1] + 50 || 100));
      
      // Try a more aggressive cleaning approach
      cleaned = cleaned
        .replace(/'/g, '"')
        .replace(/([^"]\w+):/g, '"$1":')
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/:\s*([^",{\[\s][^",}\]\s]*?)\s*([,}])/g, ': "$1"$2');
      
      try {
        parsedData = JSON.parse(cleaned);
      } catch (finalError) {
        throw new Error(`Failed to parse JSON after multiple attempts: ${finalError.message}`);
      }
    }
    
    // Validate that we have the expected structure
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Invalid JSON structure returned from AI');
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume with Gemini:', error);
    // Re-throw the original provider error so callers can map status/messages correctly.
    throw error;
  }
}

module.exports = { 
  generateResumeSuggestion,
  parseResumeText
};