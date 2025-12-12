const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'backend', 'services', 'wineData', 'datasets', 'raw', 'batch-2025-11-10.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const records = Array.isArray(data) ? data : [data];

console.log(`Checking ${records.length} records for numericHelper type issues...\n`);

const problematicRecords = [];

records.forEach((record, idx) => {
  const issues = [];
  
  // Check composition fields
  const composition = record?.composition;
  if (composition) {
    const checkField = (fieldName, path) => {
      const field = composition[fieldName];
      if (field && typeof field === 'object' && field.numericHelper !== undefined && field.numericHelper !== null) {
        const numHelper = field.numericHelper;
        const value = field.value;
        
        if (typeof numHelper === 'string') {
          issues.push({
            field: path,
            numericHelper: numHelper,
            value: value,
            issue: 'numericHelper is string instead of number'
          });
        } else if (typeof numHelper === 'number' && !Number.isFinite(numHelper)) {
          issues.push({
            field: path,
            numericHelper: numHelper,
            value: value,
            issue: 'numericHelper is not a finite number'
          });
        }
      }
    };
    
    checkField('alcoholLevel', 'composition.alcoholLevel');
    checkField('residualSugar_g_per_L', 'composition.residualSugar_g_per_L');
    checkField('pH', 'composition.pH');
  }
  
  // Check market.pricePoint
  const market = record?.market;
  if (market && market.pricePoint) {
    const pricePoint = market.pricePoint;
    if (pricePoint.numericHelper !== undefined && pricePoint.numericHelper !== null) {
      const numHelper = pricePoint.numericHelper;
      if (typeof numHelper === 'string') {
        issues.push({
          field: 'market.pricePoint',
          numericHelper: numHelper,
          value: pricePoint.value,
          issue: 'numericHelper is string instead of number'
        });
      } else if (typeof numHelper === 'number' && !Number.isFinite(numHelper)) {
        issues.push({
          field: 'market.pricePoint',
          numericHelper: numHelper,
          value: pricePoint.value,
          issue: 'numericHelper is not a finite number'
        });
      }
    }
  }
  
  if (issues.length > 0) {
    const wineName = record?.wineIdentity?.wineName?.value || 'Unknown';
    problematicRecords.push({
      index: idx + 1,
      wineName,
      issues
    });
  }
});

if (problematicRecords.length > 0) {
  console.log(`Found ${problematicRecords.length} records with type issues:\n`);
  problematicRecords.forEach(({ index, wineName, issues }) => {
    console.log(`Record ${index}: ${wineName}`);
    issues.forEach(({ field, numericHelper, value, issue }) => {
      console.log(`  ❌ ${field}: ${issue}`);
      console.log(`     value: "${value}"`);
      console.log(`     numericHelper: "${numericHelper}" (type: ${typeof numericHelper})`);
    });
    console.log();
  });
} else {
  console.log('✅ All numericHelper values are correctly typed (numbers or null).');
  console.log('\nThe issue might be in how PostgreSQL is processing the JSONB data.');
  console.log('This could be caused by:');
  console.log('  1. A trigger or constraint on the wine_records table');
  console.log('  2. The SQL view definition trying to validate data during INSERT');
  console.log('  3. JSONB serialization/deserialization issues');
}




