# Legacy Files Usage Audit

**Date:** December 15, 2025

This document shows which legacy files are actually used vs unused.

---

## ✅ **AUDIT RESULTS**

### **1. `src/services/storageService.ts`**

**Status:** ❌ **NOT USED** - Safe to delete

**Evidence:**
- No imports found for `StorageService` in the codebase
- All searches for "storageService" only found references to `SecureStorageService` (different file)
- The `FavoritesService` (now My Cellar) uses AsyncStorage directly, not this service
- This appears to be an old implementation replaced by `favoritesService.ts`

**Recommendation:** ✅ **SAFE TO DELETE**

---

### **2. `src/screens/FavoritesScreen.tsx`**

**Status:** ❌ **EFFECTIVELY UNUSED** - Dead code (but kept as fallback)

**Evidence:**
- Imported in: `src/screens/AdaptiveFavoritesScreen.tsx` (line 4)
- Used as fallback when: `hasEnhancedComponents()` returns `false`
- **VERIFIED:** `uiConfig.ts` line 20 shows `UI_VERSION = 'enhanced'`
- **VERIFIED:** `hasEnhancedComponents()` returns `UI_VERSION === 'enhanced'` (line 43)
- **RESULT:** `hasEnhancedComponents()` always returns `true`, so `FavoritesScreen` is never executed

**Usage Pattern:**
```typescript
// AdaptiveFavoritesScreen.tsx
if (hasEnhancedComponents()) {
  return <SimpleEnhancedFavoritesScreen />;  // ← ALWAYS executes (enhanced = true)
}
return <FavoritesScreen />;  // ← NEVER executes (dead code)
```

**Recommendation:** ✅ **SAFE TO DELETE** (but optional - keeps fallback option)
- Can be removed if you're committed to enhanced UI only
- Kept as fallback if you want option to revert to original UI later

---

### **3. `src/screens/EnhancedFavoritesScreen.tsx`**

**Status:** ❌ **NOT USED** - Safe to delete

**Evidence:**
- No imports found for `EnhancedFavoritesScreen` anywhere
- Not referenced in `AdaptiveFavoritesScreen.tsx`
- Not used in `App.tsx` navigation
- Appears to be an alternative implementation that was never integrated

**Recommendation:** ✅ **SAFE TO DELETE**

---

## 🔍 **HOW TO VERIFY BEFORE DELETING**

### **Method 1: Search for Imports (Most Reliable)**

Use grep to search for imports:
```bash
# Search for StorageService imports
grep -r "from.*storageService\|import.*StorageService" src/

# Search for FavoritesScreen imports
grep -r "from.*FavoritesScreen\|import.*FavoritesScreen" src/

# Search for EnhancedFavoritesScreen imports
grep -r "from.*EnhancedFavoritesScreen\|import.*EnhancedFavoritesScreen" src/
```

### **Method 2: Check uiConfig.ts**

Check if `hasEnhancedComponents()` can return `false`:
- If it always returns `true`, `FavoritesScreen.tsx` is never used
- If it can return `false`, it's needed as a fallback

### **Method 3: Check Navigation/Routing**

Check `App.tsx` to see which screens are actually registered:
- Only `AdaptiveFavoritesScreen` is imported and used
- `FavoritesScreen` and `EnhancedFavoritesScreen` are not directly used in navigation

### **Method 4: Build Test (Safest)**

1. Comment out the import/usage
2. Try to build/run the app
3. If it builds successfully, the file is unused
4. If it errors, the file is needed

---

## 📋 **RECOMMENDED DELETION ORDER**

### **Safe to Delete Immediately:**

1. ✅ `src/services/storageService.ts` - No references found
2. ✅ `src/screens/EnhancedFavoritesScreen.tsx` - No references found

### **Verified - Safe to Delete (Optional):**

3. ✅ `src/screens/FavoritesScreen.tsx` - Dead code (verified)
   - ✅ Verified: `uiConfig.ts` has `UI_VERSION = 'enhanced'`
   - ✅ Verified: `hasEnhancedComponents()` always returns `true`
   - ✅ Result: This screen is never executed
   - **Note:** Can keep as fallback if you want option to revert to original UI

---

## 🛠️ **SAFE DELETION PROCEDURE**

### **Step 1: Verify No Usage**
```bash
# Run these commands to confirm
grep -r "StorageService" src/ --exclude-dir=node_modules
grep -r "EnhancedFavoritesScreen" src/ --exclude-dir=node_modules
grep -r "FavoritesScreen" src/ --exclude-dir=node_modules --exclude="AdaptiveFavoritesScreen.tsx"
```

### **Step 2: Check uiConfig.ts** ✅ **VERIFIED**
```typescript
// VERIFIED: uiConfig.ts line 20
export const UI_VERSION: UIVersion = 'enhanced';  // ← Always 'enhanced'

// VERIFIED: uiConfig.ts line 43
export const hasEnhancedComponents = () => UI_CONFIG.features.enhancedComponents;  // ← Always true

// Result: hasEnhancedComponents() always returns true, so FavoritesScreen is never used
```

### **Step 3: Comment Out (Test First)**
Before deleting, comment out the import/usage:
```typescript
// import FavoritesScreen from './FavoritesScreen';  // ← Comment this
// return <FavoritesScreen />;  // ← Comment this
```

### **Step 4: Build & Test**
- Run the app
- Test all navigation paths
- If everything works, safe to delete

### **Step 5: Delete Files**
Once confirmed:
```bash
rm src/services/storageService.ts
rm src/screens/EnhancedFavoritesScreen.tsx
# rm src/screens/FavoritesScreen.tsx  # Only if verified unused
```

### **Step 6: Update AdaptiveFavoritesScreen.tsx**
If removing `FavoritesScreen.tsx`, update:
```typescript
// Remove this import
// import FavoritesScreen from './FavoritesScreen';

// Update the component to only use SimpleEnhancedFavoritesScreen
const AdaptiveFavoritesScreen: React.FC = () => {
  return <SimpleEnhancedFavoritesScreen />;
};
```

---

## ✅ **SUMMARY**

**Confirmed Safe to Delete:**
- ✅ `src/services/storageService.ts`
- ✅ `src/screens/EnhancedFavoritesScreen.tsx`

**Needs Verification:**
- ⚠️ `src/screens/FavoritesScreen.tsx` (check `uiConfig.ts` first)

**Files to Update After Deletion:**
- `src/screens/AdaptiveFavoritesScreen.tsx` (if removing FavoritesScreen)

