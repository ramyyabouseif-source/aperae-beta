# How to Research and Update Wine Prices

## Step 1: Use Search Queries

Open `GEMINI_SEARCH_COMMANDS.txt` or `SEARCH_QUERIES_FOR_GEMINI.md` and copy the search queries.

### Option A: Individual Searches (Recommended - More Accurate)
- Copy each query one at a time
- Paste into Gemini AI or Google Search
- Note the price from the results

### Option B: Batch Search
- Copy all queries at once
- May return less accurate results, but faster

## Step 2: Record Results

For each wine, note:
- **Price**: Current retail price in USD
- **Source**: Where you found it (wine.com, totalwine.com, wine-searcher.com)
- **Vintage**: The vintage year of the price you found
- **Notes**: Any additional info (e.g., "average price from wine-searcher", "current vintage 2022")

## Step 3: Provide Results Back

**Format Option 1: Simple List**
```
Caymus Cabernet Sauvignon: $105 - wine.com - 2021 - Current vintage
Dom Pérignon: $250 - wine-searcher.com - 2013 - Average price
Cloudy Bay Sauvignon Blanc: $32 - totalwine.com - 2023 - Current vintage
...
```

**Format Option 2: JSON Array**
```json
[
  {
    "title": "Caymus Cabernet Sauvignon",
    "currentPrice": 105,
    "currentVintage": "2021",
    "priceSource": "wine.com",
    "notes": "Current vintage on wine.com"
  },
  {
    "title": "Dom Pérignon",
    "currentPrice": 250,
    "currentVintage": "2013",
    "priceSource": "wine-searcher.com",
    "notes": "Average price from wine-searcher"
  }
]
```

## Step 4: I'll Update the Files

Once you provide results, I will:
1. ✅ Update `sampledWinesWithCurrentPrices.json` with verified prices
2. ✅ Re-run the analysis to generate improved formula
3. ✅ Update the price estimation service
4. ✅ Provide summary of improvements

## Tips for Best Results

### Best Sources:
1. **Wine-Searcher.com** - Shows average prices from multiple retailers (most reliable)
2. **Wine.com** - Specific retail prices
3. **Total Wine** - Retail prices from major chain

### For Vintage Differences:
- If exact vintage not available, use recent comparable vintage
- Note in comments: "Current vintage is 2022, price is for 2021"
- Try to find same vintage if possible for better comparison

### For Multiple Prices:
- If you find multiple prices, use **average** or **median**
- Wine-Searcher already provides averages - use that if available
- Note in comments: "Price range $100-110, using average $105"

### Priority:
- If time is limited, prioritize:
  1. Popular wines (Caymus, Opus One, Dom Pérignon)
  2. Different price ranges (budget, premium, luxury)
  3. Different regions (US, France, Australia)

## Current Status

✅ **21 wines** ready for verification
✅ **Price formula** generated (can be improved with verified data)
✅ **Search queries** prepared

**Waiting for:** Your research results to improve accuracy


