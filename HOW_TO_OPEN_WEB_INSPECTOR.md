# How to Open Web Inspector on MacBook

## Quick Steps

### 1. First, Make Sure Develop Menu is Enabled

**If you haven't done this yet:**

1. Open **Safari** on your MacBook
2. Click **Safari** in the menu bar (top left of screen)
3. Click **Settings** (or **Preferences** on older macOS)
4. Click the **Advanced** tab (at the top)
5. Check the box that says: **"Show features for web developers"**
6. Close the Settings window

**You should now see a "Develop" menu in the Safari menu bar.**

### 2. Connect Your iOS Device

1. Connect your iPad/iPhone to your MacBook using a USB cable
2. On your iOS device, if prompted, tap **"Trust This Computer"**
3. Enter your device passcode if asked

### 3. Open Your Website on iOS Device

1. On your iPad/iPhone, open **Safari**
2. Navigate to: `www.aperae.com`
3. Make sure the page loads completely

### 4. Open Web Inspector on MacBook

**Method 1: Using the Develop Menu (Recommended)**

1. On your MacBook, in Safari, look at the **menu bar** at the top
2. Click **Develop** (should be visible after Step 1)
3. You'll see a dropdown menu
4. Look for your device name (e.g., "John's iPad" or "iPhone")
5. Hover over your device name
6. You'll see a submenu showing all open Safari tabs on that device
7. Click on the tab showing `www.aperae.com`

**A new window will open** - this is the Web Inspector!

**Visual Guide:**
```
Safari Menu Bar:
File  Edit  View  History  Bookmarks  Develop  Window  Help
                                    ↑
                              Click here
                                    ↓
                            [Your Device Name] →
                                    ↓
                              [www.aperae.com] ← Click this
```

**Method 2: Keyboard Shortcut (If Available)**

- Press **Option + Command + I** while Safari is focused
- This may open Web Inspector for the current MacBook tab (not iOS device)
- Still better to use Method 1 for iOS device debugging

## What You Should See

After clicking on your website tab in the Develop menu:

- A **new window opens** (separate from Safari)
- The window is called **"Web Inspector"**
- It has tabs at the top: **Elements**, **Resources**, **Network**, **Timeline**, **Debugger**, **Console**
- This looks similar to Chrome DevTools

## Troubleshooting

### Problem: I don't see "Develop" in the menu bar

**Solution:**
- You need to enable it first (Step 1 above)
- Safari → Settings → Advanced → Check "Show features for web developers"
- Close and reopen Safari if it doesn't appear

### Problem: I see "Develop" but not my device

**Solutions:**
1. Make sure your iOS device is connected via USB
2. Unlock your iOS device
3. On iOS device: Settings → Safari → Advanced → Web Inspector should be ON
4. Try unplugging and replugging the USB cable
5. Make sure you trusted the computer on iOS device
6. Try refreshing the Safari page on iOS device

### Problem: I see my device but no tabs listed

**Solutions:**
1. Make sure Safari is open on your iOS device
2. Make sure a webpage is loaded (like www.aperae.com)
3. Refresh the page on iOS device
4. Try closing and reopening Develop menu on MacBook

### Problem: Web Inspector opens but shows nothing/blank

**Solutions:**
1. Make sure the webpage is fully loaded on iOS device
2. Refresh the page on iOS device
3. Close Web Inspector and reopen it from Develop menu
4. Try selecting a different tab from the Develop menu

## Step-by-Step Visual Walkthrough

```
Step 1: Enable Develop Menu
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MacBook Safari:
Safari → Settings → Advanced → ✅ Show features for web developers

Step 2: Connect Device
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
iPad/iPhone → USB Cable → MacBook
[Trust This Computer] on iOS device

Step 3: Open Website on iOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Safari on iPad/iPhone → www.aperae.com

Step 4: Open Web Inspector
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MacBook Safari Menu Bar:
Develop → [Your Device Name] → [www.aperae.com]

Result:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Web Inspector window opens with tabs:
[Elements] [Resources] [Network] [Timeline] [Debugger] [Console]
```

## Quick Checklist

Before opening Web Inspector, make sure:

- [ ] Develop menu is enabled in Safari settings
- [ ] iOS device is connected via USB
- [ ] iOS device is unlocked
- [ ] Web Inspector is enabled on iOS (Settings → Safari → Advanced)
- [ ] You trusted the computer on iOS device
- [ ] Safari is open on iOS device
- [ ] www.aperae.com is loaded on iOS device
- [ ] You can see "Develop" in Safari menu bar on MacBook

## Once Web Inspector Opens

1. **Click "Console" tab** - to see JavaScript errors
2. **Click "Network" tab** - to see API requests
3. **Clear logs** (trash icon) before testing
4. **Reproduce the issue** on your iOS device
5. **Watch the Console and Network tabs** for errors

That's it! The Web Inspector should now be open and ready to use.


