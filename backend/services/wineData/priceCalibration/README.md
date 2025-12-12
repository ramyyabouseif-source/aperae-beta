# Price Calibration System

This system creates an accurate price estimation formula by:
1. Sampling wines from Kaggle dataset
2. Comparing historical (Kaggle) vs current retail prices
3. Generating a calibrated formula based on actual data
4. Applying the formula to estimate prices for all wines

## Quick Start

### Step 1: Generate Sample List

```bash
cd backend/services/wineData/priceCalibration
node calibratePrices.js sample ../../datasets/winemag-data-130k-v2.csv
```

This creates `sampledWines.json` with ~100 wines to research.

### Step 2: Research Current Prices

**Legal Sources for Current Prices:**
- ✅ Wine.com (public prices, can note manually)
- ✅ Total Wine (public prices)
- ✅ Local wine shops (public prices)
- ✅ Wine-searcher.com (aggregator, shows public prices)
- ✅ Producer websites (MSRP)
- ⚠️ **DO NOT scrape** - manually note prices

**Research Tool:**
For each wine in `sampledWines.json`, find:
- Current retail price (USD)
- Where you found it (for reference)
- Current vintage available (if different from Kaggle vintage)

**Format for `sampledWinesWithCurrentPrices.json`:**
```json
[
  {
    "title": "Caymus 2015 Cabernet Sauvignon (Napa Valley)",
    "producer": "Caymus",
    "vintage": "2015",
    "region": "Napa Valley",
    "country": "United States",
    "kagglePrice": 85,
    "priceYear": 2017,
    "currentPrice": 100,
    "currentVintage": "2021",
    "priceSource": "wine.com",
    "researchDate": "2024-01-15",
    "notes": "Current vintage is 2021, but researched comparable 2015"
  }
]
```

### Step 3: Analyze and Generate Formula

```bash
node calibratePrices.js analyze
```

This will:
- Compare all price pairs
- Calculate statistics
- Generate multiple formula options
- Save formula to `priceFormula.json`

### Step 4: Use Formula in Imports

The formula is automatically used by:
- `importFromKaggle.js` (when importing Kaggle data)
- `priceEstimationService.js` (for ongoing price estimation)

## Sample Research Process

### Option 1: Manual Research (Recommended)

1. Open `sampledWines.json`
2. For each wine, search on:
   - Wine.com
   - Total Wine
   - Wine-Searcher.com
3. Note current price and source
4. Add to `sampledWinesWithCurrentPrices.json`

**Time Estimate:** 2-5 minutes per wine = 3-8 hours for 100 wines

### Option 2: Collaborative Research

- Split wines among team members
- Each person researches 20-25 wines
- Combine results

### Option 3: Focused Sampling

- Research 30-50 high-impact wines (popular, well-known)
- Still provides good statistical basis

## Formula Types Generated

### 1. Simple Multiplier
```
estimatedPrice = kagglePrice * multiplier
```
- Best if price increases are consistent across all wines
- Example: All wines increased 25% → `multiplier = 1.25`

### 2. Price-Range Based
```
Budget wines (< $20): multiplier = 1.30
Moderate ($20-$50): multiplier = 1.25
Premium ($50-$100): multiplier = 1.20
Luxury ($100-$500): multiplier = 1.15
Ultra-Luxury (> $500): multiplier = 1.10
```
- Best if different price tiers appreciate differently
- More accurate for diverse portfolios

### 3. Regional-Based
```
United States: multiplier = 1.25
France: multiplier = 1.20
Italy: multiplier = 1.22
...
```
- Best if regions have different inflation rates
- Useful for international wines

### 4. Linear Regression
```
estimatedPrice = kagglePrice * (slope * kagglePrice + intercept)
```
- Best if price increase correlates with original price
- More complex but potentially more accurate

### Recommended Formula

The system selects the best formula based on:
- Sample size
- Statistical significance (R² for regression)
- Data quality

## Output Files

- `sampledWines.json` - Initial sample list
- `sampledWinesWithCurrentPrices.json` - Sample with current prices (you create this)
- `priceFormula.json` - Generated formula (auto-created)

## Using the Formula

After calibration, prices are automatically estimated:

```javascript
const priceEstimationService = require('./priceEstimationService');

const historicalPrice = 85; // From Kaggle (2017)
const estimatedPrice = priceEstimationService.estimateCurrentPrice(historicalPrice, {
  country: 'United States',
  region: 'Napa Valley'
});

console.log(`Estimated: $${estimatedPrice}`); // e.g., $106
```

## Updating the Formula

**When to Recalibrate:**
- Annually (prices continue to change)
- After significant market events
- When adding new wines from different time periods

**Process:**
1. Re-run sample generation (may include new wines)
2. Research current prices
3. Re-run analysis
4. Formula automatically updates

## Example Output

```
📊 Price Increase Analysis:
   Average increase: 28.5%
   Median increase: 26.2%
   Range: 15.3% - 45.8%

📊 By Price Range:
   budget: 25 wines, avg 32.1% increase
   moderate: 25 wines, avg 27.8% increase
   premium: 25 wines, avg 24.5% increase
   luxury: 15 wines, avg 19.2% increase
   ultraLuxury: 10 wines, avg 12.8% increase

✅ Formula saved to: priceFormula.json
📋 Recommended Formula: price_range_based
   Apply different multipliers based on price range
```

## Tips for Accurate Research

1. **Find Same Vintage**: If possible, find current price for same vintage
2. **Find Comparable Vintage**: If vintage not available, use recent similar vintage
3. **Note the Source**: Track where you found the price
4. **Multiple Sources**: If possible, check 2-3 sources and average
5. **Be Consistent**: Use same retailer type (retail vs restaurant)
6. **Account for Vintage Differences**: Older vintages may be more expensive

## Legal Considerations

✅ **Legal to Use:**
- Public prices from retail websites (manual research)
- MSRP from producer websites
- Aggregator sites showing public prices

❌ **Do NOT:**
- Scrape websites (violates ToS)
- Use automated tools to extract prices
- Access private/password-protected pricing

**Manual Research is Legal:**
- You're manually noting publicly displayed prices
- Similar to a customer checking prices
- No automated extraction


