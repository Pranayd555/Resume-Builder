const express = require('express');
const { withPage } = require('../utils/browserManager');
const router = express.Router();

// Create Template PDF Generation Route
router.post('/', async (req, res) => {
    try {
      const { content, title = 'Custom Template' } = req.body;
  
      if (!content?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Content is required and cannot be empty.',
        });
      }
  
      const pdfBuffer = await withPage(async (page) => {
        await page.setViewport({ width: 1200, height: 800 });
  
        // Construct the full HTML
        const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${title}</title>

                <!-- Include CKEditor base styles -->
                <link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/47.0.0/ckeditor5.css" />

                <style>
                    html, body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    width: 100%;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    }

                    body {
                    font-family: 'Arial', sans-serif;
                    padding: 24px;
                    max-width: 900px;
                    margin: 0 auto;
                    background: #fff;
                    }

                    /* Ensure all inline CSS gets respected */
                    * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    }

                    /* Fix for flex / align-items not showing */
                    [style*="display:flex"] {
                    display: flex !important;
                    }

                    /* Preserve hsl() colors exactly */
                    [style*="color:hsl"], [style*="background:hsl"], [style*="background-color:hsl"] {
                    color: inherit !important;
                    background-color: inherit !important;
                    }

                    /* Force borders to be printed */
                    [style*="border"] {
                    border-style: solid !important;
                    }

                    .ck-content {
                    word-break: break-word;
                    }

                    .page-break {
                    page-break-before: always;
                    }
                </style>
                </head>
                <body>
                <div class="ck-content">
                    ${content}
                </div>
                </body>
                </html>
                `;
  
        await page.setContent(html, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        });
  
        // Wait until fonts and styles fully load
        await page.evaluateHandle('document.fonts.ready');
  
        // Emulate screen media (not print) for exact style rendering
        await page.emulateMediaType('screen');
  
        // Generate PDF
        return await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm',
          },
          scale: 1,
          preferCSSPageSize: true,
        });
      });
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`
      );
      res.send(pdfBuffer);
  
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF',
        error: error.message,
      });
    }
  });
  

module.exports = router;
