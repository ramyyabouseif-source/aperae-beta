/**
 * Generate Validation Spreadsheet
 * 
 * Creates a CSV file from winesToValidate.json for manual price validation
 */

const fs = require('fs');
const path = require('path');

const WINES_PATH = path.join(__dirname, 'winesToValidate.json');
const CSV_PATH = path.join(__dirname, 'validationSpreadsheet.csv');

const wines = JSON.parse(fs.readFileSync(WINES_PATH, 'utf8'));

// CSV Header
let csv = 'ID,Wine Name,Producer,Vintage,Region,Country,Kaggle Price (2017),Price Range,Search Query,Current Price (YOU FILL),Source (YOU FILL),Date (YOU FILL),Notes (OPTIONAL)\n';

// CSV Rows
wines.forEach(wine => {
  const row = [
    wine.id,
    `"${wine.title.replace(/"/g, '""')}"`,
    `"${wine.producer.replace(/"/g, '""')}"`,
    `"${wine.vintage}"`,
    `"${wine.region.replace(/"/g, '""')}"`,
    `"${wine.country.replace(/"/g, '""')}"`,
    wine.kagglePrice,
    `"${wine.priceRange}"`,
    `"${wine.searchQuery.replace(/"/g, '""')}"`,
    '', // Current Price (YOU FILL)
    '', // Source (YOU FILL)
    '', // Date (YOU FILL)
    ''  // Notes (OPTIONAL)
  ].join(',');
  
  csv += row + '\n';
});

// Write CSV
fs.writeFileSync(CSV_PATH, csv);

console.log('✅ Created validationSpreadsheet.csv');
console.log(`   Total wines: ${wines.length}`);
console.log(`   Location: ${CSV_PATH}`);
console.log('\n📝 Next steps:');
console.log('1. Open validationSpreadsheet.csv in Excel or Google Sheets');
console.log('2. Open Wine-Searcher.com in your browser');
console.log('3. For each wine, search and fill in:');
console.log('   - Current Price (YOU FILL)');
console.log('   - Source (YOU FILL) - e.g., "Wine-Searcher.com (manual)"');
console.log('   - Date (YOU FILL) - e.g., "2024-11-03"');
console.log('4. Save completed file as: validationSpreadsheet_COMPLETED.csv');
console.log('5. Run: node processValidationResults.js');


