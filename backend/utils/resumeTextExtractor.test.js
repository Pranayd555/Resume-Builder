/**
 * Resume text extraction (PDF layout + DOCX). Real pdf.js parsing on small
 * generated PDFs; no fixture files with personal data.
 *
 * Run: node --test utils/resumeTextExtractor.test.js
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { extractResumeText, cleanExtractedText, docxHtmlToText, _internal } = require('./resumeTextExtractor');
const { buildPdf } = require('./testPdf');

const { joinRow, groupRows, findGutter, FIELD_SEPARATOR } = _internal;
const PDF = 'application/pdf';

const box = (str, x, w, y = 700, size = 10) => ({ str, x, w, y, size });

describe('joinRow', () => {
  test('joins split words, spaces words, separates far-apart fields', () => {
    assert.equal(joinRow([box('SUMMAR', 40, 54), box('Y', 94, 8)]), 'SUMMARY');
    assert.equal(joinRow([box('Senior', 40, 30), box('Engineer', 73, 40)]), 'Senior Engineer');
    assert.equal(joinRow([box('Acme Corp', 40, 50), box('Mar 2021 – Present', 450, 90)]), `Acme Corp${FIELD_SEPARATOR}Mar 2021 – Present`);
  });
});

describe('findGutter', () => {
  test('finds the gap of a two-column page and not of a one-column page with right-aligned dates', () => {
    const twoCol = [];
    const oneCol = [];
    for (let i = 0; i < 20; i += 1) {
      const y = 800 - i * 14;
      twoCol.push(box('Sidebar item text', 40, 120, y), box('Main column text that is reasonably long here', 230, 300, y));
      oneCol.push(i % 4 === 0
        ? [box('Job title, Company', 40, 110, y), box('2020 – 2022', 480, 60, y)]
        : [box('A long bullet point that runs across most of the page width', 50, 480, y)]);
    }
    assert.ok(findGutter(groupRows(twoCol), 595) > 160);
    assert.equal(findGutter(groupRows(oneCol.flat()), 595), null);
  });
});

describe('extractResumeText (PDF)', () => {
  test('two columns drawn row by row are read column by column', async () => {
    const left = ['CONTACT', 'sam@example.com', 'SKILLS', 'Python, Go', 'Docker', 'LANGUAGES', 'English', 'Spanish', 'EDUCATION', 'BSc Physics'];
    const right = ['Sam Example', 'Backend engineer building payment systems at scale.', 'EXPERIENCE',
      'Senior Engineer, Paylane (2021 - Present)', 'Moved billing to event-driven services across regions.',
      'Cut checkout latency by a third with better caching.', 'Engineer, Ledgerly (2018 - 2021)',
      'Built the reconciliation service used by finance teams.', 'Wrote the on-call runbooks for the payments team.', 'Mentored four junior engineers.'];
    const items = [];
    left.forEach((text, i) => {
      items.push({ x: 40, y: 800 - i * 16, text });
      items.push({ x: 230, y: 800 - i * 16, text: right[i] });
    });
    const { text, columnPages } = await extractResumeText(buildPdf(items), PDF);
    assert.equal(columnPages, 1);
    const lines = text.split('\n');
    assert.deepEqual(lines.slice(0, left.length), left);
    assert.deepEqual(lines.slice(left.length), right);
  });

  test('a right-aligned date stays on its line, separated, and link targets are kept', async () => {
    const items = [
      { x: 40, y: 800, text: 'Alex Sample', size: 18 },
      { x: 40, y: 780, text: 'LinkedIn' },
      { x: 40, y: 740, text: 'EXPERIENCE' },
      { x: 40, y: 720, text: 'Data Analyst, Kestrel Retail' },
      { x: 470, y: 720, text: 'Jan 2020 - Aug 2022' },
      { x: 50, y: 705, text: 'Built a churn model that lifted the return on retention offers by twenty-two percent.' }
    ];
    const links = [{ rect: [38, 776, 85, 790], url: 'https://www.linkedin.com/in/alex-sample' }];
    const { text } = await extractResumeText(buildPdf(items, { links }), PDF);
    assert.match(text, /LinkedIn \(https:\/\/www\.linkedin\.com\/in\/alex-sample\)/);
    assert.match(text, /Data Analyst, Kestrel Retail \| Jan 2020 - Aug 2022/);
  });

  test('a small table with wrapping cells is read column by column', async () => {
    // A 3-column skills grid inside a single-column page; cells wrap onto the next row.
    const row = (y, cells) => cells.map((text, i) => text && { x: [40, 215, 392][i], y, text }).filter(Boolean);
    const items = [
      { x: 40, y: 800, text: 'Summary line that runs across most of the page width, like a normal paragraph does.' },
      { x: 40, y: 770, text: 'SKILLS', size: 13 },
      ...row(750, ['Frontend', 'Backend', 'Cloud']),
      ...row(738, ['Angular, React, TypeScript,', 'Node.js, Express,', 'AWS S3, Lambda,']),
      ...row(727, ['RxJS, Redux, HTML5', 'MongoDB, Redis', 'Docker, Nginx']),
      ...row(716, ['CSS, SCSS', '', 'Vercel, Render']),
      { x: 40, y: 690, text: 'EXPERIENCE', size: 13 }
    ];
    const { text } = await extractResumeText(buildPdf(items), PDF);
    assert.match(text, /SKILLS\nFrontend\nAngular, React, TypeScript,\nRxJS, Redux, HTML5\nCSS, SCSS\nBackend\nNode\.js, Express,\nMongoDB, Redis\nCloud\nAWS S3, Lambda,\nDocker, Nginx\nVercel, Render\nEXPERIENCE/);
  });

  test('a staggered education grid keeps each qualification together', async () => {
    const items = [
      { x: 40, y: 700, text: 'BSc Physics' }, { x: 205, y: 694, text: 'Higher Secondary' }, { x: 365, y: 694, text: 'Secondary' },
      { x: 40, y: 686, text: 'Riverside University' }, { x: 205, y: 680, text: 'Hillview School' }, { x: 365, y: 680, text: 'Lakeside School' },
      { x: 40, y: 674, text: 'Jan 2017' }, { x: 205, y: 668, text: 'Jan 2013' }, { x: 365, y: 668, text: 'Jan 2011' },
      { x: 40, y: 664, text: 'GPA: 7.6' }, { x: 205, y: 658, text: 'GPA: 7.9' }, { x: 365, y: 658, text: 'GPA: 8.3' }
    ];
    const { text } = await extractResumeText(buildPdf(items), PDF);
    assert.equal(text, 'BSc Physics\nRiverside University\nJan 2017\nGPA: 7.6\nHigher Secondary\nHillview School\nJan 2013\nGPA: 7.9\nSecondary\nLakeside School\nJan 2011\nGPA: 8.3');
  });

  test('label/value rows and right-aligned dates stay on their own lines', async () => {
    const items = [
      { x: 40, y: 700, text: 'English' }, { x: 300, y: 700, text: 'Native' },
      { x: 40, y: 688, text: 'Spanish' }, { x: 300, y: 688, text: 'Fluent' },
      { x: 40, y: 676, text: 'Hindi' }, { x: 300, y: 676, text: 'Conversational' },
      { x: 40, y: 640, text: 'AWS Solutions Architect' }, { x: 470, y: 640, text: 'Aug 2022' },
      { x: 40, y: 628, text: 'Kubernetes Developer' }, { x: 470, y: 628, text: 'Jan 2023' },
      { x: 40, y: 616, text: 'Google Cloud Engineer' }, { x: 470, y: 616, text: 'Mar 2024' }
    ];
    const { text } = await extractResumeText(buildPdf(items), PDF);
    assert.equal(text, 'English | Native\nSpanish | Fluent\nHindi | Conversational\nAWS Solutions Architect | Aug 2022\nKubernetes Developer | Jan 2023\nGoogle Cloud Engineer | Mar 2024');
  });

  test('unreadable files get a clear message', async () => {
    await assert.rejects(extractResumeText(Buffer.from('not a pdf'), PDF), /couldn't read this file/);
    await assert.rejects(extractResumeText(buildPdf([{ x: 40, y: 800, text: 'Hi' }]), PDF), /couldn't find any text/);
    await assert.rejects(extractResumeText(Buffer.from('x'), 'application/msword'), /PDF or a Word \(\.docx\)/);
  });
});

describe('docxHtmlToText', () => {
  test('keeps list items, table cells and link targets', () => {
    const html = '<p>Casey Diallo</p><p><a href="https://caseydiallo.design">Portfolio</a> | <a href="https://github.com/cdiallo">github.com/cdiallo</a></p>'
      + '<ul><li>Grew revenue 18%</li><li>Ran paid social</li></ul><table><tr><td>Skills</td><td>SQL, GA4</td></tr></table>';
    const text = docxHtmlToText(html);
    assert.match(text, /Portfolio \(https:\/\/caseydiallo\.design\)/);
    assert.match(text, /github\.com\/cdiallo(?! \()/);
    assert.match(text, /• Grew revenue 18%\n• Ran paid social/);
    assert.match(text, /Skills \| SQL, GA4/);
  });
});

describe('cleanExtractedText', () => {
  test('normalises bullets, ligatures, spaces; drops page numbers and blank runs', () => {
    const raw = '● First point\n\n\n– Second point\nefﬁcient work here\nPage 2 of 3\n•\n';
    assert.equal(cleanExtractedText(raw), '• First point\n\n• Second point\nefficient work here');
  });
});
