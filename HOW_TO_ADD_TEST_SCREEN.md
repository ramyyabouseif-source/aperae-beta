# How to Add Test Migration Screen

**Quick guide to add the test screen to your app**

---

## 📋 **STEP 1: The Test Screen is Already Created**

✅ File created: `src/screens/TestMigration.tsx`

You don't need to create it - it's already there!

---

## 📋 **STEP 2: Add to Navigation**

### **Option A: Add as a Stack Screen (Recommended)**

Open `App.tsx` and find where your screens are defined (look for `<Stack.Screen` or `<Tab.Screen`).

**Add this import at the top** (with other screen imports):

```typescript
import TestMigration from './src/screens/TestMigration';
```

**Then add this screen to your Stack Navigator** (find where other screens like `Home`, `Favorites` are defined):

```typescript
<Stack.Screen 
  name="TestMigration" 
  component={TestMigration}
  options={{ title: 'Test Migration' }}
/>
```

### **Option B: Temporarily Replace Favorites Screen**

If you want to test it quickly, you can temporarily replace the Favorites screen:

**Find this line:**
```typescript
import AdaptiveFavoritesScreen from './src/screens/AdaptiveFavoritesScreen';
```

**Change it to:**
```typescript
import TestMigration from './src/screens/TestMigration';
import AdaptiveFavoritesScreen from './src/screens/AdaptiveFavoritesScreen';
```

**Then find where Favorites screen is used:**
```typescript
<Tab.Screen 
  name="Favorites" 
  component={AdaptiveFavoritesScreen}
  // ...
/>
```

**Temporarily change to:**
```typescript
<Tab.Screen 
  name="Favorites" 
  component={TestMigration}  // <-- Changed temporarily
  // ...
/>
```

**Remember to change it back after testing!**

---

## 📋 **STEP 3: Navigate to Test Screen**

### **If you used Option A (Stack Screen):**

1. **From anywhere in your app**, you can navigate to it:
   - If you have a settings or debug menu, add a button
   - Or temporarily add a button in Favorites screen

**Add this button in Favorites screen temporarily:**

```typescript
// In AdaptiveFavoritesScreen.tsx or SimpleEnhancedFavoritesScreen.tsx
import { useNavigation } from '@react-navigation/native';

// In your component:
const navigation = useNavigation();

// Add a button somewhere visible:
<TouchableOpacity 
  onPress={() => navigation.navigate('TestMigration' as never)}
  style={{ padding: 10, backgroundColor: '#8B0000', borderRadius: 8, margin: 10 }}
>
  <Text style={{ color: 'white' }}>🧪 Test Migration</Text>
</TouchableOpacity>
```

### **If you used Option B (Replace Favorites):**

1. **Just navigate to the Favorites tab**
2. **You'll see the test screen instead**

---

## 📋 **STEP 4: Run the Test**

1. **Save your changes**
2. **The app should reload automatically** (if hot reload is enabled)
3. **Navigate to the test screen** (using method from Step 3)
4. **Tap the "▶ Run Verification" button**
5. **See the results displayed on screen**

---

## 🎯 **WHAT YOU'LL SEE**

After tapping the button, you'll see output like:

```
📊 VERIFICATION RESULTS
========================================

Found 5 wines in collection

🍷 FIRST WINE CHECK
----------------------------------------
Name: Test Wine
Producer: Test Producer
Vintage: 2024

🔍 CHECKING NEW FIELDS
----------------------------------------
Status field: ✅ YES
  → Value: "favorite"
Tags field: ✅ YES
  → Value: []
hasTried field: ✅ YES
  → Value: false
wantsToTry field: ✅ YES
  → Value: false
wineRating field: ✅ YES
pairingRating field: ✅ YES

📋 CHECKING ALL WINES
----------------------------------------

Wines with status: 5
Wines without status: 0
Total wines: 5

🎯 FINAL RESULT
========================================
✅ SUCCESS!

All wines have been migrated to My Cellar format.
The data structure is ready for new features.

📝 NOTE: The UI still shows "Favorites" instead of
"My Cellar" - that will be updated in the next step.
```

---

## ✅ **SUCCESS INDICATORS**

**✅ Migration worked if you see:**
- "✅ YES" for Status field
- "✅ YES" for Tags field  
- Status value shows: "favorite", "wantToTry", or "haveTried"
- "✅ SUCCESS!" at the bottom
- All wines have status

**❌ Migration didn't work if you see:**
- "❌ NO" for Status field
- "❌ NOT MIGRATED" at the bottom
- "0 wines with status"

---

## 🐛 **TROUBLESHOOTING**

### "Cannot find module"
- Make sure `src/screens/TestMigration.tsx` exists
- Check the import path matches your file structure

### "TestMigration is not a function"
- Make sure you exported it as `export default function TestMigration()`
- Check the import statement

### Screen doesn't appear
- Check that you added it to the navigator correctly
- Make sure navigation names match

---

## 🧹 **CLEANUP**

**After testing, remember to:**
1. Remove the test screen from navigation (if you used Option A)
2. Restore Favorites screen (if you used Option B)
3. Remove any temporary buttons you added

---

**Try this method - it's the easiest way to test!** 🚀


