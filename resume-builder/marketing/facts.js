// Product facts used by the static marketing pages. Every claim on those pages
// should trace back to something here (or to the code it points at), so the
// pages never say something the app doesn't do.
const fs = require('fs');
const path = require('path');

// Token packs: the backend's single source of prices. The Pages build has the
// whole repository checked out, so the backend config is readable from here.
const { TOKEN_PACKS, CURRENCY } = require('../../backend/config/tokenPacks');

// Brand name and support email: read from the React app's brand.js so both stay
// identical. (brand.js is an ES module, so parse rather than require it.)
const brandSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'constants', 'brand.js'), 'utf8');
const pick = (name) => {
  const match = brandSource.match(new RegExp(`${name}\\s*=\\s*(?:[^'"]*\\|\\|\\s*)?'([^']+)'`));
  if (!match) throw new Error(`marketing/facts.js: could not read ${name} from src/constants/brand.js`);
  return match[1];
};

const SITE_URL = 'https://presmistique.in';
const BRAND_NAME = pick('BRAND_NAME');
const PRODUCT_NAME = pick('PRODUCT_NAME');
const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || pick('SUPPORT_EMAIL');

// backend/routes/auth.js gives every new account bonusTokens: 5.
const SIGNUP_TOKENS = 5;

// src/components/resume-list.js canCreateNewResume(): the dashboard allows up to 3 resumes.
const MAX_RESUMES = 3;

// backend/routes/uploads.js and routes/ai.js: 10 MB, PDF or Word (.docx).
const MAX_UPLOAD_MB = 10;

// backend/utils/aiPrompts.js ATS_CATEGORY_MAX: the ATS score is out of 100.
const ATS_CATEGORIES = [
  { name: 'Keyword and skill match', points: 40, detail: 'Required and preferred skills and keywords from the job description that appear in your resume.' },
  { name: 'Experience alignment', points: 20, detail: 'How closely your roles and responsibilities line up with what the job asks for.' },
  { name: 'Section completeness', points: 15, detail: 'Whether the sections recruiters and ATS software expect are present and filled in.' },
  { name: 'Project impact', points: 10, detail: 'Whether your projects and achievements show results, not just tasks.' },
  { name: 'Formatting', points: 10, detail: 'Things that make a resume hard for an ATS to read, such as missing contact details or unusual section names.' },
  { name: 'Bonus skills', points: 5, detail: 'Useful extra skills beyond the core requirements.' },
];

const templates = require('./data/templates.json');
const TEMPLATE_COUNT_FLOOR = Math.floor(templates.length / 10) * 10; // "20+" while there are 20–29

const formatInr = (amount) => `₹${amount.toLocaleString('en-IN')}`;

const packs = TOKEN_PACKS.map((pack) => {
  const tokens = pack.tokens + (pack.bonus || 0);
  return {
    id: pack.id,
    tokens,
    price: pack.price,
    priceLabel: formatInr(pack.price),
    perToken: `₹${(pack.price / tokens).toFixed(2)}`,
    popular: Boolean(pack.popular),
  };
});

const cheapestPack = packs.reduce((a, b) => (a.price <= b.price ? a : b));

module.exports = {
  SITE_URL,
  BRAND_NAME,
  PRODUCT_NAME,
  SUPPORT_EMAIL,
  SIGNUP_TOKENS,
  MAX_RESUMES,
  MAX_UPLOAD_MB,
  ATS_CATEGORIES,
  CURRENCY,
  packs,
  cheapestPack,
  templates,
  TEMPLATE_COUNT_FLOOR,
  formatInr,
};
