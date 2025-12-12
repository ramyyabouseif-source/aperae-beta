# License Strategy Explanation for Aperae

## Critical Correction: License Strategy

Based on the codebase classification analysis, **60% of the codebase is proprietary**. Therefore:

### ❌ WRONG Approach
- **MIT License for entire repository** - This would open-source ALL code, including proprietary algorithms and prompts

### ✅ CORRECT Approach  
- **PROPRIETARY License for main repository** - Protects 60% of proprietary code
- **MIT License ONLY for extracted open-source components** - Apply to components we deliberately extract and open-source

---

## Recommended License Strategy

### 1. Main Repository: PROPRIETARY LICENSE

**File:** `/LICENSE` (in root)

**Purpose:** Protects the entire Aperae codebase by default

**What it does:**
- ✅ Prevents unauthorized copying, distribution, or use
- ✅ Protects proprietary algorithms, AI prompts, business logic
- ✅ Allows internal use only
- ✅ Requires explicit permission for any external use

**What it does NOT do:**
- ❌ Does NOT open-source anything
- ❌ Does NOT allow public distribution
- ❌ Does NOT allow commercial use by others

**When MIT applies:** Only if we extract specific components to separate repositories

---

### 2. Extracted Open-Source Components: MIT LICENSE

**Example:** If we extract `/src/design` → `@aperae/design-system` (separate repo)

**File:** `/LICENSE` in the extracted component repository

**Purpose:** Opens that specific component for public use

**What it does:**
- ✅ Allows public use, modification, distribution
- ✅ Permits commercial use
- ✅ Requires attribution (copyright notice)

---

## Implementation Plan

### Step 1: Create PROPRIETARY LICENSE for Main Repo

**Location:** `/LICENSE`

**Content:** Proprietary/All Rights Reserved license

**Why:** 
- Protects 60% proprietary code (AI prompts, algorithms, security)
- Keeps competitive advantages closed
- Allows controlled access under NDA if needed

### Step 2: Add File-Level Copyright Headers

**Proprietary Files:** Add "All Rights Reserved" headers
**Future Open-Source Files:** Add MIT headers (only if extracted)

### Step 3: If Open-Sourcing Components (Future)

**Extract to separate repo** → Create MIT LICENSE in that repo only

---

## What This Means for Task 1.1.1

**Create:** PROPRIETARY LICENSE file (not MIT)

**Reason:** Main repository contains proprietary IP that must remain closed

**MIT License:** Only if/when we extract specific open-source components to separate repositories

---

## License Comparison

| Aspect | MIT License | Proprietary License |
|--------|-------------|-------------------|
| **Public Distribution** | ✅ Yes, anyone can use | ❌ No, internal only |
| **Commercial Use** | ✅ Yes, allowed | ❌ No, requires permission |
| **Modification** | ✅ Yes, allowed | ❌ No, requires permission |
| **Attribution Required** | ✅ Yes, copyright notice | ✅ Yes, copyright notice |
| **Protects Proprietary IP** | ❌ No, everything is public | ✅ Yes, everything is protected |
| **Use Case** | Open-source components | Main application codebase |

---

## Recommendation

**For Aperae Main Repository:**
- ✅ **PROPRIETARY LICENSE** - Protects all proprietary code
- ✅ File-level copyright headers ("All Rights Reserved")
- ✅ Clear statement in README about proprietary nature

**For Future Open-Source Components:**
- ✅ Extract to separate repository (e.g., `@aperae/design-system`)
- ✅ MIT License in that repository only
- ✅ Clear separation between proprietary and open-source code

---

## Next Steps

1. Create PROPRIETARY LICENSE file for main repo
2. Update README to clarify license status
3. Add copyright headers to all files
4. Document open-source extraction process (for future components)


