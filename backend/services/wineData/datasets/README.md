# Wine Datasets Directory

Place downloaded datasets here.

## Kaggle Wine Reviews Dataset

1. **Download from**: https://www.kaggle.com/datasets/zynicide/wine-reviews
2. **Place CSV file in this directory**
3. **Run import**: `npm run wine:import-kaggle`

The file should be named something like:
- `winemag-data-130k-v2.csv`
- `wine-reviews.csv`
- Any `.csv` file will work (first one found will be used)

## Expected Format

CSV should have columns:
- `country`, `description`, `designation`, `points`, `price`, `province`, 
- `region_1`, `region_2`, `taster_name`, `title`, `variety`, `winery`


