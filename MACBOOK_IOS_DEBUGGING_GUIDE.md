# MacBook iOS Safari Debugging Guide

## Overview

This guide walks you through debugging iOS Safari on your iPad/iPhone using a MacBook. This is the **official, native method** that Apple provides - no third-party tools needed!

## Prerequisites

- ✅ MacBook (any macOS version with Safari)
- ✅ iPad or iPhone (iOS device)
- ✅ USB cable to connect device to MacBook
- ✅ Both devices on the same Apple ID (not required, but helpful)

## Step-by-Step Instructions

### Step 1: Enable Web Inspector on iOS Device

1. **On your iPad/iPhone:**
   - Open **Settings** app
   - Scroll down and tap **Safari**
   - Scroll down to the bottom
   - Tap **Advanced**
   - Toggle **Web Inspector** to **ON** (green)

   **Note:** Web Inspector is only available on iOS devices running iOS 6.0 or later.

### Step 2: Enable Develop Menu on MacBook Safari

1. **On your MacBook:**
   - Open **Safari** browser
   - Click **Safari** in the menu bar (top left)
   - Click **Settings** (or **Preferences** on older macOS)
   - Click the **Advanced** tab
   - Check the box: **"Show features for web developers"**
   - Close the Settings window

   **Note:** You should now see a **"Develop"** menu in the Safari menu bar.

### Step 3: Connect iOS Device to MacBook

1. **Connect your iPad/iPhone to your MacBook using a USB cable**

2. **On your iOS device:**
   - If you see a prompt asking "Trust This Computer?", tap **Trust**
   - Enter your device passcode if prompted

3. **Verify connection:**
   - On MacBook, open **Safari**
   - Click **Develop** in the menu bar
   - You should see your device name (e.g., "John's iPad" or "iPhone")
   - If you don't see your device, try:
     - Unplugging and replugging the USB cable
     - Unlocking your iOS device
     - Ensuring Web Inspector is enabled (Step 1)

### Step 4: Open Your Website on iOS Device

1. **On your iPad/iPhone:**
   - Open **Safari** browser
   - Navigate to your website: `www.aperae.com`
   - Make sure the page is fully loaded

2. **Optional:** If you want to test with debug mode:
   - Navigate to: `www.aperae.com?debug=1`

### Step 5: Open Safari Web Inspector on MacBook

1. **On your MacBook:**
   - In Safari, click **Develop** in the menu bar
   - You should see your device name (e.g., "John's iPad")
   - Hover over your device name
   - You'll see a list of open Safari tabs/windows
   - Click on the tab showing `www.aperae.com`

2. **Web Inspector window opens:**
   - A new window opens with Safari Web Inspector
   - This is similar to Chrome DevTools
   - You'll see tabs at the top: Elements, Resources, Network, Timeline, Debugger, Console

### Step 6: Using Safari Web Inspector

#### Console Tab (For JavaScript Errors)
1. Click the **Console** tab
2. You'll see all JavaScript logs, errors, and warnings
3. Look for:
   - Red errors (these are important!)
   - Yellow warnings
   - Console.log messages from your app

#### Network Tab (For API Requests)
1. Click the **Network** tab
2. You'll see all HTTP/HTTPS requests
3. To test your pairing assistants:
   - Clear the network log (trash icon)
   - On your iPad, try using "Dish → Wine" or "Wine → Dish"
   - Watch the Network tab for requests to `/api/recommendations` or `/api/dish-recommendations`
   - Click on a request to see:
     - Request headers
     - Request body
     - Response status code
     - Response body
     - Timing information

#### Elements Tab (For DOM Inspection)
1. Click the **Elements** tab
2. Inspect HTML elements on the page
3. Useful for checking if components rendered correctly

#### Debugger Tab (For JavaScript Debugging)
1. Click the **Debugger** tab
2. Set breakpoints in JavaScript code
3. Step through code execution
4. Inspect variables

### Step 7: Reproduce the Issue

1. **Clear the Console:**
   - Click the trash icon (🗑️) in the Console tab to clear existing logs

2. **Clear the Network log:**
   - Click the trash icon in the Network tab

3. **On your iPad/iPhone:**
   - Try to reproduce the issue:
     - Use "Dish → Wine" pairing assistant
     - Use "Wine → Dish" pairing assistant
     - Try Menu Screen pairing assistant
   - Watch the Console and Network tabs on your MacBook

4. **What to look for:**
   - **Console errors:** Any red error messages
   - **Network failures:** Requests that show red (failed) status
   - **Network timeouts:** Requests that take too long (>90 seconds)
   - **CORS errors:** Errors mentioning "CORS" or "Access-Control"
   - **Timeout errors:** Errors mentioning "timeout" or "aborted"

## What to Check When Debugging Your Pairing Assistant Issues

### 1. Console Errors
Look for these specific errors:
- `Network request failed`
- `Failed to fetch`
- `Request timeout`
- `CORS policy`
- `AbortController`
- Any errors related to `expo-file-system` (Menu Screen OCR)

### 2. Network Requests
Check these endpoints:
- `POST /api/recommendations` (Dish → Wine)
- `POST /api/dish-recommendations` (Wine → Dish)
- `POST /api/ocr` (Menu Screen OCR)

For each request, check:
- **Status Code:** Should be 200 (success) or look for 400, 500, etc.
- **Request Headers:** Check if required headers are present
- **Request Body:** Verify the data being sent
- **Response:** Check if response contains expected data
- **Timing:** How long the request takes (should be <90 seconds)

### 3. Request Timing
- **If request fails immediately (< 1 second):**
  - Likely a CORS issue
  - Check request headers
  - Check browser console for CORS errors

- **If request fails after 30-60 seconds:**
  - Likely a timeout issue
  - Check if timeout is set correctly (should be 90 seconds)
  - Check backend logs for processing time

- **If request fails after 90+ seconds:**
  - Request exceeded timeout limit
  - Backend may be processing too slowly
  - Check backend logs

## Common Issues and Solutions

### Issue: Device Not Showing in Develop Menu

**Solutions:**
1. Ensure Web Inspector is enabled on iOS device (Step 1)
2. Unlock your iOS device
3. Unplug and replug USB cable
4. Trust the computer on iOS device
5. Restart Safari on MacBook
6. Try a different USB cable
7. Check if device is charging (connection is working)

### Issue: Web Inspector Opens But Shows Nothing

**Solutions:**
1. Make sure the webpage is fully loaded on iOS device
2. Refresh the page on iOS device
3. Close and reopen Web Inspector
4. Try selecting a different tab from Develop menu

### Issue: Console Shows No Errors But App Doesn't Work

**Check:**
1. Network tab for failed requests
2. Response bodies for error messages
3. Request timing (may be timing out)
4. Try with Network tab open to see all requests

### Issue: Can't See Network Requests

**Solutions:**
1. Clear network log
2. Reproduce the issue after clearing
3. Make sure you're looking at the correct tab
4. Check filter settings (should show "All" requests)

## Taking Screenshots and Saving Logs

### Screenshot Console Errors:
1. Right-click in Console tab
2. Select "Save As..." or use Cmd+Shift+4 to take screenshot
3. Save for later reference

### Export Network Requests:
1. In Network tab, right-click on a request
2. Select "Copy as cURL" to get the exact request
3. Or take a screenshot of the request/response

### Save Console Log:
1. In Console tab, select all text (Cmd+A)
2. Copy (Cmd+C)
3. Paste into a text file

## Testing Workflow

### Recommended Testing Order:

1. **Clear all logs** (Console and Network)

2. **Test Dish → Wine:**
   - On iPad: Enter a dish name, click "Get Wine Recommendation"
   - On MacBook: Watch Console and Network tabs
   - Note any errors or failed requests
   - Check response time

3. **Test Wine → Dish:**
   - On iPad: Enter a wine name, click "Get Dish Recommendation"
   - On MacBook: Watch Console and Network tabs
   - Note any errors or failed requests
   - Check response time

4. **Test Menu Screen:**
   - On iPad: Take a photo or upload menu image
   - On MacBook: Watch Console and Network tabs
   - Check for OCR errors (expo-file-system issues)
   - Check OCR request timing

5. **Document findings:**
   - Screenshot errors
   - Note error messages
   - Note timing information
   - Note which requests fail

## Advanced: Setting Breakpoints

If you want to debug JavaScript code execution:

1. Open **Debugger** tab
2. Find your JavaScript file (may be minified)
3. Click on a line number to set a breakpoint
4. Reproduce the issue
5. Code execution will pause at the breakpoint
6. You can inspect variables and step through code

**Note:** If code is minified, it may be hard to read. Look for source maps if available.

## Quick Reference Checklist

Before starting:
- [ ] Web Inspector enabled on iOS device
- [ ] Develop menu enabled in Safari on MacBook
- [ ] iOS device connected via USB
- [ ] Device trusted on MacBook
- [ ] Website loaded on iOS device
- [ ] Web Inspector open on MacBook

When testing:
- [ ] Console tab open
- [ ] Network tab open
- [ ] Logs cleared before testing
- [ ] Reproducing the issue
- [ ] Documenting errors
- [ ] Taking screenshots

## Next Steps After Debugging

Once you've identified the issue:

1. **Note the exact error message**
2. **Note which request fails** (URL, method, status code)
3. **Note timing** (when does it fail?)
4. **Take screenshots** of Console and Network tabs
5. **Copy error messages** for reference
6. **Share findings** so we can implement fixes

## Tips for Success

1. **Keep Web Inspector open** while testing
2. **Clear logs before each test** for cleaner output
3. **Test one feature at a time** (Dish→Wine, then Wine→Dish, etc.)
4. **Note the exact sequence** that causes the error
5. **Take screenshots** of important errors
6. **Test on both WiFi and Mobile Data** to rule out network issues

## Summary

This is the **official, native method** for debugging iOS Safari - no third-party tools needed! Just:
1. Enable Web Inspector on iOS
2. Enable Develop menu on Mac Safari
3. Connect devices via USB
4. Open Web Inspector from Develop menu
5. Use Console and Network tabs to debug

You'll be able to see all JavaScript errors, network requests, and responses in real-time!


