const express = require("express");
const { withPage } = require("../utils/browserManager");
const router = express.Router();
const logger = require("../utils/logger");

// Create Template PDF Generation Route
router.post("/", async (req, res) => {
  try {
    const { content, title = "Custom Template" } = req.body;

    logger.info("Received PDF generation request", {
      title,
      contentLength: content ? content.length : 0,
      hasContent: !!content
    });

    if (!content?.trim()) {
      logger.warn("PDF generation failed: Content is missing or empty");
      return res.status(400).json({
        success: false,
        message: "Content is required and cannot be empty.",
      });
    }
    logger.info('Content analysis:', {
      length: content?.length,
      hasImgTag: content?.includes('<img'),
      hasDataImage: content?.includes('data:image'),
      preview: content?.substring(0, 500),
      isEscaped: content?.includes('\\"'),
      hasHtmlEntities: content?.includes('&lt;')
    });

    const pdfBuffer = await withPage(async (page) => {
      logger.info("Browser page initialized");

      // Initialize with a minimal valid HTML page to ensure execution context is ready
      await page.goto("data:text/html,<html><body></body></html>", {
        waitUntil: "networkidle0",
        timeout: 30000
      });
      logger.info("Page reset to blank state");

      await page.setViewport({ width: 1200, height: 800 });

      logger.info("Page viewport set successfully.");

      // Construct the full HTML
      const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${title}</title>

                <!-- Include CKEditor base styles -->
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap" />
                <script src="https://unpkg.com/twemoji@latest/dist/twemoji.min.js" crossorigin="anonymous"></script>

                <style>

                    :root {
                      --ck-content-font-family: 'Lato';
                    }

                    html, body {
                      margin: 0;
                      padding: 0;
                      width: 100%;
                      height: 100%;
                    }

                    /* Base HTML Elements - Consistent across editor and PDF */
                  .ck-content {
                      /* Reset and base styles */
                      box-sizing: border-box;
                      font-family: 'Lato', 'Arial', sans-serif;
                      font-size: 14px;
                      line-height: 1.4;
                      color: #1f2937;
                      background: white;
                    }

                    /* Typography Elements */
                    .ck-content h1 {
                      font-size: 24px;
                      font-weight: 700;
                      color: #1f2937;
                      margin: 0 0 16px 0;
                      padding: 0;
                      line-height: 1.2;
                    }

                    .ck-content h2 {
                      font-size: 20px;
                      font-weight: 600;
                      color: #1f2937;
                      margin: 0 0 12px 0;
                      padding: 0;
                      line-height: 1.3;
                    }

                    .ck-content h3 {
                      font-size: 18px;
                      font-weight: 600;
                      color: #1f2937;
                      margin: 0 0 10px 0;
                      padding: 0;
                      line-height: 1.3;
                    }

                    .ck-content h4 {
                      font-size: 16px;
                      font-weight: 600;
                      color: #1f2937;
                      margin: 0 0 8px 0;
                      padding: 0;
                      line-height: 1.3;
                    }

                    .ck-content h5 {
                      font-size: 14px;
                      font-weight: 600;
                      color: #1f2937;
                      margin: 0 0 6px 0;
                      padding: 0;
                      line-height: 1.3;
                    }

                    .ck-content h6 {
                      font-size: 12px;
                      font-weight: 600;
                      color: #1f2937;
                      margin: 0 0 4px 0;
                      padding: 0;
                      line-height: 1.3;
                    }

                    .ck-content p {
                      font-size: 14px;
                      line-height: 1.4;
                      margin: 0 0 8px 0;
                      padding: 0;
                      line-height: 1.3;
                    }

                    .ck-content strong, .ck-content b {
                      font-weight: 600;
                    }

                    .ck-content em, .ck-content i {
                      font-style: italic;
                    }

                    .ck-content u {
                      text-decoration: underline;
                    }

                    .ck-content s, .ck-content strike {
                      text-decoration: line-through;
                      color: #6b7280;
                    }

                    .ck-content mark {
                      background-color: #fef3c7;
                      color: #92400e;
                      padding: 1px 2px;
                      border-radius: 2px;
                    }

                    .ck-content small {
                      font-size: 12px;
                      color: #6b7280;
                    }

                    .ck-content sub {
                      font-size: 10px;
                      vertical-align: sub;
                      color: #6b7280;
                    }

                    .ck-content sup {
                      font-size: 10px;
                      vertical-align: super;
                      color: #6b7280;
                    }

                    /* Code Elements */
                    .ck-content code {
                      font-family: 'Courier New', 'Monaco', monospace;
                      font-size: 12px;
                      background-color: #f3f4f6;
                      color: #1f2937;
                      padding: 2px 4px;
                      border-radius: 3px;
                      border: 1px solid #e5e7eb;
                    }

                    .ck-content pre {
                      font-family: 'Courier New', 'Monaco', monospace;
                      font-size: 12px;
                      background-color: #f8fafc;
                      color: #1f2937;
                      padding: 12px;
                      border-radius: 6px;
                      border: 1px solid #e5e7eb;
                      margin: 8px 0;
                      overflow-x: auto;
                      line-height: 1.4;
                    }

                    .ck-content pre code {
                      background: none;
                      border: none;
                      padding: 0;
                      color: inherit;
                    }

                    /* List Elements */
                    .ck-content ul {
                      margin: 8px 0;
                      padding-left: 20px;
                      list-style-type: disc;
                    }

                    .ck-content ol {
                      margin: 8px 0;
                      padding-left: 20px;
                      list-style-type: decimal;
                    }

                    .ck-content li {
                      margin: 4px 0;
                      line-height: 1.4;
                      color: #374151;
                    }

                    .ck-content ul ul, .ck-content ol ol, .ck-content ul ol, .ck-content ol ul {
                      margin: 4px 0;
                      line-height: 1.4;
                    }

                    .ck-content ul ul {
                      list-style-type: circle;
                    }

                    .ck-content ul ul ul {
                      list-style-type: square;
                    }

                    /* Table Elements */
                    .ck-content table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 12px 0;
                      font-size: 14px;
                      table-layout: fixed; /* Ensures consistent column widths */
                    }

                    /* Override CKEditor's default table behavior for template tables */
                    .ck-content table.template-table {
                      table-layout: fixed !important;
                      width: 100% !important;
                    }

                    .ck-content table.template-table td {
                      box-sizing: border-box !important;
                    }

                    .ck-content th {
                      background-color: #f8fafc;
                      color: #1f2937;
                      font-weight: 600;
                      padding: 8px 12px;
                      border: 1px solid #e5e7eb;
                      text-align: left;
                    }

                    .ck-content td {
                      padding: 8px 12px;
                      border: 1px solid #e5e7eb;
                      color: #374151;
                      vertical-align: top; /* Ensures content aligns to top */
                    }

                    .ck-content tr:nth-child(even) {
                      background-color: #f9fafb;
                    }

                    .ck-content tr:hover {
                      background-color: #f3f4f6;
                    }

                    /* Specific styles for template tables */
                    .ck-content table.template-table {
                      width: 100% !important;
                      border-collapse: collapse !important;
                      table-layout: fixed !important;
                    }

                    .ck-content table.template-table td {
                      vertical-align: top !important;
                    }

                    .ck.ck-dropdown.ck-heading-dropdown .ck-dropdown__panel .ck-list__item {
                        min-width: fit-content !important;
                    }

                    /* Override CKEditor's default table behavior for template tables with colspan */
                    .ck-content table.template-table td[colspan="2"] {
                      width: 33.33% !important;
                      max-width: 33.33% !important;
                      min-width: 33.33% !important;
                    }

                    .ck-content table.template-table td[colspan="3"] {
                      width: 50% !important;
                      max-width: 50% !important;
                      min-width: 50% !important;
                    }

                    .ck-content table.template-table td[colspan="4"] {
                      width: 60% !important;
                      max-width: 60% !important;
                      min-width: 60% !important;
                    }

                    /* Specific width overrides for different column splits */
                    .ck-content table.template-table td[style*="width: 30%"] {
                      width: 30% !important;
                      max-width: 30% !important;
                      min-width: 30% !important;
                    }

                    .ck-content table.template-table td[style*="width: 40%"] {
                      width: 40% !important;
                      max-width: 40% !important;
                      min-width: 40% !important;
                    }

                    .ck-content table.template-table td[style*="width: 50%"] {
                      width: 50% !important;
                      max-width: 50% !important;
                      min-width: 50% !important;
                    }

                    .ck-content table.template-table td[style*="width: 60%"] {
                      width: 60% !important;
                      max-width: 60% !important;
                      min-width: 60% !important;
                    }

                    .ck-content table.template-table td[style*="width: 70%"] {
                      width: 70% !important;
                      max-width: 70% !important;
                      min-width: 70% !important;
                    }

                    .ck-content table.template-table td[style*="width: 33.33%"] {
                      width: 33.33% !important;
                      max-width: 33.33% !important;
                      min-width: 33.33% !important;
                    }

                    /* Link Elements */
                    .ck-content a {
                      color: #2563eb;
                      text-decoration: none;
                      border-bottom: 1px solid transparent;
                      transition: all 0.2s ease;
                    }

                    .ck-content a:hover {
                      color: #1d4ed8;
                      border-bottom-color: #1d4ed8;
                    }

                    .ck-content a:visited {
                      color: #7c3aed;
                    }

                    /* Blockquote Elements */
                    .ck-content blockquote {
                      margin: 12px 0;
                      padding: 12px 16px;
                      border-left: 4px solid #e5e7eb;
                      background-color: #f9fafb;
                      color: #4b5563;
                      font-style: italic;
                      border-radius: 0 4px 4px 0;
                    }

                    .ck-content blockquote p {
                      margin: 0;
                      color: inherit;
                    }

                    /* Horizontal Rule */
                    .ck-content hr {
                      border: none;
                      height: 1px;
                      background-color: #e5e7eb;
                      margin: 16px 0;
                    }

                    /* Form Elements */
                    .ck-content input[type="text"],
                    .ck-content input[type="email"],
                    .ck-content input[type="password"],
                    .ck-content input[type="number"],
                    .ck-content textarea,
                    .ck-content select {
                      font-family: inherit;
                      font-size: 14px;
                      padding: 8px 12px;
                      border: 1px solid #d1d5db;
                      border-radius: 6px;
                      background-color: white;
                      color: #1f2937;
                      outline: none;
                      transition: border-color 0.2s ease;
                    }

                    .ck-content input:focus,
                    .ck-content textarea:focus,
                    .ck-content select:focus {
                      border-color: #f97316;
                      box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
                    }

                    /* Button Elements */
                    .ck-content button {
                      font-family: inherit;
                      font-size: 14px;
                      font-weight: 500;
                      padding: 8px 16px;
                      border: 1px solid #d1d5db;
                      border-radius: 6px;
                      background-color: white;
                      color: #374151;
                      cursor: pointer;
                      transition: all 0.2s ease;
                    }

                    .ck-content button:hover {
                      background-color: #f9fafb;
                      border-color: #9ca3af;
                    }

                    .ck-content button:active {
                      background-color: #f3f4f6;
                      transform: translateY(1px);
                    }

                    /* Image Elements */
                    .ck-content img {
                      max-width: 100%;
                      height: auto;
                      border-radius: 4px;
                      margin: 8px 0;
                    }

                    .ck-content figure {
                      margin: 12px 0;
                      text-align: center;
                    }

                    .ck-content figcaption {
                      font-size: 12px;
                      color: #6b7280;
                      margin-top: 4px;
                      font-style: italic;
                    }

                    /* Definition Lists */
                    .ck-content dl {
                      margin: 8px 0;
                    }

                    .ck-content dt {
                      font-weight: 600;
                      color: #1f2937;
                      margin: 8px 0 4px 0;
                    }

                    .ck-content dd {
                      margin: 0 0 8px 20px;
                      color: #374151;
                    }

                    /* Address Element */
                    .ck-content address {
                      font-style: italic;
                      color: #4b5563;
                      margin: 8px 0;
                    }

                    /* Time Element */
                    .ck-content time {
                      color: #6b7280;
                      font-size: 13px;
                    }

                    /* Abbreviation */
                    .ck-content abbr {
                      border-bottom: 1px dotted #9ca3af;
                      cursor: help;
                    }

                    /* Keyboard */
                    .ck-content kbd {
                      font-family: 'Courier New', 'Monaco', monospace;
                      font-size: 12px;
                      background-color: #f3f4f6;
                      color: #1f2937;
                      padding: 2px 4px;
                      border-radius: 3px;
                      border: 1px solid #d1d5db;
                    }

                    /* Sample Output */
                    .ck-content samp {
                      font-family: 'Courier New', 'Monaco', monospace;
                      font-size: 12px;
                      color: #1f2937;
                      margin: 8px 0;
                    }

                    /* Variable */
                    .ck-content var {
                      font-style: italic;
                      color: #7c3aed;
                    }

                    /* Citation */
                    .ck-content cite {
                      font-style: italic;
                      color: #6b7280;
                    }

                    /* Quote */
                    .ck-content q {
                      font-style: italic;
                      color: #4b5563;
                    }

                    .ck-content q::before {
                      content: '"';
                    }

                    .ck-content q::after {
                      content: '"';
                    }

                    /* Details and Summary */
                    .ck-content details {
                      margin: 8px 0;
                      border: 1px solid #e5e7eb;
                      border-radius: 6px;
                      background-color: #f9fafb;
                    }

                    .ck-content summary {
                      padding: 8px 12px;
                      font-weight: 600;
                      cursor: pointer;
                      background-color: #f3f4f6;
                      border-radius: 6px 6px 0 0;
                    }

                    .ck-content details[open] summary {
                      border-radius: 6px 6px 0 0;
                    }

                    .ck-content details > *:not(summary) {
                      padding: 8px 12px;
                    }

                    /* Progress and Meter */
                    .ck-content progress {
                      width: 100%;
                      height: 8px;
                      border-radius: 4px;
                      background-color: #e5e7eb;
                    }

                    .ck-content progress::-webkit-progress-bar {
                      background-color: #e5e7eb;
                      border-radius: 4px;
                    }

                    .ck-content progress::-webkit-progress-value {
                      background-color: #f97316;
                      border-radius: 4px;
                    }

                    .ck-content meter {
                      width: 100%;
                      height: 8px;
                      border-radius: 4px;
                    }

                    /* Print-specific styles for PDF generation */
                    @media print {
                      .ck-content {
                        font-size: 12px;
                        line-height: 1.3;
                        color: #000;
                        background: white;
                      }
                      
                      .ck-content h1 { font-size: 18px; }
                      .ck-content h2 { font-size: 16px; }
                      .ck-content h3 { font-size: 14px; }
                      .ck-content h4 { font-size: 13px; }
                      .ck-content h5 { font-size: 12px; }
                      .ck-content h6 { font-size: 11px; }
                      
                      .ck-content a {
                        color: #000;
                        text-decoration: underline;
                      }
                      
                      .ck-content a[href]:after {
                        content: " (" attr(href) ")";
                        font-size: 10px;
                        color: #666;
                      }
                      
                      .ck-content blockquote {
                        border-left: 2px solid #ccc;
                        background: #f9f9f9;
                      }
                      
                      .ck-content table {
                        border-collapse: collapse;
                        font-size: 11px;
                        width: 100% !important;
                      }
                      
                      .ck-content th,
                      .ck-content td {
                        border: 1px solid #ccc;
                        padding: 4px 6px;
                        vertical-align: top;
                      }
                      
                      .ck-content th {
                        background: #f0f0f0;
                        font-weight: bold;
                      }
                      
                      /* Ensure table cells maintain their width in PDF */
                      .ck-content table.template-table td {
                        vertical-align: top !important;
                      }
                      
                      /* Override CKEditor's default table behavior for template tables with colspan in PDF */
                      .ck-content table.template-table td[colspan="2"] {
                        width: 33.33% !important;
                        max-width: 33.33% !important;
                        min-width: 33.33% !important;
                      }
                      
                      .ck-content table.template-table td[colspan="3"] {
                        width: 50% !important;
                        max-width: 50% !important;
                        min-width: 50% !important;
                      }
                      
                      .ck-content table.template-table td[colspan="4"] {
                        width: 60% !important;
                        max-width: 60% !important;
                        min-width: 60% !important;
                      }
                      
                      /* Specific width overrides for PDF */
                      .ck-content table.template-table td[style*="width: 30%"] {
                        width: 30% !important;
                        max-width: 30% !important;
                        min-width: 30% !important;
                      }
                      
                      .ck-content table.template-table td[style*="width: 40%"] {
                        width: 40% !important;
                        max-width: 40% !important;
                        min-width: 40% !important;
                      }
                      
                      .ck-content table.template-table td[style*="width: 50%"] {
                        width: 50% !important;
                        max-width: 50% !important;
                        min-width: 50% !important;
                      }
                      
                      .ck-content table.template-table td[style*="width: 60%"] {
                        width: 60% !important;
                        max-width: 60% !important;
                        min-width: 60% !important;
                      }
                      
                      .ck-content table.template-table td[style*="width: 70%"] {
                        width: 70% !important;
                        max-width: 70% !important;
                        min-width: 70% !important;
                      }
                      
                      .ck-content table.template-table td[style*="width: 33.33%"] {
                        width: 33.33% !important;
                        max-width: 33.33% !important;
                        min-width: 33.33% !important;
                      }
                    }

                    /* Responsive Design */
                    @media (max-width: 768px) {
                      .ckeditor-container .ck-toolbar {
                        flex-wrap: wrap;
                      }
                      
                      .ckeditor-container .ck-editor__editable {
                        font-size: 14px;
                      }
                      
                      .ck-content {
                        font-size: 14px;
                      }
                      
                      .ck-content h1 { font-size: 20px; }
                      .ck-content h2 { font-size: 18px; }
                      .ck-content h3 { font-size: 16px; }
                      .ck-content h4 { font-size: 15px; }
                      .ck-content h5 { font-size: 14px; }
                      .ck-content h6 { font-size: 13px; }
                      
                      .ck-content table {
                        font-size: 12px;
                      }
                      
                      .ck-content th,
                      .ck-content td {
                        padding: 6px 8px;
                      }
                    }

                    .ck.ck-widget__type-around__button.ck-widget__type-around__button_after {
                      display: none !important;
                    }

                    ck ck-widget__type-around__button ck-widget__type-around__button_after .page-break {
                    page-break-before: always;
                    }

                    figure.image {
                      display: block;
                      width: auto !important;
                      max-width: 100% !important;
                    }

                    figure.image img {
                      display: block;
                      width: 100% !important;
                      height: auto !important;
                    }

                    /* A4 Page Layout */
                    .a4-page {
                      width: 210mm;
                      min-height: 297mm;
                      box-sizing: border-box;
                      background: #ffffff;
                      margin: 0 auto;
                      position: relative;
                    }

                    .a4-content {
                      width: 100%;
                      height: 100%;
                      box-sizing: border-box;
                      overflow-x: auto;
                      overflow-y: hidden;
                      word-wrap: break-word;
                    }

                    .a4-page + .a4-page {
                      padding-top: 0 !important;
                    }

                    /* Page margins for PDF generation */
                    
                    @page {
                        margin: 5mm;
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

      logger.info("HTML generated successfully.", { htmlLength: html.length });

      logger.info("Setting page content...");
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });
      logger.info("Page content set successfully");
      const htmlDebug = await page.content();
      logger.info("DEBUG HTML:", htmlDebug);

      // Wait for all images to load (including base64 images)
      logger.info("Waiting for images to load...");
      try {
        // 2. CRITICAL: Wait for all images to be fully loaded and decoded
        await page.evaluate(async () => {
          const selectors = Array.from(document.querySelectorAll("img"));
          await Promise.all(selectors.map(img => {
            if (img.complete) return;
            return new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
          }));
        });

        // Give the browser a moment to paint the images
        await page.waitForTimeout(500);
      } catch (error) {
        logger.warn("Image loading timeout, proceeding anyway", { error: error.message });
      }

      // Wait until fonts and styles fully load
      await page.evaluateHandle("document.fonts.ready");

      // Emulate screen media (not print) for exact style rendering
      await page.emulateMediaType("screen");

      // Generate PDF
      logger.info("Generating PDF...");
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        scale: 1,
        preferCSSPageSize: true,
      });
      logger.info("PDF generated successfully", { size: pdf.length });
      return pdf;
    });

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error(`Invalid PDF Buffer generated. Type: ${typeof pdfBuffer}`);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    logger.error("Error generating PDF", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
});


module.exports = router;
