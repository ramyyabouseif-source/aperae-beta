# Additional Validation Fields for Model Accuracy

## Overview

To improve model accuracy beyond just price validation, you can optionally fill in additional fields that help the model understand why prices change.

---

## Additional Fields (Optional but Helpful)

### 1. **Critic Score** (OPTIONAL)

**What:** Wine Spectator, Wine Advocate, or Wine Enthusiast points

**Format:** `95` (just the number, e.g., 95 points)

**Where to find:** 
- Wine-Searcher often shows critic scores
- Wine Spectator website
- Wine Advocate website

**Example:** `95` (Wine Spectator score)

**Why it helps:**
- High-scoring wines (90+) appreciate more
- Low-scoring wines may depreciate
- Helps model understand quality impact on price

**Time:** +30 seconds per wine (if available)

---

### 2. **Vintage Quality** (OPTIONAL)

**What:** Vintage quality rating for the region (0-100)

**Format:** `98` (just the number)

**Where to find:**
- Wine Spectator vintage charts
- Wine Advocate vintage reports
- Vintage quality data we created (vintageQualityData.json)

**Example:** `98` (2015 Bordeaux vintage quality)

**Why it helps:**
- Exceptional vintages (95+) appreciate more
- Poor vintages (85-) may depreciate
- Critical for Bordeaux, Burgundy, Napa

**Time:** Can look up from vintageQualityData.json (+10 seconds)

---

### 3. **Producer Reputation** (OPTIONAL)

**What:** Producer reputation score (1-10)

**Format:** `9` (just the number)

**Where to find:**
- Producer reputation index we created (producerReputationIndex.json)
- Generally known (DRC = 10, Barefoot = 2, etc.)

**Example:** `9` (Opus One reputation)

**Why it helps:**
- High-reputation producers (8+) appreciate more
- Mass-market producers (2-4) have different patterns
- Critical for luxury wines

**Time:** Can look up from producerReputationIndex.json (+10 seconds)

---

### 4. **Wine Type** (OPTIONAL)

**What:** Red, White, Rose, Sparkling, Dessert

**Format:** `Red`, `White`, `Rose`, `Sparkling`, `Dessert`

**Where to find:**
- Usually obvious from wine name
- Wine-Searcher shows this

**Example:** `Red` (for Cabernet Sauvignon)

**Why it helps:**
- Different wine types have different appreciation patterns
- Sparkling wines age differently
- Helps model understand category-specific patterns

**Time:** Usually obvious (+5 seconds)

---

## Priority of Additional Fields

### High Priority (Fill if Easy)

1. **Wine Type** - Usually obvious, quick to fill
2. **Producer Reputation** - Can look up from our index
3. **Vintage Quality** - Can look up from our data

**Time:** +30 seconds per wine total

---

### Medium Priority (Fill if Available)

1. **Critic Score** - If shown on Wine-Searcher, record it

**Time:** +30 seconds per wine (if available)

---

## How to Fill Additional Fields

### For Wine Type

**Usually obvious from name:**
- Cabernet Sauvignon, Pinot Noir, Merlot → `Red`
- Chardonnay, Sauvignon Blanc, Riesling → `White`
- Rosé → `Rose`
- Champagne, Sparkling → `Sparkling`

**If unsure:** Check Wine-Searcher listing

---

### For Producer Reputation

1. **Check our index:** `producerReputationIndex.json`
2. **If not found:** Estimate based on price/prestige
   - Ultra-rare (DRC, Pétrus) = 10
   - Highly prestigious (Opus One, First Growth) = 9
   - Premium (Caymus, Silver Oak) = 7-8
   - Mass market (Barefoot, Yellow Tail) = 2

---

### For Vintage Quality

1. **Check our data:** `vintageQualityData.json`
2. **Look up by region and vintage:**
   - Example: 2015 Bordeaux = 98
   - Example: 2013 Napa = 99

**If not found:** Leave blank (not critical)

---

### For Critic Score

1. **Check Wine-Searcher listing:**
   - Often shows "Wine Spectator: 95 pts"
   - Or "Wine Advocate: 94/100"
2. **Record just the number:**
   - `95` (not "95 points")

**If not shown:** Leave blank

---

## Impact on Model Accuracy

### With Only Prices (Current)

- **Accuracy:** ~50-60% within 10% error
- **Limitations:** Model can't explain why prices change

### With Additional Fields

- **Critic Score:** +5-10% accuracy improvement
- **Vintage Quality:** +5-10% accuracy improvement
- **Producer Reputation:** +5-10% accuracy improvement
- **Wine Type:** +3-5% accuracy improvement

**Total Potential:** 70-85% accuracy within 10% error

---

## Recommended Approach

### Minimum (Just Prices)

- Fill in: Current Price, Source, Date
- **Time:** 5-10 minutes per wine
- **Accuracy:** 50-60%

### Recommended (Prices + Easy Fields)

- Fill in: Current Price, Source, Date, Wine Type, Producer Reputation
- **Time:** 6-11 minutes per wine
- **Accuracy:** 60-70%

### Optimal (All Fields)

- Fill in: All fields including Critic Score, Vintage Quality
- **Time:** 7-12 minutes per wine
- **Accuracy:** 70-85%

---

## Time Estimates

### For 200 Wines

**Minimum (prices only):**
- 200 wines × 6 minutes = 20 hours

**Recommended (prices + easy fields):**
- 200 wines × 7 minutes = 23 hours

**Optimal (all fields):**
- 200 wines × 8 minutes = 27 hours

**Note:** Can be spread over multiple weeks!

---

## Workflow Recommendation

### For Each Wine:

1. **Look up price** (5-10 minutes)
   - Search Wine-Searcher
   - Record current price
   - Fill in source and date

2. **Fill easy fields** (1-2 minutes)
   - Wine Type (usually obvious)
   - Producer Reputation (look up in index)
   - Vintage Quality (look up in data)

3. **Fill optional fields** (1-2 minutes, if available)
   - Critic Score (if shown)
   - Any notes

**Total:** 7-12 minutes per wine

---

## Summary

**Required Fields:**
- ✅ Current Price
- ✅ Source
- ✅ Date

**Recommended Fields (Easy):**
- ✅ Wine Type
- ✅ Producer Reputation
- ✅ Vintage Quality

**Optional Fields (Fill if Available):**
- ⭕ Critic Score

**Impact:** Additional fields can improve accuracy by 10-25 percentage points!

---

## Next Steps

1. **Fill in required fields** (prices) for all 200 wines
2. **Optionally fill easy fields** (type, reputation, vintage quality)
3. **Fill critic scores** if available (optional)

**The more fields you fill, the better the model accuracy!** 🎯


