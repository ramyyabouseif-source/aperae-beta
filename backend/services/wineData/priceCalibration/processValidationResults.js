/**
 * Process Manual Validation Results
 * 
 * This script processes your completed validation spreadsheet
 * and updates the price formula with the validated data.
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const VALIDATION_SPREADSHEET_PATH = path.join(__dirname, 'validationSpreadsheet_COMPLETED.csv');
const OUTPUT_PATH = path.join(__dirname, 'manualValidationResults.json');
const ENHANCED_DATASET_PATH = path.join(__dirname, 'enhancedCombinedSample.json');

class ValidationProcessor {
  constructor() {
    this.results = [];
  }

  /**
   * Load completed validation spreadsheet
   */
  async loadValidationResults() {
    console.log('📊 Loading validation results...\n');

    if (!fs.existsSync(VALIDATION_SPREADSHEET_PATH)) {
      console.error(`❌ File not found: ${VALIDATION_SPREADSHEET_PATH}`);
      console.log('\n📝 Instructions:');
      console.log('1. Complete the validationSpreadsheet.csv');
      console.log('2. Save it as: validationSpreadsheet_COMPLETED.csv');
      console.log('3. Run this script again');
      process.exit(1);
    }

    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(VALIDATION_SPREADSHEET_PATH)
        .pipe(csv())
        .on('data', (row) => {
          // Parse current price
          const currentPrice = row['Current Price (YOU FILL)']?.trim();
          const source = row['Source (YOU FILL)']?.trim();
          const date = row['Date (YOU FILL)']?.trim();
          
          // Skip if not found or empty
          if (!currentPrice || currentPrice === '' || currentPrice.toLowerCase() === 'not found') {
            return;
          }

          // Extract numeric price
          const priceMatch = currentPrice.match(/[\d,]+\.?\d*/);
          if (!priceMatch) {
            return;
          }

          const price = parseFloat(priceMatch[0].replace(/,/g, ''));
          if (isNaN(price) || price <= 0) {
            return;
          }

          const kagglePrice = parseFloat(row['Kaggle Price (2017)']) || 0;
          if (kagglePrice <= 0) {
            return;
          }

          results.push({
            id: parseInt(row['ID']) || 0,
            wineName: row['Wine Name']?.trim(),
            producer: row['Producer']?.trim(),
            vintage: row['Vintage']?.trim(),
            region: row['Region']?.trim(),
            country: row['Country']?.trim(),
            kagglePrice: kagglePrice,
            currentPrice: price,
            priceRange: row['Price Range']?.trim(),
            source: source || 'Unknown',
            date: date || new Date().toISOString().split('T')[0],
            notes: row['Notes (OPTIONAL)']?.trim() || '',
            increaseRatio: price / kagglePrice,
            increasePercent: ((price / kagglePrice - 1) * 100)
          });
        })
        .on('end', () => {
          this.results = results;
          console.log(`✅ Loaded ${results.length} validated wines\n`);
          resolve(results);
        })
        .on('error', reject);
    });
  }

  /**
   * Generate statistics
   */
  generateStatistics() {
    if (this.results.length === 0) {
      console.error('❌ No results to analyze');
      return;
    }

    console.log('📊 Validation Statistics:\n');

    // Overall statistics
    const avgIncrease = this.results.reduce((sum, r) => sum + r.increasePercent, 0) / this.results.length;
    const avgRatio = this.results.reduce((sum, r) => sum + r.increaseRatio, 0) / this.results.length;
    const medianRatio = this.median(this.results.map(r => r.increaseRatio));

    console.log(`Total wines validated: ${this.results.length}`);
    console.log(`Average price increase: ${avgIncrease.toFixed(1)}%`);
    console.log(`Average increase ratio: ${avgRatio.toFixed(3)}x`);
    console.log(`Median increase ratio: ${medianRatio.toFixed(3)}x`);

    // By price range
    console.log('\n📊 By Price Range:');
    const priceRanges = {
      budget: this.results.filter(r => r.priceRange === 'budget'),
      moderate: this.results.filter(r => r.priceRange === 'moderate'),
      premium: this.results.filter(r => r.priceRange === 'premium'),
      luxury: this.results.filter(r => r.priceRange === 'luxury'),
      ultraLuxury: this.results.filter(r => r.priceRange === 'ultraLuxury')
    };

    for (const [range, wines] of Object.entries(priceRanges)) {
      if (wines.length > 0) {
        const avg = wines.reduce((sum, r) => sum + r.increaseRatio, 0) / wines.length;
        console.log(`  ${range}: ${wines.length} wines, avg ${((avg - 1) * 100).toFixed(1)}% increase (${avg.toFixed(3)}x)`);
      }
    }

    // By country
    console.log('\n📊 By Country:');
    const countries = {};
    this.results.forEach(r => {
      if (!countries[r.country]) countries[r.country] = [];
      countries[r.country].push(r);
    });

    for (const [country, wines] of Object.entries(countries)) {
      if (wines.length >= 3) {
        const avg = wines.reduce((sum, r) => sum + r.increaseRatio, 0) / wines.length;
        console.log(`  ${country}: ${wines.length} wines, avg ${((avg - 1) * 100).toFixed(1)}% increase (${avg.toFixed(3)}x)`);
      }
    }

    return {
      total: this.results.length,
      avgIncrease,
      avgRatio,
      medianRatio,
      byPriceRange: priceRanges,
      byCountry: countries
    };
  }

  /**
   * Calculate median
   */
  median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Update price formula
   */
  updatePriceFormula() {
    console.log('\n🔧 Updating price formula...\n');

    // Combine with existing validated data
    let existingData = [];
    if (fs.existsSync(ENHANCED_DATASET_PATH)) {
      existingData = JSON.parse(fs.readFileSync(ENHANCED_DATASET_PATH, 'utf8'))
        .filter(w => w.verified && w.currentPrice && w.kagglePrice);
    }

    // Merge results
    const allValidated = [...existingData, ...this.results.map(r => ({
      title: r.wineName,
      producer: r.producer,
      wineName: r.wineName,
      vintage: r.vintage,
      region: r.region,
      country: r.country,
      kagglePrice: r.kagglePrice,
      priceYear: 2017,
      currentPrice: r.currentPrice,
      currentVintage: r.vintage,
      priceSource: r.source,
      researchDate: r.date,
      verified: true,
      notes: r.notes || `Manually validated on ${r.date}`
    }))];

    // Save results
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({
      validatedAt: new Date().toISOString(),
      totalValidated: allValidated.length,
      newValidations: this.results.length,
      results: allValidated,
      statistics: this.generateStatistics()
    }, null, 2));

    console.log(`✅ Results saved to: ${OUTPUT_PATH}\n`);

    // Now run calibration
    console.log('📈 Running price calibration with validated data...\n');
    const { exec } = require('child_process');
    exec('node calibratePrices.js analyze', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error running calibration:', error);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
    });
  }

  /**
   * Run full processing
   */
  async run() {
    await this.loadValidationResults();
    this.generateStatistics();
    this.updatePriceFormula();
  }
}

// Main execution
if (require.main === module) {
  const processor = new ValidationProcessor();
  processor.run().catch(console.error);
}

module.exports = ValidationProcessor;


