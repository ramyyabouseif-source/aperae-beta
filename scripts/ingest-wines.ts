import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { createClient } from '@supabase/supabase-js';

// Load environment configuration
dotenv.config({ path: path.resolve('.env.local') });
dotenv.config();

const SUPABASE_URL = process.env['SUPABASE_URL'] ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type FlatRecord = Record<string, JsonValue>;
type WineRecord = Record<string, JsonValue>;

const DEFAULT_SCHEMA_PATH = path.resolve('backend', 'services', 'wineData', 'schema', 'wine.schema.json');

function get(entry: FlatRecord, key: string): JsonValue | undefined {
  return Object.prototype.hasOwnProperty.call(entry, key) ? entry[key] : undefined;
}

function set(target: Record<string, JsonValue>, key: string, value: JsonValue | undefined) {
  if (value !== undefined) {
    target[key] = value;
  }
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

function splitList(raw: JsonValue | undefined): string[] | undefined {
  if (typeof raw !== 'string') return undefined;
  const items = raw
    .split(/;|,|\u2022/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return items.length ? items : undefined;
}

function coerceNumber(raw: JsonValue | undefined): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/[^0-9.+-]/g, '');
    if (!cleaned) return undefined;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function hasNestedStructure(record: FlatRecord): boolean {
  const wineIdentity = get(record, 'wineIdentity');
  return typeof wineIdentity === 'object' && wineIdentity !== null;
}

function mapCritics(entry: FlatRecord): JsonValue[] | undefined {
  const criticsRaw = get(entry, 'critics');
  if (Array.isArray(criticsRaw)) {
    return criticsRaw as JsonValue[];
  }

  const critics: JsonValue[] = [];
  const criticKeys = Object.keys(entry).filter((key) => key.startsWith('critic'));
  const groups = new Map<string, Record<string, JsonValue>>();

  criticKeys.forEach((key) => {
    const [label, field] = key.split('_');
    if (!label || !field) return;
    const bucket = groups.get(label) ?? {};
    bucket[field] = get(entry, key) ?? null;
    groups.set(label, bucket);
  });

  groups.forEach((value) => {
    const publication = value['publication'];
    const score = value['score'];
    if (publication && score !== undefined) {
      critics.push({
        publication,
        critic: value['critic'] ?? null,
        score,
        scale: value['scale'] ?? null,
        date: value['date'] ?? null,
        citation: value['citation'] ?? null,
        provenance: 'attribution_required'
      });
    }
  });

  return critics.length ? critics : undefined;
}

function buildValueObject(value?: JsonValue, provenance?: JsonValue, source?: JsonValue): JsonValue | undefined {
  const val = normaliseNullable(value);
  if (val === undefined) return undefined;
  const obj: Record<string, JsonValue> = { value: val };
  const prov = normaliseNullable(provenance);
  const src = normaliseNullable(source);
  if (prov !== undefined) obj['provenance'] = prov;
  if (src !== undefined) obj['source'] = src;
  return obj;
}

function transformFlatRecord(entry: FlatRecord): WineRecord {
  const metadata: Record<string, JsonValue> = {};
  const wineIdentity: Record<string, JsonValue> = {};
  const geography: Record<string, JsonValue> = {};
  const composition: Record<string, JsonValue> = {};
  const market: Record<string, JsonValue> = {};
  const sensoryProfile: Record<string, JsonValue> = {};
  const structureProfile: Record<string, JsonValue> = {};
  const flavorProfile: Record<string, JsonValue> = {};
  const finish: Record<string, JsonValue> = {};
  const pairingIntelligence: Record<string, JsonValue> = {};
  const servingGuidance: Record<string, JsonValue> = {};
  const compliance: Record<string, JsonValue> = {};

  set(wineIdentity, 'wineName', buildValueObject(get(entry, 'wineName_value'), get(entry, 'wineName_provenance'), get(entry, 'wineName_source')));
  set(wineIdentity, 'producer', buildValueObject(get(entry, 'producer_value'), get(entry, 'producer_provenance'), get(entry, 'producer_source')));
  set(wineIdentity, 'vintage', buildValueObject(get(entry, 'vintage_value'), get(entry, 'vintage_provenance'), get(entry, 'vintage_source')));

  set(geography, 'region', buildValueObject(get(entry, 'region_value'), get(entry, 'region_provenance'), get(entry, 'region_source')));
  set(geography, 'appellation', buildValueObject(get(entry, 'appellation_value'), get(entry, 'appellation_provenance'), get(entry, 'appellation_source')));

  set(composition, 'grapeVariety', buildValueObject(get(entry, 'grapeVariety_value'), get(entry, 'grapeVariety_provenance'), get(entry, 'grapeVariety_source')));
  set(composition, 'alcoholLevel', buildValueObject(get(entry, 'alcoholLevel_value'), get(entry, 'alcoholLevel_provenance'), get(entry, 'alcoholLevel_source')));
  set(composition, 'residualSugar', buildValueObject(get(entry, 'residualSugar_value'), get(entry, 'residualSugar_provenance'), get(entry, 'residualSugar_source')));
  set(composition, 'pH', buildValueObject(get(entry, 'pH_value'), get(entry, 'pH_provenance'), get(entry, 'pH_source')));
  set(composition, 'oakAging', buildValueObject(get(entry, 'aging_value'), get(entry, 'aging_provenance'), get(entry, 'aging_source')));

  const pricePointValue = normaliseNullable(get(entry, 'pricePoint_value'));
  if (pricePointValue !== undefined) {
    set(market, 'pricePoint', {
      value: typeof pricePointValue === 'number' ? pricePointValue : coerceNumber(pricePointValue) ?? pricePointValue,
      currency: normaliseNullable(get(entry, 'pricePoint_currency')) ?? 'USD',
      provenance: normaliseNullable(get(entry, 'pricePoint_provenance')) ?? null,
      source: normaliseNullable(get(entry, 'pricePoint_source')) ?? null
    });
  }
  set(market, 'availability', buildValueObject(get(entry, 'availability_value'), get(entry, 'availability_provenance'), get(entry, 'availability_source')));

  set(sensoryProfile, 'tastingNotes', buildValueObject(get(entry, 'tastingNotes_value'), get(entry, 'tastingNotes_provenance'), get(entry, 'tastingNotes_source')));

  set(structureProfile, 'body', normaliseNullable(get(entry, 'body')));
  set(structureProfile, 'sweetness', normaliseNullable(get(entry, 'sweetness')));
  set(structureProfile, 'acidity', normaliseNullable(get(entry, 'acidity')));
  set(structureProfile, 'tannin', normaliseNullable(get(entry, 'tannin')));
  set(structureProfile, 'residualSugar_g_per_L', normaliseNullable(get(entry, 'residualSugar_g_per_L')));
  set(structureProfile, 'oakInfluence', normaliseNullable(get(entry, 'oakInfluence')));
  const textureDescriptors = splitList(get(entry, 'textureDescriptors'));
  if (textureDescriptors) set(structureProfile, 'textureDescriptors', textureDescriptors);
  if (Object.keys(structureProfile).length) set(sensoryProfile, 'structureProfile', structureProfile);

  const primaryFlavors = splitList(get(entry, 'flavorProfile_primary'));
  if (primaryFlavors) set(flavorProfile, 'primary', primaryFlavors);
  const secondaryFlavors = splitList(get(entry, 'flavorProfile_secondary'));
  if (secondaryFlavors) set(flavorProfile, 'secondary', secondaryFlavors);
  const tertiaryFlavors = splitList(get(entry, 'flavorProfile_tertiary'));
  if (tertiaryFlavors) set(flavorProfile, 'tertiary', tertiaryFlavors);
  if (Object.keys(flavorProfile).length) set(sensoryProfile, 'flavorProfile', flavorProfile);

  set(finish, 'length', normaliseNullable(get(entry, 'finish_length')));
  const finishCharacter = splitList(get(entry, 'finish_character'));
  if (finishCharacter) set(finish, 'character', finishCharacter);
  if (Object.keys(finish).length) set(sensoryProfile, 'finish', finish);

  const critics = mapCritics(entry);
  const averageRatingValue = normaliseNullable(get(entry, 'averageRating_value'));
  const averageRatingComputation = normaliseNullable(get(entry, 'averageRating_computation'));

  const slugParts = [
    slugifyPart(extractValue(wineIdentity, 'producer')),
    slugifyPart(extractValue(wineIdentity, 'wineName')),
    slugifyPart(extractValue(wineIdentity, 'vintage'))
  ].filter((part): part is string => typeof part === 'string' && part.length > 0);

  if (slugParts.length) {
    const slug = slugParts.join('-');
    metadata['slug'] = {
      value: slug,
      provenance: 'derived',
      generation_rule: 'lowercase(producer)-lowercase(wineName)-vintage'
    } as unknown as JsonValue;
  }

  const primaryPairings = splitList(get(entry, 'primaryPairings'));
  if (primaryPairings) set(pairingIntelligence, 'primaryPairings', { value: primaryPairings, provenance: 'derived' });
  const avoidPairings = splitList(get(entry, 'avoidPairings'));
  if (avoidPairings) set(pairingIntelligence, 'avoidPairings', { value: avoidPairings, provenance: 'derived' });
  const flavorBridge = normaliseNullable(get(entry, 'flavorBridge'));
  if (flavorBridge !== undefined) set(pairingIntelligence, 'flavorBridge', { value: flavorBridge, provenance: 'derived' });
  const dominantElements = normaliseNullable(get(entry, 'dominantElements'));
  if (dominantElements !== undefined) set(pairingIntelligence, 'dominantElements', { value: dominantElements, provenance: 'derived' });
  const pairingRationale = normaliseNullable(get(entry, 'pairingRationale'));
  if (pairingRationale !== undefined) set(pairingIntelligence, 'pairingRationale', { value: pairingRationale, provenance: 'derived' });

  const servingTemp = normaliseNullable(get(entry, 'servingTemp_value'));
  if (servingTemp !== undefined) {
    set(servingGuidance, 'temperature', {
      value: servingTemp,
      provenance: 'derived',
      rationale: normaliseNullable(get(entry, 'servingTemp_rationale')) ?? null
    });
  }
  const decanting = normaliseNullable(get(entry, 'decanting_value'));
  if (decanting !== undefined) set(servingGuidance, 'decanting', { value: decanting, provenance: 'derived' });
  const glassware = normaliseNullable(get(entry, 'glassware_value'));
  if (glassware !== undefined) set(servingGuidance, 'glassware', { value: glassware, provenance: 'derived' });
  const agingPotential = normaliseNullable(get(entry, 'agingPotential_value'));
  if (agingPotential !== undefined) set(servingGuidance, 'agingPotential', { value: agingPotential, provenance: 'derived' });

  const complianceSourcesRaw = get(entry, 'compliance_sources');
  let complianceSources: JsonValue | undefined;
  if (Array.isArray(complianceSourcesRaw)) {
    complianceSources = complianceSourcesRaw;
  } else {
    const splitSources = splitList(complianceSourcesRaw);
    complianceSources = splitSources ?? complianceSourcesRaw ?? undefined;
  }

  const provenanceSummary: Record<string, JsonValue> = {};
  const canonicalCount = coerceNumber(get(entry, 'compliance_canonical'));
  if (canonicalCount !== undefined) set(provenanceSummary, 'canonical', canonicalCount);
  const attributionCount = coerceNumber(get(entry, 'compliance_attributionRequired'));
  if (attributionCount !== undefined) set(provenanceSummary, 'attributionRequired', attributionCount);
  const derivedCount = coerceNumber(get(entry, 'compliance_derived'));
  if (derivedCount !== undefined) set(provenanceSummary, 'derived', derivedCount);
  if (Object.keys(provenanceSummary).length) set(compliance, 'provenanceSummary', provenanceSummary);

  set(compliance, 'dataUseStatus', normaliseNullable(get(entry, 'compliance_dataUseStatus')) ?? 'restricted_use');
  set(compliance, 'dataUseRationale', normaliseNullable(get(entry, 'compliance_dataUseRationale')));
  set(compliance, 'confidenceLevel', normaliseNullable(get(entry, 'compliance_confidenceLevel')));
  set(compliance, 'confidenceRationale', normaliseNullable(get(entry, 'compliance_confidenceRationale')));
  const conflict = get(entry, 'compliance_conflict');
  if (typeof conflict === 'boolean') set(compliance, 'conflict', conflict);
  set(compliance, 'conflictDetails', normaliseNullable(get(entry, 'compliance_conflictDetails')));
  if (complianceSources !== undefined) set(compliance, 'sources', complianceSources);
  set(compliance, 'lastUpdated', normaliseNullable(get(entry, 'compliance_lastUpdated')));

  const record: WineRecord = {
    wineIdentity,
    geography,
    composition,
    market,
    sensoryProfile,
    compliance
  };

  if (Object.keys(metadata).length) {
    record['metadata'] = metadata;
  }

  if (critics && critics.length) set(record, 'expertRatings', critics);
  if (averageRatingValue !== undefined || averageRatingComputation !== undefined) {
    set(record, 'averageRating', {
      value: averageRatingValue ?? null,
      computation: averageRatingComputation ?? null,
      provenance: 'derived'
    });
  }
  if (Object.keys(pairingIntelligence).length) set(record, 'pairingIntelligence', pairingIntelligence);
  if (Object.keys(servingGuidance).length) set(record, 'servingGuidance', servingGuidance);

  return record;
}

function transformRecord(entry: FlatRecord): WineRecord {
  if (hasNestedStructure(entry)) {
    return entry as WineRecord;
  }
  return transformFlatRecord(entry);
}

function extractValue(container: JsonValue | undefined, key: string): JsonValue | undefined {
  if (!container || typeof container !== 'object') return undefined;
  const record = container as Record<string, JsonValue>;
  const nested = record[key];
  if (!nested || typeof nested !== 'object') return undefined;
  return (nested as Record<string, JsonValue>)['value'];
}

function slugifyPart(value: JsonValue | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim().toLowerCase();
  if (!str.length) return undefined;
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildDeterministicId(record: WineRecord): string {
  const metadata = record['metadata'] as Record<string, JsonValue> | undefined;
  const slugValue =
    metadata && typeof metadata['slug'] === 'object'
      ? (metadata['slug'] as Record<string, JsonValue>)['value']
      : undefined;
  if (typeof slugValue === 'string' && slugValue.trim().length > 0) {
    return createHash('sha256').update(slugValue.trim()).digest('hex').slice(0, 32);
  }

  const identity = record['wineIdentity'] as Record<string, JsonValue> | undefined;
  const name = extractValue(identity, 'wineName');
  const producer = extractValue(identity, 'producer');
  const vintage = extractValue(identity, 'vintage');

  const key = `${producer ?? ''}::${name ?? ''}::${vintage ?? ''}`.toLowerCase();
  return createHash('sha256').update(key).digest('hex').slice(0, 32);
}

async function loadSchema(filePath: string): Promise<any> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readInput(targetPath: string): Promise<FlatRecord[]> {
  const stats = await fs.stat(targetPath);
  if (stats.isDirectory()) {
    const files = await fs.readdir(targetPath);
    const records: FlatRecord[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const contents = await fs.readFile(path.join(targetPath, file), 'utf8');
      const parsed = JSON.parse(contents);
      if (Array.isArray(parsed)) {
        records.push(...(parsed as FlatRecord[]));
      } else {
        records.push(parsed as FlatRecord);
      }
    }
    return records;
  }
  const contents = await fs.readFile(targetPath, 'utf8');
  const parsed = JSON.parse(contents);
  return Array.isArray(parsed) ? (parsed as FlatRecord[]) : [parsed as FlatRecord];
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
      // This shouldn't happen (numericHelper should be a number), but handle it
      // Extract the first valid number from the string
      const match = value.match(/^(\d+\.?\d*)/);
      if (match) {
        const num = Number(match[1]);
        if (Number.isFinite(num)) {
          return num;
        }
      }
      return null;
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
      // Extract the FIRST number from the string (for ranges like "13.5–14.5%" or "14.5% or 15.0%")
      // Use a regex that matches the first number and stops (don't try to concatenate multiple numbers)
      const firstMatch = fallbackValue.match(/^[^0-9]*(\d+\.?\d*)/);
      if (firstMatch) {
        const num = Number(firstMatch[1]);
        if (Number.isFinite(num)) {
          return num;
        }
      }
      return null;
    }
  }
  
  return null;
}

function sanitizeRecord(record: WineRecord): WineRecord {
  // Deep clone to avoid mutating the original
  const sanitized = JSON.parse(JSON.stringify(record)) as WineRecord;
  
  // Sanitize composition numericHelper fields - ALWAYS ensure numericHelper is a valid number or null
  const composition = sanitized['composition'] as Record<string, JsonValue> | undefined;
  if (composition) {
    const sanitizeField = (fieldName: string) => {
      const field = composition[fieldName] as Record<string, JsonValue> | undefined;
      if (field && field['value']) {
        // Always normalize numericHelper - if null, extract from value; if exists, ensure it's a number
        const currentHelper = field['numericHelper'];
        let normalized: number | null;
        
        if (currentHelper !== undefined && currentHelper !== null) {
          // Normalize existing numericHelper - ensure it's a number, not a string
          normalized = normalizeNumericHelper(currentHelper, field['value']);
        } else {
          // Extract from value if numericHelper is null/undefined
          // Pass null as first param (numericHelper), value as fallback
          normalized = normalizeNumericHelper(null, field['value']);
        }
        
        // Always set numericHelper (even if null) to ensure JSONB structure is consistent
        field['numericHelper'] = normalized;
      } else if (field) {
        // Field exists but no value - ensure numericHelper is null
        field['numericHelper'] = null;
      }
    };
    sanitizeField('alcoholLevel');
    sanitizeField('residualSugar_g_per_L');
    sanitizeField('pH');
  }
  
  // Sanitize market.pricePoint numericHelper - ALWAYS ensure numericHelper is a valid number or null
  const market = sanitized['market'] as Record<string, JsonValue> | undefined;
  if (market && market['pricePoint']) {
    const pricePoint = market['pricePoint'] as Record<string, JsonValue>;
    if (pricePoint['value']) {
      const currentHelper = pricePoint['numericHelper'];
      let normalized: number | null;
      
      if (currentHelper !== undefined && currentHelper !== null) {
        // Normalize existing numericHelper
        normalized = normalizeNumericHelper(currentHelper, pricePoint['value']);
      } else {
        // Extract from value if numericHelper is null/undefined
        // Pass null as first param, value as fallback
        normalized = normalizeNumericHelper(null, pricePoint['value']);
      }
      
      // Always set numericHelper (even if null)
      pricePoint['numericHelper'] = normalized;
    } else {
      pricePoint['numericHelper'] = null;
    }
  }
  
  return sanitized;
}

async function upsertRecord(record: WineRecord, dryRun: boolean) {
  if (dryRun) return;
  if (!supabase) {
    throw new Error('Supabase client not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or use --dry-run.');
  }
  
  // Sanitize the record to ensure all numericHelper values are properly typed
  const sanitized = sanitizeRecord(record);
  
  const { error } = await supabase.from('wine_records').upsert(
    {
      id: buildDeterministicId(sanitized),
      schema_version: 1,
      data: sanitized
    },
    { onConflict: 'id' }
  );

  if (error) {
    const wineName = (sanitized['wineIdentity'] as Record<string, JsonValue>)?.['wineName'] as Record<string, JsonValue> | undefined;
    const wineNameValue = wineName?.['value'] as string | undefined;
    throw new Error(`Supabase upsert failed for "${wineNameValue || 'unknown'}": ${error.message}`);
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      type: 'string',
      demandOption: true,
      describe: 'Path to JSON file or directory containing wine records'
    })
    .option('schema', {
      alias: 's',
      type: 'string',
      default: DEFAULT_SCHEMA_PATH,
      describe: 'Path to JSON schema file for validation'
    })
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      describe: 'Validate only; do not write to Supabase',
      default: false
    })
    .help()
    .parse();

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const schema = await loadSchema(argv.schema);
  const validate = ajv.compile(schema);

  const inputPath = path.resolve(argv.input);
  const rawRecords = await readInput(inputPath);

  let successCount = 0;
  let failureCount = 0;

  for (const raw of rawRecords) {
    try {
      const record = transformRecord(raw);
      const valid = validate(record);
      if (!valid) {
        failureCount += 1;
        console.error('Validation failed:', validate.errors);
        continue;
      }
      await upsertRecord(record, argv['dry-run']);
      successCount += 1;
    } catch (err) {
      failureCount += 1;
      console.error('Ingestion error:', err);
    }
  }

  console.log(`Finished ingestion. Success: ${successCount}, Failed: ${failureCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

