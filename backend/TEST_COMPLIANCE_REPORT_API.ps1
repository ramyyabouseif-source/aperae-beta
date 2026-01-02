# Test script for Compliance Report API Endpoint
# Tests the GET /api/consent/compliance-report endpoint

param(
    [string]$DeviceIdHash = ""
)

Write-Host "`n=== Testing Compliance Report Endpoint ===" -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($DeviceIdHash)) {
    Write-Host "`nUsage:" -ForegroundColor Yellow
    Write-Host "  .\TEST_COMPLIANCE_REPORT_API.ps1 -DeviceIdHash 'your-device-id-hash'" -ForegroundColor White
    Write-Host "`nTo get a device ID hash, you need to hash the original device ID:" -ForegroundColor Yellow
    Write-Host "  Device IDs are hashed using SHA-256" -ForegroundColor White
    Write-Host "  You can use the consent endpoint to see what hash was stored" -ForegroundColor White
    Write-Host "`nExample with test device ID:" -ForegroundColor Yellow
    
    # Generate a test hash
    $testDeviceId = "test-compliance-check-$(Get-Date -Format 'yyyyMMddHHmmss')"
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($testDeviceId)
    $hashBytes = $sha256.ComputeHash($bytes)
    $testHash = [System.BitConverter]::ToString($hashBytes) -replace '-', '' | ForEach-Object { $_.ToLower() }
    
    Write-Host "  Test Device ID: $testDeviceId" -ForegroundColor Gray
    Write-Host "  Device ID Hash: $testHash" -ForegroundColor Gray
    Write-Host "`n  .\TEST_COMPLIANCE_REPORT_API.ps1 -DeviceIdHash `"$testHash`"" -ForegroundColor White
    exit
}

$uri = "https://api.aperae.com/api/consent/compliance-report?deviceIdHash=$DeviceIdHash"

Write-Host "`nRequest URL: $uri" -ForegroundColor White
Write-Host "Method: GET" -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri $uri -Method GET -ErrorAction Stop
    
    Write-Host "`n✓ SUCCESS" -ForegroundColor Green
    Write-Host "`nCompliance Report:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    
    Write-Host "`nSummary:" -ForegroundColor Yellow
    Write-Host "  Status: $($response.complianceStatus)" -ForegroundColor $(if ($response.complianceStatus -eq 'FULLY_COMPLIANT') { 'Green' } elseif ($response.complianceStatus -eq 'PARTIAL_COMPLIANCE') { 'Yellow' } else { 'Red' })
    Write-Host "  Consents Completed: $($response.consentsCompleted)/$($response.requiredConsents)" -ForegroundColor White
    
    if ($response.firstConsent) {
        Write-Host "  First Consent: $($response.firstConsent)" -ForegroundColor White
    }
    if ($response.lastConsent) {
        Write-Host "  Last Consent: $($response.lastConsent)" -ForegroundColor White
    }
    
    Write-Host "`nConsent Records:" -ForegroundColor Yellow
    foreach ($record in $response.consentRecords) {
        $status = if ($record.accepted) { "✓ ACCEPTED" } else { "✗ NOT ACCEPTED" }
        $color = if ($record.accepted) { 'Green' } else { 'Red' }
        Write-Host "  $($record.type): $status" -ForegroundColor $color
        if ($record.acceptedAt) {
            Write-Host "    Accepted at: $($record.acceptedAt)" -ForegroundColor Gray
        }
        if ($record.version) {
            Write-Host "    Version: $($record.version)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "`n✗ ERROR" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode) {
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    }
    
    # Try to read error response
    try {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $responseStream.Close()
        
        if ($responseBody) {
            Write-Host "`nError Response:" -ForegroundColor Yellow
            $responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Red
        }
    } catch {
        # Could not read error response
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan

