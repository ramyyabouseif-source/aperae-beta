# Wine Data Methodology: Price and Quality Score Determination

## Current State (Manual Seed Data)

### Average Price (`averagePrice`)

**Current Methodology:**
- Values are **estimated approximations** based on general market knowledge
- Represent typical retail prices in USD for the specified vintage
- **Not sourced from actual price databases** (to avoid legal issues)
- Approximate ranges based on:
  - Wine reputation and producer prestige
  - Typical market positioning
  - General price knowledge from public domain sources

**Limitations:**
- Prices vary significantly by:
  - Retailer location and type
  - Vintage year
  - Market conditions
  - Time of purchase
- Current values are rough estimates, not verified market prices

**Example:**
```json
{
  "wineName": "Caymus Cabernet Sauvignon",
  "averagePrice": 85,  // Estimated typical retail price
  "vintage": "2020"
}
```

### Quality Score (`qualityScore`)

**Current Methodology:**
- **Derived from `criticScores` when available**:
  - If multiple critic scores exist, averaged (e.g., Wine Spectator 92, Wine Enthusiast 91 → qualityScore 92)
  - If only one critic score, used directly
- **Estimated when `criticScores` not available**:
  - Based on wine reputation
  - Regional/producer prestige
  - General quality perception

**Relationship to Critic Scores:**
- When `criticScores` object exists, `qualityScore` should approximate the average
- Format: `{ "wineSpectator": 92, "wineEnthusiast": 91 }`
- `qualityScore` provides a single numeric value (0-100) for easy comparison

**Example:**
```json
{
  "criticScores": {
    "wineSpectator": 92,
    "wineEnthusiast": 91
  },
  "qualityScore": 92  // Averaged from critic scores
}
```

## Recommended Methodology (Future Datasets)

### Average Price from Public Datasets

**From Kaggle Wine Reviews Dataset:**
- Use the `price` column directly if available
- Average multiple price entries for the same wine/vintage
- Note: Prices may be outdated or vary by source
- **Action**: When importing from Kaggle, use `price` field directly

**From UCI/Machine Learning Datasets:**
- Most quality datasets don't include pricing
- Would need to supplement with other sources
- Or leave as `null` if unavailable

**Best Practice:**
- Prefer actual price data from datasets over estimates
- Mark `dataQuality` lower when prices are estimated vs. actual
- Consider adding `priceSource` field to track where price came from

### Quality Score from Public Datasets

**From Kaggle Wine Reviews Dataset:**
- Use the `points` column (typically 80-100 scale)
- Convert to 0-100 scale if needed: `qualityScore = points`
- If multiple reviews exist, average them: `qualityScore = average(points)`
- **Action**: When importing from Kaggle, use `points` field directly

**From UCI Wine Quality Dataset:**
- Uses a 0-10 quality scale
- Convert: `qualityScore = (quality * 10)` to get 0-100 scale
- **Action**: When importing from UCI, multiply quality by 10

**From Critic Scores:**
- If `criticScores` object exists, calculate average:
  ```javascript
  const scores = Object.values(criticScores);
  qualityScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  ```
- Prefer critic scores over estimated quality

**Best Practice:**
1. **Use actual critic scores/points** when available (from datasets)
2. **Calculate from `criticScores`** if provided
3. **Estimate only as last resort** (mark `dataQuality` lower)

## Data Quality Indicators

The `dataQuality` field (0-100) should reflect confidence in the data:

| Score Range | Meaning | Example |
|------------|---------|---------|
| 90-100 | Verified data from authoritative source | Actual price from dataset, critic scores confirmed |
| 80-89 | Good quality, likely accurate | Estimated from reliable sources, single critic score |
| 70-79 | Moderate quality, approximate | General market knowledge, estimated prices |
| 50-69 | Low quality, uncertain | Rough estimates, limited information |
| 0-49 | Very low quality | Wild guesses, missing critical data |

### Current Seed Data Quality Scores

- **High Quality (90-95)**: Wines with verified critic scores (e.g., Dom Pérignon, Château Margaux)
- **Good Quality (85-89)**: Popular wines with general market knowledge (e.g., Caymus, Cloudy Bay)
- **Moderate Quality (75-84)**: Budget wines, estimates (e.g., Barefoot, Yellow Tail)
- **Lower Quality (65-74)**: Very approximate data (e.g., Franzia)

## Future Improvements

### 1. Price Data Enhancement

**Options:**
- Import from Kaggle dataset (includes prices)
- Use government pricing data (if publicly available)
- Partner with retailers for real-time pricing (future)
- User-submitted prices (with validation)

**Implementation:**
```javascript
// When importing from Kaggle:
wine.averagePrice = kaggleData.price || null;
wine.priceSource = kaggleData.price ? 'kaggle' : null;
```

### 2. Quality Score Enhancement

**Options:**
- Import points from Kaggle dataset
- Aggregate multiple critic scores
- Use UCI quality ratings (convert scale)
- Cross-reference with multiple sources

**Implementation:**
```javascript
// When importing from Kaggle:
wine.qualityScore = kaggleData.points || null;
wine.criticScores = {
  wineEnthusiast: kaggleData.points  // If source is Wine Enthusiast
};
```

### 3. Data Validation

**Add validation rules:**
- Price sanity checks (e.g., $0-$50,000 range)
- Quality score range (0-100)
- Cross-reference price vs. quality (expensive wines should typically have higher scores)
- Flag outliers for manual review

## Current Seed Data Accuracy

**Disclaimer for Current Data:**
- `averagePrice`: Estimates based on general market knowledge
- `qualityScore`: Derived from critic scores when available, estimated otherwise
- Both fields should be considered **approximations** until verified with actual datasets

**Recommendation:**
- When importing from public datasets (Kaggle, UCI), replace estimates with actual values
- Update `dataQuality` scores to reflect verified vs. estimated data
- Add `lastUpdated` timestamps when data is refreshed

## Example: Proper Data Sourcing

**Manual Entry (Current):**
```json
{
  "averagePrice": 85,  // Estimated
  "qualityScore": 92,  // From criticScores
  "dataQuality": 85    // Moderate (estimated price)
}
```

**From Kaggle Dataset (Future):**
```json
{
  "averagePrice": 87.50,  // Actual from dataset
  "qualityScore": 92,     // Actual points from dataset
  "criticScores": {
    "wineEnthusiast": 92
  },
  "priceSource": "kaggle",
  "dataQuality": 95       // High (verified data)
}
```

## Summary

**Current Approach (Seed Data):**
- ✅ Uses factual information (wine names, producers, regions)
- ⚠️ Prices are estimates (not verified)
- ✅ Quality scores derived from critic scores when available
- ⚠️ Some quality scores are estimated based on reputation

**Recommended Future Approach:**
- ✅ Import actual prices from Kaggle dataset
- ✅ Import actual quality scores/points from datasets
- ✅ Calculate quality scores from multiple critic scores
- ✅ Only estimate when actual data unavailable
- ✅ Mark `dataQuality` appropriately to indicate confidence level


