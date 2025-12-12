# How to Add More Wines to the Database

## Methods for Adding Wines

### Method 1: Manual Addition to Seed Data (Current)

**For Now**: Edit seed data files:
- `backend/services/wineData/seedData/popular-wines.json` - Main seed file
- `backend/services/wineData/seedData/additional-wines.json` - Additional wines

**Steps**:
1. Edit JSON file
2. Add wine object following the schema
3. Run: `npm run wine:import`

### Method 2: Import from Public Datasets (Recommended - Future)

**Kaggle Datasets**:
1. Download CSV from Kaggle (e.g., Wine Reviews Dataset)
2. Place in `backend/services/wineData/datasets/` directory
3. Create import script: `importFromKaggle.js`
4. Run import script

**UCI Datasets**:
1. Download from UCI ML Repository
2. Convert to our JSON format
3. Import using existing script

### Method 3: Programmatic Addition (Future)

**API Endpoint** (to be created):
- `POST /api/admin/wines` - Add wine manually
- Requires authentication
- Validates data structure

**Bulk Import** (to be created):
- `POST /api/admin/wines/import` - Bulk import from file
- Accepts JSON/CSV
- Validates and imports in batches

### Method 4: User Contributions (Future)

**Community-Driven**:
- Users can submit wine information
- Admin reviews before adding
- Voting system for accuracy

## Current Expansion Strategy

We're starting with **manually curated popular wines** because:
1. ✅ Legal compliance (public domain facts only)
2. ✅ High data quality
3. ✅ Covers popular wines users actually encounter
4. ✅ Can expand incrementally

## Legal Constraints

**Can Include**:
- Wine names (factual)
- Producer names (factual)
- Regions, countries (factual)
- Grape varieties (factual)
- Basic vintage years (factual)
- Generic tasting notes (stylistic, not copyrighted)

**Cannot Include**:
- Copyrighted descriptions
- Scraped data from commercial sites
- Proprietary ratings without permission
- User reviews without proper licensing

## Next Steps to Expand

1. **Immediate**: Continue manually curating popular wines (50-100 more)
2. **Short-term**: Download and import Kaggle wine reviews dataset (if license permits)
3. **Medium-term**: Integrate Wikipedia/Wikidata API for producer/region data
4. **Long-term**: Build user contribution system


