/**
 * Import Wine Data from Kaggle Dataset
 * 
 * Imports the Wine Reviews dataset from Kaggle (CC0 license)
 * URL: https://www.kaggle.com/datasets/zynicide/wine-reviews
 * 
 * Usage:
 *   1. Download CSV from Kaggle
 *   2. Place in backend/services/wineData/datasets/
 *   3. Run: node backend/services/wineData/importFromKaggle.js
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const WineDataImporter = require('./importSeedData');
const { PrismaClient } = require('@prisma/client');
const logger = require('../../logger');
const priceEstimationService = require('./priceCalibration/priceEstimationService');

const prisma = new PrismaClient();

class KaggleWineImporter {
  constructor() {
    this.stats = {
      parsed: 0,
      imported: 0,
      skipped: 0,
      errors: 0
    };
    this.importer = new WineDataImporter();
  }

  /**
   * Parse wine name and vintage from title
   * Example: "Emmolo 2013 Cabernet Sauvignon (Napa Valley)" → {name: "Cabernet Sauvignon", vintage: "2013"}
   */
  parseWineTitle(title) {
    if (!title) return { wineName: null, vintage: null };

    // Common patterns:
    // "Producer 2019 Wine Name (Region)"
    // "Producer Wine Name 2019"
    // "Producer Wine Name"
    
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    const vintage = yearMatch ? yearMatch[0] : null;

    // Remove vintage from title for wine name
    let wineName = title;
    if (vintage) {
      wineName = wineName.replace(new RegExp(`\\b${vintage}\\b`, 'g'), '').trim();
    }

    // Remove region in parentheses
    wineName = wineName.replace(/\s*\([^)]*\)\s*$/, '').trim();

    // Remove producer name (usually first word or two)
    // This is approximate - producer is better from 'winery' field
    wineName = wineName.replace(/^[\w\s]+?\s+(?=\d{4}|[A-Z])/, '').trim();

    // Fallback: if we can't parse, use title as-is (minus region)
    if (!wineName || wineName.length < 3) {
      wineName = title.replace(/\s*\([^)]*\)\s*$/, '').trim();
    }

    return { wineName, vintage };
  }

  /**
   * Infer wine type from grape variety
   */
  inferWineType(variety) {
    if (!variety) return null;

    const varietyLower = variety.toLowerCase();

    // Sparkling
    if (varietyLower.includes('champagne') || varietyLower.includes('sparkling')) {
      return 'Sparkling';
    }

    // Red grapes
    const redGrapes = ['cabernet', 'merlot', 'pinot noir', 'syrah', 'shiraz', 'sangiovese', 
                       'nebbiolo', 'tempranillo', 'zinfandel', 'malbec', 'grenache', 
                       'gamay', 'barbera', 'corvina', 'mourvedre'];
    if (redGrapes.some(grape => varietyLower.includes(grape))) {
      return 'Red';
    }

    // White grapes
    const whiteGrapes = ['chardonnay', 'sauvignon', 'riesling', 'pinot grigio', 
                         'pinot gris', 'gewurztraminer', 'viognier', 'semillon',
                         'chenin', 'muscat', 'albariño', 'verdejo'];
    if (whiteGrapes.some(grape => varietyLower.includes(grape))) {
      return 'White';
    }

    // Rosé
    if (varietyLower.includes('rosé') || varietyLower.includes('rose')) {
      return 'Rosé';
    }

    return null; // Unknown
  }

  /**
   * Convert Kaggle CSV row to our wine format
   */
  convertKaggleRow(row) {
    const { wineName, vintage } = this.parseWineTitle(row.title);
    
    // Skip if missing critical fields
    if (!wineName || !row.winery || !row.variety) {
      return null;
    }

    return {
      wineName: wineName,
      producer: row.winery || null,
      vintage: vintage || null,
      region: row.region_1 || row.province || null,
      country: row.country || null,
      wineType: this.inferWineType(row.variety),
      grapeVariety: row.variety ? [row.variety] : [],
      appellation: row.region_1 || null,
      
      // Historical price from Kaggle (2015-2017)
      historicalPrice: row.price ? parseFloat(row.price) : null,
      priceYear: 2017, // Approximate year of Kaggle data
      
      // Estimate current price using calibrated formula
      averagePrice: row.price ? priceEstimationService.estimateCurrentPrice(
        parseFloat(row.price),
        {
          country: row.country,
          region: row.region_1 || row.province,
          vintage: vintage,
          priceYear: 2017
        }
      ) : null,
      
      qualityScore: row.points ? parseInt(row.points) : null,
      criticScores: row.points ? {
        wineEnthusiast: parseInt(row.points)
      } : null,
      tastingNotes: row.description || null,
      
      // Metadata
      source: 'kaggle',
      sourceUrl: 'https://www.kaggle.com/datasets/zynicide/wine-reviews',
      sourceLicense: 'CC0',
      attribution: row.taster_name ? `Wine Enthusiast review by ${row.taster_name}` : null,
      priceEstimated: true,  // Flag that price is estimated
      priceSource: 'calibrated_formula',  // Source of price estimation
      dataQuality: row.price && row.points ? 
        priceEstimationService.getConfidence({
          country: row.country,
          region: row.region_1 || row.province
        }) : 75,  // Quality depends on formula confidence
      
      // Additional fields from Kaggle
      designation: row.designation || null,
      province: row.province || null,
      region1: row.region_1 || null,
      region2: row.region_2 || null,
      tasterName: row.taster_name || null
    };
  }

  /**
   * Import Kaggle CSV file
   */
  async importFromCSV(csvPath) {
    return new Promise((resolve, reject) => {
      const wines = [];
      let rowCount = 0;

      logger.info(`Starting Kaggle dataset import from: ${csvPath}`);

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          // Progress indicator
          if (rowCount % 10000 === 0) {
            logger.info(`Parsed ${rowCount} rows...`);
          }

          const wine = this.convertKaggleRow(row);
          if (wine) {
            wines.push(wine);
            this.stats.parsed++;
          } else {
            this.stats.skipped++;
          }
        })
        .on('end', async () => {
          logger.info(`Finished parsing CSV. Parsed ${this.stats.parsed} wines from ${rowCount} rows.`);
          logger.info(`Starting database import...`);

          // Import wines in batches to avoid memory issues
          const BATCH_SIZE = 100;
          for (let i = 0; i < wines.length; i += BATCH_SIZE) {
            const batch = wines.slice(i, i + BATCH_SIZE);
            
            for (const wine of batch) {
              try {
                await this.importer.importWine(wine);
                this.stats.imported++;
              } catch (error) {
                logger.error(`Error importing wine ${wine.wineName}:`, error.message);
                this.stats.errors++;
              }
            }

            // Progress update
            if ((i + BATCH_SIZE) % 1000 === 0 || i + BATCH_SIZE >= wines.length) {
              logger.info(`Imported ${Math.min(i + BATCH_SIZE, wines.length)} / ${wines.length} wines...`);
            }
          }

          logger.info('Kaggle import complete!', this.stats);
          resolve(this.stats);
        })
        .on('error', (error) => {
          logger.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  }
}

// Main execution
async function main() {
  const importer = new KaggleWineImporter();
  
  // Look for CSV file in datasets directory
  const datasetsDir = path.join(__dirname, 'datasets');
  const csvFiles = fs.readdirSync(datasetsDir).filter(f => f.endsWith('.csv'));
  
  if (csvFiles.length === 0) {
    console.error('❌ No CSV files found in datasets/ directory');
    console.log('📥 Please download the Kaggle dataset and place it in:');
    console.log(`   ${datasetsDir}`);
    console.log('');
    console.log('Dataset URL: https://www.kaggle.com/datasets/zynicide/wine-reviews');
    process.exit(1);
  }

  // Use first CSV file found
  const csvPath = path.join(datasetsDir, csvFiles[0]);
  console.log(`📦 Using dataset: ${csvFiles[0]}`);
  
  try {
    await importer.importFromCSV(csvPath);
    
    console.log('\n✅ Import complete!');
    console.log(`   Parsed: ${importer.stats.parsed}`);
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

module.exports = KaggleWineImporter;

