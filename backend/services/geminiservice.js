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
  You are a resume parsing assistant.
You will receive plain text extracted from a resume PDF.
Your task is to extract and structure the content into a precise JSON format, without modifying or rewriting any part of the original content.
Parse the following resume text and extract structured information into JSON format. Return only valid JSON without any additional text or explanations.

Resume Text:
${extractedText}

Please extract and structure the following information into JSON format matching this exact schema:

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
- Do not include any explanation or text outside the JSON.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    const jsonText = response.text;
    const cleaned = jsonText
    .replace(/```json\n?/, '')
    .replace(/```$/, '')
    .trim();
    
    // Parse the JSON response
    const parsedData = JSON.parse(cleaned);
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume with Gemini:', error);
    throw new Error('Failed to parse resume text with AI');
  }
}

module.exports = { 
  generateResumeSuggestion,
  parseResumeText
};