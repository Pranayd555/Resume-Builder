/**
 * Text extraction for uploaded resumes (PDF and DOCX), tuned for resume layouts.
 *
 * Why not pdf-parse's default renderer: it concatenates text items that share a
 * baseline with no separator ("Northwind LogisticsMar 2021 – Present"), emits
 * items in content-stream order (two-column layouts built row by row come out
 * interleaved), and drops hyperlink targets ("LinkedIn" without the URL).
 *
 * This module rebuilds lines from item positions, inserts a space or a " | "
 * separator based on the horizontal gap, reads two-column pages column by
 * column, and writes link targets next to the text they cover.
 */
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Separator written between two pieces of text on one line that are far apart
// (a job title and a right-aligned date, or two table cells).
const FIELD_SEPARATOR = ' | ';
const MAX_EXTRACTED_CHARS = 60000;

const BULLET_CHARS = new Set(['•', '●', '○', '◦', '▪', '▫', '■', '□', '‣', '⁃', '∙', '·', '►', '▶', '➢', '➤', '✓', '✔', '❖', '♦', '◆', '', '', '', '', '']); // last five: Symbol/Wingdings bullets from Word
const LIGATURES = { 'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'st', 'ﬆ': 'st' };

// ---------------------------------------------------------------------------
// Line building
// ---------------------------------------------------------------------------

const fontSizeOf = (item) => Math.hypot(item.transform[0], item.transform[1]) || item.height || 10;

const toBox = (item) => {
  const size = fontSizeOf(item);
  return {
    str: item.str,
    x: item.transform[4],
    y: item.transform[5],
    w: Math.max(item.width || 0, 0),
    size
  };
};

/** Group boxes into rows that share a baseline (within 40% of the font size). */
const groupRows = (boxes) => {
  const sorted = [...boxes].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows = [];
  for (const box of sorted) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row.y - box.y) <= Math.max(row.size, box.size) * 0.4) {
      row.items.push(box);
      row.size = Math.max(row.size, box.size);
    } else {
      rows.push({ y: box.y, size: box.size, items: [box] });
    }
  }
  rows.forEach((row) => row.items.sort((a, b) => a.x - b.x));
  return rows;
};

/** Join the boxes of one row: no space inside a word, a space between words, a separator across a wide gap. */
const joinRow = (items) => {
  let text = '';
  let prevEnd = null;
  for (const item of items) {
    if (prevEnd !== null) {
      const gap = item.x - prevEnd;
      if (gap > item.size * 2) text += FIELD_SEPARATOR;
      else if (gap > item.size * 0.15 && !text.endsWith(' ') && !item.str.startsWith(' ')) text += ' ';
    }
    text += item.str;
    prevEnd = item.x + item.w;
  }
  return text;
};

// ---------------------------------------------------------------------------
// Column detection
// ---------------------------------------------------------------------------

const crosses = (box, x) => box.x < x && box.x + box.w > x;

const scoreGutter = (rows, x) => {
  let crossing = 0;
  let left = 0;
  let right = 0;
  for (const row of rows) {
    if (row.items.some((b) => crosses(b, x))) crossing += 1;
    if (row.items.some((b) => b.x + b.w <= x)) left += 1;
    if (row.items.some((b) => b.x >= x)) right += 1;
  }
  return { x, crossing, left, right };
};

const DATE_LIKE = /\b(19|20)\d{2}\b|\b(present|current|now)\b/i;

/** Characters and date-like pieces of text on one side of a candidate gutter. */
const sideStats = (rows, onSide) => {
  let chars = 0;
  let items = 0;
  let dateItems = 0;
  for (const row of rows) {
    const text = row.items.filter(onSide).map((b) => b.str).join(' ').trim();
    if (!text) continue;
    chars += text.length;
    items += 1;
    if (DATE_LIKE.test(text) && text.length <= 30) dateItems += 1;
  }
  return { chars, items, dateItems };
};

/**
 * Find a vertical gutter that splits the page into two columns, or null.
 * A gutter is an x position between 20% and 80% of the page width that almost
 * no row crosses, with a real amount of text on both sides. Single-column
 * resumes have long lines (bullets, paragraphs) crossing every candidate, and a
 * right-aligned date column is too thin to count as a column.
 */
const findGutter = (rows, pageWidth) => {
  if (rows.length < 8 || !pageWidth) return null;
  let best = null;
  const step = pageWidth / 100;
  for (let x = pageWidth * 0.2; x <= pageWidth * 0.8; x += step) {
    const score = scoreGutter(rows, x);
    if (!best || score.crossing < best.crossing) best = score;
  }
  if (!best) return null;
  const minSide = rows.length * 0.25;
  const fewCrossings = best.crossing <= Math.max(1, rows.length * 0.08);
  if (!fewCrossings || best.left < minSide || best.right < minSide) return null;

  // Both sides must hold real text. A narrow side made of dates (a date
  // column to the left or right of single-column content) is not a column.
  const left = sideStats(rows, (b) => b.x + b.w <= best.x);
  const right = sideStats(rows, (b) => b.x >= best.x);
  const total = left.chars + right.chars;
  const thin = left.chars <= right.chars ? left : right;
  if (!total || thin.chars / total < 0.08) return null;
  if (thin.items && thin.dateItems / thin.items >= 0.5) return null;
  return best.x;
};

/** Split rows at the gutter: rows that cross it stay whole, the rest are read column by column. */
const orderByColumns = (rows, gutter) => {
  const lines = [];
  let leftBlock = [];
  let rightBlock = [];
  const flush = () => {
    leftBlock.forEach((items) => lines.push(joinRow(items)));
    rightBlock.forEach((items) => lines.push(joinRow(items)));
    leftBlock = [];
    rightBlock = [];
  };
  for (const row of rows) {
    if (row.items.some((b) => crosses(b, gutter))) {
      flush();
      lines.push(joinRow(row.items));
      continue;
    }
    const left = row.items.filter((b) => b.x < gutter);
    const right = row.items.filter((b) => b.x >= gutter);
    if (left.length) leftBlock.push(left);
    if (right.length) rightBlock.push(right);
  }
  flush();
  return lines;
};

// ---------------------------------------------------------------------------
// Small tables inside a single-column page (a 3-column skills grid, an
// education grid with one column per qualification)
// ---------------------------------------------------------------------------

const MIN_TABLE_ROWS = 3;
const MIN_GUTTER_WIDTH = 6;

/** Empty horizontal intervals of a row between `left` and `right`. */
const rowGaps = (row, left, right) => {
  const gaps = [];
  let cursor = left;
  for (const b of row.items) {
    if (b.x > cursor) gaps.push([cursor, b.x]);
    cursor = Math.max(cursor, b.x + b.w);
  }
  if (right > cursor) gaps.push([cursor, right]);
  return gaps;
};

const intersectGaps = (a, b) => {
  const out = [];
  for (const [a1, a2] of a) {
    for (const [b1, b2] of b) {
      const start = Math.max(a1, b1);
      const end = Math.min(a2, b2);
      if (end - start >= MIN_GUTTER_WIDTH) out.push([start, end]);
    }
  }
  return out;
};

/** Gaps shared by every row of the run, away from the page's text edges. */
const sharedGaps = (rows, bounds) => rows
  .reduce((common, row) => intersectGaps(common, rowGaps(row, bounds.left, bounds.right)), [[bounds.left, bounds.right]])
  .filter(([start, end]) => start > bounds.left + 1 && end < bounds.right - 1);

const rowsWithText = (rows, test) => rows.filter((row) => row.items.some(test)).length;

/** Gutter positions (midpoints) with text on both sides in at least two rows. */
const tableGutters = (rows, bounds) => sharedGaps(rows, bounds)
  .filter(([start, end]) => rowsWithText(rows, (b) => b.x + b.w <= start) >= 2 && rowsWithText(rows, (b) => b.x >= end) >= 2)
  .map(([start, end]) => (start + end) / 2);

const columnOf = (box, gutters) => gutters.filter((g) => box.x >= g).length;

/** cells[row][column] = boxes in that cell. */
const toCells = (rows, gutters) => rows.map((row) => {
  const cells = Array.from({ length: gutters.length + 1 }, () => []);
  row.items.forEach((b) => cells[columnOf(b, gutters)].push(b));
  return cells;
});

const cellText = (cell) => joinRow(cell).trim();

/** A right-aligned date column next to single-column content is not a table. */
const isDateColumn = (cells, column) => {
  const texts = cells.map((row) => cellText(row[column])).filter(Boolean);
  return texts.length > 0 && texts.filter((t) => t.length <= 30 && DATE_LIKE.test(t)).length / texts.length >= 0.5;
};

/**
 * Read column by column when cells wrap onto the next row or rows are
 * staggered (some rows have only some columns); otherwise row by row with
 * " | " between cells, which keeps label/value pairs ("English | Native") together.
 */
const tableLines = (rows, gutters) => {
  const cells = toCells(rows, gutters);
  const columns = gutters.length + 1;
  const staggered = cells.some((row) => row.some((cell) => !cell.length));
  const wraps = cells.some((row) => row.some((cell) => /[,&/-]$/.test(cellText(cell))));
  if (!staggered && !wraps) return cells.map((row) => row.map(cellText).join(FIELD_SEPARATOR));
  const lines = [];
  for (let c = 0; c < columns; c += 1) cells.forEach((row) => { if (row[c].length) lines.push(cellText(row[c])); });
  return lines;
};

// Measured against the smaller font, so a larger section heading after a table
// (and the extra space before it) ends the run instead of joining it.
const closeRows = (a, b) => a.y - b.y <= Math.min(a.size, b.size) * 1.9;

/** Longest run of close rows starting at `start` that still shares an inner gap. */
const growRun = (rows, start, bounds) => {
  let end = start;
  while (end + 1 < rows.length && closeRows(rows[end], rows[end + 1])
    && sharedGaps(rows.slice(start, end + 2), bounds).length) end += 1;
  return end;
};

const acceptTable = (run, gutters) => run.length >= MIN_TABLE_ROWS
  && gutters.length > 0
  && !isDateColumn(toCells(run, gutters), gutters.length);

/** Lines for a single-column page, reading any small tables in it sensibly. */
const orderWithTables = (rows) => {
  if (!rows.length) return [];
  const bounds = {
    left: Math.min(...rows.flatMap((r) => r.items.map((b) => b.x))),
    right: Math.max(...rows.flatMap((r) => r.items.map((b) => b.x + b.w)))
  };
  const lines = [];
  let i = 0;
  while (i < rows.length) {
    const end = growRun(rows, i, bounds);
    const run = rows.slice(i, end + 1);
    const gutters = run.length >= MIN_TABLE_ROWS ? tableGutters(run, bounds) : [];
    if (acceptTable(run, gutters)) {
      lines.push(...tableLines(run, gutters));
      i = end + 1;
    } else {
      lines.push(joinRow(rows[i].items));
      i += 1;
    }
  }
  return lines;
};

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

const overlaps = (box, rect) => {
  const [x1, y1, x2, y2] = rect;
  const top = box.y + box.size * 0.8;
  return box.x < Math.max(x1, x2) && box.x + box.w > Math.min(x1, x2)
    && box.y < Math.max(y1, y2) && top > Math.min(y1, y2);
};

const simplifyUrl = (url) => url.replace(/^mailto:/i, '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '').toLowerCase();

/**
 * Write each link's target after the last text box it covers, unless that
 * text already shows the address ("github.com/x" linking to github.com/x).
 */
const attachLinks = (boxes, annotations) => {
  const unplaced = [];
  for (const link of annotations) {
    const url = typeof link.url === 'string' ? link.url : '';
    if (!url || !Array.isArray(link.rect)) continue;
    const covered = boxes.filter((b) => b.str.trim() && overlaps(b, link.rect));
    if (!covered.length) {
      unplaced.push(url);
      continue;
    }
    const shown = covered.map((b) => b.str).join('').toLowerCase().replace(/\s+/g, '');
    const target = simplifyUrl(url);
    const showsAddress = shown.includes(target) || (shown.includes('.') && target.includes(shown.replace(/^www\./, '')));
    if (showsAddress) continue;
    const last = covered[covered.length - 1];
    last.str = `${last.str} (${url.replace(/^mailto:/i, '')})`;
  }
  return unplaced;
};

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------

const renderPage = (collector) => async (pageData) => {
  const content = await pageData.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
  const boxes = content.items.filter((item) => typeof item.str === 'string' && item.str.length).map(toBox);

  let annotations = [];
  try {
    annotations = (await pageData.getAnnotations()).filter((a) => a.subtype === 'Link' && a.url);
  } catch {
    annotations = [];
  }
  collector.links.push(...attachLinks(boxes, annotations));

  const rows = groupRows(boxes.filter((b) => b.str.trim()));
  const pageWidth = Array.isArray(pageData.view) ? pageData.view[2] - pageData.view[0] : 0;
  const gutter = findGutter(rows, pageWidth);
  if (gutter) collector.columnPages += 1;
  const lines = gutter ? orderByColumns(rows, gutter) : orderWithTables(rows);
  return lines.join('\n');
};

const extractPdf = async (buffer) => {
  const collector = { links: [], columnPages: 0 };
  // pdf.js 1.10 reads the Buffer's whole underlying ArrayBuffer from offset 0.
  // Node puts small Buffers (< 4 KB) in a shared pool, so without a copy it
  // can read a different document's bytes. A Uint8Array copy owns its memory.
  const data = await pdfParse(new Uint8Array(buffer), { pagerender: renderPage(collector) });
  return { text: data.text, links: collector.links, pages: data.numpages || 0, columnPages: collector.columnPages };
};

// ---------------------------------------------------------------------------
// DOCX
// ---------------------------------------------------------------------------

const decodeEntities = (s) => s
  .replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&');

/**
 * DOCX -> text that keeps list items as "• " lines, table cells apart, and
 * hyperlink targets ("Portfolio (https://...)"). mammoth's raw-text mode
 * drops all three.
 */
const docxHtmlToText = (html) => {
  let text = html
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, label) => {
      const plain = label.replace(/<[^>]+>/g, '');
      // Some editors write external links as "#https://..."; in-document anchors stay plain text.
      const url = decodeEntities(href).replace(/^#(?=https?:)/i, '').replace(/^mailto:/i, '');
      if (!url || url.startsWith('#')) return plain;
      return plain.toLowerCase().replace(/\s+/g, '').includes(simplifyUrl(url)) ? plain : `${plain} (${url})`;
    })
    // A table cell's paragraphs stay on the cell's line.
    .replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, (m, inner) => `<td>${inner.replace(/<\/p>\s*<p[^>]*>/gi, '; ').replace(/<\/?p[^>]*>/gi, '')}</td>`)
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<\/(td|th)>/gi, FIELD_SEPARATOR)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|tr|table|ul|ol)>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  text = decodeEntities(text);
  return text.split('\n').map(trimTrailingSeparators).join('\n');
};

// "Skills | SQL | " -> "Skills | SQL" (plain string checks, no regex backtracking)
const trimTrailingSeparators = (line) => {
  let out = line.trim();
  while (out.endsWith('|')) out = out.slice(0, -1).trim();
  return out;
};

const extractDocx = async (buffer) => {
  const result = await mammoth.convertToHtml({ buffer });
  return { text: docxHtmlToText(result.value || ''), links: [], pages: 0, columnPages: 0 };
};

// ---------------------------------------------------------------------------
// Clean-up shared by both formats
// ---------------------------------------------------------------------------

const PAGE_FOOTER_RE = /^(page\s+)?\d{1,2}(\s*(of|\/)\s*\d{1,2})?$/i;

const normalizeLine = (line) => {
  let out = '';
  for (const ch of line) out += LIGATURES[ch] || ch;
  out = out.replace(/[  -​  　]/g, ' ').replace(/[ \t]+/g, ' ').trim();
  // Bullet glyphs (including private-use symbol-font bullets) -> "• "
  const first = out.charAt(0);
  if (BULLET_CHARS.has(first) || (first === '-' || first === '*' || first === '–') && out.charAt(1) === ' ') {
    out = `• ${out.slice(1).trim()}`.trim();
  }
  return out;
};

/** Normalise whitespace, bullets, ligatures; drop page-number lines; collapse blank runs. */
const cleanExtractedText = (raw) => {
  const lines = String(raw || '').replace(/\r\n?/g, '\n').split('\n').map(normalizeLine);
  const kept = [];
  for (const line of lines) {
    if (PAGE_FOOTER_RE.test(line) || line === '•') continue;
    if (!line && (!kept.length || kept[kept.length - 1] === '')) continue;
    kept.push(line);
  }
  return kept.join('\n').trim().slice(0, MAX_EXTRACTED_CHARS);
};

const PDF_TYPES = new Set(['application/pdf']);
const DOCX_TYPES = new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

const isSupportedResumeType = (mimetype) => PDF_TYPES.has(mimetype) || DOCX_TYPES.has(mimetype);

/**
 * Extract resume text. Resolves to { text, links, pages, columnPages }.
 * Throws an Error with a user-facing message when nothing readable is found.
 */
const extractResumeText = async (buffer, mimetype) => {
  if (!isSupportedResumeType(mimetype)) {
    throw new Error('Unsupported file type. Please upload a PDF or a Word (.docx) document.');
  }
  let result;
  try {
    result = PDF_TYPES.has(mimetype) ? await extractPdf(buffer) : await extractDocx(buffer);
  } catch (error) {
    const reason = /password|encrypt/i.test(error?.message || '') ? 'The file is password-protected.' : 'The file may be damaged.';
    throw new Error(`We couldn't read this file. ${reason} Try exporting it again as a PDF or .docx.`);
  }
  const text = cleanExtractedText(result.text);
  if (text.replace(/\s/g, '').length < 40) {
    throw new Error("We couldn't find any text in this file. If it's a scanned image, export it from your editor as a text-based PDF or .docx and try again.");
  }
  return { ...result, text };
};

module.exports = {
  extractResumeText,
  isSupportedResumeType,
  cleanExtractedText,
  docxHtmlToText,
  // exported for tests
  _internal: { groupRows, joinRow, findGutter, orderByColumns, attachLinks, FIELD_SEPARATOR }
};
