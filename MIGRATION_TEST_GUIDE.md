# Migration Test Guide

**How to verify and trigger My Cellar migration**

---

## 🔍 **STEP 1: Check Current Status**

Run this in React Native Debugger Console:

```javascript
// Import the helper
import { checkMigrationStatus, triggerMigration, verifyMigration } from './src/utils/migrationHelper';

// Check status
const status = await checkMigrationStatus();
console.log('Migration Status:', status);
```

**Expected Output:**
```javascript
{
  hasOldData: true,      // true if you have old favorites
  hasNewData: false,     // false until migration runs
  oldCount: 5,           // number of old favorites
  newCount: 0,           // will be 0 until migration
  migrationNeeded: true  // true if migration should run
}
```

---

## 🔄 **STEP 2: Trigger Migration Manually**

If `migrationNeeded: true`, run:

```javascript
const result = await triggerMigration();
console.log('Migration Result:', result);
```

**Expected Output:**
```javascript
{
  success: true,
  migratedCount: 5,  // number of wines migrated
  error: undefined
}
```

**Check Console:**
- Should see: `🔄 Starting manual migration...`
- Should see: `✅ Migration completed: X wines migrated`

---

## ✅ **STEP 3: Verify Migration**

After migration, verify the data:

```javascript
const verification = await verifyMigration();
console.log('Verification:', verification);
```

**Expected Output:**
```javascript
{
  isValid: true,
  winesWithStatus: 5,
  winesWithoutStatus: 0,
  totalWines: 5,
  details: []
}
```

**If `isValid: false`:**
- Check the `details` array for which wines have issues
- May need to re-run migration

---

## 🔍 **STEP 4: Check Data Structure**

Verify a wine has the new fields:

```javascript
import { FavoritesService } from './src/services/favoritesService';

const wines = await FavoritesService.getFavorites();
if (wines.length > 0) {
  const firstWine = wines[0];
  console.log('First wine structure:', {
    hasStatus: firstWine.status !== undefined,
    status: firstWine.status,
    hasHasTried: firstWine.hasTried !== undefined,
    hasWantsToTry: firstWine.wantsToTry !== undefined,
    hasTags: Array.isArray(firstWine.tags),
    tags: firstWine.tags,
  });
}
```

**Expected:**
- `hasStatus: true`
- `status: 'favorite'` (default for migrated wines)
- `hasHasTried: true`
- `hasWantsToTry: true`
- `hasTags: true`
- `tags: []` (empty array by default)

---

## 🎯 **QUICK TEST SCRIPT**

Copy/paste this entire block into console:

```javascript
(async () => {
  console.log('=== MIGRATION TEST ===');
  
  // Import helpers
  const { checkMigrationStatus, triggerMigration, verifyMigration } = require('./src/utils/migrationHelper');
  const { FavoritesService } = require('./src/services/favoritesService');
  
  // Step 1: Check status
  console.log('\n1. Checking migration status...');
  const status = await checkMigrationStatus();
  console.log('Status:', status);
  
  // Step 2: Trigger migration if needed
  if (status.migrationNeeded) {
    console.log('\n2. Migration needed! Triggering migration...');
    const result = await triggerMigration();
    console.log('Result:', result);
  } else {
    console.log('\n2. Migration not needed (already done or no data)');
  }
  
  // Step 3: Verify
  console.log('\n3. Verifying migration...');
  const verification = await verifyMigration();
  console.log('Verification:', verification);
  
  // Step 4: Check data structure
  console.log('\n4. Checking data structure...');
  const wines = await FavoritesService.getFavorites();
  if (wines.length > 0) {
    const sample = wines[0];
    console.log('Sample wine:', {
      wineName: sample.wineName,
      status: sample.status,
      hasTried: sample.hasTried,
      wantsToTry: sample.wantsToTry,
      tags: sample.tags,
    });
  }
  
  console.log('\n=== TEST COMPLETE ===');
})();
```

---

## ❓ **WHY DOES THE SCREEN STILL LOOK THE SAME?**

**Important:** The migration only affects the **data structure**. The UI screens haven't been updated yet, so:

- ✅ **Data is migrated** - wines now have `status`, `tags`, etc.
- ❌ **UI not updated** - screen still shows "Favorites" (not "My Cellar")
- ❌ **Features hidden** - status badges, ratings, tags not displayed yet

**Next Steps:**
1. Verify migration worked (follow steps above)
2. Once confirmed, we'll update the UI screens
3. Then you'll see status badges, ratings, etc.

---

## 🐛 **TROUBLESHOOTING**

### Issue: "Cannot find module './src/utils/migrationHelper'"
**Solution:** The file might not exist. Check if `src/utils/migrationHelper.ts` exists. If not, let me know and I'll create it.

### Issue: Migration says "already completed" but data looks old
**Solution:** 
```javascript
// Clear cache and force reload
await FavoritesService.refreshCache();
const wines = await FavoritesService.getFavorites();
console.log('Reloaded wines:', wines.length);
```

### Issue: Migration fails
**Solution:** Check console for errors. Common issues:
- AsyncStorage permissions
- Invalid JSON in old data
- Storage quota exceeded

---

## 📊 **WHAT TO EXPECT AFTER MIGRATION**

**Before Migration:**
```javascript
{
  wineName: "Test Wine",
  producer: "Test Producer",
  vintage: "2024",
  // ... other fields
  // NO status field
  // NO tags field
  // NO ratings
}
```

**After Migration:**
```javascript
{
  wineName: "Test Wine",
  producer: "Test Producer",
  vintage: "2024",
  // ... other fields
  status: "favorite",        // ✅ NEW
  hasTried: false,            // ✅ NEW
  wantsToTry: false,          // ✅ NEW
  tags: [],                   // ✅ NEW
  wineRating: undefined,      // ✅ NEW (optional)
  pairingRating: undefined,   // ✅ NEW (optional)
  // ... other new optional fields
}
```

---

**Run the quick test script above and share the results!** 🚀



