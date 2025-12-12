/**
 * Generate Expanded Wine Sample (50 wines)
 * 
 * Creates a new sample of 50 wines from Kaggle dataset for price research
 * Focuses on filling gaps: luxury wines, more regions, diverse producers
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const SAMPLE_SIZE = 50;
const EXPANDED_SAMPLE_PATH = path.join(__dirname, 'expandedSample50Wines.json');
const OUTPUT_TEXT_PATH = path.join(__dirname, 'expandedSample50Wines.txt');

class ExpandedSampleGenerator {
  constructor() {
    this.allWines = [];
    this.sampledWines = [];
  }

  /**
   * Parse wine title to extract vintage and wine name
   */
  parseWineTitle(title) {
    if (!title) return { wineName: 'Unknown', vintage: null };
    
    // Extract vintage (4-digit year)
    const vintageMatch = title.match(/\b(19|20)\d{2}\b/);
    const vintage = vintageMatch ? vintageMatch[0] : null;
    
    // Extract wine name (title without vintage)
    const wineName = vintage ? title.replace(/\b(19|20)\d{2}\b/, '').trim() : title.trim();
    
    return { wineName, vintage };
  }

  /**
   * Load wines from Kaggle CSV
   */
  async loadKaggleWines(kaggleCsvPath) {
    console.log('📊 Loading wines from Kaggle dataset...');
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(kaggleCsvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Only include wines with valid prices, points, winery, and title
          if (row.price && parseFloat(row.price) > 0 && 
              row.points && parseInt(row.points) > 0 &&
              row.winery && row.title && row.country) {
            const { wineName, vintage } = this.parseWineTitle(row.title);
            const price = parseFloat(row.price);
            
            this.allWines.push({
              title: row.title,
              wineName: wineName,
              producer: row.winery,
              vintage: vintage || null,
              region: row.region_1 || row.province || null,
              country: row.country,
              kagglePrice: price,
              kaggleScore: parseInt(row.points),
              priceYear: 2017, // Approximate year of Kaggle data
              variety: row.variety || null,
              description: row.description || null
            });
          }
        })
        .on('end', () => {
          console.log(`   Loaded ${this.allWines.length} wines with valid data`);
          resolve();
        })
        .on('error', reject);
    });
  }

  /**
   * Generate stratified sample
   */
  generateStratifiedSample() {
    console.log(`\n📊 Generating stratified sample of ${SAMPLE_SIZE} wines...`);
    
    // Define price ranges with target counts
    const priceRanges = [
      { min: 0, max: 20, label: 'Budget', target: 10 },
      { min: 20, max: 50, label: 'Moderate', target: 10 },
      { min: 50, max: 100, label: 'Premium', target: 10 },
      { min: 100, max: 500, label: 'Luxury', target: 15 },
      { min: 500, max: Infinity, label: 'Ultra-Luxury', target: 5 }
    ];

    const sampled = [];
    const usedWines = new Set(); // Track used wines to avoid duplicates

    // Sample from each price range
    for (const range of priceRanges) {
      const inRange = this.allWines.filter(w => 
        w.kagglePrice >= range.min && w.kagglePrice < range.max &&
        !usedWines.has(w.title)
      );
      
      // Sort by score (higher quality first) then randomize a bit
      inRange.sort((a, b) => {
        // Prioritize wines with vintages
        if (a.vintage && !b.vintage) return -1;
        if (!a.vintage && b.vintage) return 1;
        // Then by score
        return b.kaggleScore - a.kaggleScore;
      });

      // Select diverse wines (different countries, producers)
      const selected = [];
      const usedProducers = new Set();
      const usedCountries = new Set();
      
      for (const wine of inRange) {
        if (selected.length >= range.target) break;
        
        // Prefer diverse producers and countries
        const producerKey = `${wine.producer}-${wine.country}`;
        const isNewProducer = !usedProducers.has(producerKey);
        const isNewCountry = !usedCountries.has(wine.country);
        
        // Prioritize: new country > new producer > already seen
        if (selected.length < range.target * 0.7 || isNewCountry || isNewProducer) {
          selected.push(wine);
          usedWines.add(wine.title);
          usedProducers.add(producerKey);
          usedCountries.add(wine.country);
        }
      }

      // If we didn't get enough, fill with any remaining
      if (selected.length < range.target) {
        for (const wine of inRange) {
          if (selected.length >= range.target) break;
          if (!usedWines.has(wine.title)) {
            selected.push(wine);
            usedWines.add(wine.title);
          }
        }
      }

      sampled.push(...selected.slice(0, range.target));
      console.log(`   ${range.label}: Selected ${Math.min(selected.length, range.target)} wines`);
    }

    // Sort by price for easy review
    sampled.sort((a, b) => a.kagglePrice - b.kagglePrice);
    
    this.sampledWines = sampled.slice(0, SAMPLE_SIZE);
    console.log(`\n✅ Generated sample of ${this.sampledWines.length} wines`);
    
    return this.sampledWines;
  }

  /**
   * Save sample to JSON
   */
  saveSampleToJson() {
    fs.writeFileSync(
      EXPANDED_SAMPLE_PATH,
      JSON.stringify(this.sampledWines, null, 2)
    );
    console.log(`   Saved to: ${EXPANDED_SAMPLE_PATH}`);
  }

  /**
   * Generate copy/paste friendly text format
   */
  generateTextFormat() {
    let text = '='.repeat(80) + '\n';
    text += 'EXPANDED WINE SAMPLE FOR PRICE RESEARCH (50 WINES)\n';
    text += 'Generated: ' + new Date().toISOString().split('T')[0] + '\n';
    text += '='.repeat(80) + '\n\n';
    text += 'INSTRUCTIONS:\n';
    text += '1. Copy each wine entry below\n';
    text += '2. Search Wine-Searcher.com for current average retail price\n';
    text += '3. Note the price and vintage found (if different from Kaggle vintage)\n';
    text += '4. Provide results back in format: [Wine Number] $[Price] - [Vintage Found] - [Notes]\n\n';
    text += '='.repeat(80) + '\n\n';

    this.sampledWines.forEach((wine, index) => {
      const num = (index + 1).toString().padStart(2, '0');
      
      text += `WINE ${num}: ${wine.title}\n`;
      text += `Producer: ${wine.producer}\n`;
      text += `Vintage: ${wine.vintage || 'Non-Vintage (NV)'}\n`;
      text += `Region: ${wine.region || 'N/A'}\n`;
      text += `Country: ${wine.country}\n`;
      text += `Kaggle Price (2017): $${wine.kagglePrice.toFixed(2)}\n`;
      text += `Kaggle Score: ${wine.kaggleScore} points\n`;
      text += `Variety: ${wine.variety || 'N/A'}\n`;
      
      // Price range category
      let category = '';
      if (wine.kagglePrice < 20) category = 'Budget';
      else if (wine.kagglePrice < 50) category = 'Moderate';
      else if (wine.kagglePrice < 100) category = 'Premium';
      else if (wine.kagglePrice < 500) category = 'Luxury';
      else category = 'Ultra-Luxury';
      text += `Category: ${category}\n`;
      
      text += '\n';
      text += 'Search Query: What is the current average retail price in USD for ';
      text += `"${wine.producer} ${wine.wineName}"`;
      if (wine.vintage) {
        text += ` vintage ${wine.vintage}`;
      }
      text += '? Search site:wine-searcher.com for current 2024 price\n';
      text += '\n';
      text += '-'.repeat(80) + '\n\n';
    });

    text += '\n' + '='.repeat(80) + '\n';
    text += 'RESULTS TEMPLATE (copy and fill in):\n';
    text += '='.repeat(80) + '\n\n';
    
    this.sampledWines.forEach((wine, index) => {
      const num = (index + 1).toString().padStart(2, '0');
      text += `WINE ${num} - ${wine.title}: $___ - [vintage found: ___] - [notes: ___]\n`;
    });

    fs.writeFileSync(OUTPUT_TEXT_PATH, text);
    console.log(`   Saved text format to: ${OUTPUT_TEXT_PATH}`);
    
    return text;
  }

  /**
   * Print summary statistics
   */
  printSummary() {
    console.log('\n📊 Sample Summary:');
    
    const byRange = this.sampledWines.reduce((acc, w) => {
      let range = 'Budget';
      if (w.kagglePrice >= 500) range = 'Ultra-Luxury';
      else if (w.kagglePrice >= 100) range = 'Luxury';
      else if (w.kagglePrice >= 50) range = 'Premium';
      else if (w.kagglePrice >= 20) range = 'Moderate';
      
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   By Price Range:');
    Object.entries(byRange).forEach(([range, count]) => {
      console.log(`     ${range}: ${count} wines`);
    });

    const byCountry = this.sampledWines.reduce((acc, w) => {
      acc[w.country] = (acc[w.country] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   By Country:');
    Object.entries(byCountry)
      .sort((a, b) => b[1] - a[1])
      .forEach(([country, count]) => {
        console.log(`     ${country}: ${count} wines`);
      });

    const withVintage = this.sampledWines.filter(w => w.vintage).length;
    console.log(`   Wines with Vintage: ${withVintage}/${this.sampledWines.length}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const kaggleCsvPath = args[0] || path.join(__dirname, '..', 'datasets', 'winemag-data-130k-v2.csv');
  
  if (!fs.existsSync(kaggleCsvPath)) {
    console.error(`❌ Kaggle CSV not found: ${kaggleCsvPath}`);
    console.log('\nUsage: node generateExpandedSample.js [path-to-kaggle-csv]');
    console.log('   Or place CSV at: backend/services/wineData/datasets/winemag-data-130k-v2.csv');
    process.exit(1);
  }

  const generator = new ExpandedSampleGenerator();
  
  try {
    await generator.loadKaggleWines(kaggleCsvPath);
    generator.generateStratifiedSample();
    generator.saveSampleToJson();
    generator.generateTextFormat();
    generator.printSummary();
    
    console.log('\n✅ Expanded sample generated successfully!');
    console.log(`\n📄 Files created:`);
    console.log(`   - ${EXPANDED_SAMPLE_PATH} (JSON format)`);
    console.log(`   - ${OUTPUT_TEXT_PATH} (Copy/paste format)`);
    console.log('\n💡 Next step: Research prices on Wine-Searcher.com and provide results.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ExpandedSampleGenerator;


