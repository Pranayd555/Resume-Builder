const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Writable } = require('node:stream');
const mongoose = require('mongoose');
const winston = require('winston');

const logger = require('./logger');
const Resume = require('../models/Resume');
const errorHandler = require('../middleware/errorHandler');
const { errorMeta, requestMeta } = require('./logSafe');
const { redactCastValues, redactDuplicateKeys, maskEmails } = require('./logRedaction');

// Personal data planted in every fixture; none of it may reach a log line.
const SECRETS = ['Alice Secretname', 'alice.secret@example.com', '+91 98765 43210', 'Present', 'Acme Hidden Corp'];

const resumeWithBadDate = () => new Resume({
  user: new mongoose.Types.ObjectId(),
  title: 'Alice Secretname CV',
  personalInfo: { fullName: 'Alice Secretname', email: 'alice.secret@example.com', phone: '+91 98765 43210' },
  workExperience: [{ company: 'Acme Hidden Corp', jobTitle: 'Engineer', startDate: '2020-01-01', endDate: 'Present' }]
});

const validationErrorWithPresent = async () => {
  try {
    await resumeWithBadDate().validate();
  } catch (err) {
    return err;
  }
  throw new Error('expected a validation error');
};

const duplicateKeyError = () => Object.assign(
  new Error('E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "alice.secret@example.com" }'),
  { code: 11000, keyPattern: { email: 1 }, keyValue: { email: 'alice.secret@example.com' } }
);

const fakeReq = () => ({
  method: 'PUT',
  baseUrl: '/api/resumes',
  route: { path: '/:id' },
  path: '/abc',
  originalUrl: '/api/resumes/abc?token=reset-secret',
  user: { _id: 'user123', email: 'alice.secret@example.com' },
  body: { personalInfo: { fullName: 'Alice Secretname', phone: '+91 98765 43210' } }
});

const assertNoSecrets = (text) => {
  for (const secret of SECRETS) assert.ok(!text.includes(secret), `log leaked "${secret}": ${text}`);
  assert.ok(!text.includes('reset-secret'), `log leaked the query string: ${text}`);
};

describe('string redaction', () => {
  test('cast error values are removed, the path is kept', () => {
    const out = redactCastValues('Cast to date failed for value "Present" (type string) at path "endDate"');
    assert.equal(out, 'Cast to date failed for value [redacted] (type string) at path "endDate"');
  });

  test('every cast value in a combined message is removed', () => {
    const out = redactCastValues('a: Cast to date failed for value "x1" (type string) at path "a", b: Cast to Number failed for value "y2" at path "b"');
    assert.ok(!out.includes('x1') && !out.includes('y2'), out);
    assert.ok(out.includes('at path "a"') && out.includes('at path "b"'), out);
  });

  test('duplicate key values are removed', () => {
    assert.equal(redactDuplicateKeys('index: email_1 dup key: { email: "a@b.co" } more'), 'index: email_1 dup key: [redacted] more');
  });

  test('emails keep only the first letter and the domain', () => {
    assert.equal(maskEmails('User logged in: alice.secret@example.com.'), 'User logged in: a***@example.com.');
    assert.equal(maskEmails('to a@b.io and bob@x.org'), 'to a***@b.io and b***@x.org');
    assert.equal(maskEmails('no email @ here, @handle, user@localhost'), 'no email @ here, @handle, user@localhost');
  });

  test('long hostile input is handled in linear time', () => {
    const started = Date.now();
    redactCastValues('for value '.repeat(20000));
    maskEmails('a'.repeat(50000) + '@'.repeat(50000));
    assert.ok(Date.now() - started < 1000);
  });
});

describe('errorMeta / requestMeta', () => {
  test('validation error -> field paths and kinds, no values', async () => {
    const meta = errorMeta(await validationErrorWithPresent());
    assert.equal(meta.errorName, 'ValidationError');
    assert.ok(meta.fields.some((f) => f.path === 'workExperience.0.endDate' && f.kind === 'date'), JSON.stringify(meta));
    assertNoSecrets(JSON.stringify(meta));
  });

  test('duplicate key -> field name only', () => {
    const meta = errorMeta(duplicateKeyError());
    assert.deepEqual(meta.fields, [{ path: 'email', kind: 'unique' }]);
    assertNoSecrets(JSON.stringify(meta));
  });

  test('request -> method, route pattern and user id only', () => {
    assert.deepEqual(requestMeta(fakeReq()), { method: 'PUT', route: '/api/resumes/:id', userId: 'user123' });
  });
});

describe('logger output', () => {
  let lines;
  let transport;

  before(() => {
    lines = [];
    const stream = new Writable({ write(chunk, _enc, done) { lines.push(chunk.toString()); done(); } });
    transport = new winston.transports.Stream({ stream });
    logger.add(transport);
  });

  after(() => { logger.remove(transport); });

  const logged = () => lines.splice(0).join('\n');

  test('old-style logger.error(msg, mongooseError) keeps field paths but no values', async () => {
    logger.error('Update resume error:', await validationErrorWithPresent());
    const out = logged();
    assert.match(out, /workExperience\.0\.endDate/);
    assert.ok(!out.includes('"value"'), out);
    assertNoSecrets(out);
  });

  test('a request body passed as metadata is dropped', () => {
    logger.info('Form data request received:', { user: 'user123', body: fakeReq().body });
    const out = logged();
    assert.match(out, /user123/);
    assert.ok(!out.includes('"body"'), out);
    assertNoSecrets(out);
  });

  test('duplicate key errors and emails in messages are redacted', () => {
    logger.error('Register error:', duplicateKeyError());
    logger.info('User logged in: alice.secret@example.com');
    const out = logged();
    assert.match(out, /a\*\*\*@example\.com/);
    assertNoSecrets(out);
  });

  test('global error handler logs request metadata, answers 400 for a bad body value', async () => {
    const castError = new mongoose.Error.CastError('date', 'Present', 'workExperience.0.endDate');
    const res = { statusCode: 0, json(payload) { this.payload = payload; return this; }, status(code) { this.statusCode = code; return this; } };
    errorHandler(castError, fakeReq(), res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.payload.error, 'Invalid value for workExperience.0.endDate');

    errorHandler(await validationErrorWithPresent(), fakeReq(), res, () => {});
    assert.equal(res.statusCode, 400);

    const out = logged();
    assert.match(out, /"route":"\/api\/resumes\/:id"/);
    assert.match(out, /"userId":"user123"/);
    assert.match(out, /workExperience\.0\.endDate/);
    assertNoSecrets(out);
  });

  test('bad ObjectId in the URL is still a 404', () => {
    const res = { status(code) { this.statusCode = code; return this; }, json() { return this; } };
    errorHandler(new mongoose.Error.CastError('ObjectId', 'nope', '_id'), fakeReq(), res, () => {});
    assert.equal(res.statusCode, 404);
    logged();
  });
});

// Lint-style guard: no log call may be handed a whole request body or the
// rendered resume HTML again.
describe('source check', () => {
  const root = path.join(__dirname, '..');
  const skipDirs = new Set(['node_modules', 'logs', 'templates', 'assets', 'thumbnails']);
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.test.js')) {
        files.push(path.join(dir, entry.name));
      }
    }
  };
  walk(root);

  test('no logger/console call logs req.body, a whole resume or rendered HTML', () => {
    const offenders = [];
    const wholeBody = /req\.body(?![.[\w])/;
    for (const file of files) {
      fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
        const isLog = /\b(logger|console)\.(log|info|warn|error|debug)\(/.test(line);
        const leaks = /body:\s*req\.body\b/.test(line)
          || (isLog && (wholeBody.test(line) || /JSON\.stringify\(\s*(req|req\.body|resume|user)\s*[,)]/.test(line) || /htmlContent/.test(line)));
        if (leaks) offenders.push(`${path.relative(root, file)}:${i + 1}: ${line.trim()}`);
      });
    }
    assert.deepEqual(offenders, []);
  });
});
