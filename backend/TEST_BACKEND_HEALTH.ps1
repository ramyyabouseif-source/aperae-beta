# Backend Health Test Script
# Safe PowerShell commands for testing the backend

Write-Host "`n=== Testing Backend Health ===" -ForegroundColor Cyan

# Test 1: Health Endpoint
Write-Host "`n1. Health Check:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://api.aperae.com/api/health" -Method GET
    Write-Host "   Status: $($health.status)" -ForegroundColor $(if ($health.status -eq 'healthy') { 'Green' } else { 'Yellow' })
    Write-Host "   Uptime: $([math]::Round($health.uptime, 2)) seconds" -ForegroundColor White
    Write-Host "   Error Rate: $($health.errorRate)%" -ForegroundColor $(if ($health.errorRate -lt 5) { 'Green' } elseif ($health.errorRate -lt 20) { 'Yellow' } else { 'Red' })
    Write-Host "   Mock Mode: $($health.mockMode)" -ForegroundColor White
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: DNS Resolution
Write-Host "`n2. DNS Resolution:" -ForegroundColor Yellow
try {
    $dns = Resolve-DnsName api.aperae.com -ErrorAction Stop
    $cname = $dns | Where-Object { $_.Type -eq 'CNAME' }
    $a = $dns | Where-Object { $_.Type -eq 'A' }
    
    if ($cname) {
        Write-Host "   Type: CNAME" -ForegroundColor White
        Write-Host "   Points to: $($cname.NameHost)" -ForegroundColor White
        if ($cname.NameHost -like "*.onrender.com") {
            Write-Host "   ✓ Appears to be pointing to Render" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ Not pointing to Render (might be different provider)" -ForegroundColor Yellow
        }
    } elseif ($a) {
        Write-Host "   Type: A Record" -ForegroundColor White
        Write-Host "   IP Address: $($a.IPAddress)" -ForegroundColor White
        Write-Host "   ⚠ Using A record (not CNAME) - might be static IP" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Consent Endpoint (Quick Test)
Write-Host "`n3. Consent Endpoint Test:" -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "X-Requested-With" = "XMLHttpRequest"
    }
    $body = @{
        consentType = "age_verification"
        accepted = $true
        deviceId = "test-health-check-$(Get-Date -Format 'yyyyMMddHHmmss')"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "https://api.aperae.com/api/consent" -Method POST -Headers $headers -Body $body
    Write-Host "   ✓ Success: Consent stored" -ForegroundColor Green
    Write-Host "   Consent ID: $($response.id)" -ForegroundColor White
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode) {
        Write-Host "   Status Code: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. If backend is working, check Render dashboard for service" -ForegroundColor White
Write-Host "2. If service is missing, see RENDER_PRODUCTION_TROUBLESHOOTING.md" -ForegroundColor White
Write-Host "3. If consent endpoint fails, check backend logs and database" -ForegroundColor White


