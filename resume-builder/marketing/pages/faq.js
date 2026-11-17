const { SIGNUP_TOKENS, cheapestPack, packs, MAX_UPLOAD_MB, TEMPLATE_COUNT_FLOOR, SUPPORT_EMAIL, BRAND_NAME } = require('../facts');

const packList = packs.map((p) => `${p.tokens} tokens for ${p.priceLabel}`).join(', ');

const groups = [
  {
    heading: 'Getting started',
    items: [
      { q: `What is ${BRAND_NAME}?`, a: `${BRAND_NAME} is an online resume builder. You fill in a guided form, pick one of ${TEMPLATE_COUNT_FLOOR}+ templates and download your resume as a PDF. Optional AI tools help you write, check your resume against a job description and import an existing resume.` },
      { q: `Is ${BRAND_NAME} free?`, a: `Yes. Building resumes, using the templates and downloading PDFs are free. The AI tools use tokens. You get ${SIGNUP_TOKENS} free tokens when you sign up, and after that packs start at ${cheapestPack.priceLabel}.` },
      { q: 'Do I need an account?', a: 'Yes. A free account lets us save your resumes so you can come back and edit them on any device.' },
      { q: 'How many resumes can I make?', a: 'As many as you like. Many people keep one version per type of job.' },
      { q: 'Can I download my resume as a PDF?', a: 'Yes, for free, as many times as you need.' },
    ],
  },
  {
    heading: 'AI tokens and payments',
    items: [
      { q: 'What is a token?', a: 'A token pays for one AI action, such as rewriting a section, running an ATS check or importing a resume.' },
      { q: 'How much do tokens cost?', a: `Token packs are a one-time payment: ${packList}. <a href="/pricing">See pricing</a>.` },
      { q: 'Do tokens expire?', a: 'No.' },
      { q: 'Is there a subscription?', a: 'No. You buy a pack when you need one. Nothing renews automatically.' },
      { q: 'What if an AI action fails?', a: 'Its token is returned to your balance automatically.' },
      { q: 'Can I use AI without buying tokens?', a: 'Yes. Add your own Google Gemini API key to your profile and AI actions run on your key instead of using tokens. <a href="/byok">Read the guide</a>.' },
      { q: 'How do I pay, and can I get a refund?', a: 'Payments go through Razorpay\'s secure checkout. Our <a href="/cancellation-refunds">cancellation and refund policy</a> explains when refunds apply.' },
    ],
  },
  {
    heading: 'Resumes, templates and ATS',
    items: [
      { q: 'Are the templates ATS-friendly?', a: 'Simple layouts with standard headings are the easiest for applicant tracking systems to read. For job portals and large companies, choose a single-column template, and use the <a href="/ats-resume-checker">ATS checker</a> to see how your resume scores for a specific job.' },
      { q: 'How does the ATS check work?', a: 'It compares your resume with a job description you paste or upload and scores it out of 100 across keyword match, experience, section completeness, project impact, formatting and bonus skills. You also get missing keywords and recommendations. <a href="/ats-resume-checker">Details</a>.' },
      { q: 'Can I import my existing resume?', a: `Yes. Upload a PDF or Word (.docx) file up to ${MAX_UPLOAD_MB} MB and it is sorted into the editor for you. <a href="/import-resume">How import works</a>.` },
      { q: 'Can I switch templates after filling in my details?', a: 'Yes. Your content is kept separately from the design, so switching templates never loses your text.' },
    ],
  },
  {
    heading: 'Privacy and account',
    items: [
      { q: 'Do you sell my data?', a: 'No. We don\'t sell your personal information. See our <a href="/privacy-policy">privacy policy</a> for how data is used.' },
      { q: 'What happens to text I send to the AI tools?', a: 'When you use an AI tool, the text it needs is sent to Google\'s Gemini service to produce the result.' },
      { q: 'Can I delete my account?', a: 'Yes. You can delete your account from your profile page.' },
      { q: 'How do I contact support?', a: `Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> or use the <a href="/contact-us">contact form</a>.` },
    ],
  },
];

const faq = groups.flatMap((g) => g.items);

module.exports = {
  path: '/faq',
  title: `FAQ: Free Resume Builder, AI Tokens and ATS | ${BRAND_NAME}`,
  description: `Answers about ${BRAND_NAME}: what is free, how AI tokens and pricing work, ATS checks, resume import, templates, privacy and support.`,
  h1: 'Frequently asked questions',
  crumb: 'FAQ',
  body: groups.map((g, i) => `
<section class="faq prose" aria-labelledby="faq-${i}">
<h2 id="faq-${i}">${g.heading}</h2>
${g.items.map((item) => `<h3>${item.q}</h3>\n<p>${item.a}</p>`).join('\n')}
</section>`).join('\n'),
  // The questions are already on the page above; this only feeds the FAQPage JSON-LD.
  faq,
  faqHidden: true,
};
