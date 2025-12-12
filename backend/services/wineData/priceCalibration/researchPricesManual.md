# Manual Price Research Guide

Since automated research has limitations, here's a streamlined approach for manual research.

## Quick Research Strategy

### High-Value Wines First (30-50 wines)

Focus on popular, well-known wines first - they're easier to find and provide the most value:

1. **Napa Cabernet Sauvignons** (Caymus, Opus One, Silver Oak, etc.)
2. **Bordeaux First Growths** (Lafite, Latour, Margaux, etc.)
3. **Burgundy Grand Crus** (DRC, Leroy, etc.)
4. **Champagne** (Dom Pérignon, Krug, Cristal, etc.)
5. **Italian Super Tuscans** (Sassicaia, Ornellaia, Tignanello)
6. **Australian Icons** (Penfolds Grange, Henschke)
7. **Popular California** (Kendall-Jackson, Cloudy Bay, etc.)

### Research Sources (in order)

1. **Wine-Searcher.com** (Best aggregator)
   - Search: "Producer Wine Name Vintage"
   - Shows average price from multiple retailers
   - Most reliable for current market prices

2. **Wine.com**
   - Search by producer and wine name
   - Shows retail price directly
   - Often has current vintages

3. **Total Wine**
   - Search website
   - Good for popular wines
   - Shows retail pricing

4. **Producer Websites**
   - MSRP (Manufacturer's Suggested Retail Price)
   - Most accurate but may differ from retail

### Research Template

For each wine, record:

```json
{
  "title": "Exact title from sampledWines.json",
  "producer": "Producer name",
  "wineName": "Wine name",
  "vintage": "Vintage year",
  "region": "Region",
  "country": "Country",
  "kagglePrice": 85,
  "priceYear": 2017,
  "currentPrice": 100,
  "currentVintage": "2021",
  "priceSource": "wine-searcher.com",
  "researchDate": "2024-01-15",
  "notes": "Current vintage is 2021, priced at $100. Comparable to 2015 vintage used in Kaggle."
}
```

### Tips

1. **Find Same Vintage if Possible**: Best for accurate comparison
2. **Find Comparable Vintage**: If exact vintage not available, use recent similar vintage
3. **Average Multiple Sources**: If possible, check 2-3 sources and average
4. **Note Vintage Differences**: Older vintages may be more expensive
5. **Flag Uncertain Prices**: Add notes if price seems unusual

### Time Estimate

- **Quick research** (30 wines): 1-2 hours
- **Thorough research** (100 wines): 3-5 hours
- **30 wines is sufficient** for good formula accuracy

### Priority Order

**Do these first** (high impact):
1. Wines you recognize (easier to find)
2. Popular wines (Caymus, Dom Pérignon, etc.)
3. Different price ranges (budget, moderate, premium, luxury)
4. Different regions (US, France, Italy, etc.)

**Can skip** (if needed):
- Obscure wines
- Wines not easily found online
- Very old vintages no longer available


