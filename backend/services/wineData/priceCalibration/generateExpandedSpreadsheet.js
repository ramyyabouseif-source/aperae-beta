/**
 * Generate Expanded Validation Spreadsheet (200 wines)
 * 
 * Creates CSV with:
 * - Pre-filled prices for previously validated wines
 * - Additional fields for model accuracy
 * - Enhanced validation checklist
 */

const fs = require('fs');
const path = require('path');

const WINES_PATH = path.join(__dirname, 'winesToValidate200.json');
const CSV_PATH = path.join(__dirname, 'validationSpreadsheet200.csv');

const wines = JSON.parse(fs.readFileSync(WINES_PATH, 'utf8'));

// Enhanced CSV Header with additional fields
let csv = 'ID,Wine Name,Producer,Vintage,Region,Country,Kaggle Price (2017),Price Range,Search Query,';
csv += 'Current Price (YOU FILL),Source (YOU FILL),Date (YOU FILL),';
csv += 'Pre-Validated Price (if available),Pre-Validated Source,Pre-Validated Date,';
csv += 'Critic Score (OPTIONAL - Wine Spectator/Wine Advocate),Vintage Quality (OPTIONAL - 0-100),';
csv += 'Producer Reputation (OPTIONAL - 1-10),Wine Type (OPTIONAL - Red/White/Rose/Sparkling),';
csv += 'Notes (OPTIONAL)\n';

// CSV Rows
wines.forEach(wine => {
  const row = [
    wine.id,
    `"${wine.title.replace(/"/g, '""')}"`,
    `"${wine.producer.replace(/"/g, '""')}"`,
    `"${wine.vintage || 'NV'}"`,
    `"${(wine.region || '').replace(/"/g, '""')}"`,
    `"${(wine.country || '').replace(/"/g, '""')}"`,
    wine.kagglePrice,
    `"${wine.priceRange}"`,
    `"${wine.searchQuery.replace(/"/g, '""')}"`,
    // Current Price (YOU FILL) - pre-fill if validated
    wine.preValidatedPrice || '',
    // Source (YOU FILL) - pre-fill if validated
    wine.preValidatedSource ? `"${wine.preValidatedSource}"` : '',
    // Date (YOU FILL) - pre-fill if validated
    wine.preValidatedDate || '',
    // Pre-validated info (reference)
    wine.preValidatedPrice || '',
    wine.preValidatedSource ? `"${wine.preValidatedSource}"` : '',
    wine.preValidatedDate || '',
    // Additional validation fields
    wine.criticScore || '',
    wine.vintageQuality || '',
    wine.producerReputation || '',
    '', // Wine Type (OPTIONAL)
    ''  // Notes (OPTIONAL)
  ].join(',');
  
  csv += row + '\n';
});

// Write CSV
fs.writeFileSync(CSV_PATH, csv);

const preValidated = wines.filter(w => w.preValidatedPrice).length;
const needsValidation = wines.filter(w => !w.preValidatedPrice).length;

console.log('✅ Created validationSpreadsheet200.csv');
console.log(`   Total wines: ${wines.length}`);
console.log(`   Pre-validated: ${preValidated} (already have prices)`);
console.log(`   Need validation: ${needsValidation}`);
console.log(`   Location: ${CSV_PATH}`);
console.log('\n📝 Additional Fields for Model Accuracy:');
console.log('   - Critic Score: Wine Spectator/Wine Advocate points (if available)');
console.log('   - Vintage Quality: 0-100 rating (if you know it)');
console.log('   - Producer Reputation: 1-10 scale (if you know it)');
console.log('   - Wine Type: Red/White/Rose/Sparkling (for validation)');
console.log('\n💡 These additional fields help improve model accuracy!');
console.log('   Fill them in if you have the information, but they are optional.');


