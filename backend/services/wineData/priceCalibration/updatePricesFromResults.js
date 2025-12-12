/**
 * Update Price Research Results
 * 
 * Helper script to update sampledWinesWithCurrentPrices.json with verified prices
 * 
 * Usage: 
 *   Paste your research results, then update the prices array below and run:
 *   node updatePricesFromResults.js
 */

const fs = require('fs');
const path = require('path');

const CURRENT_PRICES_PATH = path.join(__dirname, 'sampledWinesWithCurrentPrices.json');

// UPDATE THIS ARRAY WITH YOUR RESEARCH RESULTS
const verifiedPrices = [
  // Format: { title: "Exact title from file", currentPrice: 105, currentVintage: "2021", priceSource: "wine.com", notes: "..." }
  // Example:
  // { title: "Caymus Cabernet Sauvignon", currentPrice: 105, currentVintage: "2021", priceSource: "wine.com", notes: "Verified on wine.com" }
];

function updatePrices() {
  const existingData = JSON.parse(fs.readFileSync(CURRENT_PRICES_PATH, 'utf8'));
  
  console.log(`Updating prices for ${verifiedPrices.length} wines...`);
  
  // Match and update wines
  for (const verified of verifiedPrices) {
    const existing = existingData.find(w => 
      w.title === verified.title || 
      (w.producer && verified.title.includes(w.producer)) ||
      (w.wineName && verified.title.includes(w.wineName))
    );
    
    if (existing) {
      console.log(`✅ Updating: ${existing.title}`);
      console.log(`   Old: $${existing.currentPrice} (${existing.priceSource})`);
      
      existing.currentPrice = verified.currentPrice;
      existing.currentVintage = verified.currentVintage || existing.currentVintage;
      existing.priceSource = verified.priceSource;
      existing.researchDate = new Date().toISOString().split('T')[0];
      existing.notes = verified.notes || existing.notes;
      existing.verified = true; // Mark as verified
      
      console.log(`   New: $${existing.currentPrice} (${existing.priceSource})`);
    } else {
      console.warn(`⚠️  Could not find: ${verified.title}`);
    }
  }
  
  // Save updated data
  fs.writeFileSync(CURRENT_PRICES_PATH, JSON.stringify(existingData, null, 2));
  
  console.log(`\n✅ Updated ${verifiedPrices.length} wines`);
  console.log(`   File: ${CURRENT_PRICES_PATH}`);
  console.log(`\n📊 Next step: Run analysis to update formula`);
  console.log(`   npm run wine:calibrate-analyze`);
}

if (require.main === module) {
  if (verifiedPrices.length === 0) {
    console.log('⚠️  No verified prices provided.');
    console.log('   Please update the verifiedPrices array in this file with your research results.');
    console.log('   Then run: node updatePricesFromResults.js');
  } else {
    updatePrices();
  }
}

module.exports = { updatePrices };


