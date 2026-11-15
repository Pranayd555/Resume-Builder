/**
 * Clean-up and length guards for AI-written resume content.
 *
 * Every AI response that ends up in a resume field goes through here so it:
 *   - has no code fences, chatty preamble ("Here is the improved text:") or markdown,
 *   - only uses the inline/list HTML the editor and the PDF templates render,
 *   - fits the field: a character budget and a bullet budget per field type.
 */
const xss = require('xss');

// Budgets sized for a one-to-two page resume in our templates: a summary of
// 3-5 lines, 3-6 bullets per job, 2-4 per project. Counted on visible text.
const FIELD_PROFILES = {
  summary: { label: 'professional summary', format: 'paragraph', maxChars: 700, maxItems: 0, maxItemChars: 0 },
  workExperience: { label: 'job description', format: 'bullets', maxChars: 1100, maxItems: 6, maxItemChars: 220 },
  projects: { label: 'project description', format: 'bullets', maxChars: 700, maxItems: 4, maxItemChars: 220 },
  education: { label: 'education details', format: 'mixed', maxChars: 450, maxItems: 3, maxItemChars: 200 },
  achievements: { label: 'achievement description', format: 'paragraph', maxChars: 350, maxItems: 0, maxItemChars: 0 },
  general: { label: 'resume section', format: 'mixed', maxChars: 1500, maxItems: 8, maxItemChars: 240 }
};

// Hard ceiling for any one rich-text field (schema allows 10000).
const ABSOLUTE_MAX_CHARS = 4000;

const FIELD_ALIASES = {
  summary: 'summary',
  profile: 'summary',
  workexperience: 'workExperience',
  experience: 'workExperience',
  job: 'workExperience',
  projects: 'projects',
  project: 'projects',
  education: 'education',
  achievements: 'achievements',
  achievement: 'achievements'
};

const resolveField = (field) => FIELD_ALIASES[String(field || '').toLowerCase()] || 'general';

const ENTITY_MAP = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&nbsp;': ' ' };

const decodeEntities = (s) => String(s).replace(/&(?:amp|lt|gt|quot|nbsp|#39|#x27);/g, (m) => ENTITY_MAP[m]);

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** Visible text of an HTML fragment, whitespace collapsed. */
const htmlToPlainText = (html) => decodeEntities(String(html || '')
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<\/(p|li|div|h[1-6])>/gi, ' ')
  .replace(/<[^>]*>/g, ''))
  .replace(/\s+/g, ' ')
  .trim();

const plainTextLength = (html) => htmlToPlainText(html).length;

// ---------------------------------------------------------------------------
// Response clean-up
// ---------------------------------------------------------------------------

/** Remove a ```lang ... ``` wrapper (anywhere a model puts it). */
const stripCodeFences = (text) => {
  let out = String(text || '').trim();
  if (out.startsWith('```')) {
    const firstBreak = out.indexOf('\n');
    out = firstBreak === -1 ? '' : out.slice(firstBreak + 1);
  }
  if (out.endsWith('```')) out = out.slice(0, -3);
  return out.replace(/```[a-z]*\n?/gi, '').trim();
};

const PREAMBLE_START = /^(sure|certainly|of course|absolutely|okay|ok|great|here(?:'s| is| are)|below is|the following|i(?:'ve| have) )/i;
const OUTRO_START = /^(let me know|i hope|feel free|hope this|note:|this version|these changes)/i;

const isChatter = (line, pattern) => {
  const plain = htmlToPlainText(line).replace(/[*_#]/g, '').trim();
  if (!plain) return true;
  if (pattern.test(plain)) return true;
  // A short label line like "**Enhanced summary:**" or "Improved version:"
  return pattern === PREAMBLE_START && plain.length <= 60 && plain.endsWith(':') && !/<li/i.test(line);
};

/** Drop conversational lines before and after the actual content. */
const stripPreamble = (text) => {
  const lines = String(text || '').split('\n');
  while (lines.length > 1 && isChatter(lines[0], PREAMBLE_START)) lines.shift();
  while (lines.length > 1 && isChatter(lines[lines.length - 1], OUTRO_START)) lines.pop();
  return lines.join('\n').trim();
};

const inlineMarkdown = (s) => escapeHtml(s)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/__([^_]+)__/g, '<strong>$1</strong>')
  .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');

const LIST_LINE = /^(?:[-*•▪●]|\d{1,2}[.)])\s+/;

/** Plain text / markdown -> HTML paragraphs and a bullet list. */
const markdownToHtml = (text) => {
  const blocks = [];
  let items = [];
  const flushList = () => {
    if (items.length) blocks.push(`<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`);
    items = [];
  };
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim().replace(/^#{1,6}\s+/, '');
    if (!line) {
      flushList();
      continue;
    }
    if (LIST_LINE.test(line)) {
      items.push(inlineMarkdown(line.replace(LIST_LINE, '')));
    } else {
      flushList();
      blocks.push(`<p>${inlineMarkdown(line)}</p>`);
    }
  }
  flushList();
  return blocks.join('');
};

const looksLikeHtml = (text) => /<\/?(p|ul|ol|li|strong|em|b|i|u|br|h[1-6]|div|span)\b[^>]*>/i.test(text);

const RICH_TEXT_FILTER = new xss.FilterXSS({
  whiteList: { p: [], br: [], strong: [], b: [], em: [], i: [], u: [], ul: [], ol: [], li: [] },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'head', 'title']
});

/** Allow-list sanitising: only inline formatting, paragraphs and lists, no attributes. */
const sanitizeRichText = (html) => {
  const prepared = String(html || '')
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)/g, (m, slash, tag) => `<${slash}${tag.toLowerCase()}`)
    .replace(/<h[1-6][^>]*>/g, '<p><strong>')
    .replace(/<\/h[1-6]>/g, '</strong></p>')
    .replace(/<\/?(div|section|article)[^>]*>/g, (m) => (m.startsWith('</') ? '</p>' : '<p>'));
  return RICH_TEXT_FILTER.process(prepared)
    .replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>')
    .replace(/<i>/g, '<em>').replace(/<\/i>/g, '</em>');
};

// ---------------------------------------------------------------------------
// Block model: a flat list of paragraphs and bullets
// ---------------------------------------------------------------------------

const BLOCK_TOKEN = /(<\/?(?:p|li|ul|ol)>)/;

const pushBlock = (blocks, type, html) => {
  const inner = html.replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').trim();
  if (htmlToPlainText(inner)) blocks.push({ type, html: inner });
};

/** Sanitised HTML -> [{ type: 'p' | 'li', html }]. Nested lists are flattened. */
const htmlToBlocks = (html) => {
  const blocks = [];
  let type = 'p';
  let buffer = '';
  for (const token of String(html || '').split(BLOCK_TOKEN)) {
    if (!BLOCK_TOKEN.test(token)) {
      buffer += token;
      continue;
    }
    pushBlock(blocks, type, buffer);
    buffer = '';
    if (token === '<li>') type = 'li';
    else if (token === '<p>') type = type === 'li' ? 'li' : 'p';
    else if (token === '</li>' || token === '</ul>' || token === '</ol>') type = 'p';
  }
  pushBlock(blocks, type, buffer);
  return blocks;
};

const blocksToHtml = (blocks) => {
  let html = '';
  let inList = false;
  for (const block of blocks) {
    if (block.type === 'li' && !inList) html += '<ul>';
    if (block.type !== 'li' && inList) html += '</ul>';
    inList = block.type === 'li';
    html += block.type === 'li' ? `<li>${block.html}</li>` : `<p>${block.html}</p>`;
  }
  return inList ? `${html}</ul>` : html;
};

/** Shorten plain text to `max` chars: at a sentence end if one is close, otherwise at a word with "…". */
const truncateText = (text, max) => {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const sentenceEnd = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('; '), slice.endsWith('.') ? slice.length - 1 : -1);
  if (sentenceEnd >= max * 0.6) return slice.slice(0, sentenceEnd + 1).trim();
  const wordEnd = slice.lastIndexOf(' ');
  return `${slice.slice(0, wordEnd > max * 0.5 ? wordEnd : max - 1).replace(/[\s,;:–-]+$/, '')}…`;
};

const shortenBlock = (block, max) => ({ ...block, html: escapeHtml(truncateText(htmlToPlainText(block.html), max)) });

/** Turn bullets into sentences of one paragraph (for paragraph-only fields like the summary). */
const toParagraphs = (blocks) => {
  const paragraphs = blocks.filter((b) => b.type === 'p');
  const bullets = blocks.filter((b) => b.type === 'li');
  if (!bullets.length) return blocks;
  const joined = bullets.map((b) => {
    const html = b.html.trim();
    return /[.!?]$/.test(htmlToPlainText(html)) ? html : `${html}.`;
  }).join(' ');
  return [...paragraphs, { type: 'p', html: joined }];
};

/**
 * Fit blocks into a budget: at most `maxItems` bullets, `maxItemChars` per
 * bullet and `maxChars` of visible text overall. Whole blocks are kept while
 * they fit; the block that crosses the limit is shortened when enough room is
 * left, otherwise dropped.
 */
const fitBlocks = (blocks, { maxChars, maxItems = 0, maxItemChars = 0 }) => {
  const out = [];
  let used = 0;
  let bullets = 0;
  for (const original of blocks) {
    let block = original;
    if (block.type === 'li') {
      if (maxItems && bullets >= maxItems) continue;
      if (maxItemChars && plainTextLength(block.html) > maxItemChars) block = shortenBlock(block, maxItemChars);
    }
    const length = plainTextLength(block.html);
    const room = maxChars - used;
    if (length > room) {
      if (room >= 60 || !out.length) out.push(shortenBlock(block, Math.max(room, 1)));
      break;
    }
    out.push(block);
    used += length + 1;
    if (block.type === 'li') bullets += 1;
  }
  return out;
};

/**
 * The budget for one AI rewrite. A rewrite may be a little longer than the
 * original, never past the field's layout budget unless the original already
 * was (then we keep roughly the original size, so the user's content is not cut).
 * A summarise action never grows the text.
 */
const budgetFor = (field, originalHtml = '', { mode = 'enhance' } = {}) => {
  const profile = FIELD_PROFILES[resolveField(field)];
  const originalLength = plainTextLength(originalHtml);
  const originalItems = htmlToBlocks(sanitizeRichText(originalHtml)).filter((b) => b.type === 'li').length;
  let maxChars = Math.max(profile.maxChars, Math.round(originalLength * 1.1));
  if (mode === 'summarize') maxChars = Math.min(profile.maxChars, Math.max(originalLength, 120));
  return {
    ...profile,
    maxChars: Math.min(maxChars, ABSOLUTE_MAX_CHARS),
    maxItems: profile.maxItems ? Math.max(profile.maxItems, mode === 'summarize' ? 0 : originalItems) : 0
  };
};

// A short bold-only line ("<strong>Experience</strong>", "<strong>Summary:</strong>") is a label the model
// added, not field content. Keep it when it is the only thing returned.
const isHeadingBlock = (block) => block.type === 'p'
  && /^<strong>[^<]*<\/strong>:?$/.test(block.html.trim())
  && plainTextLength(block.html) <= 40;

const dropHeadingBlocks = (blocks) => {
  const kept = blocks.filter((b) => !isHeadingBlock(b));
  return kept.length ? kept : blocks;
};

/**
 * Full pipeline for AI-written rich text: fences/preamble/markdown out,
 * allow-listed HTML, shape for the field (paragraph vs bullets), budget.
 * Returns '' if nothing usable is left.
 */
const finalizeRichText = (rawText, budget) => {
  const stripped = stripPreamble(stripCodeFences(rawText));
  const html = sanitizeRichText(looksLikeHtml(stripped) ? stripped : markdownToHtml(stripped));
  let blocks = dropHeadingBlocks(htmlToBlocks(html));
  if (budget.format === 'paragraph') blocks = toParagraphs(blocks);
  return blocksToHtml(fitBlocks(blocks, budget));
};

/** Plain one-line text from the AI (titles, list items): no markup, length-capped. */
const finalizePlainText = (value, max) => {
  const text = htmlToPlainText(stripCodeFences(String(value ?? '')))
    .replace(/\*\*|__/g, '')
    .replace(/^[-*•]\s+/, '')
    .trim();
  return max ? truncateText(text, max) : text;
};

/** Plain text with line breaks -> one paragraph, or a bullet list when there are several lines. */
const textToHtml = (description, highlights = []) => {
  const lines = String(description || '')
    .replace(/-[ \t]*\n[ \t]*(?=[a-z])/g, '-') // "high-\ntraffic" -> "high-traffic"
    .split('\n').map((l) => l.trim()).filter(Boolean);
  const bullets = [];
  const paragraphs = [];
  lines.forEach((line) => (LIST_LINE.test(line) ? bullets.push(line.replace(LIST_LINE, '')) : paragraphs.push(line)));
  (highlights || []).forEach((h) => {
    const text = String(h || '').trim().replace(LIST_LINE, '');
    if (text) bullets.push(text);
  });
  const p = paragraphs.length ? `<p>${paragraphs.map(escapeHtml).join(' ')}</p>` : '';
  const ul = bullets.length ? `<ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : '';
  return p + ul;
};

module.exports = {
  FIELD_PROFILES,
  ABSOLUTE_MAX_CHARS,
  resolveField,
  budgetFor,
  finalizeRichText,
  finalizePlainText,
  sanitizeRichText,
  stripCodeFences,
  stripPreamble,
  markdownToHtml,
  htmlToPlainText,
  plainTextLength,
  htmlToBlocks,
  blocksToHtml,
  fitBlocks,
  truncateText,
  textToHtml,
  escapeHtml
};
