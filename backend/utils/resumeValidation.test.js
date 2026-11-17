/**
 * Resume save validation: normalizer, route rules and Mongoose schema.
 * No database needed: documents are checked with doc.validate(), which is
 * exactly what doc.save() runs before writing.
 *
 * Run: npm test   (or: node --test utils/resumeValidation.test.js)
 */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const mongoose = require('mongoose');

const Resume = require('../models/Resume');
const {
  normalizeDate,
  normalizeGpa,
  normalizeResumePayload,
  normalizeResumeBody,
  resumeCreateRules,
  resumeUpdateRules,
  rejectInvalidResume,
  sendResumeValidationError,
  EMAIL_REGEX,
  EMAIL_MAX_LENGTH,
  isValidEmail
} = require('./resumeValidation');

const userId = new mongoose.Types.ObjectId();

// What the resume form sends for a fully filled-in resume (shape taken from
// ResumeForm.js state, after its blank-row cleanup).
const completeResume = () => ({
  title: 'Senior Developer Resume',
  personalInfo: {
    fullName: 'Test User',
    email: 'test.user@example.com',
    phone: '+91 98765 43210',
    address: 'Pune, India',
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/in/test',
    github: 'https://github.com/test',
    isAddPhoto: false,
    profilePicture: ''
  },
  summary: '<p>Engineer with 5 years of experience.</p>',
  isFresher: false,
  workExperience: [
    { jobTitle: 'Developer', company: 'Acme', location: 'Remote', startDate: '2021-01-01', endDate: '', isCurrentJob: true, description: '<p>Built things</p>', achievements: [] },
    { jobTitle: 'Intern', company: 'Initech', location: '', startDate: '2020-06-01', endDate: '2020-06-01', isCurrentJob: false, description: '', achievements: [] }
  ],
  education: [
    { degree: 'M.Tech', institution: 'State University', location: '', startDate: '2024-07-01', endDate: '', isCurrentlyStudying: true, gpa: '', description: '' },
    { degree: 'B.Tech', institution: 'City College', location: '', startDate: '2016-07-01', endDate: '2020-05-01', isCurrentlyStudying: false, gpa: '8.5', description: '' }
  ],
  skills: [{ category: 'Languages', items: [{ name: 'JavaScript', level: 'advanced' }, { name: 'Go', level: 'beginner' }] }],
  projects: [{ name: 'Resume Builder', description: '<p>MERN app</p>', technologies: ['React', 'Node.js'], url: 'https://example.com/app', githubUrl: '', startDate: '2023-01-01', endDate: '' }],
  achievements: [{ title: 'Hackathon winner', description: '', date: '2022-03-01', issuer: 'DevFest' }],
  certifications: [{ name: 'AWS SAA', issuer: 'Amazon', date: '2022-01-01', expiryDate: '2025-01-01', credentialId: 'ABC123', url: '' }],
  languages: [{ name: 'English', proficiency: 'fluent' }, { name: 'Hindi', proficiency: 'native' }]
});

// Only what the server truly requires.
const minimalResume = () => ({
  title: 'My Resume',
  personalInfo: { fullName: 'Test User', email: 'test.user@example.com' }
});

const validateDoc = async (payload) => {
  const doc = new Resume({ user: userId, status: 'draft', ...normalizeResumePayload(payload) });
  await doc.validate();
  return doc;
};

const fieldErrorsOf = async (payload) => {
  try {
    await validateDoc(payload);
    return [];
  } catch (error) {
    const res = { statusCode: 0, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
    assert.equal(sendResumeValidationError(error, res), true, `unexpected error type: ${error.name}`);
    assert.equal(res.statusCode, 400);
    return res.body.errors;
  }
};

describe('normalizeDate', () => {
  test('accepts the date shapes the form and the resume parser produce', () => {
    assert.equal(normalizeDate('2021-03-15'), '2021-03-15');
    assert.equal(normalizeDate('2021-03-15T00:00:00.000Z'), '2021-03-15');
    assert.equal(normalizeDate('2021-03'), '2021-03-01');
    assert.equal(normalizeDate('03/2021'), '2021-03-01');
    assert.equal(normalizeDate('2021'), '2021-01-01');
    assert.equal(normalizeDate('Mar 2021'), '2021-03-01');
    assert.equal(normalizeDate('September 2019'), '2019-09-01');
    assert.equal(normalizeDate('Sept. 2019'), '2019-09-01');
  });

  test('blank and "Present" become null', () => {
    for (const v of ['', '   ', null, undefined, 'Present', 'current', 'Till Date']) {
      assert.equal(normalizeDate(v), null, `value ${JSON.stringify(v)}`);
    }
  });

  test('unparseable values are passed through for the schema to reject', () => {
    assert.equal(normalizeDate('sometime'), 'sometime');
  });
});

describe('normalizeGpa', () => {
  test('parses numbers, "x/y" and percentages; blank is dropped', () => {
    assert.equal(normalizeGpa('8.5'), 8.5);
    assert.equal(normalizeGpa(9), 9);
    assert.equal(normalizeGpa('3.8/4'), 3.8);
    assert.equal(normalizeGpa('85%'), 85);
    assert.equal(normalizeGpa(''), undefined);
    assert.equal(normalizeGpa('abc'), 'abc');
  });
});

describe('normalizeResumePayload', () => {
  test('strips blank optional rows in every section', () => {
    const p = completeResume();
    p.workExperience.push({ jobTitle: '', company: '', location: '', startDate: '', endDate: '', isCurrentJob: false, description: '', achievements: [] });
    p.education.push({ degree: ' ', institution: '', startDate: '', endDate: '', isCurrentlyStudying: false, gpa: '', description: '' });
    p.skills.push({ category: '', items: [{ name: '', level: 'intermediate' }] });
    p.skills[0].items.push({ name: '  ', level: 'intermediate' });
    p.projects.push({ name: '', description: '', technologies: [], url: '', githubUrl: '', startDate: '', endDate: '' });
    p.achievements.push({ title: '', description: '', date: '', issuer: '' });
    p.certifications.push({ name: '', issuer: '', date: '', expiryDate: '', credentialId: '', url: '' });
    p.languages.push({ name: '', proficiency: 'conversational' });

    const out = normalizeResumePayload(p);
    assert.equal(out.workExperience.length, 2);
    assert.equal(out.education.length, 2);
    assert.equal(out.skills.length, 1);
    assert.equal(out.skills[0].items.length, 2);
    assert.equal(out.projects.length, 1);
    assert.equal(out.achievements.length, 1);
    assert.equal(out.certifications.length, 1);
    assert.equal(out.languages.length, 2);
  });

  test('"Present" end dates set the current flag', () => {
    const p = completeResume();
    p.workExperience[1].endDate = 'Present';
    p.education[1].endDate = 'present';
    const out = normalizeResumePayload(p);
    assert.equal(out.workExperience[1].isCurrentJob, true);
    assert.equal(out.workExperience[1].endDate, null);
    assert.equal(out.education[1].isCurrentlyStudying, true);
    assert.equal(out.education[1].endDate, null);
  });

  test('current job / currently studying drop any stale end date', () => {
    const p = completeResume();
    p.workExperience[0].endDate = '2019-01-01';
    p.education[0].endDate = '2019-01-01';
    const out = normalizeResumePayload(p);
    assert.equal(out.workExperience[0].endDate, null);
    assert.equal(out.education[0].endDate, null);
  });

  test('enum values are case-insensitive and common synonyms are mapped', () => {
    const p = completeResume();
    p.skills[0].items[0].level = 'Advanced';
    p.skills[0].items[1].level = '';
    p.languages[0].proficiency = 'Professional Working';
    p.languages[1].proficiency = '';
    const out = normalizeResumePayload(p);
    assert.equal(out.skills[0].items[0].level, 'advanced');
    assert.equal('level' in out.skills[0].items[1], false); // schema default applies
    assert.equal(out.languages[0].proficiency, 'fluent');
    assert.equal('proficiency' in out.languages[1], false);
  });

  test('freshers send no work experience', () => {
    const p = completeResume();
    p.isFresher = true;
    p.workExperience = [{ jobTitle: 'Leftover', company: '', startDate: '' }];
    assert.deepEqual(normalizeResumePayload(p).workExperience, []);
  });

  test('passes through fields it does not own', () => {
    const out = normalizeResumePayload({ ...minimalResume(), resumeId: 'abc', templateId: 'def' });
    assert.equal(out.resumeId, 'abc');
    assert.equal(out.templateId, 'def');
  });
});

describe('Resume schema accepts valid resumes', () => {
  test('complete resume', async () => {
    assert.deepEqual(await fieldErrorsOf(completeResume()), []);
  });

  test('minimal resume (title, full name, email only)', async () => {
    assert.deepEqual(await fieldErrorsOf(minimalResume()), []);
  });

  test('fresher with no work experience', async () => {
    assert.deepEqual(await fieldErrorsOf({ ...completeResume(), isFresher: true, workExperience: [] }), []);
  });

  // Each of these used to fail with a bare "Validation failed".
  const regressions = {
    'education marked "Currently studying" without an end date': (p) => { p.education = [p.education[0]]; },
    'end date equal to start date': (p) => { p.workExperience[1].endDate = p.workExperience[1].startDate; },
    'uploaded resume dates like "Jan 2021" and "Present"': (p) => { p.workExperience[0] = { ...p.workExperience[0], startDate: 'Jan 2021', endDate: 'Present', isCurrentJob: false }; },
    'language with no proficiency picked': (p) => { p.languages[0].proficiency = ''; },
    'capitalised skill level from the resume parser': (p) => { p.skills[0].items[0].level = 'Expert'; },
    'email with plus-addressing and a long TLD': (p) => { p.personalInfo.email = 'first.last+cv@company.technology'; },
    'GPA written as a percentage': (p) => { p.education[1].gpa = '85%'; },
    'blank rows left in the form': (p) => { p.projects.push({ name: '', technologies: [] }); p.languages.push({ name: '', proficiency: 'basic' }); }
  };
  for (const [name, mutate] of Object.entries(regressions)) {
    test(name, async () => {
      const p = completeResume();
      mutate(p);
      assert.deepEqual(await fieldErrorsOf(p), []);
    });
  }
});

describe('Resume schema rejects invalid data with field-level errors', () => {
  const cases = [
    ['education end date missing when not currently studying', (p) => { p.education[1].endDate = ''; }, 'education.1.endDate', /End date is required/],
    ['education end date before start date', (p) => { p.education[1].endDate = '2015-01-01'; }, 'education.1.endDate', /cannot be before start date/],
    ['work end date before start date', (p) => { p.workExperience[1].endDate = '2019-01-01'; }, 'workExperience.1.endDate', /cannot be before start date/],
    ['work experience without a start date', (p) => { p.workExperience[1].startDate = ''; }, 'workExperience.1.startDate', /required/],
    ['work experience without a company', (p) => { p.workExperience[0].company = ''; }, 'workExperience.0.company', /required/],
    ['unparseable date', (p) => { p.projects[0].startDate = 'sometime'; }, 'projects.0.startDate', /Enter a valid start date/],
    ['non-numeric GPA', (p) => { p.education[1].gpa = 'first class'; }, 'education.1.gpa', /GPA must be a number/],
    ['GPA over 100', (p) => { p.education[1].gpa = '120'; }, 'education.1.gpa', /cannot exceed/],
    ['skill category missing', (p) => { p.skills[0].category = ''; }, 'skills.0.category', /required/],
    ['unknown language proficiency', (p) => { p.languages[0].proficiency = 'klingon'; }, 'languages.0.proficiency', /Choose one of/],
    ['certification without an issuer', (p) => { p.certifications[0].issuer = ''; }, 'certifications.0.issuer', /Issuer is required/],
    ['technology longer than 50 characters', (p) => { p.projects[0].technologies = ['x'.repeat(51)]; }, 'projects.0.technologies.0', /cannot exceed 50/],
    ['phone longer than 20 characters', (p) => { p.personalInfo.phone = '1'.repeat(21); }, 'personalInfo.phone', /cannot exceed 20/],
    ['invalid email', (p) => { p.personalInfo.email = 'not-an-email'; }, 'personalInfo.email', /valid email/]
  ];
  for (const [name, mutate, field, message] of cases) {
    test(name, async () => {
      const p = completeResume();
      mutate(p);
      const errors = await fieldErrorsOf(p);
      const match = errors.find((e) => e.field === field);
      assert.ok(match, `expected an error on ${field}, got ${JSON.stringify(errors)}`);
      assert.match(match.message, message);
      assert.equal(match.path, field); // express-validator style keys for older clients
      assert.equal(match.msg, match.message);
    });
  }
});

// Runs the same middleware chain as POST /api/resumes/form-data and PUT /api/resumes/:id
// (minus auth and the DB write) over HTTP, so the request/response shape is covered too.
describe('route pipeline', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = express();
    app.use(express.json());
    const handler = async (req, res) => {
      try {
        const doc = await new Resume({ user: userId, status: 'draft', ...req.body });
        await doc.validate();
        res.status(201).json({ success: true });
      } catch (error) {
        if (!sendResumeValidationError(error, res)) res.status(500).json({ success: false, error: 'Server error' });
      }
    };
    app.post('/form-data', normalizeResumeBody, ...resumeCreateRules, rejectInvalidResume, handler);
    app.put('/update', normalizeResumeBody, ...resumeUpdateRules, rejectInvalidResume, (req, res) => res.json({ success: true, body: req.body }));
    await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  const send = async (method, path, payload) => {
    const res = await fetch(baseUrl + path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return { status: res.status, body: await res.json() };
  };

  test('complete resume saves', async () => {
    const { status, body } = await send('POST', '/form-data', completeResume());
    assert.equal(status, 201, JSON.stringify(body));
  });

  test('minimal resume saves', async () => {
    const { status, body } = await send('POST', '/form-data', minimalResume());
    assert.equal(status, 201, JSON.stringify(body));
  });

  // Production once logged 'Cast to date failed for value "Present"' as a 500.
  test('"Present" end date saves as a current job on create and update', async () => {
    const p = completeResume();
    p.workExperience[0] = { ...p.workExperience[0], endDate: 'Present', isCurrentJob: false };
    const created = await send('POST', '/form-data', p);
    assert.equal(created.status, 201, JSON.stringify(created.body));

    const updated = await send('PUT', '/update', { workExperience: p.workExperience });
    assert.equal(updated.status, 200, JSON.stringify(updated.body));
    assert.equal(updated.body.body.workExperience[0].endDate, null);
    assert.equal(updated.body.body.workExperience[0].isCurrentJob, true);
  });

  test('missing title, name and email -> one field-level error each', async () => {
    const { status, body } = await send('POST', '/form-data', { title: '  ', personalInfo: { fullName: '', email: 'nope' } });
    assert.equal(status, 400);
    assert.deepEqual(body.errors.map((e) => e.field).sort(), ['personalInfo.email', 'personalInfo.fullName', 'title']);
    assert.deepEqual(body.errors.map((e) => e.message).sort(), ['Full name is required', 'Please provide a valid email', 'Resume title is required']);
    assert.match(body.error, /^Please fix 3 fields: /);
  });

  test('schema errors come back per field, not as a bare "Validation failed"', async () => {
    const p = completeResume();
    p.education[1].endDate = '';
    p.certifications[0].issuer = '';
    const { status, body } = await send('POST', '/form-data', p);
    assert.equal(status, 400);
    assert.notEqual(body.error, 'Validation failed');
    assert.deepEqual(body.errors.map((e) => e.field).sort(), ['certifications.0.issuer', 'education.1.endDate']);
  });

  test('title longer than 100 characters is rejected by the route rule', async () => {
    const { status, body } = await send('POST', '/form-data', { ...minimalResume(), title: 'x'.repeat(101) });
    assert.equal(status, 400);
    assert.equal(body.errors[0].field, 'title');
    assert.match(body.errors[0].message, /cannot exceed 100/);
  });

  test('update only checks the fields that are sent', async () => {
    const { status, body } = await send('PUT', '/update', { summary: 'Just the summary' });
    assert.equal(status, 200, JSON.stringify(body));
  });

  test('update rejects an emptied title', async () => {
    const { status, body } = await send('PUT', '/update', { title: '' });
    assert.equal(status, 400);
    assert.equal(body.errors[0].field, 'title');
  });

  test('update normalizes the body before the handler sees it', async () => {
    const p = completeResume();
    p.projects.push({ name: '', technologies: [] });
    const { body } = await send('PUT', '/update', p);
    assert.equal(body.body.projects.length, 1);
    assert.equal(body.body.education[0].endDate, null);
  });
});

// Email validation must stay linear-time: a quadratic pattern on an unbounded
// string blocks the event loop (the previous regex took ~16 s on 100 KB).
describe('email validation (ReDoS-safe)', () => {
  const ms = (fn) => {
    const start = process.hrtime.bigint();
    const result = fn();
    return { result, ms: Number(process.hrtime.bigint() - start) / 1e6 };
  };
  // Worst cases for the old pattern: long local part, many dot-separated
  // labels, and a trailing space so the match must fail at the very end.
  const attacks = (n) => [
    'a'.repeat(n) + '@' + 'a.'.repeat(n / 2) + ' ',
    'a@' + 'a.'.repeat(n / 2) + 'a ',
    'a@' + 'a'.repeat(n) + ' ',
    'a'.repeat(n) + '@'
  ];

  test('accepts normal addresses', () => {
    for (const email of [
      'a@b.co',
      'first.last@example.com',
      'first.last+cv@company.technology',
      'x-y_z@mail.sub.example.co.in',
      'name@my-company.io',
      'user@xn--bcher-kva.ch'
    ]) {
      assert.equal(isValidEmail(email), true, email);
    }
  });

  test('rejects malformed addresses', () => {
    for (const email of ['a@b', 'a@b.c', 'a @b.com', 'a@@b.com', 'a@b..com', '@b.com', 'a@.com', 'a@b.com.', 'a@b.c om', '', null, undefined, 42]) {
      assert.equal(isValidEmail(email), false, String(email));
    }
  });

  test(`caps length at ${EMAIL_MAX_LENGTH} characters`, () => {
    const domain = '@example.com';
    assert.equal(isValidEmail('a'.repeat(EMAIL_MAX_LENGTH - domain.length) + domain), true);
    assert.equal(isValidEmail('a'.repeat(EMAIL_MAX_LENGTH - domain.length + 1) + domain), false);
  });

  test('the regex itself is linear: 100,000-character attack strings fail in < 50 ms', () => {
    for (const input of attacks(100000)) {
      const { result, ms: took } = ms(() => EMAIL_REGEX.test(input));
      assert.equal(result, false);
      assert.ok(took < 50, `regex took ${took.toFixed(1)} ms on a ${input.length}-char input`);
    }
  });

  test('isValidEmail rejects a 100,000-character email in < 50 ms', () => {
    for (const input of attacks(100000)) {
      const { result, ms: took } = ms(() => isValidEmail(input));
      assert.equal(result, false);
      assert.ok(took < 50, `took ${took.toFixed(1)} ms`);
    }
  });

  test('schema rejects a 100,000-character email in < 50 ms with a length message', async () => {
    const p = minimalResume();
    p.personalInfo.email = attacks(100000)[0].trim();
    const start = process.hrtime.bigint();
    const errors = await fieldErrorsOf(p);
    const took = Number(process.hrtime.bigint() - start) / 1e6;
    assert.ok(took < 50, `schema validation took ${took.toFixed(1)} ms`);
    const err = errors.find((e) => e.field === 'personalInfo.email');
    assert.ok(err, JSON.stringify(errors));
    assert.match(err.message, /cannot exceed 254/);
  });

  test('route rule rejects a 100,000-character email in < 50 ms', async () => {
    const req = { body: normalizeResumePayload({ ...minimalResume(), personalInfo: { fullName: 'A B', email: attacks(100000)[0] } }) };
    const start = process.hrtime.bigint();
    for (const rule of resumeCreateRules) await rule.run(req);
    const took = Number(process.hrtime.bigint() - start) / 1e6;
    const { validationResult } = require('express-validator');
    const errors = validationResult(req).array();
    assert.ok(took < 50, `route rules took ${took.toFixed(1)} ms`);
    assert.deepEqual(errors.map((e) => [e.path, e.msg]), [['personalInfo.email', `Email cannot exceed ${EMAIL_MAX_LENGTH} characters`]]);
  });

  test('date and GPA parsers ignore oversized input quickly', () => {
    const big = '1'.repeat(100000) + 'x';
    for (const fn of [() => normalizeDate(big), () => normalizeGpa(big), () => normalizeDate('Jan' + ' '.repeat(100000) + 'x')]) {
      const { ms: took } = ms(fn);
      assert.ok(took < 50, `took ${took.toFixed(1)} ms`);
    }
  });
});
