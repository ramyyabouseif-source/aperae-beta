# Menu Sommelier Prompt V2.2 - Test Guide

## Overview

This test suite validates that the Menu Sommelier Prompt V2.2 is properly implemented and integrated with the Restaurant Pairing Assistant.

## Prerequisites

1. **Backend server must be running** on `http://localhost:3001`
2. **PowerShell** (Windows PowerShell or PowerShell Core)
3. **Node.js backend** with all dependencies installed

## Running the Tests

```powershell
.\TEST_MENU_V2.2.ps1
```

## What the Tests Verify

### Test 1: No Old Prompt References
- **Purpose**: Ensures no legacy `MENU_SOMMELIER_PROMPT` constant is referenced in code (only comments allowed)
- **Files Checked**: `backend/server.js`, `backend/prompts/*.js`
- **Expected**: No actual code references, only comments documenting the migration

### Test 2: Prompt Builder Import and Files
- **Purpose**: Verifies that `buildMenuV2Prompt` function exists and is properly imported
- **Checks**:
  - `buildMenuV2Prompt` is referenced in `server.js`
  - Required prompt files exist:
    - `backend/prompts/menu-v2.2-static-sections.js`
    - `backend/prompts/menu-v2.2-dynamic-sections.js`
    - `backend/prompts/menu-v2.2-master-prompt.js`

### Test 3: Menu Context Request
- **Purpose**: Tests a live API request with `availableWines` parameter (menu context)
- **Request Structure**:
  ```json
  {
    "dish": "Grilled Ribeye Steak with Herb Butter",
    "availableWines": [
      {
        "wineName": "...",
        "producer": "...",
        "vintage": "...",
        "pricePoint": "...",
        "category": "...",
        "description": "..."
      }
    ]
  }
  ```
- **Expected**: Successful HTTP 200 response with valid JSON

### Test 4: Valid JSON Response
- **Purpose**: Confirms the API response is valid, parseable JSON
- **Expected**: Response can be parsed by PowerShell's `Invoke-RestMethod`

### Test 5: Required Fields Validation
- **Purpose**: Verifies all V2.2 required fields are present in the response

#### Top-Level Fields:
- `dish` (string)
- `dishAnalysis` (object)
- `recommendations` (array)
- `menuLimitations` (string, optional but recommended)

#### dishAnalysis Fields:
- `dominantWeight`
- `fatContent`
- `primaryProtein`
- `dominantFlavors` (array)
- `spiceLevel`
- `acidityLevel`
- `applicablePrinciples` (array)
- `keyChallenge`
- `idealProfile` (object)

#### Recommendation Fields (per recommendation):
- `tierLabel` ⭐ **NEW in V2.2**
- `tierRationale` ⭐ **NEW in V2.2**
- `wineName`
- `producer`
- `vintage`
- `grape`
- `region`
- `rationale`
- `pairingPrinciplesApplied` (array)
- `tastingNotes` (object)
- `servingGuidance` (object)
- `confidence` (object with `score` and `breakdown`)
- `storytellingElements`

#### Excluded Fields (Must NOT be present):
- `cookingMethod` ❌
- `cookingMethodImpact` ❌
- `sauce` ❌
- `sauceCharacteristic` ❌
- `saucePriority` ❌

### Test 6: Schema Structure Validation
- **Purpose**: Validates nested object structures and data types
- **Checks**:
  - `recommendations` is an array with at least one item
  - `tastingNotes.aromas` is an array
  - `confidence.score` is an integer between 0-100
  - `confidence.breakdown.tierAdjustments` exists (V2.2 feature)
  - `servingGuidance` has required fields: `temperature`, `glassware`, `decanting`
  - `tierLabel` is one of: "Premium Selection", "Moderate Choice", "Budget-Friendly"

## Expected Test Output

```
========================================
Menu V2.2 Prompt Test Suite
========================================

[TEST 1] Checking for old MENU_SOMMELIER_PROMPT references...
  ✓ PASS: No old MENU_SOMMELIER_PROMPT constant references found

[TEST 2] Verifying Menu V2.2 prompt builder is properly imported...
  ✓ PASS: buildMenuV2Prompt function is referenced in server.js
  ✓ Found: backend\prompts\menu-v2.2-static-sections.js
  ✓ Found: backend\prompts\menu-v2.2-dynamic-sections.js
  ✓ Found: backend\prompts\menu-v2.2-master-prompt.js

[TEST 3] Testing menu context request with availableWines...
  Sending request with dish: 'Grilled Ribeye Steak with Herb Butter'
  Menu wines count: 5
  ✓ PASS: Request succeeded
  Response saved to: menu_v2.2_test_response.json

[TEST 4] Validating JSON response structure...
  ✓ PASS: Response is valid JSON

[TEST 5] Validating V2.2 required fields...
  ✓ Found: dish (String)
  ✓ Found: dishAnalysis (PSCustomObject)
  ✓ Found: recommendations (Object[])
  ...
  ✓ PASS: All required V2.2 fields are present

[TEST 6] Validating schema structure...
  ✓ Recommendations is an array with 3 items
  ✓ PASS: Schema structure is valid

========================================
Test Summary
========================================

Test Results:
  1. No Old Prompt References: ✓ PASS
  2. Menu Context Request: ✓ PASS
  3. Valid JSON Response: ✓ PASS
  4. Schema Validation: ✓ PASS
  5. Required Fields Present: ✓ PASS
  6. Excluded Fields Absent: ✓ PASS

Overall: 6/6 tests passed

✓ ALL TESTS PASSED - Menu V2.2 is properly implemented!
```

## Output Files

- `menu_v2.2_test_response.json`: Full API response saved for manual inspection

## Troubleshooting

### Server Not Running
```
Error: Unable to connect to the remote server
```
**Solution**: Start the backend server with `npm start` or `node backend/server.js`

### Invalid JSON Response
```
✗ FAIL: Response is not valid JSON
```
**Solution**: Check server logs for errors. Verify API key is configured if not in MOCK_MODE.

### Missing Fields
```
✗ Missing: tierLabel
```
**Solution**: Verify the prompt builder is using V2.2 schema. Check that `menu-v2.2-static-sections.js` has the correct JSON schema.

### Excluded Fields Present
```
✗ ERROR: Excluded field found: dishAnalysis.cookingMethod
```
**Solution**: Verify `responseNormalizer.js` is removing these fields and the prompt schema doesn't include them.

## Integration with Google OCR

The test simulates data that would come from Google OCR service:
- Wine names extracted from menu photos
- Producer, vintage, price, category, description extracted
- This data is passed as `availableWines` array to trigger menu context

## Next Steps After Passing Tests

1. ✅ Code review confirms V2.2 implementation
2. ✅ Tests pass all validations
3. 🔄 Deploy to staging for integration testing
4. 🔄 Test with real menu OCR data
5. 🔄 Deploy to production

