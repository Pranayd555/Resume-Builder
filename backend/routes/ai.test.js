/**
 * AI routes end to end over HTTP: real routes, real chargeAIToken middleware,
 * the real @google/genai client pointed at a local stub (GOOGLE_GEMINI_BASE_URL).
 * Only the database calls are replaced (user lookup, token spend/refund).
 *
 * Checks that every failure refunds the token, BYOK users are never charged,
 * timeouts and bad model output are handled, and outputs are cleaned and
 * length-limited. All data is fictional.
 *
 * Run: node --test routes/ai.test.js
 */
const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.ENCRYPTION_KEY = 'test-encryption-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GEMINI_API_KEY = 'server-key';
process.env.GEMINI_MODEL = 'gemini-test';
process.env.NODE_ENV = 'test';

// ---- Gemini stub ---------------------------------------------------------
const stub = { queue: [], requests: [] };
const geminiReply = (text, finishReason = 'STOP') => ({
  status: 200,
  body: { candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason, index: 0 }] }
});
const geminiError = (status, message) => ({ status, body: { error: { code: status, message, status: 'UNAVAILABLE' } } });

const stubServer = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => { raw += c; });
  req.on('end', () => {
    stub.requests.push({ url: req.url, apiKey: req.headers['x-goog-api-key'], body: JSON.parse(raw || '{}') });
    const next = stub.queue.shift() || geminiError(500, 'no stubbed reply');
    setTimeout(() => {
      if (res.destroyed) return;
      res.writeHead(next.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(next.body));
    }, next.delayMs || 0);
  });
});

// ---- Database stand-ins --------------------------------------------------
const tokenCalculator = require('../utils/tokenCalculator');
const ledger = { spends: 0, refunds: [] };
tokenCalculator.spendTokens = async () => {
  ledger.spends += 1;
  return { ok: true, spent: { fromBonus: 1, fromPurchased: 0 }, balance: { purchased: 2, bonus: 2, total: 4 } };
};
tokenCalculator.refundSpend = async (userId, spent) => {
  ledger.refunds.push(spent);
  return { purchased: 2, bonus: 3, total: 5 };
};

const User = require('../models/User');
const { encrypt } = require('../utils/keyEncryption');
let currentUser;
User.findById = () => ({ select: async () => currentUser });

const express = require('express');
const jwt = require('jsonwebtoken');
const gemini = require('../services/geminiservice');
const { buildPdf } = require('../utils/testPdf');

let api;
let server;
const userId = '64b7f0c2a1b2c3d4e5f60718';
const auth = () => ({ Authorization: `Bearer ${jwt.sign({ id: userId }, process.env.JWT_SECRET)}` });

const post = async (path, body) => {
  const res = await fetch(`${api}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth() },
    body: JSON.stringify(body)
  });
  return { status: res.status, body: await res.json() };
};

const settle = () => new Promise((r) => { setTimeout(r, 30); });

before(async () => {
  await new Promise((r) => { stubServer.listen(0, '127.0.0.1', r); });
  process.env.GOOGLE_GEMINI_BASE_URL = `http://127.0.0.1:${stubServer.address().port}`;
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.use('/api/ai', require('./ai'));
  app.use('/api/uploads', require('./uploads'));
  server = app.listen(0, '127.0.0.1');
  await new Promise((r) => { server.once('listening', r); });
  api = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server.close();
  stubServer.close();
});

beforeEach(() => {
  stub.queue = [];
  stub.requests = [];
  ledger.spends = 0;
  ledger.refunds = [];
  currentUser = { _id: userId, id: userId, email: 'test@example.com', isOwnApiKey: false };
});

const JOB = '<ul><li>Responsible for the billing service and its on-call rotation for the payments team.</li></ul>';

describe('POST /api/ai/rewrite', () => {
  test('success: field-aware prompt, cleaned HTML, one token charged, none refunded', async () => {
    stub.queue.push(geminiReply(JSON.stringify({ content: 'Here you go:\n<ul><li>Owned the billing service</li><li>Ran on-call for payments</li></ul>' })));
    const { status, body } = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
    assert.equal(status, 200);
    assert.equal(body.data.rewrittenContent, '<ul><li>Owned the billing service</li><li>Ran on-call for payments</li></ul>');
    assert.equal(body.data.tokens.total, 4);
    assert.equal(ledger.spends, 1);
    assert.equal(ledger.refunds.length, 0);
    const sent = stub.requests[0].body;
    assert.match(sent.systemInstruction.parts[0].text, /ONE job/);
    assert.match(sent.systemInstruction.parts[0].text, /at most 6 bullet points/);
    assert.equal(sent.generationConfig.responseMimeType, 'application/json');
  });

  test('Gemini 3 reply (thought summary + thoughtSignature parts) -> only the answer text is used', async () => {
    const answer = JSON.stringify({ content: '<ul><li>Owned billing</li></ul>' });
    stub.queue.push({
      status: 200,
      body: {
        candidates: [{
          content: {
            role: 'model',
            parts: [
              { text: 'Considering how to tighten the bullet...', thought: true },
              { text: answer, thoughtSignature: 'c2lnbmF0dXJl' }
            ]
          },
          finishReason: 'STOP',
          index: 0
        }]
      }
    });
    const { status, body } = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
    assert.equal(status, 200);
    assert.equal(body.data.rewrittenContent, '<ul><li>Owned billing</li></ul>');
  });

  test('output longer than the field allows is cut to fit', async () => {
    stub.queue.push(geminiReply(JSON.stringify({ content: `<p>${'Built resilient payment platforms for global merchants. '.repeat(40)}</p>` })));
    const { status, body } = await post('/ai/rewrite', { content: '<p>Backend engineer who builds payment platforms for merchants.</p>', field: 'summary' });
    assert.equal(status, 200);
    assert.ok(body.data.rewrittenContent.replace(/<[^>]+>/g, '').length <= 700);
  });

  test('provider error (after one retry) -> mapped error and the token is refunded', async () => {
    stub.queue.push(geminiError(503, 'The model is overloaded'), geminiError(503, 'The model is overloaded'));
    const { status, body } = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
    await settle();
    assert.equal(status, 503);
    assert.equal(body.success, false);
    assert.equal(stub.requests.length, 2);
    assert.deepEqual(ledger.refunds, [{ fromBonus: 1, fromPurchased: 0 }]);
    assert.equal(body.tokens.total, 5);
  });

  test('transient error then success -> retried once, charged once', async () => {
    stub.queue.push(geminiError(503, 'overloaded'), geminiReply(JSON.stringify({ content: '<ul><li>Owned billing</li></ul>' })));
    const { status } = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
    assert.equal(status, 200);
    assert.equal(ledger.refunds.length, 0);
  });

  test('timeout -> 503 and refund', async () => {
    const saved = gemini.AI_TIMEOUTS.rewrite;
    gemini.AI_TIMEOUTS.rewrite = 150;
    stub.queue.push({ ...geminiReply('{"content":"<p>late</p>"}'), delayMs: 600 });
    try {
      const { status, body } = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
      await settle();
      assert.equal(status, 503);
      assert.match(body.error, /took too long/);
      assert.equal(ledger.refunds.length, 1);
    } finally {
      gemini.AI_TIMEOUTS.rewrite = saved;
    }
  });

  test('empty or blocked answers are errors, refunded', async () => {
    stub.queue.push(geminiReply('```html\n```'));
    let res = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
    await settle();
    assert.equal(res.status, 503);
    stub.queue.push(geminiReply('', 'SAFETY'));
    res = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
    await settle();
    assert.equal(res.status, 422);
    assert.equal(ledger.refunds.length, 2);
  });

  test('too little text -> 400 and refund, no model call', async () => {
    const { status, body } = await post('/ai/rewrite', { content: '<p>Hi there</p>' });
    await settle();
    assert.equal(status, 400);
    assert.match(body.error, /at least 20 characters/);
    assert.equal(stub.requests.length, 0);
    assert.equal(ledger.refunds.length, 1);
  });

  test('BYOK: the user\'s own key is used and no token is charged', async () => {
    currentUser = { ...currentUser, isOwnApiKey: true, geminiApiKey: encrypt('users-own-key') };
    stub.queue.push(geminiReply(JSON.stringify({ content: '<p>Condensed summary text.</p>' })));
    const { status, body } = await post('/ai/summarize', { content: '<p>A long summary that should be condensed into something shorter.</p>', field: 'summary' });
    assert.equal(status, 200);
    assert.equal(body.data.summary, '<p>Condensed summary text.</p>');
    assert.equal(stub.requests[0].apiKey, 'users-own-key');
    assert.equal(ledger.spends, 0);
  });

  test('a retired model: BYOK users are told to pick another model, others get a generic message', async () => {
    stub.queue.push(geminiError(404, 'This model models/gemini-old is no longer available.'));
    let res = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
    assert.equal(res.status, 503);
    assert.doesNotMatch(res.body.error, /Profile/);
    currentUser = { ...currentUser, isOwnApiKey: true, geminiApiKey: encrypt('users-own-key') };
    stub.queue.push(geminiError(404, 'This model models/gemini-old is no longer available.'));
    res = await post('/ai/rewrite', { content: JOB, field: 'workExperience' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /Choose another model in Profile/);
  });

  test('BYOK with an undecryptable key -> 400, never charged', async () => {
    currentUser = { ...currentUser, isOwnApiKey: true, geminiApiKey: 'garbage' };
    const { status } = await post('/ai/rewrite', { content: JOB });
    assert.equal(status, 400);
    assert.equal(ledger.spends, 0);
  });
});

describe('POST /api/uploads/parse-resume', () => {
  const resumePdf = () => buildPdf([
    { x: 40, y: 800, text: 'Jordan Avery Patel', size: 18 },
    { x: 40, y: 780, text: 'jordan.patel@example.com | +1 555 010 2234' },
    { x: 40, y: 750, text: 'EXPERIENCE' },
    { x: 40, y: 735, text: 'Senior Software Engineer, Northwind Logistics' },
    { x: 450, y: 735, text: 'Mar 2021 - Present' },
    { x: 50, y: 720, text: 'Led a team of 5 to rebuild the shipment tracking API in Go.' },
    { x: 40, y: 690, text: 'SKILLS' },
    { x: 40, y: 675, text: 'Go, TypeScript, PostgreSQL' }
  ]);

  const upload = async (buffer, type = 'application/pdf', name = 'resume.pdf') => {
    const form = new FormData();
    form.append('file', new Blob([buffer], { type }), name);
    const res = await fetch(`${api}/uploads/parse-resume`, { method: 'POST', headers: auth(), body: form });
    return { status: res.status, body: await res.json() };
  };

  const parsed = {
    personalInfo: { fullName: 'Jordan Avery Patel', headline: '', email: 'jordan.patel@example.com', phone: '+1 555 010 2234', location: '', website: '', linkedin: '', github: '', otherLinks: [] },
    summary: '',
    workExperience: [{ jobTitle: 'Senior Software Engineer', company: 'Northwind Logistics', location: '', startDate: 'Mar 2021', endDate: 'Present', description: '', highlights: ['Led a team of 5 to rebuild the shipment tracking API in Go.'] }],
    education: [],
    skills: [{ category: 'Skills', items: ['Go', 'TypeScript', 'PostgreSQL'] }],
    projects: [], certifications: [], achievements: [], languages: [], additionalSections: []
  };

  test('success: form-ready data and an import report', async () => {
    stub.queue.push(geminiReply(JSON.stringify(parsed)));
    const { status, body } = await upload(resumePdf());
    assert.equal(status, 200);
    const job = body.data.parsedData.workExperience[0];
    assert.equal(job.startDate, '2021-03-01');
    assert.equal(job.isCurrentJob, true);
    assert.match(job.description, /^<ul><li>Led a team/);
    assert.deepEqual(body.data.importReport.unplacedLines, []);
    assert.match(body.data.originalText, /Northwind Logistics \| Mar 2021 - Present/);
    assert.equal(ledger.spends, 1);
    assert.equal(ledger.refunds.length, 0);
    // the schema and the resume text went to the model
    const sent = stub.requests[0].body;
    assert.equal(sent.generationConfig.responseJsonSchema.type, 'object');
    assert.match(sent.contents[0].parts[0].text, /<resume>/);
  });

  test('AI failure: refunded, and the no-AI result is still returned', async () => {
    stub.queue.push(geminiError(500, 'internal'), geminiError(500, 'internal'));
    const { status, body } = await upload(resumePdf());
    await settle();
    assert.equal(status, 503);
    assert.equal(body.data.importReport.parsedBy, 'fallback');
    assert.equal(body.data.parsedData.personalInfo.email, 'jordan.patel@example.com');
    assert.ok(body.data.importReport.additionalSections.some((s) => s.title === 'Experience'));
    assert.equal(ledger.refunds.length, 1);
  });

  test('unreadable or unsupported files are rejected before any token is charged', async () => {
    let res = await upload(Buffer.from('not really a pdf'));
    assert.equal(res.status, 400);
    res = await upload(Buffer.from('old word file'), 'application/msword', 'resume.doc');
    assert.equal(res.status, 400);
    assert.match(res.body.error, /\.doc\) files are not supported/);
    assert.equal(ledger.spends, 0);
    assert.equal(stub.requests.length, 0);
  });
});
