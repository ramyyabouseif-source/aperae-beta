# Data Deletion Process for Privacy Requests

This document outlines the process for handling user data deletion requests in compliance with CCPA and other privacy laws.

## Overview

When a user requests deletion of their data, follow this process to ensure:
- User verification (prevents unauthorized deletions)
- Complete data removal
- Legal compliance (30-day response window)
- Proper documentation

---

## Step-by-Step Process

### 1. User Initiates Request

**User Action:**
- User emails `aperaeai@gmail.com` from the same device/browser they used to access Aperae
- Subject line should be: "Data Deletion Request" (optional, but helpful)

**What We Need:**
- Email from the user's device/browser
- Device identifier hash (see Step 2)

---

### 2. Request Device Identifier Hash

**Response Email Template:**

```
Subject: Re: Data Deletion Request

Thank you for your data deletion request. To process your request, I need to verify your identity.

Please provide your Device Identifier Hash:
1. Open the Aperae app/website
2. Go to Settings > Privacy Settings
3. Find "My Device ID" section
4. Copy the Device Identifier Hash and send it to me

[Alternative if "My Device ID" feature not yet added: Ask user to provide approximate date they first used the app, device type, and OS version for manual lookup]

Once I receive this information, I will process your deletion request within 30 days.

Thank you,
Aperae Privacy Team
```

**TODO: Add "My Device ID" Feature**
- Add a section in Privacy Settings screen showing the user's device identifier hash
- This makes it easier for users to provide the hash for deletion requests
- Display format: `Device ID: [hashed identifier]` with a "Copy" button

---

### 3. Manual Database Deletion Using Prisma

Once you have the device identifier hash, use the following Prisma commands to delete user data:

#### 3.1 Connect to Database

```bash
# Navigate to backend directory
cd backend

# Open Prisma Studio (optional, for visual inspection)
npx prisma studio

# Or use Prisma CLI
npx prisma db pull  # Sync schema (if needed)
```

#### 3.2 Delete User Data by Device Hash

Create a temporary script or use Prisma Studio to delete:

**Option A: Using Prisma Studio (Recommended for verification)**
1. Open Prisma Studio: `npx prisma studio`
2. Navigate to `UserConsent` table
3. Search for records where `deviceIdHash` matches the user's hash
4. Delete all matching records
5. Navigate to `WineRecommendation` table
6. Search for records linked to the device hash (may need to check via consent records first)
7. Delete all matching records

**Option B: Using Prisma Script (Faster for bulk deletion)**

Create a file `scripts/deleteUserData.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUserDataByDeviceHash(deviceIdHash: string) {
  try {
    // 1. Find all consent records for this device
    const consents = await prisma.userConsent.findMany({
      where: { deviceIdHash },
    });

    console.log(`Found ${consents.length} consent records`);

    // 2. Delete consent records
    const deletedConsents = await prisma.userConsent.deleteMany({
      where: { deviceIdHash },
    });
    console.log(`Deleted ${deletedConsents.count} consent records`);

    // 3. Note: WineRecommendation table doesn't directly link to deviceIdHash
    // If you need to delete recommendations, you may need to:
    // - Link recommendations to device hash in future schema updates
    // - Or delete based on timestamp ranges if user provides approximate usage dates
    // For now, recommendations are anonymous and not directly linked to device hash

    // 4. If user has an account (userId), delete account data
    const userIds = consents
      .map(c => c.userId)
      .filter((id): id is string => id !== null);

    if (userIds.length > 0) {
      // Delete account-related data
      const uniqueUserIds = [...new Set(userIds)];
      for (const userId of uniqueUserIds) {
        // Delete user account (if User table exists)
        // await prisma.user.delete({ where: { id: userId } });
        
        // Delete session data
        await prisma.session.deleteMany({ where: { userId } });
        console.log(`Deleted sessions for user ${userId}`);
      }
    }

    console.log('Data deletion complete!');
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Usage: node -r ts-node/register scripts/deleteUserData.ts [deviceHash]
const deviceHash = process.argv[2];
if (!deviceHash) {
  console.error('Usage: node deleteUserData.ts <deviceHash>');
  process.exit(1);
}

deleteUserDataByDeviceHash(deviceHash);
```

Run the script:
```bash
# If using TypeScript
npx ts-node scripts/deleteUserData.ts <deviceHash>

# Or compile and run
npm run build
node dist/scripts/deleteUserData.js <deviceHash>
```

#### 3.3 Data Tables to Delete From

Based on the current schema, delete from these tables in order:

1. **UserConsent** (primary lookup)
   - Delete all records where `deviceIdHash = [user's hash]`
   - This removes: age verification, Terms acceptance, Privacy Policy acceptance

2. **WineRecommendation** (if linked to device hash)
   - Currently NOT directly linked to device hash
   - Future enhancement: Add `deviceIdHash` column or link via consent records
   - For now: May need manual review if user requests deletion of recommendations

3. **Session** (if user had account)
   - Delete sessions linked to `userId` (from consent records)
   - Contains: IP addresses, refresh tokens

4. **User** (if user had account)
   - Delete user account record
   - Contains: email, password hash

#### 3.4 Verify Deletion

After deletion, verify no data remains:

```typescript
// Verification script
const remaining = await prisma.userConsent.findMany({
  where: { deviceIdHash },
});

if (remaining.length > 0) {
  console.error('ERROR: Some records were not deleted!');
  console.log(remaining);
} else {
  console.log('✓ All data successfully deleted');
}
```

---

### 4. Confirm Deletion to User (Within 30 Days)

**Confirmation Email Template:**

```
Subject: Re: Data Deletion Request - Completed

Dear [User],

Your data deletion request has been processed.

The following data has been permanently deleted from our systems:
- Device identifier hash and associated consent records
- Age verification record
- Terms of Service acceptance record
- Privacy Policy acceptance record
- Session data (if applicable)
- Account information (if applicable)

Your data has been permanently removed from our database and cannot be recovered.

If you have any questions or concerns, please contact us at aperaeai@gmail.com.

Thank you,
Aperae Privacy Team
```

**Important:**
- Must respond within **30 days** of receiving the request (CCPA requirement)
- Keep a record of the deletion request and confirmation (for audit purposes)
- Store email thread with timestamps

---

## Current Limitations & Future Enhancements

### Current Limitations:

1. **WineRecommendation Table:**
   - Recommendations are NOT directly linked to device identifier hash
   - Cannot automatically delete user's wine recommendations
   - **Workaround:** Manual review if user specifically requests recommendation deletion

2. **No Automated Process:**
   - All deletions are manual
   - Requires database access and Prisma knowledge

3. **Device Hash Identification:**
   - Users cannot easily find their device hash
   - **Solution:** Add "My Device ID" feature in Privacy Settings

### Recommended Future Enhancements:

1. **Add "My Device ID" to Privacy Settings:**
   - Display device identifier hash
   - Add "Copy to Clipboard" button
   - Include instructions for deletion requests

2. **Link Recommendations to Device Hash:**
   - Add `deviceIdHash` column to `WineRecommendation` table
   - Or create linking table between recommendations and device hash
   - Enables automatic deletion of recommendations

3. **Automated Deletion Endpoint (Optional):**
   - Create API endpoint: `DELETE /api/privacy/delete-data`
   - Requires device hash verification
   - Automates deletion process
   - **Security consideration:** Requires strong authentication to prevent abuse

4. **Deletion Request Tracking:**
   - Create database table to track deletion requests
   - Store: email, device hash, request date, completion date, status
   - Helps with audit and compliance

---

## Legal Compliance Notes

### CCPA Requirements:
- ✅ Must respond within 30 days (can extend to 90 days with notice)
- ✅ Must verify user identity (device hash serves as verification)
- ✅ Must confirm deletion in writing
- ✅ Must delete all personal information (as defined by CCPA)

### Data Retention Exceptions:
Some data may need to be retained for legal/compliance reasons:
- Financial transaction records (if payments exist in future)
- Legal hold (if litigation pending)
- Security incident investigation

**Current Status:** As a free, non-commercial app, minimal data retention exceptions apply.

---

## Quick Reference Checklist

When processing a deletion request:

- [ ] Received email from user
- [ ] Requested device identifier hash (or alternative verification)
- [ ] Verified user identity
- [ ] Located data in database using device hash
- [ ] Deleted UserConsent records
- [ ] Deleted Session records (if applicable)
- [ ] Deleted User account (if applicable)
- [ ] Verified deletion (no remaining records)
- [ ] Sent confirmation email within 30 days
- [ ] Documented request and completion

---

## Contact

For questions about this process:
- Email: aperaeai@gmail.com
- Document last updated: January 10, 2026


