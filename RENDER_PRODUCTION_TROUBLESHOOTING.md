# Render Production Environment Troubleshooting

## Current Situation
- Production environment missing from Render dashboard
- Backend API still appears to be working (https://api.aperae.com)
- Staging environment still visible in Render

## Immediate Actions

### 1. Verify Backend is Actually Running ✅

**Test the health endpoint:**
```powershell
Invoke-WebRequest -Uri "https://api.aperae.com/api/health" | Select-Object StatusCode, @{Name="Response";Expression={$_.Content}}
```

**Expected:** 200 status with health check data

**Test the consent endpoint (should show error details now):**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-Requested-With" = "XMLHttpRequest"
}
$body = @{
    consentType = "age_verification"
    accepted = $true
    deviceId = "test-123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "https://api.aperae.com/api/consent" -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
```

### 2. Check Render Dashboard Issues

**Possible causes:**
1. **Account/Organization Issue:**
   - Check if you're logged into the correct Render account
   - Check if production service is in a different organization
   - Try logging out and back in

2. **Service Hidden/Archived:**
   - Check if there's a "Show archived services" filter
   - Look for a "Show all services" option
   - Check different tabs (Web Services, Background Workers, etc.)

3. **Different Dashboard View:**
   - Production might be in a different team/organization
   - Check team switcher in top right corner
   - Check if you have multiple Render accounts

4. **Service Actually Deleted:**
   - If service was deleted, API might still work temporarily (cached DNS)
   - Check if DNS is pointing to an old IP/instance
   - Verify the actual backend is responding

### 3. Check DNS/Service Status

**Verify what's actually serving the API:**
```powershell
# Check DNS resolution
Resolve-DnsName api.aperae.com

# Check if it's pointing to Render
nslookup api.aperae.com

# Test response headers
$response = Invoke-WebRequest -Uri "https://api.aperae.com/api/health" -Method HEAD
$response.Headers
```

**Look for:**
- `Server` header (might indicate what's serving the request)
- `X-Powered-By` header
- Any Render-specific headers

### 4. Check Email/Notifications

**Check your email for:**
- Render service deletion notifications
- Billing/payment issues
- Account suspension notices
- Service paused/suspended warnings

## Decision: Recreate vs. Troubleshoot

### Option A: Troubleshoot First (Recommended if backend is working)

**If the backend is working, try to recover access:**

1. **Check Render Support:**
   - Contact Render support: https://render.com/docs/support
   - Ask about missing production service
   - Provide service name and domain

2. **Check Account Access:**
   - Verify you're on the correct Render account
   - Check if service was moved to a different team
   - Verify billing/payment status

3. **Check Service Logs (if accessible):**
   - If you have the service URL, try accessing logs directly
   - Check if service is paused/suspended

**If you can recover access:**
- Great! You can continue using the existing service
- Just need to deploy latest code and regenerate Prisma Client

### Option B: Create New Production Service (Safer approach)

**If you can't recover access, create a new service:**

#### Prerequisites:
- ✅ Domain/DNS access (api.aperae.com)
- ✅ Database connection string (DATABASE_URL)
- ✅ Environment variables list
- ✅ Code repository access

#### Steps to Create New Production Service:

1. **Create New Web Service in Render:**
   - Go to Render dashboard → New → Web Service
   - Connect your GitHub repository
   - Select the backend directory (if monorepo)
   - Or select the backend repository if separate

2. **Configure Service Settings:**
   ```
   Name: aperae-backend-production (or similar)
   Region: Choose same region as before (if known)
   Branch: main (or your production branch)
   Root Directory: backend (if monorepo)
   Runtime: Node
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   ```

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000 (Render default, or your preferred port)
   DATABASE_URL=<your-production-database-url>
   ANTHROPIC_API_KEY=<your-key>
   JWT_SECRET=<your-secret>
   REFRESH_SECRET=<your-refresh-secret>
   ALLOWED_ORIGINS=https://www.aperae.com,https://aperae.com
   # ... all other required env vars
   ```

4. **Update DNS:**
   - Once service is created, Render will provide a URL (e.g., `aperae-backend.onrender.com`)
   - Update your DNS/CNAME record for `api.aperae.com` to point to this URL
   - Or use Render's custom domain feature if available

5. **Deploy and Verify:**
   - Service will auto-deploy from GitHub
   - Wait for build to complete
   - Test health endpoint
   - Test consent endpoint
   - Monitor logs

6. **Regenerate Prisma Client (if needed):**
   - Add to build command: `npx prisma generate`
   - Or run manually after deployment (if Render supports shell access)

## Recommended Approach

### Immediate Steps:
1. ✅ **Test backend health** - Confirm it's actually running
2. ✅ **Check Render account** - Verify you're on the correct account/team
3. ✅ **Contact Render support** - Ask about missing service
4. ⚠️ **Backup plan** - Prepare to recreate if needed

### If Backend is Working:
- Try to recover Render access first
- Once recovered, deploy latest code
- Regenerate Prisma Client
- Restart service

### If Backend is NOT Working or Access Can't be Recovered:
- Create new production service in Render
- Use this as opportunity to:
  - Review/update environment variables
  - Verify all dependencies are in package.json
  - Set up proper monitoring/logging
  - Document the setup process

## Testing After Recovery/Recreation

1. **Health Check:**
   ```powershell
   Invoke-WebRequest -Uri "https://api.aperae.com/api/health"
   ```

2. **Consent Endpoint:**
   ```powershell
   # Use the test script from backend/TEST_CONSENT_API.ps1
   ```

3. **From Browser (www.aperae.com):**
   - Open Developer Tools
   - Complete consent screens
   - Verify no 500/403 errors
   - Check backend logs for "Consent stored" messages

4. **Database Verification:**
   ```sql
   SELECT * FROM user_consents ORDER BY accepted_at DESC LIMIT 5;
   ```

## Important Notes

- **DNS Propagation:** If recreating, DNS changes can take 24-48 hours (usually much faster)
- **Database:** Use the same DATABASE_URL (don't create new database unless necessary)
- **Environment Variables:** Make sure to copy ALL required env vars from staging or documentation
- **Prisma Client:** Must be regenerated as part of build process or manually after deployment
- **Monitoring:** Set up monitoring/logging for the new service

## Quick Reference: Render Service Configuration

**Build Command:**
```bash
npm install && npx prisma generate
```

**Start Command:**
```bash
npm start
```

**Required Environment Variables (check your staging service for exact values):**
- `NODE_ENV=production`
- `DATABASE_URL=<supabase-connection-string>`
- `ANTHROPIC_API_KEY=<your-key>`
- `JWT_SECRET=<your-secret>`
- `REFRESH_SECRET=<your-refresh-secret>`
- `ALLOWED_ORIGINS=https://www.aperae.com,https://aperae.com`
- (Check backend/.env.example or staging service for complete list)




