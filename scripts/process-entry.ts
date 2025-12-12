import { promises as fs } from 'node:fs';
import path from 'node:path';
// Import using require for now to avoid module resolution issues
const { reviewAndNormalizeWineEntry } = require('./review-and-normalize-wine.ts');

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type WineRecord = Record<string, JsonValue>;

const DATASETS_DIR = path.resolve('backend', 'services', 'wineData', 'datasets', 'raw');

function getSlug(record: WineRecord): string | null {
  const metadata = record['metadata'] as Record<string, JsonValue> | undefined;
  if (!metadata) return null;
  
  const slug = metadata['slug'] as Record<string, JsonValue> | undefined;
  if (!slug) return null;
  
  const slugValue = slug['value'];
  if (typeof slugValue === 'string' && slugValue.trim().length > 0) {
    return slugValue.trim();
  }
  
  return null;
}

function getBatchFileName(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `batch-${year}-${month}-${day}.json`;
}

async function loadBatchFile(filePath: string): Promise<WineRecord[]> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function saveBatchFile(filePath: string, records: WineRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(records, null, 2) + '\n', 'utf8');
}

async function main() {
  const entryPath = path.join(__dirname, 'test-entry.json');
  const entry = JSON.parse(await fs.readFile(entryPath, 'utf8'));
  
  console.log('\n=== Reviewing Wine Entry ===\n');
  
  // Review and normalize the entry
  const result = await reviewAndNormalizeWineEntry(entry);
  
  if (result.changes.length > 0) {
    console.log('Changes:');
    result.changes.forEach(change => console.log(`  ✓ ${change}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach(warning => console.log(`  ⚠ ${warning}`));
  }
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(error => console.log(`  ✗ ${error}`));
    console.log('\n✗ Entry has errors and cannot be added to batch');
    process.exit(1);
  }
  
  const slug = getSlug(result.record);
  if (!slug) {
    console.log('\n✗ Missing metadata.slug.value');
    process.exit(1);
  }
  
  console.log(`\n✓ Entry validated successfully (slug: ${slug})`);
  
  // Check for duplicates in batch
  const batchDate = new Date();
  const batchFile = path.join(DATASETS_DIR, getBatchFileName(batchDate));
  const batchRecords = await loadBatchFile(batchFile);
  
  const duplicateIndex = batchRecords.findIndex(r => getSlug(r) === slug);
  if (duplicateIndex >= 0) {
    console.log(`\n⚠ Duplicate found in batch: ${slug}`);
    console.log('   Skipping addition (manual intervention required for replacement)');
    process.exit(1);
  }
  
  // Add to batch
  batchRecords.push(result.record);
  await saveBatchFile(batchFile, batchRecords);
  
  console.log(`\n✓ Added to batch: ${path.basename(batchFile)}`);
  console.log(`  Batch now contains ${batchRecords.length} record(s)`);
  
  // Save normalized entry for inspection
  await fs.writeFile(
    path.join(__dirname, 'normalized-entry.json'),
    JSON.stringify(result.record, null, 2) + '\n',
    'utf8'
  );
  console.log(`\n✓ Normalized entry saved to normalized-entry.json`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
