/**
 * Resume payload validation shared by the resume create/update routes.
 *
 * The resume form (resume-builder/src/utils/resumeValidation.js) mirrors these
 * rules so the client never enables Save for data the server will reject.
 * If you change a rule or limit here, change it there too.
 *
 * Pipeline used by the routes:
 *   normalizeResumeBody  -> trims strings, strips blank rows, normalizes dates/enums
 *   resume*Rules         -> express-validator rules for the top-level fields
 *   rejectInvalidResume  -> 400 with field-level errors if any rule failed
 *   Mongoose schema      -> nested rules; failures go through sendResumeError
 */
const { body, validationResult } = require('express-validator');

// Same limits as models/Resume.js. Keep both files in sync.
const LIMITS = {
  title: 100,
  fullName: 100,
  phone: 20,
  address: 200,
  url: 200,
  jobTitle: 100,
  company: 100,
  location: 100,
  degree: 100,
  institution: 100,
  longText: 10000,
  achievement: 500,
  skillCategory: 500,
  skillName: 500,
  projectName: 100,
  technology: 50,
  achievementTitle: 200,
  issuer: 100,
  certName: 100,
  credentialId: 100,
  languageName: 50,
  customFieldTitle: 100
};

// RFC 5321 caps a forward path at 254 characters. Check this BEFORE any regex
// so a huge string never reaches the pattern.
const EMAIL_MAX_LENGTH = 254;

// Permissive: one "@", no spaces, dot-separated domain labels, TLD of 2+ chars.
// Allows plus-addressing and long TLDs (.info, .technology).
// Linear time: the domain labels exclude "." so they can't overlap with the
// separators. The earlier pattern backtracked quadratically: about 1 s on
// a 50 KB input, 16 s on 100 KB.
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;

const isValidEmail = (value) =>
  typeof value === 'string' && value.length <= EMAIL_MAX_LENGTH && EMAIL_REGEX.test(value);

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const LANGUAGE_PROFICIENCIES = ['basic', 'conversational', 'fluent', 'native'];
const CUSTOM_FIELD_TYPES = ['text', 'list', 'date'];

// Common wording (LinkedIn/ILR scales, AI resume parsing) mapped onto the stored enum.
const PROFICIENCY_SYNONYMS = {
  beginner: 'basic',
  elementary: 'basic',
  'elementary proficiency': 'basic',
  limited: 'basic',
  intermediate: 'conversational',
  working: 'conversational',
  'limited working': 'conversational',
  'limited working proficiency': 'conversational',
  'professional working': 'fluent',
  'professional working proficiency': 'fluent',
  professional: 'fluent',
  'full professional': 'fluent',
  'full professional proficiency': 'fluent',
  advanced: 'fluent',
  proficient: 'fluent',
  expert: 'fluent',
  bilingual: 'native',
  'native or bilingual': 'native',
  'native or bilingual proficiency': 'native',
  'mother tongue': 'native'
};

const SKILL_LEVEL_SYNONYMS = {
  basic: 'beginner',
  novice: 'beginner',
  elementary: 'beginner',
  medium: 'intermediate',
  proficient: 'advanced',
  experienced: 'advanced',
  master: 'expert'
};

const PRESENT_TOKENS = new Set(['present', 'current', 'currently', 'now', 'ongoing', 'till date', 'to date', 'today']);

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12
};

// Input length caps so the parsers below only ever see short strings.
const MAX_DATE_INPUT = 40;
const MAX_GPA_INPUT = 20;

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

const isBlank = (value) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const isPresentToken = (value) =>
  typeof value === 'string' && PRESENT_TOKENS.has(value.trim().toLowerCase());

const monthNumber = (name) =>
  MONTHS[name.slice(0, 4).toLowerCase()] || MONTHS[name.slice(0, 3).toLowerCase()];

// Each entry: [pattern, build(match) -> "YYYY-MM-DD" or null to keep looking].
const DATE_PATTERNS = [
  // 2021-03-15, 2021-03-15T00:00:00.000Z
  [/^(\d{4})-(\d{1,2})-(\d{1,2})(?:T.*)?$/, (m) => isoDate(m[1], +m[2], +m[3])],
  // 2021-03, 2021/03
  [/^(\d{4})[-/](\d{1,2})$/, (m) => isoDate(m[1], +m[2], 1)],
  // 03/2021, 3-2021
  [/^(\d{1,2})[-/](\d{4})$/, (m) => isoDate(m[2], +m[1], 1)],
  // 2021
  [/^(\d{4})$/, (m) => isoDate(m[1], 1, 1)],
  // Mar 2021, March 2021, Mar. 2021, Mar-2021
  [/^([A-Za-z]{3,9})\.?[\s,-]+(\d{4})$/, (m) => {
    const month = monthNumber(m[1]);
    return month ? isoDate(m[2], month, 1) : null;
  }]
];

const parseKnownDateFormat = (v) => {
  for (const [pattern, build] of DATE_PATTERNS) {
    const match = pattern.exec(v);
    const result = match ? build(match) : null;
    if (result) return result;
  }
  return null;
};

/**
 * Turn the date shapes the form and the resume parser produce into "YYYY-MM-DD".
 * Returns null for blank/"Present", or the original value when it can't be parsed
 * (Mongoose then reports it as an invalid date for that exact field).
 */
const normalizeDate = (value) => {
  if (isBlank(value) || isPresentToken(value)) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? value : value.toISOString().slice(0, 10);
  if (typeof value !== 'string') return value;

  const v = value.trim();
  // Real dates are short; leave anything long for the schema to reject as invalid.
  if (v.length > MAX_DATE_INPUT) return value;
  const known = parseKnownDateFormat(v);
  if (known) return known;
  const parsed = new Date(v);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return value;
};

const normalizeEnum = (value, allowed, synonyms) => {
  if (isBlank(value)) return undefined; // let the schema default apply
  if (typeof value !== 'string') return value;
  const key = value.trim().toLowerCase();
  if (allowed.includes(key)) return key;
  if (synonyms[key]) return synonyms[key];
  return value.trim(); // unknown value: the schema rejects it with a clear message
};

const DECIMAL_RE = /^\d+(?:\.\d+)?$/;

// "8.5", 8.5, "8.5/10", "85%" -> number. Blank -> undefined. Anything else is left for the schema.
const normalizeGpa = (value) => {
  if (isBlank(value)) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;
  if (value.length > MAX_GPA_INPUT) return value;
  let number = value.trim();
  if (number.endsWith('%')) {
    number = number.slice(0, -1).trim();
  } else if (number.includes('/')) {
    const slash = number.indexOf('/');
    const scale = number.slice(slash + 1).trim();
    if (!DECIMAL_RE.test(scale)) return value;
    number = number.slice(0, slash).trim();
  }
  return DECIMAL_RE.test(number) ? Number(number) : value;
};

const trimDeep = (value) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(trimDeep);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    Object.keys(value).forEach((k) => { out[k] = trimDeep(value[k]); });
    return out;
  }
  return value;
};

const cleanStringList = (list) =>
  Array.isArray(list) ? list.filter((s) => typeof s === 'string' && s.trim() !== '') : list;

// A row is blank when none of its user-entered fields has content.
// Flags and dropdown defaults (isCurrentJob, level, proficiency, type) don't count.
const hasContent = (entry, fields) =>
  entry && typeof entry === 'object' && fields.some((f) => {
    const v = entry[f];
    return Array.isArray(v) ? v.some((x) => !isBlank(x)) : !isBlank(v);
  });

const CONTENT_FIELDS = {
  workExperience: ['jobTitle', 'company', 'location', 'startDate', 'endDate', 'description', 'achievements'],
  education: ['degree', 'institution', 'location', 'startDate', 'endDate', 'gpa', 'description'],
  projects: ['name', 'description', 'technologies', 'url', 'githubUrl', 'startDate', 'endDate'],
  achievements: ['title', 'description', 'date', 'issuer'],
  certifications: ['name', 'issuer', 'date', 'expiryDate', 'credentialId', 'url'],
  languages: ['name'],
  customFields: ['title', 'content']
};

const keepRows = (list, section) =>
  Array.isArray(list) ? list.filter((row) => hasContent(row, CONTENT_FIELDS[section])) : list;

// Set an enum field, or drop it when blank so the schema default applies.
const withEnum = (row, field, allowed, synonyms) => {
  const out = { ...row, [field]: normalizeEnum(row[field], allowed, synonyms) };
  if (out[field] === undefined) delete out[field];
  return out;
};

const normalizePersonalInfo = (personalInfo) => {
  const pi = trimDeep(personalInfo);
  Object.keys(pi).forEach((k) => { if (pi[k] === null) pi[k] = ''; });
  if (typeof pi.email === 'string') pi.email = pi.email.toLowerCase();
  return pi;
};

const normalizeWorkRow = (exp) => {
  const out = { ...exp };
  if (isPresentToken(exp.endDate)) out.isCurrentJob = true;
  out.startDate = normalizeDate(exp.startDate);
  out.endDate = out.isCurrentJob ? null : normalizeDate(exp.endDate);
  out.achievements = cleanStringList(exp.achievements);
  return out;
};

const normalizeEducationRow = (edu) => {
  const out = { ...edu };
  if (isPresentToken(edu.endDate)) out.isCurrentlyStudying = true;
  out.startDate = normalizeDate(edu.startDate);
  out.endDate = out.isCurrentlyStudying ? null : normalizeDate(edu.endDate);
  out.gpa = normalizeGpa(edu.gpa);
  if (out.gpa === undefined) delete out.gpa;
  return out;
};

const normalizeSkillCategory = (cat) => {
  if (!cat || typeof cat !== 'object') return cat;
  if (!Array.isArray(cat.items)) return cat;
  const items = cat.items
    .filter((item) => item && !isBlank(item.name))
    .map((item) => withEnum(item, 'level', SKILL_LEVELS, SKILL_LEVEL_SYNONYMS));
  return { ...cat, items };
};

const hasSkillContent = (cat) =>
  cat && (!isBlank(cat.category) || (Array.isArray(cat.items) && cat.items.length > 0));

// Row-based sections: blank rows are dropped, then each row is normalized.
const ROW_NORMALIZERS = {
  workExperience: normalizeWorkRow,
  education: normalizeEducationRow,
  projects: (p) => ({
    ...p,
    technologies: cleanStringList(p.technologies),
    startDate: normalizeDate(p.startDate),
    endDate: normalizeDate(p.endDate)
  }),
  achievements: (a) => ({ ...a, date: normalizeDate(a.date) }),
  certifications: (c) => ({ ...c, date: normalizeDate(c.date), expiryDate: normalizeDate(c.expiryDate) }),
  languages: (l) => withEnum(l, 'proficiency', LANGUAGE_PROFICIENCIES, PROFICIENCY_SYNONYMS),
  customFields: (f) => withEnum(f, 'type', CUSTOM_FIELD_TYPES, {})
};

/**
 * Returns a normalized copy of the resume content in `body`. Only touches the
 * resume content fields; anything else (resumeId, templateId, styling) is passed through.
 */
const normalizeResumePayload = (input) => {
  if (!input || typeof input !== 'object') return input;
  const data = { ...input };

  if (typeof data.title === 'string') data.title = data.title.trim();
  if (typeof data.summary === 'string') data.summary = data.summary.trim();
  if (data.personalInfo && typeof data.personalInfo === 'object') {
    data.personalInfo = normalizePersonalInfo(data.personalInfo);
  }

  // Freshers have no work experience; the model clears it on save anyway, so
  // don't let leftover rows fail validation first.
  if (data.isFresher === true && data.workExperience !== undefined) data.workExperience = [];

  Object.entries(ROW_NORMALIZERS).forEach(([section, normalizeRow]) => {
    if (Array.isArray(data[section])) {
      data[section] = keepRows(trimDeep(data[section]), section).map(normalizeRow);
    }
  });

  if (Array.isArray(data.skills)) {
    data.skills = trimDeep(data.skills).map(normalizeSkillCategory).filter(hasSkillContent);
  }

  return data;
};

// Express middleware: normalize before the validators run.
const normalizeResumeBody = (req, res, next) => {
  req.body = normalizeResumePayload(req.body || {});
  next();
};

const emailRule = (chain) => chain
  .trim()
  .notEmpty().withMessage('Email is required')
  .bail()
  .isLength({ max: EMAIL_MAX_LENGTH }).withMessage(`Email cannot exceed ${EMAIL_MAX_LENGTH} characters`)
  .bail()
  .matches(EMAIL_REGEX).withMessage('Please provide a valid email');

// Create (and the form's first save): title, name and email are the only required fields.
const resumeCreateRules = [
  body('title').trim()
    .notEmpty().withMessage('Resume title is required').bail()
    .isLength({ max: LIMITS.title }).withMessage(`Title cannot exceed ${LIMITS.title} characters`),
  body('personalInfo.fullName').trim()
    .notEmpty().withMessage('Full name is required').bail()
    .isLength({ max: LIMITS.fullName }).withMessage(`Full name cannot exceed ${LIMITS.fullName} characters`),
  emailRule(body('personalInfo.email'))
];

// Update / auto-save: the same fields, but only checked when present.
const resumeUpdateRules = [
  body('title').optional().trim()
    .notEmpty().withMessage('Resume title is required').bail()
    .isLength({ max: LIMITS.title }).withMessage(`Title cannot exceed ${LIMITS.title} characters`),
  body('personalInfo.fullName').optional().trim()
    .notEmpty().withMessage('Full name is required').bail()
    .isLength({ max: LIMITS.fullName }).withMessage(`Full name cannot exceed ${LIMITS.fullName} characters`),
  emailRule(body('personalInfo.email').optional())
];

const FIELD_LABELS = {
  startDate: 'start date',
  endDate: 'end date',
  date: 'date',
  expiryDate: 'expiry date',
  gpa: 'GPA'
};

/** Mongoose ValidationError -> [{ field: 'education.0.endDate', message }] */
const formatMongooseErrors = (error) => {
  if (!error?.errors) return [];
  return Object.keys(error.errors)
    // A failing subdocument also reports the parent array path; keep only the leaf errors.
    .filter((key) => !Object.keys(error.errors).some((other) => other !== key && other.startsWith(`${key}.`)))
    .map((key) => {
      const err = error.errors[key];
      const leaf = key.split('.').pop();
      let message = err.message;
      if (err.name === 'CastError' || err.kind === 'date' || err.kind === 'Number') {
        if (err.kind === 'date' || err.kind === 'Date') message = `Enter a valid ${FIELD_LABELS[leaf] || 'date'}`;
        else if (err.kind === 'Number') message = `${FIELD_LABELS[leaf] || 'Value'} must be a number`;
        else message = `Invalid value for ${FIELD_LABELS[leaf] || leaf}`;
      } else if (err.kind === 'enum') {
        message = `Choose one of: ${(err.properties?.enumValues || []).join(', ')}`;
      }
      return { field: key, message };
    });
};

/** express-validator result -> [{ field, message }] (first error per field) */
const formatRuleErrors = (result) => {
  const seen = new Set();
  return result.array()
    .filter((e) => {
      const key = e.path || e.param;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((e) => ({ field: e.path || e.param, message: e.msg }));
};

const validationResponse = (fieldErrors) => {
  const errors = fieldErrors.map(({ field, message }) => ({
    field,
    message,
    // express-validator style keys, kept for older clients
    path: field,
    msg: message
  }));
  const first = errors[0];
  const which = errors.length === 1 ? 'this field' : errors.length + ' fields';
  return {
    success: false,
    error: first ? `Please fix ${which}: ${first.message}` : 'Validation failed',
    errors,
    details: errors
  };
};

// Express middleware: stop with field-level errors if any rule failed.
const rejectInvalidResume = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(400).json(validationResponse(formatRuleErrors(result)));
};

/**
 * Error handler for resume saves. Returns true if it sent a 400 for a
 * validation/cast error, false otherwise (caller sends its own 500).
 */
const sendResumeValidationError = (error, res) => {
  if (error?.name === 'ValidationError') {
    res.status(400).json(validationResponse(formatMongooseErrors(error)));
    return true;
  }
  if (error?.name === 'CastError') {
    const field = error.path || 'unknown';
    res.status(400).json(validationResponse([{ field, message: `Invalid value for ${field}` }]));
    return true;
  }
  return false;
};

module.exports = {
  LIMITS,
  EMAIL_REGEX,
  EMAIL_MAX_LENGTH,
  isValidEmail,
  SKILL_LEVELS,
  LANGUAGE_PROFICIENCIES,
  normalizeDate,
  normalizeGpa,
  normalizeResumePayload,
  normalizeResumeBody,
  resumeCreateRules,
  resumeUpdateRules,
  rejectInvalidResume,
  formatMongooseErrors,
  formatRuleErrors,
  validationResponse,
  sendResumeValidationError
};
