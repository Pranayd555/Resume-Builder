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
  'password', 'token', 'accessToken', 'refreshToken',
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
  return maskEmails(redactDuplicateKeys(redactCastValues(text)));
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
  redactText,
  redactInfo
};
