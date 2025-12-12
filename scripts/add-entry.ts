import { reviewWineEntry, addToBatch } from './manage-wine-batch.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function main() {
  const entryPath = path.join(__dirname, 'test-entry.json');
  const entry = JSON.parse(await fs.readFile(entryPath, 'utf8'));
  
  console.log('\n=== Reviewing Wine Entry ===\n');
  
  // Review the entry
  const review = await reviewWineEntry(entry, new Date(), true);
  
  if (review.changes.length > 0) {
    console.log('Changes:');
    review.changes.forEach(change => console.log(`  ✓ ${change}`));
  }
  
  if (review.warnings.length > 0) {
    console.log('\nWarnings:');
    review.warnings.forEach(warning => console.log(`  ⚠ ${warning}`));
  }
  
  if (review.errors.length > 0) {
    console.log('\nErrors:');
    review.errors.forEach(error => console.log(`  ✗ ${error}`));
    console.log('\n✗ Entry has errors and cannot be added to batch');
    process.exit(1);
  }
  
  if (!review.success || !review.record) {
    console.log('\n✗ Entry review failed');
    process.exit(1);
  }
  
  console.log(`\n✓ Entry validated successfully (slug: ${review.slug})`);
  
  // Check for duplicates
  if (review.duplicate?.exists) {
    console.log(`\n⚠ Duplicate found in ${review.duplicate.location}: ${review.slug}`);
    console.log('   Please confirm: Replace existing entry? (This will be handled in the final workflow)');
    // For now, we'll skip adding if duplicate exists
    // In the full workflow, we'd prompt the user
    console.log('\n✗ Skipping addition due to duplicate (manual intervention required)');
    process.exit(1);
  }
  
  // Add to batch
  const addResult = await addToBatch(review.record, new Date(), false);
  
  if (addResult.success) {
    console.log(`\n✓ ${addResult.message}`);
    console.log('\nNormalized entry:');
    console.log(JSON.stringify(review.record, null, 2));
  } else {
    console.log(`\n✗ ${addResult.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

