# My Cellar Rebranding - Test Plan

**Date:** December 15, 2025  
**Version:** Initial Implementation  
**Status:** Ready for Testing

---

## 🎯 **TESTING OBJECTIVES**

Verify that:
1. Data migration from "Favorites" to "My Cellar" works correctly
2. New service methods function as expected
3. UI components render and interact properly
4. Backward compatibility is maintained
5. No regressions in existing functionality

---

## 📋 **PRE-TEST CHECKLIST**

Before starting, ensure:
- [ ] App builds successfully (`npm start` or `npx expo start`)
- [ ] No TypeScript errors (`npx tsc --noEmit` or check IDE)
- [ ] App runs on device/simulator
- [ ] You have some existing favorites (if testing migration)
- [ ] You're familiar with the current favorites functionality

---

## 🧪 **TEST SUITE**

### **TEST 1: Data Migration** ⏱️ ~5 minutes

**Objective:** Verify that existing favorites data migrates correctly to My Cellar format.

**Steps:**
1. **Check Current Data:**
   - Open the app
   - Navigate to Favorites screen
   - Note how many favorites you currently have
   - Note details of 1-2 specific favorites (wine name, producer, vintage)

2. **Trigger Migration:**
   - Close the app completely
   - Restart the app
   - Navigation to Favorites screen again
   - **Expected:** All favorites should still be visible

3. **Verify Data Structure:**
   - Open React Native Debugger or check console logs
   - Look for any migration-related logs
   - **Expected:** No errors, data loads successfully

4. **Check Storage:**
   - In React Native Debugger, check AsyncStorage
   - Look for key: `my_cellar` (new) or `user_favorites` (old)
   - **Expected:** Data exists in at least one key

**Success Criteria:**
- ✅ All existing favorites are still visible
- ✅ No data loss
- ✅ App doesn't crash
- ✅ No console errors

**If Migration Fails:**
- Check console for error messages
- Verify AsyncStorage is accessible
- Check that `favoritesService.ts` is imported correctly

---

### **TEST 2: Service Methods - Basic Operations** ⏱️ ~10 minutes

**Objective:** Test core service methods (get, add, remove).

**Steps:**

1. **Test Get Favorites:**
   ```javascript
   // In React Native Debugger console or add temporary test button
   import { FavoritesService } from './src/services/favoritesService';
   
   // Test getFavorites
   const wines = await FavoritesService.getFavorites();
   console.log('All wines:', wines);
   console.log('Count:', wines.length);
   ```
   - **Expected:** Returns array of wines, no errors

2. **Test Add Wine:**
   ```javascript
   // Add a test wine
   const testWine = {
     wineName: "Test Wine 2024",
     producer: "Test Producer",
     vintage: "2024",
     pricePoint: "$25",
     rationale: "Test rationale",
     tastingNotes: { aromas: ["cherry"], palate: "fruity", finish: "smooth" },
     servingGuidance: "Serve at room temperature",
     expertRating: "unknown",
     retailerSuggestion: "Test retailer",
     image: "unknown",
     storytellingElements: "Test story"
   };
   
   await FavoritesService.addToFavorites(testWine);
   const updated = await FavoritesService.getFavorites();
   console.log('After add:', updated.length);
   ```
   - **Expected:** Wine added successfully, count increases by 1
   - **Check:** Wine has `id`, `addedAt`, `status: 'favorite'` by default

3. **Test Remove Wine:**
   ```javascript
   // Remove the test wine
   const testWineId = updated.find(w => w.wineName === "Test Wine 2024")?.id;
   if (testWineId) {
     await FavoritesService.removeFromFavorites(testWineId);
     const afterRemove = await FavoritesService.getFavorites();
     console.log('After remove:', afterRemove.length);
   }
   ```
   - **Expected:** Wine removed, count decreases by 1

**Success Criteria:**
- ✅ Get favorites works
- ✅ Add wine works and sets defaults correctly
- ✅ Remove wine works
- ✅ No errors in console

---

### **TEST 3: Service Methods - Status Management** ⏱️ ~5 minutes

**Objective:** Test status update functionality.

**Steps:**

1. **Add a Test Wine:**
   ```javascript
   const testWine = {
     wineName: "Status Test Wine",
     producer: "Test Producer",
     vintage: "2024",
     pricePoint: "$30",
     rationale: "Testing status",
     tastingNotes: { aromas: [], palate: "test", finish: "" },
     servingGuidance: "Test",
     expertRating: "unknown",
     retailerSuggestion: "Test",
     image: "unknown",
     storytellingElements: "Test"
   };
   
   await FavoritesService.addToFavorites(testWine);
   const added = await FavoritesService.getFavorites();
   const wineId = added.find(w => w.wineName === "Status Test Wine")?.id;
   ```

2. **Test Status Updates:**
   ```javascript
   // Test wantToTry
   await FavoritesService.updateWineStatus(wineId, 'wantToTry');
   let wine = await FavoritesService.getFavoriteById(wineId);
   console.log('Status after wantToTry:', wine?.status);
   console.log('wantsToTry:', wine?.wantsToTry);
   // Expected: status: 'wantToTry', wantsToTry: true, hasTried: false
   
   // Test haveTried
   await FavoritesService.updateWineStatus(wineId, 'haveTried', new Date().toISOString());
   wine = await FavoritesService.getFavoriteById(wineId);
   console.log('Status after haveTried:', wine?.status);
   console.log('hasTried:', wine?.hasTried);
   console.log('triedDate:', wine?.triedDate);
   // Expected: status: 'haveTried', hasTried: true, triedDate set
   
   // Test favorite
   await FavoritesService.updateWineStatus(wineId, 'favorite');
   wine = await FavoritesService.getFavoriteById(wineId);
   console.log('Status after favorite:', wine?.status);
   // Expected: status: 'favorite'
   ```

3. **Test Get by Status:**
   ```javascript
   const wantToTry = await FavoritesService.getWinesByStatus('wantToTry');
   const haveTried = await FavoritesService.getWinesByStatus('haveTried');
   const favorites = await FavoritesService.getWinesByStatus('favorite');
   
   console.log('Want to Try:', wantToTry.length);
   console.log('Have Tried:', haveTried.length);
   console.log('Favorites:', favorites.length);
   ```

**Success Criteria:**
- ✅ Status updates work correctly
- ✅ `hasTried` and `wantsToTry` flags update correctly
- ✅ `triedDate` is set when marking as "haveTried"
- ✅ Get by status returns correct wines

---

### **TEST 4: Service Methods - Ratings** ⏱️ ~5 minutes

**Objective:** Test rating functionality.

**Steps:**

1. **Get Test Wine:**
   ```javascript
   const wines = await FavoritesService.getFavorites();
   const testWine = wines.find(w => w.wineName === "Status Test Wine");
   if (!testWine) {
     console.log('Please run Test 3 first');
     return;
   }
   ```

2. **Test Wine Rating:**
   ```javascript
   // Set wine rating
   await FavoritesService.updateWineRating(testWine.id, 4);
   let wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Wine rating:', wine?.wineRating);
   // Expected: wineRating: 4
   
   // Test rating clamping (should stay between 1-5)
   await FavoritesService.updateWineRating(testWine.id, 10);
   wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Rating after 10:', wine?.wineRating);
   // Expected: wineRating: 5 (clamped)
   
   await FavoritesService.updateWineRating(testWine.id, -1);
   wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Rating after -1:', wine?.wineRating);
   // Expected: wineRating: 1 (clamped)
   ```

3. **Test Pairing Rating:**
   ```javascript
   // Set pairing rating with dish
   await FavoritesService.updatePairingRating(testWine.id, 5, "Grilled Salmon");
   wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Pairing rating:', wine?.pairingRating);
   console.log('Paired dishes:', wine?.pairedDishes);
   // Expected: pairingRating: 5, pairedDishes array with one entry
   
   // Update same dish rating
   await FavoritesService.updatePairingRating(testWine.id, 4, "Grilled Salmon");
   wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Updated pairing rating:', wine?.pairingRating);
   // Expected: pairingRating: 4, same dish entry updated
   ```

**Success Criteria:**
- ✅ Wine rating updates correctly
- ✅ Rating is clamped between 1-5
- ✅ Pairing rating updates correctly
- ✅ Paired dishes array is maintained

---

### **TEST 5: Service Methods - Notes** ⏱️ ~5 minutes

**Objective:** Test notes functionality.

**Steps:**

1. **Get Test Wine:**
   ```javascript
   const wines = await FavoritesService.getFavorites();
   const testWine = wines.find(w => w.wineName === "Status Test Wine");
   ```

2. **Test Wine Notes:**
   ```javascript
   await FavoritesService.updateWineNotes(testWine.id, "This is a great wine! Very smooth.");
   let wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Wine notes:', wine?.wineNotes);
   // Expected: wineNotes contains the text
   ```

3. **Test Pairing Notes:**
   ```javascript
   await FavoritesService.updatePairingNotes(testWine.id, "Perfect with grilled salmon!", "Grilled Salmon");
   wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Pairing notes:', wine?.pairingNotes);
   console.log('Paired dishes with notes:', wine?.pairedDishes);
   // Expected: pairingNotes set, pairedDishes entry has notes
   ```

**Success Criteria:**
- ✅ Wine notes save correctly
- ✅ Pairing notes save correctly
- ✅ Notes are associated with specific dishes

---

### **TEST 6: Service Methods - Tags** ⏱️ ~5 minutes

**Objective:** Test tags functionality.

**Steps:**

1. **Get Test Wine:**
   ```javascript
   const wines = await FavoritesService.getFavorites();
   const testWine = wines.find(w => w.wineName === "Status Test Wine");
   ```

2. **Test Add Tags:**
   ```javascript
   await FavoritesService.addTags(testWine.id, ["Date Night", "Special Occasions"]);
   let wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Tags after add:', wine?.tags);
   // Expected: tags array with 2 items
   
   // Try adding duplicate (should not duplicate)
   await FavoritesService.addTags(testWine.id, ["Date Night"]);
   wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Tags after duplicate add:', wine?.tags);
   // Expected: still 2 items, no duplicates
   ```

3. **Test Remove Tags:**
   ```javascript
   await FavoritesService.removeTags(testWine.id, ["Date Night"]);
   wine = await FavoritesService.getFavoriteById(testWine.id);
   console.log('Tags after remove:', wine?.tags);
   // Expected: 1 tag remaining ("Special Occasions")
   ```

4. **Test Get All Tags:**
   ```javascript
   const allTags = await FavoritesService.getAllTags();
   console.log('All tags:', allTags);
   // Expected: Array of unique tags from all wines
   ```

5. **Test Get Wines by Tag:**
   ```javascript
   const winesWithTag = await FavoritesService.getWinesByTag("Special Occasions");
   console.log('Wines with tag:', winesWithTag.length);
   // Expected: At least 1 wine (the test wine)
   ```

**Success Criteria:**
- ✅ Tags add correctly
- ✅ Duplicate tags are prevented
- ✅ Tags remove correctly
- ✅ GetAllTags returns unique tags
- ✅ GetWinesByTag works correctly

---

### **TEST 7: Service Methods - Statistics** ⏱️ ~2 minutes

**Objective:** Test statistics functionality.

**Steps:**

```javascript
const stats = await FavoritesService.getMyCellarStats();
console.log('My Cellar Stats:', stats);
// Expected: Object with total, wantToTry, haveTried, favorites, averageRating
```

**Success Criteria:**
- ✅ Stats object returned
- ✅ All counts are accurate
- ✅ Average rating calculated correctly (if wines have ratings)

---

### **TEST 8: Service Methods - Filtering** ⏱️ ~5 minutes

**Objective:** Test enhanced filtering.

**Steps:**

```javascript
// Test filter by status
const wantToTry = await FavoritesService.getFavoritesFiltered({ status: 'wantToTry' });
console.log('Filtered by wantToTry:', wantToTry.length);

// Test filter by tags
const withTags = await FavoritesService.getFavoritesFiltered({ tags: ["Special Occasions"] });
console.log('Filtered by tag:', withTags.length);

// Test filter by rating
const ratedWines = await FavoritesService.getFavoritesFiltered({ minRating: 4 });
console.log('Filtered by min rating 4:', ratedWines.length);

// Test combined filters
const combined = await FavoritesService.getFavoritesFiltered({
  status: 'favorite',
  minRating: 3,
  tags: ["Special Occasions"]
});
console.log('Combined filters:', combined.length);
```

**Success Criteria:**
- ✅ Status filter works
- ✅ Tag filter works
- ✅ Rating filter works
- ✅ Combined filters work

---

### **TEST 9: UI Components - StarRating** ⏱️ ~5 minutes

**Objective:** Test StarRating component.

**Steps:**

1. **Create Test Screen:**
   - Create a temporary test file: `src/screens/TestStarRating.tsx`
   - Copy the code below:

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StarRating from '../components/myCellar/StarRating';

export default function TestStarRating() {
  const [rating, setRating] = useState(0);

  return (
    <View style={styles.container}>
      <StarRating
        rating={rating}
        onRatingChange={setRating}
        showLabel={true}
      />
      <StarRating
        rating={3.5}
        readonly={true}
        showLabel={true}
        size={32}
      />
      <StarRating
        rating={5}
        readonly={true}
        color="#FF0000"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});
```

2. **Test:**
   - Navigate to this test screen
   - **Expected:**
     - First rating is interactive (tap stars to change)
     - Second shows 3.5 stars (half star visible)
     - Third shows 5 red stars (readonly)
   - Tap stars on first rating
   - **Expected:** Rating updates, label shows new value

**Success Criteria:**
- ✅ Component renders without errors
- ✅ Interactive mode works
- ✅ Readonly mode works
- ✅ Half stars display correctly
- ✅ Custom colors work
- ✅ Label updates correctly

---

### **TEST 10: UI Components - StatusBadge** ⏱️ ~3 minutes

**Objective:** Test StatusBadge component.

**Steps:**

1. **Create Test Screen:**
   ```typescript
   import React from 'react';
   import { View, StyleSheet } from 'react-native';
   import StatusBadge from '../components/myCellar/StatusBadge';

   export default function TestStatusBadge() {
     return (
       <View style={styles.container}>
         <StatusBadge status="wantToTry" />
         <StatusBadge status="haveTried" />
         <StatusBadge status="favorite" />
         <StatusBadge status="wantToTry" size="small" />
         <StatusBadge status="haveTried" size="large" />
         <StatusBadge status="favorite" showLabel={false} />
       </View>
     );
   }
   ```

2. **Test:**
   - Navigate to test screen
   - **Expected:**
     - Three badges with different colors (blue, green, red)
     - Different sizes render correctly
     - Badge without label shows only icon

**Success Criteria:**
- ✅ All statuses render correctly
- ✅ Colors match design system
- ✅ Sizes work correctly
- ✅ Label toggle works

---

### **TEST 11: UI Components - StatusSelector** ⏱️ ~3 minutes

**Objective:** Test StatusSelector component.

**Steps:**

1. **Create Test Screen:**
   ```typescript
   import React, { useState } from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   import StatusSelector from '../components/myCellar/StatusSelector';

   export default function TestStatusSelector() {
     const [status, setStatus] = useState<'wantToTry' | 'haveTried' | 'favorite'>('favorite');

     return (
       <View style={styles.container}>
         <Text>Current Status: {status}</Text>
         <StatusSelector
           currentStatus={status}
           onStatusChange={setStatus}
         />
       </View>
     );
   }
   ```

2. **Test:**
   - Navigate to test screen
   - Tap different status options
   - **Expected:** Selected status updates, visual feedback shows selection

**Success Criteria:**
- ✅ Component renders
- ✅ Selection works
- ✅ Visual feedback is clear
- ✅ Callback fires correctly

---

### **TEST 12: UI Components - NotesInput** ⏱️ ~3 minutes

**Objective:** Test NotesInput component.

**Steps:**

1. **Create Test Screen:**
   ```typescript
   import React, { useState } from 'react';
   import { View, StyleSheet } from 'react-native';
   import NotesInput from '../components/myCellar/NotesInput';

   export default function TestNotesInput() {
     const [notes, setNotes] = useState('');

     return (
       <View style={styles.container}>
         <NotesInput
           label="Wine Notes"
           value={notes}
           onChangeText={setNotes}
           maxLength={200}
         />
       </View>
     );
   }
   ```

2. **Test:**
   - Type in the input
   - **Expected:**
     - Character counter updates
     - Focus state changes border color
     - Text saves correctly

**Success Criteria:**
- ✅ Input works
- ✅ Character counter works
- ✅ Focus states work
- ✅ Max length enforced

---

### **TEST 13: UI Components - TagsInput** ⏱️ ~5 minutes

**Objective:** Test TagsInput component.

**Steps:**

1. **Create Test Screen:**
   ```typescript
   import React, { useState } from 'react';
   import { View, StyleSheet } from 'react-native';
   import TagsInput from '../components/myCellar/TagsInput';

   export default function TestTagsInput() {
     const [tags, setTags] = useState<string[]>([]);

     return (
       <View style={styles.container}>
         <TagsInput
           label="Tags"
           tags={tags}
           onTagsChange={setTags}
           suggestions={["Date Night", "Special Occasions", "Dinner Party", "Everyday"]}
         />
       </View>
     );
   }
   ```

2. **Test:**
   - Type a tag name and press Enter/Submit
   - **Expected:** Tag added as chip
   - Tap X on tag chip
   - **Expected:** Tag removed
   - Type partial tag name
   - **Expected:** Suggestions appear
   - Tap suggestion
   - **Expected:** Tag added

**Success Criteria:**
- ✅ Add tags works
- ✅ Remove tags works
- ✅ Suggestions appear
- ✅ Suggestions can be selected
- ✅ Duplicate tags prevented

---

### **TEST 14: Backward Compatibility** ⏱️ ~5 minutes

**Objective:** Ensure existing code still works.

**Steps:**

1. **Test Existing Favorites Screen:**
   - Navigate to Favorites screen
   - **Expected:** Screen loads without errors
   - Add a favorite from Home screen
   - **Expected:** Favorite appears in Favorites screen
   - Remove a favorite
   - **Expected:** Favorite removed successfully

2. **Test Existing Wine Cards:**
   - Check that wine cards still display correctly
   - **Expected:** No visual regressions

3. **Test Service Calls:**
   ```javascript
   // Old method names should still work
   const favorites = await FavoritesService.getFavorites();
   console.log('Old method works:', favorites.length > 0);
   ```

**Success Criteria:**
- ✅ Existing screens work
- ✅ Existing functionality preserved
- ✅ No breaking changes
- ✅ Old method names still work

---

## 🐛 **KNOWN ISSUES / LIMITATIONS**

None identified yet - report any issues found during testing.

---

## 📊 **TEST RESULTS TEMPLATE**

Copy this template and fill it out as you test:

```
TEST RESULTS - My Cellar Rebranding
Date: ___________
Tester: ___________

TEST 1: Data Migration
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 2: Service Methods - Basic Operations
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 3: Service Methods - Status Management
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 4: Service Methods - Ratings
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 5: Service Methods - Notes
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 6: Service Methods - Tags
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 7: Service Methods - Statistics
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 8: Service Methods - Filtering
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 9: UI Components - StarRating
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 10: UI Components - StatusBadge
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 11: UI Components - StatusSelector
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 12: UI Components - NotesInput
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 13: UI Components - TagsInput
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

TEST 14: Backward Compatibility
Status: [ ] PASS [ ] FAIL
Notes: _________________________________

OVERALL STATUS: [ ] READY [ ] NEEDS FIXES

ISSUES FOUND:
1. _________________________________
2. _________________________________
3. _________________________________
```

---

## 🚨 **TROUBLESHOOTING**

### Issue: TypeScript Errors
**Solution:** Run `npx tsc --noEmit` to check for type errors. Ensure all imports are correct.

### Issue: Component Not Rendering
**Solution:** Check that component is imported correctly. Verify file path matches.

### Issue: Service Method Not Working
**Solution:** Check console for errors. Verify AsyncStorage is accessible. Check method name spelling.

### Issue: Data Not Persisting
**Solution:** Verify AsyncStorage permissions. Check that `saveToStorage` is being called.

### Issue: Migration Not Working
**Solution:** Check console logs. Verify both storage keys exist. Manually check AsyncStorage.

---

## ✅ **SIGN-OFF**

After completing all tests, document:
- Overall status
- Critical issues found
- Recommendations for next steps

---

**Good luck testing! 🧪**







