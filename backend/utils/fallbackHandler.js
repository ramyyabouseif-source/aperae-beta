const { normalizeResponse } = require('./responseNormalizer');
const mockDataEnhanced = require('../mockDataEnhanced.json'); // V7.0 compatible mock data
const logger = require('../logger');

/**
 * Menu V2.2 Mock Data - Used for menu context fallback/mock mode
 * This data structure matches the Menu Sommelier Prompt V2.2 schema exactly
 */
const MENU_V2_2_MOCK_DATA = {
  "dish": "Rack of Lamb with truffle sauce and grilled vegetables",
  "dishAnalysis": {
    "dominantWeight": "heavy",
    "fatContent": "high",
    "primaryProtein": "lamb - fatty red meat with high myoglobin",
    "dominantFlavors": ["umami", "salty", "bitter"],
    "spiceLevel": "none",
    "acidityLevel": "low",
    "applicablePrinciples": ["Tannin-Protein Binding", "Fat Management Dual Requirement", "Tannin-Umami Decision Tree", "Flavor Bridging", "Weight Matching", "Preparation & Sauce Priority"],
    "keyChallenge": "High umami from truffle sauce paired with high-protein lamb creates Scenario 1 (high umami + HIGH protein + high fat), permitting high tannins. Grilled preparation adds char complexity. Wine must provide both high acidity to cleanse fat and high tannins to bind protein.",
    "idealProfile": {
      "acidity": "medium-high",
      "acidType": "tartaric",
      "tannin": "high",
      "body": "full",
      "sweetness": "dry",
      "notes": "Truffle sauce creates high umami environment, but lamb's high protein and fat content (Scenario 1) supports high tannins. Tertiary earthy/forest floor notes would provide Tier 1 compound bridge to truffle. Grilled vegetables add char bitterness requiring structured wine."
    }
  },
  "recommendations": [
    {
      "tierLabel": "Premium Selection",
      "tierRationale": "Barolo DOCG classification indicates premium appellation from Piedmont's most prestigious region.",
      "wineName": "Barolo 'Albe' 2019",
      "producer": "C.D Vajra",
      "vintage": "2019",
      "grape": "Nebbiolo (Red)",
      "region": "Barolo DOCG, Piedmont",
      "rationale": "This Barolo balances the dish through high tannins binding lamb's protein while cutting through fat, with bright acidity cleansing richness. The wine's earthy forest floor tertiary notes create a Tier 1 compound bridge to truffle sauce (aged wine tertiary development matching mushroom/truffle), while firm Nebbiolo tannins are supported by lamb's high protein content in Scenario 1 (high umami + HIGH protein prevents tannin-umami amplification). Regional pairing tradition of Barolo with truffle refined across Piedmont's culinary history.",
      "pairingPrinciplesApplied": ["Tannin-Protein Binding", "Fat Management Dual Requirement", "Tannin-Umami Decision Tree (Scenario 1)", "Flavor Bridging (Tier 1)", "Regional Pairing Culture", "Weight Matching"],
      "tastingNotes": {
        "aromas": ["red cherry", "rose", "tar", "forest floor", "truffle"],
        "palate": "firm tannins, high acidity, red fruit core, earthy complexity, full body",
        "finish": "long, persistent with mineral and earth notes"
      },
      "servingGuidance": {
        "temperature": "62-65°F (17-18°C)",
        "glassware": "Burgundy glass",
        "decanting": "60-90 minutes"
      },
      "confidence": {
        "score": 95,
        "breakdown": {
          "pairingScience": 50,
          "wineKnowledge": 30,
          "complexityHandling": 15,
          "tierAdjustments": 0
        },
        "rationale": "Perfect structural alignment: high tannins for Scenario 1, high acidity for fat, Tier 1 tertiary compound bridge to truffle, regional pairing culture (+5), weight match. Well-known Piedmont producer. Complex dish with umami and char resolved through tannin-protein binding and acidity-fat balance."
      },
      "storytellingElements": "Barolo and truffle represent Piedmont's most iconic pairing, refined over centuries in Alba's culinary tradition where Nebbiolo's firm tannins and earthy complexity mirror the region's prized white truffles."
    },
    {
      "tierLabel": "Moderate Choice",
      "tierRationale": "Chianti Classico Riserva represents elevated DOCG classification with extended aging requirements.",
      "wineName": "'Novecento' - Chianti Classico Riserva",
      "producer": "Dievole",
      "vintage": "unknown",
      "grape": "Sangiovese (Red, 95%), Canaiolo (3%), Colorino (2%)",
      "region": "Chianti Classico DOCG, Tuscany",
      "rationale": "This Riserva bridges the dish through medium-high tannins binding lamb's protein and high acidity cleansing fat. While not achieving Tier 1 compound match like Barolo's truffle synergy, Sangiovese's bright tartaric acidity and savory character provide Tier 3 structural bridge. Scenario 1 conditions (high umami + HIGH protein + high fat) support the wine's firm tannins without bitterness amplification. Riserva aging softens tannins while maintaining structure essential for fatty lamb.",
      "pairingPrinciplesApplied": ["Tannin-Protein Binding", "Fat Management Dual Requirement", "Tannin-Umami Decision Tree (Scenario 1)", "Flavor Bridging (Tier 3)", "Weight Matching"],
      "tastingNotes": {
        "aromas": ["red cherry", "dried herbs", "leather", "tobacco"],
        "palate": "medium-high tannins, bright acidity, red fruit with savory notes, medium-full body",
        "finish": "persistent with dried fruit and spice"
      },
      "servingGuidance": {
        "temperature": "62-65°F (17-18°C)",
        "glassware": "Bordeaux glass",
        "decanting": "45-60 minutes"
      },
      "confidence": {
        "score": 85,
        "breakdown": {
          "pairingScience": 43,
          "wineKnowledge": 25,
          "complexityHandling": 15,
          "tierAdjustments": 2
        },
        "rationale": "Strong structural compatibility with appropriate tannins for Scenario 1 and high acidity for fat. Loses points for Tier 3 vs Tier 1 bridge (Barolo's truffle advantage). Dievole is established Chianti producer. All core principles satisfied though without regional pairing culture bonus."
      },
      "storytellingElements": "Assessment based on Chianti Classico Riserva typicity and established producer reputation."
    },
    {
      "tierLabel": "Budget-Friendly",
      "tierRationale": "Langhe Nebbiolo DOC represents broad regional Piedmont classification below Barolo/Barbaresco DOCG level.",
      "wineName": "Langhe Nebbiolo DOC 2021",
      "producer": "Giovanni Rosso",
      "vintage": "2021",
      "grape": "Nebbiolo (Red)",
      "region": "Langhe DOC, Piedmont",
      "rationale": "This younger Langhe Nebbiolo complements the dish with medium-high tannins binding lamb's protein while medium-high acidity cleanses fat. While lacking the tertiary truffle bridge of aged Barolo, the wine's Nebbiolo character provides Tier 2 aromatic bridge through earthy red fruit and herbal notes. Scenario 1 conditions (high umami + HIGH protein + high fat) support the wine's firm tannins. The 2021 vintage offers fresh acidity ideal for cutting through rich truffle sauce, though softer tannins than premier Barolo.",
      "pairingPrinciplesApplied": ["Tannin-Protein Binding", "Fat Management Dual Requirement", "Tannin-Umami Decision Tree (Scenario 1)", "Flavor Bridging (Tier 2)", "Weight Matching"],
      "tastingNotes": {
        "aromas": ["red cherry", "rose", "herbs"],
        "palate": "medium-high tannins, bright acidity, fresh red fruit, medium-full body",
        "finish": "clean with red fruit and subtle spice"
      },
      "servingGuidance": {
        "temperature": "60-64°F (16-18°C)",
        "glassware": "Burgundy glass",
        "decanting": "30-45 minutes"
      },
      "confidence": {
        "score": 81,
        "breakdown": {
          "pairingScience": 43,
          "wineKnowledge": 25,
          "complexityHandling": 15,
          "tierAdjustments": -2
        },
        "rationale": "Solid structural compatibility with appropriate tannins for Scenario 1 and acidity for fat. Loses points for Tier 2 vs Tier 1 bridge (lacks tertiary truffle synergy). Young vintage lacks complexity of aged Barolo. Giovanni Rosso is reputable Piedmont producer. All core principles satisfied."
      },
      "storytellingElements": "Giovanni Rosso's Langhe Nebbiolo offers an accessible introduction to Piedmont's noble grape with the structure necessary for lamb while maintaining the bright acidity and earthy character that complement the dish's richness."
    }
  ],
  "menuLimitations": "Menu offers excellent pairing options across all three tiers with Piedmont Nebbiolo representations at premium and budget levels, plus Tuscan Sangiovese at moderate tier.",
  "closingNarrative": "These three selections provide tier diversity while maintaining pairing excellence for rack of lamb with truffle sauce. The premium Barolo delivers the iconic truffle bridge, the moderate Chianti Classico offers bright acidity and firm structure, and the budget Langhe Nebbiolo provides accessible Nebbiolo character with appropriate tannins for lamb's high protein content."
};

/**
 * Gets fallback mock response based on feature flag and dish
 * @param {string} dish - The dish name to match
 * @param {string} requestId - Request ID for logging
 * @param {boolean} isMenuContext - Whether this is a menu context request (Menu V2.2)
 * @returns {object} Normalized mock response
 */
function getFallbackResponse(dish, requestId, isMenuContext = false) {
  // If menu context, use Menu V2.2 mock data
  if (isMenuContext) {
    logger.warn('Using Menu V2.2 fallback mock data', { 
      requestId, 
      dish, 
      promptVersion: 'v2.2',
      context: 'menu'
    });
    
    // Use the provided Menu V2.2 mock data (dish name will be overridden if provided)
    const mockResponse = JSON.parse(JSON.stringify(MENU_V2_2_MOCK_DATA));
    
    // Update dish name if provided (for better UX/testing)
    if (dish) {
      mockResponse.dish = dish;
    }
    
    // Normalize to ensure consistent format
    try {
      const normalized = normalizeResponse(mockResponse);
      logger.debug('Menu V2.2 fallback response normalized successfully', { requestId });
      return normalized;
    } catch (normalizeError) {
      logger.error('Failed to normalize Menu V2.2 fallback response, using original', {
        requestId,
        error: normalizeError.message
      });
      return mockResponse; // Return original if normalization fails
    }
  }
  
  // V7.0 is now the standard - use V7.0 compatible mock data
  const mockData = mockDataEnhanced;
  
  logger.warn('Using fallback mock data (V7.0)', { 
    requestId, 
    dish, 
    promptVersion: 'v7.0' 
  });
  
  // Try to find matching dish, otherwise use first entry
  let mockResponse = mockData.find(item => 
    item.dish && (
      item.dish.toLowerCase().includes(dish.toLowerCase()) ||
      dish.toLowerCase().includes(item.dish.toLowerCase())
    )
  );
  
  if (!mockResponse) {
    mockResponse = mockData[0];
    logger.debug('No matching dish found, using first mock entry', { requestId });
  }
  
  // Normalize to ensure consistent format
  try {
    const normalized = normalizeResponse(mockResponse);
    logger.debug('Fallback response normalized successfully', { requestId });
    return normalized;
  } catch (normalizeError) {
    logger.error('Failed to normalize fallback response, using original', {
      requestId,
      error: normalizeError.message
    });
    return mockResponse; // Return original if normalization fails
  }
}

module.exports = { getFallbackResponse };












