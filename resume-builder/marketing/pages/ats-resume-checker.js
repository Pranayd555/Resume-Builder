const { ATS_CATEGORIES, SIGNUP_TOKENS, MAX_UPLOAD_MB, BRAND_NAME } = require('../facts');

const rows = ATS_CATEGORIES.map((c) => `<tr><td>${c.name}</td><td class="num">${c.points}</td><td>${c.detail}</td></tr>`).join('\n');

module.exports = {
  path: '/ats-resume-checker',
  title: `ATS Resume Checker: Score Your Resume Against a Job | ${BRAND_NAME}`,
  description: `Check how well your resume matches a job description. Get an ATS score out of 100, missing keywords, warnings and fixes. New accounts get ${SIGNUP_TOKENS} free AI tokens.`,
  h1: 'ATS resume checker',
  crumb: 'ATS resume checker',
  lede: 'Paste a job description, or upload it as a file, and get your resume scored out of 100 for that specific job, with the keywords you are missing and what to fix first.',
  body: `
<div class="cta-row"><a class="btn primary" href="/register">Check my resume</a><a class="btn ghost" href="/pricing">See pricing</a></div>
<p class="note">Each check uses 1 AI token. New accounts get ${SIGNUP_TOKENS} free tokens, so your first checks cost nothing.</p>

<h2>What is an ATS?</h2>
<div class="prose">
<p>An applicant tracking system (ATS) is software that companies use to collect and filter job applications. It reads the text of your resume and helps recruiters search and rank candidates, often by the skills and keywords in the job description. A resume that is hard to read, or that leaves out the words the job asks for, can be ranked low before a person reads it.</p>
</div>

<h2>How your resume is scored</h2>
<p class="prose">${BRAND_NAME} compares your resume with the job description and scores six areas. The points add up to 100.</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Area</th><th scope="col">Points</th><th scope="col">What it looks at</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>

<h2>What you get back</h2>
<ul class="ticks prose">
  <li>Your overall score, and the score for each area above</li>
  <li>Up to 15 important keywords and skills from the job that your resume is missing</li>
  <li>What already matches the job well, and where the gaps are</li>
  <li>Warnings about things that can stop an ATS reading your resume, such as missing sections or contact details</li>
  <li>Specific recommendations, most valuable first</li>
</ul>
<p class="prose">From the results you can ask the AI to add the missing keywords to the right sections or to adjust the tone of your resume. Each of those is one more AI action.</p>

<h2>How to check your resume</h2>
<ol class="steps prose">
  <li><strong>Create your resume</strong> in the builder, or <a href="/import-resume">import an existing PDF or Word resume</a>.</li>
  <li><strong>Add the job description.</strong> Paste the text, or upload it as a PDF or Word (.docx) file up to ${MAX_UPLOAD_MB} MB.</li>
  <li><strong>Run the check</strong> and read your score, missing keywords and recommendations.</li>
  <li><strong>Fix the gaps</strong> yourself or with the AI tools, then check again.</li>
</ol>

<h2>Tips for an ATS-friendly resume</h2>
<ul class="prose">
  <li>Use the job's own words for skills and tools you really have. If it says "React.js", don't only write "frontend frameworks".</li>
  <li>Keep standard section names: Summary, Experience, Education, Skills, Projects.</li>
  <li>Put contact details in the body of the resume, not only in a header image.</li>
  <li>Prefer simple layouts. Single-column and classic templates are the safest choice for older ATS software. <a href="/templates">Browse the templates</a>.</li>
  <li>Tailor your resume for each job you apply to instead of sending one version everywhere.</li>
</ul>
`,
  faq: [
    { q: 'Is the ATS checker free?', a: `Each check uses 1 AI token. Every new account gets ${SIGNUP_TOKENS} free tokens, and after that token packs start at a one-time payment. If you add your own Gemini API key, checks don't use tokens.` },
    { q: 'Do I need a job description?', a: 'Yes. The score measures how well your resume fits one specific job, so the checker needs that job\'s description as text or as a PDF or Word file.' },
    { q: 'Does a high score guarantee an interview?', a: 'No. Every company configures its ATS differently and people make the final decision. A higher score means your resume covers more of what the job asks for and is easier for software to read.' },
    { q: 'Can I check a resume I already have?', a: 'Yes. Import your existing PDF or Word resume into the builder first, then run the check on it.' },
  ],
};
