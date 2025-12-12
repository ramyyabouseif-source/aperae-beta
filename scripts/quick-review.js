const { readFileSync } = require('fs');
const path = require('path');

// Quick review of the entry structure
const entryPath = 'scripts/test-entry.json';
const entry = JSON.parse(readFileSync(entryPath, 'utf8'));

console.log('\n=== Quick Review ===\n');

const issues = [];
const fixes = [];

// Check slug structure
if (typeof entry.metadata?.slug === 'string') {
  fixes.push('slug is string, needs to be object with value property');
}

// Check grapeVariety structure
if (Array.isArray(entry.composition?.grapeVariety)) {
  fixes.push('grapeVariety is array, needs to be object with value property');
}

// Check market.range
if (entry.market?.range?.min === null && entry.market?.range?.max === null) {
  fixes.push('market.range has null values, should be removed for single price');
}

// Check required fields
if (!entry.metadata?.slug) issues.push('Missing metadata.slug');
if (!entry.wineIdentity) issues.push('Missing wineIdentity');
if (!entry.geography) issues.push('Missing geography');
if (!entry.composition) issues.push('Missing composition');
if (!entry.market) issues.push('Missing market');
if (!entry.sensoryProfile) issues.push('Missing sensoryProfile');
if (!entry.compliance) issues.push('Missing compliance');

console.log('Required fields:', issues.length === 0 ? '✓ All present' : issues.join(', '));
console.log('Fixes needed:', fixes.length === 0 ? 'None' : fixes.join(', '));
console.log('\nEntry structure looks good overall, needs normalization.');




