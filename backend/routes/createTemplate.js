const express = require('express');
const { withPage } = require('../utils/browserManager');
const router = express.Router();

// Create Template PDF Generation Route
router.post('/', async (req, res) => {
    try {
        const { content, title = 'Custom Template' } = req.body;

        if (!content) {
            return res.status(400).json({ 
                success: false, 
                message: 'Content is required' 
            });
        }

        // Use the shared browser manager for better performance
        const pdfBuffer = await withPage(async (page) => {
            // Set viewport for consistent rendering
            await page.setViewport({ width: 1200, height: 800 });

            // Create HTML content with proper styling
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.3;
                        color: #333;
                        background: white;
                        padding: 0.4rem 0.75rem;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    
                    h1, h2, h3, h4, h5, h6 {
                        color: #2c3e50;
                        margin-bottom: 0.2rem;
                        margin-top: 0.2rem;
                        line-height: 1.3;
                    }
                    
                    h1 { font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0; }
                    h2 { font-size: 1.25rem; font-weight: 600; margin: 0.4rem 0 0.3rem 0; }
                    h3 { font-size: 1.125rem; font-weight: 600; margin: 0.3rem 0 0.2rem 0; }
                    h4 { font-size: 1rem; font-weight: 600; margin: 0.25rem 0 0.15rem 0; }
                    h5 { font-size: 0.9rem; font-weight: 600; margin: 0.2rem 0 0.1rem 0; }
                    h6 { font-size: 0.8rem; font-weight: 600; margin: 0.15rem 0 0.1rem 0; text-transform: uppercase; }
                    
                    p {
                        margin: 0.2rem 0;
                        line-height: 1.4;
                        text-align: left;
                    }
                    
                    div {
                        margin: 0.1rem 0;
                        line-height: 1.4;
                    }
                    
                    ul, ol {
                        margin: 0.2rem 0;
                        padding-left: 1.2rem;
                    }
                    
                    li {
                        margin: 0.1rem 0;
                        padding-left: 0.15rem;
                        line-height: 1.4;
                    }
                    
                    strong, b {
                        font-weight: bold;
                    }
                    
                    em, i {
                        font-style: italic;
                    }
                    
                    u {
                        text-decoration: underline;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    
                    th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    
                    blockquote {
                        border-left: 4px solid #3498db;
                        padding-left: 20px;
                        margin: 20px 0;
                        font-style: italic;
                        background-color: #f8f9fa;
                        padding: 15px 20px;
                    }
                    
                    code {
                        background-color: #f4f4f4;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-family: 'Courier New', monospace;
                    }
                    
                    pre {
                        background-color: #f4f4f4;
                        padding: 15px;
                        border-radius: 5px;
                        overflow-x: auto;
                        margin-bottom: 20px;
                    }
                    
                    hr {
                        border: none;
                        height: 1px;
                        background-color: #ccc;
                        margin: 0.3rem 0;
                    }
                    
                    .page-break {
                        page-break-before: always;
                    }
                    
                    /* Remove excessive top/bottom margins from content */
                    body > *:first-child {
                        margin-top: 0.2rem !important;
                    }
                    
                    body > *:last-child {
                        margin-bottom: 0.2rem !important;
                    }
                    
                    /* Ensure proper word wrapping */
                    * {
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        max-width: 100%;
                    }
                    
                    @media print {
                        body {
                            padding: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;

            // Set the HTML content
            await page.setContent(htmlContent, { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });

            // Generate PDF
            return await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                displayHeaderFooter: false,
                preferCSSPageSize: true
            });
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF buffer
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate PDF',
            error: error.message 
        });
    }
});

module.exports = router;
