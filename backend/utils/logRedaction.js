/**
 * Keeps personal data out of the logs. Used as a winston format in
 * utils/logger.js, so it applies to every log call, including the older
 * `logger.error('Something failed:', error)` calls that hand winston a whole
 * error object.
 *
 * What it removes:
 * - request bodies and other whole objects (`body`, `personalInfo`, `headers`, ...)
 * - the submitted values Mongoose copies into errors (`value`, `stringValue`,
 *   `keyValue`, and the `for value "..."` part of cast error messages)
 * - MongoDB duplicate-key values (`dup key: { email: "..." }`)
 * - session tokens (JWTs), OAuth codes, OTPs, passwords, API keys and the
 *   reset/verify/share tokens in URLs (query parameters and path segments)
 * - email addresses in messages (kept as `a***@example.com`, so the domain
 *   still helps with delivery problems)
 *
 * What it keeps: messages, field paths, error kinds, ids and stack frames.
 *
 * All string scanning is done with indexOf loops, not regexes, so a large or
 * hostile value can't cause slow backtracking.
 */

// Top-level keys that never belong in a log entry.
const DROPPED_KEYS = new Set([
  'body', 'rawBody', 'requestBody', 'reqBody', 'headers', 'cookies',
  'password', 'token', 'accessToken', 'refreshToken', 'idToken', 'authorization',
  'otp', 'secret', 'apiKey', 'jwt',
  'personalInfo', 'resume', 'resumeData', 'formData',
  // Mongoose / MongoDB error properties that hold the submitted value
  'value', 'stringValue', 'valueType', 'reason', 'keyValue', 'errorResponse', 'properties'
]);

const REDACTED = '[redacted]';

// `Cast to date failed for value "Present" (type string) at path "endDate"`
// -> `Cast to date failed for value [redacted] (type string) at path "endDate"`
function redactCastValues(text) {
  const marker = 'for value ';
  let out = '';
  let from = 0;
  let idx = text.indexOf(marker, from);
  while (idx !== -1) {
    const valueStart = idx + marker.length;
    const ends = [text.indexOf(' (type ', valueStart), text.indexOf(' at path ', valueStart)]
      .filter((n) => n !== -1);
    const valueEnd = ends.length ? Math.min(...ends) : text.length;
    out += text.slice(from, valueStart) + REDACTED;
    from = valueEnd;
    idx = text.indexOf(marker, from);
  }
  return out + text.slice(from);
}

// `E11000 duplicate key error ... dup key: { email: "a@b.com" }` -> `dup key: [redacted]`
function redactDuplicateKeys(text) {
  const marker = 'dup key: ';
  let out = '';
  let from = 0;
  let idx = text.indexOf(marker, from);
  while (idx !== -1) {
    const valueStart = idx + marker.length;
    const close = text.indexOf('}', valueStart);
    out += text.slice(from, valueStart) + REDACTED;
    from = close === -1 ? text.length : close + 1;
    idx = text.indexOf(marker, from);
  }
  return out + text.slice(from);
}

// Query parameters whose values are credentials (OAuth codes, session tokens, OTPs...).
const SECRET_PARAMS = new Set([
  'token', 'access_token', 'refresh_token', 'id_token', 'code', 'otp', 'password',
  'secret', 'client_secret', 'key', 'api_key', 'apikey', 'signature', 'sig'
]);
// Routes that take a token as a path segment (see routes/auth.js, routes/resumes.js).
const SECRET_PATH_MARKERS = ['/verify-email/', '/reset-password/', '/shared/'];

const isValueEnd = (c) => c === '&' || c === '#' || c === '"' || c === "'" || c === '<' || c === '>' || c === ' ' || c === '\t' || c === '\n';
const isSegmentEnd = (c) => isValueEnd(c) || c === '/' || c === '?';
const isTokenChar = (c) => /[A-Za-z0-9._~+/=-]/.test(c);
const isJwtChar = (c) => /[A-Za-z0-9_.-]/.test(c);

// ?token=abc&x=1 -> ?token=[redacted]&x=1 (any SECRET_PARAMS name, case-insensitive)
function redactSecretParams(text) {
  let out = '';
  let from = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '?' && text[i] !== '&') continue;
    // Parameter names are short; scanning at most 31 chars keeps this linear.
    let eq = i + 1;
    while (eq < text.length && eq - i <= 31 && text[eq] !== '=' && text[eq] !== '?' && !isValueEnd(text[eq])) eq++;
    if (text[eq] !== '=') continue;
    if (!SECRET_PARAMS.has(text.slice(i + 1, eq).toLowerCase())) continue;
    if (text.startsWith('[redacted', eq + 1)) continue; // already masked (e.g. a JWT)
    let end = eq + 1;
    while (end < text.length && !isValueEnd(text[end])) end++;
    if (end === eq + 1) continue;
    out += text.slice(from, eq + 1) + REDACTED;
    from = end;
    i = end - 1;
  }
  return out + text.slice(from);
}

// Text after `marker` up to the end of a value/segment -> [redacted].
function redactAfter(text, marker, isEnd, isChar = () => true) {
  let out = '';
  let from = 0;
  let idx = text.indexOf(marker, from);
  while (idx !== -1) {
    const start = idx + marker.length;
    let end = start;
    while (end < text.length && !isEnd(text[end]) && isChar(text[end])) end++;
    out += text.slice(from, start) + (end > start ? REDACTED : '');
    from = end;
    idx = text.indexOf(marker, from);
  }
  return out + text.slice(from);
}

// Any JWT-shaped string (eyJ<header>.<payload>.<signature>) -> [redacted-jwt]
function redactJwts(text) {
  let out = '';
  let from = 0;
  let idx = text.indexOf('eyJ', from);
  while (idx !== -1) {
    let end = idx;
    let dots = 0;
    while (end < text.length && isJwtChar(text[end])) {
      if (text[end] === '.') dots++;
      end++;
    }
    if (dots >= 2 && end - idx > 20) {
      out += text.slice(from, idx) + '[redacted-jwt]';
    } else {
      out += text.slice(from, end);
    }
    from = end;
    idx = text.indexOf('eyJ', from);
  }
  return out + text.slice(from);
}

// Session tokens, OAuth codes, OTPs, reset/verify/share tokens and API keys.
function redactSecrets(text) {
  let out = redactJwts(text);
  out = redactSecretParams(out);
  for (const marker of SECRET_PATH_MARKERS) out = redactAfter(out, marker, isSegmentEnd);
  out = redactAfter(out, 'Bearer ', isValueEnd, isTokenChar);
  return out;
}

const isLocalChar = (c) => /[A-Za-z0-9._%+-]/.test(c);
const isDomainChar = (c) => /[A-Za-z0-9.-]/.test(c);

// alice.smith@example.com -> a***@example.com
function maskEmails(text) {
  let out = '';
  let from = 0;
  let at = text.indexOf('@', from);
  while (at !== -1) {
    let start = at;
    while (start > from && isLocalChar(text[start - 1])) start--;
    let end = at + 1;
    while (end < text.length && isDomainChar(text[end])) end++;
    while (end > at + 1 && text[end - 1] === '.') end--; // sentence-ending dot
    const domain = text.slice(at + 1, end);
    if (start < at && domain.includes('.')) {
      out += text.slice(from, start) + text[start] + '***@' + domain;
    } else {
      out += text.slice(from, end);
    }
    from = end;
    at = text.indexOf('@', from);
  }
  return out + text.slice(from);
}

function redactText(text) {
  if (typeof text !== 'string' || text.length === 0) return text;
  return maskEmails(redactSecrets(redactDuplicateKeys(redactCastValues(text))));
}

// Mongoose ValidationError.errors ({ 'workExperience.0.endDate': CastError, ... })
// or an express-validator errors array -> field paths and kinds only.
function summarizeFieldErrors(errors) {
  if (Array.isArray(errors)) {
    return errors.map((e) => ({ path: String(e?.path ?? e?.param ?? ''), kind: e?.type ?? e?.kind }));
  }
  return Object.entries(errors).map(([path, e]) => ({ path, kind: e?.kind }));
}

/**
 * Returns a copy of a winston info object with personal data removed.
 * Symbol keys (winston's level/splat bookkeeping) are kept as they are.
 */
function redactInfo(info) {
  for (const key of Object.keys(info)) {
    if (DROPPED_KEYS.has(key)) {
      delete info[key];
    } else if (key === 'errors' && info.errors && typeof info.errors === 'object') {
      info.fields = summarizeFieldErrors(info.errors);
      delete info.errors;
    } else if (typeof info[key] === 'string') {
      info[key] = redactText(info[key]);
    }
  }
  return info;
}

module.exports = {
  DROPPED_KEYS,
  redactCastValues,
  redactDuplicateKeys,
  maskEmails,
  redactSecrets,
  redactText,
  redactInfo
};
