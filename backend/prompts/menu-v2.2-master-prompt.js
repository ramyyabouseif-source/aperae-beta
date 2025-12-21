/**
 * Menu Sommelier Prompt V2.2 - Master Builder
 * 
 * Builds the complete Menu Sommelier Prompt V2.2 with:
 * - Static sections (cacheable)
 * - Dynamic sections (per-request: dish, menu wines, reference date)
 */

const STATIC_SECTIONS = require('./menu-v2.2-static-sections');
const DYNAMIC_SECTIONS = require('./menu-v2.2-dynamic-sections');

/**
 * Builds the complete Menu Sommelier Prompt V2.2
 * @param {string} dish - The dish to recommend wines for
 * @param {string} menuWinesList - Formatted list of available wines from menu
 * @param {string} referenceDate - Reference date for vintage calculations (default: current date in YYYY-MM-DD format)
 * @returns {string} Complete prompt ready for Claude API
 */
function buildMenuV2Prompt(dish, menuWinesList, referenceDate = null) {
  // Generate reference date if not provided (use current date)
  let refDate = referenceDate;
  if (!refDate) {
    const now = new Date();
    refDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  // Build the complete prompt
  return `ROLE: Master Sommelier (CMS IV, WSET 4, ISG certified) with scientific pairing methodology. Never fabricate wine or menu details.
${DYNAMIC_SECTIONS.task(dish)}
${DYNAMIC_SECTIONS.referenceDate(refDate)}

________________________________________
${STATIC_SECTIONS.preSelectionProtocol}
________________________________________
${STATIC_SECTIONS.menuSelectionConstraints}
________________________________________
${STATIC_SECTIONS.pairingPrinciples}
________________________________________
${STATIC_SECTIONS.tierClassification}
________________________________________
${STATIC_SECTIONS.menuWineEvaluationProtocol}
________________________________________
${STATIC_SECTIONS.selectionStrategy}
________________________________________
${STATIC_SECTIONS.outputRequirements}
________________________________________
7. JSON OUTPUT FORMAT

Respond with ONLY valid JSON (no markdown, no code blocks, no extra text):

${STATIC_SECTIONS.getJSONSchema()}

CRITICAL JSON RULES:
- NO markdown formatting (no \`\`\`json or \`\`\` blocks)
- NO explanatory text before or after JSON
- ALL strings must use double quotes (properly escaped)
- confidence score must be integer 0-100
- Match EXACT formatting from menu
- If uncertain, use "unknown" as string (not null, not empty)
- confidence breakdown must add up to confidence score

________________________________________
${STATIC_SECTIONS.preFlightChecklist}
________________________________________
${STATIC_SECTIONS.personalityAndTone}
________________________________________
AVAILABLE WINES ON THE MENU:
${menuWinesList}`;
}

/**
 * Gets the static prompt sections for caching
 * These sections don't change between requests and can be cached by Anthropic
 * @returns {string} Static prompt sections
 */
function getStaticPromptSections() {
  return `ROLE: Master Sommelier (CMS IV, WSET 4, ISG certified) with scientific pairing methodology. Never fabricate wine or menu details.

________________________________________
${STATIC_SECTIONS.preSelectionProtocol}
________________________________________
${STATIC_SECTIONS.menuSelectionConstraints}
________________________________________
${STATIC_SECTIONS.pairingPrinciples}
________________________________________
${STATIC_SECTIONS.tierClassification}
________________________________________
${STATIC_SECTIONS.menuWineEvaluationProtocol}
________________________________________
${STATIC_SECTIONS.selectionStrategy}
________________________________________
${STATIC_SECTIONS.outputRequirements}
________________________________________
7. JSON OUTPUT FORMAT

Respond with ONLY valid JSON (no markdown, no code blocks, no extra text):

${STATIC_SECTIONS.getJSONSchema()}

CRITICAL JSON RULES:
- NO markdown formatting (no \`\`\`json or \`\`\` blocks)
- NO explanatory text before or after JSON
- ALL strings must use double quotes (properly escaped)
- confidence score must be integer 0-100
- Match EXACT formatting from menu
- If uncertain, use "unknown" as string (not null, not empty)
- confidence breakdown must add up to confidence score

________________________________________
${STATIC_SECTIONS.preFlightChecklist}
________________________________________
${STATIC_SECTIONS.personalityAndTone}
________________________________________
AVAILABLE WINES ON THE MENU:
${DYNAMIC_SECTIONS.menuWinesPlaceholder}`;
}

/**
 * Gets the dynamic prompt sections that change per request
 * These should be sent as user message (not cached)
 * @param {string} dish - The dish name
 * @param {string} menuWinesList - Formatted list of available wines
 * @param {string} referenceDate - Reference date (optional)
 * @returns {string} Dynamic prompt sections
 */
function getDynamicPromptSections(dish, menuWinesList, referenceDate = null) {
  let refDate = referenceDate;
  if (!refDate) {
    const now = new Date();
    refDate = now.toISOString().split('T')[0];
  }
  
  return [
    DYNAMIC_SECTIONS.task(dish),
    DYNAMIC_SECTIONS.referenceDate(refDate),
    menuWinesList
  ].join('\n\n');
}

/**
 * Gets the optimized JSON schema for the response
 * @returns {string} JSON schema string
 */
function getJSONSchema() {
  return STATIC_SECTIONS.getJSONSchema();
}

module.exports = {
  buildMenuV2Prompt,
  getStaticPromptSections,
  getDynamicPromptSections,
  getJSONSchema
};

