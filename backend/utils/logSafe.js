/**
 * Make a value safe to interpolate into a log line (prevents log injection):
 * CR/LF are replaced so a request value cannot forge extra
 * log entries, and the length is capped.
 */
function logSafe(value, maxLength = 200) {
  return String(value ?? '').replace(/[\r\n]+/g, '_').slice(0, maxLength);
}

// First few stack frames, without the first line (it repeats the message,
// which for Mongoose errors contains the submitted values).
function stackFrames(err, count = 8) {
  if (typeof err?.stack !== 'string') return undefined;
  return err.stack.split('\n').slice(1, count + 1).map((line) => line.trim()).join('\n');
}

/**
 * Log-safe description of an error: name, code, a message and the field paths
 * involved, never the submitted values. Mongoose puts the value into CastError
 * messages and into errors[path].value, and MongoDB puts it into duplicate-key
 * messages, so those get a fixed message instead.
 */
function errorMeta(err) {
  const name = typeof err?.name === 'string' ? err.name : 'Error';
  const meta = { errorName: name };
  if (typeof err?.code === 'string' || typeof err?.code === 'number') meta.errorCode = err.code;

  if (name === 'ValidationError' && err.errors && typeof err.errors === 'object') {
    meta.error = logSafe(err._message || 'Validation failed');
    meta.fields = Object.entries(err.errors).map(([path, e]) => ({ path: logSafe(path), kind: logSafe(e?.kind) }));
  } else if (name === 'CastError') {
    meta.error = `Cast to ${logSafe(err.kind)} failed`;
    meta.fields = [{ path: logSafe(err.path), kind: logSafe(err.kind) }];
  } else if (err?.code === 11000) {
    meta.error = 'Duplicate key';
    meta.fields = Object.keys(err.keyPattern || err.keyValue || {}).map((path) => ({ path: logSafe(path), kind: 'unique' }));
  } else {
    meta.error = logSafe(err?.message ?? err, 500);
    meta.stack = stackFrames(err);
  }
  return meta;
}

/**
 * Log-safe description of a request: method, route pattern (no query string,
 * so tokens in reset links never reach the logs) and the user id. Never the
 * body, headers or anything else the user typed.
 */
function requestMeta(req) {
  const route = req?.route?.path ? `${req.baseUrl || ''}${req.route.path}` : req?.path;
  const userId = req?.user?._id ?? req?.user?.id;
  return {
    method: logSafe(req?.method, 10),
    route: logSafe(route),
    ...(userId ? { userId: logSafe(userId, 50) } : {})
  };
}

module.exports = { logSafe, errorMeta, requestMeta };
