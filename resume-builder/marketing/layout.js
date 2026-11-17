// Page shell for the static marketing pages: head tags, JSON-LD, header,
// footer and inline CSS. Pages are plain HTML so search engines and AI
// crawlers can read them without running JavaScript.
const { SITE_URL, BRAND_NAME, PRODUCT_NAME, SUPPORT_EMAIL } = require('./facts');

const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Main navigation. Static pages are full page loads, so plain links.
const NAV = [
  { href: '/features', label: 'Features' },
  { href: '/templates', label: 'Templates' },
  { href: '/ats-resume-checker', label: 'ATS checker' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

const FOOTER_COLUMNS = [
  {
    heading: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/templates', label: 'Free resume templates' },
      { href: '/ats-resume-checker', label: 'ATS resume checker' },
      { href: '/import-resume', label: 'Import your resume' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/byok', label: 'Use your own AI key' },
    ],
  },
  {
    heading: 'Guides',
    links: [
      { href: '/resume-builder-for-freshers', label: 'Resume builder for freshers' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: `About ${BRAND_NAME}` },
      { href: '/contact-us', label: 'Contact us' },
      { href: '/privacy-policy', label: 'Privacy policy' },
      { href: '/terms-conditions', label: 'Terms and conditions' },
      { href: '/cancellation-refunds', label: 'Cancellation and refunds' },
      { href: '/shipping', label: 'Shipping and delivery' },
    ],
  },
];

const CSS = `
:root{--bg:#f8fafc;--surface:#fff;--fg:#0f172a;--muted:#475569;--line:#e2e8f0;--accent:#2563eb;--accent-2:#7c3aed;--accent-fg:#fff;--soft:#eef2ff;--ok:#047857}
@media (prefers-color-scheme:dark){:root{--bg:#0b1120;--surface:#111827;--fg:#f1f5f9;--muted:#94a3b8;--line:#1f2937;--accent:#60a5fa;--accent-2:#a78bfa;--accent-fg:#0b1120;--soft:#1e1b4b;--ok:#34d399;color-scheme:dark}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 Manrope,"Noto Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--accent)}
a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:4px}
img{max-width:100%;height:auto}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.skip{position:absolute;left:-999px;top:0;background:var(--surface);padding:8px 12px;z-index:10}
.skip:focus{left:8px;top:8px}
header.site{background:var(--surface);border-bottom:1px solid var(--line)}
header.site .wrap{display:flex;flex-wrap:wrap;align-items:center;gap:12px 24px;padding-top:12px;padding-bottom:12px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.15rem;color:var(--fg);text-decoration:none;margin-right:auto}
.brand img{width:36px;height:36px;border-radius:10px}
nav.main ul{display:flex;flex-wrap:wrap;gap:4px 18px;list-style:none;margin:0;padding:0}
nav.main a{color:var(--muted);text-decoration:none;font-weight:600;font-size:.95rem}
nav.main a:hover,nav.main a[aria-current=page]{color:var(--fg)}
.actions{display:flex;gap:10px;align-items:center}
.btn{display:inline-block;padding:10px 18px;border-radius:999px;font-weight:700;text-decoration:none;font-size:.95rem;border:1px solid transparent}
.btn.primary{background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff}
.btn.ghost{border-color:var(--line);color:var(--fg);background:var(--surface)}
main{padding:40px 0 56px}
.crumbs{font-size:.85rem;color:var(--muted);margin-bottom:12px}
.crumbs ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:0}
.crumbs li+li::before{content:"›";margin-right:6px}
.crumbs a{color:var(--muted)}
h1{font-size:clamp(1.9rem,4vw,2.8rem);line-height:1.15;margin:0 0 14px;font-weight:800;letter-spacing:-.01em}
h2{font-size:1.5rem;line-height:1.25;margin:44px 0 12px;font-weight:800}
h3{font-size:1.1rem;margin:24px 0 6px;font-weight:700}
p,ul,ol{margin:0 0 14px}
.lede{font-size:1.15rem;color:var(--muted);max-width:68ch}
.prose{max-width:72ch}
.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin:22px 0 8px}
.note{font-size:.9rem;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:18px 0}
.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px 20px;min-width:0}
.card h3{margin-top:0}
.card p:last-child{margin-bottom:0}
.price{font-size:2rem;font-weight:800;margin:4px 0}
.badge{display:inline-block;font-size:.75rem;font-weight:700;background:var(--soft);color:var(--accent);padding:2px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:.04em}
.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--surface);margin:16px 0}
table{border-collapse:collapse;width:100%;min-width:480px}
th,td{text-align:left;padding:12px 14px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
tr:last-child td{border-bottom:0}
td.num{font-variant-numeric:tabular-nums}
.ticks{list-style:none;padding:0}
.ticks li{padding-left:28px;position:relative;margin-bottom:8px}
.ticks li::before{content:"✓";position:absolute;left:4px;color:var(--ok);font-weight:800}
.steps{counter-reset:s;list-style:none;padding:0}
.steps li{counter-increment:s;padding-left:44px;position:relative;margin-bottom:14px}
.steps li::before{content:counter(s);position:absolute;left:0;top:0;width:30px;height:30px;border-radius:50%;background:var(--soft);color:var(--accent);font-weight:800;display:grid;place-items:center}
.faq h3{margin-top:22px}
.tpl{margin:0}
.tpl img{display:block;width:100%;aspect-ratio:1600/2060;object-fit:cover;object-position:top;border-radius:10px;border:1px solid var(--line);background:var(--soft)}
.tpl figcaption{margin-top:8px;font-weight:700}
.tpl figcaption span{display:block;font-weight:400;font-size:.88rem;color:var(--muted)}
.band{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:28px;margin-top:48px}
.band h2{margin-top:0}
footer.site{border-top:1px solid var(--line);background:var(--surface);padding:36px 0 28px;font-size:.92rem}
footer.site .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
footer.site h2{font-size:.85rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 10px}
footer.site ul{list-style:none;padding:0;margin:0}
footer.site li{margin-bottom:6px}
footer.site a{color:var(--fg);text-decoration:none}
footer.site a:hover{text-decoration:underline}
footer.site .legal{margin-top:24px;color:var(--muted)}
@media (max-width:640px){header.site .wrap{column-gap:12px}.brand{font-size:1.05rem}.actions .btn{padding:8px 14px;font-size:.9rem}nav.main{order:3;width:100%;overflow-x:auto;scrollbar-width:none}nav.main ul{flex-wrap:nowrap;gap:16px;padding-bottom:4px}nav.main li{white-space:nowrap}.actions .btn.ghost{display:none}main{padding-top:28px}}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
`;

const ORG_ID = `${SITE_URL}/#organization`;

function breadcrumbLd(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.href}`,
    })),
  };
}

function faqLd(faq) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a.replace(/<[^>]+>/g, '') },
    })),
  };
}

function renderFaq(faq, heading = 'Frequently asked questions') {
  if (!faq || !faq.length) return '';
  return `<section class="faq prose" aria-labelledby="faq-h"><h2 id="faq-h">${esc(heading)}</h2>
${faq.map((item) => `<h3>${esc(item.q)}</h3>\n<p>${item.a}</p>`).join('\n')}
</section>`;
}

const ctaBand = (heading = 'Build your resume now', text = 'Free to start. No credit card needed.') => `
<section class="band" aria-labelledby="cta-h">
  <h2 id="cta-h">${esc(heading)}</h2>
  <p>${esc(text)}</p>
  <div class="cta-row"><a class="btn primary" href="/register">Create a free account</a><a class="btn ghost" href="/login">Log in</a></div>
</section>`;

/**
 * @param {object} page
 * @param {string} page.path      e.g. "/pricing"
 * @param {string} page.title     <title>, ≤ 60 chars where possible
 * @param {string} page.description meta description
 * @param {string} page.h1
 * @param {string} [page.lede]    intro paragraph (plain text)
 * @param {string} page.body      HTML for the main content
 * @param {Array}  [page.faq]     [{q, a}] rendered at the end and as FAQPage JSON-LD
 * @param {string} [page.crumb]   breadcrumb label (defaults to h1)
 * @param {object[]} [page.extraLd] more JSON-LD nodes
 */
function renderPage(page) {
  const url = `${SITE_URL}${page.path}`;
  const crumbs = [{ name: 'Home', href: '/' }, { name: page.crumb || page.h1, href: page.path }];
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: 'en-IN',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': ORG_ID },
    },
    breadcrumbLd(crumbs),
    ...(page.faq && page.faq.length ? [faqLd(page.faq)] : []),
    ...(page.extraLd || []),
  ];

  const nav = NAV.map((item) => `<li><a href="${item.href}"${item.href === page.path ? ' aria-current="page"' : ''}>${esc(item.label)}</a></li>`).join('');
  const footerCols = FOOTER_COLUMNS.map((col) => `<div><h2>${esc(col.heading)}</h2><ul>${col.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul></div>`).join('');

  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#4F46E5">
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/resume-builder-logo-192-light.png">
<link rel="manifest" href="/manifest.json">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(BRAND_NAME)}">
<meta property="og:locale" content="en_IN">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${SITE_URL}/og/presmistique-og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${SITE_URL}/og/presmistique-og.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>
<style>${CSS.trim()}</style>
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<header class="site"><div class="wrap">
  <a class="brand" href="/" aria-label="${esc(BRAND_NAME)} home">
    <picture><source srcset="/resume-builder-logo-192-dark.png" media="(prefers-color-scheme: dark)"><img src="/resume-builder-logo-192-light.png" alt="" width="36" height="36"></picture>
    <span>${esc(BRAND_NAME)}</span>
  </a>
  <nav class="main" aria-label="Main"><ul>${nav}</ul></nav>
  <div class="actions"><a class="btn ghost" href="/login">Log in</a><a class="btn primary" href="/register">Get started free</a></div>
</div></header>
<main id="content"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.href}">${esc(c.name)}</a></li>`)).join('')}</ol></nav>
<h1>${esc(page.h1)}</h1>
${page.lede ? `<p class="lede">${esc(page.lede)}</p>` : ''}
${page.body}
${page.faqHidden ? '' : renderFaq(page.faq, page.faqHeading)}
${page.noCta ? '' : ctaBand(page.ctaHeading, page.ctaText)}
</div></main>
<footer class="site"><div class="wrap">
  <div class="cols">
    <div><h2>${esc(PRODUCT_NAME)}</h2><p>Build an ATS-friendly resume in your browser. Free templates and downloads, with optional pay-per-use AI tools.</p><p>Contact: <a href="mailto:${esc(SUPPORT_EMAIL)}">${esc(SUPPORT_EMAIL)}</a></p></div>
    ${footerCols}
  </div>
  <p class="legal">&copy; ${new Date().getFullYear()} ${esc(BRAND_NAME)}. All rights reserved.</p>
</div></footer>
</body>
</html>
`;
}

module.exports = { renderPage, esc, ctaBand, NAV, FOOTER_COLUMNS };
