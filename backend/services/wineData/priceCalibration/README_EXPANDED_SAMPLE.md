# Expanded Sample Generation Guide

## Option 1: Use Pre-Generated Manual List (RECOMMENDED for now)

I've created a curated list of 50 wines in `EXPANDED_SAMPLE_50_WINES.md`. This list includes:
- 10 Budget wines
- 10 Moderate wines  
- 10 Premium wines
- 15 Luxury wines (biggest gap in current data)
- 5 Ultra-luxury wines

**Note:** These are estimated wines that would typically be in the Kaggle dataset. You can start researching these immediately.

## Option 2: Generate from Actual Kaggle Dataset (More Accurate)

If you have the Kaggle Wine Reviews dataset downloaded:

1. **Download the dataset:**
   - Go to: https://www.kaggle.com/datasets/zynicide/wine-reviews
   - Download `winemag-data-130k-v2.csv`
   - Place it in: `backend/services/wineData/datasets/winemag-data-130k-v2.csv`

2. **Generate sample:**
   ```bash
   cd backend
   node services/wineData/priceCalibration/generateExpandedSample.js
   ```

3. **Output files:**
   - `expandedSample50Wines.json` - JSON format
   - `expandedSample50Wines.txt` - Copy/paste format

## Why 50 Wines?

- **Budget/Moderate**: Already have decent data (10-15 wines), but more improves confidence
- **Premium**: Good data (6 wines), but 10 wines would be better
- **Luxury**: CRITICAL - Only 3 wines currently, need 15+ for reliable patterns
- **Ultra-luxury**: Only 3 wines, but rare category so 5 is acceptable

## Next Steps After Research

Once you have the 50 prices:

1. Update `expandedSample50Wines.json` with prices (or create new file)
2. Run analysis:
   ```bash
   npm run wine:calibrate-analyze
   ```
3. New formula will be generated with improved accuracy

## Expected Improvements

With 50 wines vs current 19:
- **Luxury category confidence**: 3 wines → 15 wines (5x improvement)
- **Overall variance**: Should decrease from 16% to ~12-13%
- **Category reliability**: Much better confidence in luxury/ultra-luxury patterns


