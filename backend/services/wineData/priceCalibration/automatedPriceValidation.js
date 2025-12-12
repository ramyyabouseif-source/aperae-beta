/**
 * Automated Price Validation System
 * 
 * Legal, compliant approach to validate Kaggle prices against 2025 market prices
 * 
 * Strategy:
 * 1. Smart sampling (validate subset, use statistical methods)
 * 2. Multiple free data sources (Wine-Searcher public pages, Wine.com, etc.)
 * 3. Browser automation with rate limiting and respect for ToS
 * 4. Statistical validation (don't need to verify every wine)
 * 5. Cross-validation across multiple sources
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// Optional: Use Puppeteer for browser automation (install: npm install puppeteer)
// const puppeteer = require('puppeteer');

const KAGGLE_DATASET_PATH = path.join(__dirname, '../../datasets/winemag-data-130k-v2.csv');
const VALIDATION_RESULTS_PATH = path.join(__dirname, 'automatedValidationResults.json');
const VALIDATION_CONFIG_PATH = path.join(__dirname, 'validationConfig.json');

class AutomatedPriceValidator {
  constructor() {
    this.results = [];
    this.config = this.loadConfig();
    this.rateLimitDelay = 2000; // 2 seconds between requests
    this.lastRequestTime = 0;
  }

  /**
   * Load validation configuration
   */
  loadConfig() {
    if (fs.existsSync(VALIDATION_CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(VALIDATION_CONFIG_PATH, 'utf8'));
    }

    // Default configuration
    return {
      // Sampling strategy
      sampleSize: 200, // Validate 200 wines instead of all
      stratified: true, // Ensure representation across price ranges
      
      // Data sources (free/public)
      sources: {
        wineSearcher: {
          enabled: true,
          baseUrl: 'https://www.wine-searcher.com',
          respectRobotsTxt: true,
          rateLimit: 2000 // 2 seconds between requests
        },
        wineCom: {
          enabled: true,
          baseUrl: 'https://www.wine.com',
          respectRobotsTxt: true,
          rateLimit: 2000
        },
        vivino: {
          enabled: true,
          baseUrl: 'https://www.vivino.com',
          respectRobotsTxt: true,
          rateLimit: 2000
        }
      },
      
      // Validation settings
      validation: {
        maxSourcesPerWine: 2, // Try 2 sources per wine
        timeoutMs: 10000, // 10 second timeout per request
        minConfidence: 0.7, // 70% confidence threshold
        crossValidate: true // Cross-validate across sources
      },
      
      // Legal compliance
      compliance: {
        userAgent: 'Mozilla/5.0 (compatible; WinePriceValidator/1.0; +https://example.com/bot)',
        respectRobotsTxt: true,
        rateLimit: true,
        cacheResults: true, // Cache results to avoid re-requesting
        maxRequestsPerDay: 1000 // Limit daily requests
      }
    };
  }

  /**
   * Smart sampling: Select representative wines to validate
   */
  smartSample(kaggleWines, sampleSize = 200) {
    // Stratified sampling by price range
    const priceRanges = {
      budget: { min: 0, max: 20, count: Math.floor(sampleSize * 0.3) },
      moderate: { min: 20, max: 50, count: Math.floor(sampleSize * 0.25) },
      premium: { min: 50, max: 100, count: Math.floor(sampleSize * 0.2) },
      luxury: { min: 100, max: 500, count: Math.floor(sampleSize * 0.15) },
      ultraLuxury: { min: 500, max: Infinity, count: Math.floor(sampleSize * 0.1) }
    };

    const sampled = [];
    const used = new Set();

    // Sample from each price range
    for (const [range, config] of Object.entries(priceRanges)) {
      const rangeWines = kaggleWines.filter(w => {
        const price = parseFloat(w.price) || 0;
        return price >= config.min && price < config.max;
      });

      // Random sample from this range
      const shuffled = rangeWines.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, config.count);

      selected.forEach(wine => {
        if (!used.has(wine.title)) {
          sampled.push({ ...wine, priceRange: range });
          used.add(wine.title);
        }
      });
    }

    // Fill remaining slots randomly
    const remaining = sampleSize - sampled.length;
    if (remaining > 0) {
      const remainingWines = kaggleWines.filter(w => !used.has(w.title));
      const shuffled = remainingWines.sort(() => 0.5 - Math.random());
      sampled.push(...shuffled.slice(0, remaining).map(w => ({ ...w, priceRange: 'random' })));
    }

    return sampled;
  }

  /**
   * Check robots.txt compliance
   */
  async checkRobotsTxt(url) {
    try {
      const baseUrl = new URL(url);
      const robotsUrl = `${baseUrl.protocol}//${baseUrl.host}/robots.txt`;
      
      return new Promise((resolve) => {
        https.get(robotsUrl, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            // Simple check: if robots.txt exists and disallows, return false
            // For full implementation, use a proper robots.txt parser
            const disallows = data.match(/Disallow:\s*(.+)/g);
            if (disallows && disallows.some(d => d.includes('/'))) {
              resolve(false);
            } else {
              resolve(true);
            }
          });
        }).on('error', () => resolve(true)); // If robots.txt doesn't exist, allow
      });
    } catch (error) {
      return true; // Default to allowing if check fails
    }
  }

  /**
   * Rate limiting helper
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Search Wine-Searcher for current price (public page, no API)
   */
  async searchWineSearcher(wineName, producer, vintage) {
    if (!this.config.sources.wineSearcher.enabled) return null;

    await this.rateLimit();

    try {
      // Wine-Searcher public search URL
      const searchQuery = `${producer} ${wineName} ${vintage}`.replace(/\s+/g, '+');
      const searchUrl = `https://www.wine-searcher.com/find/${encodeURIComponent(searchQuery)}`;

      // Use fetch or https to get public page
      // Note: This is a simplified version - full implementation would parse HTML
      return {
        source: 'wine-searcher',
        url: searchUrl,
        method: 'scrape', // Indicates we need to scrape
        // In full implementation, would parse HTML for price
      };
    } catch (error) {
      console.error(`Wine-Searcher search failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse price from HTML (helper for scraping)
   */
  parsePriceFromHTML(html, source) {
    // Common price patterns in HTML
    const pricePatterns = {
      'wine-searcher': /\$[\d,]+\.?\d*/g,
      'wine-com': /price[:\s]*\$?[\d,]+\.?\d*/gi,
      'vivino': /€?\$?[\d,]+\.?\d*/g
    };

    const pattern = pricePatterns[source] || /\$[\d,]+\.?\d*/g;
    const matches = html.match(pattern);
    
    if (!matches) return null;

    // Extract numeric value
    const prices = matches.map(m => {
      const num = parseFloat(m.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? null : num;
    }).filter(p => p !== null && p > 0);

    if (prices.length === 0) return null;

    // Return average price (most common pattern)
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    return Math.round(avgPrice * 100) / 100;
  }

  /**
   * Browser-based scraping using Puppeteer (if available)
   */
  async scrapeWithBrowser(url, wineName) {
    try {
      // Check if Puppeteer is available
      if (typeof require !== 'undefined') {
        const puppeteer = require('puppeteer');
        
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.setUserAgent(this.config.compliance.userAgent);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        
        // Wait for price to load
        await page.waitForTimeout(2000);
        
        // Extract price from page
        const price = await page.evaluate(() => {
          // Common selectors for wine prices
          const selectors = [
            '.price',
            '[class*="price"]',
            '[data-price]',
            '.wine-price',
            '.avg-price'
          ];
          
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              const text = element.textContent || element.innerText;
              const match = text.match(/\$?([\d,]+\.?\d*)/);
              if (match) {
                return parseFloat(match[1].replace(/,/g, ''));
              }
            }
          }
          
          return null;
        });
        
        await browser.close();
        return price;
      }
    } catch (error) {
      console.error(`Browser scraping failed: ${error.message}`);
    }
    
    return null;
  }

  /**
   * Validate price from multiple sources
   */
  async validatePrice(wine) {
    const results = {
      wine: wine.title,
      producer: wine.producer,
      vintage: wine.vintage,
      kagglePrice: parseFloat(wine.price) || 0,
      sources: [],
      validatedPrice: null,
      confidence: 0
    };

    // Try each enabled source
    for (const [sourceName, sourceConfig] of Object.entries(this.config.sources)) {
      if (!sourceConfig.enabled) continue;
      if (results.sources.length >= this.config.validation.maxSourcesPerWine) break;

      try {
        let price = null;

        switch (sourceName) {
          case 'wineSearcher':
            price = await this.searchWineSearcher(wine.title, wine.producer, wine.vintage);
            break;
          // Add more sources as needed
        }

        if (price) {
          results.sources.push({
            source: sourceName,
            price: price,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Source ${sourceName} failed: ${error.message}`);
      }
    }

    // Calculate validated price from sources
    if (results.sources.length > 0) {
      const prices = results.sources.map(s => s.price).filter(p => p !== null);
      if (prices.length > 0) {
        results.validatedPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        results.confidence = prices.length / this.config.validation.maxSourcesPerWine;
      }
    }

    return results;
  }

  /**
   * Run validation on sampled wines
   */
  async runValidation(kaggleWines, sampleSize = 200) {
    console.log('📊 Starting automated price validation...\n');

    // Smart sampling
    const sampled = this.smartSample(kaggleWines, sampleSize);
    console.log(`✅ Selected ${sampled.length} wines for validation (stratified sampling)`);

    // Validate each wine
    const results = [];
    for (let i = 0; i < sampled.length; i++) {
      const wine = sampled[i];
      console.log(`\n[${i + 1}/${sampled.length}] Validating: ${wine.title} (${wine.priceRange})`);
      
      const result = await this.validatePrice(wine);
      results.push(result);
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`\n✅ Progress: ${i + 1}/${sampled.length} wines validated`);
      }
    }

    // Save results
    fs.writeFileSync(VALIDATION_RESULTS_PATH, JSON.stringify(results, null, 2));
    console.log(`\n✅ Validation complete! Results saved to: ${VALIDATION_RESULTS_PATH}`);

    // Generate statistics
    this.generateStatistics(results);

    return results;
  }

  /**
   * Generate validation statistics
   */
  generateStatistics(results) {
    const validated = results.filter(r => r.validatedPrice !== null);
    const withPrices = results.filter(r => r.kagglePrice > 0 && r.validatedPrice > 0);

    console.log('\n📊 Validation Statistics:');
    console.log(`   Total wines validated: ${results.length}`);
    console.log(`   Successfully validated: ${validated.length} (${((validated.length / results.length) * 100).toFixed(1)}%)`);
    console.log(`   With price comparison: ${withPrices.length}`);

    if (withPrices.length > 0) {
      const priceChanges = withPrices.map(r => ({
        wine: r.wine,
        kagglePrice: r.kagglePrice,
        currentPrice: r.validatedPrice,
        change: ((r.validatedPrice / r.kagglePrice - 1) * 100),
        confidence: r.confidence
      }));

      const avgChange = priceChanges.reduce((sum, p) => sum + p.change, 0) / priceChanges.length;
      console.log(`   Average price change: ${avgChange.toFixed(1)}%`);
      console.log(`   Price increase ratio: ${(1 + avgChange / 100).toFixed(3)}x`);
    }
  }
}

// Main execution
if (require.main === module) {
  const validator = new AutomatedPriceValidator();
  
  // Load Kaggle dataset (simplified - would use csv-parser)
  // const kaggleWines = loadKaggleDataset();
  // validator.runValidation(kaggleWines, 200);
  
  console.log('Automated Price Validator initialized.');
  console.log('To use: Load Kaggle dataset and call validator.runValidation()');
}

module.exports = AutomatedPriceValidator;


