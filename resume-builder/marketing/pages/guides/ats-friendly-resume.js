const { BRAND_NAME } = require('../../facts');
const { guide } = require('./shared');

module.exports = guide({
  slug: 'ats-friendly-resume',
  title: 'How to Write an ATS-Friendly Resume: Checklist and Tips',
  description: 'What an applicant tracking system (ATS) does with your resume, the formatting and keyword rules that help it read your resume correctly, and a checklist to use before you apply.',
  h1: 'How to write an ATS-friendly resume',
  crumb: 'ATS-friendly resume',
  lede: 'Many employers collect applications in an applicant tracking system (ATS). It turns your resume into text, files it under the job, and lets recruiters search and sort candidates. An ATS-friendly resume is one the software can read correctly and that contains the words recruiters search for.',
  body: `
<h2>What an ATS does with your resume</h2>
<ol class="steps prose">
  <li><strong>Parses it:</strong> pulls the text out of your file and tries to split it into fields such as name, contact details, job titles, dates, education and skills.</li>
  <li><strong>Stores it</strong> against the job you applied for, often alongside hundreds of other applications.</li>
  <li><strong>Helps recruiters search and filter</strong>, for example by skills, job titles, years of experience or location. Some systems also rank applications against the job description.</li>
</ol>
<p class="prose">Two things follow: the software has to read your resume correctly, and your resume has to contain the terms a recruiter will look for. Every ATS is configured differently, so no format or score guarantees a result, but the rules below help with almost all of them.</p>

<h2>Formatting rules</h2>
<ul class="prose">
  <li><strong>Use a simple layout.</strong> A single column reads most reliably. Some systems read multi-column layouts across the columns and jumble the text.</li>
  <li><strong>Use standard section headings:</strong> Summary, Experience (or Work Experience), Education, Skills, Projects, Certifications. Creative headings like "My Journey" may not be recognised.</li>
  <li><strong>Keep important text out of images, icons, text boxes and the page header or footer.</strong> Some systems skip them, which can lose your name or contact details.</li>
  <li><strong>Avoid complex tables</strong> for core information. Simple lists are safer.</li>
  <li><strong>Use a common font</strong> and plain bullet points.</li>
  <li><strong>Write dates consistently</strong>, for example "Jun 2024 – Aug 2025", for every role.</li>
  <li><strong>Send the file type the posting asks for.</strong> Most modern systems read text-based PDFs well; if the posting asks for Word, send .docx. Never send a scanned image of your resume.</li>
</ul>

<h2>Keyword rules</h2>
<ul class="prose">
  <li><strong>Read the job description</strong> and note the skills, tools, qualifications and job title it mentions.</li>
  <li><strong>Use the same words</strong> for things you really have. If the posting says "Microsoft Excel", don't only write "spreadsheets".</li>
  <li><strong>Include the spelled-out form and the abbreviation</strong> once where both are common, for example "Search Engine Optimisation (SEO)".</li>
  <li><strong>Put keywords in context.</strong> "Built dashboards in Power BI that cut weekly reporting time by 3 hours" beats a bare list of tools.</li>
  <li><strong>Don't stuff keywords</strong> or hide text in white font. Recruiters read your resume too, and hidden text is easy to spot once the file is converted to plain text.</li>
  <li><strong>Tailor for each job.</strong> Keep a base resume and adjust the summary, skills and bullet points for each application.</li>
</ul>

<h2>Checklist before you apply</h2>
<ul class="ticks prose">
  <li>Single-column layout with standard headings</li>
  <li>Name and contact details in the main body, as text</li>
  <li>Job title and key skills from the posting appear in your resume (where true)</li>
  <li>Every role has dates in the same format</li>
  <li>No important text inside images or text boxes</li>
  <li>File type matches what the posting asked for, and the PDF has selectable text</li>
  <li>File named clearly, e.g. FirstName-LastName-Resume.pdf</li>
  <li>Spell-checked and read aloud once</li>
</ul>

<h2>Check your resume against a job</h2>
<p class="prose">${BRAND_NAME}'s <a href="/ats-resume-checker">ATS resume checker</a> compares your resume with a job description you paste or upload. It gives a score out of 100, lists missing keywords, and flags things that can stop an ATS reading your resume. New accounts get free AI tokens to try it. Need a layout to start from? See the <a href="/templates">resume templates</a>.</p>
`,
  faq: [
    { q: 'What is an ATS-friendly resume?', a: 'A resume that applicant tracking software can read correctly, usually a simple single-column layout with standard headings, and that uses the same skills and job-title keywords as the job description.' },
    { q: 'Is PDF or Word better for ATS?', a: 'Most modern systems read text-based PDFs well. If the job posting asks for Word (.docx), send Word. Never send a scanned image.' },
    { q: 'Do all companies use an ATS?', a: 'No, but many medium and large employers and most job portals do. Writing an ATS-friendly resume costs nothing and also makes your resume easier for people to read.' },
    { q: 'Can a resume pass every ATS?', a: 'No one can guarantee that, because each company sets its system up differently. Following these rules and matching the job description gives you the best chance.' },
  ],
});
