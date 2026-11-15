const crypto = require('crypto');
const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { protect, chargeAIToken, trackUsage, skipIfBYOK } = require('../middleware/auth');
const { getTokenBalance, tokenPayload } = require('../utils/tokenCalculator');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');
const { logSafe } = require('../utils/logSafe');
const DocumentParser = require('../utils/documentParser');
const { sendAIError } = require('../utils/aiError');
const {
  AI_TIMEOUTS,
  AIOutputError,
  generate,
  generateJson,
  parseJsonObject,
  resolveGeminiModel,
  createGoogleGenAI
} = require('../services/geminiservice');
const {
  buildRewritePrompt,
  ATS_SCHEMA,
  ATS_SYSTEM_INSTRUCTION,
  buildAtsContents,
  ADJUST_TONE_SCHEMA,
  buildAdjustToneInstruction,
  KEYWORDS_SCHEMA,
  buildKeywordsInstruction,
  buildTemplatePrompt
} = require('../utils/aiPrompts');
const { budgetFor, finalizeRichText, htmlToPlainText, sanitizeRichText } = require('../utils/aiOutput');
const {
  buildAtsResumeText,
  normalizeAtsAnalysis,
  hasAtsScores,
  trimJobDescription,
  buildRewriteInput,
  hasInput,
  mergeToneResult,
  mergeKeywordResult,
  sanitizeTemplateHtml
} = require('../utils/aiResults');

const router = express.Router();

const MIN_TEXT_CHARS = 20;
const MAX_INPUT_CHARS = 20000;
const REWRITE_FIELDS = ['summary', 'workExperience', 'projects', 'education', 'achievements', 'general'];
const TONE_SECTIONS = ['summary', 'workExperience', 'projects', 'education', 'achievements'];
const KEYWORD_SECTIONS = ['workExperience', 'projects', 'education', 'skills'];

// Job description files for the ATS check: PDF or DOCX.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (DocumentParser.isValidDocumentType(file.mimetype)) return cb(null, true);
    return cb(new Error('Only PDF and Word (.docx) files are allowed for the job description.'), false);
  },
});

const receiveJobDescriptionFile = (req, res, next) => {
  upload.single('jobDescriptionFile')(req, res, (err) => {
    if (!err) return next();
    const tooLarge = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE';
    return res.status(400).json({ success: false, error: tooLarge ? 'File too large. Maximum size is 10MB.' : err.message });
  });
};

// ---------------------------------------------------------------------------
// Shared handler plumbing
// ---------------------------------------------------------------------------

const aiContext = (req) => ({ isOwnApiKey: req.user?.isOwnApiKey, model: resolveGeminiModel(req) });

/** Mark errors from the model call so the handler maps them to AI error responses. */
const callAI = async (promise) => {
  try {
    return await promise;
  } catch (error) {
    if (error && typeof error === 'object') error.fromAI = true;
    throw error;
  }
};

/** An unusable model answer, reported like any other AI failure (and refunded). */
const aiFailure = (message, reason) => Object.assign(new AIOutputError(message, reason), { fromAI: true });

const sendError = (res, status, error) => res.status(status).json({ success: false, error });

/**
 * Wrap an AI route: request validation, Gemini client (server key or BYOK),
 * and error mapping. Every failure answers with success:false, which makes
 * chargeAIToken refund the token.
 */
const aiHandler = (label, handler) => async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg, errors: errors.array() });
  }
  req.usageType = 'aiAction';
  const client = createGoogleGenAI(req, res);
  if (!client) return undefined; // response already sent
  try {
    return await handler(req, res, { client, model: resolveGeminiModel(req) });
  } catch (error) {
    if (res.headersSent) return undefined;
    if (error?.fromAI) return sendAIError(res, error, aiContext(req));
    logger.error(`${label} failed`, { message: error?.message });
    return sendError(res, 500, 'Something went wrong. Please try again.');
  }
};

const ownResumeQuery = (req, resumeId) => ({ _id: { $eq: String(resumeId) }, user: { $eq: req.user._id } });

const findOwnResume = (req, resumeId, select) => Resume.findOne(ownResumeQuery(req, resumeId)).select(select).lean();

// ---------------------------------------------------------------------------
// Field rewrite: enhance / summarize one rich-text field
// ---------------------------------------------------------------------------

const rewriteRules = [
  protect,
  skipIfBYOK(chargeAIToken),
  body('content').isString().withMessage('Content is required')
    .isLength({ max: MAX_INPUT_CHARS }).withMessage(`Content is too long (maximum ${MAX_INPUT_CHARS} characters)`),
  body('field').optional().isIn(REWRITE_FIELDS).withMessage('Invalid field'),
  body('tone').optional().isIn(['professional', 'casual', 'formal', 'creative']).withMessage('Invalid tone'),
  body('style').optional().isIn(['concise', 'detailed', 'action-oriented', 'achievement-focused']).withMessage('Invalid style')
];

/** Rewrite one field and fit the answer to the field's budget. */
const rewriteField = async ({ client, model }, { content, field, mode }) => {
  const budget = budgetFor(field, content, { mode });
  const prompt = buildRewritePrompt({ content: sanitizeRichText(content), field, mode, budget });
  const text = await callAI(generate({ client, model, ...prompt, temperature: 0.4, maxOutputTokens: 2048, timeoutMs: AI_TIMEOUTS.rewrite }));
  let answer = text;
  try {
    answer = String(parseJsonObject(text).content ?? '');
  } catch {
    // Some models ignore the schema and send the HTML directly; the clean-up below handles both.
  }
  const html = finalizeRichText(answer, budget);
  if (!html) throw aiFailure('AI rewrite was empty after clean-up', 'empty');
  return html;
};

const tooShort = (content) => htmlToPlainText(content).length < MIN_TEXT_CHARS;

// @desc    Rewrite resume content with AI (field-aware)
// @route   POST /api/ai/rewrite
// @access  Private
router.post('/rewrite', rewriteRules, trackUsage, aiHandler('AI rewrite', async (req, res, ai) => {
  const { content, field = 'general', tone = 'professional', style = 'action-oriented' } = req.body;
  if (tooShort(content)) return sendError(res, 400, `Add at least ${MIN_TEXT_CHARS} characters of text before using AI.`);
  const rewrittenContent = await rewriteField(ai, { content, field, mode: 'enhance' });
  logger.info(`AI rewrite (${logSafe(field)}) for user ${logSafe(req.user.id)}`);
  return res.json({
    success: true,
    data: { originalContent: content, rewrittenContent, field, tone, style, message: 'Content enhanced successfully', tokens: req.tokens }
  });
}));

// @desc    Summarize (shorten) resume content with AI (field-aware)
// @route   POST /api/ai/summarize
// @access  Private
router.post('/summarize', rewriteRules, trackUsage, aiHandler('AI summarize', async (req, res, ai) => {
  const { content, field = 'general' } = req.body;
  if (tooShort(content)) return sendError(res, 400, `Add at least ${MIN_TEXT_CHARS} characters of text before using AI.`);
  const summary = await rewriteField(ai, { content, field, mode: 'summarize' });
  logger.info(`AI summarize (${logSafe(field)}) for user ${logSafe(req.user.id)}`);
  return res.json({
    success: true,
    data: { originalContent: content, summary, field, message: 'Content summarized successfully', tokens: req.tokens }
  });
}));

// @desc    Get AI usage statistics
// @route   GET /api/ai/usage
// @access  Private
router.get('/usage', protect, async (req, res) => {
  try {
    // Both pools count (bonus + purchased).
    const balance = await getTokenBalance(req.user._id);
    res.json({
      success: true,
      data: {
        tokensAvailable: balance.total,
        plan: 'free',
        remainingActions: balance.total,
        tokens: tokenPayload(balance),
        isOwnApiKey: !!req.user.isOwnApiKey,
        cycleStartDate: req.user.createdAt,
        nextBillingDate: null,
        billingCycle: 'token-based',
        daysUntilReset: null
      }
    });
  } catch (error) {
    logger.error('Get AI usage error', { message: error.message });
    res.status(500).json({ success: false, error: 'Error getting AI usage' });
  }
});

// ---------------------------------------------------------------------------
// ATS score
// ---------------------------------------------------------------------------

/** Job description text from the form field or the uploaded file; null after sending a 400. */
const readJobDescription = async (req, res) => {
  if (req.body.inputType === 'text') {
    const value = trimJobDescription(req.body.jobDescription);
    if (value.length < 10) {
      sendError(res, 400, 'Please paste the job description (at least 10 characters).');
      return null;
    }
    return value;
  }
  if (!req.file) {
    sendError(res, 400, 'Job description file is required');
    return null;
  }
  try {
    return trimJobDescription(await DocumentParser.parseDocument(req.file.buffer, req.file.mimetype));
  } catch (error) {
    sendError(res, 400, error.message);
    return null;
  }
};

// @desc    Generate ATS Score for resume against job description
// @route   POST /api/ai/ats-score
// @access  Private
router.post('/ats-score', [
  protect,
  skipIfBYOK(chargeAIToken),
  receiveJobDescriptionFile,
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('inputType').isIn(['text', 'file']).withMessage('Input type must be either text or file'),
  body('jobDescription').optional().isString().withMessage('Job description must be text')
], trackUsage, aiHandler('ATS score', async (req, res, { client, model }) => {
  const { resumeId, inputType } = req.body;
  const resume = await Resume.findOne(ownResumeQuery(req, resumeId)).populate('template', 'name').lean();
  if (!resume) return sendError(res, 404, 'Resume not found');

  const jobDescriptionText = await readJobDescription(req, res);
  if (jobDescriptionText === null) return undefined;

  const raw = await callAI(generateJson({
    client,
    model,
    systemInstruction: ATS_SYSTEM_INSTRUCTION,
    contents: buildAtsContents(buildAtsResumeText(resume), jobDescriptionText),
    schema: ATS_SCHEMA,
    temperature: 0, // the same resume and job should get the same score
    maxOutputTokens: 4096,
    timeoutMs: AI_TIMEOUTS.atsScore
  }));
  if (!hasAtsScores(raw)) throw aiFailure('ATS answer had no scores', 'invalid');

  const atsAnalysis = {
    ...normalizeAtsAnalysis(raw),
    job_description_hash: crypto.createHash('sha256').update(jobDescriptionText).digest('hex'),
    analyzed_at: new Date()
  };
  // Only this field is written, so older resume data can't block saving the analysis.
  await Resume.updateOne(ownResumeQuery(req, resumeId), { $set: { atsAnalysis } });
  logger.info(`ATS score ${atsAnalysis.overall_score} saved for resume ${logSafe(resumeId)} (user ${logSafe(req.user.id)})`);

  return res.json({
    success: true,
    data: {
      resumeId,
      resumeTitle: resume.title,
      templateName: resume.template?.name || 'No template',
      jobDescriptionLength: jobDescriptionText.length,
      inputType,
      atsAnalysis,
      message: 'ATS score analysis completed and saved successfully',
      tokens: req.tokens
    }
  });
}));

// @desc    Get saved ATS analysis for a resume
// @route   GET /api/ai/ats-score/:resumeId
// @access  Private
router.get('/ats-score/:resumeId', protect, async (req, res) => {
  try {
    const { resumeId } = req.params;
    if (!/^[a-f0-9]{24}$/i.test(String(resumeId))) return sendError(res, 400, 'Valid resume ID is required');
    const resume = await findOwnResume(req, resumeId, 'title atsAnalysis template');
    if (!resume) return sendError(res, 404, 'Resume not found');
    if (!resume.atsAnalysis?.analyzed_at && !resume.atsAnalysis?.overall_score) {
      return sendError(res, 404, 'No ATS analysis found for this resume');
    }
    return res.json({
      success: true,
      data: {
        resumeId,
        resumeTitle: resume.title,
        templateName: resume.template?.name || 'No template',
        atsAnalysis: resume.atsAnalysis,
        message: 'ATS analysis retrieved successfully'
      }
    });
  } catch (error) {
    logger.error('Get ATS analysis error', { message: error.message });
    return sendError(res, 500, 'Server error');
  }
});

// ---------------------------------------------------------------------------
// ATS follow-ups
// ---------------------------------------------------------------------------

const atsFollowUpRules = (listField) => [
  protect,
  skipIfBYOK(chargeAIToken),
  body('resumeId').isMongoId().withMessage('Valid resume ID is required'),
  body('resume_json').isObject().withMessage('Resume JSON is required'),
  body('ats_analysis').isObject().withMessage('ATS analysis is required'),
  body(listField).isArray().withMessage(`${listField} must be an array`)
];

const reviewNotes = (analysis) => {
  const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 15).map((x) => x.slice(0, 240)) : []);
  return {
    weaknesses: list(analysis.weaknesses),
    ats_warnings: list(analysis.ats_warnings),
    recommendations: list(analysis.recommendations),
    missing_keywords: list(analysis.missing_keywords)
  };
};

const pickSections = (requested, allowed) => {
  const list = (Array.isArray(requested) ? requested : []).filter((s) => allowed.includes(s));
  return list.length ? list : allowed;
};

// @desc    Rewrite resume sections using the ATS review (tone, impact)
// @route   POST /api/ai/adjust-tone
// @access  Private
router.post('/adjust-tone', atsFollowUpRules('focus'), trackUsage, aiHandler('Adjust tone', async (req, res, { client, model }) => {
  const { resumeId, resume_json: resumeJson, ats_analysis: analysis, focus } = req.body;
  if (!(await findOwnResume(req, resumeId, '_id'))) return sendError(res, 404, 'Resume not found');

  const sections = pickSections(focus, TONE_SECTIONS);
  const { input, budgets } = buildRewriteInput(resumeJson, sections);
  if (!hasInput(input)) return sendError(res, 400, 'Add a summary or some descriptions to your resume first, then try again.');

  const ai = await callAI(generateJson({
    client,
    model,
    systemInstruction: buildAdjustToneInstruction(budgets),
    contents: `<resume_sections>\n${JSON.stringify(input)}\n</resume_sections>\n\n<ats_review>\n${JSON.stringify(reviewNotes(analysis))}\n</ats_review>`,
    schema: ADJUST_TONE_SCHEMA,
    temperature: 0.4,
    maxOutputTokens: 12288,
    timeoutMs: AI_TIMEOUTS.resumeEdit
  }));
  const { data, changed } = mergeToneResult(resumeJson, ai, sections);
  if (!changed) throw aiFailure('Adjust tone changed nothing', 'empty');
  logger.info(`Adjust tone: ${changed} fields rewritten for resume ${logSafe(resumeId)}`);
  return res.json({ success: true, data, message: 'Resume tone adjusted successfully', tokens: req.tokens });
}));

// @desc    Work missing ATS keywords into the resume
// @route   POST /api/ai/enhance-keywords
// @access  Private
router.post('/enhance-keywords', atsFollowUpRules('target_sections'), trackUsage, aiHandler('Enhance keywords', async (req, res, { client, model }) => {
  const { resumeId, resume_json: resumeJson, ats_analysis: analysis, target_sections: targets } = req.body;
  if (!(await findOwnResume(req, resumeId, '_id'))) return sendError(res, 404, 'Resume not found');

  const notes = reviewNotes(analysis);
  if (!notes.missing_keywords.length) return sendError(res, 400, 'The ATS check found no missing keywords to add.');

  const sections = pickSections(targets, KEYWORD_SECTIONS);
  const { input, budgets } = buildRewriteInput(resumeJson, sections.filter((s) => s !== 'skills'));
  const skills = (Array.isArray(resumeJson.skills) ? resumeJson.skills : [])
    .map((c) => ({ category: String(c?.category || ''), items: (Array.isArray(c?.items) ? c.items : []).map((i) => String(i?.name || '')) }));

  const ai = await callAI(generateJson({
    client,
    model,
    systemInstruction: buildKeywordsInstruction(budgets),
    contents: `<resume_sections>\n${JSON.stringify(input)}\n</resume_sections>\n\n<existing_skills>\n${JSON.stringify(skills)}\n</existing_skills>\n\n<missing_keywords>\n${JSON.stringify(notes.missing_keywords)}\n</missing_keywords>`,
    schema: KEYWORDS_SCHEMA,
    temperature: 0.2,
    maxOutputTokens: 12288,
    timeoutMs: AI_TIMEOUTS.resumeEdit
  }));
  const { data, changed } = mergeKeywordResult(resumeJson, ai, sections);
  if (!changed) return sendError(res, 422, "We couldn't find a truthful place for the missing keywords in your resume, so nothing was changed.");
  logger.info(`Enhance keywords: ${changed} changes for resume ${logSafe(resumeId)}`);
  return res.json({ success: true, data, message: 'Keywords enhanced successfully', tokens: req.tokens });
}));

// ---------------------------------------------------------------------------
// Pro templates
// ---------------------------------------------------------------------------

const templateRules = (min) => [
  protect,
  skipIfBYOK(chargeAIToken),
  body('content').isString().withMessage('Content is required')
    .isLength({ min }).withMessage(`Content must be at least ${min} characters`)
    .isLength({ max: 30000 }).withMessage('Content is too long (maximum 30000 characters)')
];

const templateHandler = (kind) => async (req, res, { client, model }) => {
  const { content } = req.body;
  const prompt = buildTemplatePrompt(kind, content);
  const text = await callAI(generate({ client, model, ...prompt, temperature: 0.5, maxOutputTokens: 12288, timeoutMs: AI_TIMEOUTS.template }));
  const html = sanitizeTemplateHtml(text);
  if (!html) throw aiFailure('Template answer had no HTML', 'empty');
  return html;
};

// @desc    Generate PDF template from basic details using AI
// @route   POST /api/ai/generate-pdf-template
// @access  Private
router.post('/generate-pdf-template', templateRules(20), trackUsage, aiHandler('Generate template', async (req, res, ai) => {
  const templateContent = await templateHandler('generate')(req, res, ai);
  return res.json({
    success: true,
    data: { originalContent: req.body.content, templateContent, templateType: 'PDF Template', message: 'PDF template generated successfully', tokens: req.tokens }
  });
}));

// @desc    Restructure current template using AI
// @route   POST /api/ai/restructure-template
// @access  Private
router.post('/restructure-template', templateRules(50), trackUsage, aiHandler('Restructure template', async (req, res, ai) => {
  const restructuredContent = await templateHandler('restructure')(req, res, ai);
  return res.json({
    success: true,
    data: {
      originalContent: req.body.content,
      restructuredContent,
      structureType: 'Restructured Template',
      improvements: ['Clearer section order', 'Consistent headings and spacing', 'ATS-friendly structure'],
      message: 'Template restructured successfully',
      tokens: req.tokens
    }
  });
}));

module.exports = router;
