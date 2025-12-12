# Wine Database Setup Guide

This guide walks you through setting up the legal, open-source wine database for enhancing recommendations.

## ✅ What's Been Implemented

### 1. Database Schema
- ✅ Wine model with comprehensive fields
- ✅ WinePairing model for dish-wine relationships
- ✅ All models include source attribution for legal compliance

### 2. Wine Database Service
- ✅ Search wines by name, producer, region
- ✅ Validate if wines exist in database
- ✅ Find wines for specific dishes
- ✅ Enhance AI recommendations with verified data

### 3. Seed Data
- ✅ Curated list of 8 popular wines
- ✅ Contains factual information only (legal/public domain)
- ✅ Includes tasting notes, ratings, food pairings

### 4. Integration
- ✅ Integrated with recommendation endpoint
- ✅ Automatically enhances AI recommendations with database data
- ✅ Falls back gracefully if database unavailable

## 🚀 Setup Instructions

### Step 1: Run Prisma Migration

Create the database tables:

```bash
cd backend
npm run wine:migrate
```

Or manually:
```bash
cd backend
npx prisma migrate dev --name add_wine_models
```

This will:
- Create `wines` table
- Create `wine_pairings` table
- Generate Prisma client

### Step 2: Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

### Step 3: Import Seed Data

Import the curated popular wines:

```bash
cd backend
npm run wine:import
```

This will:
- Import 8 popular wines from seed data
- Create food pairings for each wine
- Display import statistics

### Step 4: Verify Setup

Check that data was imported:

```bash
cd backend
npx prisma studio
```

Open `http://localhost:5555` and verify:
- Wines table has entries
- Wine_pairings table has entries

## 📊 Database Usage

### Automatic Enhancement

The recommendation endpoint now automatically:
1. Gets AI recommendations
2. Validates each wine against the database
3. Enhances with verified data (ratings, prices, tasting notes)
4. Boosts confidence for verified wines
5. Flags unverified wines with lower confidence

### Manual Queries

You can also query the database directly:

```javascript
const wineDatabaseService = require('./services/wineDatabaseService');

// Search wines
const wines = await wineDatabaseService.searchWines('Caymus');

// Validate wine exists
const exists = await wineDatabaseService.validateWineExists(
  'Caymus Cabernet Sauvignon',
  'Caymus Vineyards',
  '2020'
);

// Find wines for a dish
const pairings = await wineDatabaseService.findWinesForDish('Grilled steak');
```

## 📈 Next Steps

### Immediate
1. ✅ Run migration
2. ✅ Import seed data
3. ✅ Test recommendations with database

### Short-term
1. Download Kaggle wine datasets
2. Create CSV import scripts
3. Import UCI wine quality dataset
4. Build Wikipedia/Wikidata integration

### Long-term
1. Automated data quality scoring
2. User contribution system
3. Periodic data updates
4. Data validation pipeline

## 🔍 Current Data

**Seed Data:**
- 8 popular wines (Caymus, Dom Pérignon, Cloudy Bay, etc.)
- Includes ratings, prices, tasting notes
- Food pairings for each wine

**Data Sources:**
- Manual curation (factual information only)
- Public domain (no copyright issues)
- Ready to expand with open datasets

## ⚠️ Legal Compliance

All data in this database:
- ✅ From legal, open sources
- ✅ Properly attributed
- ✅ Public domain or permissively licensed
- ✅ No copyrighted content
- ✅ No ToS violations

## 📚 Documentation

- `backend/services/wineData/README.md` - Data structure and import process
- `backend/services/wineData/DATASETS.md` - Legal dataset sources
- `backend/services/wineDatabaseService.js` - API documentation

## 🐛 Troubleshooting

### Migration Fails
- Ensure DATABASE_URL is set in `.env`
- Check PostgreSQL is running
- Verify database connection

### Import Fails
- Ensure migration completed successfully
- Check Prisma client is generated
- Verify seed data file exists

### No Enhancements
- Check database has wines
- Verify wineDatabaseService is imported correctly
- Check logs for enhancement errors (service fails gracefully)


