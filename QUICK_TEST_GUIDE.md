# Quick Test Guide - My Cellar Features

**Quick reference for testing the new My Cellar features**

---

## 🚀 **QUICK START**

### Option 1: Test via React Native Debugger Console

1. Open React Native Debugger
2. Open Console tab
3. Copy/paste test code below

### Option 2: Create Test Screen

1. Create `src/screens/TestMyCellar.tsx`
2. Add to navigation temporarily
3. Test UI components visually

---

## 📝 **QUICK TESTS**

### **Test 1: Verify Migration**
```javascript
// In console
import { FavoritesService } from './src/services/favoritesService';
const wines = await FavoritesService.getFavorites();
console.log('Wines count:', wines.length);
console.log('First wine:', wines[0]);
// Check: wines[0] should have 'status' field
```

### **Test 2: Add Wine with Status**
```javascript
const testWine = {
  wineName: "Quick Test Wine",
  producer: "Test",
  vintage: "2024",
  pricePoint: "$20",
  rationale: "Test",
  tastingNotes: { aromas: [], palate: "test", finish: "" },
  servingGuidance: "Test",
  expertRating: "unknown",
  retailerSuggestion: "Test",
  image: "unknown",
  storytellingElements: "Test"
};

await FavoritesService.addToFavorites(testWine);
const added = await FavoritesService.getFavorites();
const newWine = added.find(w => w.wineName === "Quick Test Wine");
console.log('New wine status:', newWine?.status); // Should be 'favorite'
console.log('Has tried:', newWine?.hasTried); // Should be false
```

### **Test 3: Update Status**
```javascript
const wine = await FavoritesService.getFavorites();
const testWine = wine.find(w => w.wineName === "Quick Test Wine");
if (testWine) {
  await FavoritesService.updateWineStatus(testWine.id, 'wantToTry');
  const updated = await FavoritesService.getFavoriteById(testWine.id);
  console.log('Updated status:', updated?.status); // Should be 'wantToTry'
}
```

### **Test 4: Add Rating**
```javascript
const wine = await FavoritesService.getFavorites();
const testWine = wine.find(w => w.wineName === "Quick Test Wine");
if (testWine) {
  await FavoritesService.updateWineRating(testWine.id, 4);
  const updated = await FavoritesService.getFavoriteById(testWine.id);
  console.log('Wine rating:', updated?.wineRating); // Should be 4
}
```

### **Test 5: Add Tags**
```javascript
const wine = await FavoritesService.getFavorites();
const testWine = wine.find(w => w.wineName === "Quick Test Wine");
if (testWine) {
  await FavoritesService.addTags(testWine.id, ["Date Night", "Test Tag"]);
  const updated = await FavoritesService.getFavoriteById(testWine.id);
  console.log('Tags:', updated?.tags); // Should be array with 2 tags
}
```

### **Test 6: Get Statistics**
```javascript
const stats = await FavoritesService.getMyCellarStats();
console.log('Stats:', stats);
// Should show: { total, wantToTry, haveTried, favorites, averageRating }
```

---

## 🎨 **VISUAL TESTS**

### **Test StarRating Component**

Create a simple test screen:

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StarRating from '../components/myCellar/StarRating';

export default function TestStarRating() {
  const [rating, setRating] = useState(0);
  
  return (
    <View style={styles.container}>
      <Text>Tap stars to rate:</Text>
      <StarRating rating={rating} onRatingChange={setRating} showLabel />
      <Text>Current rating: {rating}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
```

**Expected:** Stars are tappable, rating updates, label shows value.

---

## ✅ **SUCCESS CHECKLIST**

- [ ] Can get all wines
- [ ] Can add wine (gets default status)
- [ ] Can update status
- [ ] Can add rating
- [ ] Can add tags
- [ ] Can get statistics
- [ ] StarRating component renders
- [ ] StatusBadge component renders
- [ ] No console errors
- [ ] Existing favorites still work

---

## 🐛 **COMMON ISSUES**

**"Cannot find module"**
- Check file paths match exactly
- Ensure components are in `src/components/myCellar/`

**"Type error"**
- Run `npx tsc --noEmit` to check types
- Ensure imports use correct types

**"Service method not found"**
- Check method name spelling
- Ensure service is imported correctly

---

**Happy Testing! 🧪**


