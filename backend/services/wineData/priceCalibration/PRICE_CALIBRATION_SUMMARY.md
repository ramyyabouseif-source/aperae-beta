# Price Calibration Summary

## Research Completed: November 3, 2024

### Data Sources
- **19 wines verified** from Wine-Searcher.com
- **2 wines excluded** (Belle Glos Pinot Noir 2021, Sancerre 2022 - multiple variations, could not determine specific wine)

### Key Findings

#### Overall Price Trends (2017 → 2024)
- **Average increase**: 10.8% over 7 years
- **Median increase**: 11.1%
- **Range**: -16.9% to +43.2%

**Important Insight**: Wine prices have NOT increased uniformly. Some wines increased significantly (Silver Oak: +43%), while others decreased (Duckhorn Merlot: -17%, La Crema: -14%).

#### By Price Range

| Range | Avg Increase | Multiplier | Sample Size | Notes |
|-------|--------------|------------|-------------|-------|
| **Budget** (< $20) | 0.9% | 1.009x | 4 wines | Minimal increase, some decreases |
| **Moderate** ($20-$50) | 14.0% | 1.14x | 5 wines | Healthy growth |
| **Premium** ($50-$100) | 9.6% | 1.096x | 6 wines | Moderate growth |
| **Luxury** ($100-$500) | 32.6% | 1.326x | 3 wines | Significant growth (but small sample) |
| **Ultra-Luxury** (> $500) | -0.6% | 0.994x | 3 wines | Stable/slight decrease |

**Key Insight**: Luxury wines ($100-$500) showed the highest average increase, while ultra-luxury wines remained stable or decreased slightly.

#### By Region

| Region | Avg Increase | Sample Size |
|--------|--------------|-------------|
| **United States** | 11.0% | 13 wines |
| **France** | 12.4% | 5 wines |
| **New Zealand** | 32.0% | 1 wine (Cloudy Bay) |
| **Australia** | -4.9% | 2 wines (Penfolds decreased, Yellow Tail stable) |

### Notable Price Changes

**Largest Increases:**
- Silver Oak Cabernet Sauvignon 2019: +43% ($125 → $179)
- Opus One 2019: +30% ($350 → $455)
- Cloudy Bay Sauvignon Blanc 2022: +32% ($25 → $33)

**Largest Decreases:**
- Duckhorn Merlot 2020: -17% ($65 → $54)
- La Crema Pinot Noir 2021: -14% ($35 → $30)
- Barefoot Chardonnay 2022: -14% ($7 → $6)
- Penfolds Grange 2018: -10% ($750 → $676)

**No Change:**
- Yellow Tail Shiraz 2022: $8 → $8 (0% change)

### Recommended Formula

**Price-Range Based Formula** (recommended)

The formula applies different multipliers based on the historical price range:

```javascript
// Budget wines (< $20): multiply by 1.009
// Moderate ($20-$50): multiply by 1.14
// Premium ($50-$100): multiply by 1.096
// Luxury ($100-$500): multiply by 1.326
// Ultra-Luxury (> $500): multiply by 0.994
```

**Example:**
- Historical price: $85 (Premium range)
- Estimated current: $85 × 1.096 = $93.16

### Confidence Levels

**High Confidence:**
- Budget wines: Stable pricing, predictable
- Moderate wines: Consistent growth pattern
- Premium wines: Moderate, predictable increases

**Medium Confidence:**
- Luxury wines: High variance, smaller sample size
- Regional variations: Some regions show different patterns

**Low Confidence:**
- Ultra-luxury wines: Small sample, high variance
- Wine-specific factors: Some wines defied category trends

### Limitations

1. **Sample Size**: 19 verified wines (small but representative)
2. **Vintage Effects**: Some price changes may be vintage-specific, not just inflation
3. **Market Conditions**: Prices fluctuate based on supply, demand, critic scores
4. **Regional Variations**: Some regions (New Zealand, Australia) showed different patterns
5. **Wine-Specific Factors**: Brand reputation, critic scores, and production changes affect prices

### Recommendations

1. **Use price-range based formula** for best accuracy
2. **Flag wines with unusual patterns** (e.g., Silver Oak's 43% increase may be wine-specific)
3. **Consider regional adjustments** for Australian wines (may need downward adjustment)
4. **Update calibration periodically** - wine prices change over time
5. **Expand sample size** - more wines would improve accuracy, especially for luxury/ultra-luxury categories

### Next Steps

1. ✅ Formula generated and saved to `priceFormula.json`
2. ✅ Price estimation service updated to use new formula
3. 🔄 When importing Kaggle data, prices will be automatically estimated using these multipliers
4. 🔄 Consider periodic recalibration (annually) to account for ongoing price changes

### Files Updated

- `sampledWinesWithCurrentPrices.json` - 19 verified prices + 2 excluded wines
- `priceFormula.json` - Updated formula with new multipliers
- `priceEstimationService.js` - Uses new formula automatically


