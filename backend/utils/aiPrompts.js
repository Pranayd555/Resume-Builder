// Create prompt for ATS-friendly professional enhancement
let content = '';
const prompts = {
    rewritePrompt: (content) => `
        You are an expert resume writing assistant specializing in ATS-optimized, professional, and achievement-driven content.

        Task:
        Enhance the following text to be ATS-friendly, keyword-rich, and professionally polished while maintaining its original meaning.

        Guidelines:
        - Use strong action verbs (Developed, Led, Implemented, Optimized, Managed, Created, etc.)
        - Include relevant industry keywords and technical terms naturally
        - Quantify achievements with numbers, percentages, and metrics where possible
        - Use bullet points for better ATS parsing and readability
        - Start sentences with action verbs to demonstrate impact
        - Avoid generic phrases like "responsible for" or "worked on"
        - Include specific technologies, tools, and methodologies
        - Keep content concise but impactful
        - Use professional terminology appropriate for the industry
        - Structure content for easy ATS scanning and human reading

        CRITICAL OUTPUT REQUIREMENTS:
        - Return ONLY clean HTML without any markdown formatting
        - Do NOT include code blocks - return clean html code
        - Do NOT include any markdown syntax
        - Return pure HTML that can be directly inserted into a CKEditor
        - Use proper HTML tags like <ul>, <li>, <p>, <strong>, etc.
        - Ensure the HTML is valid and well-formed

        User Input:
        "${content}"

        Return the final ATS-optimized, keyword-rich text as clean HTML only.
    `,

    summerize: (content) => `
        You are an expert resume writing assistant specializing in ATS-optimized, professional, and achievement-driven content.

        Task:
        Enhance the following text to be ATS-friendly, keyword-rich, and professionally polished while maintaining its original meaning.

        Guidelines:
        - Use strong action verbs (Developed, Led, Implemented, Optimized, Managed, Created, etc.)
        - Include relevant industry keywords and technical terms naturally
        - Quantify achievements with numbers, percentages, and metrics where possible
        - Start sentences with action verbs to demonstrate impact
        - Avoid generic phrases like "responsible for" or "worked on"
        - Include specific technologies, tools, and methodologies
        - Keep content concise but impactful
        - Use professional terminology appropriate for the industry
        - Structure content for easy ATS scanning and human reading
        - Format as flowing paragraphs, not bullet points or lists

        CRITICAL OUTPUT REQUIREMENTS:
        - Return ONLY clean HTML without any markdown formatting
        - Do NOT include code blocks - return clean html code
        - Do NOT include any markdown syntax
        - Return pure HTML that can be directly inserted into a CKEditor
        - Use paragraph tags <p> for content structure
        - Do NOT use bullet points <ul> or <li> tags
        - Ensure the HTML is valid and well-formed
        - Format as continuous, flowing text in paragraph form

        User Input:
        "${content}"

        Return the final summarized text as clean HTML paragraphs only.
    `,
    generatePdfTemplate: (content) => `
        You are an expert resume template designer specializing in creating professional, ATS-optimized resume templates.

        Task:
        Generate a complete, professional resume template from the provided basic details. Create a well-structured, visually appealing, modern. professional template that can be used as a PDF template.

        Guidelines:
        - Create a complete resume structure with all essential sections
        - Use professional formatting and layout
        - Include proper HTML structure for PDF generation
        - Make it ATS-friendly with clear sections and formatting
        - Use modern, professional, visually appealing design principles
        - Include proper spacing and typography
        - Ensure the template is comprehensive and ready to use
        - Structure content logically with clear hierarchy

        CRITICAL OUTPUT REQUIREMENTS:
        - Return ONLY clean HTML without any markdown formatting
        - Do NOT include code blocks - return clean html code
        - Do NOT include any markdown syntax
        - Return pure HTML that can be directly inserted into a CKEditor
        - Use proper HTML tags for structure: <div>, <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
        - Do not border content with A4 size, ensure it fits within the page
        - Include inline CSS styling for professional appearance
        - Ensure the HTML is valid and well-formed
        - Make it suitable for PDF generation
        - Acceptable classes, styles and HTML structure for google chromium pdf generation

        User Input:
        "${content}"

        Return a complete, professional resume template Output only the raw HTML string. Do not include markdown formatting or backticks.
    `,
    restructureTemplate: (content) => `
        You are an expert resume template designer and ATS optimization specialist.

        Task:
        Restructure and improve the provided resume template to make it more professional, ATS-friendly, and visually appealing while maintaining all the original content.

        Guidelines:
        - Analyze the current template structure and identify areas for improvement
        - Reorganize content for better flow and readability
        - Improve formatting and visual hierarchy
        - Enhance ATS compatibility
        - Maintain all original content but improve presentation
        - Use modern design principles
        - Ensure proper spacing and typography
        - Create clear section divisions
        - Optimize for both human readers and ATS systems

        CRITICAL OUTPUT REQUIREMENTS:
        - Return ONLY clean HTML without any markdown formatting
        - Do NOT include code blocks - return clean html code
        - Do NOT include any markdown syntax
        - Return pure HTML that can be directly inserted into a CKEditor
        - Use proper HTML tags for structure: <div>, <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
        - Include inline CSS styling for professional appearance
        - Ensure the HTML is valid and well-formed
        - Preserve all original content but improve structure and presentation

        User Input:
        "${content}"

        Return the restructured and improved template Output only the raw HTML string. Do not include markdown formatting or backticks..
    `,

    parseResume : (content) => `
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
        ${content}

        Extract and structure the following information into JSON format matching exact schema:
        

Guidelines:
- Extract all available information from the text
- Use epmty string for missing dates or optional fields
- For dates, use YYYY-MM-DD format or epmty string if not available
- Group skills by categories if possible
- Extract technologies used in projects
- Include all achievements, certifications, and languages mentioned
- If information is not available, use empty strings as appropriate
- Ensure the JSON is valid and properly formatted
- Do not rephrase, summarize, or rewrite any text.
- Do not infer or guess missing data.
- Preserve original spelling, capitalization, punctuation, line breaks, and structure.
- Leave any missing fields as epmty string or empty arrays.
- Return ONLY the JSON object, no additional text, explanations, or formatting.
- Ensure all JSON is properly formatted with double quotes and valid syntax.`
    }
function getPromt(key, val) {
    if (val) content = val;
    console.log('content', content);
    console.log('prompts', prompts[key](val));
    return prompts[key](val);
}

module.exports = { getPromt };