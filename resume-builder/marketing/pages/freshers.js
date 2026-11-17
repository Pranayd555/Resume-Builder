const { SIGNUP_TOKENS, MAX_RESUMES, BRAND_NAME } = require('../facts');

module.exports = {
  path: '/resume-builder-for-freshers',
  title: `Free Resume Builder for Freshers: Format and Tips | ${BRAND_NAME}`,
  description: 'Make your first resume as a fresher or student: the sections to include, the right order, what to write with no work experience, and a free builder with PDF download.',
  h1: 'Resume builder for freshers',
  crumb: 'Resume for freshers',
  lede: 'Writing your first resume with little or no work experience? Here is what to include, in what order, and how to build it for free in a few minutes.',
  body: `
<div class="cta-row"><a class="btn primary" href="/register">Build my fresher resume</a><a class="btn ghost" href="/templates">See templates</a></div>

<h2>What recruiters look for in a fresher resume</h2>
<div class="prose">
<p>Recruiters hiring freshers know you won't have years of experience. They look for evidence that you can learn and deliver: your education, projects, internships, skills and anything you have built or led. The job of a fresher resume is to put that evidence where it is quick to find.</p>
</div>

<h2>Sections to include, in this order</h2>
<ol class="steps prose">
  <li><strong>Contact details.</strong> Name, phone, email, city, and a LinkedIn or GitHub link if you have one. Use a professional email address.</li>
  <li><strong>Career objective or summary.</strong> Two or three lines on the role you want and what you bring. Write a new one for each kind of job.</li>
  <li><strong>Education.</strong> Degree, college, year and score (CGPA or percentage). Add class 12 and class 10 if the employer asks for them.</li>
  <li><strong>Skills.</strong> Technical skills and tools first, matched to the job description. Keep soft skills short.</li>
  <li><strong>Projects.</strong> For each project: what it does, the tools you used, and a result. College projects count.</li>
  <li><strong>Internships and training.</strong> Company, dates, and what you did, with numbers where you can.</li>
  <li><strong>Certifications, achievements and activities.</strong> Courses, hackathons, competitions, volunteering and positions of responsibility.</li>
</ol>

<h2>Tips for freshers</h2>
<ul class="prose">
  <li><strong>Keep it to one page.</strong> It is enough for a first resume, and recruiters read it faster.</li>
  <li><strong>Start bullet points with action verbs:</strong> built, designed, analysed, led, improved.</li>
  <li><strong>Show results.</strong> "Built an attendance app used by 120 students" says more than "Made an app".</li>
  <li><strong>Match the job description.</strong> Use the same names for skills and tools that the job uses, as long as you really have them.</li>
  <li><strong>Choose a clean template.</strong> Simple single-column layouts are easiest for recruiters and applicant tracking systems to read.</li>
  <li><strong>Send a PDF</strong> unless the employer asks for another format, so the layout looks the same everywhere.</li>
</ul>

<h2>How ${BRAND_NAME} helps</h2>
<ul class="ticks prose">
  <li>A guided form with sections for education, projects, skills, work experience (including internships), certifications, achievements and languages</li>
  <li>Free <a href="/templates">resume templates</a> and free PDF download</li>
  <li>AI that rewrites a rough bullet point into a clear, professional one. ${SIGNUP_TOKENS} free AI tokens come with every new account</li>
  <li>An <a href="/ats-resume-checker">ATS check</a> that compares your resume with a job description and lists missing keywords</li>
  <li>Up to ${MAX_RESUMES} resumes, so you can keep separate versions for different kinds of jobs</li>
</ul>
`,
  faq: [
    { q: 'How long should a fresher resume be?', a: 'One page is right for most freshers. Use a second page only if you have several strong projects or internships that are relevant to the job.' },
    { q: 'Should a fresher write a career objective or a summary?', a: 'Either works. An objective says what role you want; a summary says what you offer. A short summary that names the role and your two or three strongest skills usually does both.' },
    { q: 'What if I have no internship or work experience?', a: 'Lead with education, projects and skills. Academic projects, personal projects, hackathons, freelance work and positions of responsibility all show what you can do.' },
    { q: 'Is this resume builder free for students?', a: `Yes. Writing your resume, using the templates and downloading a PDF are free. AI tools use tokens, and you get ${SIGNUP_TOKENS} free when you sign up.` },
  ],
};
