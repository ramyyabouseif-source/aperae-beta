/**
 * Enhance Combined Dataset with Missing Features
 * 
 * Adds:
 * - kaggleScore (from Kaggle dataset if available)
 * - vintageQuality (from vintageQualityData.json)
 * - producerReputation (from producerReputationIndex.json)
 * - wineAge (calculated from vintage)
 */

const fs = require('fs');
const path = require('path');

const COMBINED_PRICES_PATH = path.join(__dirname, 'combinedSampleWithPrices.json');
const VINTAGE_QUALITY_PATH = path.join(__dirname, 'vintageQualityData.json');
const PRODUCER_REPUTATION_PATH = path.join(__dirname, 'producerReputationIndex.json');
const KAGGLE_CSV_PATH = path.join(__dirname, '../../datasets/winemag-data-130k-v2.csv');
const ENHANCED_DATASET_PATH = path.join(__dirname, 'enhancedCombinedSample.json');

class DatasetEnhancer {
  constructor() {
    this.vintageQuality = {};
    this.producerReputation = {};
    this.kaggleScores = {};
  }

  /**
   * Load vintage quality data
   */
  loadVintageQuality() {
    if (fs.existsSync(VINTAGE_QUALITY_PATH)) {
      this.vintageQuality = JSON.parse(fs.readFileSync(VINTAGE_QUALITY_PATH, 'utf8'));
      console.log('✅ Loaded vintage quality data');
    } else {
      console.warn('⚠️  Vintage quality data not found');
    }
  }

  /**
   * Load producer reputation index
   */
  loadProducerReputation() {
    if (fs.existsSync(PRODUCER_REPUTATION_PATH)) {
      const data = JSON.parse(fs.readFileSync(PRODUCER_REPUTATION_PATH, 'utf8'));
      this.producerReputation = data.producers || {};
      console.log('✅ Loaded producer reputation index');
    } else {
      console.warn('⚠️  Producer reputation index not found');
    }
  }

  /**
   * Load Kaggle scores (if CSV available)
   */
  async loadKaggleScores() {
    if (!fs.existsSync(KAGGLE_CSV_PATH)) {
      console.warn('⚠️  Kaggle CSV not found, skipping critic scores');
      return;
    }

    try {
      const csv = require('csv-parser');
      const readStream = fs.createReadStream(KAGGLE_CSV_PATH);
      
      return new Promise((resolve, reject) => {
        readStream
          .pipe(csv())
          .on('data', (row) => {
            // Create key from title + producer
            const key = `${row.title || ''}_${row.winery || ''}`.toLowerCase();
            if (row.points) {
              this.kaggleScores[key] = parseInt(row.points);
            }
          })
          .on('end', () => {
            console.log(`✅ Loaded ${Object.keys(this.kaggleScores).length} Kaggle scores`);
            resolve();
          })
          .on('error', reject);
      });
    } catch (error) {
      console.warn('⚠️  Error loading Kaggle CSV:', error.message);
    }
  }

  /**
   * Get vintage quality score
   */
  getVintageQuality(vintage, region) {
    if (!vintage || !region) return null;

    // Try exact region match first
    if (this.vintageQuality[region] && this.vintageQuality[region][vintage]) {
      return this.vintageQuality[region][vintage];
    }

    // Try to match parent region (e.g., "Pauillac" -> "Bordeaux")
    const parentRegions = {
      'Pauillac': 'Bordeaux',
      'Saint-Émilion': 'Bordeaux',
      'Pomerol': 'Bordeaux',
      'Pessac-Léognan': 'Bordeaux',
      'Saint-Estèphe': 'Bordeaux',
      'Saint-Julien': 'Bordeaux',
      'Margaux': 'Bordeaux',
      'Vosne-Romanée': 'Burgundy',
      'Chianti Classico': 'Chianti',
      'Napa Valley': 'Napa Valley',
      'Oakville': 'Napa Valley',
      'Sonoma County': 'Sonoma County',
      'Russian River Valley': 'Sonoma County',
      'Marlborough': 'Marlborough',
      'South Australia': 'South Australia',
      'Central Valley': 'Central Valley',
      'Mendoza': 'Mendoza',
      'Champagne': 'Champagne',
      'Tuscany': 'Tuscany',
      'Bolgheri': 'Bolgheri',
      'Piedmont': 'Piedmont',
      'Rioja': 'Rioja',
      'Ribera del Duero': 'Ribera del Duero'
    };

    const parentRegion = parentRegions[region] || region;
    if (this.vintageQuality[parentRegion] && this.vintageQuality[parentRegion][vintage]) {
      return this.vintageQuality[parentRegion][vintage];
    }

    return null;
  }

  /**
   * Get producer reputation
   */
  getProducerReputation(producer) {
    if (!producer) return null;
    
    // Try exact match
    if (this.producerReputation[producer]) {
      return this.producerReputation[producer];
    }

    // Try case-insensitive match
    const producerLower = producer.toLowerCase();
    for (const [key, value] of Object.entries(this.producerReputation)) {
      if (key.toLowerCase() === producerLower) {
        return value;
      }
    }

    // Try partial match (e.g., "Caymus Vineyards" -> "Caymus Vineyards")
    for (const [key, value] of Object.entries(this.producerReputation)) {
      if (producer.includes(key) || key.includes(producer)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Get Kaggle score
   */
  getKaggleScore(title, producer) {
    if (!title || !producer) return null;

    const key = `${title}_${producer}`.toLowerCase();
    
    // Try exact match
    if (this.kaggleScores[key]) {
      return this.kaggleScores[key];
    }

    // Try partial matches
    for (const [k, score] of Object.entries(this.kaggleScores)) {
      if (k.includes(title.toLowerCase()) || k.includes(producer.toLowerCase())) {
        return score;
      }
    }

    return null;
  }

  /**
   * Calculate wine age
   */
  calculateWineAge(vintage) {
    if (!vintage || vintage === 'NV') return null;
    const year = parseInt(vintage);
    if (isNaN(year)) return null;
    return new Date().getFullYear() - year;
  }

  /**
   * Enhance dataset
   */
  async enhanceDataset() {
    console.log('📊 Enhancing dataset with new features...\n');

    // Load data sources
    this.loadVintageQuality();
    this.loadProducerReputation();
    await this.loadKaggleScores();

    // Load combined dataset
    if (!fs.existsSync(COMBINED_PRICES_PATH)) {
      console.error('❌ Combined dataset not found:', COMBINED_PRICES_PATH);
      process.exit(1);
    }

    const wines = JSON.parse(fs.readFileSync(COMBINED_PRICES_PATH, 'utf8'));
    console.log(`\n📦 Processing ${wines.length} wines...\n`);

    const enhanced = wines.map((wine, index) => {
      const enhanced = { ...wine };

      // Add vintage quality
      const vintageQuality = this.getVintageQuality(wine.vintage, wine.region);
      if (vintageQuality) {
        enhanced.vintageQuality = vintageQuality;
      }

      // Add producer reputation
      const producerReputation = this.getProducerReputation(wine.producer);
      if (producerReputation !== null) {
        enhanced.producerReputation = producerReputation;
      }

      // Add Kaggle score
      const kaggleScore = this.getKaggleScore(wine.title, wine.producer);
      if (kaggleScore) {
        enhanced.kaggleScore = kaggleScore;
      }

      // Add wine age
      const wineAge = this.calculateWineAge(wine.vintage);
      if (wineAge !== null) {
        enhanced.wineAge = wineAge;
      }

      // Progress indicator
      if ((index + 1) % 10 === 0) {
        process.stdout.write('.');
      }

      return enhanced;
    });

    console.log('\n\n✅ Enhancement complete!\n');

    // Statistics
    const stats = {
      total: enhanced.length,
      withVintageQuality: enhanced.filter(w => w.vintageQuality).length,
      withProducerReputation: enhanced.filter(w => w.producerReputation !== null && w.producerReputation !== undefined).length,
      withKaggleScore: enhanced.filter(w => w.kaggleScore).length,
      withWineAge: enhanced.filter(w => w.wineAge !== null && w.wineAge !== undefined).length
    };

    console.log('📊 Enhancement Statistics:');
    console.log(`   Total wines: ${stats.total}`);
    console.log(`   With vintage quality: ${stats.withVintageQuality} (${((stats.withVintageQuality / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   With producer reputation: ${stats.withProducerReputation} (${((stats.withProducerReputation / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   With Kaggle score: ${stats.withKaggleScore} (${((stats.withKaggleScore / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   With wine age: ${stats.withWineAge} (${((stats.withWineAge / stats.total) * 100).toFixed(1)}%)\n`);

    // Save enhanced dataset
    fs.writeFileSync(ENHANCED_DATASET_PATH, JSON.stringify(enhanced, null, 2));
    console.log(`✅ Enhanced dataset saved to: ${ENHANCED_DATASET_PATH}\n`);

    return enhanced;
  }
}

// Main execution
if (require.main === module) {
  const enhancer = new DatasetEnhancer();
  enhancer.enhanceDataset().catch(console.error);
}

module.exports = DatasetEnhancer;


