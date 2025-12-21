# Mock Mode Testing Guide - Reverse Pairing System

**Date:** December 15, 2025

---

## ✅ **MOCK MODE IS READY FOR TESTING**

You can test the dish recommendation cards **right now** using mock data, before implementing the Master Chef prompt. The backend has been updated with complete mock data that matches the frontend structure.

---

## 🎯 **HOW TO ENABLE MOCK MODE**

### **Option 1: Frontend Mock Mode (Recommended for UI Testing)**

The frontend `DishService` will return mock data directly, bypassing the API call entirely.

**Set in `.env` file:**
```env
EXPO_PUBLIC_MOCK_MODE=true
```

**Or set in your environment:**
```bash
# Windows PowerShell
$env:EXPO_PUBLIC_MOCK_MODE="true"

# Windows CMD
set EXPO_PUBLIC_MOCK_MODE=true

# macOS/Linux
export EXPO_PUBLIC_MOCK_MODE=true
```

**Then restart your Expo app:**
```bash
npm start
```

### **Option 2: Backend Mock Mode**

The backend endpoint will return mock data instead of calling Claude API.

**Set in backend `.env` file:**
```env
MOCK_MODE=true
```

**Or set in Render environment variables:**
- Go to your Render dashboard
- Select your backend service
- Go to "Environment" tab
- Add/update: `MOCK_MODE=true`
- Redeploy

---

## 📋 **WHAT MOCK DATA INCLUDES**

The mock data provides **3 complete dish recommendations**:

### **1. Simple Dish: Grilled Ribeye Steak**
- ✅ Complete recipe (ingredients + steps)
- ✅ Cook time: 20 minutes
- ✅ Servings: 2
- ✅ Difficulty: Easy
- ✅ Pairing rationale
- ✅ Confidence score: 95%

### **2. Moderate Dish: Herb-Crusted Lamb Chops**
- ✅ Complete recipe (ingredients + steps)
- ✅ Cook time: 30 minutes
- ✅ Servings: 4
- ✅ Difficulty: Medium
- ✅ Pairing rationale
- ✅ Confidence score: 88%

### **3. Complex Dish: Braised Short Ribs with Red Wine Reduction**
- ✅ Complete recipe (ingredients + steps)
- ✅ Cook time: 4 hours
- ✅ Servings: 6
- ✅ Difficulty: Advanced
- ✅ Pairing rationale
- ✅ Confidence score: 92%

### **Plus:**
- ✅ Wine analysis summary
- ✅ Wine serving guidance
- ✅ Closing narrative

---

## 🧪 **TESTING CHECKLIST**

### **UI Components**
- [ ] Toggle between "Dish → Wine" and "Wine → Dish" modes
- [ ] Wine input field appears in "Wine → Dish" mode
- [ ] Enter any wine name (e.g., "2016 Malbec")
- [ ] Click "Get Dish Recommendations"
- [ ] Loading state displays correctly
- [ ] 3 dish cards appear with images
- [ ] Images cycle correctly (Simple/Moderate/Complex)
- [ ] Complexity badges display correctly (colors)
- [ ] Recipe sections expand/collapse
- [ ] Ingredients display correctly
- [ ] Steps display correctly
- [ ] Pairing rationale displays
- [ ] Confidence scores display
- [ ] Wine analysis card displays
- [ ] Closing narrative displays

### **Image Testing**
- [ ] Simple dish images cycle (2 images)
- [ ] Moderate dish images cycle (4 images)
- [ ] Complex dish images cycle (4 images)
- [ ] Images load correctly
- [ ] Fallback placeholder works if image fails

### **Interaction Testing**
- [ ] Tap dish card to expand recipe
- [ ] Tap again to collapse recipe
- [ ] Scroll through long recipes
- [ ] Keyboard appears/disappears correctly
- [ ] No crashes or errors

### **Error Handling**
- [ ] Empty wine input shows error
- [ ] Network errors handled gracefully
- [ ] Invalid responses handled

---

## 🔄 **TESTING WORKFLOW**

### **Step 1: Enable Mock Mode**
```bash
# In your .env file
EXPO_PUBLIC_MOCK_MODE=true
```

### **Step 2: Start App**
```bash
npm start
```

### **Step 3: Test Reverse Pairing**
1. Open app
2. Toggle to "Wine → Dish" mode
3. Enter wine: "2016 Clos de Oro Malbec Reserva"
4. Click "Get Dish Recommendations"
5. Verify 3 dish cards appear
6. Test expanding/collapsing recipes
7. Verify images display correctly

### **Step 4: Test Different Wines**
Try different wine names to ensure mock data works consistently:
- "Pinot Noir"
- "Chardonnay"
- "Cabernet Sauvignon"
- "Riesling"

---

## ✅ **ADVANTAGES OF TESTING FIRST**

1. **UI Validation**: Test all visual components before backend integration
2. **Type Safety**: Ensure TypeScript types match actual data structure
3. **Error Handling**: Test error states and edge cases
4. **Performance**: Verify card rendering and scrolling performance
5. **User Experience**: Test the complete user flow
6. **Image Loading**: Verify image cycling and fallbacks work

---

## 🚀 **AFTER TESTING**

Once you've verified everything works with mock data:

1. **Disable Mock Mode**: Set `EXPO_PUBLIC_MOCK_MODE=false` or remove it
2. **Implement Master Chef Prompt**: Add the prompt integration to backend
3. **Test with Real API**: Verify real Claude API responses work correctly
4. **Compare Results**: Ensure real data matches mock data structure

---

## 📝 **NOTES**

- **Mock data structure matches the expected API response format**
- **All 3 complexity levels are represented**
- **Complete recipe data for thorough testing**
- **Confidence scores included for UI testing**
- **Wine analysis included for summary card testing**

---

## 🎉 **READY TO TEST!**

The mock data is complete and ready. You can test the entire reverse pairing UI right now, then implement the Master Chef prompt once you're confident everything works.

**Recommendation:** Test with mock mode first, then implement the prompt. This ensures the UI is solid before integrating the AI backend.





