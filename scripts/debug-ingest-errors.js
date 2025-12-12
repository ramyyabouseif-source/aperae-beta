const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const filePath = path.join(__dirname, '..', 'backend', 'services', 'wineData', 'datasets', 'raw', 'batch-2025-11-10.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const records = Array.isArray(data) ? data : [data];

console.log(`Analyzing ${records.length} records...\n`);

function extractNumericHelper(obj, path = '') {
  if (!obj || typeof obj !== 'object') return [];
  
  const results = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (key === 'numericHelper') {
      if (typeof value === 'string') {
        // Check if it looks like a concatenated number
        const hasMultipleDecimals = value.split('.').length > 2;
        const looksConcatenated = /^\d+\.\d+\.\d+/.test(value);
        if (hasMultipleDecimals || looksConcatenated) {
          results.push({ path: currentPath, value, issue: 'multiple decimals or concatenated' });
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          results.push(...extractNumericHelper(item, `${currentPath}[${idx}]`));
        }
      });
    } else if (value && typeof value === 'object') {
      results.push(...extractNumericHelper(value, currentPath));
    }
  }
  
  return results;
}

// Also check for string values that should be numbers in numericHelper fields
function checkStringNumericHelpers(obj, path = '', recordIndex) {
  const issues = [];
  
  function traverse(o, p) {
    if (!o || typeof o !== 'object') return;
    
    for (const [key, value] of Object.entries(o)) {
      const currentPath = p ? `${p}.${key}` : key;
      
      if (key === 'numericHelper') {
        if (typeof value === 'string') {
          // Try to see if it's a malformed number
          if (value.includes('.') && value.split('.').length > 2) {
            issues.push({
              recordIndex,
              path: currentPath,
              value,
              type: 'string with multiple decimals'
            });
          }
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          if (item && typeof item === 'object') {
            traverse(item, `${currentPath}[${idx}]`);
          }
        });
      } else if (value && typeof value === 'object') {
        traverse(value, currentPath);
      }
    }
  }
  
  traverse(obj, path);
  return issues;
}

records.forEach((record, idx) => {
  const issues = checkStringNumericHelpers(record, '', idx);
  if (issues.length > 0) {
    console.log(`Record ${idx + 1}:`);
    issues.forEach(issue => {
      console.log(`  ❌ ${issue.path}: "${issue.value}" (${issue.type})`);
    });
    console.log();
  }
});

// Also check the JSON structure for any values that might be getting concatenated
console.log('\nChecking for potential concatenation issues...\n');

// Check if any numericHelper values are strings when they should be numbers
let foundIssues = false;
records.forEach((record, idx) => {
  const checkFields = [
    { path: 'composition.alcoholLevel.numericHelper', get: r => r?.composition?.alcoholLevel?.numericHelper },
    { path: 'composition.residualSugar_g_per_L.numericHelper', get: r => r?.composition?.residualSugar_g_per_L?.numericHelper },
    { path: 'composition.pH.numericHelper', get: r => r?.composition?.pH?.numericHelper },
    { path: 'market.pricePoint.numericHelper', get: r => r?.market?.pricePoint?.numericHelper },
  ];
  
  checkFields.forEach(({ path, get }) => {
    const value = get(record);
    if (typeof value === 'string') {
      // Check if it has multiple decimal points
      if (value.split('.').length > 2) {
        console.log(`❌ Record ${idx + 1}: ${path} = "${value}" (string with multiple decimals)`);
        foundIssues = true;
      }
    }
  });
});

if (!foundIssues) {
  console.log('✅ No malformed string numericHelper values found in JSON structure.');
  console.log('\nThe issue might be in how the data is being transformed or sent to Supabase.');
  console.log('Let\'s check what values are actually being generated for the failed records...\n');
  
  // Check the specific error values mentioned
  const errorValues = ['13.514.5', '26.17.892225', '14.515.0'];
  console.log('Looking for records that might generate these error values...\n');
  
  records.forEach((record, idx) => {
    const alc = record?.composition?.alcoholLevel;
    const res = record?.composition?.residualSugar_g_per_L;
    const ph = record?.composition?.pH;
    const price = record?.market?.pricePoint;
    
    // Check if any of these fields have values that could concatenate
    const checkField = (field, name) => {
      if (field?.value && typeof field.value === 'string') {
        const numHelper = field.numericHelper;
        const valueStr = field.value.toString();
        // If both value and numericHelper are strings, check for concatenation
        if (typeof numHelper === 'string' && (valueStr + numHelper.toString()).includes('13.514.5') || 
            (valueStr + numHelper.toString()).includes('26.17.892225') ||
            (valueStr + numHelper.toString()).includes('14.515.0')) {
          console.log(`⚠️  Record ${idx + 1}: ${name} might be concatenating`);
          console.log(`   value: "${valueStr}", numericHelper: "${numHelper}"`);
        }
      }
    };
    
    checkField(alc, 'alcoholLevel');
    checkField(res, 'residualSugar');
    checkField(ph, 'pH');
    checkField(price, 'pricePoint');
  });
}




