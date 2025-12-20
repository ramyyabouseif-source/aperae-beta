# How to Trigger Migration - Quick Guide

## 🎯 **Understanding the Situation**

**Important:** The migration happens automatically when the service loads data. However, you won't see visual changes yet because:

1. ✅ **Data migration happens automatically** - wines get new fields (`status`, `tags`, etc.)
2. ❌ **UI screens NOT updated yet** - still shows "Favorites" instead of "My Cellar"
3. ❌ **New features hidden** - status badges, ratings not displayed

**The data IS migrated, but you can't see it in the UI yet!**

---

## 🔍 **VERIFY MIGRATION HAPPENED**

### Quick Test (Copy/Paste in Console):

```javascript
import { FavoritesService } from './src/services/favoritesService';

// Get all wines
const wines = await FavoritesService.getFavorites();

// Check if first wine has new fields
if (wines.length > 0) {
  const firstWine = wines[0];
  console.log('=== MIGRATION CHECK ===');
  console.log('Wine Name:', firstWine.wineName);
  console.log('Has status field?', 'status' in firstWine);
  console.log('Status value:', firstWine.status);
  console.log('Has tags field?', 'tags' in firstWine);
  console.log('Tags:', firstWine.tags);
  console.log('Has hasTried field?', 'hasTried' in firstWine);
  
  // Full wine structure
  console.log('\nFull wine object keys:', Object.keys(firstWine));
}
```

**If you see:**
- ✅ `Has status field? true`
- ✅ `Status value: favorite` (or 'wantToTry' or 'haveTried')
- ✅ `Has tags field? true`

**Then migration already happened!** The UI just hasn't been updated to show these fields.

---

## 🔄 **FORCE MIGRATION (If Needed)**

If the check above shows fields are missing, you can force migration:

### Option 1: Clear Cache and Reload

```javascript
import { FavoritesService } from './src/services/favoritesService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check what's in storage
const oldData = await AsyncStorage.getItem('user_favorites');
const newData = await AsyncStorage.getItem('my_cellar');

console.log('Old favorites count:', oldData ? JSON.parse(oldData).length : 0);
console.log('New cellar count:', newData ? JSON.parse(newData).length : 0);

// Force cache refresh
await FavoritesService.refreshCache();

// Check again
const wines = await FavoritesService.getFavorites();
console.log('After refresh, wines count:', wines.length);

// Check first wine
if (wines.length > 0) {
  console.log('First wine has status?', 'status' in wines[0]);
}
```

### Option 2: Manual Migration Script

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoritesService } from './src/services/favoritesService';

(async () => {
  console.log('🔄 Starting manual migration...');
  
  // Get old data
  const oldData = await AsyncStorage.getItem('user_favorites');
  if (!oldData) {
    console.log('❌ No old data found');
    return;
  }
  
  const oldWines = JSON.parse(oldData);
  console.log(`Found ${oldWines.length} wines to migrate`);
  
  // Migrate each wine
  const migratedWines = oldWines.map(wine => ({
    ...wine,
    status: wine.status || 'favorite',
    hasTried: wine.hasTried ?? false,
    wantsToTry: wine.wantsToTry ?? false,
    tags: wine.tags || [],
    pairingRating: wine.pairingRating,
    pairingNotes: wine.pairingNotes,
    pairedDishes: wine.pairedDishes || [],
    wineRating: wine.wineRating,
    wineNotes: wine.wineNotes,
    purchaseLocation: wine.purchaseLocation,
    purchasePrice: wine.purchasePrice,
    purchaseDate: wine.purchaseDate,
    occasion: wine.occasion,
  }));
  
  // Save to new key
  await AsyncStorage.setItem('my_cellar', JSON.stringify(migratedWines));
  console.log('✅ Saved to my_cellar key');
  
  // Refresh cache
  await FavoritesService.refreshCache();
  console.log('✅ Cache refreshed');
  
  // Verify
  const wines = await FavoritesService.getFavorites();
  console.log(`✅ Verified: ${wines.length} wines loaded`);
  console.log('First wine status:', wines[0]?.status);
  
  console.log('🎉 Migration complete!');
})();
```

---

## 🎨 **WHY THE UI LOOKS THE SAME**

The migration only affects the **data layer**. Here's what's happening:

### Data Layer (✅ Complete)
- Wines now have `status`, `tags`, `ratings`, etc.
- Service methods work
- Data is migrated

### UI Layer (⏳ Not Started)
- Screen still says "Favorites" (not "My Cellar")
- No status badges shown
- No ratings displayed
- No tags visible
- No edit capabilities

**Think of it like this:**
- The database has new fields ✅
- The app knows how to use them ✅
- The screen hasn't been redesigned yet ❌

---

## 📋 **NEXT STEPS**

1. **First:** Verify migration worked (run the check above)
2. **Then:** We'll update the UI screens to show:
   - "My Cellar" instead of "Favorites"
   - Status badges on wine cards
   - Rating displays
   - Tags on wines
   - Edit modal with all new features

---

## 🐛 **TROUBLESHOOTING**

### "I don't see any new fields"
- Run the verification check above
- Check console for errors
- Try the manual migration script

### "Migration already happened but UI is the same"
- **This is expected!** The UI hasn't been updated yet
- The data is migrated, but screens need to be redesigned
- We'll do that next

### "I want to test the new features now"
- You can test via console commands (see test plan)
- Or wait for UI updates to see visual changes

---

**Run the verification check first, then let me know what you see!** 🔍



