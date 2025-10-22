// resume-ai-backend/geminiService.js
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

async function generateResumeSuggestion(prompt) {
  // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  // Access API methods through services on the client object
  const response = await genAI.models.generateContent(prompt);
  // const chat = ai.chats.create(...);
  // const uploadedFile = await ai.files.upload(...);
  // const cache = await ai.caches.create(...);
  return response.text();
}

async function parseResumeText(extractedText) {

  const prompt = `
You are a resume parsing assistant. You will receive plain text extracted from a resume PDF.
Your task is to extract and structure the content into a precise JSON format, without modifying or rewriting any part of the original content.

CRITICAL: Return ONLY valid JSON with proper formatting:
- Use double quotes (") for all property names and string values
- Do not use single quotes (') anywhere
- Ensure all property names are quoted
- Do not include any explanations, markdown formatting, code blocks, or additional text
- Start your response with { and end with }
- Follow standard JSON syntax exactly

Resume Text:
${extractedText}

Extract and structure the following information into JSON format matching this exact schema:

{
  "personalInfo": {
    "fullName": "string",
    "email": "string", 
    "phone": "string",
    "address": "string",
    "website": "string",
    "linkedin": "string",
    "github": "string"
  },
  "summary": "string",
  "workExperience": [
    {
      "jobTitle": "string",
      "company": "string",
      "location": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or null",
      "isCurrentJob": boolean,
      "description": "string",
      "achievements": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or null",
      "isCurrentlyStudying": boolean,
      "gpa": number or null,
      "description": "string"
    }
  ],
  "skills": [
    {
      "category": "string",
      "items": [
        {
          "name": "string",
          "level": "beginner|intermediate|advanced|expert"
        }
      ]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string",
      "githubUrl": "string",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null"
    }
  ],
  "achievements": [
    {
      "title": "string",
      "description": "string",
      "date": "YYYY-MM-DD or null",
      "issuer": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM-DD or null",
      "expiryDate": "YYYY-MM-DD or null",
      "credentialId": "string",
      "url": "string"
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "basic|conversational|fluent|native"
    }
  ],
}

Guidelines:
- Extract all available information from the text
- Use null for missing dates or optional fields
- For dates, use YYYY-MM-DD format or null if not available
- Group skills by categories if possible
- Extract technologies used in projects
- Include all achievements, certifications, and languages mentioned
- If information is not available, use empty strings or null as appropriate
- Ensure the JSON is valid and properly formatted
- Do not rephrase, summarize, or rewrite any text.
- Do not infer or guess missing data.
- Preserve original spelling, capitalization, punctuation, line breaks, and structure.
- Leave any missing fields as null or empty arrays.
- Return ONLY the JSON object, no additional text, explanations, or formatting.
- Ensure all JSON is properly formatted with double quotes and valid syntax.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
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
    throw new Error(`Failed to parse resume text with AI: ${error.message}`);
  }
}

module.exports = { 
  generateResumeSuggestion,
  parseResumeText
};