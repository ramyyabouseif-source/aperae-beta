# Testing Guide: Enhanced Sommelier Prompt Integration

This guide walks you through testing the system with both legacy and enhanced prompt formats.

## Prerequisites

- Backend server running
- Frontend app running (or use API directly)
- Access to environment variables
- API testing tool (Postman, curl, or similar)

---

## Part 1: Testing with Feature Flag OFF (Legacy Format)

### Step 1: Verify Feature Flag is OFF

**Option A: Check Environment Variable**
```bash
# In your terminal (backend directory)
echo $ENABLE_ENHANCED_PROMPT
# Should return empty or "false"
```

**Option B: Check .env file**
```bash
# In backend/.env file, ensure:
ENABLE_ENHANCED_PROMPT=false
# OR simply don't include it (defaults to false)
```

**Option C: Explicitly Set to False**
```bash
# Windows PowerShell
$env:ENABLE_ENHANCED_PROMPT="false"

# Windows CMD
set ENABLE_ENHANCED_PROMPT=false

# Linux/Mac
export ENABLE_ENHANCED_PROMPT=false
```

### Step 2: Restart Backend Server

After setting the environment variable, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
# OR
node server.js
```

### Step 3: Verify Server Logs

When the server starts, check the logs. You should see:
- No mention of "enhanced" prompt
- Mock mode status (if applicable)

### Step 4: Test API Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Grilled ribeye steak with chimichurri"}'
```

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:3001/api/recommendations`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "dish": "Grilled ribeye steak with chimichurri"
}
```

### Step 5: Verify Legacy Format Response

**Expected Response Structure:**
```json
{
  "dish": "Grilled ribeye steak with chimichurri",
  "dishAnalysis": {
    "dominantWeight": "heavy",
    "fatContent": "high",
    "primaryProtein": "...",
    "dominantFlavors": [...],
    "spiceLevel": "...",
    "applicablePrinciples": [...]
    // NOTE: Should NOT have: keyChallenge, idealProfile, acidityLevel
  },
  "recommendations": [
    {
      "tierLabel": "Premium Selection",
      "wineName": "...",
      "producer": "...",
      "vintage": "...",
      "tastingNotes": "string format",  // ← Should be STRING, not object
      "servingGuidance": "string format",  // ← Should be STRING, not object
      "confidenceScore": 93,  // ← Should have this field
      "confidenceRationale": "...",  // ← Should have this field
      // NOTE: Should NOT have: confidence object, alternatives, region, story
    }
  ],
  "closingNarrative": "..."
  // NOTE: Should NOT have: avoid object
}
```

**Key Indicators of Legacy Format:**
- ✅ `tastingNotes` is a **string** (not an object)
- ✅ `servingGuidance` is a **string** (not an object)
- ✅ `confidenceScore` is a **number** (not a `confidence` object)
- ✅ `confidenceRationale` exists as separate field
- ❌ No `alternatives` array
- ❌ No `avoid` object
- ❌ No `keyChallenge` or `idealProfile` in dishAnalysis
- ❌ No `confidence.breakdown` object

### Step 6: Check Backend Logs

Look for log entries like:
```
Using prompt version { requestId: '...', version: 'legacy' }
```

### Step 7: Test Mock Mode (Optional)

If you want to test with mock data:

**Set Mock Mode:**
```bash
# Windows PowerShell
$env:MOCK_MODE="true"

# Linux/Mac
export MOCK_MODE=true
```

**Restart server and test again.** You should get mock data in legacy format.

---

## Part 2: Testing with Feature Flag ON (Enhanced Format)

### Step 1: Enable Feature Flag

**Option A: Set Environment Variable**
```bash
# Windows PowerShell
$env:ENABLE_ENHANCED_PROMPT="true"

# Windows CMD
set ENABLE_ENHANCED_PROMPT=true

# Linux/Mac
export ENABLE_ENHANCED_PROMPT=true
```

**Option B: Update .env file**
```bash
# In backend/.env file:
ENABLE_ENHANCED_PROMPT=true
```

### Step 2: Restart Backend Server

**Important:** You MUST restart the server after changing the environment variable.

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

### Step 3: Verify Server Logs

When the server starts, you should see in the logs:
- Feature flag check logging (if debug level enabled)
- When making a request, you should see: `Using prompt version { version: 'enhanced' }`

### Step 4: Test API Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Carbonara Spaghetti with smoked bacon, breadcrumbs, parmesan cheese, and egg yolk"}'
```

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:3001/api/recommendations`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "dish": "Carbonara Spaghetti with smoked bacon, breadcrumbs, parmesan cheese, and egg yolk"
}
```

### Step 5: Verify Enhanced Format Response

**Expected Response Structure:**
```json
{
  "dish": "Carbonara Spaghetti...",
  "dishAnalysis": {
    "dominantWeight": "heavy",
    "fatContent": "high",
    "primaryProtein": "pork (smoked bacon, cured)",
    "dominantFlavors": ["salty", "umami", "savory"],
    "spiceLevel": "none",
    "acidityLevel": "low",  // ← NEW FIELD
    "applicablePrinciples": [...],
    "keyChallenge": "High fat content...",  // ← NEW FIELD
    "idealProfile": {  // ← NEW FIELD
      "acidity": "high",
      "tannin": "none to low",
      "body": "medium to full",
      "sweetness": "dry",
      "notes": "..."
    }
  },
  "recommendations": [
    {
      "tierLabel": "Premium Selection",
      "tierRationale": "...",  // ← NEW FIELD
      "tierFallbackApplied": false,  // ← NEW FIELD
      "wineName": "...",
      "producer": "...",
      "region": "Chablis, Burgundy, France",  // ← NEW FIELD
      "vintage": "2021",
      "grape": "Chardonnay (White)",  // ← NEW FIELD
      "tastingNotes": {  // ← OBJECT, not string
        "aromas": ["green apple", "lemon zest", ...],
        "palate": "piercing acidity...",
        "finish": "long, clean, mineral-driven..."
      },
      "servingGuidance": {  // ← OBJECT, not string
        "temperature": "50-54°F (10-12°C)",
        "glassware": "Burgundy white wine glass",
        "decanting": "No decant needed"
      },
      "confidence": {  // ← OBJECT, not just number
        "score": 88,
        "breakdown": {
          "pairingScience": 45,
          "wineKnowledge": 28,
          "complexityHandling": 15
        },
        "rationale": "Strong pairing science..."
      },
      "story": "...",  // ← NEW FIELD
      "alternatives": [  // ← NEW FIELD
        {
          "wineName": "...",
          "producer": "...",
          "vintage": "...",
          "grape": "..."
        }
      ]
    }
  ],
  "avoid": {  // ← NEW FIELD
    "types": ["High-tannin reds...", ...],
    "reason": "High tannins clash..."
  },
  "closingNarrative": "..."
}
```

**Key Indicators of Enhanced Format:**
- ✅ `tastingNotes` is an **object** with `aromas`, `palate`, `finish`
- ✅ `servingGuidance` is an **object** with `temperature`, `glassware`, `decanting`
- ✅ `confidence` is an **object** with `score`, `breakdown`, `rationale`
- ✅ `alternatives` array exists
- ✅ `avoid` object exists
- ✅ `keyChallenge` and `idealProfile` in dishAnalysis
- ✅ `region`, `grape`, `story`, `tierRationale` fields exist
- ❌ No `confidenceScore` or `confidenceRationale` as separate fields (they're in `confidence` object)

### Step 6: Check Backend Logs

Look for log entries like:
```
Using prompt version { requestId: '...', version: 'enhanced' }
Response normalized successfully
```

### Step 7: Test Mock Mode with Enhanced Format

**Set Mock Mode:**
```bash
# Windows PowerShell
$env:MOCK_MODE="true"
$env:ENABLE_ENHANCED_PROMPT="true"

# Linux/Mac
export MOCK_MODE=true
export ENABLE_ENHANCED_PROMPT=true
```

**Restart server and test.** You should get the Carbonara mock data in enhanced format.

---

## Part 3: Testing Normalization Layer

### Test 1: Legacy Response Normalization

Even with enhanced prompt OFF, if you receive a legacy format response, it should be normalized:

1. Make a request with flag OFF
2. Check that the response has been normalized (backend adds structure even to legacy format)
3. Verify `tastingNotes` might be converted to object format by normalization layer

### Test 2: Enhanced Response Normalization

With enhanced prompt ON:
1. Make a request
2. Verify response is in enhanced format
3. Check logs for "Response normalized successfully"

### Test 3: Fallback Scenarios

**Test API Error Fallback:**
1. Temporarily break OpenAI API key
2. Make a request
3. Should fallback to mock data
4. Mock data format should match feature flag setting

**Test JSON Parse Error:**
1. This is harder to test, but you can verify the fallback handler is called
2. Check logs for "Falling back to mock data due to error"

---

## Part 4: Testing Frontend Components

### Test 1: Frontend Mock Mode (Legacy)

1. In frontend, enable mock mode
2. Feature flag OFF (or not set)
3. Request recommendations
4. Verify UI displays correctly with legacy format

### Test 2: Frontend Mock Mode (Enhanced)

1. In frontend, enable mock mode
2. Backend feature flag ON
3. Request recommendations
4. Verify UI displays correctly with enhanced format
5. Check that new fields are displayed (if components are updated)

### Test 3: Frontend with Live API

1. Disable mock mode in frontend
2. Test with feature flag OFF → should get legacy format
3. Test with feature flag ON → should get enhanced format
4. Verify UI handles both formats gracefully

---

## Part 5: Verification Checklist

### Legacy Format (Flag OFF)
- [ ] `tastingNotes` is string
- [ ] `servingGuidance` is string
- [ ] `confidenceScore` exists as number
- [ ] `confidenceRationale` exists as separate field
- [ ] No `alternatives` array
- [ ] No `avoid` object
- [ ] No `keyChallenge` or `idealProfile`
- [ ] Logs show "version: 'legacy'"

### Enhanced Format (Flag ON)
- [ ] `tastingNotes` is object with `aromas`, `palate`, `finish`
- [ ] `servingGuidance` is object with `temperature`, `glassware`, `decanting`
- [ ] `confidence` is object with `score`, `breakdown`, `rationale`
- [ ] `alternatives` array exists
- [ ] `avoid` object exists
- [ ] `keyChallenge` and `idealProfile` exist
- [ ] `region`, `grape`, `story` fields exist
- [ ] Logs show "version: 'enhanced'"

### Normalization
- [ ] Responses are normalized regardless of source format
- [ ] No errors in normalization logs
- [ ] Backward compatibility maintained

### Fallback
- [ ] Fallback uses correct mock data format based on flag
- [ ] Fallback handler logs show correct format selection
- [ ] All fallback scenarios work correctly

---

## Troubleshooting

### Issue: Feature flag not working

**Solution:**
1. Verify environment variable is set correctly
2. Restart server after changing variable
3. Check server logs for feature flag check
4. Verify variable name is exactly `ENABLE_ENHANCED_PROMPT`

### Issue: Getting wrong format

**Solution:**
1. Check server logs for which prompt version is being used
2. Verify environment variable is set before server starts
3. Check that normalization is working correctly

### Issue: Normalization errors

**Solution:**
1. Check backend logs for normalization warnings
2. Verify response structure matches expected format
3. Check that normalization functions handle edge cases

### Issue: Mock data not matching format

**Solution:**
1. Verify `mockDataEnhanced.json` exists and is valid JSON
2. Check fallback handler is selecting correct mock data
3. Verify feature flag is being checked in fallback handler

---

## Quick Test Commands

### Test Legacy Format
```bash
# Set flag OFF
export ENABLE_ENHANCED_PROMPT=false  # Linux/Mac
# OR
set ENABLE_ENHANCED_PROMPT=false  # Windows CMD

# Restart server, then:
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Grilled steak"}'
```

### Test Enhanced Format
```bash
# Set flag ON
export ENABLE_ENHANCED_PROMPT=true  # Linux/Mac
# OR
set ENABLE_ENHANCED_PROMPT=true  # Windows CMD

# Restart server, then:
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Carbonara"}'
```

### Test Mock Mode (Enhanced)
```bash
export MOCK_MODE=true
export ENABLE_ENHANCED_PROMPT=true
# Restart server, then make request
```

---

## Expected Log Output

### Legacy Format Request
```
Using prompt version { requestId: '...', version: 'legacy' }
Successfully parsed OpenAI response
Response normalized successfully
```

### Enhanced Format Request
```
Using prompt version { requestId: '...', version: 'enhanced' }
Successfully parsed OpenAI response
Response normalized successfully
```

### Fallback Scenario
```
Using fallback mock data { requestId: '...', dish: '...', promptVersion: 'enhanced' }
Fallback response normalized successfully
```

---

## Next Steps After Testing

1. Verify all test cases pass
2. Check UI components render correctly
3. Test with various dishes
4. Monitor error logs
5. Validate normalization is working
6. Test fallback scenarios

If all tests pass, the system is ready for gradual rollout!









