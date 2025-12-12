const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'backend', 'services', 'wineData', 'datasets', 'raw', 'batch-2025-11-10.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const records = Array.isArray(data) ? data : [data];

console.log(`Checking ${records.length} records for malformed numeric values...\n`);

function checkNumericHelper(obj, path, recordIndex) {
  if (!obj || typeof obj !== 'object') return;
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (key === 'numericHelper') {
      if (typeof value === 'string') {
        // Check if it has multiple decimal points
        const parts = value.split('.');
        if (parts.length > 2) {
          console.log(`❌ Record ${recordIndex + 1}: ${currentPath} = "${value}" (has ${parts.length - 1} decimal points)`);
        }
        // Check if it's a concatenated number (e.g., "13.514.5")
        const match = value.match(/\d+\.\d+\.\d+/);
        if (match) {
          console.log(`❌ Record ${recordIndex + 1}: ${currentPath} = "${value}" (appears to be concatenated)`);
        }
      } else if (typeof value === 'number' && !Number.isFinite(value)) {
        console.log(`❌ Record ${recordIndex + 1}: ${currentPath} = ${value} (not finite)`);
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          checkNumericHelper(item, `${currentPath}[${idx}]`, recordIndex);
        }
      });
    } else if (value && typeof value === 'object') {
      checkNumericHelper(value, currentPath, recordIndex);
    }
  }
}

records.forEach((record, idx) => {
  checkNumericHelper(record, '', idx);
});

console.log('\n✅ Check complete.');




