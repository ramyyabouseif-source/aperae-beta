# What You Need to Do: Step-by-Step Guide

## Overview

This document explains **exactly what you need to do** to implement the safe validation approach. I'll handle the technical setup, and you'll do the manual price lookups.

---

## What I'll Do (Automated)

1. ✅ Search for public wine price datasets
2. ✅ Create validation template/spreadsheet
3. ✅ Select 100 wines for validation (stratified sample)
4. ✅ Create validation checklist
5. ✅ Set up JSON structure for results
6. ✅ Create scripts to process your results

---

## What You Need to Do (Manual)

### Step 1: Manual Price Lookup (8-12 hours)

**Task:** Look up current prices for 100 wines manually

**How:**
1. Open the validation spreadsheet I'll create
2. For each wine, manually visit Wine-Searcher.com
3. Search for the wine (name, producer, vintage)
4. Record the current average price
5. Fill in the spreadsheet

**Time:** 5-10 minutes per wine × 100 wines = 8-12 hours total

**Why Manual:**
- ✅ Legal (manual browsing is legal)
- ✅ Accurate (human verification)
- ✅ No ToS violations

---

## Detailed Step-by-Step Instructions

### Phase 1: Setup (I'll do this - just review)

**What I'll create:**
- `validationTemplate.json` - Structured format for validation
- `winesToValidate.json` - 100 wines selected for validation
- `validationSpreadsheet.csv` - Easy-to-use spreadsheet
- `validationChecklist.md` - Step-by-step checklist

**What you need to do:**
- ✅ Review the files I create
- ✅ Understand the format
- ✅ Ask questions if unclear

**Time:** 15 minutes (review only)

---

### Phase 2: Manual Validation (You'll do this)

**Step 2.1: Open the Spreadsheet**

1. Open `validationSpreadsheet.csv` in Excel/Google Sheets
2. You'll see columns:
   - Wine Name
   - Producer
   - Vintage
   - Kaggle Price (2017)
   - Current Price (YOU FILL THIS)
   - Source (YOU FILL THIS)
   - Date (YOU FILL THIS)
   - Notes (OPTIONAL)

**Step 2.2: Look Up Each Wine**

For each wine in the spreadsheet:

1. **Open Wine-Searcher.com** in your browser
   - Go to: https://www.wine-searcher.com
   - This is legal manual browsing

2. **Search for the wine**
   - Use search box at top
   - Enter: "[Producer] [Wine Name] [Vintage]"
   - Example: "Caymus Vineyards Cabernet Sauvignon 2020"

3. **Find the average price**
   - Look for "Average Price" or "Avg Price" on the results page
   - It's usually displayed prominently
   - If multiple vintages, find the specific vintage

4. **Record the price**
   - Copy the price (e.g., "$95")
   - Paste into "Current Price" column in spreadsheet
   - Fill in "Source" as "Wine-Searcher.com (manual)"
   - Fill in "Date" as today's date

5. **If wine not found:**
   - Try searching without vintage
   - Try searching just producer + wine name
   - If still not found, mark as "NOT FOUND" in price column
   - Add note explaining why

**Step 2.3: Cross-Validate (Optional but Recommended)**

For each wine, you can optionally check a second source:

1. **Open Wine.com** in another tab
2. Search for the same wine
3. If found, compare prices
4. If prices differ significantly, note this in "Notes" column

**Step 2.4: Progress Tracking**

- Update the spreadsheet as you go
- Check off completed wines
- Take breaks as needed (spread over 1-2 weeks is fine)

**Time Breakdown:**
- 100 wines × 5-10 minutes each = 8-12 hours total
- Can be done over multiple sessions
- Recommended: 10-20 wines per day

---

### Phase 3: Submit Results (You'll do this)

**Step 3.1: Complete the Spreadsheet**

1. Make sure all wines are filled in
2. Check for any missing data
3. Verify dates are correct

**Step 3.2: Save and Send**

1. Save the completed spreadsheet
2. Share the file with me (or I'll provide a way to upload)
3. I'll process the results

**Time:** 5 minutes

---

### Phase 4: Processing (I'll do this)

**What I'll do:**
1. ✅ Load your validation results
2. ✅ Calculate price changes
3. ✅ Update the price formula
4. ✅ Test accuracy improvement
5. ✅ Generate new calibrated formula

**What you need to do:**
- ✅ Review the results
- ✅ Verify the formula looks correct
- ✅ Ask questions if needed

**Time:** 15 minutes (review only)

---

## Time Commitment Summary

| Phase | What | Who | Time |
|-------|------|-----|------|
| **Setup** | Create templates, select wines | Me | 1 hour (I do) |
| **Review** | Review templates | You | 15 minutes |
| **Validation** | Look up 100 wines | You | 8-12 hours |
| **Submit** | Send completed spreadsheet | You | 5 minutes |
| **Processing** | Calculate formula | Me | 30 minutes (I do) |
| **Review Results** | Verify formula | You | 15 minutes |
| **TOTAL** | | | **~9-13 hours** |

**Note:** You can spread the 8-12 hours over multiple days/weeks. No rush!

---

## Tips for Efficient Validation

### 1. Batch Processing
- Do 10-20 wines per session
- Take breaks between sessions
- Focus when doing lookups (fewer errors)

### 2. Use Browser Shortcuts
- Open Wine-Searcher in one tab
- Open spreadsheet in another
- Use Alt+Tab to switch quickly

### 3. Search Strategy
- Start with exact match: "[Producer] [Wine] [Vintage]"
- If not found, try without vintage
- If still not found, try just producer + wine name

### 4. Quality Over Speed
- Take time to find accurate prices
- Double-check if price seems wrong
- Note any uncertainties in "Notes" column

### 5. Track Progress
- Check off completed wines
- Note how many left
- Take satisfaction in progress!

---

## What If You Can't Find a Wine?

**If wine not found on Wine-Searcher:**

1. **Try Wine.com** (manual browsing)
   - Search for the wine
   - Record price if found

2. **Try Google Search**
   - Search: "[Wine Name] [Producer] [Vintage] price"
   - Look for Wine-Searcher or Wine.com results
   - Record price if found

3. **If still not found:**
   - Mark as "NOT FOUND" in price column
   - Add note: "Not found on Wine-Searcher or Wine.com"
   - I'll exclude from analysis

**It's okay if you can't find 10-20 wines out of 100!** We only need 80-90 wines for 95% confidence.

---

## Expected Results

### After Your Validation

**You'll provide:**
- ✅ Completed spreadsheet with 80-100 wine prices
- ✅ Current prices for 2025
- ✅ Source documentation

**I'll provide:**
- ✅ Updated price formula
- ✅ 95% confidence multipliers
- ✅ Accuracy improvement report

### Formula Improvement

**Before:** 30% accuracy within 10% error  
**After:** 50-60% accuracy within 10% error (estimated)

**With more data (200+ wines):** 70-80% accuracy possible

---

## Questions?

**Common Questions:**

**Q: What if I don't have 8-12 hours?**  
A: Start with 50 wines (4-6 hours). That's enough for 90-95% confidence.

**Q: Can I do this over multiple weeks?**  
A: Yes! Spread it out. No rush. Even 10 wines per day works.

**Q: What if prices are wrong?**  
A: That's okay! We're looking for patterns, not perfection. Close enough is fine.

**Q: Do I need to be exact?**  
A: No. Round to nearest dollar. Focus on finding the right order of magnitude.

**Q: Can someone else help?**  
A: Yes! Divide the list. Just make sure they follow the same process.

---

## Ready to Start?

**Next Steps:**

1. ✅ I'll create the templates and select wines
2. ✅ You review the templates
3. ✅ You start manual validation (10-20 wines per day)
4. ✅ Submit completed spreadsheet
5. ✅ I'll process and update formula

**Let me know when you're ready, and I'll create everything you need!**

---

**Status:** Ready to begin  
**Your Time Commitment:** 8-12 hours (can spread over weeks)  
**Expected Outcome:** 95% confidence price formula


