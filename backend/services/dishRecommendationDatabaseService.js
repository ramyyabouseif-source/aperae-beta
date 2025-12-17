/**
 * Dish Recommendation Database Service
 * 
 * Handles database operations for storing dish recommendations.
 * Stores one row per recommendation (3 rows per request: Complex, Moderate, Simple).
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] 
    : ['error'],
});

/**
 * Stores dish recommendations to the database
 * @param {object} fullResponse - Complete response from Claude (before sanitization)
 * @param {string} requestId - Request ID for tracking
 * @param {number} apiResponseTimeMs - API response time in milliseconds
 * @param {string} promptVersion - Prompt version used (e.g., 'master-chef-v1.0')
 * @returns {Promise<object>} Result with success status and inserted count
 */
async function saveRecommendations(fullResponse, requestId, apiResponseTimeMs, promptVersion = 'master-chef-v1.0') {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!fullResponse || !fullResponse.dishRecommendations || !Array.isArray(fullResponse.dishRecommendations)) {
      throw new Error('Invalid response structure: missing dishRecommendations array');
    }
    
    if (!requestId) {
      throw new Error('Request ID is required');
    }
    
    const wine = fullResponse.wine || 'unknown';
    const dishRecommendations = fullResponse.dishRecommendations;
    
    logger.debug('Storing dish recommendations to database', {
      requestId,
      wine,
      recommendationCount: dishRecommendations.length,
      promptVersion
    });
    
    // Extract wine analysis data
    const wineAnalysis = fullResponse.wineAnalysis || {};
    const wineStructure = wineAnalysis.structure || {};
    const wineAromaticProfile = wineAnalysis.aromaticProfile || {};
    const wineServingGuidance = fullResponse.wineServingGuidance || {};
    
    // Prepare data for bulk insert using raw SQL (for array/JSONB types)
    const insertPromises = dishRecommendations.map(async (dishRec) => {
      const confidence = dishRec.confidence || {};
      const confidenceBreakdown = confidence.breakdown || {};
      const ingredients = dishRec.ingredients || {};
      
      // Build SQL query for this recommendation
      const sql = `
        INSERT INTO dish_recommendations (
          request_id,
          wine,
          created_at,
          user_id,
          prompt_version,
          api_response_time_ms,
          model_used,
          -- Wine Analysis
          wine_producer,
          wine_region,
          wine_vintage,
          wine_vintage_age,
          wine_color,
          -- Wine Structure
          wine_body,
          wine_acidity,
          wine_acid_type,
          wine_tannin,
          wine_tannin_character,
          wine_sweetness,
          wine_abv,
          -- Wine Aromatic Profile
          wine_primary_aromas,
          wine_secondary_aromas,
          wine_tertiary_aromas,
          wine_dominant_compounds,
          -- Wine Analysis Summary
          wine_key_strength,
          wine_ideal_dish_profile,
          -- Wine Serving Guidance
          serving_temperature,
          serving_glassware,
          serving_decanting,
          -- Dish Recommendation
          complexity_label,
          dish_name,
          pairing_rationale,
          pairing_principles_applied,
          -- Recipe Ingredients
          ingredients_protein,
          ingredients_sauce,
          ingredients_sides,
          -- Recipe Steps
          recipe_steps,
          -- Cook Time
          cook_time_prep,
          cook_time_cook,
          cook_time_total,
          -- Serving Suggestion
          serving_suggestion,
          -- Confidence Scoring
          confidence_score,
          confidence_pairing_science,
          confidence_wine_knowledge,
          confidence_recipe_quality,
          confidence_rationale,
          -- Full Response
          full_response_json
        ) VALUES (
          $1, -- request_id
          $2, -- wine
          $3, -- created_at
          $4, -- user_id (NULL for anonymous)
          $5, -- prompt_version
          $6, -- api_response_time_ms
          $7, -- model_used
          $8, -- wine_producer
          $9, -- wine_region
          $10, -- wine_vintage
          $11, -- wine_vintage_age
          $12, -- wine_color
          $13, -- wine_body
          $14, -- wine_acidity
          $15, -- wine_acid_type
          $16, -- wine_tannin
          $17, -- wine_tannin_character
          $18, -- wine_sweetness
          $19, -- wine_abv
          $20, -- wine_primary_aromas (TEXT[])
          $21, -- wine_secondary_aromas (TEXT[])
          $22, -- wine_tertiary_aromas (TEXT[])
          $23, -- wine_dominant_compounds (TEXT[])
          $24, -- wine_key_strength
          $25, -- wine_ideal_dish_profile
          $26, -- serving_temperature
          $27, -- serving_glassware
          $28, -- serving_decanting
          $29, -- complexity_label
          $30, -- dish_name
          $31, -- pairing_rationale
          $32, -- pairing_principles_applied (TEXT[])
          $33, -- ingredients_protein (TEXT[])
          $34, -- ingredients_sauce (TEXT[])
          $35, -- ingredients_sides (TEXT[])
          $36, -- recipe_steps (TEXT[])
          $37, -- cook_time_prep
          $38, -- cook_time_cook
          $39, -- cook_time_total
          $40, -- serving_suggestion
          $41, -- confidence_score
          $42, -- confidence_pairing_science
          $43, -- confidence_wine_knowledge
          $44, -- confidence_recipe_quality
          $45, -- confidence_rationale
          CAST($46::text AS jsonb) -- full_response_json (JSONB)
        )
      `;
      
      const values = [
        requestId,
        wine,
        new Date(),
        null, // user_id - anonymous storage for now
        promptVersion,
        apiResponseTimeMs,
        'claude-sonnet-4-5-20250929',
        // Wine Analysis
        wineAnalysis.producer || null,
        wineAnalysis.region || null,
        wineAnalysis.vintage || null,
        wineAnalysis.vintageAge || null,
        wineAnalysis.color || null,
        // Wine Structure
        wineStructure.body || null,
        wineStructure.acidity || null,
        wineStructure.acidType || null,
        wineStructure.tannin || null,
        wineStructure.tanninCharacter || null,
        wineStructure.sweetness || null,
        wineStructure.abv || null,
        // Wine Aromatic Profile
        wineAromaticProfile.primaryAromas || [],
        wineAromaticProfile.secondaryAromas || [],
        wineAromaticProfile.tertiaryAromas || [],
        wineAromaticProfile.dominantCompounds || [],
        // Wine Analysis Summary
        wineAnalysis.keyStrength || null,
        wineAnalysis.idealDishProfile || null,
        // Wine Serving Guidance
        wineServingGuidance.temperature || null,
        wineServingGuidance.glassware || null,
        wineServingGuidance.decanting || null,
        // Dish Recommendation
        dishRec.complexityLabel || null,
        dishRec.dishName || null,
        dishRec.pairingRationale || null,
        dishRec.pairingPrinciplesApplied || [],
        // Recipe Ingredients
        ingredients.protein || [],
        ingredients.sauce || [],
        ingredients.sides || [],
        // Recipe Steps
        dishRec.recipe || [],
        // Cook Time
        dishRec.cookTime?.prep || null,
        dishRec.cookTime?.cook || null,
        dishRec.cookTime?.total || null,
        // Serving Suggestion
        dishRec.servingSuggestion || null,
        // Confidence Scoring
        confidence.score || null,
        confidenceBreakdown.pairingScience || null,
        confidenceBreakdown.wineKnowledge || null,
        confidenceBreakdown.recipeQuality || null,
        confidence.rationale || null,
        // Full Response JSON
        JSON.stringify(dishRec) // Store individual dish recommendation object
      ];
      
      // Execute raw SQL query
      await prisma.$executeRawUnsafe(sql, ...values);
    });
    
    // Execute all inserts
    await Promise.all(insertPromises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logger.info('Dish recommendations stored successfully', {
      requestId,
      wine,
      recommendationCount: dishRecommendations.length,
      durationMs: duration,
      promptVersion
    });
    
    return {
      success: true,
      insertedCount: dishRecommendations.length,
      requestId,
      durationMs: duration
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logger.error('Failed to store dish recommendations', {
      requestId,
      error: error.message,
      stack: error.stack,
      durationMs: duration
    });
    
    // Don't throw - log error but don't block API response
    return {
      success: false,
      error: error.message,
      insertedCount: 0,
      requestId,
      durationMs: duration
    };
  }
}

module.exports = {
  saveRecommendations
};





