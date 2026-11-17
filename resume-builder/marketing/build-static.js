#!/usr/bin/env node
// Runs after `craco build` (npm "postbuild"). Writes the static marketing pages,
// a crawler-readable version of the home page inside index.html, sitemap.xml
// and llms.txt into build/.
//
// Why: the app is a client-side React SPA, so without this every URL is an
// empty <div id="root"> to crawlers that don't run JavaScript (most AI
// crawlers). Cloudflare Pages serves build/pricing.html at /pricing.
const fs = require('fs');
const path = require('path');
const { renderPage, esc } = require('./layout');
const facts = require('./facts');

const BUILD = path.join(__dirname, '..', 'build');
const { SITE_URL, BRAND_NAME, PRODUCT_NAME, SUPPORT_EMAIL, SIGNUP_TOKENS, cheapestPack, TEMPLATE_COUNT_FLOOR } = facts;

const pages = [
  require('./pages/features'),
  require('./pages/pricing'),
  require('./pages/templates'),
  require('./pages/ats-resume-checker'),
  require('./pages/import-resume'),
  require('./pages/freshers'),
  require('./pages/faq'),
  require('./pages/about'),
  require('./pages/guides/index'),
  ...require('./pages/guides/index').GUIDES,
];

// Public pages rendered by the React app (see INDEXABLE_PAGES in src/constants/seo.js).
const SPA_PUBLIC_PAGES = [
  { path: '/byok', title: 'Use your own Gemini API key', summary: 'Run the AI tools on your own free Google Gemini API key instead of tokens.' },
  { path: '/contact-us', title: 'Contact us', summary: `Contact form and support email (${SUPPORT_EMAIL}).` },
  { path: '/privacy-policy', title: 'Privacy policy' },
  { path: '/terms-conditions', title: 'Terms and conditions' },
  { path: '/cancellation-refunds', title: 'Cancellation and refund policy' },
  { path: '/shipping', title: 'Shipping and delivery policy' },
];

const fail = (msg) => { console.error(`build-static: ${msg}`); process.exit(1); };

if (!fs.existsSync(path.join(BUILD, 'index.html'))) fail('build/index.html not found. Run this after `craco build`.');

// 1. Marketing pages
for (const page of pages) {
  const file = path.join(BUILD, `${page.path.replace(/^\//, '')}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderPage(page));
}

// 2. Home page content for crawlers that don't run JavaScript. It sits inside
//    #root, so React replaces it on mount; the `js` class hides it before
//    first paint for everyone running JavaScript.
const homeBlock = `<div id="static-home">
<h1>${esc(BRAND_NAME)}: Free AI Resume Builder</h1>
<p>${esc(PRODUCT_NAME)} is an online resume builder. Fill in a guided form, choose one of ${TEMPLATE_COUNT_FLOOR}+ free templates and download your resume as a PDF, free. Optional AI tools rewrite your content, score your resume against a job description and import an existing PDF or Word resume.</p>
<ul>
<li>Free: unlimited resumes, all public templates and PDF download.</li>
<li>${SIGNUP_TOKENS} free AI tokens on signup. 1 token = 1 AI action.</li>
<li>Token packs from ${esc(cheapestPack.priceLabel)}, one-time payment, no subscription. Tokens never expire.</li>
<li>Or use your own Google Gemini API key and AI actions don't use tokens.</li>
</ul>
<nav aria-label="Site pages"><ul>
${pages.map((p) => `<li><a href="${p.path}">${esc(p.crumb || p.h1)}</a></li>`).join('\n')}
${SPA_PUBLIC_PAGES.map((p) => `<li><a href="${p.path}">${esc(p.title)}</a></li>`).join('\n')}
<li><a href="/register">Create a free account</a></li>
<li><a href="/login">Log in</a></li>
</ul></nav>
<p>Contact: ${esc(SUPPORT_EMAIL)}</p>
</div>`;

const indexPath = path.join(BUILD, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
// Remove output of an earlier run, so running this twice on one build is safe.
index = index
  .replace(/<!--static-head-->[\s\S]*?<!--\/static-head-->/, '')
  .replace(/<div id="root"><!--static-home-->[\s\S]*?<!--\/static-home--><\/div>/, '<div id="root"></div>');
if (!index.includes('<div id="root"></div>')) fail('could not find <div id="root"></div> in build/index.html');
if (!index.includes('</head>')) fail('could not find </head> in build/index.html');
index = index
  .replace('</head>', '<!--static-head--><script>document.documentElement.classList.add("js")</script><style>.js #static-home{display:none}</style><!--/static-head--></head>')
  .replace('<div id="root"></div>', `<div id="root"><!--static-home-->${homeBlock}<!--/static-home--></div>`);
fs.writeFileSync(indexPath, index);

// 3. sitemap.xml
const urls = ['/', ...pages.map((p) => p.path), ...SPA_PUBLIC_PAGES.map((p) => p.path)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemap);

// 4. llms.txt (https://llmstxt.org): a plain-text map of the site for AI tools.
const llms = `# ${PRODUCT_NAME}

> ${BRAND_NAME} is an online resume builder at ${SITE_URL}. Building resumes, ${TEMPLATE_COUNT_FLOOR}+ templates and PDF download are free. AI tools (rewriting, ATS score against a job description, resume import from PDF/Word) cost 1 token per action: ${SIGNUP_TOKENS} free tokens on signup, then one-time packs from ${cheapestPack.priceLabel} (INR). No subscription; tokens never expire. Users can also add their own Google Gemini API key so AI actions don't use tokens.

## Product
${pages.filter((p) => !['/faq', '/about', '/resume-builder-for-freshers'].includes(p.path) && !p.path.startsWith('/guides')).map((p) => `- [${p.crumb || p.h1}](${SITE_URL}${p.path}): ${p.description}`).join('\n')}
- [Use your own Gemini API key](${SITE_URL}/byok): ${SPA_PUBLIC_PAGES[0].summary}

## Guides
${pages.filter((p) => p.path.startsWith('/guides/') || p.path === '/resume-builder-for-freshers').map((p) => `- [${p.crumb || p.h1}](${SITE_URL}${p.path}): ${p.description}`).join('\n')}
- [FAQ](${SITE_URL}/faq): ${pages.find((p) => p.path === '/faq').description}

## Company
- [About](${SITE_URL}/about): ${pages.find((p) => p.path === '/about').description}
- [Contact](${SITE_URL}/contact-us): Support email ${SUPPORT_EMAIL}.
- [Privacy policy](${SITE_URL}/privacy-policy)
- [Terms and conditions](${SITE_URL}/terms-conditions)
- [Cancellation and refunds](${SITE_URL}/cancellation-refunds)
`;
fs.writeFileSync(path.join(BUILD, 'llms.txt'), llms);

console.log(`build-static: ${pages.length} pages, home content, sitemap.xml (${urls.length} URLs) and llms.txt written to build/`);
