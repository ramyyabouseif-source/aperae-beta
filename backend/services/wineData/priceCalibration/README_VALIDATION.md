# Manual Price Validation - Complete Guide

## What This Is

A safe, legal way to validate wine prices from Kaggle (2017) against current 2025 prices to improve the price estimation formula accuracy.

---

## Files Created

1. **`winesToValidate.json`** - 68 wines selected for validation (stratified by price range)
2. **`validationSpreadsheet.csv`** - Easy-to-use spreadsheet for manual entry
3. **`validationChecklist.md`** - Step-by-step instructions
4. **`YOUR_ACTION_ITEMS.md`** - What you need to do (detailed)
5. **`processValidationResults.js`** - Script to process your completed spreadsheet

---

## Your Tasks

### Task 1: Manual Price Lookup (8-12 hours)

**What:** Look up current prices for 68 wines on Wine-Searcher.com

**How:**
1. Open `validationSpreadsheet.csv` in Excel/Google Sheets
2. Open Wine-Searcher.com in browser
3. For each wine:
   - Copy "Search Query" from spreadsheet
   - Search on Wine-Searcher.com
   - Find "Average Price"
   - Fill in "Current Price" column
   - Fill in "Source" as "Wine-Searcher.com (manual)"
   - Fill in "Date" as today's date

**Time:** 5-10 minutes per wine × 68 wines = 6-11 hours

**Can be spread over multiple days/weeks!**

---

### Task 2: Submit Results (5 minutes)

**What:** Save and share completed spreadsheet

**How:**
1. Save completed spreadsheet as: `validationSpreadsheet_COMPLETED.csv`
2. Place in: `backend/services/wineData/priceCalibration/`
3. Run: `node processValidationResults.js`

**Time:** 5 minutes

---

## What Happens After

**I'll process your results:**
1. ✅ Load your completed spreadsheet
2. ✅ Calculate price changes
3. ✅ Update price formula
4. ✅ Test accuracy improvement
5. ✅ Generate new calibrated formula

**Expected Improvement:**
- Current: 30% accuracy within 10% error
- After: 50-60% accuracy within 10% error (estimated)

---

## Quick Start

1. **Open `validationSpreadsheet.csv`**
2. **Open Wine-Searcher.com**
3. **Start with wine #1**
4. **Fill in prices as you go**
5. **Save when complete**
6. **Run processing script**

---

## Detailed Instructions

See:
- **`YOUR_ACTION_ITEMS.md`** - Complete step-by-step guide
- **`validationChecklist.md`** - Quick reference checklist

---

## Questions?

**Q: How long does this take?**  
A: 6-11 hours total, but can be spread over days/weeks.

**Q: What if I can't find a wine?**  
A: Mark as "NOT FOUND". We only need 50-60 wines for good results.

**Q: Do I need to be exact?**  
A: No. Round to nearest dollar. Order of magnitude is fine.

**Q: Can someone else help?**  
A: Yes! Divide the list between people.

---

**Ready to start? Open `validationSpreadsheet.csv` and begin!** 🍷


