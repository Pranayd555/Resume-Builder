/**
 * Make a value safe to interpolate into a log line (prevents log injection,
 * Sonar rule S5145): CR/LF are replaced so a request value cannot forge extra
 * log entries, and the length is capped.
 */
function logSafe(value, maxLength = 200) {
  return String(value ?? '').replace(/[\r\n]+/g, '_').slice(0, maxLength);
}

module.exports = { logSafe };
