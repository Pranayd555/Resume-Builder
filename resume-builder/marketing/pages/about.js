const { SUPPORT_EMAIL, SIGNUP_TOKENS, PRODUCT_NAME, BRAND_NAME } = require('../facts');

module.exports = {
  path: '/about',
  title: `About ${BRAND_NAME}: Free AI Resume Builder`,
  description: `${BRAND_NAME} is an online AI resume builder. Free resume templates and PDF downloads, with optional pay-per-use AI tools and no subscription.`,
  h1: `About ${BRAND_NAME}`,
  crumb: 'About',
  lede: `${PRODUCT_NAME} helps job seekers write clear, well-structured resumes that both recruiters and applicant tracking systems can read.`,
  body: `
<div class="prose">
<h2>What we believe</h2>
<p>A good resume shouldn't sit behind a paywall. Writing your resume, choosing a template and downloading it are free on ${BRAND_NAME}, with no watermark and no subscription.</p>
<p>AI can save a lot of time, but it costs money to run. So the AI tools are pay-per-use: every account gets ${SIGNUP_TOKENS} free tokens, packs are a one-time purchase, tokens never expire, and you can bring your own Google Gemini key instead.</p>

<h2>Who it is for</h2>
<ul>
  <li>Students and freshers writing a first resume (<a href="/resume-builder-for-freshers">our guide for freshers</a>)</li>
  <li>Professionals tailoring a resume for each application (<a href="/ats-resume-checker">ATS checker</a>)</li>
  <li>Anyone with an old resume who wants to update it quickly (<a href="/import-resume">import a resume</a>)</li>
</ul>

<h2>Contact</h2>
<p>Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> or use the <a href="/contact-us">contact form</a>.</p>
</div>
`,
  extraLd: [{ '@type': 'AboutPage', '@id': 'https://presmistique.in/about#about', url: 'https://presmistique.in/about', about: { '@id': 'https://presmistique.in/#organization' } }],
};
