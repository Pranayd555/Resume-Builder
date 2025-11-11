const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');

// List of your public routes
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/privacy-policy', changefreq: 'monthly', priority: 0.7 },
  { url: '/terms-conditions', changefreq: 'monthly', priority: 0.7 },
  { url: '/cancellation-refunds', changefreq: 'monthly', priority: 0.7 },
  { url: '/shipping', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact-us', changefreq: 'monthly', priority: 0.7 },
];

// Your website's base URL
const hostname = 'https://resume-builder-dev-pranay-das.vercel.app'; // <-- IMPORTANT: Replace with your actual URL

// Create a stream to write to
const stream = new SitemapStream({ hostname });

// Write the sitemap to a file
streamToPromise(Readable.from(links).pipe(stream))
  .then((data) => {
    fs.writeFileSync('./public/sitemap.xml', data.toString());
    console.log('Sitemap generated successfully at ./public/sitemap.xml');
  })
  .catch((error) => {
    console.error('Error generating sitemap:', error);
  });
