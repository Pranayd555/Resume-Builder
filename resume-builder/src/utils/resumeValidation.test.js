import {
  toDateInputValue,
  isValidDateValue,
  isDateOrderValid,
  gpaError,
  validateResumeEntries,
  prepareResumePayload,
  normalizeImportedResume,
  mapServerErrors,
  stepForErrorKey,
  describeErrorKey,
  isBlankRow,
  isValidEmail,
  EMAIL_REGEX,
  EMAIL_MAX_LENGTH
} from './resumeValidation';
import { validators } from '../models/dataModels';

// Form state for a fully filled-in resume, as ResumeForm holds it.
const completeForm = () => ({
  title: 'Senior Developer Resume',
  personalInfo: {
    fullName: 'Test User',
    email: 'test.user@example.com',
    phone: '+91 98765 43210',
    address: 'Pune, India',
    website: '',
    linkedin: '',
    github: '',
    isAddPhoto: false,
    profilePicture: ''
  },
  summary: '<p>Summary</p>',
  isFresher: false,
  workExperience: [
    { jobTitle: 'Developer', company: 'Acme', location: '', startDate: '2021-01-01', endDate: '', isCurrentJob: true, description: '', achievements: [] }
  ],
  education: [
    { degree: 'M.Tech', institution: 'State University', location: '', startDate: '2024-07-01', endDate: '', isCurrentlyStudying: true, gpa: '9', description: '' }
  ],
  skills: [{ category: 'Languages', items: [{ name: 'JavaScript', level: 'advanced' }] }],
  projects: [{ name: 'App', description: '', technologies: ['React'], url: '', githubUrl: '', startDate: '', endDate: '' }],
  achievements: [],
  certifications: [],
  languages: [{ name: 'English', proficiency: 'fluent' }],
  extractedText: 'raw text from an uploaded file'
});

describe('date helpers', () => {
  test('normalize the shapes the form and resume parser produce', () => {
    expect(toDateInputValue('2021-03-15')).toBe('2021-03-15');
    expect(toDateInputValue('Mar 2021')).toBe('2021-03-01');
    expect(toDateInputValue('2021-03')).toBe('2021-03-01');
    expect(toDateInputValue('2021')).toBe('2021-01-01');
    expect(toDateInputValue('Present')).toBe('');
    expect(toDateInputValue('')).toBe('');
  });

  test('validity and ordering match the server (end may equal start)', () => {
    expect(isValidDateValue('')).toBe(true);
    expect(isValidDateValue('2021-02-30')).toBe(false);
    expect(isValidDateValue('whenever')).toBe(false);
    expect(isDateOrderValid('2021-01-01', '2021-01-01')).toBe(true);
    expect(isDateOrderValid('2021-01-02', '2021-01-01')).toBe(false);
    expect(isDateOrderValid('2021-01-01', '')).toBe(true);
  });

  test('GPA accepts 0-100 with up to 2 decimals', () => {
    expect(gpaError('8.5')).toBeNull();
    expect(gpaError('85')).toBeNull();
    expect(gpaError('')).toBeNull();
    expect(gpaError('101')).toMatch(/between 0 and 100/);
    expect(gpaError('8.555')).toMatch(/2 decimal/);
    expect(gpaError('abc')).toMatch(/number/);
  });
});

describe('validateResumeEntries', () => {
  test('a complete resume has no errors', () => {
    expect(validateResumeEntries(completeForm())).toEqual({});
  });

  test('a minimal resume (title, name, email) has no errors', () => {
    expect(validateResumeEntries({ title: 'CV', personalInfo: { fullName: 'A B', email: 'a@b.co' } })).toEqual({});
  });

  test('"Currently studying" needs no end date', () => {
    const f = completeForm();
    expect(f.education[0].endDate).toBe('');
    expect(validateResumeEntries(f)).toEqual({});
  });

  test('blank rows are ignored (they are stripped before submit)', () => {
    const f = completeForm();
    f.workExperience.push({ jobTitle: '', company: '', startDate: '', endDate: '', isCurrentJob: false, description: '<p></p>', achievements: [] });
    f.projects.push({ name: '', technologies: [] });
    f.languages.push({ name: '', proficiency: 'conversational' });
    f.skills[0].items.push({ name: '', level: 'intermediate' });
    expect(validateResumeEntries(f)).toEqual({});
  });

  test('flags everything the server would reject, keyed to the form field', () => {
    const f = completeForm();
    f.title = 'x'.repeat(101);
    f.personalInfo.email = 'not-an-email';
    f.personalInfo.phone = '1'.repeat(21);
    f.workExperience[0] = { ...f.workExperience[0], company: '', isCurrentJob: false, endDate: '2020-01-01' };
    f.education[0] = { ...f.education[0], isCurrentlyStudying: false, endDate: '' };
    f.skills[0].category = '';
    f.projects[0].technologies = ['x'.repeat(51)];
    f.certifications = [{ name: 'AWS', issuer: '' }];
    const errors = validateResumeEntries(f);
    expect(Object.keys(errors).sort()).toEqual([
      'certifications_0_issuer',
      'education_0_endDate',
      'email',
      'phone',
      'projects_0_technologies',
      'skills_0_category',
      'title',
      'workExperience_0_company',
      'workExperience_0_dateRange'
    ]);
  });
});

describe('prepareResumePayload', () => {
  test('strips blank rows and UI-only fields, and maps rows back to the form', () => {
    const f = completeForm();
    f.projects.unshift({ name: '', technologies: [] });
    f.skills.unshift({ category: '', items: [{ name: '', level: 'intermediate' }] });
    f.skills[1].items.unshift({ name: '  ', level: 'intermediate' });
    const { payload, indexMap } = prepareResumePayload(f);

    expect(payload.extractedText).toBeUndefined();
    expect(payload.projects).toHaveLength(1);
    expect(indexMap.projects).toEqual([1]);
    expect(payload.skills).toHaveLength(1);
    expect(payload.skills[0].items.map(i => i.name)).toEqual(['JavaScript']);
    expect(indexMap.skills).toEqual([{ index: 1, items: [1] }]);
    expect(payload.education[0].gpa).toBe(9);
  });

  test('current job / currently studying send no end date', () => {
    const f = completeForm();
    f.workExperience[0].endDate = '2019-01-01';
    f.education[0].endDate = 'Present';
    const { payload } = prepareResumePayload(f);
    expect(payload.workExperience[0].endDate).toBe('');
    expect(payload.education[0].endDate).toBe('');
    expect(payload.education[0].isCurrentlyStudying).toBe(true);
  });

  test('freshers send no work experience', () => {
    const { payload } = prepareResumePayload({ ...completeForm(), isFresher: true });
    expect(payload.workExperience).toEqual([]);
  });
});

describe('normalizeImportedResume', () => {
  test('turns parser output into date-picker values and checkbox flags', () => {
    const out = normalizeImportedResume({
      workExperience: [{ jobTitle: 'Dev', company: 'Acme', startDate: 'Jan 2021', endDate: 'Present', isCurrentJob: false }],
      education: [{ degree: 'BSc', institution: 'Uni', startDate: '2016', endDate: '2019', isCurrentlyStudying: false, gpa: 3.8 }],
      skills: [{ category: 'Tools', items: [{ name: 'Git', level: 'Expert' }] }],
      languages: [{ name: 'French', proficiency: 'Intermediate' }]
    });
    expect(out.workExperience[0]).toMatchObject({ startDate: '2021-01-01', endDate: '', isCurrentJob: true });
    expect(out.education[0]).toMatchObject({ startDate: '2016-01-01', endDate: '2019-01-01', gpa: '3.8' });
    expect(out.skills[0].items[0].level).toBe('expert');
    expect(out.languages[0].proficiency).toBe('conversational');
  });
});

describe('mapServerErrors', () => {
  test('maps server paths to form keys using the original row indexes', () => {
    const indexMap = { education: [2], workExperience: [0, 3], skills: [{ index: 1, items: [4] }] };
    const errors = mapServerErrors([
      { field: 'personalInfo.email', message: 'Please provide a valid email' },
      { field: 'education.0.endDate', message: 'End date is required' },
      { field: 'workExperience.1.endDate', message: 'End date cannot be before start date' },
      { field: 'skills.0.category', message: 'Skill category is required' },
      { field: 'skills.0.items.0.name', message: 'Skill name cannot exceed 500 characters' },
      { path: 'title', msg: 'Resume title is required' } // express-validator shape
    ], indexMap);
    expect(errors).toEqual({
      email: 'Please provide a valid email',
      education_2_endDate: 'End date is required',
      workExperience_3_dateRange: 'End date cannot be before start date',
      skills_1_category: 'Skill category is required',
      skills_1_4_name: 'Skill name cannot exceed 500 characters',
      title: 'Resume title is required'
    });
  });

  test('every key lands on a form step with a readable label', () => {
    expect(stepForErrorKey('title')).toBe(1);
    expect(stepForErrorKey('email')).toBe(2);
    expect(stepForErrorKey('education_2_endDate')).toBe(4);
    expect(stepForErrorKey('languages_0_name')).toBe(8);
    expect(describeErrorKey('education_2_endDate')).toBe('Education #3');
    expect(describeErrorKey('title')).toBeNull();
  });
});

describe('ReDoS safety', () => {
  const time = (fn) => {
    const start = performance.now();
    const result = fn();
    return { result, ms: performance.now() - start };
  };
  const attacks = (n) => [
    'a'.repeat(n) + '@' + 'a.'.repeat(n / 2) + ' ',
    'a@' + 'a.'.repeat(n / 2) + 'a ',
    'a@' + 'a'.repeat(n) + ' '
  ];

  test('email: accepts normal addresses, rejects malformed ones', () => {
    ['a@b.co', 'first.last+cv@company.technology', 'x-y_z@mail.sub.example.co.in', 'name@my-company.io']
      .forEach(email => expect(isValidEmail(email)).toBe(true));
    ['a@b', 'a@b.c', 'a @b.com', 'a@@b.com', 'a@b..com', '@b.com', 'a@b.com.', '']
      .forEach(email => expect(isValidEmail(email)).toBe(false));
    expect(isValidEmail('a'.repeat(EMAIL_MAX_LENGTH) + '@example.com')).toBe(false);
  });

  test('email regex is linear: 100,000-character attack strings fail in < 50 ms', () => {
    attacks(100000).forEach(input => {
      const { result, ms } = time(() => EMAIL_REGEX.test(input));
      expect(result).toBe(false);
      expect(ms).toBeLessThan(50);
    });
  });

  test('form validation and validators.email reject a 100,000-character email in < 50 ms', () => {
    const email = attacks(100000)[0];
    const { result, ms } = time(() => validateResumeEntries({ title: 'CV', personalInfo: { fullName: 'A', email } }));
    expect(result.email).toMatch(/cannot exceed 254/);
    expect(ms).toBeLessThan(50);
    const check = time(() => validators.email(email));
    expect(check.result).toBe(false);
    expect(check.ms).toBeLessThan(50);
  });

  test('blank-row HTML stripping is linear on "<<<<…" input', () => {
    const { result, ms } = time(() => isBlankRow('workExperience', { description: '<'.repeat(100000) }));
    expect(result).toBe(true);
    expect(ms).toBeLessThan(50);
    expect(isBlankRow('workExperience', { description: '<p>&nbsp;</p>' })).toBe(true);
    expect(isBlankRow('workExperience', { description: '<p>Built <b>it</b></p>' })).toBe(false);
  });

  test('date parsing ignores oversized input quickly', () => {
    const { result, ms } = time(() => toDateInputValue('Jan' + ' '.repeat(100000) + 'x'));
    expect(isValidDateValue(result)).toBe(false);
    expect(ms).toBeLessThan(50);
  });
});
