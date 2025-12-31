# Mock Dish Data Review - December 17, 2025

## Summary

Reviewed `backend/mockDishData.json` and updated `backend/server.js` to properly handle the removal of fields that are no longer displayed on the dish card.

## Fields to Remove from mockDishData.json

Based on our API optimization (Master Chef V1.1 Enhanced), the following fields should be **removed from the JSON file** to match the optimized output format:

### 1. `vintageAge` (in `wineAnalysis`)
- **Current location:** Line 8: `"vintageAge": "9 years"`
- **Reason:** Calculated server-side (2025 - vintage year)
- **Action:** Remove this field from `wineAnalysis`

### 2. `tanninCharacter` (in `wineAnalysis.structure`)
- **Current location:** Line 15: `"tanninCharacter": "polished"`
- **Reason:** No longer in JSON output format
- **Action:** Remove this field from `wineAnalysis.structure`

### 3. `confidence` object (in each `dishRecommendation`)
- **Current locations:** 
  - Lines 72-80 (Complex dish)
  - Lines 116-124 (Moderate dish)
  - Lines 158-166 (Simple dish)
- **Reason:** Confidence scoring validated internally but not included in JSON output to reduce API payload size
- **Action:** Remove the entire `confidence` object from each dish recommendation

## Backend Code Updates

✅ **Updated `backend/server.js`** to:

1. **Mock Mode Transformation:**
   - Removed `confidenceScore` and `confidence` from dish recommendations output
   - Filter `vintageAge` from `wineAnalysis` before output
   - Filter `tanninCharacter` from `wineAnalysis.structure` before output
   - Store original mock data (with all fields) for database

2. **Live Mode Transformation:**
   - Filter `vintageAge` from `wineAnalysis` before output
   - Filter `tanninCharacter` from `wineAnalysis.structure` before output
   - Removed `closingNarrative` from output (matches UI requirements)

## Current Status

The `mockDishData.json` file currently **still contains these fields**. They need to be manually removed from the JSON file.

### Expected Structure After Removal:

```json
{
  "wine": "2016 Clos de Oro Malbec Reserva",
  "wineAnalysis": {
    "producer": "unknown",
    "region": "unknown",
    "vintage": "2016",
    // "vintageAge": "9 years",  <- REMOVE THIS
    "color": "red",
    "structure": {
      "body": "medium-full",
      "acidity": "medium",
      "acidType": "balanced",
      "tannin": "medium",
      // "tanninCharacter": "polished",  <- REMOVE THIS
      "sweetness": "dry",
      "abv": "14.5%"
    },
    // ... rest of wineAnalysis
  },
  "dishRecommendations": [
    {
      "complexityLabel": "Complex Pairing",
      "dishName": "...",
      // ... other fields ...
      // "confidence": { ... }  <- REMOVE THIS ENTIRE OBJECT
    }
  ]
}
```

## Validation

The backend code will now:
- ✅ Handle missing `confidence` objects gracefully (no errors)
- ✅ Filter out `vintageAge` and `tanninCharacter` from output even if present in mock file
- ✅ Store complete data (including all fields) in database for historical tracking
- ✅ Match the optimized API output format from live mode

## Next Steps

1. Manually edit `backend/mockDishData.json` to remove:
   - `vintageAge` from `wineAnalysis`
   - `tanninCharacter` from `wineAnalysis.structure`
   - `confidence` objects from all 3 dish recommendations

2. Test mock mode to ensure API returns correct format

3. Verify database storage still captures all fields (from original mock data before filtering)

## Notes

- The backend code will work whether these fields are present or not (filters them on output)
- Database storage uses original data (before filtering) to preserve complete information
- This matches the live mode behavior where Claude may still provide these fields, but they're filtered from the API response






