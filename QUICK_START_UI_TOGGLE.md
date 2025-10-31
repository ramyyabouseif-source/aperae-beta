# 🚀 Quick Start: UI Toggle Implementation

## ⚡ **5-Minute Setup**

### **Step 1: Update App.tsx (1 minute)**
Replace the HomeScreen import:

```typescript
// In App.tsx, change this line:
import HomeScreen from './src/screens/HomeScreen';

// To this:
import AdaptiveHomeScreen from './src/screens/AdaptiveHomeScreen';

// And update the Stack.Screen:
<Stack.Screen 
  name="Home" 
  component={AdaptiveHomeScreen}  // Changed from HomeScreen
  options={{ title: 'PocketSomm' }}
/>
```

### **Step 2: Test the Toggle (30 seconds)**
Check current status:
```bash
npm run ui:status
```

Switch to enhanced design:
```bash
npm run ui:enhanced
```

Switch back to original:
```bash
npm run ui:original
```

### **Step 3: Restart App (30 seconds)**
After toggling, restart your development server:
```bash
# Stop current server (Ctrl+C)
npm start
```

## 🎛️ **Manual Toggle (Alternative)**

If you prefer manual control, edit `src/config/uiConfig.ts`:

```typescript
// Change this line to switch designs:
export const UI_VERSION: UIVersion = 'enhanced'; // or 'original'
```

## 🎯 **What You'll See**

### **Enhanced Mode** (`npm run ui:enhanced`)
- 🎨 Modern wine-inspired design
- ✨ Smooth animations and micro-interactions
- 🍷 Rich wine cards with images
- 🚀 Hero section with engaging layout
- ⚡ Quick action buttons

### **Original Mode** (`npm run ui:original`)
- 📱 Your current clean design
- 🔧 Simple, functional interface
- 🎯 Original color scheme
- 📝 Basic wine cards

## 🔄 **Easy Switching**

```bash
# Switch to enhanced design
npm run ui:enhanced
npm start

# Switch back to original
npm run ui:original
npm start

# Check current status
npm run ui:status
```

## ✅ **That's It!**

You now have a complete UI toggle system that lets you:
- ✅ Switch between designs with one command
- ✅ Test both versions easily
- ✅ Revert instantly if needed
- ✅ Keep both designs in your codebase

## 🎉 **Next Steps**

1. **Test Enhanced Design**: Use `npm run ui:enhanced` and try the app
2. **Compare Experiences**: Switch back and forth to compare
3. **Make Decision**: Choose which design you prefer
4. **Keep System**: The toggle system stays for future iterations

**Happy testing!** 🍷✨




