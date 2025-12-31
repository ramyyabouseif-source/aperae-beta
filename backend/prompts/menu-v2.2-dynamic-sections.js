/**
 * Menu Sommelier Prompt V2.2 - Dynamic Sections
 * 
 * These sections change per request (dish name, menu wines list, reference date)
 * and are included in the user message (not cached).
 */

const DYNAMIC_SECTIONS = {
  /**
   * Task statement with dish name
   * @param {string} dish - The dish name
   * @returns {string} Task statement
   */
  task: (dish) => `TASK: Select exactly 3 wines from restaurant menu that best complement ${dish}. Use EXACT menu details.`,

  /**
   * Reference date section
   * @param {string} referenceDate - Reference date in YYYY-MM-DD format
   * @returns {string} Reference date statement
   */
  referenceDate: (referenceDate) => `REFERENCE DATE: ${referenceDate} (for vintage assessment)`,

  /**
   * Menu wines list placeholder text
   * This will be replaced with actual menu wines in the builder
   */
  menuWinesPlaceholder: '[MENU_WINES_LIST]'
};

module.exports = DYNAMIC_SECTIONS;



