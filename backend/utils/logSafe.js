/**
 * Make a value safe to interpolate into a log line (prevents log injection):
 * control characters such as CR/LF are replaced and the length is capped, so
 * a request value cannot forge extra log entries.
 */
// C0/C1 control characters plus the Unicode line/paragraph separators.
const CONTROL_CHARS = new RegExp('[\u0000-\u001F\u007F-\u009F\u2028\u2029]+', 'g');

function logSafe(value, maxLength = 200) {
  return String(value ?? '').replace(CONTROL_CHARS, ' ').slice(0, maxLength);
}

module.exports = { logSafe };
