import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { reviewAndNormalizeWineEntry } from './review-and-normalize-wine';

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

function buildDeterministicId(record: WineRecord): string {
  const slug = getSlug(record);
  if (slug) {
    return createHash('sha256').update(slug).digest('hex').slice(0, 32);
  }
  
  const wineIdentity = record['wineIdentity'] as Record<string, JsonValue> | undefined;
  if (!wineIdentity) {
    throw new Error('Cannot generate ID: missing wineIdentity and slug');
  }
  
  const wineName = (wineIdentity['wineName'] as Record<string, JsonValue>)?.['value'];
  const producer = (wineIdentity['producer'] as Record<string, JsonValue>)?.['value'];
  const vintage = (wineIdentity['vintage'] as Record<string, JsonValue>)?.['value'];
  
  const key = `${producer ?? ''}::${wineName ?? ''}::${vintage ?? ''}`.toLowerCase();
  return createHash('sha256').update(key).digest('hex').slice(0, 32);
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

async function checkDuplicateSlug(
  slug: string,
  batchRecords: WineRecord[],
  checkDatabase: boolean = false
): Promise<{ exists: boolean; location: 'batch' | 'database' | null; record?: WineRecord }> {
  // Check in batch
  for (const record of batchRecords) {
    const recordSlug = getSlug(record);
    if (recordSlug === slug) {
      return { exists: true, location: 'batch', record };
    }
  }
  
  // TODO: Check in database if checkDatabase is true
  // For now, we'll skip database check as it requires Supabase client
  
  return { exists: false, location: null };
}

export interface ReviewResult {
  success: boolean;
  record: WineRecord | null;
  changes: string[];
  warnings: string[];
  errors: string[];
  slug: string | null;
  duplicate?: { exists: boolean; location: 'batch' | 'database' | null; record?: WineRecord };
}

export async function reviewWineEntry(
  entry: WineRecord,
  batchDate: Date = new Date(),
  checkDuplicates: boolean = true
): Promise<ReviewResult> {
  // Normalize the entry
  const normalization = await reviewAndNormalizeWineEntry(entry);
  
  if (normalization.errors.length > 0) {
    return {
      success: false,
      record: null,
      changes: normalization.changes,
      warnings: normalization.warnings,
      errors: normalization.errors,
      slug: getSlug(normalization.record)
    };
  }
  
  const slug = getSlug(normalization.record);
  if (!slug) {
    return {
      success: false,
      record: null,
      changes: normalization.changes,
      warnings: normalization.warnings,
      errors: ['Missing metadata.slug.value'],
      slug: null
    };
  }
  
  // Check for duplicates
  let duplicate: { exists: boolean; location: 'batch' | 'database' | null; record?: WineRecord } | undefined;
  if (checkDuplicates) {
    const batchFile = path.join(DATASETS_DIR, getBatchFileName(batchDate));
    const batchRecords = await loadBatchFile(batchFile);
    duplicate = await checkDuplicateSlug(slug, batchRecords, false);
  }
  
  return {
    success: true,
    record: normalization.record,
    changes: normalization.changes,
    warnings: normalization.warnings,
    errors: normalization.errors,
    slug,
    duplicate
  };
}

export async function addToBatch(
  record: WineRecord,
  batchDate: Date = new Date(),
  replaceIfExists: boolean = false
): Promise<{ success: boolean; message: string; record?: WineRecord }> {
  const batchFile = path.join(DATASETS_DIR, getBatchFileName(batchDate));
  const batchRecords = await loadBatchFile(batchFile);
  
  const slug = getSlug(record);
  if (!slug) {
    return { success: false, message: 'Cannot add record: missing slug' };
  }
  
  // Check for duplicate
  const duplicateIndex = batchRecords.findIndex(r => getSlug(r) === slug);
  if (duplicateIndex >= 0) {
    if (replaceIfExists) {
      batchRecords[duplicateIndex] = record;
      await saveBatchFile(batchFile, batchRecords);
      return { success: true, message: `Replaced existing record with slug: ${slug}`, record };
    } else {
      return { success: false, message: `Record with slug "${slug}" already exists in batch`, record: batchRecords[duplicateIndex] };
    }
  }
  
  // Add to batch
  batchRecords.push(record);
  await saveBatchFile(batchFile, batchRecords);
  
  return { success: true, message: `Added record with slug: ${slug}`, record };
}

export async function getBatchSummary(batchDate: Date = new Date()): Promise<{
  file: string;
  count: number;
  records: Array<{ slug: string; wineName: string; producer: string; vintage: string }>;
}> {
  const batchFile = path.join(DATASETS_DIR, getBatchFileName(batchDate));
  const batchRecords = await loadBatchFile(batchFile);
  
  const records = batchRecords.map(record => {
    const wineIdentity = record['wineIdentity'] as Record<string, JsonValue> | undefined;
    const wineName = (wineIdentity?.['wineName'] as Record<string, JsonValue>)?.['value'] as string ?? 'Unknown';
    const producer = (wineIdentity?.['producer'] as Record<string, JsonValue>)?.['value'] as string ?? 'Unknown';
    const vintage = (wineIdentity?.['vintage'] as Record<string, JsonValue>)?.['value'] as string ?? 'Unknown';
    
    return {
      slug: getSlug(record) ?? 'Unknown',
      wineName,
      producer,
      vintage
    };
  });
  
  return {
    file: batchFile,
    count: batchRecords.length,
    records
  };
}

// CLI interface for testing
async function main() {
  const command = process.argv[2];
  
  if (command === 'summary') {
    const summary = await getBatchSummary();
    console.log(`\nBatch Summary (${path.basename(summary.file)}):`);
    console.log(`Total records: ${summary.count}`);
    if (summary.records.length > 0) {
      console.log('\nRecords:');
      summary.records.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.producer} - ${r.wineName} (${r.vintage}) [${r.slug}]`);
      });
    }
  } else {
    console.log('Usage:');
    console.log('  ts-node manage-wine-batch.ts summary - Show batch summary');
  }
}

if (require.main === module) {
  main();
}




