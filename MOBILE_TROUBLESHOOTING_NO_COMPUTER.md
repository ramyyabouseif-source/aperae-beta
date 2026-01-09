# Mobile Web Troubleshooting (Without Computer Connection)

## Method 1: Enhanced Error Display (Already in App)

The app already shows error messages on-screen. When an error occurs, look for:
- Red/yellow error banners
- Error messages with details
- "Try Again" buttons

**What to note:**
- The exact error message text
- Any status codes mentioned (like "500", "Timeout", "Network error")
- When the error occurs (immediately, after 30s, after 90s, etc.)

## Method 2: Mobile Browser Console Access

### Chrome (Android)
1. Open Chrome on your phone
2. Go to `chrome://inspect` on your desktop (if you have access to any computer)
3. OR use **Eruda** console (see Method 4 below)

### Safari (iOS) - Limited Options
- Safari on iOS doesn't have built-in console access without Mac
- Use Eruda (Method 4) instead

## Method 3: Take Screenshots/Videos

When the error occurs:
1. **Take a screenshot** of the error message
2. **Note the timing**: How long did it take before the error?
3. **Note the network**: WiFi or Mobile Data?
4. **Note what you were doing**: Which pairing assistant? What input did you enter?

**Key Information to Capture:**
- Error message text (exact wording)
- Time before error (e.g., "failed immediately" or "failed after 60 seconds")
- Network type (WiFi vs Mobile Data)
- Device info (iPhone model, Android model)
- Browser (Safari, Chrome, etc.)
- What you were testing (Dish → Wine, Wine → Dish, etc.)

## Method 4: Use Eruda Console (Recommended)

Eruda is a mobile-friendly console that works directly in the browser.

### Add Eruda to the App

We can add Eruda to show a console directly on the mobile device. This would:
- Show all console.log/error messages
- Show network requests
- Allow you to run JavaScript commands
- Work without computer connection

**To enable:** Add `?debug=1` to the URL (e.g., `www.aperae.com?debug=1`)

This would add a floating console button you can tap to see all logs.

## Method 5: Enhanced Error Details in UI

We can enhance the error display to show:
- More technical details (status codes, error types)
- A "Copy Error Details" button
- "Show More" button for full error information
- Request/response details

## Method 6: URL Parameter Debugging

Add debug mode via URL parameter:
- `www.aperae.com?debug=true` - Shows detailed logs on screen
- `www.aperae.com?verbose=true` - Shows all API request/response details

## Quick Diagnostic Questions

Answer these to help identify the issue:

1. **When does it fail?**
   - [ ] Immediately (within 1 second)
   - [ ] After 30-60 seconds
   - [ ] After 90+ seconds
   - [ ] Never completes (stays loading)

2. **What error message do you see?**
   - [ ] "Something went wrong"
   - [ ] "Request timed out"
   - [ ] "Network error"
   - [ ] "Failed to fetch"
   - [ ] Other: _______________

3. **Network type:**
   - [ ] WiFi
   - [ ] Mobile Data (4G/5G)
   - [ ] Tested both? (Which works/both fail?)

4. **Device/Browser:**
   - Device: _______________
   - Browser: _______________
   - OS Version: _______________

5. **Which pairing assistants fail?**
   - [ ] Dish → Wine (Home Screen)
   - [ ] Wine → Dish (Home Screen)
   - [ ] Dish → Wine (Menu Screen)
   - [ ] All of them

6. **Does it work on desktop web?**
   - [ ] Yes
   - [ ] No
   - [ ] Haven't tested

## Recommended Next Steps

1. **Try the pairing assistant and note:**
   - Screenshot the error message
   - Note how long it took before error
   - Note WiFi vs Mobile Data

2. **Share the information:**
   - Error message text
   - Timing information
   - Network type
   - Device/browser info

3. **We can then:**
   - Add Eruda console for on-device debugging
   - Enhance error messages with more details
   - Add debug mode via URL parameter
   - Implement fixes based on the specific error pattern

## Immediate Actions You Can Take

1. **Clear browser cache:**
   - Chrome: Settings > Privacy > Clear browsing data
   - Safari: Settings > Safari > Clear History and Website Data

2. **Try different network:**
   - Test on WiFi vs Mobile Data
   - Test on different WiFi network

3. **Try different browser:**
   - If using Chrome, try Safari (or vice versa)
   - Try in incognito/private mode

4. **Try different device:**
   - If you have another mobile device, test there
   - Compare behavior

These comparisons will help identify if it's:
- Network-specific (only fails on mobile data)
- Browser-specific (only fails in Safari)
- Device-specific (only fails on one device)
- Universal (fails everywhere on mobile)

