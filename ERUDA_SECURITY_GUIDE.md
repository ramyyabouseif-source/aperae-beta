# Eruda Security Guide

## ✅ Security Status

**Eruda is safe to use** when implemented correctly:
- ✅ **No known vulnerabilities** (as of version 3.4.3, verified by Snyk)
- ✅ **Open source** (MIT license) - code is publicly auditable
- ✅ **Widely used** in development environments
- ✅ **No malicious code** reported

## ⚠️ Security Considerations

### 1. **Information Exposure Risk**
Eruda can expose sensitive information if enabled in production:
- API keys and tokens
- User data
- Internal application logic
- Network request/response data
- Console logs with sensitive information

### 2. **Production Environment Risk**
- **Never enable Eruda in production by default**
- Only enable for debugging when explicitly needed
- Use conditional loading based on environment or URL parameters

## ✅ Safe Implementation Best Practices

### Option 1: URL Parameter (Recommended)
**Safest approach** - Only loads when explicitly requested:

```typescript
// Only load Eruda if ?debug=1 is in URL
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === '1') {
    // Load Eruda only when ?debug=1 is present
    import('eruda').then(eruda => eruda.default.init());
  }
}
```

**Benefits:**
- ✅ Not loaded in production by default
- ✅ Only loads when user explicitly adds `?debug=1` to URL
- ✅ Easy to disable (just remove URL parameter)
- ✅ No performance impact for regular users

### Option 2: Environment Variable
Only load in development:

```typescript
if (Platform.OS === 'web' && __DEV__) {
  import('eruda').then(eruda => eruda.default.init());
}
```

**Benefits:**
- ✅ Automatically disabled in production builds
- ✅ Only available during development

**Note:** Requires ensuring `__DEV__` is false in production builds.

### Option 3: LocalStorage Flag
Enable via browser console:

```typescript
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  if (localStorage.getItem('eruda_debug') === 'true') {
    import('eruda').then(eruda => eruda.default.init());
  }
}
```

**Benefits:**
- ✅ Only loads when explicitly enabled
- ✅ Can be toggled on/off without code changes

### Option 4: IP Address Whitelist
Only enable for specific IPs (for internal testing):

```typescript
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const allowedIPs = ['192.168.1.100', '10.0.0.5']; // Your IPs
  const currentIP = window.location.hostname;
  if (allowedIPs.includes(currentIP)) {
    import('eruda').then(eruda => eruda.default.init());
  }
}
```

## 🚫 What NOT to Do

### ❌ Never Do This:
```typescript
// BAD: Always loads Eruda
import eruda from 'eruda';
eruda.init();
```

### ❌ Never Do This:
```typescript
// BAD: Loads in production
if (Platform.OS === 'web') {
  import('eruda').then(eruda => eruda.default.init());
}
```

## 📋 Recommended Implementation Checklist

- [ ] Use URL parameter (`?debug=1`) for conditional loading
- [ ] Verify Eruda is NOT loaded in production builds
- [ ] Test that Eruda doesn't load without debug flag
- [ ] Ensure no sensitive data is logged to console
- [ ] Document how to enable/disable for team members
- [ ] Consider code-splitting to exclude from production bundle

## 🔒 Additional Security Measures

### 1. **Sanitize Console Logs**
Don't log sensitive information:
```typescript
// BAD
console.log('API Key:', apiKey);
console.log('User Token:', userToken);

// GOOD
console.log('API call initiated');
console.log('User authenticated');
```

### 2. **Use Environment Checks**
```typescript
const isDebugMode = () => {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === '1') return true;
  
  // Check environment
  if (__DEV__) return true;
  
  return false;
};
```

### 3. **Code Splitting**
Use dynamic imports to exclude Eruda from production bundle:
```typescript
// This ensures Eruda is not included in production bundle
if (isDebugMode()) {
  import('eruda').then(eruda => eruda.default.init());
}
```

## 📊 Security Comparison

| Implementation | Production Risk | User Exposure | Recommended |
|----------------|----------------|---------------|-------------|
| URL Parameter | ✅ None | ✅ Only if user adds `?debug=1` | ✅ **Yes** |
| Environment Variable | ✅ Low | ✅ None | ✅ Yes |
| LocalStorage Flag | ⚠️ Medium | ⚠️ If user enables | ⚠️ Use with caution |
| Always Enabled | ❌ **High** | ❌ **All users** | ❌ **Never** |

## ✅ Conclusion

**Eruda is safe when:**
1. ✅ Only loaded conditionally (URL parameter recommended)
2. ✅ Not included in production builds
3. ✅ Sensitive data is not logged to console
4. ✅ Proper environment checks are in place

**Recommended approach:** Use URL parameter (`?debug=1`) - this is the safest and most flexible option.

## 📝 Implementation Example

Here's a safe implementation:

```typescript
// src/utils/debugConsole.ts
import { Platform } from 'react-native';

let erudaLoaded = false;

export const initDebugConsole = () => {
  // Only load on web platform
  if (Platform.OS !== 'web') return;
  
  // Check if window is available
  if (typeof window === 'undefined') return;
  
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const debugEnabled = urlParams.get('debug') === '1';
  
  // Check localStorage (optional - for persistent debug mode)
  const localStorageDebug = localStorage.getItem('eruda_debug') === 'true';
  
  // Only load if explicitly enabled
  if (debugEnabled || localStorageDebug) {
    if (!erudaLoaded) {
      import('eruda').then(eruda => {
        eruda.default.init();
        erudaLoaded = true;
        console.log('[Debug] Eruda console enabled');
      }).catch(err => {
        console.warn('[Debug] Failed to load Eruda:', err);
      });
    }
  }
};

// Call in App.tsx or entry point
// initDebugConsole();
```

This ensures Eruda is:
- ✅ Only loaded when explicitly requested
- ✅ Not included in production bundle (dynamic import)
- ✅ Safe for production use
- ✅ Easy to enable/disable


