import { promises as fs } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type WineRecord = Record<string, JsonValue>;
type FlatRecord = Record<string, JsonValue>;

const DEFAULT_SCHEMA_PATH = path.resolve('backend', 'services', 'wineData', 'schema', 'wine.schema.json');

function get(entry: FlatRecord | WineRecord, key: string): JsonValue | undefined {
  return Object.prototype.hasOwnProperty.call(entry, key) ? entry[key] : undefined;
}

function normaliseNullable(value: JsonValue | undefined): JsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toUpperCase() === 'N/A') return undefined;
    return trimmed;
  }
  if (Array.isArray(value) && value.length === 0) return undefined;
  return value;
}

function extractFirstNumber(value: string): number | null {
  // Extract the first number from a string (handles ranges like "13.5–14.5%" or "14.5% or 15.0%")
  const match = value.match(/^[^0-9]*(\d+\.?\d*)/);
  if (match) {
    const num = Number(match[1]);
    if (Number.isFinite(num)) {
      return num;
    }
  }
  return null;
}

function extractPriceRange(value: string): { min: number | null; max: number | null; currency: string; isRange: boolean } {
  // Extract price range from strings like "$22–$25 USD" or "$49-50 USD" or "$26 USD or £17.89"
  const currencyMatch = value.match(/(USD|EUR|GBP|£|€|\$)/i);
  const currency = currencyMatch ? (currencyMatch[0] === '£' ? 'GBP' : currencyMatch[0] === '€' ? 'EUR' : currencyMatch[0] === '$' ? 'USD' : currencyMatch[0].toUpperCase()) : 'USD';
  
  // Check for explicit range indicators (en-dash, em-dash, hyphen, "to", "or")
  const hasRangeIndicator = /[\u2013\u2014–—]|(\s+to\s+)|(\s+or\s+)|(\s+-\s+)/i.test(value);
  
  // Extract all numbers from the string
  const numbers = value.match(/\d+\.?\d*/g)?.map(n => Number(n)).filter(n => !isNaN(n)) || [];
  
  if (numbers.length === 0) {
    return { min: null, max: null, currency, isRange: false };
  }
  
  if (numbers.length === 1) {
    return { min: numbers[0], max: numbers[0], currency, isRange: false };
  }
  
  // If multiple numbers and has range indicator, treat as range
  // Otherwise, use first number as single price
  if (hasRangeIndicator) {
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    return { min, max, currency, isRange: true };
  } else {
    // Multiple numbers but no range indicator - use first (primary) price
    return { min: numbers[0], max: numbers[0], currency, isRange: false };
  }
}

function normalizeNumericHelper(value: JsonValue, fallbackValue?: JsonValue): number | null {
  // First, try to normalize the numericHelper value itself if provided
  if (value !== null && value !== undefined) {
    if (typeof value === 'number') {
      if (Number.isFinite(value)) {
        return value;
      }
      return null;
    }
    if (typeof value === 'string') {
      return extractFirstNumber(value);
    }
  }
  
  // If numericHelper is null/undefined, try to extract from the value string
  if (fallbackValue !== null && fallbackValue !== undefined) {
    if (typeof fallbackValue === 'number') {
      if (Number.isFinite(fallbackValue)) {
        return fallbackValue;
      }
      return null;
    }
    if (typeof fallbackValue === 'string') {
      return extractFirstNumber(fallbackValue);
    }
  }
  
  return null;
}

interface NormalizationResult {
  record: WineRecord;
  changes: string[];
  warnings: string[];
  errors: string[];
}

function normalizeRecord(entry: WineRecord | FlatRecord): NormalizationResult {
  const changes: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Deep clone to avoid mutating the original
  const normalized = JSON.parse(JSON.stringify(entry)) as WineRecord;
  
  // Check for nested structure
  const wineIdentity = get(normalized, 'wineIdentity');
  if (!wineIdentity || typeof wineIdentity !== 'object') {
    errors.push('Missing or invalid wineIdentity');
    return { record: normalized, changes, warnings, errors };
  }
  
  // Normalize composition fields
  const composition = normalized['composition'] as Record<string, JsonValue> | undefined;
  if (composition) {
    // Fix grapeVariety if it's directly an array instead of a valueWithProvenance object
    if (composition['grapeVariety'] && Array.isArray(composition['grapeVariety'])) {
      const grapeArray = composition['grapeVariety'] as JsonValue[];
      composition['grapeVariety'] = {
        value: grapeArray,
        provenance: 'canonical',
        source: null
      };
      changes.push('composition: Wrapped grapeVariety array in valueWithProvenance object');
    }
    
    const normalizeField = (fieldName: string, fieldLabel: string) => {
      const field = composition[fieldName] as Record<string, JsonValue> | undefined;
      if (field && field['value']) {
        const currentHelper = field['numericHelper'];
        const valueStr = String(field['value']);
        
        // Check if value contains a range
        const hasRange = /[\u2013\u2014–—]/.test(valueStr) || /\bor\b/i.test(valueStr) || /-/.test(valueStr);
        
        let normalizedHelper: number | null;
        
        if (currentHelper !== undefined && currentHelper !== null) {
          // Normalize existing numericHelper
          normalizedHelper = normalizeNumericHelper(currentHelper, field['value']);
          if (normalizedHelper !== currentHelper && typeof currentHelper !== 'number') {
            changes.push(`${fieldLabel}: Set numericHelper from "${currentHelper}" to ${normalizedHelper}`);
          }
        } else {
          // Extract from value if numericHelper is null/undefined
          normalizedHelper = normalizeNumericHelper(null, field['value']);
          if (normalizedHelper !== null) {
            changes.push(`${fieldLabel}: Extracted numericHelper ${normalizedHelper} from value "${valueStr}"`);
          }
        }
        
        if (hasRange && normalizedHelper !== null) {
          warnings.push(`${fieldLabel}: Value contains range "${valueStr}", using first value ${normalizedHelper} for numericHelper`);
        }
        
        field['numericHelper'] = normalizedHelper;
      } else if (field) {
        field['numericHelper'] = null;
      }
    };
    
    normalizeField('alcoholLevel', 'alcoholLevel');
    normalizeField('residualSugar_g_per_L', 'residualSugar');
    normalizeField('pH', 'pH');
  }
  
  // Normalize market.pricePoint and market.range
  const market = normalized['market'] as Record<string, JsonValue> | undefined;
  if (market && market['pricePoint']) {
    const pricePoint = market['pricePoint'] as Record<string, JsonValue>;
    const valueStr = String(pricePoint['value'] || '');
    
    // Extract price range
    const priceRange = extractPriceRange(valueStr);
    
    // Normalize numericHelper
    const currentHelper = pricePoint['numericHelper'];
    let normalizedHelper: number | null;
    
    if (currentHelper !== undefined && currentHelper !== null) {
      normalizedHelper = normalizeNumericHelper(currentHelper, pricePoint['value']);
    } else {
      normalizedHelper = priceRange.min || extractFirstNumber(valueStr);
    }
    
    if (normalizedHelper !== currentHelper) {
      if (currentHelper === null || currentHelper === undefined) {
        changes.push(`pricePoint: Extracted numericHelper ${normalizedHelper} from value "${valueStr}"`);
      } else {
        changes.push(`pricePoint: Updated numericHelper from ${currentHelper} to ${normalizedHelper}`);
      }
    }
    
    pricePoint['numericHelper'] = normalizedHelper;
    
    // Set market.range if we extracted a range
    if (priceRange.isRange && priceRange.min !== null && priceRange.max !== null && priceRange.min !== priceRange.max) {
      if (!market['range']) {
        market['range'] = {};
      }
      const range = market['range'] as Record<string, JsonValue>;
      range['min'] = priceRange.min;
      range['max'] = priceRange.max;
      range['currency'] = priceRange.currency;
      changes.push(`pricePoint: Extracted price range ${priceRange.min}-${priceRange.max} ${priceRange.currency} from value "${valueStr}"`);
      warnings.push(`pricePoint: Value contains price range "${valueStr}", extracted to market.range (min: ${priceRange.min}, max: ${priceRange.max}) and set numericHelper to ${normalizedHelper}`);
    } else {
      // Single price - remove range if it exists with null values or doesn't match
      if (market['range']) {
        const range = market['range'] as Record<string, JsonValue>;
        const rangeMin = range['min'];
        const rangeMax = range['max'];
        
        // If range has null values or single price, remove it
        if (rangeMin === null || rangeMax === null || (priceRange.min !== null && rangeMin === rangeMax && rangeMin === priceRange.min)) {
          delete market['range'];
          changes.push(`pricePoint: Removed market.range (single price ${normalizedHelper} ${priceRange.currency})`);
        } else if (priceRange.min !== null && (rangeMin !== priceRange.min || rangeMax !== priceRange.max)) {
          // Range exists but doesn't match extracted price - update it
          range['min'] = priceRange.min;
          range['max'] = priceRange.max;
          range['currency'] = priceRange.currency;
          changes.push(`pricePoint: Updated market.range to match single price ${normalizedHelper} ${priceRange.currency}`);
        }
      }
    }
    
    // Ensure currency is set on pricePoint
    if (!pricePoint['currency']) {
      pricePoint['currency'] = priceRange.currency;
      changes.push(`pricePoint: Set currency to ${priceRange.currency}`);
    }
  }
  
  // Validate and fix slug
  if (!normalized['metadata']) {
    normalized['metadata'] = {};
  }
  const metadata = normalized['metadata'] as Record<string, JsonValue>;
  
  if (!metadata['slug']) {
    // Try to generate slug from wineIdentity
    const wineIdentity = normalized['wineIdentity'] as Record<string, JsonValue> | undefined;
    if (wineIdentity) {
      const wineName = (wineIdentity['wineName'] as Record<string, JsonValue>)?.['value'] as string | undefined;
      const producer = (wineIdentity['producer'] as Record<string, JsonValue>)?.['value'] as string | undefined;
      const vintage = (wineIdentity['vintage'] as Record<string, JsonValue>)?.['value'] as string | number | undefined;
      
      if (wineName && producer && vintage) {
        const slugValue = `${producer}-${wineName}-${vintage}`.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        metadata['slug'] = {
          value: slugValue,
          provenance: 'derived',
          generation_rule: 'lowercase(producer)-lowercase(wineName)-vintage'
        };
        changes.push(`metadata: Generated slug "${slugValue}" from wineIdentity`);
      } else {
        errors.push('Cannot generate slug: missing wineName, producer, or vintage');
      }
    } else {
      errors.push('Cannot generate slug: missing wineIdentity');
    }
  } else {
    // Check if slug is a string (needs to be wrapped in object) or an object
    const slugRaw = metadata['slug'];
    if (typeof slugRaw === 'string') {
      // Slug is a string - wrap it in an object
      metadata['slug'] = {
        value: slugRaw,
        provenance: 'canonical',
        generation_rule: null
      };
      changes.push(`metadata: Wrapped slug string "${slugRaw}" in valueWithProvenance object`);
    } else if (typeof slugRaw === 'object' && slugRaw !== null) {
      const slug = slugRaw as Record<string, JsonValue>;
      if (!slug['value'] || typeof slug['value'] !== 'string') {
        // Try to fix slug - generate from wineIdentity
        const wineIdentity = normalized['wineIdentity'] as Record<string, JsonValue> | undefined;
        if (wineIdentity) {
          const wineName = (wineIdentity['wineName'] as Record<string, JsonValue>)?.['value'] as string | undefined;
          const producer = (wineIdentity['producer'] as Record<string, JsonValue>)?.['value'] as string | undefined;
          const vintage = (wineIdentity['vintage'] as Record<string, JsonValue>)?.['value'] as string | number | undefined;
          
          if (wineName && producer && vintage) {
            const slugValue = `${producer}-${wineName}-${vintage}`.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            
            slug['value'] = slugValue;
            if (!slug['provenance']) {
              slug['provenance'] = 'derived';
            }
            if (!slug['generation_rule']) {
              slug['generation_rule'] = 'lowercase(producer)-lowercase(wineName)-vintage';
            }
            changes.push(`metadata: Fixed invalid slug, set to "${slugValue}"`);
          } else {
            errors.push('Cannot fix slug: missing wineName, producer, or vintage');
          }
        } else {
          errors.push('Cannot fix slug: missing wineIdentity');
        }
      }
    } else {
      errors.push('Invalid slug type: must be string or object');
    }
  }
  
  // Normalize vintage.value to number if it's a numeric string
  const wineIdentity = normalized['wineIdentity'] as Record<string, JsonValue> | undefined;
  if (wineIdentity && wineIdentity['vintage']) {
    const vintage = wineIdentity['vintage'] as Record<string, JsonValue> | undefined;
    if (vintage && vintage['value']) {
      const vintageValue = vintage['value'];
      if (typeof vintageValue === 'string') {
        const numericVintage = Number(vintageValue);
        if (!isNaN(numericVintage) && isFinite(numericVintage)) {
          vintage['value'] = numericVintage;
          changes.push(`vintage: Converted value from "${vintageValue}" to number ${numericVintage}`);
        }
      }
    }
  }
  
  // Normalize expertRatings scores from string to number
  if (normalized['expertRatings'] && Array.isArray(normalized['expertRatings'])) {
    const expertRatings = normalized['expertRatings'] as Array<Record<string, JsonValue>>;
    expertRatings.forEach((rating, index) => {
      if (rating['score']) {
        const score = rating['score'];
        if (typeof score === 'string') {
          const numericScore = Number(score);
          if (!isNaN(numericScore) && isFinite(numericScore)) {
            rating['score'] = numericScore;
            changes.push(`expertRatings[${index}]: Converted score from "${score}" to number ${numericScore}`);
          }
        }
      }
      // Normalize empty critic strings to null
      if (rating['critic'] === '') {
        rating['critic'] = null;
        changes.push(`expertRatings[${index}]: Converted empty critic string to null`);
      }
    });
  }
  
  // Normalize averageRating.value from string to number
  if (normalized['averageRating']) {
    const averageRating = normalized['averageRating'] as Record<string, JsonValue>;
    if (averageRating['value']) {
      const avgValue = averageRating['value'];
      if (typeof avgValue === 'string') {
        const numericAvg = Number(avgValue);
        if (!isNaN(numericAvg) && isFinite(numericAvg)) {
          averageRating['value'] = numericAvg;
          changes.push(`averageRating: Converted value from "${avgValue}" to number ${numericAvg}`);
        }
      }
    }
    // Ensure computation field is present if missing
    if (!averageRating['computation']) {
      averageRating['computation'] = 'average';
      changes.push('averageRating: Added missing computation field');
    }
  }
  
  // Normalize pricePoint.value to include currency if it's just a number
  if (market && market['pricePoint']) {
    const pricePoint = market['pricePoint'] as Record<string, JsonValue>;
    const valueStr = String(pricePoint['value'] || '');
    // If value is just a number without currency symbol, format it
    if (/^\d+\.?\d*$/.test(valueStr.trim())) {
      const currency = pricePoint['currency'] as string || 'USD';
      const formattedValue = currency === 'USD' ? `$${valueStr}` : `${valueStr} ${currency}`;
      pricePoint['value'] = formattedValue;
      changes.push(`pricePoint: Formatted value from "${valueStr}" to "${formattedValue}"`);
    }
  }
  
  // Rename market.agingPotential to market.aging if it exists
  if (market && market['agingPotential']) {
    market['aging'] = market['agingPotential'];
    delete market['agingPotential'];
    changes.push('market: Renamed agingPotential to aging');
  }
  
  // Normalize compliance.provenanceSummary.attributionRequired (if using snake_case, convert to camelCase)
  if (normalized['compliance']) {
    const compliance = normalized['compliance'] as Record<string, JsonValue>;
    if (compliance['provenanceSummary']) {
      const provenanceSummary = compliance['provenanceSummary'] as Record<string, JsonValue>;
      if (provenanceSummary['attribution_required'] !== undefined) {
        provenanceSummary['attributionRequired'] = provenanceSummary['attribution_required'];
        delete provenanceSummary['attribution_required'];
        changes.push('compliance: Renamed attribution_required to attributionRequired (camelCase)');
      }
    }
  }
  
  // Validate required fields
  if (!wineIdentity) {
    errors.push('Missing required field: wineIdentity');
  } else {
    if (!wineIdentity['wineName']) {
      errors.push('Missing required field: wineIdentity.wineName');
    }
    if (!wineIdentity['producer']) {
      errors.push('Missing required field: wineIdentity.producer');
    }
    if (!wineIdentity['vintage']) {
      errors.push('Missing required field: wineIdentity.vintage');
    }
  }
  
  const geography = normalized['geography'] as Record<string, JsonValue> | undefined;
  if (!geography) {
    errors.push('Missing required field: geography');
  } else {
    if (!geography['region']) {
      errors.push('Missing required field: geography.region');
    }
    if (!geography['appellation']) {
      errors.push('Missing required field: geography.appellation');
    }
  }
  
  const composition = normalized['composition'] as Record<string, JsonValue> | undefined;
  if (!composition) {
    errors.push('Missing required field: composition');
  } else {
    if (!composition['grapeVariety']) {
      errors.push('Missing required field: composition.grapeVariety');
    }
    if (!composition['alcoholLevel']) {
      errors.push('Missing required field: composition.alcoholLevel');
    }
  }
  
  const market = normalized['market'] as Record<string, JsonValue> | undefined;
  if (!market) {
    errors.push('Missing required field: market');
  } else {
    if (!market['pricePoint']) {
      errors.push('Missing required field: market.pricePoint');
    }
    if (!market['availability']) {
      errors.push('Missing required field: market.availability');
    }
  }
  
  if (!normalized['sensoryProfile']) {
    errors.push('Missing required field: sensoryProfile');
  }
  
  if (!normalized['compliance']) {
    errors.push('Missing required field: compliance');
  }
  
  return { record: normalized, changes, warnings, errors };
}

async function loadSchema(filePath: string): Promise<any> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function reviewAndNormalizeWineEntry(
  entry: WineRecord | FlatRecord,
  schemaPath: string = DEFAULT_SCHEMA_PATH
): Promise<NormalizationResult> {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  
  // Normalize the record
  const result = normalizeRecord(entry);
  
  // Validate against schema
  try {
    const schema = await loadSchema(schemaPath);
    const validate = ajv.compile(schema);
    const valid = validate(result.record);
    
    if (!valid && validate.errors) {
      validate.errors.forEach(error => {
        result.errors.push(`Schema validation: ${error.instancePath || 'root'} ${error.message}`);
      });
    }
  } catch (err) {
    result.warnings.push(`Schema validation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  return result;
}

// CLI interface
async function main() {
  const entryStr = process.argv[2];
  if (!entryStr) {
    console.error('Usage: ts-node review-and-normalize-wine.ts <json-entry>');
    process.exit(1);
  }
  
  try {
    const entry = JSON.parse(entryStr);
    const result = await reviewAndNormalizeWineEntry(entry);
    
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
      console.log('\nNormalized record:');
      console.log(JSON.stringify(result.record, null, 2));
    } else {
      console.log('\n✗ Record has errors and cannot be ingested');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

