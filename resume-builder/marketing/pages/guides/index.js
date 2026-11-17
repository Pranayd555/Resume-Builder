const { BRAND_NAME } = require('../../facts');
const { esc } = require('../../layout');

// Listed on /guides, in this order. Each entry's module provides path, h1 and description.
const GUIDES = [
  require('./resume-format-for-freshers'),
  require('./ats-friendly-resume'),
  require('./resume-vs-cv-vs-biodata'),
];

// Guides that live outside /guides but belong on the list.
const RELATED = [require('../freshers')];

const card = (p) => `<div class="card"><h3><a href="${p.path}">${esc(p.h1)}</a></h3><p>${esc(p.description)}</p></div>`;

module.exports = {
  path: '/guides',
  title: `Resume Guides: Format, ATS and Tips for Freshers | ${BRAND_NAME}`,
  description: 'Practical resume guides: the right resume format for freshers, how to write an ATS-friendly resume, and the difference between a resume, a CV and a biodata.',
  h1: 'Resume guides',
  crumb: 'Guides',
  lede: 'Short, practical guides to writing a resume that recruiters and applicant tracking systems can read.',
  body: `<div class="grid">\n${[...GUIDES, ...RELATED].map(card).join('\n')}\n</div>`,
  extraLd: [{
    '@type': 'ItemList',
    itemListElement: [...GUIDES, ...RELATED].map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://presmistique.in${p.path}`, name: p.h1 })),
  }],
  GUIDES,
};
