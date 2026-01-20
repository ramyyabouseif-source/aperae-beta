# PowerShell script to test consent API endpoint
# Run this from PowerShell: .\TEST_CONSENT_API.ps1

$uri = "https://api.aperae.com/api/consent"
$headers = @{
    "Content-Type" = "application/json"
}

# Test 1: Age Verification Consent
Write-Host "Testing Age Verification Consent..." -ForegroundColor Cyan
$body = @{
    consentType = "age_verification"
    accepted = $true
    deviceId = "test-device-123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n---`n" -ForegroundColor Gray

# Test 2: Terms Acceptance
Write-Host "Testing Terms Acceptance..." -ForegroundColor Cyan
$body = @{
    consentType = "terms"
    accepted = $true
    version = "1.0"
    deviceId = "test-device-123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n---`n" -ForegroundColor Gray

# Test 3: Privacy Policy Acceptance
Write-Host "Testing Privacy Policy Acceptance..." -ForegroundColor Cyan
$body = @{
    consentType = "privacy_policy"
    accepted = $true
    version = "1.0"
    deviceId = "test-device-123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}




