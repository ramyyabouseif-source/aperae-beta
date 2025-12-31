/**
 * Menu Wine Database Service
 * 
 * Handles database operations for storing parsed menu wines from OCR.
 * Stores wines BEFORE AI recommendations are generated.
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] 
    : ['error'],
});

/**
 * Stores parsed menu wines to the database
 * @param {Array} parsedWines - Array of parsed wine objects from OCR
 * @param {string} requestId - Request ID for tracking (should match WineRecommendation request_id)
 * @param {string} dish - Dish name (optional, for menu context)
 * @param {number} ocrConfidence - Overall OCR confidence score
 * @returns {Promise<object>} Result with success status and inserted count
 */
async function storeParsedMenuWines(parsedWines, requestId, dish = null, ocrConfidence = null) {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!parsedWines || !Array.isArray(parsedWines)) {
      throw new Error('Invalid input: parsedWines must be an array');
    }
    
    if (!requestId) {
      throw new Error('Request ID is required');
    }
    
    if (parsedWines.length === 0) {
      logger.debug('No parsed wines to store', { requestId, dish });
      return {
        success: true,
        insertedCount: 0,
        requestId,
        executionTime: Date.now() - startTime
      };
    }
    
    logger.debug('Storing parsed menu wines to database', {
      requestId,
      dish,
      wineCount: parsedWines.length,
      ocrConfidence
    });
    
    // Prepare data for bulk insert
    const insertData = parsedWines.map((wine) => {
      return {
        request_id: requestId,
        dish: dish || null,
        created_at: new Date(),
        
        // Parsed Wine Data
        wine_name: wine.wineName || 'Unknown Wine',
        producer: wine.producer || null,
        vintage: wine.vintage || null,
        grape: wine.grape || null,
        region: wine.region || null,
        price: wine.price || null, // Price as string from OCR
        
        // Additional Metadata
        category: wine.category || null,
        serving_style: wine.servingStyle || null,
        description: wine.description || null,
        ocr_confidence: ocrConfidence || null,
        
        // Full OCR line for debugging
        raw_ocr_line: wine.rawOcrLine || null
      };
    });
    
    // Insert records using Prisma
    let insertedCount = 0;
    
    for (const data of insertData) {
      try {
        await prisma.menuWine.create({
          data: {
            request_id: data.request_id,
            dish: data.dish,
            created_at: data.created_at,
            wine_name: data.wine_name,
            producer: data.producer,
            vintage: data.vintage,
            grape: data.grape,
            region: data.region,
            price: data.price,
            category: data.category,
            serving_style: data.serving_style,
            description: data.description,
            ocr_confidence: data.ocr_confidence,
            raw_ocr_line: data.raw_ocr_line
          }
        });
        insertedCount++;
      } catch (insertError) {
        logger.error('Failed to insert individual menu wine', {
          requestId,
          index: insertedCount,
          error: insertError.message,
          stack: insertError.stack,
          wineName: data.wine_name
        });
        // Continue with next record
      }
    }
    
    logger.info('Menu wine inserts completed', {
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
    logger.error('Error storing parsed menu wines to database', {
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
    logger.error('Menu wine database health check failed', { error: error.message });
    return false;
  }
}

module.exports = {
  storeParsedMenuWines,
  checkDatabaseHealth
};


