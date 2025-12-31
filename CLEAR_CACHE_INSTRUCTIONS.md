# Clear Expo Cache - Status Badges Fix

**Issue:** Changes not appearing after reload  
**Solution:** Full cache clear required

---

## 🚀 **QUICK FIX**

### **Step 1: Stop Expo**
Press `Ctrl+C` in the terminal where Expo is running

### **Step 2: Clear Cache and Restart**
```bash
npx expo start --clear
```

### **Step 3: Reload App**
- Shake device → Tap "Reload"
- OR Press `r` in the Expo terminal

---

## 🔄 **IF STILL NOT WORKING**

### **Full Nuclear Option:**

1. **Stop Expo completely** (`Ctrl+C`)

2. **Delete cache folders** (optional):
   ```bash
   # Delete Metro cache
   rm -rf .expo
   rm -rf node_modules/.cache
   
   # Or on Windows PowerShell:
   Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   ```

3. **Restart with clear:**
   ```bash
   npx expo start --clear
   ```

4. **Reload app** (shake device → Reload)

---

## ✅ **WHAT TO EXPECT**

After clearing cache:
- ✅ Status badges (red heart icons) on ALL wine cards
- ✅ "My Cellar" title (already working)
- ✅ Statistics dashboard (already working)
- ✅ Filter buttons (already working)

---

## 🔍 **VERIFY CHANGES**

The status badges should appear:
- **Location**: Below the producer/vintage text on each wine card
- **Appearance**: Small red heart icon (16px)
- **All wines**: Should show badge (defaults to "favorite")

---

**After `npx expo start --clear`, the badges should be visible!** 🎉







