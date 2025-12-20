# Why V7.0 Prompt Uses Modular Structure

**Date:** December 15, 2025

---

## 🎯 **Reason: Prompt Caching for Cost Optimization**

The V7.0 prompt was structured in separate modular files instead of being embedded in `server.js` like the other prompts (`GENERAL_SOMMELIER_PROMPT`, `ENHANCED_SOMMELIER_PROMPT`, `MENU_SOMMELIER_PROMPT`) to support **Anthropic's prompt caching feature**.

---

## 📊 **How Prompt Caching Works**

### **Anthropic API Prompt Caching:**
- **Static sections** (unchanged between requests) can be cached
- **Dynamic sections** (change per request - dish name, date) are sent each time
- **Benefit:** Saves tokens and reduces costs significantly (60-70% token savings)

### **Example:**
- **Without caching:** Every request sends the full 5000+ token prompt → costs for 5000+ tokens per request
- **With caching:** First request sends 5000 tokens, subsequent requests send only ~500 dynamic tokens → ~90% cost reduction

---

## 📁 **Modular Structure Breakdown**

### **Static Sections (Cacheable):**
- Pairing Principles (Section 2)
- Tier Classification (Section 3)  
- Confidence Scoring (Section 6)
- Copyright Compliance (Section 9)
- Most of Dish Analysis Protocol (instructions)
- Output Requirements (instructions)
- Pre-flight Checklist

**These don't change between requests** → Cached by Anthropic API

### **Dynamic Sections (Per-Request):**
- Dish name
- Reference date
- Vintage calculations (based on date)
- Task description

**These change for each request** → Sent every time

---

## 🔍 **Current Implementation Status**

### **✅ Working:**
- Dynamic sections are populated (`v7-dynamic-sections.js`)
- Main builder function assembles the prompt (`v7-master-sommelier-prompt.js`)
- Server code splits prompt for caching (`server.js` line ~2060)

### **❌ Incomplete:**
- **Static sections file is empty** (`v7-static-sections.js`)
- Static sections are referenced but not defined
- This means:
  - Prompt caching is **not working** as intended
  - The static sections need to be extracted from the ENHANCED_SOMMELIER_PROMPT or defined separately

---

## 💡 **Why Other Prompts Are Inline**

The other prompts (`GENERAL_SOMMELIER_PROMPT`, `ENHANCED_SOMMELIER_PROMPT`, `MENU_SOMMELIER_PROMPT`) are embedded in `server.js` because:

1. **They don't use prompt caching** - sent as a single prompt each time
2. **Simpler structure** - all in one place, easier to read/modify
3. **No optimization needed** - shorter prompts or less frequent usage

---

## 🔧 **What Needs To Happen**

To complete the V7.0 prompt caching implementation:

1. **Populate `v7-static-sections.js`** with:
   - `pairingPrinciples` (Section 2)
   - `tierClassification` (Section 3)
   - `confidenceScoring` (Section 6)
   - `copyrightCompliance` (Section 9)

2. **Extract from existing prompts:**
   - Can extract from `ENHANCED_SOMMELIER_PROMPT` in `server.js`
   - Or define based on V7.0 requirements

3. **Verify caching is working:**
   - Check API responses for cache hits
   - Monitor token usage to confirm savings

---

## 📈 **Benefits of This Structure (When Complete)**

1. **Cost Savings:** 60-70% reduction in token costs
2. **Faster Responses:** Cached sections don't need processing
3. **Better Organization:** Clear separation of static vs dynamic content
4. **Easier Updates:** Update static sections once, applies to all requests

---

## 🤔 **Alternative: Simplify to Inline (If Caching Not Needed)**

If prompt caching isn't a priority, you could:

1. Move V7.0 prompt inline to `server.js` (like other prompts)
2. Remove the modular structure
3. Simpler codebase, but no caching benefits

---

## ✅ **Recommendation**

**Keep the modular structure** and complete the implementation by populating the static sections file. The cost savings from prompt caching are significant for a production system with regular API usage.

---

## 📝 **Files Involved**

- **Builder:** `backend/prompts/v7-master-sommelier-prompt.js` - Assembles the prompt
- **Dynamic:** `backend/prompts/v7-dynamic-sections.js` - ✅ Populated
- **Static:** `backend/prompts/v7-static-sections.js` - ❌ **Needs to be populated**
- **Service:** `backend/services/v7PromptService.js` - Handles caching logic
- **Server:** `backend/server.js` - Uses cached/non-cached prompt parts

---

**Status:** Modular structure is correct, but implementation is incomplete (static sections file is empty)



