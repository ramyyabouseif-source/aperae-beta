/**
 * Price Estimation Service
 * 
 * Uses calibrated formula to estimate current prices from historical Kaggle prices
 */

const fs = require('fs');
const path = require('path');

const FORMULA_PATH = path.join(__dirname, 'priceFormula.json');

class PriceEstimationService {
  constructor() {
    this.formula = null;
    this.loadFormula();
  }

  /**
   * Load price estimation formula
   */
  loadFormula() {
    if (fs.existsSync(FORMULA_PATH)) {
      try {
        const formulaData = JSON.parse(fs.readFileSync(FORMULA_PATH, 'utf8'));
        this.formula = formulaData.formulas.recommended;
        console.log(`✅ Loaded price estimation formula: ${this.formula.type}`);
      } catch (error) {
        console.warn('⚠️ Could not load price formula, using default');
        this.formula = {
          type: 'simple_multiplier',
          multiplier: 1.25  // Default 25% increase
        };
      }
    } else {
      console.warn('⚠️ Price formula not found, using default 25% increase');
      this.formula = {
        type: 'simple_multiplier',
        multiplier: 1.25
      };
    }
  }

  /**
   * Estimate current price from historical price
   */
  estimateCurrentPrice(historicalPrice, wineData = {}) {
    if (!historicalPrice || historicalPrice <= 0) {
      return null;
    }

    if (!this.formula) {
      // Fallback to simple inflation estimate
      const yearsSince = (new Date().getFullYear() - (wineData.priceYear || 2017));
      const inflationRate = 0.03; // 3% annual
      return Math.round(historicalPrice * Math.pow(1 + inflationRate, yearsSince));
    }

    switch (this.formula.type) {
      case 'simple_multiplier':
        return Math.round(historicalPrice * this.formula.multiplier);

      case 'price_range_based':
        return this.estimateWithPriceRange(historicalPrice, wineData);

      case 'regional_based':
        return this.estimateWithRegion(historicalPrice, wineData);

      case 'linear_regression':
        if (this.formula.formula) {
          return Math.round(this.formula.formula(historicalPrice));
        }
        // Fallback
        return Math.round(historicalPrice * this.formula.multiplier || 1.25);

      default:
        // Default fallback
        return Math.round(historicalPrice * 1.25);
    }
  }

  /**
   * Estimate using price-range based formula
   */
  estimateWithPriceRange(price, wineData) {
    const ranges = this.formula.ranges;

    // Determine which range this price falls into
    let multiplier = 1.25; // Default

    if (price < 20 && ranges.budget) {
      multiplier = ranges.budget.multiplier;
    } else if (price >= 20 && price < 50 && ranges.moderate) {
      multiplier = ranges.moderate.multiplier;
    } else if (price >= 50 && price < 100 && ranges.premium) {
      multiplier = ranges.premium.multiplier;
    } else if (price >= 100 && price < 500 && ranges.luxury) {
      multiplier = ranges.luxury.multiplier;
    } else if (price >= 500 && ranges.ultraLuxury) {
      multiplier = ranges.ultraLuxury.multiplier;
    }

    return Math.round(price * multiplier);
  }

  /**
   * Estimate using regional-based formula
   */
  estimateWithRegion(price, wineData) {
    const regions = this.formula.regions;
    const country = wineData.country || wineData.region || '';

    // Try to match region
    for (const [region, data] of Object.entries(regions)) {
      if (country.toLowerCase().includes(region.toLowerCase()) ||
          (wineData.region && wineData.region.toLowerCase().includes(region.toLowerCase()))) {
        return Math.round(price * data.multiplier);
      }
    }

    // Fallback to average
    const avgMultiplier = Object.values(regions).reduce(
      (sum, data) => sum + data.multiplier, 0
    ) / Object.keys(regions).length;

    return Math.round(price * avgMultiplier);
  }

  /**
   * Get estimation confidence level
   */
  getConfidence(wineData) {
    if (!this.formula || !this.formula.type) {
      return 60; // Low confidence without formula
    }

    let confidence = 80; // Base confidence

    // Higher confidence if we have range/regional data
    if (this.formula.type === 'price_range_based') {
      confidence = 85;
    } else if (this.formula.type === 'regional_based') {
      confidence = 85;
    } else if (this.formula.type === 'linear_regression' && this.formula.r2 > 0.5) {
      confidence = 90;
    }

    // Lower confidence if wine data is incomplete
    if (!wineData.country && !wineData.region) {
      confidence -= 10;
    }

    return Math.min(confidence, 95); // Cap at 95%
  }
}

module.exports = new PriceEstimationService();


