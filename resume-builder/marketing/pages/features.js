const { SIGNUP_TOKENS, TEMPLATE_COUNT_FLOOR, cheapestPack, MAX_UPLOAD_MB, BRAND_NAME } = require('../facts');

module.exports = {
  path: '/features',
  title: `Features: AI Resume Writing, ATS Check, Templates | ${BRAND_NAME}`,
  description: `Everything in ${BRAND_NAME}: a guided resume editor, ${TEMPLATE_COUNT_FLOOR}+ free templates, free PDF download, AI rewriting, an ATS score against any job description, and resume import from PDF or Word.`,
  h1: `${BRAND_NAME} features`,
  crumb: 'Features',
  lede: 'A resume builder that is free for the essentials, with AI tools you pay for only when you use them.',
  body: `
<h2>Free for everyone</h2>
<div class="grid">
  <div class="card"><h3>Guided resume editor</h3><p>Fill in contact details, summary, work experience, education, skills, projects, certifications, achievements and languages. Your work saves as you go.</p></div>
  <div class="card"><h3>${TEMPLATE_COUNT_FLOOR}+ resume templates</h3><p>Classic, professional, minimalist, modern, creative and academic designs. Switch any time without retyping. <a href="/templates">Browse templates</a>.</p></div>
  <div class="card"><h3>Free PDF download</h3><p>Download your finished resume as a PDF at no cost.</p></div>
  <div class="card"><h3>Unlimited resumes</h3><p>Keep a separate version for each kind of job you apply to.</p></div>
  <div class="card"><h3>Light and dark mode</h3><p>Work the way that is easiest on your eyes.</p></div>
  <div class="card"><h3>${SIGNUP_TOKENS} free AI tokens</h3><p>Every new account can try the AI tools below at no cost.</p></div>
</div>

<h2>AI tools (1 token per action)</h2>
<div class="grid">
  <div class="card"><h3>Rewrite with AI</h3><p>Turn rough notes into clear, professional bullet points for your summary, experience, projects, education or achievements, in the tone you choose.</p></div>
  <div class="card"><h3>Condense</h3><p>Shorten a long section into a tighter version that keeps the important points.</p></div>
  <div class="card"><h3>ATS score</h3><p>Score your resume out of 100 against a job description and see missing keywords, warnings and recommendations. <a href="/ats-resume-checker">How it works</a>.</p></div>
  <div class="card"><h3>Add missing keywords</h3><p>After an ATS check, let the AI work the missing keywords into the sections you pick.</p></div>
  <div class="card"><h3>Adjust tone</h3><p>After an ATS check, rewrite sections to better fit the job's tone and focus.</p></div>
  <div class="card"><h3>Import a resume</h3><p>Upload a PDF or Word (.docx) file up to ${MAX_UPLOAD_MB} MB and get it sorted into the editor. <a href="/import-resume">How import works</a>.</p></div>
  <div class="card"><h3>Custom templates with AI</h3><p>Generate a new template, or restructure one, from your own description.</p></div>
</div>
<p class="prose">Token packs start at ${cheapestPack.priceLabel}, tokens never expire, and a failed AI action gives its token back. <a href="/pricing">See pricing</a>. Prefer your own key? With a Google Gemini API key in your profile, AI actions don't use tokens. <a href="/byok">Read the guide</a>.</p>
`,
  faq: [
    { q: `Which AI model does ${BRAND_NAME} use?`, a: 'The AI tools run on Google Gemini models.' },
    { q: 'Do I have to use the AI tools?', a: 'No. You can write your whole resume yourself, choose a template and download it without using a single token.' },
    { q: 'Can I edit what the AI writes?', a: 'Yes. AI suggestions go into the editor like any other text, so you can change them before saving.' },
  ],
};
