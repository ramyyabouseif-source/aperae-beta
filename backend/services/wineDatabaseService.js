/**
 * Wine Database Service
 * 
 * Provides access to curated wine data from legal open/public sources only.
 * Sources: Kaggle datasets, UCI datasets, Wikipedia, manual curation
 * 
 * Legal Compliance:
 * - Only uses public domain or openly licensed data
 * - Respects attribution requirements
 * - No scraping of commercial sites without permission
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../logger');

// Initialize Prisma client lazily - only when DATABASE_URL is available
let prisma = null;
let prismaInitialized = false;

// Cache: once we detect wines table doesn't exist, skip all wine-related queries
// (avoids repeated prisma:error logs - 3 per request → 0 after first detection)
let winesTableUnavailable = false;
let winesTableProbeAttempted = false;

// Check if DATABASE_URL is configured
const isDatabaseAvailable = () => {
  if (!process.env.DATABASE_URL) {
    return false;
  }
  
  // Initialize Prisma client on first use if DATABASE_URL is available
  if (!prismaInitialized) {
    try {
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
      prismaInitialized = true;
      logger.debug('Prisma client initialized successfully');
    } catch (error) {
      logger.warn('Prisma client initialization failed:', error.message);
      logger.warn('Wine database features will be disabled.');
      logger.warn('To enable wine database features, set DATABASE_URL in your .env file.');
      prisma = null;
      prismaInitialized = true; // Mark as initialized to prevent retry loops
      return false;
    }
  }
  
  return prisma !== null;
};

class WineDatabaseService {
  /**
   * Search wines by name, producer, or region
   * @param {string} query - Search query
   * @param {object} filters - Additional filters (wineType, region, country, etc.)
   * @param {number} limit - Maximum results to return
   * @returns {Promise<Array>} Array of wine objects
   */
  async searchWines(query, filters = {}, limit = 50) {
    if (!isDatabaseAvailable()) {
      logger.debug('Wine database not available - returning empty results');
      return [];
    }

    try {
      const where = {
        OR: [
          { wineName: { contains: query, mode: 'insensitive' } },
          { producer: { contains: query, mode: 'insensitive' } },
          { region: { contains: query, mode: 'insensitive' } },
          { normalizedName: { contains: query.toLowerCase() } }
        ],
        ...filters
      };

      const wines = await prisma.wine.findMany({
        where,
        take: limit,
        orderBy: [
          { dataQuality: 'desc' },
          { reviewCount: 'desc' }
        ]
      });

      logger.debug(`Wine search: "${query}" returned ${wines.length} results`);
      return wines;
    } catch (error) {
      // Handle missing table gracefully - this is expected if wines table doesn't exist
      if (error.code === 'P2021' || (error.message && error.message.includes('does not exist'))) {
        logger.debug('Wines table not found - wine search disabled (this is expected if table not migrated)');
        return [];
      }
      
      if (error.message && error.message.includes('DATABASE_URL')) {
        logger.debug('DATABASE_URL not configured - wine database features disabled');
        return [];
      }
      logger.error('Error searching wines:', error);
      return [];
    }
  }

  /**
   * Validate if a wine exists in the database
   * @param {string} wineName - Name of the wine
   * @param {string} producer - Producer name (optional)
   * @param {string} vintage - Vintage year (optional)
   * @returns {Promise<object|null>} Wine object if found, null otherwise
   */
  async validateWineExists(wineName, producer, vintage) {
    // Gracefully handle missing database
    if (!isDatabaseAvailable()) {
      logger.debug('Wine database not available - skipping validation');
      return null;
    }
    // Skip if we've already detected wines table doesn't exist (avoids repeated Prisma error logs)
    if (winesTableUnavailable) {
      return null;
    }

    try {
      const where = {
        wineName: { equals: wineName, mode: 'insensitive' }
      };

      if (producer && producer !== 'Unknown Producer') {
        where.producer = { equals: producer, mode: 'insensitive' };
      }

      if (vintage && vintage !== 'NV' && vintage !== 'unknown') {
        where.vintage = vintage;
      }

      const wine = await prisma.wine.findFirst({
        where
      });

      return wine;
    } catch (error) {
      // Handle missing table gracefully - this is expected if wines table doesn't exist
      if (error.code === 'P2021' || (error.message && error.message.includes('does not exist'))) {
        winesTableUnavailable = true;
        logger.info('Wines table not found - wine enhancement disabled for this process (expected if table not migrated)');
        return null;
      }
      
      // Log error but don't crash the app
      if (error.message && error.message.includes('DATABASE_URL')) {
        logger.debug('DATABASE_URL not configured - wine database features disabled');
      } else {
        logger.error('Error validating wine:', error);
      }
      return null;
    }
  }

  /**
   * Get detailed wine information by ID
   * @param {string} wineId - Wine UUID
   * @returns {Promise<object|null>} Wine object with pairings
   */
  async getWineDetails(wineId) {
    if (!isDatabaseAvailable()) {
      logger.debug('Wine database not available - returning null');
      return null;
    }

    try {
      const wine = await prisma.wine.findUnique({
        where: { id: wineId },
        include: {
          pairings: {
            take: 10,
            orderBy: { confidence: 'desc' }
          }
        }
      });

      return wine;
    } catch (error) {
      // Handle missing table gracefully - this is expected if wines table doesn't exist
      if (error.code === 'P2021' || (error.message && error.message.includes('does not exist'))) {
        logger.debug('Wines table not found - wine details disabled (this is expected if table not migrated)');
        return null;
      }
      
      if (error.message && error.message.includes('DATABASE_URL')) {
        logger.debug('DATABASE_URL not configured - wine database features disabled');
        return null;
      }
      logger.error('Error getting wine details:', error);
      return null;
    }
  }

  /**
   * Find wines suitable for a specific dish
   * @param {string} dish - Dish name
   * @param {object} preferences - User preferences (optional)
   * @param {number} limit - Maximum results
   * @returns {Promise<Array>} Array of wines with pairing information
   */
  async findWinesForDish(dish, preferences = {}, limit = 20) {
    if (!isDatabaseAvailable()) {
      logger.debug('Wine database not available - returning empty results');
      return [];
    }

    try {
      // First, search for direct pairings
      const pairings = await prisma.winePairing.findMany({
        where: {
          dish: { contains: dish, mode: 'insensitive' }
        },
        include: {
          wine: true
        },
        orderBy: { confidence: 'desc' },
        take: limit
      });

      if (pairings.length > 0) {
        return pairings.map(p => ({
          ...p.wine,
          pairingConfidence: p.confidence,
          pairingRationale: p.rationale
        }));
      }

      // If no direct pairings, search by dish category
      const dishCategory = this.inferDishCategory(dish);
      if (dishCategory) {
        const categoryPairings = await prisma.winePairing.findMany({
          where: {
            dishCategory: dishCategory
          },
          include: {
            wine: true
          },
          orderBy: { confidence: 'desc' },
          take: limit
        });

        if (categoryPairings.length > 0) {
          return categoryPairings.map(p => ({
            ...p.wine,
            pairingConfidence: p.confidence,
            pairingRationale: p.rationale
          }));
        }
      }

      return [];
    } catch (error) {
      if (error.message && error.message.includes('DATABASE_URL')) {
        logger.debug('DATABASE_URL not configured - wine database features disabled');
        return [];
      }
      logger.error('Error finding wines for dish:', error);
      return [];
    }
  }

  /**
   * Infer dish category from dish name
   * @param {string} dish - Dish name
   * @returns {string|null} Category name or null
   */
  inferDishCategory(dish) {
    const dishLower = dish.toLowerCase();
    
    const categories = {
      'Meat': ['beef', 'steak', 'ribeye', 'burger', 'lamb', 'pork', 'veal', 'roast'],
      'Seafood': ['fish', 'salmon', 'tuna', 'seabass', 'seafood', 'shrimp', 'lobster', 'crab'],
      'Poultry': ['chicken', 'turkey', 'duck', 'poultry'],
      'Vegetarian': ['vegetable', 'salad', 'pasta', 'risotto', 'pizza'],
      'Dessert': ['dessert', 'cake', 'chocolate', 'pie', 'ice cream']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => dishLower.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  /**
   * Get wines by filters (for recommendation enhancement)
   * @param {object} filters - Filters (wineType, region, country, priceRange, etc.)
   * @param {number} limit - Maximum results
   * @returns {Promise<Array>} Array of wines
   */
  async getWinesByFilters(filters, limit = 50) {
    if (!isDatabaseAvailable()) {
      logger.debug('Wine database not available - returning empty results');
      return [];
    }

    try {
      const where = {};

      if (filters.wineType) {
        where.wineType = { equals: filters.wineType, mode: 'insensitive' };
      }

      if (filters.region) {
        where.region = { contains: filters.region, mode: 'insensitive' };
      }

      if (filters.country) {
        where.country = { equals: filters.country, mode: 'insensitive' };
      }

      if (filters.grapeVariety && filters.grapeVariety.length > 0) {
        where.grapeVariety = { hasSome: filters.grapeVariety };
      }

      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        if (min !== undefined || max !== undefined) {
          where.averagePrice = {};
          if (min !== undefined) where.averagePrice.gte = min;
          if (max !== undefined) where.averagePrice.lte = max;
        }
      }

      const wines = await prisma.wine.findMany({
        where,
        take: limit,
        orderBy: [
          { dataQuality: 'desc' },
          { reviewCount: 'desc' }
        ]
      });

      return wines;
    } catch (error) {
      // Handle missing table gracefully - this is expected if wines table doesn't exist
      if (error.code === 'P2021' || (error.message && error.message.includes('does not exist'))) {
        logger.debug('Wines table not found - wine filtering disabled (this is expected if table not migrated)');
        return [];
      }
      
      if (error.message && error.message.includes('DATABASE_URL')) {
        logger.debug('DATABASE_URL not configured - wine database features disabled');
        return [];
      }
      logger.error('Error getting wines by filters:', error);
      return [];
    }
  }

  /**
   * Format critic scores for display
   * @param {object} criticScores - JSON object with scores
   * @returns {string} Formatted score string or "unknown"
   */
  formatCriticScores(criticScores) {
    if (!criticScores || typeof criticScores !== 'object') {
      return 'unknown';
    }

    const scores = [];
    const publications = {
      wineSpectator: 'Wine Spectator',
      wineAdvocate: 'Wine Advocate',
      wineEnthusiast: 'Wine Enthusiast',
      decanter: 'Decanter',
      jamesSuckling: 'James Suckling'
    };

    for (const [key, publication] of Object.entries(publications)) {
      if (criticScores[key]) {
        // Standardized format: "[score] - [Publication Name]"
        scores.push(`${criticScores[key]} - ${publication}`);
      }
    }

    return scores.length > 0 ? scores.join(', ') : 'unknown';
  }

  /**
   * Normalize expert rating format to standardized "[score] - [Publication Name]"
   * Handles various formats: "95 points - Wine Spectator", "94/100 - Wine Advocate", etc.
   */
  normalizeExpertRating(rating) {
    if (!rating || rating === 'unknown' || rating.toLowerCase() === 'unknown') {
      return 'unknown';
    }

    // Already in correct format: "95 - Wine Spectator"
    if (/^\d+\s*-\s*[A-Za-z\s]+$/.test(rating.trim())) {
      return rating.trim();
    }

    // Pattern 1: "95 points - Wine Spectator" or "95 pts - Wine Spectator"
    let match = rating.match(/^(\d+)\s*(?:points?|pts?)\s*-\s*(.+)$/i);
    if (match) {
      return `${match[1].trim()} - ${match[2].trim()}`;
    }

    // Pattern 2: "94/100 - Wine Advocate"
    match = rating.match(/^(\d+)\s*\/\s*\d+\s*-\s*(.+)$/i);
    if (match) {
      return `${match[1].trim()} - ${match[2].trim()}`;
    }

    // Pattern 3: "Wine Spectator: 95" or "95 (Wine Spectator)"
    match = rating.match(/^(.+?):\s*(\d+)$/i);
    if (match) {
      return `${match[2].trim()} - ${match[1].trim()}`;
    }
    match = rating.match(/^(\d+)\s*\((.+?)\)$/i);
    if (match) {
      return `${match[1].trim()} - ${match[2].trim()}`;
    }

    // If no pattern matches, return as-is (might be already correct or need manual review)
    return rating.trim();
  }

  /**
   * Enhance AI recommendation with database data
   * @param {object} aiRecommendation - AI-generated recommendation
   * @returns {Promise<object>} Enhanced recommendation with verified data
   */
  async enhanceRecommendation(aiRecommendation) {
    try {
      // Validate wine exists
      const existingWine = await this.validateWineExists(
        aiRecommendation.wineName,
        aiRecommendation.producer,
        aiRecommendation.vintage
      );

      if (existingWine) {
        // Enhance with verified data
        const enhanced = {
          ...aiRecommendation,
          // Use database ratings if available, normalize format
          expertRating: existingWine.criticScores
            ? this.formatCriticScores(existingWine.criticScores)
            : this.normalizeExpertRating(aiRecommendation.expertRating),
          // Enhance tasting notes if available
          tastingNotes: existingWine.tastingNotes || aiRecommendation.tastingNotes,
          // Keep original confidence score - database verification adjustments disabled until database is more robust
          confidenceScore: aiRecommendation.confidenceScore || 75,
          // Mark as verified
          verified: true,
          wineId: existingWine.id
        };

        return enhanced;
      } else {
        // Wine not found - normalize rating, but keep original confidence score
        return {
          ...aiRecommendation,
          expertRating: this.normalizeExpertRating(aiRecommendation.expertRating),
          // Keep original confidence score - database verification adjustments disabled until database is more robust
          confidenceScore: aiRecommendation.confidenceScore || 75,
          verified: false
        };
      }
    } catch (error) {
      logger.error('Error enhancing recommendation:', error);
      // Return original with normalized rating if enhancement fails
      return {
        ...aiRecommendation,
        expertRating: this.normalizeExpertRating(aiRecommendation.expertRating),
        verified: false
      };
    }
  }

  /**
   * Infer wine category from wine name and characteristics
   */
  inferCategory(recommendation) {
    const wineName = (recommendation.wineName || '').toLowerCase();
    const producer = (recommendation.producer || '').toLowerCase();
    
    // Handle both string and object formats for tastingNotes
    let tastingNotes = '';
    if (typeof recommendation.tastingNotes === 'string') {
      tastingNotes = recommendation.tastingNotes.toLowerCase();
    } else if (recommendation.tastingNotes && typeof recommendation.tastingNotes === 'object') {
      // Extract text from object format (aromas, palate, finish)
      const parts = [];
      if (Array.isArray(recommendation.tastingNotes.aromas)) {
        parts.push(...recommendation.tastingNotes.aromas);
      }
      if (recommendation.tastingNotes.palate) {
        parts.push(recommendation.tastingNotes.palate);
      }
      if (recommendation.tastingNotes.finish) {
        parts.push(recommendation.tastingNotes.finish);
      }
      tastingNotes = parts.join(' ').toLowerCase();
    }
    
    // Sparkling wines
    if (wineName.includes('champagne') || wineName.includes('cristal') || 
        wineName.includes('brut') || wineName.includes('prosecco') ||
        wineName.includes('cava') || wineName.includes('sparkling')) {
      return 'Sparkling';
    }
    
    // Rosé wines
    if (wineName.includes('rosé') || wineName.includes('rose')) {
      return 'Rosé';
    }
    
    // White wines
    if (wineName.includes('chardonnay') || wineName.includes('sauvignon blanc') ||
        wineName.includes('riesling') || wineName.includes('pinot grigio') ||
        wineName.includes('pinot gris') || wineName.includes('gewürztraminer') ||
        wineName.includes('vermentino') || wineName.includes('soave') ||
        wineName.includes('albariño') || wineName.includes('albarino') ||
        wineName.includes('grüner veltliner') || wineName.includes('gruener veltliner') ||
        wineName.includes('viognier') || wineName.includes('verdejo') ||
        wineName.includes('sémillon') || wineName.includes('semillon') ||
        wineName.includes('chenin blanc') || wineName.includes('torrontés') ||
        wineName.includes('torrontes') || wineName.includes('blanc') || 
        tastingNotes.includes('white') ||
        producer.includes('beaucastel') && wineName.includes('blanc')) {
      return 'White Wine';
    }
    
    // Red wines
    if (wineName.includes('cabernet') || wineName.includes('pinot noir') ||
        wineName.includes('merlot') || wineName.includes('syrah') ||
        wineName.includes('shiraz') || wineName.includes('sangiovese') ||
        wineName.includes('barolo') || wineName.includes('barbaresco') ||
        wineName.includes('châteauneuf') || wineName.includes('bordeaux') ||
        wineName.includes('burgundy') || wineName.includes('brunello') ||
        wineName.includes('amarone') || tastingNotes.includes('red')) {
      return 'Red Wine';
    }
    
    return 'Unknown';
  }

  /**
   * Probe if wines table exists (one-time check per process)
   * @returns {Promise<boolean>} true if table exists, false if not
   */
  async _probeWinesTableExists() {
    if (winesTableProbeAttempted) {
      return !winesTableUnavailable;
    }
    winesTableProbeAttempted = true;
    if (!isDatabaseAvailable()) {
      winesTableUnavailable = true;
      return false;
    }
    try {
      await prisma.wine.findFirst({ where: { wineName: '__table_probe__' } });
      return true;
    } catch (error) {
      if (error.code === 'P2021' || (error.message && error.message.includes('does not exist'))) {
        winesTableUnavailable = true;
        logger.info('Wines table not found - skipping enhancement (expected if table not migrated)');
        return false;
      }
      logger.warn('Wines table probe failed, skipping enhancement:', error.message);
      winesTableUnavailable = true;
      return false;
    }
  }

  /**
   * Batch enhance recommendations
   * @param {Array} recommendations - Array of AI recommendations
   * @returns {Promise<Array>} Array of enhanced recommendations
   */
  async enhanceRecommendations(recommendations) {
    try {
      const tableExists = await this._probeWinesTableExists();
      if (!tableExists) {
        return recommendations.map(rec => ({
          ...rec,
          expertRating: this.normalizeExpertRating(rec.expertRating),
          category: rec.category || this.inferCategory(rec),
          verified: false
        }));
      }
      const enhanced = await Promise.all(
        recommendations.map(rec => this.enhanceRecommendation(rec))
      );
      return enhanced;
    } catch (error) {
      logger.error('Error enhancing recommendations:', error);
      return recommendations; // Return original if enhancement fails
    }
  }
}

module.exports = new WineDatabaseService();


