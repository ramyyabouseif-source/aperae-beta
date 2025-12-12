const fs = require("fs");
const path = "backend/services/wineData/datasets/raw/batch-2025-11-10.json";

function assert(cond, message) {
  if (!cond) {
    throw new Error(message);
  }
}

const data = JSON.parse(fs.readFileSync(path, "utf8"));
assert(Array.isArray(data) && data.length > 0, "Batch must be a non-empty array");

data.forEach((record, idx) => {
  const id = idx + 1;
  const slug = record?.metadata?.slug;
  assert(slug && typeof slug.value === "string" && slug.value.trim().length > 0, `Record ${id}: missing slug value`);
  assert(typeof slug.provenance === "string" && slug.provenance.length > 0, `Record ${id}: slug missing provenance`);
  assert(typeof slug.generation_rule === "string" && slug.generation_rule.length > 0, `Record ${id}: slug missing generation_rule`);

  const gv = record?.composition?.grapeVariety;
  assert(gv && Array.isArray(gv.value), `Record ${id}: grapeVariety.value must be array`);

  const pricePoint = record?.market?.pricePoint;
  if (pricePoint) {
    const num = pricePoint.numericHelper;
    const val = pricePoint.value;
    assert(num === null || num === undefined || typeof num === "number", `Record ${id}: pricePoint.numericHelper must be number or null`);
    assert(
      typeof val === "string" || typeof val === "number",
      `Record ${id}: pricePoint.value must be string or number`
    );
  }

  const expertRatings = record?.expertRatings;
  assert(!expertRatings || Array.isArray(expertRatings), `Record ${id}: expertRatings must be array`);

  const warnings = record?.compliance?.warnings;
  assert(!warnings || Array.isArray(warnings), `Record ${id}: compliance.warnings must be array`);

  const sources = record?.compliance?.sources;
  assert(!sources || Array.isArray(sources), `Record ${id}: compliance.sources must be array`);
});

console.log(`Final validation passed for ${data.length} records.`);
