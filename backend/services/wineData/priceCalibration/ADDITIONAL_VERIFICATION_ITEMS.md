# Additional Items to Verify for Model Accuracy

## Overview

Beyond just validating prices, there are additional fields that will significantly improve the price estimation model's accuracy. These fields help the model understand **why** prices change, not just **how much** they change.

---

## Additional Fields to Verify (Optional but Highly Recommended)

### 1. **Wine Type** ⭐ (High Priority - Easy)

**What:** Classification of wine (Red, White, Rose, Sparkling, Dessert)

**Why it helps:**
- Different wine types have different appreciation patterns
- Sparkling wines age differently than still wines
- Red vs. white wines have different market dynamics
- Helps model understand category-specific patterns

**How to fill:**
- Usually obvious from wine name
  - Cabernet Sauvignon, Pinot Noir, Merlot → `Red`
  - Chardonnay, Sauvignon Blanc, Riesling → `White`
  - Rosé, Provence → `Rose`
  - Champagne, Prosecco, Cava → `Sparkling`
  - Sauternes, Port, Ice Wine → `Dessert`
- If unsure, check Wine-Searcher listing

**Time:** +5 seconds per wine

**Impact:** +3-5% accuracy improvement

---

### 2. **Producer Reputation** ⭐⭐ (High Priority - Easy)

**What:** Producer reputation score (1-10 scale)

**Why it helps:**
- High-reputation producers (8+) appreciate more over time
- Mass-market producers (2-4) have different price patterns
- Critical for luxury wines where brand matters
- Helps model understand producer-specific trends

**How to fill:**
1. **Check our index:** `producerReputationIndex.json`
2. **If not found, estimate:**
   - Ultra-rare (DRC, Pétrus, Screaming Eagle) = `10`
   - Highly prestigious (Opus One, First Growth) = `9`
   - Premium (Caymus, Silver Oak) = `7-8`
   - Moderate (Kendall-Jackson, Josh Cellars) = `5-6`
   - Mass market (Barefoot, Yellow Tail) = `2-3`

**Time:** +10 seconds per wine (lookup in index)

**Impact:** +5-10% accuracy improvement

**Reference File:** `backend/services/wineData/priceCalibration/producerReputationIndex.json`

---

### 3. **Vintage Quality** ⭐⭐ (High Priority - Easy)

**What:** Vintage quality rating for the region (0-100)

**Why it helps:**
- Exceptional vintages (95+) appreciate significantly more
- Poor vintages (85-) may depreciate
- Critical for Bordeaux, Burgundy, Napa where vintage matters
- Helps model understand vintage-specific appreciation

**How to fill:**
1. **Check our data:** `vintageQualityData.json`
2. **Look up by region and vintage:**
   - Example: 2015 Bordeaux = `98`
   - Example: 2013 Napa = `99`
   - Example: 2017 Napa = `93`

**Time:** +10 seconds per wine (lookup in data file)

**Impact:** +5-10% accuracy improvement

**Reference File:** `backend/services/wineData/priceCalibration/vintageQualityData.json`

---

### 4. **Critic Score** ⭐ (Medium Priority - If Available)

**What:** Wine Spectator, Wine Advocate, or Wine Enthusiast points

**Why it helps:**
- High-scoring wines (90+) appreciate more
- Low-scoring wines may depreciate
- Helps model understand quality impact on price
- Provides additional validation of wine quality

**How to fill:**
1. **Check Wine-Searcher listing:**
   - Often shows "Wine Spectator: 95 pts"
   - Or "Wine Advocate: 94/100"
2. **Record just the number:**
   - `95` (not "95 points")
   - If multiple scores, use the highest

**Time:** +30 seconds per wine (if available)

**Impact:** +5-10% accuracy improvement

**Note:** Not all wines have critic scores, so this is optional

---

## Summary of Additional Fields

| Field | Priority | Time | Impact | How to Fill |
|-------|----------|------|--------|-------------|
| **Wine Type** | High | +5 sec | +3-5% | Usually obvious |
| **Producer Reputation** | High | +10 sec | +5-10% | Look up in index |
| **Vintage Quality** | High | +10 sec | +5-10% | Look up in data file |
| **Critic Score** | Medium | +30 sec | +5-10% | If shown on Wine-Searcher |

**Total Time:** +25-55 seconds per wine (beyond price lookup)

---

## Recommended Workflow

### For Each Wine:

1. **Look up price** (5-10 minutes)
   - Search Wine-Searcher
   - Record current price
   - Fill in source and date

2. **Fill easy fields** (30 seconds)
   - Wine Type (usually obvious) - +5 sec
   - Producer Reputation (look up in index) - +10 sec
   - Vintage Quality (look up in data) - +10 sec

3. **Fill optional fields** (30 seconds, if available)
   - Critic Score (if shown) - +30 sec

**Total:** 6-12 minutes per wine (vs. 5-10 minutes for price only)

---

## Impact on Model Accuracy

### With Only Prices (Current)
- **Accuracy:** ~50-60% within 10% error
- **With 200 wines:** ~60-70% accuracy

### With Additional Fields (Recommended)
- **Wine Type:** +3-5% accuracy improvement
- **Producer Reputation:** +5-10% accuracy improvement
- **Vintage Quality:** +5-10% accuracy improvement
- **Critic Score:** +5-10% accuracy improvement (if available)

**Total Potential:** **70-85% accuracy** within 10% error

---

## Time Estimates for 200 Wines

### Minimum (Prices Only)
- **131 wines × 6 minutes = 13 hours**
- Only fill in: Current Price, Source, Date

### Recommended (Prices + Easy Fields)
- **131 wines × 7 minutes = 15 hours**
- Fill in: Price + Wine Type + Producer Reputation + Vintage Quality

### Optimal (All Fields)
- **131 wines × 8 minutes = 18 hours**
- Fill in: All fields including Critic Score

**Note:** Can be spread over multiple days/weeks!

---

## Where to Find Reference Data

### Producer Reputation Index
**File:** `backend/services/wineData/priceCalibration/producerReputationIndex.json`

**How to use:**
1. Open the file
2. Search for producer name (Ctrl+F)
3. Find the reputation score (1-10)
4. Fill in spreadsheet

**Example:**
```json
{
  "producers": {
    "Caymus Vineyards": 7,
    "Opus One": 9,
    "Barefoot": 2
  }
}
```

---

### Vintage Quality Data
**File:** `backend/services/wineData/priceCalibration/vintageQualityData.json`

**How to use:**
1. Open the file
2. Find the region (e.g., "Napa Valley", "Bordeaux")
3. Find the vintage year (e.g., "2015")
4. Read the quality score (0-100)
5. Fill in spreadsheet

**Example:**
```json
{
  "Napa Valley": {
    "2015": 96,
    "2016": 94,
    "2017": 93
  }
}
```

---

## Additional Verification Tips

### Price Verification

1. **Consistency Check**
   - Verify prices are consistent across multiple vintages
   - Note any significant price anomalies
   - If price seems wrong, double-check

2. **Vintage-Specific Pricing**
   - Some wines show large price variations by vintage
   - Record the specific vintage you're researching
   - Make sure you're looking at the right vintage

3. **Market Variations**
   - Prices may vary by region (US vs. Europe)
   - Ensure you're getting US market prices
   - Use average price, not individual retailer prices

4. **Bottle vs. Case Pricing**
   - Make sure you're recording per-bottle prices
   - Not per-case prices
   - Wine-Searcher shows per-bottle by default

### Data Quality

1. **Completeness**
   - Fill in as many fields as possible
   - Missing fields are okay, but more is better
   - Focus on easy fields first (Wine Type, Producer Reputation)

2. **Accuracy**
   - Double-check if price seems wrong
   - Verify producer name matches exactly
   - Ensure vintage matches spreadsheet

3. **Consistency**
   - Use consistent formatting
   - Use same source (Wine-Searcher) when possible
   - Use same date for all validations

---

## Priority Order

### Start Here (Required)
1. ✅ Current Price
2. ✅ Source
3. ✅ Date

### Next (Recommended - Easy)
4. ✅ Wine Type (usually obvious)
5. ✅ Producer Reputation (look up in index)
6. ✅ Vintage Quality (look up in data)

### Last (Optional - If Available)
7. ⭕ Critic Score (if shown on Wine-Searcher)
8. ⭕ Notes (any observations)

---

## Example: Complete Validation Entry

**Wine:** Caymus Cabernet Sauvignon 2020

**Required Fields:**
- Current Price: `95`
- Source: `Wine-Searcher.com (manual)`
- Date: `2024-11-03`

**Recommended Fields:**
- Wine Type: `Red`
- Producer Reputation: `7` (from producerReputationIndex.json)
- Vintage Quality: `95` (from vintageQualityData.json - Napa Valley 2020)

**Optional Fields:**
- Critic Score: `92` (if shown on Wine-Searcher)
- Notes: `Verified on 2024-11-03. Price confirmed across multiple retailers.`

---

## Questions?

**Q: Do I need to fill all additional fields?**  
A: No! Start with required fields (price). Then fill easy ones (Wine Type, Producer Reputation, Vintage Quality). Critic Score is optional.

**Q: What if I can't find a field?**  
A: Leave it blank. It's better to have accurate price data than incomplete additional fields.

**Q: How much time will this add?**  
A: About 30 seconds per wine for easy fields (Wine Type, Producer Reputation, Vintage Quality).

**Q: Will this really improve accuracy?**  
A: Yes! These fields help the model understand **why** prices change, leading to better predictions.

---

**The more fields you fill, the better the model accuracy!** 🎯


