const logger = require('./logger');

function safeJsonParse(str) {
  if (typeof str !== 'string') return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function extractJsonObjectFromString(str) {
  if (typeof str !== 'string') return null;
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return safeJsonParse(str.slice(firstBrace, lastBrace + 1));
}

function getGeminiProviderError(err) {
  if (!err) return null;

  // Some SDK errors already expose structured info
  const direct =
    err?.error?.code || err?.error?.message || err?.error?.status
      ? err.error
      : null;
  if (direct) return { error: direct };

  // Common case in @google/genai: message contains JSON like {"error":{...}}
  const fromMessage =
    safeJsonParse(err.message) ||
    extractJsonObjectFromString(err.message) ||
    extractJsonObjectFromString(String(err));

  if (fromMessage?.error) return fromMessage;
  return null;
}

function normalizeGeminiError(err, context = {}) {
  const model = context.model;
  const isOwnApiKey = !!context.isOwnApiKey;

  const providerPayload = getGeminiProviderError(err);
  const providerError = providerPayload?.error;

  const providerCode = providerError?.code ?? err?.status ?? err?.code;
  const providerStatus = providerError?.status ?? err?.status;
  const providerMessage =
    providerError?.message ||
    err?.message ||
    'Unknown AI provider error';

  const numericCode =
    typeof providerCode === 'number'
      ? providerCode
      : typeof providerStatus === 'number'
        ? providerStatus
        : undefined;

  // Network / timeout-ish errors
  const nodeErrCode = typeof err?.code === 'string' ? err.code : undefined;
  const isNetworkish =
    nodeErrCode &&
    ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND'].includes(
      nodeErrCode,
    );

  const lowerMsg = String(providerMessage || '').toLowerCase();

  let httpStatus = 500;
  let type = 'AI_ERROR';
  let retryable = false;
  let userMessage = 'AI request failed. Please try again.';

  if (isNetworkish) {
    httpStatus = 503;
    type = 'AI_UNAVAILABLE';
    retryable = true;
    userMessage = 'AI service is temporarily unavailable. Please try again.';
  } else if (numericCode === 429 || lowerMsg.includes('rate limit')) {
    httpStatus = 429;
    type = 'AI_RATE_LIMIT';
    retryable = true;
    userMessage =
      'Too many requests to the AI service. Please wait a moment and try again.';
  } else if (numericCode === 503 || lowerMsg.includes('high demand') || lowerMsg.includes('unavailable')) {
    httpStatus = 503;
    type = 'AI_OVERLOADED';
    retryable = true;
    userMessage =
      'This AI model is currently experiencing high demand. Please try again shortly.';
  } else if (numericCode === 401 || numericCode === 403 || lowerMsg.includes('api key') || lowerMsg.includes('permission')) {
    type = 'AI_AUTH';
    retryable = false;
    if (isOwnApiKey) {
      httpStatus = 400;
      userMessage =
        'Your Gemini API key is invalid or has insufficient permissions. Update it in Profile and try again.';
    } else {
      httpStatus = 502;
      userMessage =
        'AI service authentication failed. Please contact support.';
    }
  } else if (
    lowerMsg.includes('model') &&
    (lowerMsg.includes('not found') ||
      lowerMsg.includes('unknown') ||
      lowerMsg.includes('unsupported') ||
      lowerMsg.includes('invalid'))
  ) {
    httpStatus = 400;
    type = 'AI_MODEL';
    retryable = false;
    userMessage = model
      ? `The configured AI model "${model}" is invalid or unavailable. Update your model in Profile and try again.`
      : 'The configured AI model is invalid or unavailable. Update your model in Profile and try again.';
  } else if (
    numericCode === 400 ||
    lowerMsg.includes('invalid argument') ||
    lowerMsg.includes('bad request') ||
    lowerMsg.includes('failed to parse') ||
    lowerMsg.includes('json')
  ) {
    httpStatus = 400;
    type = 'AI_BAD_REQUEST';
    retryable = false;
    userMessage = 'AI request was invalid. Please check your input and try again.';
  } else if (numericCode && numericCode >= 500) {
    httpStatus = 502;
    type = 'AI_PROVIDER_ERROR';
    retryable = true;
    userMessage = 'AI provider error. Please try again.';
  }

  return {
    httpStatus,
    payload: {
      success: false,
      error: userMessage,
      details: {
        type,
        provider: 'gemini',
        retryable,
        model: model || undefined,
        providerCode: numericCode || undefined,
      },
    },
    provider: {
      code: numericCode,
      status: providerStatus,
      message: providerMessage,
    },
  };
}

function sendAIError(res, err, context = {}, options = {}) {
  const normalized = normalizeGeminiError(err, context);

  // Keep logs detailed, but never leak secrets to client
  logger.error(
    `AI error (${normalized.payload.details.type})`,
    {
      httpStatus: normalized.httpStatus,
      model: normalized.payload.details.model,
      providerCode: normalized.provider.code,
      providerStatus: normalized.provider.status,
      providerMessage: normalized.provider.message,
    },
  );

  const extra = options && typeof options === 'object' ? options.extra : undefined;
  if (extra && typeof extra === 'object') {
    return res
      .status(normalized.httpStatus)
      .json({ ...normalized.payload, ...extra });
  }

  return res.status(normalized.httpStatus).json(normalized.payload);
}

module.exports = {
  normalizeGeminiError,
  sendAIError,
};

