const { reviewAndNormalizeWineEntry } = require('./review-and-normalize-wine.ts');
const fs = require('fs');
const path = require('path');

const entryPath = path.join(__dirname, 'test-entry.json');
const entry = JSON.parse(fs.readFileSync(entryPath, 'utf8'));

reviewAndNormalizeWineEntry(entry)
  .then(result => {
    console.log('\n=== Normalization Result ===');
    if (result.changes.length > 0) {
      console.log('\nChanges:');
      result.changes.forEach(change => console.log(`  ✓ ${change}`));
    }
    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach(warning => console.log(`  ⚠ ${warning}`));
    }
    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach(error => console.log(`  ✗ ${error}`));
    }
    
    if (result.errors.length === 0) {
      console.log('\n✓ Record is ready for ingestion');
      // Save normalized entry
      fs.writeFileSync(
        path.join(__dirname, 'normalized-entry.json'),
        JSON.stringify(result.record, null, 2)
      );
      console.log('\nNormalized record saved to normalized-entry.json');
    } else {
      console.log('\n✗ Record has errors and cannot be ingested');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
