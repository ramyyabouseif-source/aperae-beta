# Single Point of Consent Implementation Guide

## Overview

This guide explains how to update your database and backend code to implement a **Single Point of Consent** approach where all three consents (Age Verification, Terms Acceptance, and Privacy Policy Acceptance) are stored together from the `AgeVerificationScreen`.

## Current Storage Location

User consent is currently stored in the **`user_consents`** table in your Supabase database with the following structure:

- **Table Name**: `user_consents`
- **Schema**: See `backend/prisma/schema.prisma` (lines 69-93)
- **Current Approach**: Three separate records (one for each consent type)
  - `consent_type = 'age_verification'`
  - `consent_type = 'terms'`
  - `consent_type = 'privacy_policy'`

## Single Point of Consent Approach

Instead of storing three separate records, we'll store **one record** that represents all three consents given together from the `AgeVerificationScreen`.

## Database Migration

### Step 1: Run the SQL Migration

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run the SQL from `backend/prisma/migrations/single_point_consent_migration.sql`

This migration:
- Adds a `consent_data` JSONB column to store structured consent details
- Adds an index for performance
- Does NOT break existing records (backward compatible)

### Step 2: Update Prisma Schema (Optional but Recommended)

After running the SQL migration, update your Prisma schema to reflect the new column:

```prisma
model UserConsent {
  id String @id @default(uuid())

  // Pseudonymized identifiers
  userId       String? @db.Uuid @map("user_id")
  deviceIdHash String? @map("device_id_hash")

  // Consent data
  consentType String @map("consent_type") // 'single_point_consent' for new approach
  accepted    Boolean
  version     String? // Version of terms/policy accepted
  
  // NEW: JSONB field for structured consent data
  consentData Json? @map("consent_data") // Store all three consents here

  // Compliance metadata
  acceptedAt   DateTime  @default(now()) @map("accepted_at")
  anonymizedAt DateTime? @map("anonymized_at")

  // Relations
  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([deviceIdHash])
  @@index([consentType])
  @@index([acceptedAt])
  @@map("user_consents")
}
```

Then run:
```bash
cd backend
npx prisma generate
```

## Implementation Options

### Option 1: Single Record Approach (Recommended)

Store **one record** with:
- `consent_type = 'single_point_consent'`
- `consent_data` JSONB containing all three consents:
```json
{
  "age_verification": true,
  "terms": true,
  "privacy_policy": true,
  "terms_version": "1.0",
  "privacy_version": "1.0",
  "accepted_together": true,
  "source": "age_verification_screen"
}
```

### Option 2: Three Linked Records (Alternative)

Keep three separate records but add a `batch_id` to link them together. This maintains individual consent tracking but shows they were given together.

**Recommendation**: Use **Option 1** for simplicity and clarity.

## Backend Code Updates

### Update ConsentService

Modify `backend/services/consentService.js` to add a new method:

```javascript
/**
 * Store single point consent (all three consents together)
 * @param {object} params - Consent parameters
 * @param {boolean} params.ageVerified - Age verification status
 * @param {boolean} params.termsAccepted - Terms acceptance status
 * @param {boolean} params.privacyAccepted - Privacy policy acceptance status
 * @param {string} [params.termsVersion] - Terms version (e.g., '1.0')
 * @param {string} [params.privacyVersion] - Privacy policy version (e.g., '1.0')
 * @param {string} [params.userId] - User ID if logged in
 * @param {string} [params.deviceId] - Device ID from client
 * @param {object} [params.req] - Express request object
 * @returns {Promise<object>} Created consent record
 */
async storeSinglePointConsent({
  ageVerified,
  termsAccepted,
  privacyAccepted,
  termsVersion = null,
  privacyVersion = null,
  userId = null,
  deviceId = null,
  req = null
}) {
  try {
    // Validate all three consents are true
    if (!ageVerified || !termsAccepted || !privacyAccepted) {
      throw new Error('All three consents must be accepted for single point consent');
    }

    // Get pseudonymized device ID
    const deviceIdHash = this._getDeviceIdHash(req, deviceId);

    // Build consent data JSON
    const consentData = {
      age_verification: ageVerified,
      terms: termsAccepted,
      privacy_policy: privacyAccepted,
      terms_version: termsVersion,
      privacy_version: privacyVersion,
      accepted_together: true,
      source: 'age_verification_screen'
    };

    // Store single consent record
    const consent = await prisma.userConsent.create({
      data: {
        userId: userId || null,
        deviceIdHash: deviceIdHash,
        consentType: 'single_point_consent',
        accepted: true,
        version: `${termsVersion || '1.0'}-${privacyVersion || '1.0'}`, // Combined version
        consentData: consentData,
        acceptedAt: new Date(),
      },
    });

    logger.info('Single point consent stored', {
      userId: userId || 'anonymous',
      hasDeviceIdHash: !!deviceIdHash,
      consentData
    });

    return consent;
  } catch (error) {
    logger.error('Error storing single point consent', { error: error.message });
    throw error;
  }
}

/**
 * Check if user has given single point consent
 * @param {string} userId - User ID (optional)
 * @param {string} deviceIdHash - Hashed device ID (optional, for anonymous users)
 * @returns {Promise<boolean>} True if single point consent was given
 */
async hasSinglePointConsent(userId, deviceIdHash) {
  try {
    const where = {
      consentType: 'single_point_consent',
      accepted: true,
      anonymizedAt: null,
    };

    if (userId) {
      where.userId = userId;
    } else if (deviceIdHash) {
      where.deviceIdHash = deviceIdHash;
      where.userId = null;
    } else {
      return false;
    }

    const consent = await prisma.userConsent.findFirst({
      where: where,
      orderBy: {
        acceptedAt: 'desc',
      },
    });

    if (!consent) return false;

    // Also check that all three consents in consent_data are true
    const consentData = consent.consentData;
    if (consentData) {
      return consentData.age_verification === true &&
             consentData.terms === true &&
             consentData.privacy_policy === true;
    }

    return true; // If consent_data is null, assume valid (backward compatibility)
  } catch (error) {
    logger.error('Error checking single point consent', { error: error.message, userId });
    return false;
  }
}
```

### Update API Endpoint

Add a new endpoint in `backend/server.js`:

```javascript
/**
 * Store single point consent (age verification + terms + privacy policy)
 */
app.post('/api/consent/single-point', async (req, res) => {
  const requestId = generateRequestId();
  const requestStartTime = Date.now();

  try {
    const {
      ageVerified,
      termsAccepted,
      privacyAccepted,
      termsVersion,
      privacyVersion,
      deviceId
    } = req.body;

    // Validate all three are accepted
    if (!ageVerified || !termsAccepted || !privacyAccepted) {
      return res.status(400).json({
        error: 'All three consents must be accepted',
        requestId
      });
    }

    // Get user ID if authenticated (optional)
    const userId = req.user?.id || null;

    // Store single point consent
    const consent = await consentService.storeSinglePointConsent({
      ageVerified,
      termsAccepted,
      privacyAccepted,
      termsVersion: termsVersion || '1.0',
      privacyVersion: privacyVersion || '1.0',
      userId,
      deviceId,
      req
    });

    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestSuccess('single-point-consent', requestId, responseTime);

    res.json({
      success: true,
      consentId: consent.id,
      requestId
    });

  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestError('single-point-consent', requestId, responseTime, error);

    res.status(500).json({
      error: 'Failed to store consent',
      requestId
    });
  }
});
```

## Frontend Updates

### Update AgeVerificationScreen

In `src/screens/AgeVerificationScreen.tsx`, update the `handleContinue` function to call the new endpoint:

```typescript
const handleContinue = async () => {
  if (isVerifying) return;
  
  if (!isAgeConfirmed) {
    Alert.alert('Required', 'Please confirm you are 21 or older to continue.');
    return;
  }

  if (!agreedToTerms) {
    Alert.alert('Required', 'Please accept the Terms of Use and Privacy Notice to continue.');
    return;
  }

  setIsVerifying(true);
  try {
    // Call single point consent endpoint
    const response = await fetch(`${API_BASE_URL}/consent/single-point`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ageVerified: true,
        termsAccepted: true,
        privacyAccepted: true,
        termsVersion: LEGAL_CONFIG.termsVersion,
        privacyVersion: LEGAL_CONFIG.privacyVersion,
        deviceId: await getDeviceId(), // Your device ID function
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to store consent');
    }

    // Store locally as well (for offline access)
    await Promise.all([
      AgeVerificationService.verifyAge(LEGAL_DRINKING_AGE),
      TermsService.acceptTerms(),
      PrivacyPolicyService.acceptPrivacyPolicy(),
    ]);

    onVerified();
  } catch (error) {
    console.error('Error storing consent:', error);
    Alert.alert('Error', 'Failed to save verification. Please try again.');
    setIsVerifying(false);
  }
};
```

## Migration Strategy

### Backward Compatibility

The migration is **backward compatible**:
- Existing records (three separate consent types) continue to work
- New records use `single_point_consent` type
- You can check for either format:

```javascript
// Check for single point consent first
const hasSinglePoint = await consentService.hasSinglePointConsent(userId, deviceIdHash);

// Fallback to checking individual consents (for backward compatibility)
if (!hasSinglePoint) {
  const hasAge = await consentService.hasConsent(userId, deviceIdHash, 'age_verification');
  const hasTerms = await consentService.hasConsent(userId, deviceIdHash, 'terms');
  const hasPrivacy = await consentService.hasConsent(userId, deviceIdHash, 'privacy_policy');
  
  if (hasAge && hasTerms && hasPrivacy) {
    // User has all consents (old format)
    return true;
  }
}
```

### Data Migration (Optional)

If you want to migrate existing records to the new format, you can run this SQL:

```sql
-- Find users with all three consents (old format)
-- Then create a single_point_consent record for them
-- (Run this carefully, test first!)
```

## Verification Queries

After implementation, verify with these SQL queries:

```sql
-- Check single point consents
SELECT 
  id,
  user_id,
  consent_type,
  consent_data,
  accepted_at
FROM user_consents
WHERE consent_type = 'single_point_consent'
ORDER BY accepted_at DESC
LIMIT 10;

-- Check consent data structure
SELECT 
  consent_data->>'age_verification' as age_verified,
  consent_data->>'terms' as terms,
  consent_data->>'privacy_policy' as privacy,
  consent_data->>'terms_version' as terms_version,
  consent_data->>'privacy_version' as privacy_version
FROM user_consents
WHERE consent_type = 'single_point_consent'
  AND accepted = true
LIMIT 10;
```

## Summary

1. **Run SQL migration** to add `consent_data` JSONB column
2. **Update Prisma schema** (optional but recommended)
3. **Add backend method** `storeSinglePointConsent()` to ConsentService
4. **Add API endpoint** `/api/consent/single-point`
5. **Update frontend** to call new endpoint from AgeVerificationScreen
6. **Test thoroughly** before deploying to production

The new approach stores all three consents in a single record, making it clearer that they were accepted together and simplifying consent tracking.

