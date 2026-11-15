/**
 * Input builders and result normalisers for the ATS features and pro templates.
 *
 * The model's answer is never passed through as-is:
 *   - ATS scores are clamped to each category's range and the overall score
 *     is their sum (the model's own total was often inconsistent).
 *   - Rewritten descriptions are matched back to the original items by index,
 *     cleaned, and fitted to the field's length budget. Items the model skipped
 *     or returned empty keep their original text, so nothing is lost or shifted
 *     onto the wrong job.
 *   - Skill suggestions are added to the existing skills, never replacing them.
 */
const xss = require('xss');
const { ATS_CATEGORY_MAX } = require('./aiPrompts');
const { budgetFor, finalizeRichText, finalizePlainText, htmlToPlainText, stripCodeFences, stripPreamble } = require('./aiOutput');

const MAX_JOB_DESCRIPTION_CHARS = 15000;
const MAX_LIST_ITEMS = 6;
const MAX_LIST_ITEM_CHARS = 240;
const MAX_KEYWORDS = 15;
const MAX_KEYWORD_CHARS = 60;
const MAX_NEW_SKILLS = 15;
const MAX_SKILL_CHARS = 50;

const asArray = (v) => (Array.isArray(v) ? v : []);
const text = (v) => (typeof v === 'string' ? v.trim() : '');

// ---------------------------------------------------------------------------
// ATS
// ---------------------------------------------------------------------------

const dateLabel = (start, end, current) => {
  const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 7) : '');
  const from = fmt(start);
  const to = current ? 'Present' : fmt(end);
  return [from, to].filter(Boolean).join(' – ');
};

const line = (...parts) => parts.filter(Boolean).join(' | ');

const section = (title, rows) => (rows.length ? `## ${title}\n${rows.join('\n')}` : '');

/**
 * The resume as compact plain text for the ATS prompt. Contact details are
 * reduced to "present / missing" so personal data is not sent to the model.
 */
const buildAtsResumeText = (resume) => {
  const pi = resume.personalInfo || {};
  const contact = ['email', 'phone', 'address', 'linkedin', 'github', 'website']
    .map((k) => `${k}: ${text(pi[k]) ? 'present' : 'missing'}`).join(', ');
  const work = asArray(resume.workExperience).map((e) => `- ${line(e.jobTitle, e.company, e.location, dateLabel(e.startDate, e.endDate, e.isCurrentJob))}\n  ${htmlToPlainText(e.description)}`);
  const education = asArray(resume.education).map((e) => `- ${line(e.degree, e.institution, dateLabel(e.startDate, e.endDate, e.isCurrentlyStudying), e.gpa ? `GPA ${e.gpa}` : '')} ${htmlToPlainText(e.description)}`.trim());
  const skills = asArray(resume.skills).map((c) => `- ${text(c.category)}: ${asArray(c.items).map((i) => text(i?.name)).filter(Boolean).join(', ')}`);
  const projects = asArray(resume.projects).map((p) => `- ${line(p.name, asArray(p.technologies).join(', '))}\n  ${htmlToPlainText(p.description)}`);
  const certs = asArray(resume.certifications).map((c) => `- ${line(c.name, c.issuer)}`);
  const awards = asArray(resume.achievements).map((a) => `- ${line(a.title, a.issuer)} ${htmlToPlainText(a.description)}`.trim());
  const languages = asArray(resume.languages).map((l) => `- ${line(l.name, l.proficiency)}`);
  return [
    `Resume title: ${text(resume.title)}`,
    `Contact details: ${contact}`,
    section('Summary', resume.summary ? [htmlToPlainText(resume.summary)] : []),
    section('Work experience', work),
    section('Education', education),
    section('Skills', skills),
    section('Projects', projects),
    section('Certifications', certs),
    section('Achievements', awards),
    section('Languages', languages)
  ].filter(Boolean).join('\n\n');
};

const clampScore = (value, max) => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), max);
};

const cleanList = (list, maxItems, maxChars) => {
  const seen = new Set();
  const out = [];
  for (const item of asArray(list)) {
    const value = finalizePlainText(item, maxChars);
    const key = value.toLowerCase();
    if (value && !seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
    if (out.length >= maxItems) break;
  }
  return out;
};

/** Model output -> stored ATS analysis (within the Resume schema's ranges). */
const normalizeAtsAnalysis = (raw) => {
  const scores = raw?.category_scores && typeof raw.category_scores === 'object' ? raw.category_scores : {};
  const category_scores = {};
  for (const [key, max] of Object.entries(ATS_CATEGORY_MAX)) category_scores[key] = clampScore(scores[key], max);
  return {
    overall_score: Object.values(category_scores).reduce((a, b) => a + b, 0),
    category_scores,
    missing_keywords: cleanList(raw?.missing_keywords, MAX_KEYWORDS, MAX_KEYWORD_CHARS),
    strengths: cleanList(raw?.strengths, MAX_LIST_ITEMS, MAX_LIST_ITEM_CHARS),
    weaknesses: cleanList(raw?.weaknesses, MAX_LIST_ITEMS, MAX_LIST_ITEM_CHARS),
    ats_warnings: cleanList(raw?.ats_warnings, MAX_LIST_ITEMS, MAX_LIST_ITEM_CHARS),
    recommendations: cleanList(raw?.recommendations, MAX_LIST_ITEMS, MAX_LIST_ITEM_CHARS)
  };
};

/** A model answer with no scores at all is a failed answer, not a score of 0. */
const hasAtsScores = (raw) => {
  const scores = raw?.category_scores;
  return Boolean(scores) && Object.keys(ATS_CATEGORY_MAX).some((k) => Number.isFinite(Number(scores[k])));
};

const trimJobDescription = (value) => text(value).slice(0, MAX_JOB_DESCRIPTION_CHARS);

// ---------------------------------------------------------------------------
// Adjust tone / enhance keywords
// ---------------------------------------------------------------------------

// Request section name -> output-budget field.
const SECTION_FIELDS = {
  workExperience: 'workExperience',
  projects: 'projects',
  education: 'education',
  achievements: 'achievements'
};

const LABEL_KEYS = {
  workExperience: ['jobTitle', 'company'],
  projects: ['name', 'technologies'],
  education: ['degree', 'institution'],
  achievements: ['title']
};

const labelFor = (sectionName, item) => LABEL_KEYS[sectionName]
  .map((k) => (Array.isArray(item[k]) ? item[k].join(', ') : text(item[k])))
  .filter(Boolean)
  .join(' | ');

/** Items with a description, tagged with their position in the original list. */
const indexedItems = (sectionName, items) => asArray(items)
  .map((item, index) => ({ item, index }))
  .filter(({ item }) => item && typeof item === 'object' && htmlToPlainText(item.description))
  .map(({ item, index }) => ({ index, label: labelFor(sectionName, item), description: String(item.description) }));

/**
 * The model's input for a rewrite across sections, and the per-section budgets.
 * `sections` lists which sections to include.
 */
const buildRewriteInput = (resumeJson, sections) => {
  const input = {};
  const budgets = {};
  if (sections.includes('summary') && htmlToPlainText(resumeJson.summary)) {
    input.summary = String(resumeJson.summary);
    budgets.summary = budgetFor('summary', resumeJson.summary);
  }
  for (const name of Object.keys(SECTION_FIELDS)) {
    if (!sections.includes(name)) continue;
    const items = indexedItems(name, resumeJson[name]);
    if (!items.length) continue;
    input[name] = items;
    const longest = items.reduce((a, b) => (htmlToPlainText(b.description).length > htmlToPlainText(a.description).length ? b : a));
    budgets[name] = budgetFor(SECTION_FIELDS[name], longest.description);
  }
  return { input, budgets };
};

const hasInput = (input) => Object.keys(input).length > 0;

/**
 * Put rewritten descriptions back on the original items (same index).
 * Returns the full original list with only `description` changed.
 */
const mergeDescriptions = (sectionName, originals, rewrites) => {
  const byIndex = new Map();
  for (const r of asArray(rewrites)) {
    const index = Number(r?.index);
    if (Number.isInteger(index) && typeof r.description === 'string') byIndex.set(index, r.description);
  }
  let changed = 0;
  const merged = asArray(originals).map((item, index) => {
    if (!byIndex.has(index) || !item || typeof item !== 'object') return item;
    const html = finalizeRichText(byIndex.get(index), budgetFor(SECTION_FIELDS[sectionName], item.description));
    if (!html) return item;
    changed += 1;
    return { ...item, description: html };
  });
  return { merged, changed };
};

/** Adjust-tone answer -> { summary, workExperience, projects, education, achievements } aligned with the request. */
const mergeToneResult = (resumeJson, ai, sections) => {
  const out = {};
  let changed = 0;
  if (sections.includes('summary')) {
    const summary = finalizeRichText(text(ai?.summary), budgetFor('summary', resumeJson.summary));
    out.summary = summary || resumeJson.summary || '';
    if (summary) changed += 1;
  }
  for (const name of Object.keys(SECTION_FIELDS)) {
    if (!sections.includes(name) || !Array.isArray(resumeJson[name])) continue;
    const result = mergeDescriptions(name, resumeJson[name], ai?.[name]);
    out[name] = result.merged;
    changed += result.changed;
  }
  return { data: out, changed };
};

const SKILL_LEVEL_DEFAULT = 'intermediate';

/** Add suggested skills to the existing ones: existing categories and items are kept as they are. */
const mergeSkills = (existing, suggestions) => {
  const categories = asArray(existing).map((c) => ({
    ...c,
    items: asArray(c.items).map((i) => ({ ...i }))
  }));
  const known = new Set(categories.flatMap((c) => c.items.map((i) => text(i.name).toLowerCase())));
  let added = 0;
  for (const suggestion of asArray(suggestions)) {
    const categoryName = finalizePlainText(suggestion?.category, 100) || 'Skills';
    let category = categories.find((c) => text(c.category).toLowerCase() === categoryName.toLowerCase());
    for (const rawName of asArray(suggestion?.items)) {
      const name = finalizePlainText(rawName, 0);
      if (!name || name.length > MAX_SKILL_CHARS || known.has(name.toLowerCase()) || added >= MAX_NEW_SKILLS) continue;
      if (!category) {
        category = { category: categoryName, items: [] };
        categories.push(category);
      }
      category.items.push({ name, level: SKILL_LEVEL_DEFAULT });
      known.add(name.toLowerCase());
      added += 1;
    }
  }
  return { skills: categories.filter((c) => c.items.length), added };
};

/** Keyword answer -> { workExperience, projects, education, skills } aligned with the request. */
const mergeKeywordResult = (resumeJson, ai, sections) => {
  const out = {};
  let changed = 0;
  for (const name of ['workExperience', 'projects', 'education']) {
    if (!sections.includes(name) || !Array.isArray(resumeJson[name])) continue;
    const result = mergeDescriptions(name, resumeJson[name], ai?.[name]);
    out[name] = result.merged;
    changed += result.changed;
  }
  if (sections.includes('skills')) {
    const { skills, added } = mergeSkills(resumeJson.skills, ai?.newSkills);
    out.skills = skills;
    changed += added;
  }
  return { data: out, changed };
};

// ---------------------------------------------------------------------------
// Pro templates
// ---------------------------------------------------------------------------

const MAX_TEMPLATE_CHARS = 60000;
const TEMPLATE_TAGS = ['div', 'span', 'section', 'header', 'footer', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 'small', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'a'];
const TEMPLATE_ATTRS = ['style', 'class', 'colspan', 'rowspan', 'align', 'width'];

const TEMPLATE_FILTER = new xss.FilterXSS({
  whiteList: Object.fromEntries(TEMPLATE_TAGS.map((tag) => [tag, tag === 'a' ? [...TEMPLATE_ATTRS, 'href'] : TEMPLATE_ATTRS])),
  css: false, // keep inline styles as written (the template relies on them)
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'head', 'title']
});

/**
 * Clean a generated template: no fences or chatter, no scripts or event
 * handlers, and nothing past the size limit. Throws if no HTML is left.
 */
const sanitizeTemplateHtml = (raw) => {
  const stripped = stripPreamble(stripCodeFences(raw));
  const start = stripped.indexOf('<');
  const html = TEMPLATE_FILTER.process(start > 0 ? stripped.slice(start) : stripped)
    .replace(/url\(\s*['"]?\s*javascript:[^)]*\)/gi, 'none')
    .trim();
  if (!html.startsWith('<')) return '';
  return html.length > MAX_TEMPLATE_CHARS ? html.slice(0, html.lastIndexOf('>', MAX_TEMPLATE_CHARS) + 1) : html;
};

module.exports = {
  MAX_JOB_DESCRIPTION_CHARS,
  buildAtsResumeText,
  normalizeAtsAnalysis,
  hasAtsScores,
  trimJobDescription,
  buildRewriteInput,
  hasInput,
  mergeDescriptions,
  mergeToneResult,
  mergeSkills,
  mergeKeywordResult,
  sanitizeTemplateHtml
};
