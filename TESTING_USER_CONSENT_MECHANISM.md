# Testing User Consent Mechanism (Task 1.2.2)

## Quick Access Methods

### Method 1: Programmatic Navigation (Quickest)
You can temporarily add navigation to test. Add this to any screen that has navigation:

```typescript
// In any screen component (e.g., HomeScreen or PreferencesScreen)
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
// Then add a button or call:
navigation.navigate('PrivacySettings');
```

### Method 2: Direct URL/Deep Link (Development)
If using Expo, you can test via deep link:
- iOS Simulator: `exp://localhost:8081/--/PrivacySettings`
- Android Emulator: `exp://localhost:8081/--/PrivacySettings`

### Method 3: Add a Test Button (Recommended for Testing)
Add a button to Preferences screen or Home screen temporarily.

---

## What to Test

### 1. **Consent Toggles**
- [ ] **Analytics Toggle**
  - Toggle ON → Should show confirmation alert
  - Toggle OFF → Should disable immediately
  - Check console logs: `Privacy settings saved: {...}`
  
- [ ] **Personalization Toggle**
  - Toggle ON/OFF → Should save immediately
  - Verify persistence after app restart
  
- [ ] **Marketing Toggle**
  - Toggle ON/OFF → Should save immediately
  - Verify persistence after app restart
  
- [ ] **Data Sharing Toggle**
  - Toggle ON/OFF → Should save immediately
  - Verify persistence after app restart

### 2. **Data Collection Policies Section**
- [ ] View all data collection policies
- [ ] Verify each policy shows:
  - Data type name
  - Purpose description
  - Retention period
  - Required vs Optional indicator
  - "Shared" badge (if applicable)

### 3. **Privacy Rights Actions**
- [ ] **View Full Privacy Policy**
  - Tap "View Full Privacy Policy" button
  - Should navigate to Privacy Policy screen
  - Should be able to navigate back
  
- [ ] **Export My Data (GDPR)**
  - Tap "Export My Data" button
  - Should show alert with:
    - Data types collected
    - Export date
    - Confirmation message
  - Check console for export data structure
  
- [ ] **Delete Non-Required Data**
  - Tap "Delete Non-Required Data" button
  - Should show confirmation alert
  - Confirm deletion
  - Should show success message
  - Verify non-required data policies are removed

### 4. **Persistence Testing**
- [ ] Change consent settings
- [ ] Close app completely
- [ ] Reopen app
- [ ] Navigate to Privacy Settings
- [ ] Verify all toggles reflect previous settings

### 5. **Edge Cases**
- [ ] Test with all toggles OFF
- [ ] Test with all toggles ON
- [ ] Test rapid toggle changes
- [ ] Test while offline (should still save locally)

---

## Verification Steps

### Check Console Logs
When testing, watch for these console messages:
```
✅ "Privacy settings saved: {...}" - When toggles change
✅ "Data collection recorded: {...}" - When data is collected (if consent given)
✅ "Privacy settings loaded" - On screen load
✅ "User data deleted: {...}" - When data is deleted
```

### Check AsyncStorage (Development)
You can inspect stored data using React Native Debugger or add a console log:

```typescript
// In PrivacySettingsScreen.tsx, add temporarily:
useEffect(() => {
  AsyncStorage.getItem('privacy_settings').then(data => {
    console.log('Stored Privacy Settings:', JSON.parse(data || '{}'));
  });
}, []);
```

### Verify PrivacyManager Integration
Check that `PrivacyManager` singleton is working:
```typescript
import PrivacyManager from '../utils/privacyManager';

const manager = PrivacyManager.getInstance();
const settings = await manager.getPrivacySettings();
console.log('Current Settings:', settings);
```

---

## Expected Behavior

### Consent Toggles
- ✅ All toggles start as OFF by default
- ✅ Toggling ON saves immediately
- ✅ Toggling OFF saves immediately
- ✅ Analytics toggle shows confirmation alert when enabled
- ✅ Settings persist across app restarts

### Data Policies
- ✅ Shows 4 default policies:
  - Wine Preferences (Required)
  - Wine Recommendations (Required)
  - Usage Analytics (Optional)
  - Favorite Wines (Required)
- ✅ Required policies cannot be toggled off
- ✅ Optional policies can be controlled

### GDPR Rights
- ✅ Export button shows data structure
- ✅ Delete button removes non-required data
- ✅ Privacy Policy link navigates correctly
- ✅ All actions complete without errors

---

## Troubleshooting

### Issue: Settings not persisting
**Solution:** Check AsyncStorage is working:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getItem('privacy_settings').then(console.log);
```

### Issue: Navigation error
**Solution:** Ensure you're inside NavigationContainer when navigating:
- Privacy Settings is only accessible from within the app navigation
- Cannot be accessed from gate screens (Age Verification, NDA, Terms)

### Issue: Toggles not updating
**Solution:** Check console for errors:
- Verify PrivacyManager instance is created
- Check AsyncStorage permissions
- Ensure screen is re-rendering after state changes

---

## Quick Test Script

```typescript
// Add this to a test button or console
const testPrivacySettings = async () => {
  const PrivacyManager = require('../utils/privacyManager').default;
  const manager = PrivacyManager.getInstance();
  
  // Test 1: Check current settings
  const settings = await manager.getPrivacySettings();
  console.log('Current Settings:', settings);
  
  // Test 2: Update analytics consent
  await manager.updateConsent({ analytics: true });
  console.log('Updated Analytics to true');
  
  // Test 3: Check consent for data type
  const hasConsent = manager.hasConsentFor('usage_analytics');
  console.log('Has consent for analytics:', hasConsent);
  
  // Test 4: Export data
  const exported = await manager.exportUserData();
  console.log('Exported Data:', exported);
};
```

---

## Next Steps After Testing

1. ✅ Verify all consent toggles work
2. ✅ Verify data persistence
3. ✅ Verify GDPR rights functions
4. ✅ Add navigation link from Preferences screen (optional)
5. ✅ Test with real data collection scenarios
6. ✅ Verify consent checks in data collection code

---

## Adding Permanent Navigation Link

To add a permanent link to Privacy Settings from Preferences screen:

```typescript
// In SimpleEnhancedPreferencesScreen.tsx or PreferencesScreen.tsx
import { useNavigation } from '@react-navigation/native';

// Add a button:
<TouchableOpacity
  onPress={() => navigation.navigate('PrivacySettings')}
  style={styles.privacyButton}
>
  <Text>Privacy Settings</Text>
</TouchableOpacity>
```

