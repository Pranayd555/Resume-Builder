/**
 * Client-side mirror of the server's resume save rules
 * (backend/utils/resumeValidation.js + backend/models/Resume.js).
 *
 * The form must never enable Save for data the server rejects, so every rule
 * and limit here matches the server. If you change one side, change the other.
 *
 * Form error keys follow the form's existing convention:
 *   title, fullName, email, phone, address, website, linkedin, github
 *   <section>_<index>_<field>          e.g. education_0_endDate
 *   <section>_<index>_dateRange        end date before start date
 *   skills_<cat>_category, skills_<cat>_<item>_name
 */

export const LIMITS = {
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
  skillCategory: 500,
  skillName: 500,
  projectName: 100,
  technology: 50,
  achievementTitle: 200,
  issuer: 100,
  certName: 100,
  credentialId: 100,
  languageName: 50
};

export const GPA_MIN = 0;
export const GPA_MAX = 100;

// Same as the server: one "@", no spaces, a dot in the domain, TLD of 2+ chars.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
export const LANGUAGE_PROFICIENCIES = ['basic', 'conversational', 'fluent', 'native'];

const PRESENT_TOKENS = ['present', 'current', 'currently', 'now', 'ongoing', 'till date', 'to date', 'today'];
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

export const isBlank = (value) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

export const isPresentToken = (value) =>
  typeof value === 'string' && PRESENT_TOKENS.includes(value.trim().toLowerCase());

const isRealCalendarDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
};

/**
 * Convert any date shape the form or the resume parser produces to "YYYY-MM-DD".
 * Blank and "Present" -> ''. Unparseable input is returned unchanged so
 * validation can flag it.
 */
export const toDateInputValue = (value) => {
  if (isBlank(value) || isPresentToken(value)) return '';
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? value : isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  if (typeof value !== 'string') return value;
  const v = value.trim();
  let m;
  if ((m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:T.*)?$/))) return isoDate(m[1], +m[2], +m[3]);
  if ((m = v.match(/^(\d{4})[-/](\d{1,2})$/))) return isoDate(m[1], +m[2], 1);
  if ((m = v.match(/^(\d{1,2})[-/](\d{4})$/))) return isoDate(m[2], +m[1], 1);
  if ((m = v.match(/^(\d{4})$/))) return isoDate(m[1], 1, 1);
  if ((m = v.match(/^([A-Za-z]{3,9})\.?[\s,-]+(\d{4})$/))) {
    const month = MONTHS[m[1].slice(0, 4).toLowerCase()] || MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (month) return isoDate(m[2], month, 1);
  }
  const parsed = new Date(v);
  if (!Number.isNaN(parsed.getTime())) return isoDate(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
  return value;
};

/** True for blank values and for anything that normalizes to a real calendar date. */
export const isValidDateValue = (value) => {
  const v = toDateInputValue(value);
  return v === '' || (typeof v === 'string' && isRealCalendarDate(v));
};

/** End date may equal the start date; only "before" is invalid. Blank sides pass. */
export const isDateOrderValid = (start, end) => {
  const s = toDateInputValue(start);
  const e = toDateInputValue(end);
  if (!s || !e || !isRealCalendarDate(s) || !isRealCalendarDate(e)) return true;
  return e >= s; // ISO strings compare chronologically
};

/** GPA: blank, or a number from 0 to 100 with at most 2 decimals. Returns an error message or null. */
export const gpaError = (value) => {
  if (isBlank(value)) return null;
  const str = String(value).trim();
  if (!/^\d+(\.\d+)?$/.test(str)) return 'GPA must be a number';
  const n = Number(str);
  if (n < GPA_MIN || n > GPA_MAX) return `GPA must be between ${GPA_MIN} and ${GPA_MAX}`;
  if ((str.split('.')[1] || '').length > 2) return 'GPA can have at most 2 decimal places';
  return null;
};

// A row is blank when none of its typed-in fields has content. Checkboxes and
// dropdown defaults (isCurrentJob, level, proficiency) don't count.
const CONTENT_FIELDS = {
  workExperience: ['jobTitle', 'company', 'location', 'startDate', 'endDate', 'description', 'achievements'],
  education: ['degree', 'institution', 'location', 'startDate', 'endDate', 'gpa', 'description'],
  projects: ['name', 'description', 'technologies', 'url', 'githubUrl', 'startDate', 'endDate'],
  achievements: ['title', 'description', 'date', 'issuer'],
  certifications: ['name', 'issuer', 'date', 'expiryDate', 'credentialId', 'url'],
  languages: ['name']
};

// Rich-text fields hold HTML; "<p></p>" or "<p>&nbsp;</p>" is still empty.
const stripHtml = (v) => (typeof v === 'string' ? v.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') : v);

export const isBlankRow = (section, row) => {
  if (!row || typeof row !== 'object') return true;
  return !CONTENT_FIELDS[section].some((f) => {
    const v = f === 'description' ? stripHtml(row[f]) : row[f];
    return Array.isArray(v) ? v.some((x) => !isBlank(x)) : !isBlank(v);
  });
};

const tooLong = (value, max) => typeof value === 'string' && value.trim().length > max;
const longMsg = (label, max) => `${label} cannot exceed ${max} characters`;

/**
 * Every rule the server enforces, keyed by form field. Blank rows are ignored
 * (they are stripped before submit).
 */
export const validateResumeEntries = (formData) => {
  const errors = {};
  const set = (key, msg) => { if (!errors[key]) errors[key] = msg; };
  const max = (key, value, limit, label) => { if (tooLong(value, limit)) set(key, longMsg(label, limit)); };
  const date = (key, value, label) => { if (!isValidDateValue(value)) set(key, `Enter a valid ${label}`); };

  if (isBlank(formData.title)) set('title', 'Resume title is required');
  max('title', formData.title, LIMITS.title, 'Title');

  const pi = formData.personalInfo || {};
  if (isBlank(pi.fullName)) set('fullName', 'Full name is required');
  max('fullName', pi.fullName, LIMITS.fullName, 'Full name');
  if (isBlank(pi.email)) set('email', 'Email is required');
  else if (!EMAIL_REGEX.test(pi.email.trim())) set('email', 'Please provide a valid email');
  max('phone', pi.phone, LIMITS.phone, 'Phone number');
  max('address', pi.address, LIMITS.address, 'Address');
  ['website', 'linkedin', 'github'].forEach((f) => max(f, pi[f], LIMITS.url, 'URL'));
  max('summary', formData.summary, LIMITS.longText, 'Summary');

  if (!formData.isFresher) {
    (formData.workExperience || []).forEach((exp, i) => {
      if (isBlankRow('workExperience', exp)) return;
      const k = (f) => `workExperience_${i}_${f}`;
      if (isBlank(exp.jobTitle)) set(k('jobTitle'), 'Job title is required');
      max(k('jobTitle'), exp.jobTitle, LIMITS.jobTitle, 'Job title');
      if (isBlank(exp.company)) set(k('company'), 'Company name is required');
      max(k('company'), exp.company, LIMITS.company, 'Company name');
      max(k('location'), exp.location, LIMITS.location, 'Location');
      if (isBlank(exp.startDate) || isPresentToken(exp.startDate)) set(k('startDate'), 'Start date is required');
      date(k('startDate'), exp.startDate, 'start date');
      if (!exp.isCurrentJob && !isPresentToken(exp.endDate)) {
        date(k('dateRange'), exp.endDate, 'end date');
        if (!isDateOrderValid(exp.startDate, exp.endDate)) set(k('dateRange'), 'End date cannot be before start date');
      }
      max(k('description'), exp.description, LIMITS.longText, 'Description');
    });
  }

  (formData.education || []).forEach((edu, i) => {
    if (isBlankRow('education', edu)) return;
    const k = (f) => `education_${i}_${f}`;
    if (isBlank(edu.degree)) set(k('degree'), 'Degree is required');
    max(k('degree'), edu.degree, LIMITS.degree, 'Degree');
    if (isBlank(edu.institution)) set(k('institution'), 'Institution is required');
    max(k('institution'), edu.institution, LIMITS.institution, 'Institution');
    max(k('location'), edu.location, LIMITS.location, 'Location');
    date(k('startDate'), edu.startDate, 'start date');
    const studying = edu.isCurrentlyStudying || isPresentToken(edu.endDate);
    if (!studying) {
      if (isBlank(edu.endDate)) set(k('endDate'), 'End date is required (or tick "Currently studying here")');
      date(k('endDate'), edu.endDate, 'end date');
      if (!isDateOrderValid(edu.startDate, edu.endDate)) set(k('dateRange'), 'End date cannot be before start date');
    }
    const gpaMsg = gpaError(edu.gpa);
    if (gpaMsg) set(k('gpa'), gpaMsg);
    max(k('description'), edu.description, LIMITS.longText, 'Description');
  });

  (formData.skills || []).forEach((cat, ci) => {
    const items = (cat && cat.items) || [];
    const filled = items.filter((item) => item && !isBlank(item.name));
    if (filled.length > 0 && isBlank(cat.category)) set(`skills_${ci}_category`, 'Category name is required');
    max(`skills_${ci}_category`, cat && cat.category, LIMITS.skillCategory, 'Category');
    items.forEach((item, si) => max(`skills_${ci}_${si}_name`, item && item.name, LIMITS.skillName, 'Skill name'));
  });

  (formData.projects || []).forEach((p, i) => {
    if (isBlankRow('projects', p)) return;
    const k = (f) => `projects_${i}_${f}`;
    if (isBlank(p.name)) set(k('name'), 'Project name is required');
    max(k('name'), p.name, LIMITS.projectName, 'Project name');
    const longTech = (p.technologies || []).find((t) => tooLong(t, LIMITS.technology));
    if (longTech) set(k('technologies'), `Each technology must be ${LIMITS.technology} characters or fewer ("${longTech.trim().slice(0, 20)}…" is too long)`);
    max(k('url'), p.url, LIMITS.url, 'URL');
    max(k('githubUrl'), p.githubUrl, LIMITS.url, 'GitHub URL');
    date(k('startDate'), p.startDate, 'start date');
    date(k('endDate'), p.endDate, 'end date');
    max(k('description'), p.description, LIMITS.longText, 'Description');
  });

  (formData.achievements || []).forEach((a, i) => {
    if (isBlankRow('achievements', a)) return;
    const k = (f) => `achievements_${i}_${f}`;
    if (isBlank(a.title)) set(k('title'), 'Achievement title is required');
    max(k('title'), a.title, LIMITS.achievementTitle, 'Title');
    max(k('issuer'), a.issuer, LIMITS.issuer, 'Issuer');
    date(k('date'), a.date, 'date');
    max(k('description'), a.description, LIMITS.longText, 'Description');
  });

  (formData.certifications || []).forEach((c, i) => {
    if (isBlankRow('certifications', c)) return;
    const k = (f) => `certifications_${i}_${f}`;
    if (isBlank(c.name)) set(k('name'), 'Certification name is required');
    max(k('name'), c.name, LIMITS.certName, 'Name');
    if (isBlank(c.issuer)) set(k('issuer'), 'Issuer is required');
    max(k('issuer'), c.issuer, LIMITS.issuer, 'Issuer');
    max(k('credentialId'), c.credentialId, LIMITS.credentialId, 'Credential ID');
    max(k('url'), c.url, LIMITS.url, 'URL');
    date(k('date'), c.date, 'issue date');
    date(k('expiryDate'), c.expiryDate, 'expiry date');
  });

  (formData.languages || []).forEach((l, i) => {
    if (isBlankRow('languages', l)) return;
    max(`languages_${i}_name`, l.name, LIMITS.languageName, 'Language name');
    if (!isBlank(l.proficiency) && !LANGUAGE_PROFICIENCIES.includes(String(l.proficiency).trim().toLowerCase())) {
      set(`languages_${i}_proficiency`, `Choose one of: ${LANGUAGE_PROFICIENCIES.join(', ')}`);
    }
  });

  return errors;
};

const trimStr = (v) => (typeof v === 'string' ? v.trim() : v);
const keepWithIndex = (list, section) =>
  (list || []).map((row, index) => ({ row, index })).filter(({ row }) => !isBlankRow(section, row));

/**
 * Build the request body from form state: strips blank rows, normalizes dates
 * and enum values, and drops UI-only fields. `indexMap` maps each payload row
 * back to its form row so server errors land on the right input.
 */
export const prepareResumePayload = (formData) => {
  const { extractedText, parsedData, ...rest } = formData; // UI-only, can be large
  const payload = JSON.parse(JSON.stringify(rest));
  const indexMap = {};

  if (typeof payload.title === 'string') payload.title = payload.title.trim();
  if (payload.personalInfo) {
    Object.keys(payload.personalInfo).forEach((key) => {
      const v = payload.personalInfo[key];
      payload.personalInfo[key] = v === null ? '' : trimStr(v);
    });
  }

  const section = (name, mapRow) => {
    const kept = keepWithIndex(payload[name], name);
    indexMap[name] = kept.map(({ index }) => index);
    payload[name] = kept.map(({ row }) => mapRow(row));
  };

  if (payload.isFresher) {
    payload.workExperience = [];
    indexMap.workExperience = [];
  } else {
    section('workExperience', (exp) => {
      const current = !!exp.isCurrentJob || isPresentToken(exp.endDate);
      return {
        ...exp,
        jobTitle: trimStr(exp.jobTitle),
        company: trimStr(exp.company),
        isCurrentJob: current,
        startDate: toDateInputValue(exp.startDate),
        endDate: current ? '' : toDateInputValue(exp.endDate),
        achievements: (exp.achievements || []).filter((a) => !isBlank(a))
      };
    });
  }

  section('education', (edu) => {
    const studying = !!edu.isCurrentlyStudying || isPresentToken(edu.endDate);
    return {
      ...edu,
      degree: trimStr(edu.degree),
      institution: trimStr(edu.institution),
      isCurrentlyStudying: studying,
      startDate: toDateInputValue(edu.startDate),
      endDate: studying ? '' : toDateInputValue(edu.endDate),
      gpa: isBlank(edu.gpa) ? null : Number(edu.gpa)
    };
  });

  indexMap.skills = [];
  payload.skills = (payload.skills || [])
    .map((cat, index) => {
      const items = (cat.items || []).map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => item && !isBlank(item.name));
      return { cat, index, items };
    })
    .filter(({ cat, items }) => items.length > 0 || !isBlank(cat.category))
    .map(({ cat, index, items }) => {
      indexMap.skills.push({ index, items: items.map(({ itemIndex }) => itemIndex) });
      return {
        ...cat,
        category: trimStr(cat.category),
        items: items.map(({ item }) => ({
          ...item,
          name: item.name.trim(),
          level: SKILL_LEVELS.includes(String(item.level || '').toLowerCase()) ? String(item.level).toLowerCase() : 'intermediate'
        }))
      };
    });

  section('projects', (p) => ({
    ...p,
    name: trimStr(p.name),
    technologies: (p.technologies || []).map(trimStr).filter((t) => !isBlank(t)),
    startDate: toDateInputValue(p.startDate),
    endDate: toDateInputValue(p.endDate)
  }));

  section('achievements', (a) => ({ ...a, title: trimStr(a.title), date: toDateInputValue(a.date) }));

  section('certifications', (c) => ({
    ...c,
    name: trimStr(c.name),
    issuer: trimStr(c.issuer),
    date: toDateInputValue(c.date),
    expiryDate: toDateInputValue(c.expiryDate)
  }));

  section('languages', (l) => {
    const prof = String(l.proficiency || '').trim().toLowerCase();
    return { ...l, name: trimStr(l.name), proficiency: LANGUAGE_PROFICIENCIES.includes(prof) ? prof : 'basic' };
  });

  return { payload, indexMap };
};

/**
 * Normalize data coming from the resume parser (upload) into form state:
 * dates as YYYY-MM-DD (so the date pickers show them), "Present" as the
 * current-job / currently-studying checkbox, lowercase enum values.
 */
export const normalizeImportedResume = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return parsed;
  const out = { ...parsed };
  if (Array.isArray(out.workExperience)) {
    out.workExperience = out.workExperience.map((exp) => {
      const current = !!exp.isCurrentJob || isPresentToken(exp.endDate);
      return {
        jobTitle: '', company: '', location: '', description: '', achievements: [],
        ...exp,
        isCurrentJob: current,
        startDate: toDateInputValue(exp.startDate),
        endDate: current ? '' : toDateInputValue(exp.endDate)
      };
    });
  }
  if (Array.isArray(out.education)) {
    out.education = out.education.map((edu) => {
      const studying = !!edu.isCurrentlyStudying || isPresentToken(edu.endDate);
      return {
        degree: '', institution: '', location: '', description: '',
        ...edu,
        isCurrentlyStudying: studying,
        startDate: toDateInputValue(edu.startDate),
        endDate: studying ? '' : toDateInputValue(edu.endDate),
        gpa: edu.gpa === null || edu.gpa === undefined ? '' : String(edu.gpa)
      };
    });
  }
  if (Array.isArray(out.skills)) {
    out.skills = out.skills.map((cat) => ({
      category: cat.category || '',
      items: (cat.items || []).map((item) => {
        const level = String(item.level || '').toLowerCase();
        return { name: item.name || '', level: SKILL_LEVELS.includes(level) ? level : 'intermediate' };
      })
    }));
  }
  ['projects'].forEach((name) => {
    if (Array.isArray(out[name])) {
      out[name] = out[name].map((p) => ({ ...p, startDate: toDateInputValue(p.startDate), endDate: toDateInputValue(p.endDate) }));
    }
  });
  if (Array.isArray(out.achievements)) {
    out.achievements = out.achievements.map((a) => ({ ...a, date: toDateInputValue(a.date) }));
  }
  if (Array.isArray(out.certifications)) {
    out.certifications = out.certifications.map((c) => ({ ...c, date: toDateInputValue(c.date), expiryDate: toDateInputValue(c.expiryDate) }));
  }
  if (Array.isArray(out.languages)) {
    out.languages = out.languages.map((l) => {
      const prof = String(l.proficiency || '').toLowerCase();
      return { name: l.name || l.language || '', proficiency: LANGUAGE_PROFICIENCIES.includes(prof) ? prof : 'conversational' };
    });
  }
  return out;
};

const PERSONAL_FIELDS = ['fullName', 'email', 'phone', 'address', 'website', 'linkedin', 'github', 'profilePicture'];

/**
 * Map server field errors ({ field: 'education.1.endDate', message }) to form
 * error keys, translating payload row indexes back to form row indexes.
 */
export const mapServerErrors = (serverErrors, indexMap = {}) => {
  const formErrors = {};
  (serverErrors || []).forEach((err) => {
    const path = err.field || err.path || err.param;
    const message = err.message || err.msg || 'Invalid value';
    if (!path) return;
    const parts = String(path).split('.');
    let key = path;

    if (parts[0] === 'personalInfo' && parts[1]) {
      key = parts[1];
    } else if (parts[0] === 'skills' && parts.length >= 3) {
      const cat = indexMap.skills && indexMap.skills[+parts[1]];
      const ci = cat ? cat.index : +parts[1];
      if (parts[2] === 'items' && parts.length >= 5) {
        const si = cat && cat.items[+parts[3]] !== undefined ? cat.items[+parts[3]] : +parts[3];
        key = `skills_${ci}_${si}_${parts[4]}`;
      } else {
        key = `skills_${ci}_${parts[2]}`;
      }
    } else if (CONTENT_FIELDS[parts[0]] && parts.length >= 3) {
      const map = indexMap[parts[0]];
      const i = map && map[+parts[1]] !== undefined ? map[+parts[1]] : +parts[1];
      let field = parts[2];
      if (field === 'endDate' && /before start date/i.test(message)) field = 'dateRange';
      if (parts[0] === 'workExperience' && field === 'endDate') field = 'dateRange'; // where the form shows end-date errors
      key = `${parts[0]}_${i}_${field}`;
    }
    if (!formErrors[key]) formErrors[key] = message;
  });
  return formErrors;
};

const SECTION_STEPS = {
  workExperience: 3,
  education: 4,
  skills: 5,
  projects: 6,
  achievements: 7,
  certifications: 8,
  languages: 8
};

/** Which form step shows the field behind an error key. */
export const stepForErrorKey = (key) => {
  if (key === 'title' || key === 'summary') return 1;
  if (PERSONAL_FIELDS.includes(key)) return 2;
  const section = String(key).split('_')[0];
  return SECTION_STEPS[section] || 1;
};

const SECTION_LABELS = {
  workExperience: 'Work experience',
  education: 'Education',
  skills: 'Skills category',
  projects: 'Project',
  achievements: 'Achievement',
  certifications: 'Certification',
  languages: 'Language'
};

/** Human-readable location for an error key, e.g. "Education #2". */
export const describeErrorKey = (key) => {
  const [section, index] = String(key).split('_');
  if (SECTION_LABELS[section] && index !== undefined && /^\d+$/.test(index)) {
    return `${SECTION_LABELS[section]} #${Number(index) + 1}`;
  }
  return null;
};
