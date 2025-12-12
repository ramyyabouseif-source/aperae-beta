# How More Wines Will Be Added

## Current Status
- **Seed Data**: 100+ wines manually curated
- **Source**: Public domain factual information only
- **Coverage**: Popular wines from major regions and price points

## Future Methods for Adding More Wines

### Method 1: Download Public Datasets (Recommended)

**Kaggle Wine Reviews Dataset** (~130,000 wines):
- URL: https://www.kaggle.com/datasets/zynicide/wine-reviews
- License: CC0 (Public Domain)
- Contains: Country, description, designation, points, price, province, region, taster, title, variety, winery
- **Action**: Create import script to convert CSV → our JSON format

**UCI Wine Quality Dataset**:
- URL: https://archive.ics.uci.edu/ml/datasets/Wine+Quality
- License: Public Domain
- Contains: Quality scores, chemical properties
- **Action**: Import and merge with existing wine data

### Method 2: Wikipedia/Wikidata Integration

**Wikipedia SPARQL Queries**:
- Extract wine producer information
- Region/appellation data
- Grape variety information
- **License**: CC BY-SA 3.0 (requires attribution)
- **Action**: Build scraper/API integration for Wikipedia/Wikidata

### Method 3: Manual Curation

**Continue Building Seed Data**:
- Edit `popular-wines.json` directly
- Add popular wines as they're requested
- Focus on wines users actually encounter

### Method 4: User Contributions (Future Feature)

**Community-Driven Growth**:
- Users submit wine information
- Admin moderation before publishing
- Voting system for accuracy
- **Action**: Build user contribution API endpoint

### Method 5: Automated Dataset Imports

**Periodic Imports**:
- Download updated datasets
- Run import scripts
- Validate and deduplicate
- **Action**: Schedule automated imports

## Recommended Immediate Next Steps

1. **Download Kaggle Dataset** (Highest Priority)
   - 130,000 wines from Wine Enthusiast
   - CC0 license (public domain)
   - Create `importFromKaggle.js` script
   - Import basic info: name, producer, region, price, rating

2. **Build Wikipedia/Wikidata Integration**
   - Use SPARQL queries to get producer/region data
   - Supplement existing wines with additional info
   - Proper attribution required

3. **Create Bulk Import Tools**
   - CSV → JSON converter
   - Batch import script
   - Data validation pipeline

## Current Expansion Capability

Right now, you can:
- ✅ Manually edit `popular-wines.json` and re-import
- ✅ Run `npm run wine:import` to add new wines
- ✅ The system handles 100+ wines efficiently

## To Add 1000+ Wines

**Short-term** (This Week):
1. Download Kaggle wine reviews CSV
2. Create CSV → JSON converter
3. Import 1,000-5,000 popular wines
4. Validate data quality

**Medium-term** (This Month):
1. Wikipedia/Wikidata integration
2. Automated data quality scoring
3. Deduplication system
4. Import additional datasets

**Long-term** (Future):
1. User contribution system
2. Partnership with wine databases (official APIs)
3. Real-time price updates (if legal sources available)
4. Automated wine discovery


