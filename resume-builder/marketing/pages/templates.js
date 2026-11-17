const { templates, TEMPLATE_COUNT_FLOOR, BRAND_NAME } = require('../facts');
const { esc } = require('../layout');

const API_ORIGIN = 'https://api.presmistique.in';

const CATEGORY_INFO = {
  classic: { label: 'Classic', note: 'Traditional layouts with clear headings. A safe choice for most applications and for older ATS software.' },
  professional: { label: 'Professional', note: 'Polished, conservative designs for corporate, finance and management roles.' },
  minimalist: { label: 'Minimalist', note: 'Plenty of white space and simple structure. Easy for people and software to read.' },
  modern: { label: 'Modern', note: 'Contemporary designs with colour and accents, suited to tech, startups and product roles.' },
  creative: { label: 'Creative', note: 'More visual layouts for design, media and portfolio-led roles.' },
  academic: { label: 'Academic', note: 'Room for research, publications and teaching, for academic and research positions.' },
};
const ORDER = ['classic', 'professional', 'minimalist', 'modern', 'creative', 'academic'];

const groups = ORDER
  .map((key) => ({ key, ...CATEGORY_INFO[key], items: templates.filter((t) => t.category === key) }))
  .filter((g) => g.items.length);

const card = (t) => `<figure class="tpl">
  <img src="${API_ORIGIN}${esc(t.thumbnail)}" alt="${esc(t.name)} resume template preview" width="400" height="515" loading="lazy" decoding="async">
  <figcaption>${esc(t.name)}${t.description ? `<span>${esc(t.description)}</span>` : ''}</figcaption>
</figure>`;

module.exports = {
  path: '/templates',
  title: `Free Resume Templates: ${TEMPLATE_COUNT_FLOOR}+ Designs, PDF Download | ${BRAND_NAME}`,
  description: `Browse ${TEMPLATE_COUNT_FLOOR}+ free resume templates in classic, professional, minimalist, modern, creative and academic styles. Fill one in online and download it as a PDF for free.`,
  h1: 'Free resume templates',
  lede: `${templates.length} resume templates in six styles. Every template is free to use: fill in your details once, switch designs whenever you like, and download a PDF.`,
  body: `
<div class="cta-row"><a class="btn primary" href="/register">Use a template</a></div>
<nav aria-label="Template styles" class="note"><p>Jump to: ${groups.map((g) => `<a href="#${g.key}">${esc(g.label)} (${g.items.length})</a>`).join(' · ')}</p></nav>
${groups.map((g) => `
<section aria-labelledby="${g.key}">
<h2 id="${g.key}">${esc(g.label)} resume templates</h2>
<p class="prose">${esc(g.note)}</p>
<div class="grid">
${g.items.map(card).join('\n')}
</div>
</section>`).join('\n')}

<h2>Choosing a template</h2>
<ul class="prose">
  <li><strong>Applying through job portals or large companies?</strong> Choose a single-column template with standard headings. It is the easiest layout for applicant tracking systems to read.</li>
  <li><strong>Fresher or student?</strong> Pick a clean layout that puts education, projects and skills near the top. See our <a href="/resume-builder-for-freshers">guide for freshers</a>.</li>
  <li><strong>Design or creative role?</strong> A creative template can show some personality, but keep the text readable.</li>
  <li><strong>Not sure?</strong> Your content stays the same when you switch, so try a few and compare.</li>
</ul>
`,
  faq: [
    { q: 'Are the resume templates free?', a: 'Yes. All public templates are free to use, and downloading your resume as a PDF is free.' },
    { q: 'Are these templates ATS-friendly?', a: 'Simple layouts with standard section headings are the safest for ATS software, so for portal and large-company applications prefer a single-column template. To see how your resume reads for a specific job, run an <a href="/ats-resume-checker">ATS check</a>.' },
    { q: 'Can I change the template after writing my resume?', a: 'Yes. Your content is stored separately from the design, so you can switch templates at any time without retyping.' },
  ],
};
