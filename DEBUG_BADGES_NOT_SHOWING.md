# Debug: Status Badges Not Showing

**Issue:** Status badges not visible after reload  
**Date:** December 15, 2025

---

## ✅ **CHANGES MADE**

1. Simplified badge rendering to **always show** (no conditionals)
2. Default status is `'favorite'` if not present
3. Applied to both `GridWineCard` and `SimplePremiumWineCard`

---

## 🔍 **DEBUGGING STEPS**

### **Step 1: Verify Files Updated**
The changes are in:
- ✅ `src/components/favorites/GridWineCard.tsx` (line ~145)
- ✅ `src/components/SimplePremiumWineCard.tsx` (line ~148)

### **Step 2: Force Full Cache Clear**

**Option A: Metro Bundler Cache**
```bash
# Stop Expo (Ctrl+C)
npx expo start --clear
```

**Option B: Full Clean Start**
```bash
# Stop Expo
# Delete node_modules/.cache if it exists
# Then restart
npm start
```

**Option C: In App**
- Shake device → "Reload"
- OR Press `r` in Expo CLI terminal

### **Step 3: Check Console for Errors**

Look for:
- Import errors for `StatusBadge`
- Any rendering errors
- Type errors

### **Step 4: Verify Badge Component**

The StatusBadge component should render:
- **Small size**: 16px icon
- **No label**: Just the icon
- **Color**: Red for favorite

---

## 🧪 **TEST IN CONSOLE**

Add this temporary test in `SimpleEnhancedFavoritesScreen.tsx`:

```typescript
useEffect(() => {
  console.log('=== DEBUG: Wines Loaded ===');
  console.log('Total wines:', favorites.length);
  favorites.forEach((wine, idx) => {
    console.log(`Wine ${idx}:`, {
      name: wine.wineName,
      status: (wine as any).status || 'NO STATUS',
      hasStatusField: 'status' in wine,
    });
  });
}, [favorites]);
```

This will show if wines have the status field.

---

## 🚨 **COMMON ISSUES**

### **Issue 1: Expo Cache**
- **Fix**: Full cache clear (`npx expo start --clear`)
- **Verify**: Check that old code isn't running

### **Issue 2: Status Field Missing**
- **Fix**: Check migration ran (wines should have `status: 'favorite'`)
- **Verify**: Console logs will show status values

### **Issue 3: Badge Component Not Imported**
- **Fix**: Check imports in GridWineCard.tsx
- **Verify**: Look for import errors in console

### **Issue 4: Styling Hiding Badge**
- **Fix**: Check `statusBadgeContainer` styles
- **Verify**: Badge should be visible (red heart icon)

---

## ✅ **VERIFICATION CHECKLIST**

After cache clear:
- [ ] App reloaded completely
- [ ] No console errors
- [ ] Wines have status field (check console logs)
- [ ] StatusBadge component imports correctly
- [ ] Badge container has proper styles
- [ ] Red heart icons visible on cards

---

## 📝 **NEXT STEPS**

If badges still don't show:

1. **Check console logs** - Are wines loaded?
2. **Verify migration** - Do wines have status?
3. **Test StatusBadge component** - Render it standalone
4. **Check styling** - Is badge hidden by CSS?

---

**After cache clear, badges should be visible!** 🎉







