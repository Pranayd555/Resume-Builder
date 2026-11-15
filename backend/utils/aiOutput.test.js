/**
 * AI output clean-up and length guards, plus the ATS / rewrite result helpers.
 *
 * Run: node --test utils/aiOutput.test.js
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  FIELD_PROFILES,
  budgetFor,
  finalizeRichText,
  htmlToBlocks,
  plainTextLength,
  truncateText,
  textToHtml
} = require('./aiOutput');
const {
  buildAtsResumeText,
  normalizeAtsAnalysis,
  hasAtsScores,
  buildRewriteInput,
  mergeToneResult,
  mergeSkills,
  mergeKeywordResult,
  sanitizeTemplateHtml
} = require('./aiResults');

const bullets = (html) => htmlToBlocks(html).filter((b) => b.type === 'li').length;

describe('finalizeRichText: response clean-up', () => {
  test('removes fences, chatter, headings, scripts and attributes', () => {
    const raw = 'Sure! Here is the improved text:\n```html\n<h3>Experience</h3><ul class="x"><li onclick="steal()">Led <b>5</b> engineers<script>alert(1)</script> to ship X.</li><li>Cut costs by 30%.</li></ul>\n```\nLet me know if you want changes!';
    assert.equal(finalizeRichText(raw, budgetFor('workExperience')), '<ul><li>Led <strong>5</strong> engineers to ship X.</li><li>Cut costs by 30%.</li></ul>');
  });

  test('converts markdown to HTML', () => {
    const out = finalizeRichText('- **Built** the API\n- Shipped *fast*', budgetFor('projects'));
    assert.equal(out, '<ul><li><strong>Built</strong> the API</li><li>Shipped <em>fast</em></li></ul>');
  });

  test('the summary is always one paragraph, even if the model sends bullets', () => {
    const out = finalizeRichText('<ul><li>Backend engineer</li><li>Seven years in payments</li></ul>', budgetFor('summary'));
    assert.equal(out, '<p>Backend engineer. Seven years in payments.</p>');
  });

  test('escapes text that is not markup', () => {
    assert.equal(finalizeRichText('Cut costs < 5% & more', budgetFor('achievements')), '<p>Cut costs &lt; 5% &amp; more</p>');
  });
});

describe('length guards (fit the template)', () => {
  test('a runaway summary is cut to the summary budget at a sentence end', () => {
    const out = finalizeRichText(`<p>${'Built reliable payment systems. '.repeat(60)}</p>`, budgetFor('summary'));
    assert.ok(plainTextLength(out) <= FIELD_PROFILES.summary.maxChars);
    assert.match(out, /systems\.<\/p>$/);
  });

  test('a job description keeps at most 6 bullets, each within its limit', () => {
    const many = `<ul>${Array.from({ length: 12 }, (_, i) => `<li>Bullet ${i} ${'word '.repeat(i === 0 ? 80 : 5)}</li>`).join('')}</ul>`;
    const out = finalizeRichText(many, budgetFor('workExperience'));
    assert.equal(bullets(out), 6);
    htmlToBlocks(out).forEach((b) => assert.ok(plainTextLength(b.html) <= FIELD_PROFILES.workExperience.maxItemChars));
  });

  test('a rewrite never cuts the user\'s own longer content: the budget grows with the original', () => {
    const original = `<ul>${Array.from({ length: 9 }, (_, i) => `<li>Original point number ${i} with detail</li>`).join('')}</ul>`;
    const budget = budgetFor('workExperience', original);
    assert.equal(budget.maxItems, 9);
    assert.equal(bullets(finalizeRichText(original, budget)), 9);
  });

  test('a bullet that does not fit is left out, never cut mid-sentence', () => {
    const html = '<ul><li>First point that is reasonably long and complete.</li><li>Second point that will not fit in the remaining space at all.</li></ul>';
    const out = finalizeRichText(html, { format: 'bullets', maxChars: 80, maxItems: 6, maxItemChars: 220 });
    assert.equal(out, '<ul><li>First point that is reasonably long and complete.</li></ul>');
  });

  test('summarize never grows the text', () => {
    const budget = budgetFor('summary', '<p>Short summary of about one hundred and forty characters, give or take a few, that should not get longer when summarized.</p>', { mode: 'summarize' });
    assert.ok(budget.maxChars <= 140);
  });

  test('truncateText falls back to a word boundary with an ellipsis', () => {
    assert.equal(truncateText('alpha beta gamma delta', 13), 'alpha beta…');
    assert.equal(truncateText('short', 10), 'short');
  });

  test('textToHtml: description paragraph + bullet list, escaped, hyphen breaks joined', () => {
    assert.equal(textToHtml('Led the high-\ntraffic platform', ['Cut <costs>']), '<p>Led the high-traffic platform</p><ul><li>Cut &lt;costs&gt;</li></ul>');
  });
});

describe('ATS analysis', () => {
  test('scores are clamped per category and the overall score is their sum', () => {
    const out = normalizeAtsAnalysis({
      overall_score: 97,
      category_scores: { keyword_skill_match: 55, experience_alignment: 18.6, section_completeness: -3, project_impact: '7', formatting: 9, bonus_skills: 'n/a' },
      missing_keywords: ['Kubernetes', 'kubernetes', '**Terraform**', ''],
      strengths: Array.from({ length: 10 }, (_, i) => `Strength ${i}`),
      weaknesses: [], ats_warnings: [], recommendations: [`- ${'very long advice '.repeat(30)}`]
    });
    assert.deepEqual(out.category_scores, { keyword_skill_match: 40, experience_alignment: 19, section_completeness: 0, project_impact: 7, formatting: 9, bonus_skills: 0 });
    assert.equal(out.overall_score, 75);
    assert.deepEqual(out.missing_keywords, ['Kubernetes', 'Terraform']);
    assert.equal(out.strengths.length, 6);
    assert.ok(out.recommendations[0].length <= 240 && !out.recommendations[0].startsWith('-'));
  });

  test('an answer without scores is a failure, not a zero score', () => {
    assert.equal(hasAtsScores({}), false);
    assert.equal(hasAtsScores({ category_scores: {} }), false);
    assert.equal(hasAtsScores({ category_scores: { formatting: 5 } }), true);
  });

  test('the resume sent for scoring has no contact details', () => {
    const text = buildAtsResumeText({
      title: 'Engineer', personalInfo: { email: 'jo@example.com', phone: '555 0100', linkedin: '' },
      summary: '<p>Builds APIs</p>',
      workExperience: [{ jobTitle: 'Dev', company: 'Acme', startDate: new Date('2020-01-01'), isCurrentJob: true, description: '<ul><li>Shipped X</li></ul>' }],
      skills: [{ category: 'Lang', items: [{ name: 'Go' }] }]
    });
    assert.ok(!text.includes('jo@example.com') && !text.includes('555 0100'));
    assert.match(text, /email: present, phone: present, address: missing, linkedin: missing/);
    assert.match(text, /- Dev \| Acme \| 2020-01 – Present\n {2}Shipped X/);
  });
});

describe('adjust tone / keywords: results go back on the right item', () => {
  const resumeJson = {
    summary: '<p>Engineer.</p>',
    workExperience: [
      { jobTitle: 'Lead', company: 'A', description: '<ul><li>Led team</li></ul>' },
      { jobTitle: 'Dev', company: 'B', description: '' },
      { jobTitle: 'Intern', company: 'C', description: '<p>Helped</p>' }
    ],
    skills: [{ category: 'Languages', items: [{ name: 'Go', level: 'expert' }] }]
  };

  test('only items with text are sent, with their original index', () => {
    const { input, budgets } = buildRewriteInput(resumeJson, ['summary', 'workExperience']);
    assert.deepEqual(input.workExperience.map((i) => i.index), [0, 2]);
    assert.equal(input.workExperience[0].label, 'Lead | A');
    assert.ok(budgets.summary && budgets.workExperience);
  });

  test('rewrites land on their index; skipped, empty or out-of-range entries keep the original', () => {
    const ai = {
      summary: '',
      workExperience: [
        { index: 2, description: '- Supported releases' },
        { index: 7, description: '<p>Ghost</p>' },
        { index: 0, description: '' }
      ]
    };
    const { data, changed } = mergeToneResult(resumeJson, ai, ['summary', 'workExperience']);
    assert.equal(changed, 1);
    assert.equal(data.summary, '<p>Engineer.</p>');
    assert.equal(data.workExperience.length, 3);
    assert.equal(data.workExperience[0].description, '<ul><li>Led team</li></ul>');
    assert.equal(data.workExperience[2].description, '<ul><li>Supported releases</li></ul>');
    assert.equal(data.workExperience[2].jobTitle, 'Intern');
  });

  test('suggested skills are added; existing ones are never removed or changed', () => {
    const { skills, added } = mergeSkills(resumeJson.skills, [
      { category: 'languages', items: ['go', 'Rust'] },
      { category: 'Cloud', items: ['AWS', 'x'.repeat(80)] }
    ]);
    assert.equal(added, 2);
    assert.deepEqual(skills, [
      { category: 'Languages', items: [{ name: 'Go', level: 'expert' }, { name: 'Rust', level: 'intermediate' }] },
      { category: 'Cloud', items: [{ name: 'AWS', level: 'intermediate' }] }
    ]);
  });

  test('keyword merge returns full lists for the requested sections', () => {
    const { data } = mergeKeywordResult(resumeJson, { workExperience: [], newSkills: [] }, ['workExperience', 'skills']);
    assert.equal(data.workExperience.length, 3);
    assert.deepEqual(data.skills, resumeJson.skills);
  });
});

describe('template HTML', () => {
  test('scripts, handlers and javascript: links are removed; inline styles stay', () => {
    const raw = 'Here is your template:\n```html\n<div style="color:#333" onclick="x()"><h1>Name</h1><script>bad()</script><a href="javascript:alert(1)">x</a><img src=x onerror=y></div>\n```';
    const out = sanitizeTemplateHtml(raw);
    assert.ok(out.startsWith('<div style="color:#333">'));
    assert.ok(!/script|onclick|onerror|javascript:|<img/i.test(out));
    assert.match(out, /<h1>Name<\/h1>/);
  });

  test('no HTML at all -> empty (reported as a failed answer)', () => {
    assert.equal(sanitizeTemplateHtml('Sorry, I cannot help with that.'), '');
  });
});
