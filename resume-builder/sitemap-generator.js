// Writes public/sitemap.xml before every build (npm "prebuild").
// List only public pages that should be indexed; keep it in step with
// INDEXABLE_PAGES in src/constants/seo.js.
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');

const hostname = 'https://presmistique.in';

const links = [
  { url: '/' },
  { url: '/byok' },
  { url: '/contact-us' },
  { url: '/privacy-policy' },
  { url: '/terms-conditions' },
  { url: '/cancellation-refunds' },
  { url: '/shipping' },
];

const out = path.join(__dirname, 'public', 'sitemap.xml');

streamToPromise(Readable.from(links).pipe(new SitemapStream({ hostname })))
  .then((data) => {
    fs.writeFileSync(out, data.toString());
    console.log(`Sitemap written to ${out} (${links.length} URLs)`);
  })
  .catch((error) => {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  });
