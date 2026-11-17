// Per-route <title>, meta description, canonical URL and robots rules.
// Applied on every navigation by components/RouteSeo.js. public/index.html
// carries the home-page values for crawlers that don't run JavaScript, so
// keep DEFAULT_SEO in sync with it.
import { PUBLIC_ROUTES } from './routes';
import publicPages from './publicPages.json';

export const SITE_URL = 'https://presmistique.in';
const BRAND = 'Presmistique';

export const DEFAULT_SEO = {
  title: 'Free AI Resume Builder – ATS-Friendly Resumes | Presmistique',
  description:
    'Build an ATS-friendly resume for free with Presmistique. Free templates and PDF downloads, 5 free AI tokens on signup, and token packs from ₹49 with no subscription.',
};

// Public pages that search engines should index, keyed by path. Everything
// except home comes from publicPages.json, which marketing/build-static.js also
// reads to write per-route HTML for crawlers.
const INDEXABLE_PAGES = {
  [PUBLIC_ROUTES.HOME]: DEFAULT_SEO,
  ...Object.fromEntries(publicPages.pages.map((p) => [p.path, { title: p.title, description: p.description }])),
};

// Public pages that exist but should stay out of search results.
const NOINDEX_TITLES = {
  [PUBLIC_ROUTES.LOGIN]: 'Log in',
  [PUBLIC_ROUTES.REGISTER]: 'Sign up',
  [PUBLIC_ROUTES.ADMIN_LOGIN]: 'Admin login',
  [PUBLIC_ROUTES.UNAUTHORIZED]: 'Access denied',
  [PUBLIC_ROUTES.AUTH_CALLBACK]: 'Signing in',
  [PUBLIC_ROUTES.ERROR]: 'Something went wrong',
  [PUBLIC_ROUTES.NETWORK_TIMEOUT]: 'Network timeout',
};

const normalizePath = (pathname = '/') => {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.replace(/\/+$/, '');
  return pathname;
};

/**
 * SEO values for a path. App-only and unknown paths get noindex, so a URL that
 * doesn't exist never shows up in search as a copy of the home page.
 * @param {string} pathname
 * @param {{ knownRoute?: boolean }} [opts] knownRoute: the path matched an app route
 */
export function getSeoForPath(pathname, { knownRoute = true } = {}) {
  const path = normalizePath(pathname);

  if (INDEXABLE_PAGES[path]) {
    return { ...INDEXABLE_PAGES[path], canonical: `${SITE_URL}${path === '/' ? '/' : path}`, noindex: false };
  }

  if (!knownRoute) {
    return {
      title: `Page not found | ${BRAND}`,
      description: DEFAULT_SEO.description,
      canonical: null,
      noindex: true,
    };
  }

  const label = NOINDEX_TITLES[path];
  return {
    title: label ? `${label} | ${BRAND}` : BRAND,
    description: DEFAULT_SEO.description,
    canonical: null,
    noindex: true,
  };
}
