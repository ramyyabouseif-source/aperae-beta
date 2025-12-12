/**
 * Price Calibration System
 * 
 * Samples wines from Kaggle dataset, compares historical vs current prices,
 * and generates an accurate price estimation formula.
 * 
 * Usage:
 *   1. node calibratePrices.js sample    - Generate sample list
 *   2. Manually research current prices for sampled wines
 *   3. Add prices to priceCalibration/sampledWinesWithCurrentPrices.json
 *   4. node calibratePrices.js analyze   - Generate formula
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const SAMPLE_SIZE = 100;
const SAMPLED_WINES_PATH = path.join(__dirname, 'sampledWines.json');
const CURRENT_PRICES_PATH = path.join(__dirname, 'sampledWinesWithCurrentPrices.json');
const COMBINED_PRICES_PATH = path.join(__dirname, 'combinedSampleWithPrices.json');
const FORMULA_OUTPUT_PATH = path.join(__dirname, 'priceFormula.json');

class PriceCalibrator {
  constructor() {
    this.sampledWines = [];
    this.priceComparisons = [];
  }

  /**
   * Sample wines from Kaggle dataset
   * Uses stratified sampling: different price ranges, regions, vintages
   */
  async sampleWinesFromKaggle(kaggleCsvPath) {
    console.log('📊 Sampling wines from Kaggle dataset...');
    
    const allWines = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(kaggleCsvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Only include wines with valid prices
          if (row.price && parseFloat(row.price) > 0 && 
              row.points && row.winery && row.title) {
            const { wineName, vintage } = this.parseWineTitle(row.title);
            
            allWines.push({
              title: row.title,
              wineName: wineName,
              producer: row.winery,
              vintage: vintage || null,
              region: row.region_1 || row.province,
              country: row.country,
              kagglePrice: parseFloat(row.price),
              kaggleScore: parseInt(row.points),
              priceYear: 2017, // Approximate year of Kaggle data
              variety: row.variety,
              description: row.description
            });
          }
        })
        .on('end', () => {
          console.log(`   Found ${allWines.length} wines with prices`);
          
          // Stratified sampling by price ranges
          const priceRanges = [
            { min: 0, max: 20, label: 'Budget', target: 25 },
            { min: 20, max: 50, label: 'Moderate', target: 25 },
            { min: 50, max: 100, label: 'Premium', target: 25 },
            { min: 100, max: 500, label: 'Luxury', target: 15 },
            { min: 500, max: Infinity, label: 'Ultra-Luxury', target: 10 }
          ];

          const sampled = [];

          for (const range of priceRanges) {
            const inRange = allWines.filter(w => 
              w.kagglePrice >= range.min && w.kagglePrice < range.max
            );
            
            // Random sample from this range
            const sampleCount = Math.min(range.target, inRange.length);
            const shuffled = inRange.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, sampleCount);
            
            sampled.push(...selected);
            console.log(`   ${range.label} ($${range.min}-${range.max}): ${selected.length} wines`);
          }

          // Ensure we have wines from different regions
          const regions = ['United States', 'France', 'Italy', 'Spain', 'Australia', 'Chile'];
          const regionalWines = [];
          
          for (const region of regions) {
            const winesInRegion = sampled.filter(w => 
              w.country === region || w.region?.includes(region)
            );
            if (winesInRegion.length > 0) {
              regionalWines.push(...winesInRegion.slice(0, 5));
            }
          }

          // Combine and deduplicate
          const finalSample = [...sampled];
          for (const wine of regionalWines) {
            if (!finalSample.find(w => w.title === wine.title)) {
              finalSample.push(wine);
            }
          }

          // Ensure sample size
          const final = finalSample.slice(0, SAMPLE_SIZE);
          
          console.log(`\n✅ Sampled ${final.length} wines for price comparison`);
          console.log(`   Price range: $${Math.min(...final.map(w => w.kagglePrice)).toFixed(2)} - $${Math.max(...final.map(w => w.kagglePrice)).toFixed(2)}`);
          console.log(`   Countries: ${[...new Set(final.map(w => w.country))].join(', ')}`);
          
          this.sampledWines = final;
          
          // Save sample for manual research
          fs.writeFileSync(
            SAMPLED_WINES_PATH,
            JSON.stringify(final, null, 2)
          );
          
          console.log(`\n📝 Sample saved to: ${SAMPLED_WINES_PATH}`);
          console.log(`\n📋 Next steps:`);
          console.log(`   1. Research current prices for these wines`);
          console.log(`   2. Add current prices to: ${path.basename(CURRENT_PRICES_PATH)}`);
          console.log(`   3. Run: node calibratePrices.js analyze`);
          
          resolve(final);
        })
        .on('error', reject);
    });
  }

  /**
   * Parse wine title to extract name and vintage
   */
  parseWineTitle(title) {
    if (!title) return { wineName: null, vintage: null };

    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    const vintage = yearMatch ? yearMatch[0] : null;

    let wineName = title;
    if (vintage) {
      wineName = wineName.replace(new RegExp(`\\b${vintage}\\b`, 'g'), '').trim();
    }
    wineName = wineName.replace(/\s*\([^)]*\)\s*$/, '').trim();

    if (!wineName || wineName.length < 3) {
      wineName = title.replace(/\s*\([^)]*\)\s*$/, '').trim();
    }

    return { wineName, vintage };
  }

  /**
   * Analyze price comparisons and generate formula
   */
  analyzePriceComparisons() {
    console.log('📈 Analyzing price comparisons...');
    
    // Try combined file first, then fall back to current prices
    let comparisons;
    if (fs.existsSync(COMBINED_PRICES_PATH)) {
      console.log(`   Using combined dataset: ${COMBINED_PRICES_PATH}`);
      comparisons = JSON.parse(fs.readFileSync(COMBINED_PRICES_PATH, 'utf8'));
    } else if (fs.existsSync(CURRENT_PRICES_PATH)) {
      console.log(`   Using current prices: ${CURRENT_PRICES_PATH}`);
      comparisons = JSON.parse(fs.readFileSync(CURRENT_PRICES_PATH, 'utf8'));
    } else {
      console.error(`❌ No price data file found.`);
      console.log(`   Expected: ${COMBINED_PRICES_PATH} or ${CURRENT_PRICES_PATH}`);
      process.exit(1);
    }
    
    if (comparisons.length === 0) {
      console.error('❌ No price comparisons found. Please add current prices.');
      process.exit(1);
    }

    console.log(`   Analyzing ${comparisons.length} price comparisons...`);

    // Calculate price increases
    const increases = comparisons
      .filter(c => c.kagglePrice > 0 && c.currentPrice > 0)
      .map(c => ({
        ...c,
        increaseRatio: c.currentPrice / c.kagglePrice,
        increasePercent: ((c.currentPrice / c.kagglePrice - 1) * 100),
        yearsSince: (new Date().getFullYear() - (c.priceYear || 2017))
      }));

    if (increases.length === 0) {
      console.error('❌ No valid price comparisons found.');
      process.exit(1);
    }

    // Statistics
    const avgIncreaseRatio = increases.reduce((sum, c) => sum + c.increaseRatio, 0) / increases.length;
    const avgIncreasePercent = increases.reduce((sum, c) => sum + c.increasePercent, 0) / increases.length;
    const medianIncreaseRatio = this.median(increases.map(c => c.increaseRatio));
    
    // Price range analysis
    const byPriceRange = {
      budget: increases.filter(c => c.kagglePrice < 20),
      moderate: increases.filter(c => c.kagglePrice >= 20 && c.kagglePrice < 50),
      premium: increases.filter(c => c.kagglePrice >= 50 && c.kagglePrice < 100),
      luxury: increases.filter(c => c.kagglePrice >= 100 && c.kagglePrice < 500),
      ultraLuxury: increases.filter(c => c.kagglePrice >= 500)
    };

    // Regional analysis
    const byRegion = {};
    increases.forEach(c => {
      const region = c.country || 'Unknown';
      if (!byRegion[region]) byRegion[region] = [];
      byRegion[region].push(c);
    });

    // Vintage analysis (older vintages might appreciate more)
    const byVintage = {
      recent: increases.filter(c => c.vintage && parseInt(c.vintage) >= 2015),
      older: increases.filter(c => c.vintage && parseInt(c.vintage) < 2015)
    };

    // Generate formulas
    const formulas = this.generateFormulas(increases, byPriceRange, byRegion, byVintage);

    // Output results
    console.log('\n📊 Price Increase Analysis:');
    console.log(`   Average increase: ${avgIncreasePercent.toFixed(1)}%`);
    console.log(`   Median increase: ${(medianIncreaseRatio - 1) * 100}%`);
    console.log(`   Range: ${Math.min(...increases.map(c => c.increasePercent)).toFixed(1)}% - ${Math.max(...increases.map(c => c.increasePercent)).toFixed(1)}%`);

    console.log('\n📊 By Price Range:');
    for (const [range, wines] of Object.entries(byPriceRange)) {
      if (wines.length > 0) {
        const avg = wines.reduce((sum, c) => sum + c.increaseRatio, 0) / wines.length;
        console.log(`   ${range}: ${wines.length} wines, avg ${((avg - 1) * 100).toFixed(1)}% increase`);
      }
    }

    console.log('\n📊 By Region:');
    for (const [region, wines] of Object.entries(byRegion)) {
      if (wines.length > 0) {
        const avg = wines.reduce((sum, c) => sum + c.increaseRatio, 0) / wines.length;
        console.log(`   ${region}: ${wines.length} wines, avg ${((avg - 1) * 100).toFixed(1)}% increase`);
      }
    }

    // Save formula
    const formulaOutput = {
      generatedAt: new Date().toISOString(),
      sampleSize: increases.length,
      statistics: {
        averageIncreaseRatio: avgIncreaseRatio,
        averageIncreasePercent: avgIncreasePercent,
        medianIncreaseRatio: medianIncreaseRatio,
        minIncreaseRatio: Math.min(...increases.map(c => c.increaseRatio)),
        maxIncreaseRatio: Math.max(...increases.map(c => c.increaseRatio)),
        standardDeviation: this.standardDeviation(increases.map(c => c.increaseRatio))
      },
      formulas: formulas,
      recommendations: this.generateRecommendations(formulas, increases)
    };

    fs.writeFileSync(
      FORMULA_OUTPUT_PATH,
      JSON.stringify(formulaOutput, null, 2)
    );

    console.log(`\n✅ Formula saved to: ${FORMULA_OUTPUT_PATH}`);
    console.log(`\n📋 Recommended Formula: ${formulas.recommended.type}`);
    console.log(`   ${formulas.recommended.description}`);

    return formulaOutput;
  }

  /**
   * Generate multiple formula options
   */
  generateFormulas(increases, byPriceRange, byRegion, byVintage) {
    const avgRatio = increases.reduce((sum, c) => sum + c.increaseRatio, 0) / increases.length;
    const medianRatio = this.median(increases.map(c => c.increaseRatio));

    // Simple multiplier (average)
    const simpleMultiplier = {
      type: 'simple_multiplier',
      description: 'Apply average increase ratio to all wines',
      formula: `estimatedPrice = kagglePrice * ${avgRatio.toFixed(3)}`,
      multiplier: avgRatio
    };

    // Price-range based
    const rangeBased = {};
    for (const [range, wines] of Object.entries(byPriceRange)) {
      if (wines.length >= 3) {
        const avg = wines.reduce((sum, c) => sum + c.increaseRatio, 0) / wines.length;
        rangeBased[range] = {
          multiplier: avg,
          sampleSize: wines.length
        };
      }
    }

    // Regional adjustments
    const regionalMultipliers = {};
    for (const [region, wines] of Object.entries(byRegion)) {
      if (wines.length >= 5) {
        const avg = wines.reduce((sum, c) => sum + c.increaseRatio, 0) / wines.length;
        regionalMultipliers[region] = {
          multiplier: avg,
          sampleSize: wines.length
        };
      }
    }

    // Linear regression based on price (higher priced wines might appreciate differently)
    const regression = this.calculateLinearRegression(
      increases.map(c => c.kagglePrice),
      increases.map(c => c.increaseRatio)
    );

    // Recommended: Use price-range based if sufficient data, else simple multiplier
    const recommended = Object.keys(rangeBased).length >= 3 
      ? {
          type: 'price_range_based',
          description: 'Apply different multipliers based on price range',
          ranges: rangeBased
        }
      : simpleMultiplier;

    return {
      simpleMultiplier,
      priceRangeBased: Object.keys(rangeBased).length > 0 ? {
        type: 'price_range_based',
        ranges: rangeBased
      } : null,
      regionalBased: Object.keys(regionalMultipliers).length > 0 ? {
        type: 'regional_based',
        regions: regionalMultipliers
      } : null,
      linearRegression: regression.r2 > 0.1 ? regression : null,
      recommended
    };
  }

  /**
   * Calculate linear regression
   */
  calculateLinearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const ssRes = x.reduce((sum, xi, i) => {
      const predicted = slope * xi + intercept;
      return sum + Math.pow(y[i] - predicted, 2);
    }, 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    return {
      type: 'linear_regression',
      description: `estimatedPrice = kagglePrice * (${slope.toFixed(6)} * kagglePrice + ${intercept.toFixed(3)})`,
      slope,
      intercept,
      r2,
      formula: (price) => price * (slope * price + intercept)
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(formulas, increases) {
    const recommendations = [];

    if (formulas.recommended.type === 'price_range_based') {
      recommendations.push('Use price-range based formula for better accuracy across price tiers');
    } else {
      recommendations.push('Use simple multiplier formula (insufficient data for range-based)');
    }

    if (increases.length < 50) {
      recommendations.push('⚠️ Sample size is small. Consider researching more wines for better accuracy.');
    }

    if (formulas.linearRegression && formulas.linearRegression.r2 > 0.3) {
      recommendations.push('Linear regression shows correlation. Consider using for fine-tuning.');
    }

    return recommendations;
  }

  /**
   * Helper: Calculate median
   */
  median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Helper: Calculate standard deviation
   */
  standardDeviation(values) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }
}

// CLI
async function main() {
  const command = process.argv[2];
  const calibrator = new PriceCalibrator();

  if (command === 'sample') {
    const kagglePath = process.argv[3] || 
      path.join(__dirname, '../../datasets/winemag-data-130k-v2.csv');
    
    if (!fs.existsSync(kagglePath)) {
      console.error(`❌ Kaggle CSV not found: ${kagglePath}`);
      console.log(`   Usage: node calibratePrices.js sample [path-to-kaggle-csv]`);
      process.exit(1);
    }

    await calibrator.sampleWinesFromKaggle(kagglePath);
    
  } else if (command === 'analyze') {
    calibrator.analyzePriceComparisons();
    
  } else {
    console.log('Usage:');
    console.log('  node calibratePrices.js sample [kaggle-csv-path]  - Generate sample list');
    console.log('  node calibratePrices.js analyze                   - Analyze and generate formula');
  }
}

if (require.main === module) {
  main();
}

module.exports = PriceCalibrator;

