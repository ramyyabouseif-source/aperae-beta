/**
 * Import Seed Data Script
 * 
 * Imports curated wine data from JSON files into the database.
 * This script handles initial database population with legal, public domain data.
 * 
 * Usage: node backend/services/wineData/importSeedData.js
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();
const logger = require('../../logger');

class WineDataImporter {
  constructor() {
    this.stats = {
      imported: 0,
      skipped: 0,
      errors: 0
    };
  }

  /**
   * Normalize wine name for search
   */
  normalizeName(name) {
    return name.toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  /**
   * Import wines from seed data file
   */
  async importFromFile(filePath) {
    try {
      logger.info(`Reading seed data from: ${filePath}`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (!Array.isArray(data)) {
        throw new Error('Seed data must be an array of wine objects');
      }

      logger.info(`Found ${data.length} wines to import`);

      for (const wineData of data) {
        try {
          await this.importWine(wineData);
        } catch (error) {
          logger.error(`Error importing wine ${wineData.wineName}:`, error.message);
          this.stats.errors++;
        }
      }

      logger.info('Import complete:', this.stats);
    } catch (error) {
      logger.error('Error importing seed data:', error);
      throw error;
    }
  }

  /**
   * Import a single wine
   */
  async importWine(wineData) {
    // Validate required fields
    if (!wineData.wineName) {
      throw new Error('Wine name is required');
    }

    // Normalize name for search
    const normalizedName = this.normalizeName(wineData.wineName);

    // Check if wine already exists
    const existing = await prisma.wine.findFirst({
      where: {
        wineName: { equals: wineData.wineName, mode: 'insensitive' },
        producer: wineData.producer ? { equals: wineData.producer, mode: 'insensitive' } : undefined,
        vintage: wineData.vintage || undefined
      }
    });

    if (existing) {
      logger.debug(`Wine already exists: ${wineData.wineName} ${wineData.vintage || ''}`);
      this.stats.skipped++;
      return existing;
    }

    // Prepare data
    const wineToCreate = {
      wineName: wineData.wineName,
      producer: wineData.producer || null,
      vintage: wineData.vintage || null,
      region: wineData.region || null,
      country: wineData.country || null,
      wineType: wineData.wineType || null,
      grapeVariety: Array.isArray(wineData.grapeVariety) ? wineData.grapeVariety : [],
      appellation: wineData.appellation || null,
      averagePrice: wineData.averagePrice || null,
      priceRange: wineData.priceRange ? wineData.priceRange : null,
      criticScores: wineData.criticScores ? wineData.criticScores : null,
      communityRating: wineData.communityRating || null,
      reviewCount: wineData.reviewCount || 0,
      tastingNotes: wineData.tastingNotes || null,
      aromas: Array.isArray(wineData.aromas) ? wineData.aromas : [],
      palate: wineData.palate || null,
      finish: wineData.finish || null,
      body: wineData.body || null,
      acidity: wineData.acidity || null,
      tannins: wineData.tannins || null,
      sweetness: wineData.sweetness || null,
      foodPairings: Array.isArray(wineData.foodPairings) ? wineData.foodPairings : [],
      qualityScore: wineData.qualityScore || null,
      alcoholContent: wineData.alcoholContent || null,
      source: wineData.source || 'manual',
      sourceUrl: wineData.sourceUrl || null,
      sourceLicense: wineData.sourceLicense || 'Public Domain',
      attribution: wineData.attribution || null,
      dataQuality: wineData.dataQuality || 50,
      normalizedName: normalizedName
    };

    // Create wine
    const wine = await prisma.wine.create({
      data: wineToCreate
    });

    logger.info(`Imported: ${wine.wineName} ${wine.vintage || ''} (${wine.producer || 'Unknown'})`);
    this.stats.imported++;

    // Create food pairings if provided
    if (wineData.foodPairings && wineData.foodPairings.length > 0) {
      for (const dish of wineData.foodPairings) {
        try {
          await prisma.winePairing.create({
            data: {
              wineId: wine.id,
              dish: dish,
              dishCategory: this.inferDishCategory(dish),
              pairingType: 'classic',
              confidence: 85,
              rationale: `Classic pairing for ${dish}`,
              source: 'curated'
            }
          });
        } catch (error) {
          logger.debug(`Could not create pairing for ${dish}:`, error.message);
        }
      }
    }

    return wine;
  }

  /**
   * Infer dish category
   */
  inferDishCategory(dish) {
    const dishLower = dish.toLowerCase();
    
    if (dishLower.includes('beef') || dishLower.includes('steak') || dishLower.includes('lamb') || dishLower.includes('pork')) {
      return 'Meat';
    }
    if (dishLower.includes('fish') || dishLower.includes('salmon') || dishLower.includes('seafood') || dishLower.includes('oyster')) {
      return 'Seafood';
    }
    if (dishLower.includes('chicken') || dishLower.includes('turkey') || dishLower.includes('duck')) {
      return 'Poultry';
    }
    if (dishLower.includes('vegetable') || dishLower.includes('salad') || dishLower.includes('pasta')) {
      return 'Vegetarian';
    }
    if (dishLower.includes('dessert') || dishLower.includes('cake') || dishLower.includes('chocolate')) {
      return 'Dessert';
    }
    
    return null;
  }
}

// Main execution
async function main() {
  const importer = new WineDataImporter();
  
  try {
    // Import all seed data files
    const seedDataFiles = [
      'popular-wines.json',
      'additional-wines.json'
    ];
    
    for (const filename of seedDataFiles) {
      const seedDataPath = path.join(__dirname, 'seedData', filename);
      try {
        if (fs.existsSync(seedDataPath)) {
          console.log(`\n📦 Importing ${filename}...`);
          await importer.importFromFile(seedDataPath);
        } else {
          console.log(`⚠️  File not found: ${filename} (skipping)`);
        }
      } catch (error) {
        console.error(`❌ Error importing ${filename}:`, error.message);
        // Continue with other files
      }
    }
    
    console.log('\n✅ Import complete!');
    console.log(`   Imported: ${importer.stats.imported}`);
    console.log(`   Skipped: ${importer.stats.skipped}`);
    console.log(`   Errors: ${importer.stats.errors}`);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = WineDataImporter;

