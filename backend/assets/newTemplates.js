// Import all template categories
const modernTemplates = require('./modernTemplates');
const classicTemplates = require('./classicTemplates');
const creativeTemplates = require('./creativeTemplate');
const professionalTemplates = require('./professionalTemplate');
const minimalistTemplates = require('./minimalistTemplate');
const academicTemplates = require('./academicTemplate');

// Combine all templates into a single array
const allTemplates = [
  ...modernTemplates,
  ...classicTemplates,
  ...creativeTemplates,
  ...professionalTemplates,
  ...minimalistTemplates,
  ...academicTemplates
];

// Export the consolidated array
module.exports = allTemplates;