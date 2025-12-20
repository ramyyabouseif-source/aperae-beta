# Mock Data Guide - Dish Recommendations

## Overview

Mock data has been set up for the reverse pairing system (wine-to-dish recommendations) to support development, testing, and UI refinement.

---

## Files Created

### Backend
- **`backend/mockDishData.json`** - Mock data for backend testing
  - Contains example response for "2016 Clos de Oro Malbec Reserva"
  - Includes 3 dish recommendations (Complex, Moderate, Simple)
  - All confidence scores ≥85

### Frontend
- **`src/services/dishService.ts`** - Dish recommendation service
  - Supports mock mode via `EXPO_PUBLIC_MOCK_MODE` environment variable
  - Includes retry logic and error handling
  - Falls back to mock data on API errors
  - Same structure as `wineService.ts` for consistency

- **`src/types/dish.ts`** - TypeScript type definitions
  - `DishRecommendation` - Individual dish recommendation
  - `WineAnalysis` - Wine analysis structure
  - `WineServingGuidance` - Serving instructions
  - `DishRecommendationResponse` - Complete response type

---

## Mock Mode Configuration

### Frontend (React Native)
Set in `.env` or environment:
```bash
EXPO_PUBLIC_MOCK_MODE=true
```

Or programmatically:
```typescript
import DishService from './services/dishService';

// Enable mock mode
DishService.setMockMode(true);

// Disable mock mode (use real API)
DishService.setMockMode(false);

// Check current mode
const isMock = DishService.isMockModeEnabled();
```

### Backend (Node.js)
Set in `backend/.env`:
```bash
MOCK_MODE=true
```

---

## Mock Data Structure

The mock data matches the exact structure provided:

```json
{
  "wine": "2016 Clos de Oro Malbec Reserva",
  "wineAnalysis": {
    "producer": "unknown",
    "region": "unknown",
    "vintage": "2016",
    "vintageAge": "9 years",
    "color": "red",
    "structure": { ... },
    "aromaticProfile": { ... },
    "keyStrength": "...",
    "idealDishProfile": "..."
  },
  "wineServingGuidance": { ... },
  "dishRecommendations": [
    {
      "complexityLabel": "Complex Pairing",
      "dishName": "Duck Breast with Blackberry-Port Reduction...",
      "pairingRationale": "...",
      "pairingPrinciplesApplied": [...],
      "ingredients": { ... },
      "recipe": [...],
      "cookTime": { ... },
      "servingSuggestion": "...",
      "confidence": { ... }
    },
    // ... 2 more dishes (Moderate, Simple)
  ]
}
```

---

## Usage Examples

### Basic Usage
```typescript
import DishService from './services/dishService';

// Get dish recommendations for a wine
const recommendations = await DishService.getDishRecommendations(
  '2016 Clos de Oro Malbec Reserva'
);

console.log('Wine:', recommendations.wine);
console.log('Dishes:', recommendations.dishRecommendations.length);
recommendations.dishRecommendations.forEach((dish, index) => {
  console.log(`${index + 1}. ${dish.dishName} (${dish.complexityLabel})`);
  console.log(`   Confidence: ${dish.confidence.score}`);
});
```

### With Mock Mode
```typescript
// Enable mock mode for testing
DishService.setMockMode(true);

const result = await DishService.getDishRecommendations('Any Wine Name');
// Returns mock data regardless of wine name

// Disable to use real API
DishService.setMockMode(false);
```

### Error Handling
```typescript
try {
  const recommendations = await DishService.getDishRecommendations(wine);
  // Process recommendations
} catch (error) {
  // Service automatically falls back to mock data
  // This catch is for other errors
  console.error('Error:', error);
}
```

---

## Testing & Development

### Benefits of Mock Mode

1. **Fast Development**
   - No API calls needed
   - Instant responses
   - Consistent data for UI testing

2. **UI Refinement**
   - Test dish card components
   - Refine layout and styling
   - Test different complexity levels

3. **Offline Development**
   - Work without backend running
   - No API key required
   - No network dependency

4. **Consistent Testing**
   - Same data every time
   - Predictable results
   - Easy to compare UI changes

---

## Mock Data Details

### Wine Analysis
- **Wine:** 2016 Clos de Oro Malbec Reserva
- **Producer/Region:** Unknown (for testing unknown wine handling)
- **Vintage Age:** 9 years (calculated from reference date)
- **Structure:** Medium-full body, medium tannin, polished character
- **Aromatics:** Blackberry, plum, dark cherry (primary); vanilla, toast, cocoa (secondary); leather, dried herbs (tertiary)

### Dish Recommendations

1. **Complex Pairing** (60 min)
   - Duck Breast with Blackberry-Port Reduction
   - Confidence: 92
   - Full recipe with 5 steps

2. **Moderate Pairing** (30 min)
   - Grilled Pork Chops with Mushroom-Herb Pan Sauce
   - Confidence: 89
   - Full recipe with 5 steps

3. **Simple Pairing** (20 min)
   - Grilled Lamb Chops with Herb Oil
   - Confidence: 90
   - Full recipe with 5 steps

---

## Integration with Home Screen

When implementing the UI toggle (Phase 5, Step 12), use this service:

```typescript
import DishService from '../services/dishService';

// In your component
const [mode, setMode] = useState<'dish' | 'wine'>('dish');
const [wineInput, setWineInput] = useState('');

const handleGetDishRecommendations = async () => {
  if (!wineInput.trim()) return;
  
  setLoading(true);
  try {
    const result = await DishService.getDishRecommendations(wineInput);
    setDishRecommendations(result);
  } catch (error) {
    // Handle error (service already falls back to mock)
  } finally {
    setLoading(false);
  }
};
```

---

## Next Steps

1. **Implement UI Toggle** (Phase 5, Step 12)
   - Add toggle to home screen
   - Switch between dish input and wine input

2. **Create Dish Card Component** (Phase 5, Step 17)
   - Display dish recommendations
   - Show recipe details
   - Display confidence scores

3. **Test with Mock Data**
   - Refine UI components
   - Test all complexity levels
   - Verify recipe display

4. **Implement Backend API** (Phase 5, Steps 13-16)
   - Master Chef Prompt V1.0
   - Wine Analysis Service
   - Dish Recommendation Service
   - API Endpoint

---

## Notes

- Mock data always returns the same response regardless of wine input
- This is intentional for consistent UI testing
- Real API will return different recommendations based on wine analysis
- Mock mode is automatically used as fallback on API errors
- All confidence scores in mock data are ≥85 (meeting prompt requirements)

---

**Last Updated:** Based on user-provided mock data example  
**Status:** ✅ Ready for UI development and testing








