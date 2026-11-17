// Shared setup for guide pages: URL under /guides, breadcrumb through the
// guides index, and Article structured data.
const { SITE_URL, BRAND_NAME } = require('../../facts');

// Bump when a guide's content changes meaningfully.
const GUIDES_UPDATED = '2026-11-17';
const withTz = (date) => `${date}T00:00:00+05:30`;

function guide(page) {
  const path = `/guides/${page.slug}`;
  return {
    ...page,
    path,
    title: `${page.title} | ${BRAND_NAME}`,
    parents: [{ name: 'Guides', href: '/guides' }],
    ctaHeading: page.ctaHeading || 'Put it into practice',
    ctaText: page.ctaText || 'Build your resume with a guided form and free templates. No credit card needed.',
    extraLd: [
      {
        '@type': 'Article',
        '@id': `${SITE_URL}${path}#article`,
        headline: page.h1,
        description: page.description,
        datePublished: withTz(page.published || GUIDES_UPDATED),
        dateModified: withTz(GUIDES_UPDATED),
        inLanguage: 'en-IN',
        mainEntityOfPage: `${SITE_URL}${path}`,
        author: { '@id': `${SITE_URL}/#organization` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        image: `${SITE_URL}/og/presmistique-og.jpg`,
      },
    ],
  };
}

module.exports = { guide, GUIDES_UPDATED };
