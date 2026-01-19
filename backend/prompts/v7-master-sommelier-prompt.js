/**
 * V7.0 Master Sommelier Prompt Builder
 * 
 * Builds the complete V7.0 prompt with:
 * - Static sections (cacheable)
 * - Dynamic sections (per-request)
 * - Optimized JSON schema (fields removed for performance)
 */

const STATIC_SECTIONS = require('./v7-static-sections');
const DYNAMIC_SECTIONS = require('./v7-dynamic-sections');

/**
 * Builds the complete V7.0 Master Sommelier Prompt
 * @param {string} dish - The dish to recommend wines for
 * @param {string} referenceDate - Reference date for vintage calculations (default: "2025-12-02")
 * @returns {string} Complete prompt ready for Claude API
 */
function buildV7Prompt(dish, referenceDate = "2025-12-02") {
  // Extract year from reference date
  const year = referenceDate.split('-')[0];
  
  return `ROLE: Master Sommelier (CMS IV, WSET 4, ISG certified) with scientific pairing methodology. Never fabricate wine details.

TASK: For ${dish}, recommend exactly 3 wines (Premium/Moderate/Budget) with confidence scores 85+.

REFERENCE DATE: ${referenceDate} (for vintage calculations)

${DYNAMIC_SECTIONS.dishAnalysisProtocol}

${STATIC_SECTIONS.pairingPrinciples}

${STATIC_SECTIONS.tierClassification}

${DYNAMIC_SECTIONS.purchasability}

${DYNAMIC_SECTIONS.vintageSelection(referenceDate)}

${STATIC_SECTIONS.confidenceScoring}

${DYNAMIC_SECTIONS.outputRequirements}

8. JSON OUTPUT FORMAT

Respond with ONLY valid JSON (no markdown, no code blocks, no extra text):

${getOptimizedJSONSchema()}

${STATIC_SECTIONS.copyrightCompliance}

${DYNAMIC_SECTIONS.preflightChecklist}`;
}

/**
 * Returns the optimized JSON schema with removed fields (not displayed on client)
 * Fields removed: cookingMethod, cookingMethodImpact, sauce, sauceCharacteristic,
 *                 saucePriority, tierRationale, tierFallbackApplied, vintageRationale
 */
function getOptimizedJSONSchema() {
  return `{
  "dish": "exact dish name",
  "dishAnalysis": {
    "cookingMethod": "method (brief description)",
    "cookingMethodImpact": "how affects wine (150-250 characters)",
    "sauce": "cream/butter/tomato/soy/vinegar/oil/reduction/mustard/none",
    "sauceCharacteristic": "fat/acid/umami/sweet/spice (brief)",
    "saucePriority": "why sauce determines wine (150-250 characters)",
    "dominantWeight": "light/medium/medium-heavy/heavy",
    "fatContent": "none/low/medium/medium-high/high",
    "primaryProtein": "type + texture",
    "dominantFlavors": ["sweet", "salty", "sour", "bitter", "umami"],
    "spiceLevel": "none/mild/moderate/hot",
    "acidityLevel": "low/medium/medium-high/high",
    "applicablePrinciples": ["list from Section 2"],
    "keyChallenge": "critical constraint (150-250 characters)",
    "idealProfile": {
      "acidity": "low/medium/medium-high/high",
      "acidType": "malic/tartaric/balanced",
      "tannin": "none/low/low-medium/medium/medium-high/high",
      "body": "light/light-medium/medium/medium-full/full",
      "sweetness": "dry/off-dry/sweet",
      "maxABV": "13.5% (only if capsaicin, else omit)",
      "notes": "traits, compounds if applicable (150-250 characters)"
    }
  },
  "recommendations": [
    {
      "tierLabel": "Premium Selection",
      "wineName": "specific OR 'unknown'",
      "producer": "SINGLE NAME OR 'unknown'",
      "region": "specific OR 'unknown'",
      "vintage": "YYYY / YYYY-YYYY (if approved) / NV / unknown",
      "grape": "Variety (Color) OR Variety (Color, Sweetness)",
      "rationale": "300-500 characters (acceptable 275-550): sommelier voice per Section 7.C—describe wine-dish interaction using sensory language, explain pairing mechanism naturally without parenthetical principle names, include vintage context in natural phrasing.",
      "pairingPrinciplesApplied": ["list - backend data, not in rationale text"],
      "tastingNotes": {
        "aromas": ["descriptor 1", "descriptor 2"],
        "palate": "flavors + structure",
        "finish": "brief"
      },
      "servingGuidance": {
        "temperature": "XX-XX°F (XX-XX°C)",
        "glassware": "specific type",
        "decanting": "timing OR 'No decant needed'"
      },
      "confidence": {
        "score": 90,
        "breakdown": {
          "pairingScience": 47,
          "wineKnowledge": 28,
          "complexityHandling": 15
        },
        "rationale": "scoring summary (150-250 characters): components, deductions, verification per Section 6"
      },
      "story": "brief context (150-250 characters)",
    }
  ],
  "avoid": {
    "types": ["Wine category 1", "Wine category 2", "Wine category 3"],
    "reason": "Natural language explanation (200-350 characters, acceptable 175-375): why these wine types would create problems with this specific dish—describe the sensory clash or imbalance without referencing section numbers. Per Section 7.G examples."
  },
  "closingNarrative": "brief summary (150-250 characters): wrap up the recommendation with an engaging sommelier tone, reinforcing the suitability of the selected wines for the dish."
}`;
}

/**
 * Gets the static prompt sections for caching
 * These sections don't change between requests and can be cached by Anthropic
 * Includes: Role, all instruction sections, rules, schemas
 * Note: Even though some sections are in DYNAMIC_SECTIONS file, they are actually
 * static instructions (dishAnalysisProtocol, purchasability rules, outputRequirements, preflightChecklist)
 */
function getStaticPromptSections() {
  return `ROLE: Master Sommelier (CMS IV, WSET 4, ISG certified) with scientific pairing methodology. Never fabricate wine details.

${DYNAMIC_SECTIONS.dishAnalysisProtocol}

${STATIC_SECTIONS.pairingPrinciples}

${STATIC_SECTIONS.tierClassification}

${DYNAMIC_SECTIONS.purchasability}

${STATIC_SECTIONS.confidenceScoring}

${DYNAMIC_SECTIONS.outputRequirements}

8. JSON OUTPUT FORMAT

Respond with ONLY valid JSON (no markdown, no code blocks, no extra text):

${getOptimizedJSONSchema()}

${STATIC_SECTIONS.copyrightCompliance}

${DYNAMIC_SECTIONS.preflightChecklist}`;
}

/**
 * Gets the dynamic prompt sections that change per request
 * These should be sent as user message (not cached)
 */
function getDynamicPromptSections(dish, referenceDate = "2025-12-02") {
  return [
    `TASK: For ${dish}, recommend exactly 3 wines (Premium/Moderate/Budget) with confidence scores 85+.`,
    `REFERENCE DATE: ${referenceDate} (for vintage calculations)`,
    DYNAMIC_SECTIONS.vintageSelection(referenceDate)
  ].join('\n\n');
}

module.exports = {
  buildV7Prompt,
  getOptimizedJSONSchema,
  getStaticPromptSections,
  getDynamicPromptSections
};
