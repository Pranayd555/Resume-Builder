/**
 * Resume import: AI schema, normaliser (AI output -> form state), fallback
 * parser, and the "nothing dropped silently" report. All data is fictional.
 *
 * Run: node --test utils/resumeImport.test.js
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const { normalizeResumePayload } = require('./resumeValidation');
const {
  PARSE_RESUME_SCHEMA,
  buildParsePrompt,
  normalizeParsedResume,
  heuristicParse,
  findContacts,
  readDate,
  readDateRange
} = require('./resumeImport');

// What the model returns for a typical two-column resume (shape of PARSE_RESUME_SCHEMA).
const SOURCE_TEXT = `CONTACT
jordan.patel@example.com
+1 (555) 010-2234
LinkedIn (https://www.linkedin.com/in/jordan-patel)
SKILLS
Languages: TypeScript, Python, Go
Jordan Avery Patel
Senior Software Engineer
SUMMARY
Full-stack engineer with 7+ years building high-traffic web platforms.
EXPERIENCE
Senior Software Engineer, Northwind Logistics | Mar 2021 – Present
Led a team of 5 to rebuild the shipment tracking API in Go, serving 12M
requests/day.
EDUCATION
B.S. Computer Science, University of Texas at Austin | 2013 – 2017
GPA: 3.7/4.0
VOLUNTEERING
Code Mentor, Girls Who Code Austin (2019 – Present)
Speaker at RegionalConf about tail latency budgets`;

const aiOutput = () => ({
  personalInfo: {
    fullName: 'Jordan Avery Patel',
    headline: 'Senior Software Engineer',
    email: 'jordan.patel@example.com',
    phone: '+1 (555) 010-2234',
    location: 'Austin, TX',
    website: '',
    linkedin: '',
    github: '',
    otherLinks: ['https://www.linkedin.com/in/jordan-patel']
  },
  summary: 'Full-stack engineer with 7+ years building high-traffic web platforms.',
  workExperience: [{
    jobTitle: 'Senior Software Engineer',
    company: 'Northwind Logistics',
    location: '',
    startDate: 'Mar 2021 – Present', // range left in one field
    endDate: '',
    description: '',
    highlights: ['Led a team of 5 to rebuild the shipment tracking API in Go, serving 12M\nrequests/day.']
  }],
  education: [{
    degree: 'B.S.',
    fieldOfStudy: 'Computer Science',
    institution: 'University of Texas at Austin',
    location: '',
    startDate: '2013',
    endDate: '2017',
    grade: 'GPA: 3.7/4.0',
    details: []
  }],
  skills: [{ category: 'LANGUAGES', items: ['TypeScript, Python', 'Go (Advanced)', 'go'] }],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [{ name: 'Spanish', proficiency: 'B2' }, { name: 'English', proficiency: 'Native or bilingual' }],
  additionalSections: [{ title: 'VOLUNTEERING', items: ['Code Mentor, Girls Who Code Austin (2019 – Present)'] }]
});

describe('PARSE_RESUME_SCHEMA', () => {
  test('is JSON Schema (lowercase types) and every object lists all its properties as required', () => {
    const walk = (node, path) => {
      assert.ok(['object', 'array', 'string'].includes(node.type), `${path}: bad type ${node.type}`);
      assert.equal(node.nullable, undefined, `${path}: "nullable" is OpenAPI, not JSON Schema`);
      if (node.type === 'object') {
        assert.deepEqual([...node.required].sort(), Object.keys(node.properties).sort(), `${path}: required`);
        Object.entries(node.properties).forEach(([k, v]) => walk(v, `${path}.${k}`));
      }
      if (node.type === 'array') walk(node.items, `${path}[]`);
    };
    walk(PARSE_RESUME_SCHEMA, '$');
  });

  test('the prompt wraps the resume as data and caps its size', () => {
    const prompt = buildParsePrompt('x'.repeat(50000));
    assert.match(prompt, /^Resume text:\n<resume>\n/);
    assert.ok(prompt.length < 30100);
  });
});

describe('dates', () => {
  const cases = {
    'Mar 2021': '2021-03-01',
    'March 2021': '2021-03-01',
    '06/2018': '2018-06-01',
    '2019': '2019-01-01',
    'Summer 2020': '2020-06-01',
    "Sep '19": '2019-09-01',
    '15 March 2021': '2021-03-01',
    'March 3, 2021': '2021-03-01',
    'Q3 2020': '2020-07-01'
  };
  for (const [input, expected] of Object.entries(cases)) {
    test(`"${input}" -> ${expected}`, () => assert.equal(readDate(input).date, expected));
  }
  test('"Present" and unreadable values', () => {
    assert.deepEqual(readDate('Present'), { date: '', present: true, unreadable: false });
    assert.deepEqual(readDate('Till date'), { date: '', present: true, unreadable: false });
    assert.equal(readDate('Spring term').unreadable, true);
    assert.equal(readDate('').unreadable, false);
  });
  test('a range in one field is split', () => {
    const r = readDateRange('Jan 2019 - Dec 2020', '');
    assert.equal(r.start.date, '2019-01-01');
    assert.equal(r.end.date, '2020-12-01');
  });
});

describe('normalizeParsedResume', () => {
  const { formData, report } = normalizeParsedResume(aiOutput(), { sourceText: SOURCE_TEXT });

  test('work experience: bullets become the HTML description, range and "Present" become dates + flag', () => {
    const [job] = formData.workExperience;
    assert.equal(job.jobTitle, 'Senior Software Engineer');
    assert.equal(job.company, 'Northwind Logistics');
    assert.equal(job.startDate, '2021-03-01');
    assert.equal(job.endDate, '');
    assert.equal(job.isCurrentJob, true);
    assert.equal(job.description, '<ul><li>Led a team of 5 to rebuild the shipment tracking API in Go, serving 12M requests/day.</li></ul>');
    assert.deepEqual(job.achievements, []);
    assert.equal(formData.isFresher, false);
  });

  test('education: degree + field joined, numeric grade to GPA', () => {
    assert.deepEqual(formData.education[0], {
      degree: 'B.S. in Computer Science',
      institution: 'University of Texas at Austin',
      location: '',
      startDate: '2013-01-01',
      endDate: '2017-01-01',
      isCurrentlyStudying: false,
      gpa: '3.7',
      description: ''
    });
  });

  test('skills: split, deduplicated, level read from the name, category tidied', () => {
    assert.deepEqual(formData.skills, [{
      category: 'Languages',
      items: [
        { name: 'TypeScript', level: 'intermediate' },
        { name: 'Python', level: 'intermediate' },
        { name: 'Go', level: 'advanced' }
      ]
    }]);
  });

  test('contact links come from otherLinks; languages map to the stored scale', () => {
    assert.equal(formData.personalInfo.linkedin, 'https://www.linkedin.com/in/jordan-patel');
    assert.equal(formData.personalInfo.address, 'Austin, TX');
    assert.deepEqual(formData.languages, [{ name: 'Spanish', proficiency: 'fluent' }, { name: 'English', proficiency: 'native' }]);
    assert.equal(formData.title, 'Senior Software Engineer Resume');
  });

  test('report: extra sections kept, the line the AI missed is listed, nothing else', () => {
    assert.deepEqual(report.additionalSections, [{ title: 'Volunteering', items: ['Code Mentor, Girls Who Code Austin (2019 – Present)'] }]);
    assert.deepEqual(report.unplacedLines, ['Speaker at RegionalConf about tail latency budgets']);
    assert.equal(report.parsedBy, 'ai');
  });

  test('the result passes the server-side resume validation', async () => {
    const payload = normalizeResumePayload({ ...formData, personalInfo: { ...formData.personalInfo } });
    const doc = new Resume({ ...payload, user: new mongoose.Types.ObjectId() });
    await doc.validate();
  });
});

describe('normalizeParsedResume edge cases', () => {
  test('values too long for a field are kept in the report, not lost', () => {
    const raw = aiOutput();
    raw.workExperience[0].jobTitle = `Principal Engineer ${'and Architect '.repeat(10)}`;
    const { formData, report } = normalizeParsedResume(raw, { sourceText: '' });
    assert.ok(formData.workExperience[0].jobTitle.length <= 100);
    assert.equal(report.overflow[0].field, 'Job title');
    assert.ok(report.overflow[0].value.length > 100);
  });

  test('unreadable dates are reported; a single education year is the graduation date', () => {
    const raw = aiOutput();
    raw.workExperience[0].startDate = 'Spring term';
    raw.education[0].startDate = '';
    raw.education[0].endDate = '';
    raw.education[0].startDate = '2017';
    const { formData, report } = normalizeParsedResume(raw, { sourceText: '' });
    assert.match(report.warnings[0], /couldn't read the start date "Spring term"/);
    assert.equal(formData.education[0].endDate, '2017-01-01');
    assert.equal(formData.education[0].startDate, '');
  });

  test('projects: repository links go to githubUrl, over-long technologies move to the description', () => {
    const raw = aiOutput();
    raw.projects = [{
      name: 'RouteWise',
      description: '',
      highlights: ['Solves routing for 500 stops in under 2 s.'],
      technologies: ['TypeScript', 'PostGIS', 'A custom vehicle routing heuristic library written in Rust'],
      url: 'github.com/example/routewise',
      repositoryUrl: '',
      startDate: '2022',
      endDate: ''
    }];
    const { formData, report } = normalizeParsedResume(raw, { sourceText: '' });
    const [p] = formData.projects;
    assert.equal(p.githubUrl, 'https://github.com/example/routewise');
    assert.equal(p.url, '');
    assert.deepEqual(p.technologies, ['TypeScript', 'PostGIS']);
    assert.match(p.description, /Technologies: A custom vehicle routing heuristic library written in Rust/);
    assert.match(report.warnings[0], /too long for the Technologies field/);
  });

  test('a non-numeric grade stays visible in the description; summary sentences are not used as the title', () => {
    const raw = aiOutput();
    raw.education[0].grade = 'First Class Honours';
    raw.personalInfo.headline = 'Data analyst turned analytics engineer. I build dbt models.';
    const { formData } = normalizeParsedResume(raw, { sourceText: '' });
    assert.equal(formData.education[0].gpa, '');
    assert.equal(formData.education[0].description, '<p>Grade: First Class Honours</p>');
    assert.equal(formData.title, 'Senior Software Engineer Resume');
  });

  test('garbage in: empty shapes out, never a crash', () => {
    for (const raw of [null, 'text', 42, { workExperience: 'x', skills: [null, 3], education: [{}] }]) {
      const { formData } = normalizeParsedResume(raw, { sourceText: '' });
      assert.deepEqual(formData.workExperience, []);
      assert.deepEqual(formData.education, []);
      assert.equal(formData.isFresher, true);
    }
  });
});

describe('fallback parser (no AI)', () => {
  test('finds contacts and sections; keeps the rest as additional sections', () => {
    const parsed = heuristicParse(SOURCE_TEXT, []);
    const { formData, report } = normalizeParsedResume(parsed, { sourceText: SOURCE_TEXT, parsedBy: 'fallback' });
    assert.equal(formData.personalInfo.fullName, 'Jordan Avery Patel');
    assert.equal(formData.personalInfo.email, 'jordan.patel@example.com');
    assert.equal(formData.personalInfo.linkedin, 'https://www.linkedin.com/in/jordan-patel');
    assert.match(formData.summary, /Full-stack engineer/);
    assert.deepEqual(formData.skills[0].items.map((i) => i.name), ['TypeScript', 'Python', 'Go']);
    assert.deepEqual(report.additionalSections.map((s) => s.title), ['Experience', 'Education', 'Volunteering']);
    assert.equal(report.parsedBy, 'fallback');
  });

  test('findContacts ignores year ranges as phone numbers', () => {
    const found = findContacts('Jane Roe\n2019 2021\nCall +44 7700 900123\ngithub.com/janeroe', []);
    assert.equal(found.phone, '+44 7700 900123');
    assert.equal(found.github, 'https://github.com/janeroe');
  });
});
