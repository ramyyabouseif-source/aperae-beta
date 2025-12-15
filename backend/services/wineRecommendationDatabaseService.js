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
    
    // Insert records using Prisma (handles arrays and JSONB automatically)
    // Use createMany for better performance, but we'll do individual creates to handle errors gracefully
    let insertedCount = 0;
    
    for (const data of insertData) {
      try {
        await prisma.wineRecommendation.create({
          data: {
            request_id: data.request_id,
            dish: data.dish,
            created_at: data.created_at,
            user_id: data.user_id,
            prompt_version: data.prompt_version,
            api_response_time_ms: data.api_response_time_ms,
            model_used: data.model_used,
            
            // Dish Analysis
            dominant_weight: data.dominant_weight,
            fat_content: data.fat_content,
            primary_protein: data.primary_protein,
            dominant_flavors: data.dominant_flavors, // Prisma handles arrays automatically
            spice_level: data.spice_level,
            acidity_level: data.acidity_level,
            applicable_principles: data.applicable_principles, // Prisma handles arrays automatically
            key_challenge: data.key_challenge,
            
            // Extracted/Inferred Fields
            cooking_method: data.cooking_method,
            cooking_method_impact: data.cooking_method_impact,
            sauce: data.sauce,
            sauce_characteristic: data.sauce_characteristic,
            sauce_priority: data.sauce_priority,
            max_abv: data.max_abv,
            
            // Ideal Profile
            ideal_acidity: data.ideal_acidity,
            ideal_acid_type: data.ideal_acid_type,
            ideal_tannin: data.ideal_tannin,
            ideal_body: data.ideal_body,
            ideal_sweetness: data.ideal_sweetness,
            ideal_notes: data.ideal_notes,
            
            // Wine Recommendation Data
            tier_label: data.tier_label,
            tier_rationale: data.tier_rationale,
            tier_fallback_applied: data.tier_fallback_applied,
            wine_name: data.wine_name,
            producer: data.producer,
            region: data.region,
            vintage: data.vintage,
            grape: data.grape,
            
            // Pairing Rationale
            rationale: data.rationale,
            pairing_principles_applied: data.pairing_principles_applied, // Prisma handles arrays automatically
            
            // Tasting Notes
            aromas: data.aromas, // Prisma handles arrays automatically
            palate: data.palate,
            finish: data.finish,
            
            // Serving Guidance
            serving_temperature: data.serving_temperature,
            serving_glassware: data.serving_glassware,
            serving_decanting: data.serving_decanting,
            
            // Confidence Scoring
            confidence_score: data.confidence_score,
            confidence_pairing_science: data.confidence_pairing_science,
            confidence_wine_knowledge: data.confidence_wine_knowledge,
            confidence_complexity_handling: data.confidence_complexity_handling,
            confidence_rationale: data.confidence_rationale,
            
            // Additional Fields
            vintage_rationale: data.vintage_rationale,
            story: data.story,
            expert_rating: data.expert_rating,
            price_point: data.price_point,
            category: data.category,
            retailer_suggestion: data.retailer_suggestion,
            image_url: data.image_url,
            
            // Full Response Data (Prisma handles JSONB automatically)
            full_response_json: data.full_response_json,
            
            // Avoid Data
            avoid_types: data.avoid_types, // Prisma handles arrays automatically
            avoid_reason: data.avoid_reason,
            
            // Closing Narrative
            closing_narrative: data.closing_narrative
          }
        });
        insertedCount++;
      } catch (insertError) {
        logger.error('Failed to insert individual recommendation', {
          requestId,
          index: insertedCount,
          error: insertError.message,
          stack: insertError.stack,
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

