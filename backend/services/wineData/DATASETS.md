# Open Wine Datasets - Legal Sources

This document lists legal, open wine datasets that can be safely used for building the wine database.

## ✅ Recommended Datasets

### 1. Wine Quality Dataset (UCI)
- **Source**: UCI Machine Learning Repository
- **URL**: https://archive.ics.uci.edu/ml/datasets/Wine+Quality
- **License**: Public Domain / Open Data
- **Content**: Physicochemical tests and quality ratings for Portuguese wines
- **Size**: ~6,500 wines (red and white)
- **Fields**: Alcohol, acidity, pH, quality score
- **Use Case**: Quality scoring, wine characteristics

### 2. Wine Dataset (UCI)
- **Source**: UCI Machine Learning Repository  
- **URL**: https://archive.ics.uci.edu/ml/datasets/Wine
- **License**: Public Domain
- **Content**: Chemical analysis of Italian wines from 3 cultivars
- **Size**: 178 wines
- **Fields**: 13 chemical constituents
- **Use Case**: Wine classification by region/cultivar

### 3. Wine Reviews Dataset (Kaggle)
- **Source**: Kaggle
- **URL**: https://www.kaggle.com/datasets/zynicide/wine-reviews
- **License**: CC0 (Public Domain)
- **Content**: ~130,000 wine reviews from Wine Enthusiast
- **Fields**: Country, description, designation, points, price, province, region, taster, title, variety, winery
- **Use Case**: Wine information, pricing, ratings, tasting notes
- **Note**: ⚠️ Verify license before commercial use

### 4. Wine Quality Prediction Dataset (Kaggle)
- **Source**: Kaggle
- **URL**: https://www.kaggle.com/datasets/rajyellow46/wine-quality
- **License**: Public Domain
- **Content**: Combined red and white wine data
- **Fields**: Quality metrics, chemical properties
- **Use Case**: Quality prediction, wine characteristics

### 5. Wikipedia/Wikidata
- **Source**: Wikipedia/Wikidata
- **URL**: https://www.wikidata.org/
- **License**: CC BY-SA 3.0 (requires attribution)
- **Content**: Wine producer information, regions, appellations
- **Use Case**: Producer names, region data, factual information
- **API**: SPARQL queries available

### 6. USDA Food Data Central
- **Source**: USDA
- **URL**: https://fdc.nal.usda.gov/
- **License**: Public Domain
- **Content**: Food composition data (for pairing)
- **Use Case**: Food pairing information
- **API**: Available

## 📋 Dataset Evaluation Checklist

Before using any dataset, verify:

- [ ] License permits commercial use
- [ ] Attribution requirements (if any)
- [ ] Data quality and completeness
- [ ] Format compatibility with our schema
- [ ] Update frequency/maintenance status

## 🔄 Import Process

1. **Download** dataset from source
2. **Verify** license and attribution requirements
3. **Convert** to our JSON format (if needed)
4. **Validate** data structure
5. **Import** using import scripts
6. **Attribute** source in database records

## ⚠️ Data That Cannot Be Used

- **Wine-Searcher**: Explicitly prohibits scraping (ToS violation)
- **Wine.com**: Prohibits automated data extraction
- **Vivino**: Requires API access/partnership
- **CellarTracker**: Prohibits automated extraction
- **Any site with restrictive ToS**: Always review ToS first

## 📚 Attribution Templates

### For CC0 (Public Domain):
```
Source: [Dataset Name], Public Domain
```

### For CC BY-SA (Wikipedia):
```
Data from Wikipedia (https://wikipedia.org), licensed under CC BY-SA 3.0
```

### For UCI:
```
Source: UCI Machine Learning Repository, Public Domain
```

## 🚀 Next Steps

1. Download recommended datasets
2. Create import scripts for each dataset
3. Validate and clean data
4. Import into database
5. Enhance with manual curation
6. Monitor data quality


