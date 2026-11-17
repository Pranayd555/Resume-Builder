const { SIGNUP_TOKENS, MAX_UPLOAD_MB, BRAND_NAME } = require('../facts');

module.exports = {
  path: '/import-resume',
  title: `Import Your Resume from PDF or Word and Edit It Online | ${BRAND_NAME}`,
  description: `Upload your existing resume as a PDF or Word (.docx) file. ${BRAND_NAME} reads it into the resume builder so you can edit it, switch templates and download a new PDF.`,
  h1: 'Import your existing resume',
  lede: 'Already have a resume? Upload it as a PDF or Word file and we fill the resume builder for you, so you can update it, apply a new template and download it again instead of retyping everything.',
  body: `
<div class="cta-row"><a class="btn primary" href="/register">Import my resume</a></div>

<h2>How it works</h2>
<ol class="steps prose">
  <li><strong>Upload your file.</strong> PDF or Word (.docx), up to ${MAX_UPLOAD_MB} MB. Older .doc files aren't supported; save them as .docx or PDF first.</li>
  <li><strong>We read the text</strong> and sort it into the builder's sections: contact details, summary, work experience, education, skills, projects and more.</li>
  <li><strong>Review the result.</strong> An import report shows what was placed and any lines that need your attention.</li>
  <li><strong>Edit and download.</strong> Change anything, pick a <a href="/templates">template</a>, run an <a href="/ats-resume-checker">ATS check</a> if you like, and download a PDF.</li>
</ol>

<h2>What it costs</h2>
<ul class="ticks prose">
  <li>An import is one AI action, so it uses 1 token. New accounts get ${SIGNUP_TOKENS} free tokens.</li>
  <li>If the file can't be read at all, you aren't charged.</li>
  <li>If the AI step fails, the token is returned and you still get a basic import with your contact details and section text.</li>
  <li>With your own Gemini API key, imports don't use tokens. <a href="/byok">Learn more</a>.</li>
</ul>

<h2>Tips for a clean import</h2>
<ul class="prose">
  <li>Use a PDF that contains real text. If you can't select the words in your PDF viewer, it is a scanned image and there is no text to read.</li>
  <li>Simple layouts import most accurately. Text inside images, text boxes or complex tables may need fixing by hand.</li>
  <li>Check dates, job titles and links after importing. They are the details most worth a second look.</li>
</ul>
`,
  faq: [
    { q: 'Which file types can I import?', a: `PDF and Word (.docx) files up to ${MAX_UPLOAD_MB} MB. Old Word .doc files need to be saved as .docx or PDF first.` },
    { q: 'Will the import be perfect?', a: 'Usually most of the content lands in the right place, but resumes vary a lot. The import report points out anything that couldn\'t be placed so you can fix it quickly.' },
    { q: 'Can I import a scanned resume?', a: 'No. A scanned resume is a picture of text, so there is no text in the file to read. Use the original document, or a PDF exported from Word or Google Docs.' },
  ],
};
