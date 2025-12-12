const fs = require("fs");
const path = "backend/services/wineData/datasets/raw/batch-2025-11-10.json";
const raw = fs.readFileSync(path, "utf8");
const data = JSON.parse(raw);

function normaliseSlug(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[^a-z0-9-]/gi, (ch) => {
      const lower = ch.toLowerCase();
      if (/[a-z0-9-]/.test(lower)) return lower;
      if (/\s/.test(ch)) return "-";
      return "";
    })
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

for (const record of data) {
  if (!record.metadata) record.metadata = {};
  const slug = record.metadata.slug;
  if (typeof slug === "string") {
    record.metadata.slug = {
      value: normaliseSlug(slug),
      provenance: "derived",
      generation_rule: "lowercase(producer)-lowercase(wineName)-vintage"
    };
  } else if (slug && typeof slug === "object") {
    if (typeof slug.value === "string") {
      slug.value = normaliseSlug(slug.value);
    }
    slug.provenance ||= "derived";
    slug.generation_rule ||= "lowercase(producer)-lowercase(wineName)-vintage";
  } else {
    const identity = record.wineIdentity || {};
    const slugParts = [identity.producer?.value, identity.wineName?.value, identity.vintage?.value]
      .filter(Boolean)
      .map((part) => String(part).toLowerCase());
    record.metadata.slug = {
      value: normaliseSlug(slugParts.join("-")),
      provenance: "derived",
      generation_rule: "lowercase(producer)-lowercase(wineName)-vintage"
    };
  }

  if (record.composition) {
    const gv = record.composition.grapeVariety;
    if (Array.isArray(gv)) {
      record.composition.grapeVariety = {
        value: gv,
        provenance: "canonical",
        source: ""
      };
    }
  }

  if (record.market) {
    if (record.market.agingPotential && !record.market.aging) {
      record.market.aging = record.market.agingPotential;
      delete record.market.agingPotential;
    }
    if (record.market.pricePoint && typeof record.market.pricePoint.value === "string") {
      const cleaned = record.market.pricePoint.value.trim();
      const numeric = Number(cleaned.replace(/[^0-9.+-]/g, ""));
      if (!Number.isNaN(numeric)) {
        record.market.pricePoint.numericHelper = record.market.pricePoint.numericHelper ?? numeric;
      }
    }
  }

  if (record.compliance) {
    if (Array.isArray(record.compliance.sources)) {
      record.compliance.sources = record.compliance.sources.map((source) => source ?? "");
    }
    if (Array.isArray(record.compliance.warnings)) {
      record.compliance.warnings = record.compliance.warnings.map((warning) => warning ?? "");
    }
  }
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Normalised records:", data.length);
