// Gemini access for every AI feature: client creation (server key or the
// user's own key), one generate helper with a timeout and a single retry on
// transient errors, and strict JSON parsing for structured output.
const { GoogleGenAI } = require('@google/genai');
const { decryptUserGeminiKey } = require('../utils/keyEncryption');
const { PARSE_RESUME_SCHEMA, PARSE_SYSTEM_INSTRUCTION, buildParsePrompt } = require('../utils/resumeImport');
const { stripCodeFences } = require('../utils/aiOutput');
require('dotenv').config();

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

// Per-call time limits. The browser waits longer (src/config/timeouts.js), so
// the server always answers first, with a clear error and a refunded token.
const AI_TIMEOUTS = {
  parseResume: 90000,
  rewrite: 45000,
  atsScore: 75000,
  resumeEdit: 90000,
  template: 90000
};

/** The model returned nothing usable (empty, blocked, cut off, or not the JSON we asked for). */
class AIOutputError extends Error {
  constructor(message, reason = 'invalid') {
    super(message);
    this.name = 'AIOutputError';
    this.reason = reason;
  }
}

/** The model did not answer within the time limit. */
class AITimeoutError extends Error {
  constructor(ms) {
    super(`AI request timed out after ${ms} ms`);
    this.name = 'AITimeoutError';
    this.code = 'AI_TIMEOUT';
  }
}

const resolveGeminiModel = (req) => {
  const userModel = req?.user?.geminiModel;
  if (typeof userModel === 'string' && userModel.trim()) return userModel.trim();
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
};

/**
 * Gemini client for this request: the user's own key (BYOK) or the server key.
 * On a configuration problem it sends the error response itself and returns null,
 * so callers must stop when they get null.
 */
function createGoogleGenAI(req, res) {
  const apiKey = req.user.isOwnApiKey
    ? decryptUserGeminiKey(req.user.geminiApiKey)
    : process.env.GEMINI_API_KEY;
  if (req.user.isOwnApiKey && !apiKey) {
    res.status(400).json({
      success: false,
      error:
        'Your saved API key could not be decrypted. Re-enter your Gemini API key in Profile and save, or set ENCRYPTION_KEY to match the server where that key was first saved.',
    });
    return null;
  }
  if (!apiKey) {
    res.status(500).json({
      success: false,
      error: 'AI service is not configured.',
    });
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

const statusOf = (error) => {
  const status = Number(error?.status ?? error?.code);
  return Number.isFinite(status) ? status : 0;
};

const isTransient = (error) => {
  if (error instanceof AITimeoutError || error instanceof AIOutputError) return false;
  const status = statusOf(error);
  if (status === 500 || status === 502 || status === 503) return true;
  return ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED'].includes(error?.code);
};

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/** Run one model call, rejecting with AITimeoutError after `timeoutMs` (and aborting the request). */
const callWithTimeout = async (client, params, timeoutMs) => {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AITimeoutError(timeoutMs));
    }, timeoutMs);
  });
  try {
    const request = client.models.generateContent({
      ...params,
      config: { ...params.config, abortSignal: controller.signal }
    });
    return await Promise.race([request, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

const BLOCKED_REASONS = new Set(['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION']);

const readResponse = (response, { json }) => {
  const candidate = response?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  const blockReason = response?.promptFeedback?.blockReason;
  if (blockReason || BLOCKED_REASONS.has(finishReason)) {
    throw new AIOutputError(`AI response blocked (${blockReason || finishReason})`, 'blocked');
  }
  const text = typeof response?.text === 'string' ? response.text : '';
  if (!text.trim()) throw new AIOutputError('AI returned an empty response', 'empty');
  // Cut-off JSON can't be repaired reliably; cut-off rich text is trimmed by the length guards.
  if (json && finishReason === 'MAX_TOKENS') throw new AIOutputError('AI response was cut off', 'truncated');
  return text;
};

/**
 * One model call with the shared safety net.
 * @param {object} opts
 * @param {object} opts.client        GoogleGenAI instance
 * @param {string} opts.model
 * @param {string} opts.contents      user content (the data)
 * @param {string} [opts.systemInstruction]  the task and rules
 * @param {object} [opts.schema]      JSON Schema -> structured JSON output
 * @param {number} [opts.temperature]
 * @param {number} [opts.maxOutputTokens]
 * @param {number} opts.timeoutMs
 * @returns {Promise<string>} response text
 */
async function generate({ client, model, contents, systemInstruction, schema, temperature = 0.4, maxOutputTokens = 4096, timeoutMs }) {
  const config = { temperature, maxOutputTokens };
  if (systemInstruction) config.systemInstruction = systemInstruction;
  if (schema) {
    config.responseMimeType = 'application/json';
    config.responseJsonSchema = schema;
  }
  const params = { model, contents, config };
  let response;
  try {
    response = await callWithTimeout(client, params, timeoutMs);
  } catch (error) {
    if (!isTransient(error)) throw error;
    await wait(800);
    response = await callWithTimeout(client, params, timeoutMs);
  }
  return readResponse(response, { json: Boolean(schema) });
}

/** Parse a JSON object from model output. Strict: no guessing at broken JSON. */
const parseJsonObject = (text) => {
  const cleaned = stripCodeFences(text);
  const attempts = [cleaned];
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first > 0 || (last !== -1 && last < cleaned.length - 1)) attempts.push(cleaned.slice(first, last + 1));
  for (const candidate of attempts) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    } catch {
      // try the next candidate
    }
  }
  throw new AIOutputError('AI response was not valid JSON', 'invalid_json');
};

/** generate() + parseJsonObject(). */
async function generateJson(opts) {
  const text = await generate({ temperature: 0, ...opts });
  return parseJsonObject(text);
}

/** Resume text -> raw parsed JSON (shape: PARSE_RESUME_SCHEMA). Normalise it with resumeImport.normalizeParsedResume. */
async function parseResumeText(extractedText, client, model) {
  return generateJson({
    client,
    model,
    contents: buildParsePrompt(extractedText),
    systemInstruction: PARSE_SYSTEM_INSTRUCTION,
    schema: PARSE_RESUME_SCHEMA,
    temperature: 0,
    maxOutputTokens: 16384,
    timeoutMs: AI_TIMEOUTS.parseResume
  });
}

module.exports = {
  AI_TIMEOUTS,
  AIOutputError,
  AITimeoutError,
  DEFAULT_MODEL,
  generate,
  generateJson,
  parseJsonObject,
  parseResumeText,
  resolveGeminiModel,
  createGoogleGenAI
};
