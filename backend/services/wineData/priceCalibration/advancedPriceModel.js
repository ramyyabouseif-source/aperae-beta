/**
 * Advanced Price Estimation Model
 * 
 * Multi-factor regression model to improve accuracy to ~95%
 * 
 * Factors considered:
 * - Base price (historical Kaggle price)
 * - Price range category
 * - Region/Country
 * - Critic scores (points)
 * - Vintage quality (if available)
 * - Wine type/variety
 * - Producer reputation (if available)
 */

const fs = require('fs');
const path = require('path');

const COMBINED_PRICES_PATH = path.join(__dirname, 'combinedSampleWithPrices.json');
const ENHANCED_PRICES_PATH = path.join(__dirname, 'enhancedCombinedSample.json');
const VINTAGE_QUALITY_PATH = path.join(__dirname, 'vintageQualityData.json');
const PRODUCER_REPUTATION_PATH = path.join(__dirname, 'producerReputationIndex.json');
const ADVANCED_MODEL_PATH = path.join(__dirname, 'advancedPriceModel.json');

class AdvancedPriceModel {
  constructor() {
    this.data = [];
    this.model = null;
    this.featureImportance = {};
  }

  /**
   * Load and prepare data
   */
  loadData() {
    // Try enhanced dataset first, fall back to combined
    const dataPath = fs.existsSync(ENHANCED_PRICES_PATH) 
      ? ENHANCED_PRICES_PATH 
      : COMBINED_PRICES_PATH;
    
    if (fs.existsSync(ENHANCED_PRICES_PATH)) {
      console.log('✅ Using enhanced dataset with vintage quality and producer reputation');
    } else {
      console.log('⚠️  Using basic dataset (enhanced features not available)');
    }
    
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    this.data = rawData
      .filter(w => w.kagglePrice > 0 && w.currentPrice > 0 && w.verified !== false)
      .map(wine => ({
        // Target variable
        actualRatio: wine.currentPrice / wine.kagglePrice,
        actualIncrease: ((wine.currentPrice / wine.kagglePrice - 1) * 100),
        
        // Features
        kagglePrice: wine.kagglePrice,
        priceRange: this.getPriceRange(wine.kagglePrice),
        country: wine.country || 'Unknown',
        region: wine.region || 'Unknown',
        kaggleScore: wine.kaggleScore || null,
        vintage: wine.vintage ? parseInt(wine.vintage) : null,
        vintageQuality: wine.vintageQuality || null,
        producerReputation: wine.producerReputation !== null && wine.producerReputation !== undefined ? wine.producerReputation : null,
        wineAge: wine.wineAge !== null && wine.wineAge !== undefined ? wine.wineAge : null,
        wineType: this.inferWineType(wine),
        variety: wine.variety || null,
        
        // Original data for reference
        title: wine.title,
        producer: wine.producer,
        wineName: wine.wineName
      }));
    
    console.log(`📊 Loaded ${this.data.length} wines for advanced modeling`);
  }

  /**
   * Get price range category
   */
  getPriceRange(price) {
    if (price < 20) return 'budget';
    if (price < 50) return 'moderate';
    if (price < 100) return 'premium';
    if (price < 500) return 'luxury';
    return 'ultraLuxury';
  }

  /**
   * Infer wine type from variety or name
   */
  inferWineType(wine) {
    const variety = (wine.variety || '').toLowerCase();
    const name = (wine.wineName || wine.title || '').toLowerCase();
    const text = `${variety} ${name}`;
    
    if (text.includes('chardonnay') || text.includes('sauvignon blanc') || 
        text.includes('riesling') || text.includes('pinot grigio') || 
        text.includes('moscato') || text.includes('sancerre')) {
      return 'white';
    }
    if (text.includes('cabernet') || text.includes('merlot') || 
        text.includes('pinot noir') || text.includes('syrah') || 
        text.includes('shiraz') || text.includes('malbec') || 
        text.includes('zinfandel') || text.includes('sangiovese')) {
      return 'red';
    }
    if (text.includes('rosé') || text.includes('rose')) {
      return 'rose';
    }
    if (text.includes('champagne') || text.includes('sparkling') || 
        text.includes('cava') || text.includes('prosecco')) {
      return 'sparkling';
    }
    return 'unknown';
  }

  /**
   * Analyze feature importance
   */
  analyzeFeatureImportance() {
    console.log('\n📊 Analyzing feature importance...');
    
    const features = {
      priceRange: {},
      country: {},
      kaggleScore: { high: [], low: [] },
      vintage: { recent: [], older: [] },
      wineType: {}
    };

    // Price range analysis
    ['budget', 'moderate', 'premium', 'luxury', 'ultraLuxury'].forEach(range => {
      const wines = this.data.filter(w => w.priceRange === range);
      if (wines.length > 0) {
        const avgRatio = wines.reduce((sum, w) => sum + w.actualRatio, 0) / wines.length;
        const variance = this.variance(wines.map(w => w.actualRatio));
        features.priceRange[range] = {
          avgRatio,
          variance,
          sampleSize: wines.length,
          stdDev: Math.sqrt(variance)
        };
      }
    });

    // Country analysis
    const countries = [...new Set(this.data.map(w => w.country))];
    countries.forEach(country => {
      const wines = this.data.filter(w => w.country === country);
      if (wines.length >= 3) {
        const avgRatio = wines.reduce((sum, w) => sum + w.actualRatio, 0) / wines.length;
        const variance = this.variance(wines.map(w => w.actualRatio));
        features.country[country] = {
          avgRatio,
          variance,
          sampleSize: wines.length,
          stdDev: Math.sqrt(variance)
        };
      }
    });

    // Critic score analysis
    const winesWithScores = this.data.filter(w => w.kaggleScore);
    if (winesWithScores.length > 0) {
      const highScore = winesWithScores.filter(w => w.kaggleScore >= 90);
      const lowScore = winesWithScores.filter(w => w.kaggleScore < 90);
      
      if (highScore.length > 0) {
        features.kaggleScore.high = {
          avgRatio: highScore.reduce((sum, w) => sum + w.actualRatio, 0) / highScore.length,
          sampleSize: highScore.length
        };
      }
      if (lowScore.length > 0) {
        features.kaggleScore.low = {
          avgRatio: lowScore.reduce((sum, w) => sum + w.actualRatio, 0) / lowScore.length,
          sampleSize: lowScore.length
        };
      }
    }

    // Vintage analysis
    const winesWithVintage = this.data.filter(w => w.vintage);
    if (winesWithVintage.length > 0) {
      const recent = winesWithVintage.filter(w => w.vintage >= 2015);
      const older = winesWithVintage.filter(w => w.vintage < 2015);
      
      if (recent.length > 0) {
        features.vintage.recent = {
          avgRatio: recent.reduce((sum, w) => sum + w.actualRatio, 0) / recent.length,
          sampleSize: recent.length
        };
      }
      if (older.length > 0) {
        features.vintage.older = {
          avgRatio: older.reduce((sum, w) => sum + w.actualRatio, 0) / older.length,
          sampleSize: older.length
        };
      }
    }

    // Wine type analysis
    const wineTypes = [...new Set(this.data.map(w => w.wineType))];
    wineTypes.forEach(type => {
      const wines = this.data.filter(w => w.wineType === type);
      if (wines.length >= 3) {
        const avgRatio = wines.reduce((sum, w) => sum + w.actualRatio, 0) / wines.length;
        features.wineType[type] = {
          avgRatio,
          sampleSize: wines.length
        };
      }
    });

    this.featureImportance = features;
    return features;
  }

  /**
   * Calculate variance
   */
  variance(values) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  /**
   * Build multi-factor regression model
   */
  buildModel() {
    console.log('\n🔧 Building multi-factor regression model...');
    
    // Calculate base multipliers by price range
    const baseMultipliers = {};
    ['budget', 'moderate', 'premium', 'luxury', 'ultraLuxury'].forEach(range => {
      const wines = this.data.filter(w => w.priceRange === range);
      if (wines.length > 0) {
        baseMultipliers[range] = wines.reduce((sum, w) => sum + w.actualRatio, 0) / wines.length;
      }
    });

    // Calculate country adjustments
    const countryAdjustments = {};
    const countries = [...new Set(this.data.map(w => w.country))];
    countries.forEach(country => {
      const wines = this.data.filter(w => w.country === country);
      if (wines.length >= 5) {
        const countryAvg = wines.reduce((sum, w) => sum + w.actualRatio, 0) / wines.length;
        const globalAvg = this.data.reduce((sum, w) => sum + w.actualRatio, 0) / this.data.length;
        countryAdjustments[country] = countryAvg / globalAvg; // Relative adjustment
      }
    });

    // Calculate score-based adjustments
    const winesWithScores = this.data.filter(w => w.kaggleScore);
    let scoreAdjustment = null;
    if (winesWithScores.length > 10) {
      // Linear regression: score impact on price ratio
      const scores = winesWithScores.map(w => w.kaggleScore);
      const ratios = winesWithScores.map(w => w.actualRatio);
      const scoreRegression = this.linearRegression(scores, ratios);
      scoreAdjustment = {
        slope: scoreRegression.slope,
        intercept: scoreRegression.intercept,
        r2: scoreRegression.r2
      };
    }

    // Calculate vintage-based adjustments
    const winesWithVintage = this.data.filter(w => w.vintage);
    let vintageAdjustment = null;
    if (winesWithVintage.length > 10) {
      const vintages = winesWithVintage.map(w => w.vintage);
      const ratios = winesWithVintage.map(w => w.actualRatio);
      const vintageRegression = this.linearRegression(vintages, ratios);
      vintageAdjustment = {
        slope: vintageRegression.slope,
        intercept: vintageRegression.intercept,
        r2: vintageRegression.r2
      };
    }

    // Calculate vintage quality adjustments (NEW)
    const winesWithVintageQuality = this.data.filter(w => w.vintageQuality);
    let vintageQualityAdjustment = null;
    if (winesWithVintageQuality.length > 10) {
      const qualities = winesWithVintageQuality.map(w => w.vintageQuality);
      const ratios = winesWithVintageQuality.map(w => w.actualRatio);
      const qualityRegression = this.linearRegression(qualities, ratios);
      vintageQualityAdjustment = {
        slope: qualityRegression.slope,
        intercept: qualityRegression.intercept,
        r2: qualityRegression.r2
      };
      console.log(`   Vintage quality adjustment: R²=${qualityRegression.r2.toFixed(3)}, samples=${winesWithVintageQuality.length}`);
    }

    // Calculate producer reputation adjustments (NEW)
    const winesWithReputation = this.data.filter(w => w.producerReputation !== null);
    let producerReputationAdjustment = null;
    if (winesWithReputation.length > 10) {
      const reputations = winesWithReputation.map(w => w.producerReputation);
      const ratios = winesWithReputation.map(w => w.actualRatio);
      const reputationRegression = this.linearRegression(reputations, ratios);
      producerReputationAdjustment = {
        slope: reputationRegression.slope,
        intercept: reputationRegression.intercept,
        r2: reputationRegression.r2
      };
      console.log(`   Producer reputation adjustment: R²=${reputationRegression.r2.toFixed(3)}, samples=${winesWithReputation.length}`);
    }

    // Calculate wine age adjustments (NEW)
    const winesWithAge = this.data.filter(w => w.wineAge !== null);
    let wineAgeAdjustment = null;
    if (winesWithAge.length > 10) {
      const ages = winesWithAge.map(w => w.wineAge);
      const ratios = winesWithAge.map(w => w.actualRatio);
      const ageRegression = this.linearRegression(ages, ratios);
      wineAgeAdjustment = {
        slope: ageRegression.slope,
        intercept: ageRegression.intercept,
        r2: ageRegression.r2
      };
      console.log(`   Wine age adjustment: R²=${ageRegression.r2.toFixed(3)}, samples=${winesWithAge.length}`);
    }

    // Build model
    this.model = {
      baseMultipliers,
      countryAdjustments,
      scoreAdjustment,
      vintageAdjustment,
      vintageQualityAdjustment,
      producerReputationAdjustment,
      wineAgeAdjustment,
      globalAverage: this.data.reduce((sum, w) => sum + w.actualRatio, 0) / this.data.length
    };

    return this.model;
  }

  /**
   * Simple linear regression
   */
  linearRegression(x, y) {
    const n = x.length;
    const xMean = x.reduce((sum, v) => sum + v, 0) / n;
    const yMean = y.reduce((sum, v) => sum + v, 0) / n;

    let numerator = 0;
    let denominator = 0;
    let ssRes = 0;
    let ssTot = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += Math.pow(x[i] - xMean, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Calculate R²
    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i] + intercept;
      ssRes += Math.pow(y[i] - predicted, 2);
      ssTot += Math.pow(y[i] - yMean, 2);
    }
    const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

    return { slope, intercept, r2 };
  }

  /**
   * Test model accuracy
   */
  testModel() {
    console.log('\n📊 Testing model accuracy...');
    
    const predictions = this.data.map(wine => {
      const predicted = this.predictPrice(wine);
      return {
        wine: wine.title,
        actualRatio: wine.actualRatio,
        predictedRatio: predicted,
        error: Math.abs(predicted - wine.actualRatio),
        errorPercent: (Math.abs(predicted - wine.actualRatio) / wine.actualRatio) * 100
      };
    });

    // Calculate accuracy metrics
    const meanError = predictions.reduce((sum, p) => sum + p.error, 0) / predictions.length;
    const meanErrorPercent = predictions.reduce((sum, p) => sum + p.errorPercent, 0) / predictions.length;
    const rmse = Math.sqrt(predictions.reduce((sum, p) => sum + Math.pow(p.error, 2), 0) / predictions.length);
    
    // Calculate accuracy within 5%, 10%, 20%
    const within5 = predictions.filter(p => p.errorPercent <= 5).length;
    const within10 = predictions.filter(p => p.errorPercent <= 10).length;
    const within20 = predictions.filter(p => p.errorPercent <= 20).length;
    const within30 = predictions.filter(p => p.errorPercent <= 30).length;

    const accuracy = {
      meanError,
      meanErrorPercent,
      rmse,
      within5Percent: (within5 / predictions.length) * 100,
      within10Percent: (within10 / predictions.length) * 100,
      within20Percent: (within20 / predictions.length) * 100,
      within30Percent: (within30 / predictions.length) * 100
    };

    console.log(`\n📈 Model Accuracy:`);
    console.log(`   Mean Error: ${meanErrorPercent.toFixed(2)}%`);
    console.log(`   RMSE: ${rmse.toFixed(4)}`);
    console.log(`   Within 5%: ${accuracy.within5Percent.toFixed(1)}%`);
    console.log(`   Within 10%: ${accuracy.within10Percent.toFixed(1)}%`);
    console.log(`   Within 20%: ${accuracy.within20Percent.toFixed(1)}%`);
    console.log(`   Within 30%: ${accuracy.within30Percent.toFixed(1)}%`);

    return { predictions, accuracy };
  }

  /**
   * Predict price ratio using multi-factor model
   */
  predictPrice(wine) {
    if (!this.model) return null;

    // Start with base multiplier for price range
    let ratio = this.model.baseMultipliers[wine.priceRange] || this.model.globalAverage;

    // Apply country adjustment
    if (this.model.countryAdjustments[wine.country]) {
      const globalAvg = this.model.globalAverage;
      ratio = (ratio / globalAvg) * (this.model.countryAdjustments[wine.country] * globalAvg);
    }

    // Apply score adjustment
    if (wine.kaggleScore && this.model.scoreAdjustment) {
      const scoreAdjustment = this.model.scoreAdjustment.slope * wine.kaggleScore + 
                             this.model.scoreAdjustment.intercept;
      // Weight adjustment based on R²
      const scoreWeight = Math.min(this.model.scoreAdjustment.r2, 0.3); // Cap at 0.3
      ratio = ratio * (1 - scoreWeight) + scoreAdjustment * scoreWeight;
    }

    // Apply vintage adjustment (year-based)
    if (wine.vintage && this.model.vintageAdjustment) {
      const vintageAdjustment = this.model.vintageAdjustment.slope * wine.vintage + 
                               this.model.vintageAdjustment.intercept;
      const vintageWeight = Math.min(this.model.vintageAdjustment.r2, 0.2); // Cap at 0.2
      ratio = ratio * (1 - vintageWeight) + vintageAdjustment * vintageWeight;
    }

    // Apply vintage quality adjustment (NEW - more important than vintage year)
    if (wine.vintageQuality && this.model.vintageQualityAdjustment) {
      const qualityAdjustment = this.model.vintageQualityAdjustment.slope * wine.vintageQuality + 
                               this.model.vintageQualityAdjustment.intercept;
      const qualityWeight = Math.min(this.model.vintageQualityAdjustment.r2, 0.4); // Cap at 0.4
      ratio = ratio * (1 - qualityWeight) + qualityAdjustment * qualityWeight;
    }

    // Apply producer reputation adjustment (NEW)
    if (wine.producerReputation !== null && this.model.producerReputationAdjustment) {
      const reputationAdjustment = this.model.producerReputationAdjustment.slope * wine.producerReputation + 
                                  this.model.producerReputationAdjustment.intercept;
      const reputationWeight = Math.min(this.model.producerReputationAdjustment.r2, 0.3); // Cap at 0.3
      ratio = ratio * (1 - reputationWeight) + reputationAdjustment * reputationWeight;
    }

    // Apply wine age adjustment (NEW)
    if (wine.wineAge !== null && this.model.wineAgeAdjustment) {
      const ageAdjustment = this.model.wineAgeAdjustment.slope * wine.wineAge + 
                           this.model.wineAgeAdjustment.intercept;
      const ageWeight = Math.min(this.model.wineAgeAdjustment.r2, 0.2); // Cap at 0.2
      ratio = ratio * (1 - ageWeight) + ageAdjustment * ageWeight;
    }

    return ratio;
  }

  /**
   * Generate recommendations for improvement
   */
  generateRecommendations() {
    const recommendations = [];

    // Analyze current accuracy
    const test = this.testModel();
    const currentAccuracy = test.accuracy.within10Percent;

    recommendations.push(`Current model accuracy: ${currentAccuracy.toFixed(1)}% within 10%`);

    // Feature importance analysis
    if (this.featureImportance.kaggleScore.high && this.featureImportance.kaggleScore.low) {
      const scoreDiff = this.featureImportance.kaggleScore.high.avgRatio - 
                       this.featureImportance.kaggleScore.low.avgRatio;
      if (Math.abs(scoreDiff) > 0.1) {
        recommendations.push(`✅ Critic scores show significant impact (${(scoreDiff * 100).toFixed(1)}% difference)`);
      }
    }

    // Country analysis
    const countryVariance = Object.values(this.featureImportance.country)
      .map(c => c.variance)
      .reduce((sum, v) => sum + v, 0) / Object.keys(this.featureImportance.country).length;
    
    if (countryVariance > 0.1) {
      recommendations.push(`✅ Regional factors matter (variance: ${countryVariance.toFixed(3)})`);
    }

    // Recommendations for 95% accuracy
    recommendations.push('\n🎯 To achieve ~95% accuracy:');
    recommendations.push('1. **Add more data**: 100-200 wines minimum (currently 70)');
    recommendations.push('2. **Include critic scores**: Already in model, but need more data');
    recommendations.push('3. **Vintage quality scores**: Add vintage ratings (e.g., 2015 Bordeaux = 98/100)');
    recommendations.push('4. **Producer reputation index**: Score producers 1-10 based on reputation');
    recommendations.push('5. **Market conditions**: Factor in market trends (bull/bear wine market)');
    recommendations.push('6. **Wine age factor**: Older wines may appreciate differently');
    recommendations.push('7. **Use machine learning**: Random Forest or Gradient Boosting could improve accuracy');
    recommendations.push('8. **Outlier detection**: Identify and handle outliers separately');
    recommendations.push('9. **Category-specific models**: Build separate models for Bordeaux, Burgundy, Napa, etc.');
    recommendations.push('10. **Ensemble approach**: Combine multiple models for better accuracy');

    return recommendations;
  }

  /**
   * Save model
   */
  saveModel() {
    const output = {
      generatedAt: new Date().toISOString(),
      sampleSize: this.data.length,
      model: this.model,
      featureImportance: this.featureImportance,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(ADVANCED_MODEL_PATH, JSON.stringify(output, null, 2));
    console.log(`\n✅ Advanced model saved to: ${ADVANCED_MODEL_PATH}`);
  }

  /**
   * Run full analysis
   */
  run() {
    this.loadData();
    this.analyzeFeatureImportance();
    this.buildModel();
    const test = this.testModel();
    this.saveModel();
    
    return {
      model: this.model,
      accuracy: test.accuracy,
      recommendations: this.generateRecommendations()
    };
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new AdvancedPriceModel();
  analyzer.run();
}

module.exports = AdvancedPriceModel;

