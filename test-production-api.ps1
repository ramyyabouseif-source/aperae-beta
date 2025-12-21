# Production API Testing Script
# Run from: C:\Users\ramyy\Production\Aperae
# Usage: .\test-production-api.ps1

Write-Host ""
Write-Host "=== Production API Testing ===" -ForegroundColor Cyan
Write-Host "Testing against: https://api.aperae.com" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "[1/4] Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://api.aperae.com/api/health" -Method Get
    Write-Host "✅ Health Check PASSED" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Uptime: $($health.uptime) seconds" -ForegroundColor Gray
    Write-Host "   Requests: $($health.requests)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Full Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Wine Recommendation
Write-Host "[2/4] Testing Wine Recommendation..." -ForegroundColor Yellow
Write-Host "   This may take 30-60 seconds (AI API call)..." -ForegroundColor Gray
try {
    $body = @{ dish = "Grilled Salmon" } | ConvertTo-Json
    $startTime = Get-Date
    $recommendations = Invoke-RestMethod -Uri "https://api.aperae.com/api/recommendations" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    if ($recommendations.recommendations -and $recommendations.recommendations.Count -gt 0) {
        Write-Host "✅ Wine Recommendation PASSED" -ForegroundColor Green
        Write-Host "   Recommendations: $($recommendations.recommendations.Count)" -ForegroundColor Gray
        Write-Host "   Response Time: $([math]::Round($duration, 2)) seconds" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Wine Recommendation returned but no recommendations found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Wine Recommendation FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Full Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: User Registration
Write-Host "[3/4] Testing User Registration..." -ForegroundColor Yellow
try {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $testEmail = "test-$timestamp@example.com"
    $body = @{
        email = $testEmail
        password = "Test1234!"
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json
    
    $register = Invoke-RestMethod -Uri "https://api.aperae.com/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    if ($register.success -eq $true) {
        Write-Host "✅ User Registration PASSED" -ForegroundColor Green
        Write-Host "   User ID: $($register.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($register.user.email)" -ForegroundColor Gray
        Write-Host "   Access Token: $($register.accessToken.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ User Registration FAILED: Success was false" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ User Registration FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Staging Health Check
Write-Host "[4/4] Testing Staging API Health Check..." -ForegroundColor Yellow
try {
    $stagingHealth = Invoke-RestMethod -Uri "https://staging-api.aperae.com/api/health" -Method Get
    Write-Host "✅ Staging Health Check PASSED" -ForegroundColor Green
    Write-Host "   Status: $($stagingHealth.status)" -ForegroundColor Gray
    Write-Host "   Uptime: $($stagingHealth.uptime) seconds" -ForegroundColor Gray
} catch {
    Write-Host "❌ Staging Health Check FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Full Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review results above" -ForegroundColor Gray
Write-Host "  2. Test mobile app connection" -ForegroundColor Gray
Write-Host "  3. Document results in test results template" -ForegroundColor Gray
Write-Host ""






