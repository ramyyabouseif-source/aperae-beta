/**
 * Wine Recommendation Database Service
 * 
 * Handles database operations for storing wine recommendations.
 * Stores one row per recommendation (3 rows per request).
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../logger');
const fieldExtractor = require('./fieldExtractorService');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] 
    : ['error'],
});

/**
 * Stores wine recommendations to the database
 * @param {object} fullResponse - Complete response from Claude (before sanitization)
 * @param {string} requestId - Request ID for tracking
 * @param {number} apiResponseTimeMs - API response time in milliseconds
 * @param {string} promptVersion - Prompt version used (e.g., 'v7.0', 'legacy', 'enhanced')
 * @returns {Promise<object>} Result with success status and inserted count
 */
async function storeRecommendations(fullResponse, requestId, apiResponseTimeMs, promptVersion = 'v7.0') {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!fullResponse || !fullResponse.recommendations || !Array.isArray(fullResponse.recommendations)) {
      throw new Error('Invalid response structure: missing recommendations array');
    }
    
    if (!requestId) {
      throw new Error('Request ID is required');
    }
    
    const dish = fullResponse.dish || 'unknown';
    const recommendations = fullResponse.recommendations;
    
    logger.debug('Storing recommendations to database', {
      requestId,
      dish,
      recommendationCount: recommendations.length,
      promptVersion
    });
    
    // Extract fields that were removed from client-side JSON
    const extractedFields = fieldExtractor.extractAllFields(fullResponse);
    
    // Prepare data for bulk insert
    const insertData = recommendations.map((rec, index) => {
      // Get extracted fields for this recommendation
      const extracted = extractedFields.recommendations[index] || {};
      
      // Extract dish analysis data
      const dishAnalysis = fullResponse.dishAnalysis || {};
      const idealProfile = dishAnalysis.idealProfile || {};
      const confidence = rec.confidence || {};
      const confidenceBreakdown = confidence.breakdown || {};
      const tastingNotes = rec.tastingNotes || {};
      const servingGuidance = rec.servingGuidance || {};
      
      // Build the database record
      return {
        request_id: requestId,
        dish: dish,
        created_at: new Date(),
        user_id: null, // Anonymous storage for now
        prompt_version: promptVersion,
        api_response_time_ms: apiResponseTimeMs,
        model_used: 'claude-sonnet-4-5-20250929',
        
        // Dish Analysis
        dominant_weight: dishAnalysis.dominantWeight || null,
        fat_content: dishAnalysis.fatContent || null,
        primary_protein: dishAnalysis.primaryProtein || null,
        dominant_flavors: dishAnalysis.dominantFlavors || [],
        spice_level: dishAnalysis.spiceLevel || null,
        acidity_level: dishAnalysis.acidityLevel || null,
        applicable_principles: dishAnalysis.applicablePrinciples || [],
        key_challenge: dishAnalysis.keyChallenge || null,
        
        // Extracted/Inferred Fields
        cooking_method: extractedFields.dishAnalysis.cookingMethod || null,
        cooking_method_impact: extractedFields.dishAnalysis.cookingMethodImpact || null,
        sauce: extractedFields.dishAnalysis.sauce || null,
        sauce_characteristic: extractedFields.dishAnalysis.sauceCharacteristic || null,
        sauce_priority: extractedFields.dishAnalysis.saucePriority || null,
        max_abv: extractedFields.dishAnalysis.maxABV || null,
        
        // Ideal Profile
        ideal_acidity: idealProfile.acidity || null,
        ideal_acid_type: idealProfile.acidType || null,
        ideal_tannin: idealProfile.tannin || null,
        ideal_body: idealProfile.body || null,
        ideal_sweetness: idealProfile.sweetness || null,
        ideal_notes: idealProfile.notes || null,
        
        // Wine Recommendation Data
        tier_label: rec.tierLabel || null,
        tier_rationale: extracted.tierRationale || null,
        tier_fallback_applied: extracted.tierFallbackApplied || false,
        wine_name: rec.wineName || null,
        producer: rec.producer || null,
        region: rec.region || null,
        vintage: rec.vintage || null,
        grape: rec.grape || null,
        
        // Pairing Rationale
        rationale: rec.rationale || null,
        pairing_principles_applied: rec.pairingPrinciplesApplied || [],
        
        // Tasting Notes
        aromas: Array.isArray(tastingNotes.aromas) ? tastingNotes.aromas : [],
        palate: typeof tastingNotes.palate === 'string' ? tastingNotes.palate : null,
        finish: typeof tastingNotes.finish === 'string' ? tastingNotes.finish : null,
        
        // Serving Guidance
        serving_temperature: servingGuidance.temperature || null,
        serving_glassware: servingGuidance.glassware || null,
        serving_decanting: servingGuidance.decanting || null,
        
        // Confidence Scoring
        confidence_score: confidence.score || null,
        confidence_pairing_science: confidenceBreakdown.pairingScience || null,
        confidence_wine_knowledge: confidenceBreakdown.wineKnowledge || null,
        confidence_complexity_handling: confidenceBreakdown.complexityHandling || null,
        confidence_rationale: confidence.rationale || null,
        
        // Vintage Rationale
        vintage_rationale: extracted.vintageRationale || null,
        
        // Additional Fields
        story: rec.story || null,
        expert_rating: rec.expertRating || null,
        price_point: rec.pricePoint || null,
        category: rec.category || null,
        retailer_suggestion: rec.retailerSuggestion || null,
        image_url: rec.image || null,
        
        // Full Response Data (for debugging/analysis)
        full_response_json: rec, // Store individual recommendation as JSONB
        
        // Avoid Data (from parent response)
        avoid_types: fullResponse.avoid?.types || [],
        avoid_reason: fullResponse.avoid?.reason || null,
        
        // Closing Narrative
        closing_narrative: fullResponse.closingNarrative || null
      };
    });
    
    // Insert records one by one using raw SQL (simpler and more reliable)
    // Prisma doesn't support all PostgreSQL array/JSONB operations easily
    let insertedCount = 0;
    
    for (const data of insertData) {
      try {
        await prisma.$executeRaw`
          INSERT INTO wine_recommendations (
            request_id, dish, created_at, user_id, prompt_version, api_response_time_ms, model_used,
            dominant_weight, fat_content, primary_protein, dominant_flavors, spice_level, acidity_level,
            applicable_principles, key_challenge,
            cooking_method, cooking_method_impact, sauce, sauce_characteristic, sauce_priority, max_abv,
            ideal_acidity, ideal_acid_type, ideal_tannin, ideal_body, ideal_sweetness, ideal_notes,
            tier_label, tier_rationale, tier_fallback_applied, wine_name, producer, region, vintage, grape,
            rationale, pairing_principles_applied,
            aromas, palate, finish,
            serving_temperature, serving_glassware, serving_decanting,
            confidence_score, confidence_pairing_science, confidence_wine_knowledge,
            confidence_complexity_handling, confidence_rationale,
            vintage_rationale,
            story, expert_rating, price_point, category, retailer_suggestion, image_url,
            full_response_json,
            avoid_types, avoid_reason,
            closing_narrative
          ) VALUES (
            ${data.request_id}, ${data.dish}, ${data.created_at}, ${data.user_id}, ${data.prompt_version},
            ${data.api_response_time_ms}, ${data.model_used},
            ${data.dominant_weight}, ${data.fat_content}, ${data.primary_protein}, 
            ${JSON.stringify(data.dominant_flavors)}::text[],
            ${data.spice_level}, ${data.acidity_level}, 
            ${JSON.stringify(data.applicable_principles)}::text[], 
            ${data.key_challenge},
            ${data.cooking_method}, ${data.cooking_method_impact}, ${data.sauce}, ${data.sauce_characteristic},
            ${data.sauce_priority}, ${data.max_abv},
            ${data.ideal_acidity}, ${data.ideal_acid_type}, ${data.ideal_tannin}, ${data.ideal_body},
            ${data.ideal_sweetness}, ${data.ideal_notes},
            ${data.tier_label}, ${data.tier_rationale}, ${data.tier_fallback_applied}, ${data.wine_name},
            ${data.producer}, ${data.region}, ${data.vintage}, ${data.grape},
            ${data.rationale}, ${JSON.stringify(data.pairing_principles_applied)}::text[],
            ${JSON.stringify(data.aromas)}::text[], ${data.palate}, ${data.finish},
            ${data.serving_temperature}, ${data.serving_glassware}, ${data.serving_decanting},
            ${data.confidence_score}, ${data.confidence_pairing_science}, ${data.confidence_wine_knowledge},
            ${data.confidence_complexity_handling}, ${data.confidence_rationale},
            ${data.vintage_rationale},
            ${data.story}, ${data.expert_rating}, ${data.price_point}, ${data.category},
            ${data.retailer_suggestion}, ${data.image_url},
            ${JSON.stringify(data.full_response_json)}::jsonb,
            ${JSON.stringify(data.avoid_types)}::text[], ${data.avoid_reason},
            ${data.closing_narrative}
          )
        `;
        insertedCount++;
      } catch (insertError) {
        logger.error('Failed to insert individual recommendation', {
          requestId,
          index: insertedCount,
          error: insertError.message,
          wineName: data.wine_name
        });
        // Continue with next record
      }
    }
    
    logger.info('Database inserts completed', {
      requestId,
      insertedCount,
      totalRecords: insertData.length,
      executionTime: Date.now() - startTime
    });
    
    return {
      success: true,
      insertedCount,
      requestId,
      executionTime: Date.now() - startTime
    };
    
  } catch (error) {
    logger.error('Error storing recommendations to database', {
      requestId,
      error: error.message,
      stack: error.stack,
      executionTime: Date.now() - startTime
    });
    
    return {
      success: false,
      error: error.message,
      insertedCount: 0,
      requestId,
      executionTime: Date.now() - startTime
    };
  }
}

/**
 * Health check for database connection
 * @returns {Promise<boolean>} True if database is accessible
 */
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return false;
  }
}

module.exports = {
  storeRecommendations,
  checkDatabaseHealth
};

