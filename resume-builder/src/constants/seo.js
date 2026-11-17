// Per-route <title>, meta description, canonical URL and robots rules.
// Applied on every navigation by components/RouteSeo.js. public/index.html
// carries the home-page values for crawlers that don't run JavaScript, so
// keep DEFAULT_SEO in sync with it.
import { PUBLIC_ROUTES } from './routes';

export const SITE_URL = 'https://presmistique.in';
const BRAND = 'Presmistique';

export const DEFAULT_SEO = {
  title: 'Free AI Resume Builder – ATS-Friendly Resumes | Presmistique',
  description:
    'Build an ATS-friendly resume for free with Presmistique. Free templates and PDF downloads, 5 free AI tokens on signup, and token packs from ₹49 with no subscription.',
};

// Public pages that search engines should index, keyed by path.
const INDEXABLE_PAGES = {
  [PUBLIC_ROUTES.HOME]: DEFAULT_SEO,
  [PUBLIC_ROUTES.BYOK]: {
    title: 'Use Your Own Gemini API Key for AI Resume Writing | Presmistique',
    description:
      'Connect your own free Google Gemini API key to Presmistique and use AI resume writing, rewriting and ATS analysis without buying tokens.',
  },
  [PUBLIC_ROUTES.CONTACT_US]: {
    title: `Contact Us | ${BRAND}`,
    description: `Questions about your resume, tokens or payments? Contact the ${BRAND} AI Resume Builder support team.`,
  },
  [PUBLIC_ROUTES.PRIVACY_POLICY]: {
    title: `Privacy Policy | ${BRAND}`,
    description: `How ${BRAND} collects, uses and protects your account details and resume data.`,
  },
  [PUBLIC_ROUTES.TERMS_CONDITIONS]: {
    title: `Terms and Conditions | ${BRAND}`,
    description: `The terms that apply when you use the ${BRAND} AI Resume Builder, AI tokens and paid token packs.`,
  },
  [PUBLIC_ROUTES.CANCELLATION_REFUNDS]: {
    title: `Cancellation and Refund Policy | ${BRAND}`,
    description: `When ${BRAND} refunds token-pack payments, and how to raise a refund request.`,
  },
  [PUBLIC_ROUTES.SHIPPING]: {
    title: `Shipping and Delivery Policy | ${BRAND}`,
    description: `${BRAND} sells digital AI tokens. Here is how and when purchased tokens are delivered to your account.`,
  },
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
