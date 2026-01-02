# Compliance Report API Endpoint

## Overview

The compliance report endpoint provides a simple way to check and prove that an anonymous user completed all required consent screens. This is useful for compliance audits, legal defense, and verifying user consent status.

## Endpoint

```
GET /api/consent/compliance-report?deviceIdHash={hash}
```

## Parameters

- `deviceIdHash` (required, query parameter): SHA-256 hash of the device ID

## Response Format

```json
{
  "success": true,
  "complianceStatus": "FULLY_COMPLIANT" | "PARTIAL_COMPLIANCE" | "NON_COMPLIANT",
  "consentsCompleted": 3,
  "requiredConsents": 3,
  "consentRecords": [
    {
      "type": "age_verification",
      "accepted": true,
      "version": null,
      "acceptedAt": "2026-01-02T03:42:26.895Z"
    },
    {
      "type": "terms",
      "accepted": true,
      "version": "1.0",
      "acceptedAt": "2026-01-02T03:42:28.123Z"
    },
    {
      "type": "privacy_policy",
      "accepted": true,
      "version": "1.0",
      "acceptedAt": "2026-01-02T03:42:30.456Z"
    }
  ],
  "firstConsent": "2026-01-02T03:42:26.895Z",
  "lastConsent": "2026-01-02T03:42:30.456Z",
  "requestId": "abc123..."
}
```

## Compliance Status Values

- **FULLY_COMPLIANT**: All 3 required consents (age_verification, terms, privacy_policy) are completed and accepted
- **PARTIAL_COMPLIANCE**: Some but not all required consents are completed
- **NON_COMPLIANT**: No consents or no accepted consents found

## Required Consent Types

1. `age_verification` - User verified they are of legal age
2. `terms` - User accepted terms of service
3. `privacy_policy` - User accepted privacy policy

## Usage Examples

### PowerShell
```powershell
$deviceIdHash = "abc123..." # SHA-256 hash of device ID
$uri = "https://api.aperae.com/api/consent/compliance-report?deviceIdHash=$deviceIdHash"
Invoke-RestMethod -Uri $uri -Method GET
```

### Using Test Script
```powershell
.\backend\TEST_COMPLIANCE_REPORT_API.ps1 -DeviceIdHash "abc123..."
```

### cURL
```bash
curl "https://api.aperae.com/api/consent/compliance-report?deviceIdHash=abc123..."
```

### JavaScript/Fetch
```javascript
const deviceIdHash = 'abc123...'; // SHA-256 hash
const response = await fetch(
  `https://api.aperae.com/api/consent/compliance-report?deviceIdHash=${deviceIdHash}`
);
const report = await response.json();
console.log(report.complianceStatus); // FULLY_COMPLIANT, etc.
```

## Getting the Device ID Hash

The device ID hash is a SHA-256 hash of the original device ID. When consents are stored via `POST /api/consent`, the device ID is automatically hashed before storage.

To get the hash from a device ID:

### JavaScript/Node.js
```javascript
const crypto = require('crypto');
const deviceId = 'original-device-id';
const hash = crypto.createHash('sha256').update(deviceId).digest('hex');
```

### PowerShell
```powershell
$deviceId = "original-device-id"
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($deviceId)
$hashBytes = $sha256.ComputeHash($bytes)
$hash = [System.BitConverter]::ToString($hashBytes) -replace '-', '' | ForEach-Object { $_.ToLower() }
```

## Use Cases

### Compliance Audit
Check if a user completed all required consents:
```json
{
  "complianceStatus": "FULLY_COMPLIANT",
  "consentsCompleted": 3,
  "requiredConsents": 3
}
```

### Legal Defense
Prove a user completed consent screens with timestamps:
```json
{
  "consentRecords": [
    {
      "type": "age_verification",
      "accepted": true,
      "acceptedAt": "2026-01-02T03:42:26.895Z"
    },
    // ... other consents
  ],
  "firstConsent": "2026-01-02T03:42:26.895Z",
  "lastConsent": "2026-01-02T03:42:30.456Z"
}
```

### Monitoring
Track consent completion rates by checking compliance status across devices.

## Error Responses

### Missing deviceIdHash
```json
{
  "success": false,
  "error": "deviceIdHash query parameter is required",
  "requestId": "abc123..."
}
```
Status: 400 Bad Request

### Server Error
```json
{
  "success": false,
  "error": "Failed to retrieve compliance report",
  "requestId": "abc123..."
}
```
Status: 500 Internal Server Error

## Security Considerations

- **No Authentication Required**: This endpoint is publicly accessible since it's for anonymous users
- **Privacy**: Device IDs are hashed (SHA-256), so original device IDs cannot be reverse-engineered
- **Rate Limiting**: Consider adding rate limiting to prevent abuse
- **Logging**: Only first 8 characters of device ID hash are logged for privacy

## Notes

- Only returns non-anonymized consent records (`anonymizedAt IS NULL`)
- Only returns anonymous user records (`userId IS NULL`)
- Returns the most recent accepted consent for each type (if multiple exist)
- Timestamps are in ISO 8601 format (UTC)

