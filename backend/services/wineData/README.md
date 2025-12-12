# Wine Database - Legal Open Data Sources

This directory contains scripts and data for building a curated wine database using **only legal, open/public data sources**.

## Legal Compliance

✅ **Only uses:**
- Public domain datasets
- Openly licensed data (CC0, CC-BY, etc.)
- Manual curation of factual information
- Wikipedia/Wikidata (with proper attribution)

❌ **Does NOT use:**
- Web scraping of commercial sites (Wine-Searcher, Wine.com, etc.)
- Data from sites that prohibit scraping in ToS
- Copyrighted tasting notes or descriptions

## Data Sources

### Current Sources:
1. **Manual Curation** (`seedData/popular-wines.json`)
   - Curated list of popular wines
   - Contains only factual information (names, regions, types)
   - No copyrighted content

### Planned Sources:
1. **Kaggle Wine Datasets**
   - Wine Quality Dataset
   - Wine Reviews Dataset (if license permits)
   - Download: https://www.kaggle.com/datasets?search=wine

2. **UCI Machine Learning Repository**
   - Wine Quality Dataset
   - Wine Dataset (Italian wines)
   - URL: https://archive.ics.uci.edu/datasets?search=wine

3. **Wikipedia/Wikidata**
   - Wine producer information
   - Region/appellation data
   - License: CC BY-SA 3.0 (requires attribution)

4. **Government Databases**
   - USDA Food Data Central (for pairing data)
   - Public domain regulatory data

## Importing Data

### Import Seed Data

```bash
# Import curated popular wines
node backend/services/wineData/importSeedData.js
```

### Future: Import from Datasets

```bash
# Place CSV files in datasets/ directory, then:
node backend/services/wineData/importFromCSV.js datasets/wine-quality.csv
```

## Data Structure

See `backend/prisma/schema.prisma` for the Wine and WinePairing models.

### Required Fields:
- `wineName`: Name of the wine
- `normalizedName`: Normalized version for search
- `source`: Where data came from ("kaggle", "uci", "manual", etc.)
- `sourceLicense`: License information

### Optional Fields:
- Producer, vintage, region, country
- Pricing, ratings, tasting notes
- Food pairings, quality scores

## Adding New Wines

### Manual Addition

Edit `seedData/popular-wines.json` and run the import script.

### From Public Dataset

1. Verify dataset license permits commercial use
2. Download dataset
3. Convert to our format (JSON)
4. Run import script

## Attribution

When using data from Wikipedia/Wikidata:
- Include attribution: "Data from Wikipedia, licensed under CC BY-SA 3.0"

## Future Enhancements

- [ ] Kaggle dataset integration
- [ ] UCI dataset integration
- [ ] Wikipedia/Wikidata API integration
- [ ] Automated data quality scoring
- [ ] User contribution system


