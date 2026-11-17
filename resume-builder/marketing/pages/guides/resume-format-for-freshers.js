const { BRAND_NAME } = require('../../facts');
const { guide } = require('./shared');

module.exports = guide({
  slug: 'resume-format-for-freshers',
  title: 'Resume Format for Freshers: Layout, Order and Example',
  description: 'The best resume format for freshers in India: which layout to choose, the order of sections, page length, fonts and margins, with a complete example outline.',
  h1: 'Resume format for freshers',
  crumb: 'Resume format for freshers',
  lede: 'A fresher resume works best as a one-page, reverse-chronological resume that leads with education, projects and skills. Here is the format, the section order and a full example outline you can follow.',
  body: `
<h2>Which resume format should a fresher use?</h2>
<div class="prose">
<p>There are three common resume formats:</p>
<ul>
  <li><strong>Reverse-chronological:</strong> sections listed with the most recent item first. This is what most recruiters in India expect, and what applicant tracking systems (ATS) read most reliably.</li>
  <li><strong>Functional (skills-based):</strong> groups everything under skills and plays down dates. Recruiters often distrust it because it can hide gaps, so it is rarely the best choice.</li>
  <li><strong>Combination:</strong> a skills summary at the top, followed by reverse-chronological education, projects and experience.</li>
</ul>
<p><strong>For most freshers, use reverse-chronological with a short skills section near the top.</strong> That is effectively a light combination format: it shows your strongest skills early without hiding anything.</p>
</div>

<h2>Layout rules</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Element</th><th scope="col">Recommendation</th></tr></thead>
<tbody>
<tr><td>Length</td><td>One page</td></tr>
<tr><td>Layout</td><td>Single column, clear section headings</td></tr>
<tr><td>Font</td><td>A plain font such as Calibri, Arial or Georgia; 10–12 pt body, 14–16 pt name</td></tr>
<tr><td>Margins</td><td>About 1.5–2.5 cm on all sides</td></tr>
<tr><td>Photo</td><td>Leave it out unless the employer asks for one</td></tr>
<tr><td>File</td><td>PDF, unless the job posting asks for Word</td></tr>
<tr><td>File name</td><td>FirstName-LastName-Resume.pdf</td></tr>
</tbody>
</table></div>

<h2>Section order for a fresher resume</h2>
<ol class="steps prose">
  <li><strong>Header:</strong> name, phone, professional email, city, LinkedIn and (for tech roles) GitHub or portfolio.</li>
  <li><strong>Career objective or summary:</strong> two or three lines naming the role you want and your strongest skills.</li>
  <li><strong>Education:</strong> degree, college, graduation year and CGPA or percentage. Add class 12 and 10 if the employer asks.</li>
  <li><strong>Skills:</strong> grouped (for example Languages, Tools, Frameworks) and matched to the job description.</li>
  <li><strong>Projects:</strong> two to four projects, each with what it does, the tools used and a result.</li>
  <li><strong>Internships or work experience:</strong> company, role, dates and two or three achievement-focused bullet points.</li>
  <li><strong>Certifications and achievements:</strong> courses, hackathons, competitions, scholarships.</li>
  <li><strong>Extra-curricular activities and languages</strong> (optional, if space allows).</li>
</ol>
<p class="prose">If you have a strong internship that matches the job, move it above Projects.</p>

<h2>Example: fresher resume outline</h2>
<p class="note">This is a made-up example to show the format. Replace every detail with your own.</p>
<div class="card prose" style="font-family:Georgia,serif">
<p><strong>Aarav Sharma</strong><br>Pune · +91 XXXXX XXXXX · aarav.sharma@example.com · linkedin.com/in/example · github.com/example</p>
<p><strong>Summary</strong><br>Computer Science graduate looking for a junior backend developer role. Comfortable with Java, Spring Boot and SQL; built and deployed two REST APIs used by classmates.</p>
<p><strong>Education</strong><br>B.Tech, Computer Science · Example Institute of Technology · 2026 · CGPA 8.1</p>
<p><strong>Skills</strong><br>Languages: Java, Python, SQL · Frameworks: Spring Boot · Tools: Git, Docker, Postman</p>
<p><strong>Projects</strong><br>Library Management API: REST API for book lending with JWT login and MySQL; handled 300+ test requests per minute in load tests.<br>Placement Tracker: Python script that collects placement notices into one weekly email for a 60-student class.</p>
<p><strong>Internship</strong><br>Backend Intern · Example Software Pvt Ltd · May–Jul 2025<br>Wrote unit tests for the payments module, raising coverage from 52% to 78%.</p>
<p><strong>Certifications</strong><br>Example Cloud Practitioner (2025)</p>
</div>

<h2>Common mistakes to avoid</h2>
<ul class="prose">
  <li>Listing duties instead of results ("responsible for testing" instead of "wrote 40 unit tests").</li>
  <li>Using one generic resume for every job.</li>
  <li>Personal details recruiters don't need, such as father's name, religion or date of birth, unless the employer asks.</li>
  <li>Fancy layouts with text in images or several columns, which an ATS may read in the wrong order.</li>
  <li>Spelling mistakes and inconsistent date formats. Read it aloud before sending.</li>
</ul>

<h2>Build it in ${BRAND_NAME}</h2>
<p class="prose">${BRAND_NAME}'s guided form follows this structure. Fill in each section, pick a single-column <a href="/templates">template</a>, and download a PDF for free. For more on what to write, see our <a href="/resume-builder-for-freshers">resume guide for freshers</a>.</p>
`,
  faq: [
    { q: 'What is the best resume format for freshers?', a: 'A one-page, reverse-chronological resume with a short skills section near the top. Lead with education and projects, since most freshers have little work experience.' },
    { q: 'Should a fresher resume be one page?', a: 'Yes, in almost all cases. One page is enough to show education, skills and a few projects, and recruiters read it faster.' },
    { q: 'Should I put a photo on my resume?', a: 'Not unless the employer asks for one. Most private-sector employers in India don\'t need it, and a photo takes space that projects or skills could use.' },
    { q: 'PDF or Word for a fresher resume?', a: 'PDF keeps your layout the same on every device. Send Word only if the job posting asks for it.' },
  ],
});
