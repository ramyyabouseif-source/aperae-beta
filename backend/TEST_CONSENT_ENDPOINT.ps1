# Comprehensive Consent Endpoint Test Script
# Tests the consent API endpoint with detailed error reporting

param(
    [string]$ConsentType = "age_verification",
    [bool]$Accepted = $true,
    [string]$DeviceId = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
)

Write-Host "`n=== Testing Consent Endpoint ===" -ForegroundColor Cyan
Write-Host "URL: https://api.aperae.com/api/consent" -ForegroundColor White
Write-Host "Method: POST" -ForegroundColor White
Write-Host "`nRequest Payload:" -ForegroundColor Yellow
$requestBody = @{
    consentType = $ConsentType
    accepted = $Accepted
    deviceId = $DeviceId
}
$requestBody | ConvertTo-Json | Write-Host -ForegroundColor Gray

$headers = @{
    "Content-Type" = "application/json"
    "X-Requested-With" = "XMLHttpRequest"
}
$bodyJson = $requestBody | ConvertTo-Json

Write-Host "`nSending request..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest `
        -Uri "https://api.aperae.com/api/consent" `
        -Method POST `
        -Headers $headers `
        -Body $bodyJson `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "`n✓ SUCCESS (Status $($response.StatusCode))" -ForegroundColor Green
    
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "`nResponse:" -ForegroundColor Green
    $responseData | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    
    Write-Host "`n✓ Consent stored successfully!" -ForegroundColor Green
    Write-Host "Consent ID: $($responseData.id)" -ForegroundColor White
    Write-Host "Device ID Hash: $($responseData.deviceIdHash)" -ForegroundColor White
    
} catch {
    Write-Host "`n✗ ERROR" -ForegroundColor Red
    
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    
    # Try to read the error response body
    try {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $responseStream.Close()
        
        Write-Host "`nError Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
        
        # Try to parse as JSON for better formatting
        try {
            $errorJson = $responseBody | ConvertFrom-Json
            Write-Host "`nParsed Error Details:" -ForegroundColor Yellow
            $errorJson | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Red
        } catch {
            # Not JSON, just display as-is
        }
    } catch {
        Write-Host "Could not read error response body: $($_.Exception.Message)" -ForegroundColor Gray
    }
    
    Write-Host "`nPossible Causes:" -ForegroundColor Yellow
    Write-Host "1. Prisma Client not regenerated on production server" -ForegroundColor White
    Write-Host "2. user_consents table doesn't exist in production database" -ForegroundColor White
    Write-Host "3. Database connection issue" -ForegroundColor White
    Write-Host "4. Backend code not deployed with latest changes" -ForegroundColor White
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Check backend logs on Render (if accessible)" -ForegroundColor White
    Write-Host "2. Verify user_consents table exists in Supabase" -ForegroundColor White
    Write-Host "3. Regenerate Prisma Client: npx prisma generate" -ForegroundColor White
    Write-Host "4. Restart backend service" -ForegroundColor White
    Write-Host "5. See TROUBLESHOOT_CONSENT_500_ERROR.md for detailed steps" -ForegroundColor White
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan



