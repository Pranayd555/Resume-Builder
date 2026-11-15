/**
 * Test helper: builds a minimal one-page PDF with text drawn at given
 * positions, in the given order, plus optional link annotations. Lets the
 * extractor tests run real pdf.js parsing without a browser or fixture files.
 *
 * items: [{ x, y, text, size? }]  (PDF points, origin bottom-left)
 * links: [{ rect: [x1, y1, x2, y2], url }]
 */
const escapePdf = (text) => text.replace(/[\\()]/g, (m) => `\\${m}`);

const buildPdf = (items, { links = [], width = 595, height = 842 } = {}) => {
  const content = items
    .map((i) => `BT /F1 ${i.size || 10} Tf ${i.x} ${i.y} Td (${escapePdf(i.text)}) Tj ET`)
    .join('\n');
  const annotRefs = links.map((_, i) => `${6 + i} 0 R`).join(' ');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R${links.length ? ` /Annots [${annotRefs}]` : ''} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
    ...links.map((l) => `<< /Type /Annot /Subtype /Link /Rect [${l.rect.join(' ')}] /Border [0 0 0] /A << /S /URI /URI (${escapePdf(l.url)}) >> >>`)
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
};

module.exports = { buildPdf };
