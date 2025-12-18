# Fixes Applied - My Cellar Issues

**Date:** December 15, 2025

---

## ✅ **FIX 1: Missing `updateWineTags` Method**

### **Issue:**
```
ERROR: FavoritesService.updateWineTags is not a function (it is undefined)
```

### **Root Cause:**
- `updateWineTags` method was missing from `FavoritesService`
- Service had `addTags` and `removeTags` but not `updateWineTags`

### **Fix Applied:**
- ✅ Added `updateWineTags` method to `src/services/favoritesService.ts`
- Method replaces all tags for a wine (simpler than add/remove)

**Location:** `src/services/favoritesService.ts` line ~1027

**Code Added:**
```typescript
static async updateWineTags(wineId: string, tags: string[]): Promise<void> {
  // Updates all tags for a wine
}
```

---

## ✅ **FIX 2: Keyboard Auto-Scroll for Text Inputs**

### **Issue:**
- Text inputs (Wine Notes, Pairing Notes) were blocked by keyboard
- No auto-scroll when keyboard appears
- User couldn't see what they were typing

### **Root Cause:**
- `KeyboardAvoidingView` was present but not working effectively
- No scroll-to-input logic when inputs are focused
- Missing refs and measurement logic

### **Fix Applied:**

#### **1. Added Refs:**
- ✅ `scrollViewRef` - Reference to ScrollView
- ✅ `wineNotesContainerRef` - Reference to Wine Notes container View
- ✅ `pairingNotesContainerRef` - Reference to Pairing Notes container View

#### **2. Updated ScrollView:**
- ✅ Added `ref={scrollViewRef}`
- ✅ Added `keyboardDismissMode="interactive"`
- ✅ Added `showsVerticalScrollIndicator={true}`

#### **3. Added Scroll-to-Input Logic:**
- ✅ Uses `measure()` method (same as home screen)
- ✅ Scrolls to input position when focused
- ✅ 300ms delay to allow keyboard animation
- ✅ 150px offset to show input above keyboard

**Location:** `src/components/FlipWineCard.tsx` lines 544-558, 579-593

**Code Pattern (same as home screen):**
```typescript
onFocus={() => {
  setTimeout(() => {
    containerRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, pageY - 150),
        animated: true,
      });
    });
  }, 300);
}}
```

#### **4. Updated NotesInput Component:**
- ✅ Added `onFocus` prop support
- ✅ Added `inputRef` prop support
- ✅ Calls `onFocus` callback when input is focused

**Location:** `src/components/myCellar/NotesInput.tsx`

---

## 🎯 **HOW IT WORKS NOW**

### **Tags:**
1. User taps tag badges
2. `TagsBadgeSelector` calls `onTagsChange`
3. `FlipWineCard` calls `FavoritesService.updateWineTags()`
4. ✅ Tags save successfully (no more error!)

### **Keyboard Auto-Scroll:**
1. User taps "Wine Notes" or "Pairing Notes" text input
2. Input gains focus → `onFocus` callback fires
3. After 300ms delay (keyboard animation):
   - Container View measures its position
   - ScrollView scrolls to show input above keyboard
4. ✅ User can see and type in the input field

---

## 🧪 **TESTING**

### **Tags:**
- [ ] Tap tag badges → Tags update
- [ ] No error in console
- [ ] Tags persist after reload

### **Keyboard Auto-Scroll:**
- [ ] Tap "Wine Notes" → Keyboard appears, input scrolls into view
- [ ] Tap "Pairing Notes" → Keyboard appears, input scrolls into view
- [ ] Can type and see text while keyboard is open
- [ ] Input is positioned above keyboard (not blocked)

---

## 📝 **TECHNICAL DETAILS**

### **Why `measure()` instead of `measureLayout()`?**
- `measure()` uses absolute screen coordinates (`pageY`)
- `measureLayout()` requires parent view reference (more complex)
- Home screen uses `measure()` - keeping consistency

### **Why 300ms delay?**
- Allows iOS keyboard animation to start
- Ensures accurate measurement after layout shift
- Matches home screen implementation

### **Why 150px offset?**
- Provides padding above input
- Ensures input is fully visible
- Accounts for header/navigation space

---

**Both fixes applied!** 🎉


