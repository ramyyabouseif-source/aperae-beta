# Mobile Web Troubleshooting Guide

## Issue
Dish → Wine and Wine → Dish pairing assistants failing on mobile devices (but working on desktop web).

## Step 1: Gather Diagnostic Information

### A. Check Browser Console Logs on Mobile Device

1. **Connect mobile device to desktop:**
   - **Android**: Chrome DevTools Remote Debugging
     - Enable USB Debugging on phone
     - Connect via USB
     - Open `chrome://inspect` on desktop Chrome
     - Select your device and inspect the webpage
   
   - **iOS**: Safari Web Inspector
     - Enable Web Inspector: Settings > Safari > Advanced > Web Inspector
     - Connect iPhone to Mac via USB
     - On Mac Safari: Develop > [Your iPhone] > [Webpage]

2. **Look for these specific error patterns:**
   - Network errors (CORS, timeout, connection refused)
   - JavaScript errors
   - Certificate/SSL errors
   - AbortController/timeout errors

### B. Check Network Tab

Look for:
- Failed requests (red in Network tab)
- Request status codes (404, 500, timeout)
- Request/response headers
- Request payloads
- Response bodies (even for errors)

### C. Compare Desktop vs Mobile

Run the same request on desktop and mobile, compare:
- Request headers
- Response status codes
- Response times
- Error messages

## Step 2: Common Mobile-Specific Issues

### Issue 1: Network Timeout (Most Likely)

**Symptoms:**
- Requests fail immediately or after ~30-90 seconds
- Console shows "AbortError" or "timeout"
- Works on WiFi but fails on mobile data

**Current timeout settings:**
- SecureHttpClient default: 90 seconds (90000ms)
- WineService/DishService: Uses SecureHttpClient timeout

**Mobile networks are slower:**
- API calls can take 30-90+ seconds
- Mobile data can be unreliable
- Timeouts may occur before response arrives

**Potential fixes:**
1. Increase timeout for mobile devices
2. Add better error handling/retry logic
3. Show loading indicators with progress

### Issue 2: CORS Issues on Mobile Browsers

**Symptoms:**
- Preflight OPTIONS requests succeed
- POST requests fail with CORS error
- Different behavior than desktop

**Check:**
- Are OPTIONS requests succeeding? (they should be)
- Are POST requests being blocked?
- Are headers being sent correctly?

### Issue 3: Touch Event Handling

**Symptoms:**
- Buttons don't respond to taps
- Input fields don't focus
- Interactions seem broken

**Check:**
- Are click handlers being triggered?
- Are touch events being captured?
- Is there CSS blocking interactions (pointer-events: none)?

### Issue 4: Viewport/UI Issues

**Symptoms:**
- Buttons are off-screen or too small to tap
- Input fields are hidden or inaccessible
- Layout is broken

**Check:**
- Viewport meta tag is correct
- Touch target sizes (should be at least 44x44px)
- Layout works on mobile viewport sizes

### Issue 5: Service Worker/Cache Issues

**Symptoms:**
- Old code is running
- Changes don't appear
- Cached responses

**Fix:**
- Clear browser cache on mobile
- Unregister service workers
- Hard refresh (Ctrl+Shift+R on desktop, but mobile needs different steps)

## Step 3: Quick Diagnostic Checklist

Run through this checklist and note results:

- [ ] **Network connection**: WiFi vs Mobile Data (test both)
- [ ] **Browser**: Chrome vs Safari (test both if possible)
- [ ] **Device**: iOS vs Android (if you have both)
- [ ] **Console errors**: What errors appear?
- [ ] **Network requests**: Do they appear in Network tab?
- [ ] **Request status**: What status codes?
- [ ] **Timeout duration**: How long before failure?
- [ ] **Error messages**: Exact error text?
- [ ] **Button clicks**: Do they register in console?
- [ ] **API endpoint**: Is it being called correctly?

## Step 4: Enable Enhanced Logging

Add these temporary logs to identify the failure point:

### In Browser Console (before testing):
```javascript
// Monitor all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('[FETCH DEBUG]', args[0], args[1]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('[FETCH RESPONSE]', args[0], response.status, response.statusText);
      return response;
    })
    .catch(error => {
      console.error('[FETCH ERROR]', args[0], error);
      throw error;
    });
};

// Monitor AbortController
const originalAbortController = window.AbortController;
window.AbortController = class extends originalAbortController {
  constructor() {
    super();
    console.log('[ABORT CONTROLLER] Created');
  }
  abort() {
    console.log('[ABORT CONTROLLER] Aborted');
    super.abort();
  }
};
```

## Step 5: Test Specific Scenarios

### Test 1: Network Speed Simulation
- Test on slow 3G connection (Chrome DevTools > Network > Throttling)
- Test on fast WiFi
- Compare behavior

### Test 2: Direct API Call
Try calling the API directly from mobile browser console:
```javascript
fetch('https://api.aperae.com/api/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'PocketSomm'
  },
  body: JSON.stringify({
    dish: 'Chicken Parmesan',
    preferences: {}
  })
})
.then(r => r.json())
.then(d => console.log('SUCCESS:', d))
.catch(e => console.error('ERROR:', e));
```

### Test 3: Timeout Test
Check if requests are timing out:
```javascript
const start = Date.now();
fetch('https://api.aperae.com/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dish: 'Test', preferences: {} })
})
.then(() => console.log('Time:', Date.now() - start, 'ms'))
.catch(e => console.error('Failed after:', Date.now() - start, 'ms', e));
```

## Step 6: Collect Data

When reporting issues, include:

1. **Device Info:**
   - Device model (e.g., iPhone 12, Samsung Galaxy S21)
   - OS version (e.g., iOS 17.0, Android 13)
   - Browser (e.g., Safari 17.0, Chrome 120)

2. **Network Info:**
   - Connection type (WiFi, 4G, 5G)
   - Network speed (if known)

3. **Error Details:**
   - Exact error message
   - Stack trace (if available)
   - Network request details (from Network tab)
   - Console logs (all logs around the failure)

4. **Steps to Reproduce:**
   - Exact steps that trigger the issue
   - Input values used
   - Timing (how long before failure)

5. **Comparison:**
   - Does it work on desktop? (Yes/No)
   - Does it work on mobile WiFi? (Yes/No)
   - Does it work on mobile data? (Yes/No)

## Next Steps

Once you have the diagnostic information, we can:
1. Identify the specific failure point
2. Determine if it's network-related, code-related, or configuration-related
3. Implement targeted fixes

Please collect the diagnostic information and share:
- Console logs from mobile device
- Network request details
- Error messages
- Device/browser information


