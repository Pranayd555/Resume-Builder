const { BRAND_NAME } = require('../../facts');
const { guide } = require('./shared');

module.exports = guide({
  slug: 'resume-vs-cv-vs-biodata',
  title: 'Resume vs CV vs Biodata: Differences and Which to Use',
  description: 'Resume, CV and biodata explained: how they differ in length, content and purpose, and which one to send for private jobs, government jobs, academia and jobs abroad.',
  h1: 'Resume vs CV vs biodata',
  crumb: 'Resume vs CV vs biodata',
  lede: 'In India the three words are often used interchangeably, but they are different documents. A resume is a short, targeted summary; a CV is a complete academic and career record; a biodata focuses on personal details. Here is how to tell them apart and when to use each.',
  body: `
<h2>The short answer</h2>
<ul class="ticks prose">
  <li><strong>Private-sector jobs</strong> (IT, finance, sales, startups, most campus placements): send a <strong>resume</strong>.</li>
  <li><strong>Academic, research, teaching or medical roles</strong>, and many jobs in the UK, Europe and other countries outside North America: send a <strong>CV</strong>.</li>
  <li><strong>Some government, PSU and traditional organisations</strong> that ask for one by name: send a <strong>biodata</strong> in the format they request.</li>
  <li>When in doubt, follow the job posting. If it says "CV" but it is a private-sector role in India, a well-made resume is usually what they want.</li>
</ul>

<h2>Side-by-side comparison</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col"></th><th scope="col">Resume</th><th scope="col">CV (curriculum vitae)</th><th scope="col">Biodata</th></tr></thead>
<tbody>
<tr><th scope="row">Purpose</th><td>Show you fit one specific job</td><td>Give a complete record of your academic and professional history</td><td>Give personal and background details</td></tr>
<tr><th scope="row">Length</th><td>1 page (freshers), up to 2 pages</td><td>2 pages or more; grows over a career</td><td>Usually 1–2 pages</td></tr>
<tr><th scope="row">Tailored per job?</th><td>Yes</td><td>Mostly the same for every application</td><td>No</td></tr>
<tr><th scope="row">Main content</th><td>Skills, achievements, relevant experience and projects</td><td>Education, research, publications, teaching, conferences, awards, full work history</td><td>Name, date of birth, gender, nationality, address, education, sometimes family details</td></tr>
<tr><th scope="row">Personal details</th><td>Contact details only</td><td>Contact details; more only if local custom expects it</td><td>Many personal details</td></tr>
<tr><th scope="row">Typical use in India</th><td>Private companies, campus placements, job portals</td><td>Academia, research, medicine, applications abroad</td><td>Some government and PSU forms, traditional employers</td></tr>
</tbody>
</table></div>

<h2>Resume</h2>
<div class="prose">
<p>A resume is a short document written for one job. You pick the skills, projects and experience that matter for that role and leave out the rest. Recruiters often spend only a short time on a first look, so a resume puts the most relevant information first and uses bullet points instead of long paragraphs.</p>
<p>Most job portals and applicant tracking systems (ATS) are built around resumes. See our guide to <a href="/guides/ats-friendly-resume">writing an ATS-friendly resume</a>.</p>
</div>

<h2>CV (curriculum vitae)</h2>
<div class="prose">
<p>"Curriculum vitae" is Latin for "course of life". A CV records your whole academic and professional history: degrees, research, publications, presentations, teaching, grants and awards. It is not trimmed for each job, so it gets longer as your career grows.</p>
<p>In the UK, Ireland and much of Europe, "CV" is also the everyday word for what Indians and Americans call a resume: a two-page, job-focused document. Check what the employer in that country expects.</p>
</div>

<h2>Biodata</h2>
<div class="prose">
<p>A biodata ("biographical data") focuses on personal details such as date of birth, gender, nationality, marital status and address, alongside education and work history. It is mostly used today when a government department, PSU or traditional employer asks for it, often with a fixed format and a signed declaration at the end.</p>
<p>Don't send a biodata for private-sector jobs unless asked. Personal details like religion or marital status aren't relevant to most hiring decisions and take space better used for skills and achievements.</p>
</div>

<h2>Make yours</h2>
<p class="prose">${BRAND_NAME} builds resumes: pick a <a href="/templates">template</a>, fill in a guided form and download a PDF. Writing your first one? Start with the <a href="/guides/resume-format-for-freshers">resume format for freshers</a>.</p>
`,
  faq: [
    { q: 'Is a CV the same as a resume in India?', a: 'People often use the words interchangeably, but strictly a resume is a short, job-specific document and a CV is a complete record of your academic and professional history. For most private jobs in India, employers want a resume even if they say "CV".' },
    { q: 'When should I use a biodata?', a: 'When an employer, usually a government department, PSU or traditional organisation, asks for a biodata by name or gives you a biodata format to fill in.' },
    { q: 'Which is best for freshers?', a: 'A one-page resume. Freshers rarely have enough academic output to need a full CV, and private employers expect a resume.' },
    { q: 'Should I include date of birth or marital status?', a: 'On a resume, no, unless the employer asks. On a biodata these details are expected.' },
  ],
});
